import { generateId } from "@/lib/id";
import { pgTable, timestamp, varchar } from "drizzle-orm/pg-core";

export const organisations = pgTable("organisations", {
  id: varchar("id")
    .primaryKey()
    .$defaultFn(() => generateId("organisation")),
  name: varchar("name").notNull().unique(),
  slug: varchar("slug").notNull().unique(),
  createdAt: timestamp("created_at", { mode: "date", withTimezone: true }).notNull().defaultNow(),
});
