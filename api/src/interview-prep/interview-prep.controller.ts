import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.gaurd';
import { RolesGuard } from 'src/auth/roles.gaurd';
import { Role } from 'src/auth/decorators/roles.decorator';
import { InterviewPrepService } from './interview-prep.service';
import { CreateJobRoleDto } from './dto/create-job-role.dto';
import { UpdateJobRoleDto } from './dto/update-job-role.dto';
import { CreateTopicDto } from './dto/create-topic.dto';
import { UpdateTopicDto } from './dto/update-topic.dto';
import { CreateSubtopicDto } from './dto/create-subtopic.dto';
import { UpdateSubtopicDto } from './dto/update-subtopic.dto';
import { BulkUploadInterviewPrepDto } from './dto/bulk-upload-interview-prep.dto';

@ApiTags('Interview Prep (Admin)')
@UseGuards(JwtAuthGuard, RolesGuard)
@Role('admin')
@Controller('interview-prep')
export class InterviewPrepController {
  constructor(private readonly interviewPrepService: InterviewPrepService) {}

  // --- Job Roles ---
  @Post('job-roles')
  createJobRole(@Body() dto: CreateJobRoleDto) {
    return this.interviewPrepService.createJobRole(dto);
  }

  @Post('bulk')
  bulkCreate(@Body() dto: BulkUploadInterviewPrepDto) {
    return this.interviewPrepService.bulkCreate(dto);
  }

  @Get('job-roles')
  findAllJobRoles() {
    return this.interviewPrepService.findAllJobRoles();
  }

  @Get('job-roles/:roleId')
  findOneJobRole(@Param('roleId') roleId: string) {
    return this.interviewPrepService.findOneJobRole(roleId);
  }

  @Patch('job-roles/:roleId')
  updateJobRole(
    @Param('roleId') roleId: string,
    @Body() dto: UpdateJobRoleDto,
  ) {
    return this.interviewPrepService.updateJobRole(roleId, dto);
  }

  @Delete('job-roles/:roleId')
  removeJobRole(@Param('roleId') roleId: string) {
    return this.interviewPrepService.removeJobRole(roleId);
  }

  // --- Topics ---
  @Post('job-roles/:roleId/topics')
  createTopic(
    @Param('roleId') roleId: string,
    @Body() dto: CreateTopicDto,
  ) {
    return this.interviewPrepService.createTopic(roleId, dto);
  }

  @Get('job-roles/:roleId/topics')
  findTopics(@Param('roleId') roleId: string) {
    return this.interviewPrepService.findTopicsByJobRoleId(roleId);
  }

  @Patch('job-roles/:roleId/topics/:topicId')
  updateTopic(
    @Param('topicId') topicId: string,
    @Body() dto: UpdateTopicDto,
  ) {
    return this.interviewPrepService.updateTopic(topicId, dto);
  }

  @Delete('job-roles/:roleId/topics/:topicId')
  removeTopic(@Param('topicId') topicId: string) {
    return this.interviewPrepService.removeTopic(topicId);
  }

  // --- Subtopics ---
  @Post('job-roles/:roleId/topics/:topicId/subtopics')
  createSubtopic(
    @Param('topicId') topicId: string,
    @Body() dto: CreateSubtopicDto,
  ) {
    return this.interviewPrepService.createSubtopic(topicId, dto);
  }

  @Get('job-roles/:roleId/topics/:topicId/subtopics')
  findSubtopics(@Param('topicId') topicId: string) {
    return this.interviewPrepService.findSubtopicsByTopicId(topicId);
  }

  @Patch('job-roles/:roleId/topics/:topicId/subtopics/:subtopicId')
  updateSubtopic(
    @Param('subtopicId') subtopicId: string,
    @Body() dto: UpdateSubtopicDto,
  ) {
    return this.interviewPrepService.updateSubtopic(subtopicId, dto);
  }

  @Delete('job-roles/:roleId/topics/:topicId/subtopics/:subtopicId')
  removeSubtopic(@Param('subtopicId') subtopicId: string) {
    return this.interviewPrepService.removeSubtopic(subtopicId);
  }
}
