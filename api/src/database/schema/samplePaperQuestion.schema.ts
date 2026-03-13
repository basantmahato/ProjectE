import { integer, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { samplePaperTopics } from './samplePaperTopic.schema';

export const samplePaperQuestions = pgTable('sample_paper_questions', {
  id: uuid('id').defaultRandom().primaryKey(),
  samplePaperTopicId: uuid('sample_paper_topic_id')
    .references(() => samplePaperTopics.id, { onDelete: 'cascade' })
    .notNull(),
  questionText: text('question_text').notNull(),
  explanation: text('explanation'),
  orderIndex: integer('order_index').default(0),
  createdAt: timestamp('created_at').defaultNow(),
});
