import { integer, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

export const subjects = pgTable('subjects', {
  id: uuid('id').defaultRandom().primaryKey(),
  slug: text('slug').notNull().unique(),
  name: text('name').notNull(),
  examType: text('exam_type'), // JEE UPSC GATE
  createdAt: timestamp('created_at').defaultNow(),
});
