import { Controller, Post, Body, UseGuards, Req, Param } from '@nestjs/common';
import { AIService } from './ai.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/jwt.strategy';


@Controller('ai')
@UseGuards(JwtAuthGuard)
export class AIController {
  constructor(private readonly aiService: AIService) {}

  @Post('test-cases/:userStoryId')
  async generateTestCases(
    @Param('userStoryId') userStoryId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.aiService.generateTestCases(userStoryId, user.userId);
  }

  @Post('parse')
  async parseRequirement(
    @Body('rawInput') rawInput: string,
  ) {
    return this.aiService.parseRequirement(rawInput);
  }

  @Post('test-plan')
  async generateTestPlan(
    @Body('projectId') projectId: string,
    @Body('structuredData') structuredData: any,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.aiService.generateTestPlan(projectId, user.userId, structuredData);
  }
}
