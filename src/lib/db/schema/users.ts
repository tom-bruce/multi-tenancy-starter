import { generateId } from "@/lib/id";
import { InferSelectModel } from "drizzle-orm";
import { pgTable, timestamp, varchar } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: varchar("id")
    .notNull()
    .primaryKey()
    .$defaultFn(() => generateId("user")),
  email: varchar("email").notNull().unique(),
  hashedPassword: varchar("hashed_password"),
  createdAt: timestamp("created_at", { mode: "date", withTimezone: true }).notNull().defaultNow(),
});

export type User = InferSelectModel<typeof users>;
