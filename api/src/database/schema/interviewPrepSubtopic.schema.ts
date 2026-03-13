import { integer, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { interviewPrepTopics } from './interviewPrepTopic.schema';

export const interviewPrepSubtopics = pgTable('interview_prep_subtopics', {
  id: uuid('id').defaultRandom().primaryKey(),
  topicId: uuid('topic_id')
    .references(() => interviewPrepTopics.id, { onDelete: 'cascade' })
    .notNull(),
  name: text('name').notNull(),
  explanation: text('explanation'),
  orderIndex: integer('order_index').default(0),
  createdAt: timestamp('created_at').defaultNow(),
});
