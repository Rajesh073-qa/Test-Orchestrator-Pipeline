import { Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { JobService } from '../common/job.service';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/jwt.strategy';

@Controller('jobs')
@UseGuards(JwtAuthGuard)
export class JobController {
  constructor(private readonly jobService: JobService) {}

  @Get()
  async getMyJobs(@CurrentUser() user: JwtPayload) {
    return this.jobService.getUserJobs(user.userId);
  }

  @Get(':id')
  async getJobStatus(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.jobService.getJob(id, user.userId);
  }

  @Post(':id/cancel')
  async cancelJob(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.jobService.cancelJob(id, user.userId);
  }
}

