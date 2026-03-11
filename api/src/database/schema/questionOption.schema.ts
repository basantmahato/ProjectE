import { pgTable, text, uuid, boolean } from "drizzle-orm/pg-core";
import { questionBank } from "./questionBank.schema";

export const questionOptions = pgTable("question_options", {
    id: uuid("id").defaultRandom().primaryKey(),
  
    questionId: uuid("question_id")
      .references(() => questionBank.id)
      .notNull(),
  
    optionText: text("option_text").notNull(),
  
    isCorrect: boolean("is_correct").default(false)
  });