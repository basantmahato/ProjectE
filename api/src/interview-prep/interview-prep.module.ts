import { Module } from '@nestjs/common';
import { InterviewPrepController } from './interview-prep.controller';
import { InterviewPrepPublicController } from './interview-prep-public.controller';
import { InterviewPrepService } from './interview-prep.service';

@Module({
  controllers: [InterviewPrepPublicController, InterviewPrepController],
  providers: [InterviewPrepService],
  exports: [InterviewPrepService],
})
export class InterviewPrepModule {}
