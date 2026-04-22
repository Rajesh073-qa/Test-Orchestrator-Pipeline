import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { AIService } from '../ai/ai.service';
import { PrismaService } from '../prisma.service';
import { AIConfigService } from '../ai-config/ai-config.service';

@Module({
  controllers: [ChatController],
  providers: [ChatService, AIService, PrismaService, AIConfigService],
})
export class ChatModule {}
