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
import { QuestionBankService } from './question-bank.service';
import { CreateQuestionBankDto } from './dto/create-question-bank.dto';
import { UpdateQuestionBankDto } from './dto/update-question-bank.dto';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.gaurd';
import { RolesGuard } from 'src/auth/roles.gaurd';
import { Role } from 'src/auth/decorators/roles.decorator';

@ApiTags('Question Bank')
@UseGuards(JwtAuthGuard, RolesGuard)
@Role('admin')
@Controller('question-bank')
export class QuestionBankController {
  constructor(private readonly questionBankService: QuestionBankService) {}

  @Post()
  create(@Body() dto: CreateQuestionBankDto) {
    return this.questionBankService.create(dto);
  }

  @Get()
  findAll() {
    return this.questionBankService.findAll();
  }

  @Get('by-topic/:topicId')
  findByTopicId(@Param('topicId') topicId: string) {
    return this.questionBankService.findByTopicId(topicId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.questionBankService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateQuestionBankDto) {
    return this.questionBankService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.questionBankService.remove(id);
  }
}
