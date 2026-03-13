import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.gaurd';
import { InterviewPrepService } from './interview-prep.service';

@ApiTags('Interview Prep (Public)')
@UseGuards(JwtAuthGuard)
@Controller('interview-prep')
export class InterviewPrepPublicController {
  constructor(private readonly interviewPrepService: InterviewPrepService) {}

  @Get('list')
  findAllJobRoles() {
    return this.interviewPrepService.findAllJobRoles();
  }

  @Get('read/:roleId')
  findOneWithFullTree(@Param('roleId') roleId: string) {
    return this.interviewPrepService.findJobRoleWithFullTree(roleId);
  }
}
