import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { DashbaordModule } from './dashbaord/dashbaord.module';
import { SubjectsModule } from './subjects/subjects.module';
import { TopicsModule } from './topics/topics.module';
import { QuestionBankModule } from './question-bank/question-bank.module';
import { QuestionOptionsModule } from './question-options/question-options.module';
import { TestsModule } from './tests/tests.module';
import { AttemptsModule } from './attempts/attempts.module';

@Module({
  controllers: [AppController],
  providers: [AppService],
  imports: [
    UsersModule,
    AuthModule,
    DashbaordModule,
    SubjectsModule,
    TopicsModule,
    QuestionBankModule,
    QuestionOptionsModule,
    TestsModule,
    AttemptsModule,
  ],
})
export class AppModule {}
