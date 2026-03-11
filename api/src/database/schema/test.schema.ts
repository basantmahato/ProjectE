import { boolean, integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const tests = pgTable("tests", {
  id: uuid("id").defaultRandom().primaryKey(),

  title: text("title").notNull(),

  description: text("description"),

  durationMinutes: integer("duration_minutes").notNull(),

  totalMarks: integer("total_marks").notNull(),

  isPublished: boolean("is_published").default(false),

  createdAt: timestamp("created_at").defaultNow()
});