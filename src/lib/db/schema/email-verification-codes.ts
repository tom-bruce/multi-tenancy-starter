import { generateId } from "@/lib/id";
import { users } from "./users";
import { pgTable, varchar } from "drizzle-orm/pg-core";
import { timestamp } from "drizzle-orm/pg-core";

export const emailVerificationCodes = pgTable("email_verification_codes", {
  id: varchar("id")
    .primaryKey()
    .$defaultFn(() => generateId("invite")),
  userId: varchar("user_id")
    .notNull()
    .unique()
    .references(() => users.id),
  email: varchar("email").notNull(),
  code: varchar("code").notNull(),
  expiresAt: timestamp("expires_at", { mode: "date" }).notNull(),
});
