import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { SubjectsModule } from './subjects/subjects.module';
import { TopicsModule } from './topics/topics.module';
import { QuestionBankModule } from './question-bank/question-bank.module';
import { QuestionOptionsModule } from './question-options/question-options.module';
import { TestsModule } from './tests/tests.module';
import { MockTestsModule } from './mock-tests/mock-tests.module';
import { AttemptsModule } from './attempts/attempts.module';
import { SamplePapersModule } from './sample-papers/sample-papers.module';
import { InterviewPrepModule } from './interview-prep/interview-prep.module';
import { BlogModule } from './blog/blog.module';
import { BillingModule } from './billing/billing.module';
import { NotificationsModule } from './notifications/notifications.module';
import { NotesModule } from './notes/notes.module';

@Module({
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    UsersModule,
    AuthModule,
    BillingModule,
    NotificationsModule,
    DashboardModule,
    SubjectsModule,
    TopicsModule,
    QuestionBankModule,
    QuestionOptionsModule,
    TestsModule,
    MockTestsModule,
    AttemptsModule,
    SamplePapersModule,
    InterviewPrepModule,
    BlogModule,
    NotesModule,
  ],
})
export class AppModule {}
