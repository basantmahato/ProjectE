import {
  Controller,
  ForbiddenException,
  Get,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { OptionalJwtGuard } from 'src/auth/optional-jwt.guard';
import { BillingService } from '../billing/billing.service';
import { InterviewPrepService } from './interview-prep.service';

interface RequestWithOptionalUser {
  user?: { userId: string } | null;
}

@ApiTags('Interview Prep (Public)')
@UseGuards(OptionalJwtGuard)
@Controller('interview-prep')
export class InterviewPrepPublicController {
  constructor(
    private readonly interviewPrepService: InterviewPrepService,
    private readonly billingService: BillingService,
  ) {}

  @Get('list')
  findAllJobRoles() {
    return this.interviewPrepService.findAllJobRoles();
  }

  @Get('read/:roleId')
  async findOneWithFullTree(
    @Param('roleId') roleId: string,
    @Req() req: RequestWithOptionalUser,
  ) {
    const userId = req.user?.userId ?? null;
    const plan = userId
      ? await this.billingService.getPlanForUser(userId)
      : 'free';
    if (plan === 'free') {
      throw new ForbiddenException({
        message: 'Interview prep requires Basic or Premium. Upgrade your plan to access.',
        code: 'PLAN_UPGRADE_REQUIRED',
      });
    }
    return this.interviewPrepService.findJobRoleWithFullTree(roleId);
  }
}
