import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { samplePaperSubjects } from './samplePaperSubject.schema';

export const samplePaperTopics = pgTable('sample_paper_topics', {
  id: uuid('id').defaultRandom().primaryKey(),
  samplePaperSubjectId: uuid('sample_paper_subject_id')
    .references(() => samplePaperSubjects.id, { onDelete: 'cascade' })
    .notNull(),
  name: text('name').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});
