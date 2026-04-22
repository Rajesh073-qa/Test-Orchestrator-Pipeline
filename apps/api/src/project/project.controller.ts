import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ProjectService } from './project.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/jwt.strategy';

/**
 * All routes in this controller require a valid JWT.
 * userId is ALWAYS extracted from the verified token — never from the request body.
 */
@Controller('projects')
@UseGuards(JwtAuthGuard) // ✅ Guard applied at controller level — every route is protected
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  // ─────────────────────────────────────────────────────────────────────────────
  // POST /api/projects
  // Create a new project for the authenticated user
  // ─────────────────────────────────────────────────────────────────────────────
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @Body() dto: CreateProjectDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.projectService.create(dto, user.userId);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // GET /api/projects
  // List all projects belonging to the authenticated user (sorted newest first)
  // ─────────────────────────────────────────────────────────────────────────────
  @Get()
  findAll(@CurrentUser() user: JwtPayload) {
    return this.projectService.findAll(user.userId);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // GET /api/projects/:id
  // Get a single project — 403 if not owned by caller
  // ─────────────────────────────────────────────────────────────────────────────
  @Get(':id')
  findOne(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.projectService.findOne(id, user.userId);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // PATCH /api/projects/:id
  // Update project name — 403 if not owned by caller
  // ─────────────────────────────────────────────────────────────────────────────
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateProjectDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.projectService.update(id, dto, user.userId);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // DELETE /api/projects/:id
  // Delete project — 403 if not owned by caller
  // ─────────────────────────────────────────────────────────────────────────────
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.projectService.remove(id, user.userId);
  }
  @Post(':id/stories')
  createStory(
    @Param('id') projectId: string,
    @Body() dto: { title: string; description: string; acceptanceCriteria: string },
    @CurrentUser() user: JwtPayload,
  ) {
    return this.projectService.createStory(projectId, dto, user.userId);
  }

  @Delete('stories/:storyId')
  deleteStory(
    @Param('storyId') storyId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.projectService.deleteStory(storyId, user.userId);
  }

  @Patch('stories/:storyId')
  updateStory(
    @Param('storyId') storyId: string,
    @Body() dto: any,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.projectService.updateStory(storyId, dto, user.userId);
  }
}
