import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { MockTestsController } from './mock-tests.controller';
import { MockTestsPublicController } from './mock-tests-public.controller';
import { TestsModule } from '../tests/tests.module';

@Module({
  imports: [AuthModule, TestsModule],
  controllers: [MockTestsPublicController, MockTestsController],
})
export class MockTestsModule {}
