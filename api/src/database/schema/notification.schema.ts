import { pgTable, uuid, varchar, timestamp, text, primaryKey } from "drizzle-orm/pg-core";
import { users } from "./user.schema";

export const notifications = pgTable("notifications", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  body: text("body"),
  type: varchar("type", { length: 50 }).default("info"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/** Which user has read which notification. Used for in-app read status. */
export const userNotificationRead = pgTable(
  "user_notification_read",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    notificationId: uuid("notification_id")
      .notNull()
      .references(() => notifications.id, { onDelete: "cascade" }),
    readAt: timestamp("read_at").defaultNow().notNull(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.notificationId] })]
);

export const userPushTokens = pgTable("user_push_tokens", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expoPushToken: varchar("expo_push_token", { length: 512 }).notNull().unique(),
  deviceId: varchar("device_id", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
