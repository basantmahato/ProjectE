import { Injectable, NotFoundException } from '@nestjs/common';
import { db } from '../database/db';
import { testQuestions } from '../database/schema/testQuestions.schema';
import { questionBank } from '../database/schema/questionBank.schema';
import { questionOptions } from '../database/schema/questionOption.schema';
import { eq, and, inArray } from 'drizzle-orm';

@Injectable()
export class TestQuestionsService {
  async addQuestion(testId: string, questionId: string, questionOrder?: number) {
    const row = await db
      .insert(testQuestions)
      .values({
        testId,
        questionId,
        questionOrder: questionOrder ?? null,
      })
      .returning();

    return row[0];
  }

  async findByTestId(testId: string) {
    return db
      .select()
      .from(testQuestions)
      .where(eq(testQuestions.testId, testId))
      .orderBy(testQuestions.questionOrder);
  }

  async findByTestIdWithQuestions(testId: string) {
    return db
      .select({
        id: testQuestions.id,
        testId: testQuestions.testId,
        questionId: testQuestions.questionId,
        questionOrder: testQuestions.questionOrder,
        questionText: questionBank.questionText,
        difficulty: questionBank.difficulty,
        marks: questionBank.marks,
        negativeMarks: questionBank.negativeMarks,
      })
      .from(testQuestions)
      .innerJoin(questionBank, eq(testQuestions.questionId, questionBank.id))
      .where(eq(testQuestions.testId, testId))
      .orderBy(testQuestions.questionOrder);
  }

  async findByTestIdWithQuestionsAndOptions(testId: string) {
    const questions = await db
      .select({
        id: testQuestions.id,
        testId: testQuestions.testId,
        questionId: questionBank.id,
        questionOrder: testQuestions.questionOrder,
        questionText: questionBank.questionText,
        difficulty: questionBank.difficulty,
        marks: questionBank.marks,
        negativeMarks: questionBank.negativeMarks,
        explanation: questionBank.explanation,
      })
      .from(testQuestions)
      .innerJoin(questionBank, eq(testQuestions.questionId, questionBank.id))
      .where(eq(testQuestions.testId, testId))
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

  async removeFromTest(testId: string, id: string) {
    const deleted = await db
      .delete(testQuestions)
      .where(and(eq(testQuestions.id, id), eq(testQuestions.testId, testId)))
      .returning();

    if (!deleted.length) {
      throw new NotFoundException('Test question not found');
    }

    return { message: 'Question removed from test successfully' };
  }
}
