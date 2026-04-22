import { Controller, Post, Get, Delete, Param, Query, UseGuards, Res } from '@nestjs/common';
import { CodeGeneratorService } from './code-generator.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/jwt.strategy';
import type { Response } from 'express';


@Controller('code-generator')
@UseGuards(JwtAuthGuard)
export class CodeGeneratorController {
  constructor(private readonly codeGeneratorService: CodeGeneratorService) {}

  @Post(':testCaseId')
  async generateCode(
    @Param('testCaseId') testCaseId: string,
    @CurrentUser() user: JwtPayload,
    @Query('force') force?: string,
  ) {
    return this.codeGeneratorService.generateCode(testCaseId, user.userId, force === 'true');
  }

  @Delete('scripts/:id')
  async deleteScript(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.codeGeneratorService.deleteScript(id, user.userId);
  }

  @Get('export/:testCaseId')
  async exportCode(
    @Param('testCaseId') testCaseId: string,
    @CurrentUser() user: JwtPayload,
    @Res() res: Response,
  ) {
    const archive = await this.codeGeneratorService.exportCode(testCaseId, user.userId);
    
    res.set({
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="playwright-tests.zip"`,
    });

    archive.pipe(res);
  }

  @Post('project/:projectId')
  async generateForProject(
    @Param('projectId') projectId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.codeGeneratorService.generateForProject(projectId, user.userId);
  }

  @Post('retry/:jobId')
  async retryJob(
    @Param('jobId') jobId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.codeGeneratorService.retryFailedCases(jobId, user.userId);
  }

  @Get('workflow/:projectId')
  async generateWorkflow(
    @Param('projectId') projectId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.codeGeneratorService.generateGitHubWorkflow(projectId, user.userId);
  }

  @Get('export-project/:projectId')
  async exportProject(
    @Param('projectId') projectId: string,
    @CurrentUser() user: JwtPayload,
    @Res() res: Response,
  ) {
    const archive = await this.codeGeneratorService.exportProject(projectId, user.userId);
    
    res.set({
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="project-automation.zip"`,
    });

    archive.pipe(res);
  }
}
