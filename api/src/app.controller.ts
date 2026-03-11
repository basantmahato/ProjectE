import { Controller, Get, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { JwtAuthGuard } from './auth/jwt-auth.gaurd';
import { Role } from './auth/decorators/roles.decorator';
import { RolesGuard } from './auth/roles.gaurd';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Role("user")
  getHello(): string {
    return this.appService.getHello();
  }
}
