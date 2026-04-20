import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { AIService as RepoAIService, OpenAIProvider } from '@repo/ai';
import { ConfigService } from '@nestjs/config';
import { CodeGenSchema } from './validators/code-gen.schema';
import { JobService } from '../common/job.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class CodeGeneratorService {
  private readonly logger = new Logger(CodeGeneratorService.name);
  private aiRepoService: RepoAIService;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly jobService: JobService,
    @InjectQueue('code-generation') private readonly codeGenQueue: Queue,
  ) {


    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
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
        this.logger.warn(`AI Code Gen failed validation. Retrying... Error: ${error.message}`);
        return this.retryAI(operation, validator, retryCount - 1);
      }
      throw new BadRequestException('AI failed to generate valid automation code. Please try again.');
    }
  }

  async generateCode(testCaseId: string, userId: string, force = false) {
    // 1. Fetch test case with steps and check ownership via UserStory -> Project
    const testCase = await this.prisma.testCase.findUnique({
      where: { id: testCaseId },
      include: {
        steps: { orderBy: { stepNumber: 'asc' } },
        automationScripts: { orderBy: { createdAt: 'desc' }, take: 1 },
        userStory: {
          include: { project: true }
        }
      },
    });

    if (!testCase || testCase.userStory?.project.userId !== userId) {
      throw new NotFoundException('Test case not found or access denied');
    }

    // 2. Duplicate Control: If not forced and script exists, return existing
    if (!force && testCase.automationScripts.length > 0) {
      const script = testCase.automationScripts[0];
      const codeData = JSON.parse(script.code);
      this.logger.log(`Returning existing script for test case "${testCaseId}" (use force=true to regenerate)`);
      return {
        id: script.id,
        language: script.language,
        framework: script.framework,
        files: {
          test: codeData.testFile,
          page: codeData.pageObject,
        },
        isNew: false
      };
    }

    // 3. Build context
    const steps = testCase.steps.map(s => `${s.stepNumber}. ${s.description} -> Expected: ${s.expectedResult}`).join('\n');
    const context = `
      Test Case: ${testCase.title}
      Description: ${testCase.description}
      User Story: ${testCase.userStory.title}
      
      Steps:
      ${steps}
      
      Requirements:
      - Use Playwright with TypeScript.
      - Follow Page Object Model (POM).
      - Use data-testid selectors if applicable.
      - Return a JSON object with 'testFile' and 'pageObject' keys.
    `;

    // 4. Call AI with retry
    const codeData = await this.retryAI(
      () => this.aiRepoService.generateAutomationCode(context),
      (data) => CodeGenSchema.parse(data)
    );

    // 4. Save to DB

    const script = await this.prisma.automationScript.create({
      data: {
        testCaseId: testCaseId,
        language: 'typescript',
        framework: 'playwright',
        code: JSON.stringify(codeData),
      },
    });

    // 5. Return structured response
    return {
      id: script.id,
      language: script.language,
      framework: script.framework,
      files: {
        test: codeData.testFile,
        page: codeData.pageObject,
      },
      isNew: true
    };

  }

  async exportCode(testCaseId: string, userId: string): Promise<NodeJS.ReadableStream> {
    const testCase = await this.prisma.testCase.findUnique({
      where: { id: testCaseId },
      include: {
        automationScripts: { orderBy: { createdAt: 'desc' }, take: 1 },
        userStory: { include: { project: true } }
      },
    });

    if (!testCase || testCase.userStory?.project.userId !== userId) {
      throw new NotFoundException('Test case not found or access denied');
    }

    if (testCase.automationScripts.length === 0) {
      throw new BadRequestException('No automation code generated for this test case');
    }

    const script = testCase.automationScripts[0];
    const codeData = JSON.parse(script.code);

    const archiver = require('archiver');
    const archive = archiver('zip', { zlib: { level: 9 } });

    const fileName = testCase.title.toLowerCase().replace(/\s+/g, '_');

    // Add files to archive
    archive.append(codeData.testFile, { name: `tests/${fileName}.spec.ts` });
    archive.append(codeData.pageObject, { name: `pages/${fileName}.page.ts` });

    // Add boilerplate
    archive.append(JSON.stringify({
      name: "playwright-tests",
      version: "1.0.0",
      devDependencies: { "@playwright/test": "^1.40.0" }
    }, null, 2), { name: 'package.json' });

    archive.append(`import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests',
  use: { screenshot: 'on', video: 'on-first-retry' },
});`, { name: 'playwright.config.ts' });

    archive.finalize();
    return archive;
  }

  async exportProject(projectId: string, userId: string): Promise<NodeJS.ReadableStream> {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: {
        userStories: {
          include: {
            testCases: {
              include: {
                automationScripts: { orderBy: { createdAt: 'desc' }, take: 1 }
              }
            }
          }
        }
      },
    });

    if (!project || project.userId !== userId) {
      throw new NotFoundException('Project not found or access denied');
    }

    const archiver = require('archiver');
    const archive = archiver('zip', { zlib: { level: 9 } });

    let hasScripts = false;

    // Add files for each test case
    for (const story of project.userStories) {
      for (const testCase of story.testCases) {
        if (testCase.automationScripts.length > 0) {
          hasScripts = true;
          const script = testCase.automationScripts[0];
          const codeData = JSON.parse(script.code);

          const fileName = testCase.title.toLowerCase().replace(/\s+/g, '_');

          archive.append(codeData.testFile, { name: `tests/${fileName}.spec.ts` });
          archive.append(codeData.pageObject, { name: `pages/${fileName}.page.ts` });
        }
      }
    }

    if (!hasScripts) {
      throw new BadRequestException('No automation code generated for this project');
    }

    // Add boilerplate
    archive.append(JSON.stringify({
      name: "orchestor-tests",
      version: "1.0.0",
      devDependencies: { "@playwright/test": "^1.40.0" }
    }, null, 2), { name: 'package.json' });

    archive.append(`import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests',
  use: { screenshot: 'on', video: 'on-first-retry' },
});`, { name: 'playwright.config.ts' });

    archive.finalize();
    return archive;
  }

  async generateForProject(projectId: string, userId: string) {
    // 1. Verify project ownership
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: {
        userStories: {
          include: { testCases: true }
        }
      },
    });

    if (!project || project.userId !== userId) {
      throw new NotFoundException('Project not found or access denied');
    }

    // 2. Collect all test case IDs
    const testCaseIds = project.userStories.flatMap(s => s.testCases.map(tc => tc.id));

    // Check if a job is already running for this project (Idempotency)

    const activeJob = await this.jobService.findActiveProjectJob(projectId, 'BULK_GEN');
    if (activeJob) {
      return activeJob; // Return the existing job instead of starting a new one
    }

    if (testCaseIds.length === 0) {
      return { message: 'No test cases found in this project to generate code for.' };
    }

    if (testCaseIds.length > 100) {
      throw new BadRequestException('Bulk generation is limited to 100 test cases per request to ensure reliability and cost control.');
    }

    // 3. Create a background job
    const job = await this.jobService.createJob('BULK_GEN', userId, testCaseIds.length, projectId);

    this.logger.log(`Created Job ${job.id} for bulk generation in project "${projectId}"`);

    // 4. Enqueue in BullMQ
    await this.codeGenQueue.add('bulk-gen', {
      jobId: job.id,
      testCaseIds,
      userId,
      type: 'BULK_GEN'
    }, {
      removeOnComplete: true,
      attempts: 1,
      priority: 3 // Medium priority for bulk
    });


    return job;
  }

  async retryFailedCases(jobId: string, userId: string) {
    const job = await this.jobService.getJob(jobId, userId);

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    if (job.status !== 'FAILED' && job.status !== 'COMPLETED_WITH_ERRORS') {
      throw new BadRequestException('Only failed or partially completed jobs can be retried');
    }

    const jobResult = JSON.parse(job.result || '{}');
    const failedIds = jobResult.results
      ?.filter((r: any) => r.status === 'failed')
      .map((r: any) => r.id) || [];

    if (failedIds.length === 0) {
      return { message: 'No failed test cases found in this job.' };
    }

    // Create a new job for the retry
    const retryJob = await this.jobService.createJob(`RETRY_${job.id}`, userId, failedIds.length);

    await this.codeGenQueue.add('bulk-gen', {
      jobId: retryJob.id,
      testCaseIds: failedIds,
      userId,
      type: 'BULK_GEN'
    }, {
      priority: 1 // High priority for retries
    });

    return retryJob;
  }






  async generateGitHubWorkflow(projectId: string, userId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project || project.userId !== userId) {
      throw new NotFoundException('Project not found or access denied');
    }

    const workflowYml = `name: Playwright Tests
on:
  push:
    branches: [ main, master ]
  pull_request:
    branches: [ main, master ]
jobs:
  test:
    timeout-minutes: 60
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-node@v4
      with:
        node-version: lts/*
    - name: Install dependencies
      run: npm install
    - name: Install Playwright Browsers
      run: npx playwright install --with-deps
    - name: Run Playwright tests
      run: npx playwright test
    - uses: actions/upload-artifact@v4
      if: always()
      with:
        name: playwright-report
        path: playwright-report/
        retention-days: 30
`;

    return {
      fileName: 'playwright.yml',
      content: workflowYml,
      path: '.github/workflows/playwright.yml'
    };
  }
}
