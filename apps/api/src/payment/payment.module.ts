import { Module } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { PaymentController } from './payment.controller';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [PaymentController],
  providers: [StripeService, PrismaService],
  exports: [StripeService],
})
export class PaymentModule {}
