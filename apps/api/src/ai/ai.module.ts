import { Module } from '@nestjs/common';
import { AIController } from './ai.controller';
import { AIService } from './ai.service';
import { PrismaService } from '../prisma.service';
import { AIConfigModule } from '../ai-config/ai-config.module';

@Module({
  imports: [AIConfigModule],
  controllers: [AIController],
  providers: [AIService, PrismaService],
})
export class AIModule {}
