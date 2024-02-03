import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";
import { users } from "@/lib/db/schema/users";
import { InferSelectModel } from "drizzle-orm";

export const sessions = sqliteTable("sessions", {
  id: text("id").notNull().primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  expiresAt: integer("expires_at").notNull(),
});

export type Session = InferSelectModel<typeof sessions>;
