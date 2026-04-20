import { Injectable, Logger, NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { AIService as RepoAIService, OpenAIProvider } from '@repo/ai';
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
    if (!apiKey) {
      this.logger.error('OPENAI_API_KEY is not defined');
    }
    const provider = new OpenAIProvider(apiKey || '');
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

    // 2. Build context
    let context = '';
    if (structuredData) {
      context = `Title: ${structuredData.title}\nDescription: ${structuredData.description}\nAC: ${structuredData.acceptanceCriteria?.join(', ')}`;
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
}

