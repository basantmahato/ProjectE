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
import { users } from '../database/schema/user.schema';
import { eq, and, inArray, sql } from 'drizzle-orm';
import { PLAN_FEATURES, type PlanId } from '../billing/plan-features';

@Injectable()
export class AttemptsService {
  async startAttempt(
    userId: string | null,
    deviceId: string | null,
    testId: string,
  ) {
    if (!userId && !deviceId) {
      throw new BadRequestException(
        'Provide userId (logged-in) or deviceId (guest) to start an attempt.',
      );
    }

    let plan: PlanId;
    if (userId) {
      const [user] = await db
        .select({ plan: users.plan })
        .from(users)
        .where(eq(users.id, userId));
      if (!user) {
        throw new NotFoundException('User not found');
      }
      plan = user.plan as PlanId;
    } else {
      plan = 'free';
    }

    const [test] = await db.select().from(tests).where(eq(tests.id, testId));
    if (!test) {
      throw new NotFoundException('Test not found');
    }
    if (!test.isPublished) {
      throw new BadRequestException('Test is not published');
    }

    const identityCondition = userId
      ? eq(testAttempts.userId, userId)
      : eq(testAttempts.deviceId, deviceId!);

    if (test.isMock) {
      const maxMock = PLAN_FEATURES[plan].maxMockAttemptsPerMonth;
      if (maxMock >= 0) {
        const monthStart = sql`date_trunc('month', now())`;
        const monthEnd = sql`date_trunc('month', now()) + interval '1 month'`;
        const [countResult] = await db
          .select({ count: sql<number>`count(*)::int` })
          .from(testAttempts)
          .innerJoin(tests, eq(testAttempts.testId, tests.id))
          .where(
            and(
              identityCondition,
              eq(tests.isMock, true),
              sql`${testAttempts.startedAt} >= ${monthStart}`,
              sql`${testAttempts.startedAt} < ${monthEnd}`,
            ),
          );
        const count = countResult?.count ?? 0;
        if (count >= maxMock) {
          throw new ForbiddenException({
            message: 'Free plan limited to 10 mock tests per month. Upgrade to Basic for more.',
            code: 'PLAN_UPGRADE_REQUIRED',
          });
        }
      }
    } else {
      const maxRegular = PLAN_FEATURES[plan].maxRegularAttemptsPerDay;
      if (maxRegular >= 0) {
        const dayStart = sql`date_trunc('day', now())`;
        const dayEnd = sql`date_trunc('day', now()) + interval '1 day'`;
        const [countResult] = await db
          .select({ count: sql<number>`count(*)::int` })
          .from(testAttempts)
          .innerJoin(tests, eq(testAttempts.testId, tests.id))
          .where(
            and(
              identityCondition,
              eq(tests.isMock, false),
              sql`${testAttempts.startedAt} >= ${dayStart}`,
              sql`${testAttempts.startedAt} < ${dayEnd}`,
            ),
          );
        const count = countResult?.count ?? 0;
        if (count >= maxRegular) {
          throw new ForbiddenException({
            message: 'Free plan limited to 2 tests per day. Upgrade to Basic for more.',
            code: 'PLAN_UPGRADE_REQUIRED',
          });
        }
      }
    }

    const [attempt] = await db
      .insert(testAttempts)
      .values({
        userId: userId ?? null,
        deviceId: deviceId ?? null,
        testId,
      })
      .returning();

    return attempt;
  }

  async findOne(
    attemptId: string,
    userId: string | null,
    deviceId: string | null,
  ) {
    const [attempt] = await db
      .select()
      .from(testAttempts)
      .where(eq(testAttempts.id, attemptId));

    if (!attempt) {
      throw new NotFoundException('Attempt not found');
    }
    const ownedByUser = userId && attempt.userId === userId;
    const ownedByGuest = deviceId && attempt.deviceId === deviceId;
    if (!ownedByUser && !ownedByGuest) {
      throw new ForbiddenException('Not your attempt');
    }

    return attempt;
  }

