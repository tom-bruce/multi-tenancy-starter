import { drizzle } from "drizzle-orm/neon-http";
import assert from "assert";
import { DatabaseError, NeonDbError, neon } from "@neondatabase/serverless";

assert(process.env.DATABASE_URL, "DATABASE_URL is not defined");

// migrate(drizzle(migrationClient))
// for query purposes
const sql = neon(process.env.DATABASE_URL);
export const db = drizzle(sql, { logger: false });
// const sqliteDb = sqlite(process.env.DATABASE_URL);

// export const db = drizzle(sqliteDb, { logger: process.env.NODE_ENV === "development" });

export function isIntegrityViolation(e: unknown): e is DatabaseError {
  return e instanceof NeonDbError && e.code === "23505";
}
