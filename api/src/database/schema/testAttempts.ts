import {
  pgTable,
  uuid,
  timestamp,
  integer,
  varchar,
  index,
} from 'drizzle-orm/pg-core';
import { tests } from './test.schema';
import { users } from './user.schema';

export const testAttempts = pgTable(
  'test_attempts',
  {
    id: uuid('id').defaultRandom().primaryKey(),

    userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
    deviceId: varchar('device_id', { length: 255 }),

    testId: uuid('test_id')
      .references(() => tests.id, { onDelete: 'cascade' })
      .notNull(),

    startedAt: timestamp('started_at').defaultNow(),
    submittedAt: timestamp('submitted_at'),
    score: integer('score'),
  },
  (t) => [
    index('idx_test_attempts_user_id').on(t.userId),
    index('idx_test_attempts_test_id').on(t.testId),
    index('idx_test_attempts_user_started').on(t.userId, t.startedAt),
    index('idx_test_attempts_device_started').on(t.deviceId, t.startedAt),
  ],
);
