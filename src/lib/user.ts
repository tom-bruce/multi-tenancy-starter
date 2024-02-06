import { eq } from "drizzle-orm";
import { db } from "./db";
import { users } from "./db/schema/users";
import { TimeSpan, generateId } from "lucia";
import { passwordResetTokens } from "./db/schema/password-reset-tokens";
import { isWithinExpirationDate } from "oslo";
import { result } from "./result";
import { CodedError } from "./error";
import { SqliteError } from "better-sqlite3";
export * as User from "./user";

export async function create({ email, hashedPassword }: { email: string; hashedPassword: string }) {
  try {
    const newUser = await db
      .insert(users)
      .values({ email, hashedPassword })
      .returning({ id: users.id })
      .execute()
      .then((result) => result[0]);
    if (!newUser) throw new Error("Unknown Error");
    return result.success(newUser);
  } catch (e) {
    if (e instanceof SqliteError) {
      if (e.code === "SQLITE_CONSTRAINT_UNIQUE" && e.message.includes("email")) {
        return result.fail(new CodedError("UserAlreadyExists"));
      }
    }
    throw e;
  }
}

export async function byEmail(email: string) {
  return db
    .select({ id: users.id, email: users.email, hashedPassword: users.hashedPassword })
    .from(users)
    .where(eq(users.email, email))
    .execute()
    .then((result) => result[0]);
}

export async function createResetPasswordToken(userId: string) {
  await db.delete(passwordResetTokens).where(eq(passwordResetTokens.userId, userId)).execute();
  const token = generateId(40);
  await db
    .insert(passwordResetTokens)
    .values({ id: token, userId, expiresAt: Date.now() + 60 * 5 * 1000 })
    .execute();
  return token;
}

class ChangePasswordError extends CodedError<"TokenNotFound" | "TokenExpired"> {
  constructor(public code: "TokenNotFound" | "TokenExpired") {
    super(code);
  }
}
export async function changePasswordWithResetToken({
  token,
  newHashedPassword,
}: {
  token: string;
  newHashedPassword: string;
}) {
  const dbToken = await db
    .select()
    .from(passwordResetTokens)
    .where(eq(passwordResetTokens.id, token))
    .execute()
    .then((r) => r[0]);
  if (dbToken) {
    await db.delete(passwordResetTokens).where(eq(passwordResetTokens.id, token)).execute();
  }
  if (!dbToken) {
    return result.fail(new ChangePasswordError("TokenNotFound"));
  }
  if (Date.now() >= dbToken.expiresAt) {
    return result.fail(new ChangePasswordError("TokenExpired"));
  }

  const updatedUser = await db
    .update(users)
    .set({ hashedPassword: newHashedPassword })
    .where(eq(users.id, dbToken.userId))
    .returning()
    .execute()
    .then((r) => r[0]);

  if (!updatedUser) {
    throw new Error("Failed to update user's password");
  }
  return result.success(updatedUser);
}
