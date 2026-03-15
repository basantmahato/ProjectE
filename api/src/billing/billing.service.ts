import { BadRequestException, Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import Razorpay from 'razorpay';
import { db } from '../database/db';
import { users } from '../database/schema/user.schema';
import { eq } from 'drizzle-orm';
import { NotificationsService } from '../notifications/notifications.service';
import type { PlanId } from './plan-features';

const PLAN_AMOUNTS_PAISE: Record<string, number> = {
  basic: 4900,
  premium: 9900,
};

@Injectable()
export class BillingService {
  private razorpay: Razorpay | null = null;

  constructor(private readonly notificationsService: NotificationsService) {}

  async getPlanForUser(userId: string): Promise<PlanId> {
    const [u] = await db
      .select({ plan: users.plan })
      .from(users)
      .where(eq(users.id, userId));
    return (u?.plan as PlanId) ?? 'free';
  }

  private getRazorpay(): Razorpay {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keyId || !keySecret) {
      throw new BadRequestException('Payment is not configured');
    }
    if (!this.razorpay) {
      this.razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });
    }
    return this.razorpay;
  }

  async createOrder(userId: string, planId: string) {
    if (planId === 'free') {
      throw new BadRequestException('Free plan does not require payment');
    }
    const amountPaise = PLAN_AMOUNTS_PAISE[planId];
    if (amountPaise == null) {
      throw new BadRequestException('Invalid plan');
    }
    const instance = this.getRazorpay();
    // Razorpay receipt max length is 40 chars
    const shortId = userId.replace(/-/g, '').slice(0, 12);
    const receipt = `${planId}_${shortId}_${Date.now().toString().slice(-8)}`;
    const order = await instance.orders.create({
      amount: amountPaise,
      currency: 'INR',
      receipt,
    });
    return {
      orderId: order.id,
      amount: amountPaise,
      currency: 'INR',
      keyId: process.env.RAZORPAY_KEY_ID,
    };
  }

  async verifyPayment(
    userId: string,
    planId: string,
    razorpayOrderId: string,
    razorpayPaymentId: string,
    razorpaySignature: string,
  ) {
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      throw new BadRequestException('Payment is not configured');
    }
    if (planId === 'free' || !PLAN_AMOUNTS_PAISE[planId]) {
      throw new BadRequestException('Invalid plan');
    }
    const body = `${razorpayOrderId}|${razorpayPaymentId}`;
    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(body)
      .digest('hex');
    if (expectedSignature !== razorpaySignature) {
      throw new BadRequestException('Invalid payment signature');
    }
    const [updated] = await db
      .update(users)
      .set({ plan: planId as 'basic' | 'premium' })
      .where(eq(users.id, userId))
      .returning();
    if (!updated) {
      throw new BadRequestException('User not found');
    }
    try {
      await this.notificationsService.createAndSendToUser(
        userId,
        'Transaction completed',
        'Your payment was successful. Plan upgraded.',
        'transaction',
      );
    } catch {
      // Do not fail the payment response if notification fails
    }
    const { password: _, ...userWithoutPassword } = updated;
    return { user: userWithoutPassword };
  }
}
