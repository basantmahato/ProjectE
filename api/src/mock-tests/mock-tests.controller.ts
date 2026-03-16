import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { TestsService } from '../tests/tests.service';
import { TestQuestionsService } from '../tests/test-questions.service';
import { CreateMockTestDto } from '../tests/dto/create-mock-test.dto';
import { UpdateMockTestDto } from '../tests/dto/update-mock-test.dto';
import { AddQuestionToTestDto } from '../tests/dto/add-question-to-test.dto';
import { BulkUploadMockTestsDto } from '../tests/dto/bulk-upload-mock-tests.dto';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Role } from '../auth/decorators/roles.decorator';

@ApiTags('Mock Tests')
@UseGuards(JwtAuthGuard, RolesGuard)
@Role('admin')
@Controller('mock-tests')
export class MockTestsController {
  constructor(
    private readonly testsService: TestsService,
    private readonly testQuestionsService: TestQuestionsService,
  ) {}

  @Post()
  create(@Body() dto: CreateMockTestDto) {
    return this.testsService.createMock(dto);
  }

  @Post('bulk')
  bulkCreate(@Body() dto: BulkUploadMockTestsDto) {
    return this.testsService.bulkCreateMocks(dto);
  }

  @Get()
  findAll(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.testsService.findAllMocks(
      page ? Number(page) : 1,
      limit ? Number(limit) : 20,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.testsService.findOneMock(id);
  }

  @Get(':id/questions')
  async getQuestions(@Param('id') id: string) {
    await this.testsService.findOneMock(id);
    return this.testQuestionsService.findByTestIdWithQuestionsAndOptions(id);
  }

  @Post(':id/questions')
  async addQuestion(
    @Param('id') id: string,
    @Body() dto: AddQuestionToTestDto,
  ) {
    await this.testsService.findOneMock(id);
    return this.testQuestionsService.addQuestion(
      id,
      dto.questionId,
      dto.questionOrder,
    );
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateMockTestDto) {
    return this.testsService.updateMock(id, dto);
  }

  @Delete(':id/questions/:testQuestionId')
  async removeQuestion(
    @Param('id') id: string,
    @Param('testQuestionId') testQuestionId: string,
  ) {
    await this.testsService.findOneMock(id);
    return this.testQuestionsService.removeFromTest(id, testQuestionId);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.testsService.removeMock(id);
  }
}
