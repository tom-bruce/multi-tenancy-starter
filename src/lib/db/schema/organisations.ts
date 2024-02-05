import { generateId } from "@/lib/id";
import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { users } from "./users";

export const organisations = sqliteTable("organisations", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => generateId("organisation")),
  name: text("name").notNull().unique(),
  slug: text("slug").notNull().unique(),
});
