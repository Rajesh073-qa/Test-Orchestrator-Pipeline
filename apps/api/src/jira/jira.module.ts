import { Module } from '@nestjs/common';
import { JiraController } from './jira.controller';
import { JiraService } from './jira.service';
import { JiraClient } from './jira.client';
import { PrismaService } from '../prisma.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  /**
   * Import AuthModule to gain JwtAuthGuard (via PassportModule + JwtStrategy)
   * without re-registering JwtModule here.
   */
  imports: [AuthModule],
  controllers: [JiraController],
  providers: [
    JiraService,
    JiraClient, // Injectable integration layer — only talks to Jira Cloud API
    PrismaService,
  ],
  exports: [JiraService],
})
export class JiraModule {}
