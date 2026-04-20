import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import type { ProjectResponse } from './project.types';

@Injectable()
export class ProjectService {
  private readonly logger = new Logger(ProjectService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ─────────────────────────────────────────────────────────────────────────────
  // PRIVATE HELPER — Ownership verification
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Fetches a project and throws 404 if not found, 403 if userId doesn't match.
   * Central ownership check — used by getOne, update, delete.
   */
  private async findAndVerifyOwnership(
    projectId: string,
    userId: string,
  ) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw new NotFoundException(`Project with id "${projectId}" not found`);
    }

    if (project.userId !== userId) {
      // Log attempted unauthorised access for audit trail
      this.logger.warn(
        `User "${userId}" attempted to access project "${projectId}" owned by "${project.userId}"`,
      );
      throw new ForbiddenException('You do not have access to this project');
    }

    return project;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 1. CREATE
  // ─────────────────────────────────────────────────────────────────────────────

  async create(dto: CreateProjectDto, userId: string): Promise<ProjectResponse> {
    const project = await this.prisma.project.create({
      data: {
        name: dto.name,
        userId, // ✅ Always sourced from JWT — never from request body
      },
      select: { id: true, name: true, createdAt: true },
    });

    this.logger.log(`Project created: "${project.name}" by user "${userId}"`);
    return project;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 2. GET ALL (scoped by owner)
  // ─────────────────────────────────────────────────────────────────────────────

  async findAll(userId: string): Promise<ProjectResponse[]> {
    // ✅ Every query is scoped by userId — no cross-user data leakage possible
    return this.prisma.project.findMany({
      where: { userId },
      select: { id: true, name: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 3. GET ONE (ownership enforced)
  // ─────────────────────────────────────────────────────────────────────────────

  async findOne(projectId: string, userId: string): Promise<ProjectResponse> {
    const project = await this.findAndVerifyOwnership(projectId, userId);
    return { id: project.id, name: project.name, createdAt: project.createdAt };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 4. UPDATE (ownership enforced)
  // ─────────────────────────────────────────────────────────────────────────────

  async update(
    projectId: string,
    dto: UpdateProjectDto,
    userId: string,
  ): Promise<ProjectResponse> {
    // Verify ownership before touching the record
    await this.findAndVerifyOwnership(projectId, userId);

    const updated = await this.prisma.project.update({
      where: { id: projectId },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
      },
      select: { id: true, name: true, createdAt: true },
    });

    this.logger.log(`Project "${projectId}" updated by user "${userId}"`);
    return updated;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 5. DELETE (ownership enforced)
  // ─────────────────────────────────────────────────────────────────────────────

  async remove(projectId: string, userId: string): Promise<{ message: string }> {
    // Verify ownership before deleting
    await this.findAndVerifyOwnership(projectId, userId);

    await this.prisma.project.delete({
      where: { id: projectId },
    });

    this.logger.log(`Project "${projectId}" deleted by user "${userId}"`);
    return { message: `Project "${projectId}" deleted successfully` };
  }
}
