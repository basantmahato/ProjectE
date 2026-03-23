import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  text,
  primaryKey,
  index,
} from 'drizzle-orm/pg-core';
import { users } from './user.schema';

export const notifications = pgTable(
  'notifications',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
    title: varchar('title', { length: 255 }).notNull(),
    body: text('body'),
    type: varchar('type', { length: 50 }).default('info'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (t) => [index('idx_notifications_user_id').on(t.userId)],
);

/** Which user has read which notification. Used for in-app read status. */
export const userNotificationRead = pgTable(
  'user_notification_read',
  {
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    notificationId: uuid('notification_id')
      .notNull()
      .references(() => notifications.id, { onDelete: 'cascade' }),
    readAt: timestamp('read_at').defaultNow().notNull(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.notificationId] })],
);

export const userPushTokens = pgTable('user_push_tokens', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  expoPushToken: varchar('expo_push_token', { length: 512 }).notNull().unique(),
  deviceId: varchar('device_id', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

/** Web Push subscriptions for browser notifications (VAPID). */
export const userWebPushSubscriptions = pgTable('user_web_push_subscriptions', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  endpoint: varchar('endpoint', { length: 1024 }).notNull().unique(),
  p256dh: varchar('p256dh', { length: 512 }).notNull(),
  auth: varchar('auth', { length: 256 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
