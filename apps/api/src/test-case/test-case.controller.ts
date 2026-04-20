import { Controller, Get, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { TestCaseService } from './test-case.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/jwt.strategy';

@Controller('test-case')
@UseGuards(JwtAuthGuard)
export class TestCaseController {
  constructor(private readonly testCaseService: TestCaseService) {}

  @Get()
  findAll(@CurrentUser() user: JwtPayload) {
    return this.testCaseService.findAll(user.userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.testCaseService.findOne(id, user.userId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() data: any,
    @CurrentUser() user: JwtPayload
  ) {
    return this.testCaseService.update(id, user.userId, data);
  }
}
