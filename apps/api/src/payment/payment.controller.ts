import { Controller, Post, Body, UseGuards, Req, Headers, RawBodyRequest } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { StripeService } from './stripe.service';
import { Request } from 'express';

@Controller('payment')
export class PaymentController {
  constructor(private readonly stripeService: StripeService) {}

  @Post('checkout')
  @UseGuards(JwtAuthGuard)
  async createCheckout(@Body('plan') plan: 'PRO' | 'ENTERPRISE', @CurrentUser() user: any) {
    return this.stripeService.createCheckoutSession(user.userId, plan);
  }

  @Post('webhook')
  async webhook(@Headers('stripe-signature') sig: string, @Req() req: RawBodyRequest<Request>) {
    if (!req.rawBody) {
      throw new Error('Missing raw body');
    }
    return this.stripeService.handleWebhook(sig, req.rawBody);
  }
}
