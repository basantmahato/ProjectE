import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { TestsController } from './tests.controller';
import { TestsPublicController } from './tests-public.controller';
import { TestsService } from './tests.service';
import { TestQuestionsService } from './test-questions.service';

@Module({
  imports: [AuthModule],
  controllers: [TestsPublicController, TestsController],
  providers: [TestsService, TestQuestionsService],
  exports: [TestsService, TestQuestionsService],
})
export class TestsModule {}
