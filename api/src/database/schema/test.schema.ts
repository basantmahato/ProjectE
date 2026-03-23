import {
  boolean,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
  index,
} from 'drizzle-orm/pg-core';

export const tests = pgTable(
  'tests',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    slug: text('slug').notNull().unique(),
    title: text('title').notNull(),
    description: text('description'),

    durationMinutes: integer('duration_minutes').notNull(),

    totalMarks: integer('total_marks').notNull(),

    isPublished: boolean('is_published').default(false),

    isMock: boolean('is_mock').default(false),

    scheduledAt: timestamp('scheduled_at'),

    expiresAt: timestamp('expires_at'),

    createdAt: timestamp('created_at').defaultNow(),
  },
  (t) => [
    index('idx_tests_published_mock').on(t.isPublished, t.isMock),
    index('idx_tests_scheduled_at').on(t.scheduledAt),
  ],
);
