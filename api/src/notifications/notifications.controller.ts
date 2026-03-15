import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UnauthorizedException, UseGuards } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/jwt-auth.gaurd";
import { OptionalJwtGuard } from "../auth/optional-jwt.guard";
import { RolesGuard } from "../auth/roles.gaurd";
import { Role } from "../auth/decorators/roles.decorator";
import { NotificationsService } from "./notifications.service";
import { RegisterPushTokenDto } from "./dto/register-push-token.dto";
import { CreateNotificationDto } from "./dto/create-notification.dto";
import { UpdateNotificationDto } from "./dto/update-notification.dto";

interface JwtUser {
  userId: string;
  email: string;
  role: string;
}

interface RequestWithUser {
  user: JwtUser | null;
}

@ApiTags("Notifications")
@Controller("notifications")
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post("register-device")
  @UseGuards(JwtAuthGuard)
  registerDevice(@Body() dto: RegisterPushTokenDto, @Req() req: RequestWithUser) {
    if (!req.user?.userId) throw new UnauthorizedException();
    return this.notificationsService.registerPushToken(
      req.user.userId,
      dto.expoPushToken,
      dto.deviceId,
    );
  }

  @Get()
  @UseGuards(OptionalJwtGuard)
  list(@Req() req: RequestWithUser) {
    return this.notificationsService.findAll(req.user?.userId);
  }

  @Get(":id")
  getById(@Param("id") id: string) {
    return this.notificationsService.findOne(id);
  }

  @Post(":id/read")
  @UseGuards(JwtAuthGuard)
  markAsRead(@Param("id") id: string, @Req() req: RequestWithUser) {
    if (!req.user?.userId) throw new UnauthorizedException();
    return this.notificationsService.markAsRead(req.user.userId, id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Role("admin")
  create(@Body() dto: CreateNotificationDto) {
    return this.notificationsService.createAndSend(
      dto.title,
      dto.body,
      dto.type ?? "info",
    );
  }

  @Patch(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Role("admin")
  update(@Param("id") id: string, @Body() dto: UpdateNotificationDto) {
    return this.notificationsService.update(id, {
      title: dto.title,
      body: dto.body,
      type: dto.type,
    });
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Role("admin")
  delete(@Param("id") id: string) {
    return this.notificationsService.delete(id);
  }
}
