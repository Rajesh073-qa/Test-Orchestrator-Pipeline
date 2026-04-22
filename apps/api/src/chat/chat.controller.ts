import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/jwt.strategy';

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  async sendMessage(
    @Body() dto: { message: string },
    @CurrentUser() user: JwtPayload,
  ) {
    return this.chatService.processMessage(user.userId, dto.message);
  }
}
