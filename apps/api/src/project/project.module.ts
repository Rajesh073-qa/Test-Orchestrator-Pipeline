import { Module } from '@nestjs/common';
import { ProjectController } from './project.controller';
import { ProjectService } from './project.service';
import { PrismaService } from '../prisma.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  /**
   * Import AuthModule to gain access to JwtAuthGuard via PassportModule
   * and the registered JWT strategy — without re-configuring JwtModule here.
   */
  imports: [AuthModule],
  controllers: [ProjectController],
  providers: [ProjectService, PrismaService],
  exports: [ProjectService],
})
export class ProjectModule {}
