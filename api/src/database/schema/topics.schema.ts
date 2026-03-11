import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { subjects } from "./subjects.schema";

    export const topics = pgTable("topics", {
    id: uuid("id").defaultRandom().primaryKey(),
  
    subjectId: uuid("subject_id")
      .references(() => subjects.id)
      .notNull(),
  
    name: text("name").notNull(),
  
    createdAt: timestamp("created_at").defaultNow()
  });