import { pgEnum, timestamp } from "drizzle-orm/pg-core";
import { organisations } from "./organisations";
import { users } from "./users";
import { generateId } from "@/lib/id";
import { pgTable, varchar } from "drizzle-orm/pg-core";
import { InferSelectModel } from "drizzle-orm";

const organisationRoleEnum = pgEnum("organisation_role", ["member", "admin"]);

export const members = pgTable("members", {
  id: varchar("id")
    .primaryKey()
    .notNull()
    .$defaultFn(() => generateId("member")),
  organisationRole: organisationRoleEnum("organisation_role").notNull().default("member"),
  userId: varchar("user_id")
    .notNull()
    .references(() => users.id),
  organisationId: varchar("organisation_id")
    .notNull()
    .references(() => organisations.id),
  createdAt: timestamp("created_at", { mode: "date", withTimezone: true }).notNull().defaultNow(),
});

export type OrganisationRole = InferSelectModel<typeof members>["organisationRole"];
