import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { PrismaService } from '../prisma.service';

@Injectable()
export class StripeService {
  private stripe: any;
  private readonly logger = new Logger(StripeService.name);

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    this.stripe = new Stripe(this.configService.get('STRIPE_SECRET_KEY')!, {
      apiVersion: '2025-01-27' as any,
    });
  }

  async createCheckoutSession(userId: string, plan: 'PRO' | 'ENTERPRISE') {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { subscription: true },
    });

    if (!user) throw new Error('User not found');

    const amount = plan === 'PRO' ? 399900 : 1999900; // ₹3,999 or ₹19,999 in paise
    const planName = plan === 'PRO' ? 'Pro Plan' : 'Enterprise Plan';

    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'inr',
            product_data: {
              name: planName,
              description: `Upgrade to ${planName} for advanced features.`,
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${this.configService.get('FRONTEND_URL')}/dashboard?payment=success`,
      cancel_url: `${this.configService.get('FRONTEND_URL')}/pricing?payment=cancelled`,
      client_reference_id: userId,
      metadata: {
        userId,
        plan,
      },
    });

    return { url: session.url };
  }

  async handleWebhook(sig: string, payload: Buffer) {
    let event: any;

    try {
      event = this.stripe.webhooks.constructEvent(
        payload,
        sig,
        this.configService.get('STRIPE_WEBHOOK_SECRET')!,
      );
    } catch (err: any) {
      this.logger.error(`Webhook signature verification failed: ${err.message}`);
      throw err;
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as any;
      const userId = session.client_reference_id;
      const plan = session.metadata?.plan as string;

      if (userId && plan) {
        await this.prisma.subscription.upsert({
          where: { userId },
          create: {
            userId,
            plan,
            status: 'ACTIVE',
            stripeCustomerId: session.customer as string,
            stripeSubscriptionId: session.id,
          },
          update: {
            plan,
            status: 'ACTIVE',
            stripeCustomerId: session.customer as string,
            stripeSubscriptionId: session.id,
          },
        });
        this.logger.log(`Subscription updated for user ${userId} to ${plan}`);
      }
    }

    return { received: true };
  }
}
