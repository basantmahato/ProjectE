import {
  BadRequestException,
  Controller,
  Get,
  Headers,
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
import { OptionalJwtGuard } from 'src/auth/optional-jwt.guard';

interface JwtUser {
  userId: string;
  email: string;
  role: string;
}

interface RequestWithOptionalUser {
  user?: JwtUser | null;
}

function getIdentity(
  req: RequestWithOptionalUser,
  deviceId: string | undefined,
): { userId: string | null; deviceId: string | null } {
  const userId = req.user?.userId ?? null;
  if (userId) return { userId, deviceId: null };
  const did = deviceId?.trim() || null;
  if (did) return { userId: null, deviceId: did };
  return { userId: null, deviceId: null };
}

function requireIdentity(
  req: RequestWithOptionalUser,
  deviceId: string | undefined,
): { userId: string | null; deviceId: string | null } {
  const identity = getIdentity(req, deviceId);
  if (identity.userId || identity.deviceId) return identity;
  throw new BadRequestException(
    'Provide Authorization header (logged-in) or X-Device-ID header (guest) to use attempts.',
  );
}

@ApiTags('Attempts')
@UseGuards(OptionalJwtGuard)
@Controller('attempts')
export class AttemptsController {
  constructor(private readonly attemptsService: AttemptsService) {}

  @Post()
  startAttempt(
    @Body() dto: StartAttemptDto,
    @Req() req: RequestWithOptionalUser,
    @Headers('x-device-id') deviceId?: string,
  ) {
    const { userId, deviceId: did } = requireIdentity(req, deviceId);
    return this.attemptsService.startAttempt(userId, did, dto.testId);
  }

  @Get()
  findMyAttempts(
    @Req() req: RequestWithOptionalUser,
    @Headers('x-device-id') deviceId?: string,
    @Query('testId') testId?: string,
  ) {
    const { userId, deviceId: did } = requireIdentity(req, deviceId);
    return this.attemptsService.findMyAttempts(userId, did, testId);
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @Req() req: RequestWithOptionalUser,
    @Headers('x-device-id') deviceId?: string,
  ) {
    const { userId, deviceId: did } = requireIdentity(req, deviceId);
    return this.attemptsService.findOne(id, userId, did);
  }

  @Get(':id/questions')
  getQuestions(
    @Param('id') id: string,
    @Req() req: RequestWithOptionalUser,
    @Headers('x-device-id') deviceId?: string,
  ) {
    const { userId, deviceId: did } = requireIdentity(req, deviceId);
    return this.attemptsService.getQuestionsForAttempt(id, userId, did);
  }

  @Post(':id/answers')
  submitAnswer(
    @Param('id') id: string,
    @Body() dto: SubmitAnswerDto,
    @Req() req: RequestWithOptionalUser,
    @Headers('x-device-id') deviceId?: string,
  ) {
    const { userId, deviceId: did } = requireIdentity(req, deviceId);
    return this.attemptsService.submitAnswer(
      id,
      userId,
      did,
      dto.questionId,
      dto.selectedOptionId ?? null,
    );
  }

  @Post(':id/submit')
  submitAttempt(
    @Param('id') id: string,
    @Req() req: RequestWithOptionalUser,
    @Headers('x-device-id') deviceId?: string,
  ) {
    const { userId, deviceId: did } = requireIdentity(req, deviceId);
    return this.attemptsService.submitAttempt(id, userId, did);
  }
}
