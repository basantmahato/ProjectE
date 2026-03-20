import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { BillingService } from './billing.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { VerifyPaymentDto } from './dto/verify-payment.dto';

interface JwtUser {
  userId: string;
  email: string;
  role: string;
}

interface RequestWithUser {
  user: JwtUser;
}

@ApiTags('Billing')
@Controller('billing')
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Post('order')
  async createOrder(@Req() req: RequestWithUser, @Body() dto: CreateOrderDto) {
    return this.billingService.createOrder(req.user.userId, dto.planId);
  }

  @Post('verify')
  async verifyPayment(
    @Req() req: RequestWithUser,
    @Body() dto: VerifyPaymentDto,
  ) {
    return this.billingService.verifyPayment(
      req.user.userId,
      dto.planId,
      dto.razorpay_order_id,
      dto.razorpay_payment_id,
      dto.razorpay_signature,
    );
  }
}
