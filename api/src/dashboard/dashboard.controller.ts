import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Role } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';

interface JwtUser {
  userId: string;
  email: string;
  role: string;
}

interface RequestWithUser {
  user: JwtUser;
}

@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  getStats(@Req() req: RequestWithUser) {
    return this.dashboardService.getStats(req.user.userId);
  }

  @Get('admin-stats')
  @UseGuards(RolesGuard)
  @Role('admin')
  getAdminStats() {
    return this.dashboardService.getAdminStats();
  }

  @Public()
  @Get('leaderboard')
  getLeaderboard(@Query('limit') limit?: string) {
    return this.dashboardService.getLeaderboard(limit ? Number(limit) : 100);
  }
}
