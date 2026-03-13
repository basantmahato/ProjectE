import { Body, Controller, Patch, Post, Req, UseGuards } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";
import { ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "./jwt-auth.gaurd";
import { UpdateProfileDto } from "./dto/update-profile.dto";
import { ChangePasswordDto } from "./dto/change-password.dto";

interface JwtUser {
  userId: string;
  email: string;
  role: string;
}

interface RequestWithUser {
  user: JwtUser;
}

@ApiTags("Auth")
@Controller("auth")
export class AuthController {

  constructor(private authService: AuthService) {}

  @Post("register")
  register(@Body() body: RegisterDto) {
    return this.authService.register(body);
  }

  @Post("login")
  login(@Body() body: LoginDto) {
    return this.authService.login(body);
  }

  @Patch("profile")
  @UseGuards(JwtAuthGuard)
  updateProfile(@Req() req: RequestWithUser, @Body() body: UpdateProfileDto) {
    return this.authService.updateProfile(req.user.userId, body);
  }

  @Post("change-password")
  @UseGuards(JwtAuthGuard)
  changePassword(@Req() req: RequestWithUser, @Body() body: ChangePasswordDto) {
    return this.authService.changePassword(req.user.userId, body);
  }
}