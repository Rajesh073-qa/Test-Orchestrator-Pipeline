import { Controller, Get, Post, Delete, Body, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/jwt.strategy';
import { AIConfigService } from './ai-config.service';

class SaveConfigDto {
  provider: string;
  model: string;
  apiKey: string;
}

@Controller('ai-config')
@UseGuards(JwtAuthGuard)
export class AIConfigController {
  constructor(private readonly aiConfigService: AIConfigService) {}

  @Get('providers')
  getProviders() {
    return this.aiConfigService.getProviders();
  }

  @Get()
  getConfig(@CurrentUser() user: JwtPayload) {
    return this.aiConfigService.getConfig(user.userId);
  }

  @Post()
  @HttpCode(HttpStatus.OK)
  saveConfig(@Body() body: SaveConfigDto, @CurrentUser() user: JwtPayload) {
    return this.aiConfigService.saveConfig(user.userId, body.provider, body.model, body.apiKey);
  }

  @Delete()
  @HttpCode(HttpStatus.OK)
  deleteConfig(@CurrentUser() user: JwtPayload) {
    return this.aiConfigService.deleteConfig(user.userId);
  }
}
