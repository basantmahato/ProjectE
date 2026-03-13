import { Module } from '@nestjs/common';
import { MockTestsController } from './mock-tests.controller';
import { MockTestsPublicController } from './mock-tests-public.controller';
import { TestsModule } from '../tests/tests.module';

@Module({
  imports: [TestsModule],
  controllers: [MockTestsPublicController, MockTestsController],
})
export class MockTestsModule {}
