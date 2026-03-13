import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { db } from '../database/db';
import { testAttempts } from '../database/schema/testAttempts';
import { answers } from '../database/schema/answers';
import { testQuestions } from '../database/schema/testQuestions.schema';
import { questionBank } from '../database/schema/questionBank.schema';
import { questionOptions } from '../database/schema/questionOption.schema';
import { tests } from '../database/schema/test.schema';
import { eq, and, inArray } from 'drizzle-orm';

@Injectable()
export class AttemptsService {
  async startAttempt(userId: string, testId: string) {
    const test = await db.select().from(tests).where(eq(tests.id, testId));
    if (!test.length) {
      throw new NotFoundException('Test not found');
    }
    if (!test[0].isPublished) {
      throw new BadRequestException('Test is not published');
    }

    const [attempt] = await db
      .insert(testAttempts)
      .values({ userId, testId })
      .returning();

    return attempt;
  }

  async findOne(attemptId: string, userId: string) {
    const [attempt] = await db
      .select()
      .from(testAttempts)
      .where(eq(testAttempts.id, attemptId));

    if (!attempt) {
      throw new NotFoundException('Attempt not found');
    }
    if (attempt.userId !== userId) {
      throw new ForbiddenException('Not your attempt');
    }

    return attempt;
  }

  async findMyAttempts(userId: string, testId?: string) {
    const conditions = [eq(testAttempts.userId, userId)];
    if (testId) {
      conditions.push(eq(testAttempts.testId, testId));
    }

    return db
      .select()
      .from(testAttempts)
      .where(and(...conditions))
      .orderBy(testAttempts.startedAt);
  }

  async getQuestionsForAttempt(attemptId: string, userId: string) {
    const attempt = await this.findOne(attemptId, userId);
    if (attempt.submittedAt) {
      throw new BadRequestException('Attempt already submitted');
    }

    const questions = await db
      .select({
        testQuestionId: testQuestions.id,
        questionId: questionBank.id,
        questionOrder: testQuestions.questionOrder,
        questionText: questionBank.questionText,
        difficulty: questionBank.difficulty,
        marks: questionBank.marks,
        negativeMarks: questionBank.negativeMarks,
      })
      .from(testQuestions)
      .innerJoin(questionBank, eq(testQuestions.questionId, questionBank.id))
      .where(eq(testQuestions.testId, attempt.testId))
      .orderBy(testQuestions.questionOrder);

    if (!questions.length) {
      return questions.map((q) => ({ ...q, options: [] }));
    }

    const questionIds = questions.map((q) => q.questionId);
    const options = await db
      .select()
      .from(questionOptions)
      .where(inArray(questionOptions.questionId, questionIds));

    const optionsByQuestion = options.reduce<Record<string, typeof options>>(
      (acc, opt) => {
        const id = opt.questionId;
        if (!acc[id]) acc[id] = [];
        acc[id].push(opt);
        return acc;
      },
      {},
    );

    return questions.map((q) => ({
      ...q,
      options: optionsByQuestion[q.questionId] ?? [],
    }));
  }

  async submitAnswer(
    attemptId: string,
    userId: string,
    questionId: string,
    selectedOptionId: string | null,
  ) {
    const attempt = await this.findOne(attemptId, userId);
    if (attempt.submittedAt) {
      throw new BadRequestException('Attempt already submitted');
    }

    let isCorrect: boolean | null = null;
    if (selectedOptionId) {
      const [opt] = await db
        .select({ isCorrect: questionOptions.isCorrect })
        .from(questionOptions)
        .where(
          and(
            eq(questionOptions.id, selectedOptionId),
            eq(questionOptions.questionId, questionId),
          ),
        );
      if (opt) {
        isCorrect = opt.isCorrect ?? false;
      }
    }

    const [answer] = await db
      .insert(answers)
      .values({
        attemptId,
        questionId,
        selectedOptionId: selectedOptionId ?? null,
        isCorrect,
      })
      .returning();

    return answer;
  }

  async submitAttempt(attemptId: string, userId: string) {
    const attempt = await this.findOne(attemptId, userId);
    if (attempt.submittedAt) {
      throw new BadRequestException('Attempt already submitted');
    }

    const attemptAnswers = await db
      .select({
        isCorrect: answers.isCorrect,
        questionId: answers.questionId,
      })
      .from(answers)
      .where(eq(answers.attemptId, attemptId));

    const questionIds = attemptAnswers.map((a) => a.questionId);
    const questionMarks =
      questionIds.length > 0
        ? await db
            .select({ id: questionBank.id, marks: questionBank.marks })
            .from(questionBank)
            .where(inArray(questionBank.id, questionIds))
        : [];

    const marksMap = Object.fromEntries(
      questionMarks.map((q) => [q.id, q.marks ?? 0]),
    );

    let score = 0;
    for (const a of attemptAnswers) {
      if (a.isCorrect) {
        score += marksMap[a.questionId] ?? 0;
      }
    }

    const [updated] = await db
      .update(testAttempts)
      .set({ submittedAt: new Date(), score })
      .where(eq(testAttempts.id, attemptId))
      .returning();

    return updated;
  }
}