  async findMyAttempts(
    userId: string | null,
    deviceId: string | null,
    testId?: string,
  ) {
    const conditions = userId
      ? [eq(testAttempts.userId, userId)]
      : [eq(testAttempts.deviceId, deviceId!)];
    if (testId) {
      conditions.push(eq(testAttempts.testId, testId));
    }

    return db
      .select()
      .from(testAttempts)
      .where(and(...conditions))
      .orderBy(testAttempts.startedAt);
  }

  async getQuestionsForAttempt(
    attemptId: string,
    userId: string | null,
    deviceId: string | null,
  ) {
    const attempt = await this.findOne(attemptId, userId, deviceId);
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
    userId: string | null,
    deviceId: string | null,
    questionId: string,
    selectedOptionId: string | null,
  ) {
    const attempt = await this.findOne(attemptId, userId, deviceId);
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

    const existing = await db
      .select({ id: answers.id })
      .from(answers)
      .where(
        and(eq(answers.attemptId, attemptId), eq(answers.questionId, questionId)),
      );

    if (existing.length > 0) {
      const [updated] = await db
        .update(answers)
        .set({ selectedOptionId: selectedOptionId ?? null, isCorrect })
        .where(eq(answers.id, existing[0].id))
        .returning();
      return updated;
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

  async submitAttempt(
    attemptId: string,
    userId: string | null,
    deviceId: string | null,
  ) {
    const attempt = await this.findOne(attemptId, userId, deviceId);
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

    if (attempt.userId) {
      await db
        .update(users)
        .set({
          totalMarks: sql`COALESCE(${users.totalMarks}, 0) + ${score}`,
        })
        .where(eq(users.id, attempt.userId));
    }

    return updated;
  }

  async getAttemptResult(
    attemptId: string,
    userId: string | null,
    deviceId: string | null,
  ) {
    const attempt = await this.findOne(attemptId, userId, deviceId);
    if (!attempt.submittedAt) {
      throw new BadRequestException('Attempt not submitted yet');
    }

    const attemptAnswers = await db
      .select({
        questionId: answers.questionId,
        selectedOptionId: answers.selectedOptionId,
        isCorrect: answers.isCorrect,
      })
      .from(answers)
      .where(eq(answers.attemptId, attemptId));

    if (attemptAnswers.length === 0) {
      return [];
    }

    const questionIds = attemptAnswers.map((a) => a.questionId);
    const questions = await db
      .select({
        id: questionBank.id,
        questionText: questionBank.questionText,
        explanation: questionBank.explanation,
        marks: questionBank.marks,
      })
      .from(questionBank)
      .where(inArray(questionBank.id, questionIds));

    const questionMap = Object.fromEntries(questions.map((q) => [q.id, q]));

    const allOptions = await db
      .select({
        id: questionOptions.id,
        questionId: questionOptions.questionId,
        optionText: questionOptions.optionText,
        isCorrect: questionOptions.isCorrect,
      })
      .from(questionOptions)
      .where(inArray(questionOptions.questionId, questionIds));

    const correctByQuestion = new Map<string | null, { id: string; optionText: string }>();
    for (const opt of allOptions) {
      if (opt.isCorrect) {
        correctByQuestion.set(opt.questionId, { id: opt.id, optionText: opt.optionText });
      }
    }
    const selectedByOption = new Map<string, { optionText: string }>();
    for (const opt of allOptions) {
      selectedByOption.set(opt.id, { optionText: opt.optionText });
    }

    return attemptAnswers.map((a) => {
      const q = questionMap[a.questionId];
      const correct = correctByQuestion.get(a.questionId);
      const selectedText = a.selectedOptionId
        ? selectedByOption.get(a.selectedOptionId)?.optionText ?? null
        : null;
      return {
        questionId: a.questionId,
        questionText: q?.questionText ?? '',
        explanation: q?.explanation ?? null,
        marks: q?.marks ?? null,
        selectedOptionId: a.selectedOptionId ?? null,
        selectedOptionText: selectedText,
        isCorrect: a.isCorrect ?? false,
        correctOptionId: correct?.id ?? null,
        correctOptionText: correct?.optionText ?? null,
      };
    });
  }
}
