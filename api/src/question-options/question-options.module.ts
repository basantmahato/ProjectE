import { Module } from '@nestjs/common';
import { QuestionOptionsController } from './question-options.controller';
import { QuestionOptionsService } from './question-options.service';

@Module({
  controllers: [QuestionOptionsController],
  providers: [QuestionOptionsService],
  exports: [QuestionOptionsService],
})
export class QuestionOptionsModule {}
