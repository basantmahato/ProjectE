import { Module } from '@nestjs/common';
import { TestsController } from './tests.controller';
import { TestsPublicController } from './tests-public.controller';
import { TestsService } from './tests.service';
import { TestQuestionsService } from './test-questions.service';

@Module({
  controllers: [TestsPublicController, TestsController],
  providers: [TestsService, TestQuestionsService],
  exports: [TestsService, TestQuestionsService],
})
export class TestsModule {}
