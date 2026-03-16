import { pgTable, text, timestamp, uuid, unique } from "drizzle-orm/pg-core";
import { subjects } from "./subjects.schema";

export const topics = pgTable(
  "topics",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    subjectId: uuid("subject_id")
      .references(() => subjects.id, { onDelete: "cascade" })
      .notNull(),
    slug: text("slug").notNull(),
    name: text("name").notNull(),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (t) => [unique("topics_subject_slug_unique").on(t.subjectId, t.slug)]
);