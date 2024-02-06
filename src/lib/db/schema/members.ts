import { timestamp } from "drizzle-orm/pg-core";
import { organisations } from "./organisations";
import { users } from "./users";
import { generateId } from "@/lib/id";
import { pgTable, varchar } from "drizzle-orm/pg-core";

export const members = pgTable("members", {
  id: varchar("id")
    .primaryKey()
    .notNull()
    .$defaultFn(() => generateId("member")),
  userId: varchar("user_id")
    .notNull()
    .references(() => users.id),
  organisationId: varchar("organisation_id")
    .notNull()
    .references(() => organisations.id),
  createdAt: timestamp("created_at", { mode: "date", withTimezone: true }).notNull().defaultNow(),
});
