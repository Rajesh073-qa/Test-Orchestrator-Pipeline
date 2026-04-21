import { Injectable, Logger, NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { AIService as RepoAIService, OpenAIProvider, MockAIProvider } from '@repo/ai';
import { ConfigService } from '@nestjs/config';
import { TestPlanSchema } from './validators/test-plan.schema';
import { TestCasesResponseSchema } from './validators/test-case.schema';

@Injectable()
export class AIService {
  private readonly logger = new Logger(AIService.name);
  private aiRepoService: RepoAIService;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    
    let provider;
    if (!apiKey || apiKey === 'sk-xxx' || apiKey === 'mock') {
      this.logger.warn('using Mock AI Provider (No API Key or mock key)');
      provider = new MockAIProvider();
    } else {
      provider = new OpenAIProvider(apiKey);
    }
    
    this.aiRepoService = new RepoAIService(provider);
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
    // 1. Fetch story and verify ownership
    const story = await this.prisma.userStory.findUnique({
      where: { id: userStoryId },
      include: { project: true },
    });

    if (!story || story.project.userId !== userId) {
      throw new NotFoundException('User story not found or access denied');
    }

    // 2. Build context
    const storyContext = `Story: ${story.title}\nDescription: ${story.description}\nAC: ${story.acceptanceCriteria}`;

    // 3. Call AI with retry and validation
    const testCasesData = await this.retryAI(
      () => this.aiRepoService.generateTestCases(storyContext),
      (data) => TestCasesResponseSchema.parse(data)
    );

    // 4. Save to DB with transaction
    const savedTestCases = await this.prisma.$transaction(
      testCasesData.map((tc) =>
        this.prisma.testCase.create({
          data: {
            title: tc.title,
            description: tc.description,
            priority: tc.priority,
            type: tc.type,
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

  async parseRequirement(rawInput: string) {
    if (!rawInput || rawInput.trim().length < 10) {
      throw new BadRequestException('Input is too short to be a valid requirement.');
    }

    const rawResponse = await this.aiRepoService.parseRequirement(rawInput);
    try {
      return JSON.parse(rawResponse);
    } catch (e) {
      this.logger.error(`Failed to parse AI response as JSON: ${rawResponse}`);
      throw new InternalServerErrorException('AI returned malformed data. Please try again.');
    }
  }

  async generateTestPlan(projectId: string, userId: string, structuredData?: any) {
    // 1. Verify project ownership
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project || project.userId !== userId) {
      throw new NotFoundException('Project not found or access denied');
    }

    // 2. Build context and persist story if manual
    let context = '';
    if (structuredData) {
      context = `Title: ${structuredData.title}\nDescription: ${structuredData.description}\nAC: ${structuredData.acceptanceCriteria?.join(', ')}`;
      
      // PERSIST STORY for manual flow so test cases can be generated bulk
      await this.prisma.userStory.upsert({
        where: { jiraId: `MANUAL-${projectId}` }, // Use a deterministic ID for manual story per project
        update: {
          title: structuredData.title,
          description: structuredData.description,
          acceptanceCriteria: structuredData.acceptanceCriteria?.join('\n'),
        },
        create: {
          jiraId: `MANUAL-${projectId}`,
          title: structuredData.title,
          description: structuredData.description,
          acceptanceCriteria: structuredData.acceptanceCriteria?.join('\n'),
          projectId,
        },
      });
    } else {
      // Fallback: get all stories for project (simplified)
      const stories = await this.prisma.userStory.findMany({ where: { projectId } });
      context = stories.map(s => `Story: ${s.title}\nDesc: ${s.description}`).join('\n\n');
    }

    // 3. Call AI
    return this.retryAI(
      () => this.aiRepoService.generateTestPlan(context),
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

    return {
      message: `Generated test cases for ${project.userStories.length} stories`,
      results,
    };
  }
  async quickGenerateTestPlan(text: string) {
    return this.retryAI(
      () => this.aiRepoService.generateTestPlan(text),
      (data) => TestPlanSchema.parse(data)
    );
  }

  async quickGenerateTestCases(text: string) {
    return this.retryAI(
      () => this.aiRepoService.generateTestCases(text),
      (data) => TestCasesResponseSchema.parse(data)
    );
  }

  async quickGenerateCode(text: string, framework: string) {
    const context = `Context: ${text}\nRequirements:\n- Use ${framework} with TypeScript.\n- Follow Page Object Model (POM).\n- Return a JSON object with 'testFile' and 'pageObject' keys.`;
    const { CodeGenSchema } = require('../code-generator/validators/code-gen.schema');
    return this.retryAI(
      () => this.aiRepoService.generateAutomationCode(context),
      (data) => CodeGenSchema.parse(data)
    );
  }
}

