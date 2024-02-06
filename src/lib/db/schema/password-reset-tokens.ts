import { users } from "./users";
import { pgTable, varchar } from "drizzle-orm/pg-core";
import { timestamp } from "drizzle-orm/pg-core";

export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: varchar("id").notNull().primaryKey(),
  userId: varchar("user_id")
    .notNull()
    .references(() => users.id),
  expiresAt: timestamp("expires_at", { mode: "date", withTimezone: true }).notNull(),
});
