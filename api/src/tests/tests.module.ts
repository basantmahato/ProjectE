import { Module } from '@nestjs/common';
import { TestsController } from './tests.controller';
import { TestsPublicController } from './tests-public.controller';
import { TestsService } from './tests.service';
import { TestQuestionsService } from './test-questions.service';

@Module({
  controllers: [TestsController, TestsPublicController],
  providers: [TestsService, TestQuestionsService],
})
export class TestsModule {}
