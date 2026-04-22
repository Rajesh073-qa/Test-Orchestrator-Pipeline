import { Controller, Post, Get, Body, UseGuards, Param } from '@nestjs/common';
import { AIService } from './ai.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/jwt.strategy';

@Controller('ai')
@UseGuards(JwtAuthGuard)
export class AIController {
  constructor(private readonly aiService: AIService) {}

  /** GET /ai/trial-status — returns FREE_TRIAL_AVAILABLE / FREE_TRIAL_EXHAUSTED / PRO / UNLIMITED */
  @Get('trial-status')
  async getTrialStatus(@CurrentUser() user: JwtPayload) {
    return this.aiService.getTrialStatus(user.userId);
  }

  async generateTestCases(
    @Param('userStoryId') userStoryId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.aiService.generateTestCases(userStoryId, user.userId);
  }

  @Post('parse')
  async parseRequirement(
    @Body('rawInput') rawInput: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.aiService.parseRequirement(rawInput, user.userId);
  }

  @Post('test-plan')
  async generateTestPlan(
    @Body('projectId') projectId: string,
    @Body('structuredData') structuredData: any,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.aiService.generateTestPlan(projectId, user.userId, structuredData);
  }

  @Post('test-cases/bulk/:projectId')
  async generateBulkTestCases(
    @Param('projectId') projectId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.aiService.generateBulkTestCases(projectId, user.userId);
  }

  // ── Quick Generators — now pass userId so per-user AI config is used ──────────

  @Post('quick/test-plan')
  async quickTestPlan(
    @Body('text') text: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.aiService.quickGenerateTestPlan(text, user.userId);
  }

  @Post('quick/test-cases')
  async quickTestCases(
    @Body('text') text: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.aiService.quickGenerateTestCases(text, user.userId);
  }

  @Post('quick/code')
  async quickCode(
    @Body('text') text: string,
    @Body('framework') framework: string = 'playwright',
    @CurrentUser() user: JwtPayload,
  ) {
    return this.aiService.quickGenerateCode(text, framework, user.userId);
  }
}
