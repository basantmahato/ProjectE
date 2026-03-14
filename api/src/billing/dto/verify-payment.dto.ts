import { IsIn, IsString } from 'class-validator';

export class VerifyPaymentDto {
  @IsIn(['basic', 'premium'])
  planId: string;

  @IsString()
  razorpay_order_id: string;

  @IsString()
  razorpay_payment_id: string;

  @IsString()
  razorpay_signature: string;
}
