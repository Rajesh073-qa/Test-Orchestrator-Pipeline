import { Controller, Post, Body, UseGuards, Req, Param } from '@nestjs/common';
import { AIService } from './ai.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/jwt.strategy';


@Controller('ai')
@UseGuards(JwtAuthGuard)
export class AIController {
  constructor(private readonly aiService: AIService) {}

  @Post('generate-test-cases')
  async generateTestCasesBulk(
    @Body('projectId') projectId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.aiService.generateTestCasesBulk(projectId, user.userId);
  }

  @Post('parse')
  async parseRequirement(
    @Body('rawInput') rawInput: string,
  ) {
    return this.aiService.parseRequirement(rawInput);
  }

  @Post('generate-test-plan')
  async generateTestPlan(
    @Body('projectId') projectId: string,
    @Body('structuredData') structuredData: any,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.aiService.generateTestPlan(projectId, user.userId, structuredData);
  }
}
