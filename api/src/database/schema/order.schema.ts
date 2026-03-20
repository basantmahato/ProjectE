import { pgTable, uuid, varchar, timestamp } from "drizzle-orm/pg-core";
import { users } from "./user.schema";

export const orders = pgTable("orders", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  planId: varchar("plan_id", { length: 50 }).notNull(),
  razorpayOrderId: varchar("razorpay_order_id", { length: 255 }).notNull().unique(),
  status: varchar("status", { length: 50 }).notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
