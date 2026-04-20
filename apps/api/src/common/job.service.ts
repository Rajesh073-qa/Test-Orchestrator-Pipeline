import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class JobService {
  private readonly logger = new Logger(JobService.name);

  constructor(private readonly prisma: PrismaService) {}

  async createJob(type: string, userId: string, total = 0, projectId?: string) {
    return this.prisma.job.create({
      data: {
        type,
        userId,
        projectId,
        status: 'PENDING',
        total,
      },
    });
  }

  async findActiveProjectJob(projectId: string, type: string) {
    return this.prisma.job.findFirst({
      where: {
        projectId,
        type,
        status: { in: ['PENDING', 'RUNNING'] },
      },
    });
  }


  async updateProgress(id: string, progress: number) {
    return this.prisma.job.update({
      where: { id },
      data: { progress },
    });
  }

  async incrementAttempts(id: string, error: string) {
    return this.prisma.job.update({
      where: { id },
      data: { 
        attempts: { increment: 1 },
        lastError: error
      },
    });
  }

  async updateJob(id: string, status: string, result?: any) {
    return this.prisma.job.update({
      where: { id },
      data: {
        status,
        result: result ? JSON.stringify(result) : undefined,
      },
    });
  }

  async failJob(id: string, error: string) {
    return this.prisma.job.update({
      where: { id },
      data: {
        status: 'FAILED',
        lastError: error,
      },
    });
  }

  async cancelJob(id: string, userId: string) {
    return this.prisma.job.update({
      where: { id, userId },
      data: {
        status: 'CANCELLED',
      },
    });
  }



  async getJob(id: string, userId: string) {
    return this.prisma.job.findUnique({
      where: { id, userId },
    });
  }

  async getUserJobs(userId: string) {
    return this.prisma.job.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });
  }
}
