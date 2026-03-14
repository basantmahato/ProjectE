import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { DashbaordService } from './dashbaord.service';
import { JwtAuthGuard } from '../auth/jwt-auth.gaurd';
import { Public } from '../auth/decorators/public.decorator';

interface JwtUser {
  userId: string;
  email: string;
  role: string;
}

interface RequestWithUser {
  user: JwtUser;
}

@Controller('dashbaord')
@UseGuards(JwtAuthGuard)
export class DashbaordController {
  constructor(private readonly dashbaordService: DashbaordService) {}

  @Get()
  getStats(@Req() req: RequestWithUser) {
    return this.dashbaordService.getStats(req.user.userId);
  }

  @Public()
  @Get('leaderboard')
  getLeaderboard() {
    return this.dashbaordService.getLeaderboard();
  }
}
