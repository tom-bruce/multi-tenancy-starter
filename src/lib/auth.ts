import { Lucia } from "lucia";
import { DrizzlePostgreSQLAdapter } from "@lucia-auth/adapter-drizzle";
import { sessions } from "@/lib/db/schema/sessions";
import type { Session as DbSession } from "@/lib/db/schema/sessions";
import { users } from "@/lib/db/schema/users";
import type { User as DbUser } from "@/lib/db/schema/users";
import { db } from "@/lib/db";

const adapter = new DrizzlePostgreSQLAdapter(db, sessions, users);

export const lucia = new Lucia(adapter, {
  getUserAttributes(databaseUserAttributes) {
    return {
      email: databaseUserAttributes.email,
    };
  },
  sessionCookie: {
    // this sets cookies with super long expiration
    // since Next.js doesn't allow Lucia to extend cookie expiration when rendering pages
    expires: false,
    attributes: {
      // set to `true` when using HTTPS
      secure: process.env.NODE_ENV === "production",
    },
  },
});

// IMPORTANT!
declare module "lucia" {
  interface Register {
    Lucia: typeof lucia;
    DatabaseUserAttributes: DbUser;
    DatabaseSessionAttributes: DbSession;
  }
}
