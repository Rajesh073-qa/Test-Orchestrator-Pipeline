import { Module } from '@nestjs/common';
import { AIConfigService } from './ai-config.service';
import { AIConfigController } from './ai-config.controller';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [AIConfigController],
  providers: [AIConfigService, PrismaService],
  exports: [AIConfigService],
})
export class AIConfigModule {}
