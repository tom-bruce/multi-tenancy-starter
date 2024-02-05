import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { organisations } from "./organisations";
import { users } from "./users";
import { generateId } from "@/lib/id";

export const members = sqliteTable("members", {
  id: text("id")
    .notNull()
    .primaryKey()
    .$defaultFn(() => generateId("member")),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  organisationId: text("organisation_id")
    .notNull()
    .references(() => organisations.id),
});
