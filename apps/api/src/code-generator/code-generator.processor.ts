import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { CodeGeneratorService } from './code-generator.service';
import { JobService } from '../common/job.service';

@Processor('code-generation')
export class CodeGeneratorProcessor extends WorkerHost {
  private readonly logger = new Logger(CodeGeneratorProcessor.name);

  constructor(
    private readonly codeGeneratorService: CodeGeneratorService,
    private readonly jobService: JobService,
  ) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    const { jobId, testCaseIds, userId, type } = job.data;
    
    this.logger.log(`Processing job ${jobId} of type ${type}`);
    
    if (type === 'BULK_GEN') {
      return this.handleBulkGen(jobId, testCaseIds, userId);
    }
  }

  private async handleBulkGen(jobId: string, testCaseIds: string[], userId: string) {
    await this.jobService.updateJob(jobId, 'RUNNING');
    const results: any[] = [];
    let processed = 0;
    let failedCount = 0;
    
    for (const id of testCaseIds) {
      // Check for cancellation (Early termination)
      const currentJob = await this.jobService.getJob(jobId, userId);
      if (currentJob?.status === 'CANCELLED') {
        this.logger.log(`Job ${jobId} was cancelled by user. Terminating...`);
        return { cancelled: true };
      }

      let success = false;
      let lastError = '';
      
      // Retry loop per test case
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          // Note: We call generateCode directly from the service
          const result = await this.codeGeneratorService.generateCode(id, userId, false);
          results.push({ id, status: 'success', isNew: result.isNew, attempts: attempt });
          success = true;
          break;
        } catch (error) {
          lastError = error.message;
          if (attempt < 3) {
             await new Promise(r => setTimeout(r, attempt * 1000));
          }
        }
      }

      if (!success) {
        failedCount++;
        results.push({ id, status: 'failed', error: lastError });
      }

      processed++;
      await this.jobService.updateProgress(jobId, processed);
    }

    const finalStatus = failedCount === 0 ? 'COMPLETED' : (failedCount === testCaseIds.length ? 'FAILED' : 'COMPLETED_WITH_ERRORS');
    await this.jobService.updateJob(jobId, finalStatus, { 
      total: testCaseIds.length, 
      succeeded: testCaseIds.length - failedCount,
      failed: failedCount,
      results 
    });
    
    return { success: true };
  }
}
