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
import { SamplePapersService } from './sample-papers.service';
import { CreateSamplePaperDto } from './dto/create-sample-paper.dto';
import { UpdateSamplePaperDto } from './dto/update-sample-paper.dto';
import { CreateSamplePaperSubjectDto } from './dto/create-sample-paper-subject.dto';
import { UpdateSamplePaperSubjectDto } from './dto/update-sample-paper-subject.dto';
import { CreateSamplePaperTopicDto } from './dto/create-sample-paper-topic.dto';
import { UpdateSamplePaperTopicDto } from './dto/update-sample-paper-topic.dto';
import { CreateSamplePaperQuestionDto } from './dto/create-sample-paper-question.dto';
import { UpdateSamplePaperQuestionDto } from './dto/update-sample-paper-question.dto';
import { CreateSamplePaperQuestionOptionDto } from './dto/create-sample-paper-question-option.dto';
import { UpdateSamplePaperQuestionOptionDto } from './dto/update-sample-paper-question-option.dto';

@ApiTags('Sample Papers (Admin)')
@UseGuards(JwtAuthGuard, RolesGuard)
@Role('admin')
@Controller('sample-papers')
export class SamplePapersController {
  constructor(private readonly samplePapersService: SamplePapersService) {}

  // --- Sample Papers ---
  @Post()
  createPaper(@Body() dto: CreateSamplePaperDto) {
    return this.samplePapersService.createPaper(dto);
  }

  @Get()
  findAllPapers() {
    return this.samplePapersService.findAllPapers();
  }

  @Get(':paperId')
  findOnePaper(@Param('paperId') paperId: string) {
    return this.samplePapersService.findOnePaper(paperId);
  }

  @Patch(':paperId')
  updatePaper(
    @Param('paperId') paperId: string,
    @Body() dto: UpdateSamplePaperDto,
  ) {
    return this.samplePapersService.updatePaper(paperId, dto);
  }

  @Delete(':paperId')
  removePaper(@Param('paperId') paperId: string) {
    return this.samplePapersService.removePaper(paperId);
  }

  // --- Subjects ---
  @Post(':paperId/subjects')
  createSubject(
    @Param('paperId') paperId: string,
    @Body() dto: CreateSamplePaperSubjectDto,
  ) {
    return this.samplePapersService.createSubject(paperId, dto);
  }

  @Get(':paperId/subjects')
  findSubjects(@Param('paperId') paperId: string) {
    return this.samplePapersService.findSubjectsByPaperId(paperId);
  }

  @Patch(':paperId/subjects/:subjectId')
  updateSubject(
    @Param('subjectId') subjectId: string,
    @Body() dto: UpdateSamplePaperSubjectDto,
  ) {
    return this.samplePapersService.updateSubject(subjectId, dto);
  }

  @Delete(':paperId/subjects/:subjectId')
  removeSubject(@Param('subjectId') subjectId: string) {
    return this.samplePapersService.removeSubject(subjectId);
  }

  // --- Topics ---
  @Post(':paperId/subjects/:subjectId/topics')
  createTopic(
    @Param('subjectId') subjectId: string,
    @Body() dto: CreateSamplePaperTopicDto,
  ) {
    return this.samplePapersService.createTopic(subjectId, dto);
  }

  @Get(':paperId/subjects/:subjectId/topics')
  findTopics(@Param('subjectId') subjectId: string) {
    return this.samplePapersService.findTopicsBySubjectId(subjectId);
  }

  @Patch(':paperId/subjects/:subjectId/topics/:topicId')
  updateTopic(
    @Param('topicId') topicId: string,
    @Body() dto: UpdateSamplePaperTopicDto,
  ) {
    return this.samplePapersService.updateTopic(topicId, dto);
  }

  @Delete(':paperId/subjects/:subjectId/topics/:topicId')
  removeTopic(@Param('topicId') topicId: string) {
    return this.samplePapersService.removeTopic(topicId);
  }

  // --- Questions ---
  @Post(':paperId/subjects/:subjectId/topics/:topicId/questions')
  createQuestion(
    @Param('topicId') topicId: string,
    @Body() dto: CreateSamplePaperQuestionDto,
  ) {
    return this.samplePapersService.createQuestion(topicId, dto);
  }

  @Get(':paperId/subjects/:subjectId/topics/:topicId/questions')
  findQuestions(@Param('topicId') topicId: string) {
    return this.samplePapersService.findQuestionsByTopicId(topicId);
  }

  @Patch(':paperId/subjects/:subjectId/topics/:topicId/questions/:questionId')
  updateQuestion(
    @Param('questionId') questionId: string,
    @Body() dto: UpdateSamplePaperQuestionDto,
  ) {
    return this.samplePapersService.updateQuestion(questionId, dto);
  }

  @Delete(':paperId/subjects/:subjectId/topics/:topicId/questions/:questionId')
  removeQuestion(@Param('questionId') questionId: string) {
    return this.samplePapersService.removeQuestion(questionId);
  }

  // --- Question Options (answers) ---
  @Post(':paperId/subjects/:subjectId/topics/:topicId/questions/:questionId/options')
  createOption(
    @Param('questionId') questionId: string,
    @Body() dto: CreateSamplePaperQuestionOptionDto,
  ) {
    return this.samplePapersService.createOption(questionId, dto);
  }

  @Get(':paperId/subjects/:subjectId/topics/:topicId/questions/:questionId/options')
  findOptions(@Param('questionId') questionId: string) {
    return this.samplePapersService.findOptionsByQuestionId(questionId);
  }

  @Patch(':paperId/subjects/:subjectId/topics/:topicId/questions/:questionId/options/:optionId')
  updateOption(
    @Param('optionId') optionId: string,
    @Body() dto: UpdateSamplePaperQuestionOptionDto,
  ) {
    return this.samplePapersService.updateOption(optionId, dto);
  }

  @Delete(':paperId/subjects/:subjectId/topics/:topicId/questions/:questionId/options/:optionId')
  removeOption(@Param('optionId') optionId: string) {
    return this.samplePapersService.removeOption(optionId);
  }
}
