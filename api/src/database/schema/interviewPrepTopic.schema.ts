import { integer, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { interviewPrepJobRoles } from './interviewPrepJobRole.schema';

export const interviewPrepTopics = pgTable('interview_prep_topics', {
  id: uuid('id').defaultRandom().primaryKey(),
  jobRoleId: uuid('job_role_id')
    .references(() => interviewPrepJobRoles.id, { onDelete: 'cascade' })
    .notNull(),
  name: text('name').notNull(),
  explanation: text('explanation'),
  orderIndex: integer('order_index').default(0),
  createdAt: timestamp('created_at').defaultNow(),
});
