import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UnauthorizedException, UseGuards } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { OptionalJwtGuard } from "../auth/optional-jwt.guard";
import { RolesGuard } from "../auth/roles.guard";
import { Role } from "../auth/decorators/roles.decorator";
import { NotificationsService } from "./notifications.service";
import { RegisterPushTokenDto } from "./dto/register-push-token.dto";
import { RegisterWebPushDto } from "./dto/register-web-push.dto";
import { CreateNotificationDto } from "./dto/create-notification.dto";
import { UpdateNotificationDto } from "./dto/update-notification.dto";
import { Public } from "../auth/decorators/public.decorator";

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

  @Get("vapid-public-key")
  @Public()
  getVapidPublicKey() {
    return {
      vapidPublicKey: this.notificationsService.getVapidPublicKey(),
    };
  }

  @Post("register-web-push")
  @UseGuards(JwtAuthGuard)
  registerWebPush(@Body() dto: RegisterWebPushDto, @Req() req: RequestWithUser) {
    if (!req.user?.userId) throw new UnauthorizedException();
    return this.notificationsService.registerWebPushSubscription(
      req.user.userId,
      dto.endpoint,
      dto.keys.p256dh,
      dto.keys.auth,
    );
  }

  @Get()
  @UseGuards(OptionalJwtGuard)
  list(
    @Req() req: RequestWithUser,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.notificationsService.findAll(
      req.user?.userId,
      page ? Number(page) : 1,
      limit ? Number(limit) : 20,
    );
  }

  @Get(":id")
  @UseGuards(OptionalJwtGuard)
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
