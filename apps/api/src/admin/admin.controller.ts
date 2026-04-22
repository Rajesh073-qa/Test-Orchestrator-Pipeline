import { Controller, Get, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { PrismaService } from '../prisma.service';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class AdminController {
  constructor(private readonly prisma: PrismaService) {}

  /** GET /admin/stats — platform-wide statistics */
  @Get('stats')
  async getStats() {
    const [totalUsers, totalProjects, totalTestCases, totalJobs, activeJobs, failedJobs] =
      await Promise.all([
        this.prisma.user.count(),
        this.prisma.project.count(),
        this.prisma.testCase.count(),
        this.prisma.job.count(),
        this.prisma.job.count({ where: { status: 'RUNNING' } }),
        this.prisma.job.count({ where: { status: 'FAILED' } }),
      ]);

    return { totalUsers, totalProjects, totalTestCases, totalJobs, activeJobs, failedJobs };
  }

  /** GET /admin/users — all users with counts */
  @Get('users')
  async getUsers() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        is2FAEnabled: true,
        createdAt: true,
        _count: { select: { projects: true, jobs: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /** PATCH /admin/users/:id/role — update user role */
  @Patch('users/:id/role')
  async updateUserRole(
    @Param('id') userId: string,
    @Body('role') role: string,
  ) {
    const validRoles = ['ADMIN', 'QA', 'USER', 'VIEWER'];
    if (!validRoles.includes(role)) {
      throw new Error(`Invalid role: ${role}`);
    }
    return this.prisma.user.update({
      where: { id: userId },
      data: { role: role as any },
      select: { id: true, email: true, role: true },
    });
  }
}
