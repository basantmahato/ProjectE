import { pgTable, uuid, integer, index } from "drizzle-orm/pg-core";
import { tests } from "./test.schema";
import { questionBank } from "./questionBank.schema";

export const testQuestions = pgTable(
  "test_questions",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    testId: uuid("test_id")
      .references(() => tests.id, { onDelete: "cascade" })
      .notNull(),

    questionId: uuid("question_id")
      .references(() => questionBank.id, { onDelete: "cascade" })
      .notNull(),

    questionOrder: integer("question_order"),
  },
  (t) => [index("idx_test_questions_test_id").on(t.testId)],
);