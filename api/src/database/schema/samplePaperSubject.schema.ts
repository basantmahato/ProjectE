import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { samplePapers } from './samplePaper.schema';

export const samplePaperSubjects = pgTable('sample_paper_subjects', {
  id: uuid('id').defaultRandom().primaryKey(),
  samplePaperId: uuid('sample_paper_id')
    .references(() => samplePapers.id, { onDelete: 'cascade' })
    .notNull(),
  name: text('name').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});
