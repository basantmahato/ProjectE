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
import { TestsService } from './tests.service';
import { TestQuestionsService } from './test-questions.service';
import { CreateTestDto } from './dto/create-test.dto';
import { UpdateTestDto } from './dto/update-test.dto';
import { AddQuestionToTestDto } from './dto/add-question-to-test.dto';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.gaurd';
import { RolesGuard } from 'src/auth/roles.gaurd';
import { Role } from 'src/auth/decorators/roles.decorator';

@ApiTags('Tests')
@UseGuards(JwtAuthGuard, RolesGuard)
@Role('admin')
@Controller('tests')
export class TestsController {
  constructor(
    private readonly testsService: TestsService,
    private readonly testQuestionsService: TestQuestionsService,
  ) {}

  @Post()
  create(@Body() dto: CreateTestDto) {
    return this.testsService.create(dto);
  }

  @Get()
  findAll() {
    return this.testsService.findAll();
  }

  @Get(':testId/questions')
  getQuestions(@Param('testId') testId: string) {
    return this.testQuestionsService.findByTestIdWithQuestions(testId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.testsService.findOne(id);
  }

  @Post(':testId/questions')
  addQuestion(
    @Param('testId') testId: string,
    @Body() dto: AddQuestionToTestDto,
  ) {
    return this.testQuestionsService.addQuestion(
      testId,
      dto.questionId,
      dto.questionOrder,
    );
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateTestDto) {
    return this.testsService.update(id, dto);
  }

  @Delete(':testId/questions/:id')
  removeQuestion(
    @Param('testId') testId: string,
    @Param('id') id: string,
  ) {
    return this.testQuestionsService.removeFromTest(testId, id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.testsService.remove(id);
  }
}
