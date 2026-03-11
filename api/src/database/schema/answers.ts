import { pgTable, uuid, boolean } from "drizzle-orm/pg-core";
import { questionOptions } from "./questionOption.schema";
import { testAttempts } from "./testAttempts";
import { questionBank } from "./questionBank.schema";

export const answers = pgTable("answers", {
    id: uuid("id").defaultRandom().primaryKey(),
  
    attemptId: uuid("attempt_id")
      .references(() => testAttempts.id)
      .notNull(),
  
    questionId: uuid("question_id")
      .references(() => questionBank.id)
      .notNull(),
  
    selectedOptionId: uuid("selected_option_id")
      .references(() => questionOptions.id),
  
    isCorrect: boolean("is_correct")
  });