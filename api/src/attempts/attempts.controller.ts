import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AttemptsService } from './attempts.service';
import { StartAttemptDto } from './dto/start-attempt.dto';
import { SubmitAnswerDto } from './dto/submit-answer.dto';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.gaurd';

interface JwtUser {
  userId: string;
  email: string;
  role: string;
}

interface RequestWithUser {
  user: JwtUser;
}

@ApiTags('Attempts')
@UseGuards(JwtAuthGuard)
@Controller('attempts')
export class AttemptsController {
  constructor(private readonly attemptsService: AttemptsService) {}

  @Post()
  startAttempt(@Body() dto: StartAttemptDto, @Req() req: RequestWithUser) {
    const user = req.user;
    return this.attemptsService.startAttempt(user.userId, dto.testId);
  }

  @Get()
  findMyAttempts(
    @Req() req: RequestWithUser,
    @Query('testId') testId?: string,
  ) {
    const user = req.user;
    return this.attemptsService.findMyAttempts(user.userId, testId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: RequestWithUser) {
    const user = req.user;
    return this.attemptsService.findOne(id, user.userId);
  }

  @Get(':id/questions')
  getQuestions(@Param('id') id: string, @Req() req: RequestWithUser) {
    const user = req.user;
    return this.attemptsService.getQuestionsForAttempt(id, user.userId);
  }

  @Post(':id/answers')
  submitAnswer(
    @Param('id') id: string,
    @Body() dto: SubmitAnswerDto,
    @Req() req: RequestWithUser,
  ) {
    const user = req.user;
    return this.attemptsService.submitAnswer(
      id,
      user.userId,
      dto.questionId,
      dto.selectedOptionId ?? null,
    );
  }

  @Post(':id/submit')
  submitAttempt(@Param('id') id: string, @Req() req: RequestWithUser) {
    const user = req.user;
    return this.attemptsService.submitAttempt(id, user.userId);
  }
}
