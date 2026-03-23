import { pgTable, uuid, boolean, index } from 'drizzle-orm/pg-core';
import { questionOptions } from './questionOption.schema';
import { testAttempts } from './testAttempts';
import { questionBank } from './questionBank.schema';

export const answers = pgTable(
  'answers',
  {
    id: uuid('id').defaultRandom().primaryKey(),

    attemptId: uuid('attempt_id')
      .references(() => testAttempts.id, { onDelete: 'cascade' })
      .notNull(),

    questionId: uuid('question_id')
      .references(() => questionBank.id, { onDelete: 'cascade' })
      .notNull(),

    selectedOptionId: uuid('selected_option_id').references(
      () => questionOptions.id,
      { onDelete: 'set null' },
    ),

    isCorrect: boolean('is_correct'),
  },
  (t) => [
    index('idx_answers_attempt_id').on(t.attemptId),
    index('idx_answers_question_id').on(t.questionId),
    index('idx_answers_attempt_question').on(t.attemptId, t.questionId),
  ],
);
