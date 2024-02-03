import { generateId } from "@/lib/id";
import { InferSelectModel } from "drizzle-orm";
import { sqliteTable, text } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: text("id")
    .notNull()
    .primaryKey()
    .$defaultFn(() => generateId("user")),
  email: text("email").notNull().unique(),
  hashedPassword: text("hashed_password"),
});

export type User = InferSelectModel<typeof users>;
