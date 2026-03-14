import { pgTable, uuid, timestamp, varchar } from 'drizzle-orm/pg-core';
import { users } from './user.schema';
import { samplePapers } from './samplePaper.schema';

export const samplePaperViews = pgTable('sample_paper_views', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
  deviceId: varchar('device_id', { length: 255 }),
  samplePaperId: uuid('sample_paper_id')
    .references(() => samplePapers.id, { onDelete: 'cascade' })
    .notNull(),
  viewedAt: timestamp('viewed_at').defaultNow().notNull(),
});
