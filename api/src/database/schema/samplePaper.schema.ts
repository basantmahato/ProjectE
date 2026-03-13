import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

export const samplePapers = pgTable('sample_papers', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow(),
});
