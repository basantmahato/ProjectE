import { pgTable, uuid, varchar, timestamp, pgEnum, integer } from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", ["user", "admin"]);

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),

  email: varchar("email", { length: 255 })
    .notNull()
    .unique(),

  password: varchar("password", { length: 255 }).notNull(),

  name: varchar("name", { length: 255 }),

  role: roleEnum("role").notNull().default("user"),

  totalMarks: integer("total_marks").notNull().default(0),

  createdAt: timestamp("created_at").defaultNow()
});