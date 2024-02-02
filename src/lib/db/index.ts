import { drizzle } from "drizzle-orm/better-sqlite3";
import sqlite from "better-sqlite3";
import assert from "assert";

assert(process.env.DATABASE_URL, "DATABASE_URL is not defined");
const sqliteDB = sqlite(process.env.DATABASE_URL);
export const db = drizzle(sqliteDB, { logger: process.env.NODE_ENV === "development" });
