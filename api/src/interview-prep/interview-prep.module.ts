import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { BillingModule } from '../billing/billing.module';
import { InterviewPrepController } from './interview-prep.controller';
import { InterviewPrepPublicController } from './interview-prep-public.controller';
import { InterviewPrepService } from './interview-prep.service';

@Module({
  imports: [AuthModule, BillingModule],
  controllers: [InterviewPrepPublicController, InterviewPrepController],
  providers: [InterviewPrepService],
  exports: [InterviewPrepService],
})
export class InterviewPrepModule {}
