import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

export const interviewPrepJobRoles = pgTable('interview_prep_job_roles', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow(),
});
