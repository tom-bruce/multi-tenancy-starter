import { randomUUID } from "crypto";
import { sqliteTable, text } from "drizzle-orm/sqlite-core";

export const tests = sqliteTable("tests", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  message: text("message").notNull(),
});
