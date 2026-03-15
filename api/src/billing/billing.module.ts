import { Module } from '@nestjs/common';
import { NotificationsModule } from '../notifications/notifications.module';
import { BillingController } from './billing.controller';
import { BillingService } from './billing.service';
import { PlanGuard } from './plan.guard';

@Module({
  imports: [NotificationsModule],
  controllers: [BillingController],
  providers: [BillingService, PlanGuard],
  exports: [BillingService, PlanGuard],
})
export class BillingModule {}
