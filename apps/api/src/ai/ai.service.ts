import { Injectable, Logger, NotFoundException, BadRequestException, InternalServerErrorException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { AIService as RepoAIService, OpenAIProvider, MockAIProvider } from '@repo/ai';
import { ConfigService } from '@nestjs/config';
import { TestPlanSchema } from './validators/test-plan.schema';
import { TestCasesResponseSchema } from './validators/test-case.schema';
import { AIConfigService } from '../ai-config/ai-config.service';

@Injectable()
export class AIService {
  private readonly logger = new Logger(AIService.name);
  private readonly fallbackAIService: RepoAIService;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly aiConfigService: AIConfigService,
  ) {
    // Build a fallback service for non-user-scoped operations (legacy project-based)
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    let provider;
    if (!apiKey || apiKey === 'sk-xxx' || apiKey === 'mock') {
      this.logger.warn('Using Mock AI Provider (No API Key or mock key set in .env)');
      provider = new MockAIProvider();
    } else {
      provider = new OpenAIProvider(apiKey);
    }
    this.fallbackAIService = new RepoAIService(provider);
  }

  /** Get an AI service scoped to the user's configured provider. Falls back to env key. */
  public async getAIService(userId: string): Promise<RepoAIService> {
    try {
      return await this.aiConfigService.buildAIService(userId);
    } catch {
      return this.fallbackAIService;
    }
  }

  /**
   * Enforce free-trial gate:
   * - ADMIN role → always allowed
   * - Active Pro/Enterprise subscription → allowed
   * - freeTrialUsed === false → allow once, then mark as used
   * - freeTrialUsed === true → throw ForbiddenException (upgrade required)
   */
  public async enforceTrialGate(userId: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { subscription: true },
    });

    if (!user) throw new NotFoundException('User not found');

    // Admins are always unrestricted
    if (user.role === 'ADMIN') return;

    // Active paid subscription → unrestricted
    if (user.subscription?.status === 'ACTIVE' && user.subscription?.plan !== 'STARTER') return;

    // Free trial: first use
    if (!user.freeTrialUsed) {
      await this.prisma.user.update({
        where: { id: userId },
        data: { freeTrialUsed: true },
      });
      return; // allow
    }

    // Trial exhausted — must upgrade
    throw new ForbiddenException(
      JSON.stringify({
        code: 'FREE_TRIAL_EXHAUSTED',
        message: 'You have used your free trial. Please upgrade to Pro to continue.',
      }),
    );
  }


  private async retryAI<T>(
    operation: () => Promise<string>,
    validator: (data: any) => T,
    retryCount = 1
  ): Promise<T> {
    try {
      const rawResponse = await operation();
      const parsed = JSON.parse(rawResponse);
      return validator(parsed);
    } catch (error) {
      if (retryCount > 0) {
        this.logger.warn(`AI Response validation failed. Retrying... Error: ${error.message}`);
        return this.retryAI(operation, validator, retryCount - 1);
      }
      this.logger.error(`AI Response validation failed after retries: ${error.message}`);
      throw new BadRequestException('AI failed to generate valid structured data. Please try again.');
    }
  }

  async generateTestCases(userStoryId: string, userId: string) {
    const story = await this.prisma.userStory.findUnique({
      where: { id: userStoryId },
      include: { project: true },
    });

    if (!story || story.project.userId !== userId) {
      throw new NotFoundException('User story not found or access denied');
    }

    const storyContext = `Story: ${story.title}\nDescription: ${story.description}\nAC: ${story.acceptanceCriteria}`;
    const aiService = await this.getAIService(userId);

    const testCasesData = await this.retryAI(
      () => aiService.generateTestCases(storyContext),
      (data) => TestCasesResponseSchema.parse(data)
    );

    const savedTestCases = await this.prisma.$transaction(
      testCasesData.map((tc) =>
        this.prisma.testCase.create({
          data: {
            title: tc.title,
            description: tc.description,
            priority: tc.priority,
            type: tc.type,
            preConditions: tc.preConditions,
            dataScenarios: tc.dataScenarios || [],
            userStoryId: userStoryId,
            steps: {
              create: tc.steps.map((s) => ({
                stepNumber: s.stepNumber,
                description: s.action || '',
                expectedResult: s.expectedResult,
              })),
            },
          },
          include: { steps: true },
        })
      )
    );

    return savedTestCases;
  }

  async parseRequirement(rawInput: string, userId?: string) {
    if (!rawInput || rawInput.trim().length < 10) {
      throw new BadRequestException('Input is too short to be a valid requirement.');
    }

    const aiService = userId ? await this.getAIService(userId) : this.fallbackAIService;
    const rawResponse = await aiService.parseRequirement(rawInput);
    try {
      return JSON.parse(rawResponse);
    } catch (e) {
      this.logger.error(`Failed to parse AI response as JSON: ${rawResponse}`);
      throw new InternalServerErrorException('AI returned malformed data. Please try again.');
    }
  }

  async generateTestPlan(projectId: string, userId: string, structuredData?: any) {
    const project = await this.prisma.project.findUnique({ where: { id: projectId } });

    if (!project || project.userId !== userId) {
      throw new NotFoundException('Project not found or access denied');
    }

    let context = '';
    if (structuredData) {
      context = `Title: ${structuredData.title}\nDescription: ${structuredData.description}\nAC: ${structuredData.acceptanceCriteria?.join(', ')}`;
      await this.prisma.userStory.upsert({
        where: { jiraId: `MANUAL-${projectId}` },
        update: { title: structuredData.title, description: structuredData.description, acceptanceCriteria: structuredData.acceptanceCriteria?.join('\n') },
        create: { jiraId: `MANUAL-${projectId}`, title: structuredData.title, description: structuredData.description, acceptanceCriteria: structuredData.acceptanceCriteria?.join('\n'), projectId },
      });
    } else {
      const stories = await this.prisma.userStory.findMany({ where: { projectId } });
      context = stories.map(s => `Story: ${s.title}\nDesc: ${s.description}`).join('\n\n');
    }

    const aiService = await this.getAIService(userId);
    return this.retryAI(
      () => aiService.generateTestPlan(context),
      (data) => TestPlanSchema.parse(data)
    );
  }

  async generateBulkTestCases(projectId: string, userId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: { userStories: true },
    });

    if (!project || project.userId !== userId) {
      throw new NotFoundException('Project not found or access denied');
    }

    const results: { storyId: string; count: number }[] = [];
    for (const story of project.userStories) {
      const cases = await this.generateTestCases(story.id, userId);
      results.push({ storyId: story.id, count: cases.length });
    }

    return { message: `Generated test cases for ${project.userStories.length} stories`, results };
  }

  // ── Quick (stateless) generators — use per-user config ──────────────────────

  async quickGenerateTestPlan(text: string, userId?: string) {
    if (userId) await this.enforceTrialGate(userId);
    const aiService = userId ? await this.getAIService(userId) : this.fallbackAIService;
    const result = await this.retryAI(
      () => aiService.generateTestPlan(text),
      (data) => TestPlanSchema.parse(data)
    );
    if (userId) {
      await this.prisma.job.create({
        data: {
          type: 'TEST_PLAN',
          status: 'COMPLETED',
          progress: 100,
          total: 100,
          result: JSON.stringify(result),
          userId,
        }
      });
    }
    return result;
  }

  async quickGenerateTestCases(text: string, userId?: string) {
    if (userId) await this.enforceTrialGate(userId);
    const aiService = userId ? await this.getAIService(userId) : this.fallbackAIService;
    const result = await this.retryAI(
      () => aiService.generateTestCases(text),
      (data) => TestCasesResponseSchema.parse(data)
    );
    if (userId) {
      await this.prisma.job.create({
        data: {
          type: 'TEST_CASES',
          status: 'COMPLETED',
          progress: 100,
          total: 100,
          result: JSON.stringify(result),
          userId,
        }
      });
    }
    return result;
  }

  async quickGenerateCode(text: string, framework: string, userId?: string) {
    if (userId) await this.enforceTrialGate(userId);
    const aiService = userId ? await this.getAIService(userId) : this.fallbackAIService;
    const context = `Context: ${text}\nRequirements:\n- Use ${framework} with ${framework === 'selenium' ? 'Java' : 'TypeScript'}.\n- Follow Page Object Model (POM).\n- Return a JSON object with 'testFile' and 'pageObject' keys.`;
    const { CodeGenSchema } = require('../code-generator/validators/code-gen.schema');
    const result = await this.retryAI(
      () => aiService.generateAutomationCode(context),
      (data) => CodeGenSchema.parse(data)
    );
    if (userId) {
      await this.prisma.job.create({
        data: {
          type: 'AUTOMATION_CODE',
          status: 'COMPLETED',
          progress: 100,
          total: 100,
          result: JSON.stringify({ ...result, framework }),
          userId,
        }
      });
    }
    return result;
  }

  /** Check trial status for a user — used by frontend to show upgrade prompts */
  async getTrialStatus(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { subscription: true },
    });
    if (!user) return { status: 'UNKNOWN' };

    if (user.role === 'ADMIN') return { status: 'UNLIMITED' };
    if (user.subscription?.status === 'ACTIVE' && user.subscription?.plan !== 'STARTER') {
      return { status: 'PRO', plan: user.subscription.plan };
    }
    if (!user.freeTrialUsed) return { status: 'FREE_TRIAL_AVAILABLE' };
    return { status: 'FREE_TRIAL_EXHAUSTED' };
  }
}
