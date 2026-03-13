import { boolean, pgTable, text, uuid } from 'drizzle-orm/pg-core';
import { samplePaperQuestions } from './samplePaperQuestion.schema';

export const samplePaperQuestionOptions = pgTable('sample_paper_question_options', {
  id: uuid('id').defaultRandom().primaryKey(),
  samplePaperQuestionId: uuid('sample_paper_question_id')
    .references(() => samplePaperQuestions.id, { onDelete: 'cascade' })
    .notNull(),
  optionText: text('option_text').notNull(),
  isCorrect: boolean('is_correct').default(false),
});
