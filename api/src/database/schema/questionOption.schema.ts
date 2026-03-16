import { pgTable, text, uuid, boolean, index } from "drizzle-orm/pg-core";
import { questionBank } from "./questionBank.schema";

export const questionOptions = pgTable(
  "question_options",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    questionId: uuid("question_id")
      .references(() => questionBank.id, { onDelete: "cascade" })
      .notNull(),

    optionText: text("option_text").notNull(),

    isCorrect: boolean("is_correct").default(false),
  },
  (t) => [index("idx_question_options_question_id").on(t.questionId)],
);