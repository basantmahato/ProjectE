import { pgTable, text, integer, uuid } from "drizzle-orm/pg-core";
import { tests } from "./test.schema";

export const questions = pgTable("questions", {
    id: uuid("id").defaultRandom().primaryKey(),
  
    testId: uuid("test_id")
      .references(() => tests.id)
      .notNull(),
  
    questionText: text("question_text").notNull(),
  
    marks: integer("marks").default(1),
  
    negativeMarks: integer("negative_marks").default(0),
  
    explanation: text("explanation")
  });   