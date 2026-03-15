import { integer, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { topics } from './topics.schema';

export const notes = pgTable('notes', {
  id: uuid('id').defaultRandom().primaryKey(),
  topicId: uuid('topic_id')
    .references(() => topics.id, { onDelete: 'cascade' })
    .notNull(),
  slug: text('slug').notNull().unique(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  orderIndex: integer('order_index'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
