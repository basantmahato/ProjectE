import { pgTable, uuid, timestamp, integer, varchar } from "drizzle-orm/pg-core";
import { tests } from "./test.schema";
import { users } from "./user.schema";

export const testAttempts = pgTable("test_attempts", {
  id: uuid("id").defaultRandom().primaryKey(),

  userId: uuid("user_id").references(() => users.id),
  deviceId: varchar("device_id", { length: 255 }),

  testId: uuid("test_id")
    .references(() => tests.id)
    .notNull(),

  startedAt: timestamp("started_at").defaultNow(),
  submittedAt: timestamp("submitted_at"),
  score: integer("score"),
});   