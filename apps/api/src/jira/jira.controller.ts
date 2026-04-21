import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JiraService } from './jira.service';
import { ConnectJiraDto } from './dto/connect-jira.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/jwt.strategy';

/**
 * All Jira routes require a valid JWT.
 * userId is ALWAYS extracted from @CurrentUser() — never from body or params.
 *
 * Flow enforced here:
 *   Controller → JiraService → JiraClient → Jira Cloud
 *   Controller → JiraService → PrismaService → PostgreSQL
 */
@Controller('jira')
@UseGuards(JwtAuthGuard) // ✅ Every route in this controller is protected
export class JiraController {
  constructor(private readonly jiraService: JiraService) {}

  // ─────────────────────────────────────────────────────────────────────────────
  // GET /api/jira/status
  // Check whether the current user has an active Jira connection
  // ─────────────────────────────────────────────────────────────────────────────
  @Get('status')
  getStatus(@CurrentUser() user: JwtPayload) {
    return this.jiraService.getConnectionStatus(user.userId);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // POST /api/jira/connect
  // Save (or update) Jira credentials for the authenticated user.
  // Validates credentials against Jira API before storing.
  // ─────────────────────────────────────────────────────────────────────────────
  @Post('connect')
  @HttpCode(HttpStatus.OK)
  connect(
    @Body() dto: ConnectJiraDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.jiraService.connect(dto, user.userId);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // GET /api/jira/projects
  // Fetch the list of accessible Jira projects using stored credentials.
  // ─────────────────────────────────────────────────────────────────────────────
  @Get('projects')
  getProjects(@CurrentUser() user: JwtPayload) {
    return this.jiraService.getProjects(user.userId);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // POST /api/jira/stories/:projectId
  // Fetch & store User Stories from Jira into the given internal project.
  //
  // :projectId  → internal DB project ID (uuid)
  // ?jiraKey=   → Jira project key (e.g. "PROJ", "QA")
  //
  // Example: POST /api/jira/stories/abc-123?jiraKey=PROJ
  // ─────────────────────────────────────────────────────────────────────────────
  @Post('stories/:projectId')
  @HttpCode(HttpStatus.OK)
  syncStories(
    @Param('projectId') projectId: string,
    @Query('jiraKey') jiraProjectKey: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.jiraService.syncStories(projectId, jiraProjectKey, user.userId);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // GET /api/jira/issue/:issueKey
  // Fetch a single Jira issue dynamically to be used as context for Quick Generators.
  // Example: GET /api/jira/issue/PROJ-123
  // ─────────────────────────────────────────────────────────────────────────────
  @Get('issue/:issueKey')
  getIssue(
    @Param('issueKey') issueKey: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.jiraService.getIssue(issueKey, user.userId);
  }
}
