import { users } from "@/lib/db/schema/users";
import { InferSelectModel } from "drizzle-orm";
import { pgTable, timestamp, varchar } from "drizzle-orm/pg-core";

export const sessions = pgTable("sessions", {
  id: varchar("id").notNull().primaryKey(),
  userId: varchar("user_id")
    .notNull()
    .references(() => users.id),
  expiresAt: timestamp("expires_at", { mode: "date", withTimezone: true }).notNull(),
});

export type Session = InferSelectModel<typeof sessions>;
