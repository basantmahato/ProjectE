import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { RolesGuard } from "../auth/roles.gaurd";
import { NotificationsController } from "./notifications.controller";
import { NotificationsService } from "./notifications.service";

@Module({
  imports: [AuthModule],
  controllers: [NotificationsController],
  providers: [NotificationsService, RolesGuard],
  exports: [NotificationsService],
})
export class NotificationsModule {}
