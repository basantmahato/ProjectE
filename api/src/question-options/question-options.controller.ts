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
import { QuestionOptionsService } from './question-options.service';
import { CreateQuestionOptionDto } from './dto/create-question-option.dto';
import { UpdateQuestionOptionDto } from './dto/update-question-option.dto';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Role } from 'src/auth/decorators/roles.decorator';

@ApiTags('Question Options')
@UseGuards(JwtAuthGuard, RolesGuard)
@Role('admin')
@Controller('question-options')
export class QuestionOptionsController {
  constructor(private readonly questionOptionsService: QuestionOptionsService) {}

  @Post()
  create(@Body() dto: CreateQuestionOptionDto) {
    return this.questionOptionsService.create(dto);
  }

  @Get()
  findAll() {
    return this.questionOptionsService.findAll();
  }

  @Get('by-question/:questionId')
  findByQuestionId(@Param('questionId') questionId: string) {
    return this.questionOptionsService.findByQuestionId(questionId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.questionOptionsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateQuestionOptionDto) {
    return this.questionOptionsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.questionOptionsService.remove(id);
  }
}
