import { pgTable, uuid, integer } from "drizzle-orm/pg-core";
import { tests } from "./test.schema";
import { questionBank } from "./questionBank.schema";

export const testQuestions = pgTable("test_questions", {
    id: uuid("id").defaultRandom().primaryKey(),
  
    testId: uuid("test_id")
      .references(() => tests.id)
      .notNull(),
  
    questionId: uuid("question_id")
      .references(() => questionBank.id)
      .notNull(),
  
    questionOrder: integer("question_order")
  });