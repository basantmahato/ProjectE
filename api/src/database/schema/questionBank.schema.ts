import { integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { topics } from "./topics.schema";

export const questionBank = pgTable("question_bank", {
  id: uuid("id").defaultRandom().primaryKey(),

  topicId: uuid("topic_id")
    .references(() => topics.id)
    .notNull(),

  questionText: text("question_text").notNull(),

  difficulty: text("difficulty"), // easy | medium | hard

  marks: integer("marks").default(1),

  negativeMarks: integer("negative_marks").default(0),

  explanation: text("explanation"),

  createdAt: timestamp("created_at").defaultNow()
});