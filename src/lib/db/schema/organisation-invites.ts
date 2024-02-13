import { pgEnum, timestamp } from "drizzle-orm/pg-core";
import { organisations } from "./organisations";
import { users } from "./users";
import { generateId } from "@/lib/id";
import { pgTable, varchar } from "drizzle-orm/pg-core";

export const organisationInviteStatusEnum = pgEnum("invite_status", [
  "pending",
  "used",
  "expired",
  "revoked",
]);
export const organisationInvites = pgTable("organisation_invites", {
  id: varchar("id")
    .primaryKey()
    .notNull()
    .$defaultFn(() => generateId("invite")),
  token: varchar("invite_token").notNull(),
  email: varchar("email").notNull(),
  status: organisationInviteStatusEnum("status").notNull().default("pending"),
  organisationId: varchar("organisation_id")
    .notNull()
    .references(() => organisations.id),
  invitedByUserId: varchar("invited_by_user_id")
    .notNull()
    .references(() => users.id),
  invitedAt: timestamp("invited_at", { mode: "date" }).notNull().defaultNow(),
  expiresAt: timestamp("expires_at", { mode: "date" }).notNull(),
  acceptedAt: timestamp("accepted_at", { mode: "date" }),
});
