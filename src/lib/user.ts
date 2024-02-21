import { and, eq } from "drizzle-orm";
import { db } from "./db";
import { users } from "./db/schema/users";
import { generateId } from "lucia";
import { passwordResetTokens } from "./db/schema/password-reset-tokens";
import { createDate, TimeSpan, isWithinExpirationDate } from "oslo";
import { result } from "./result";
import { CodedError } from "./error";
import { DatabaseError, NeonDbError } from "@neondatabase/serverless";
import { sessions } from "./db/schema/sessions";
import { emailVerificationCodes } from "./db/schema/email-verification-codes";
import { generateRandomString, alphabet } from "oslo/crypto";
import { lucia } from "./auth";
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
    if (e instanceof NeonDbError) {
      if (e.code === "23505" && e.message.includes("users_email_unique")) {
        return result.fail(new CodedError("UserAlreadyExists"));
      }
    }
    throw e;
  }
}

export async function byEmail(email: string) {
  return db
    .select({
      id: users.id,
      email: users.email,
      hashedPassword: users.hashedPassword,
      verifiedAt: users.verifiedAt,
    })
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
    .values({ id: token, userId, expiresAt: createDate(new TimeSpan(5, "m")) })
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
  if (!isWithinExpirationDate(dbToken.expiresAt)) {
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

export async function activeSessions({ userId }: { userId: string }) {
  // This would become more useful if we included information like last used, user agent, IP address etc
  return db.select({ id: sessions.id }).from(sessions).where(eq(sessions.userId, userId)).execute();
}

export async function createVerificationCode({ userId, email }: { userId: string; email: string }) {
  await db
    .delete(emailVerificationCodes)
    .where(eq(emailVerificationCodes.userId, userId))
    .execute();
  const code = generateRandomString(8, alphabet("0-9"));
  await db
    .insert(emailVerificationCodes)
    .values({ code, email, userId, expiresAt: createDate(new TimeSpan(5, "m")) })
    .execute();
  return { code };
}

export async function confirmVerificationCode({
  code,
  userId,
  email,
}: {
  code: string;
  userId: string;
  email: string;
}) {
  // TODO this should be in a db transaction
  const dbCode = await db
    .select()
    .from(emailVerificationCodes)
    .where(eq(emailVerificationCodes.userId, userId))
    .execute()
    .then((r) => r[0]);

  if (!dbCode) {
    return result.fail(new CodedError("CodeNotFound"));
  }

  if (dbCode.email !== email) {
    return result.fail(new CodedError("EmailMismatch"));
  }

  if (dbCode.code !== code) {
    return result.fail(new CodedError("CodeMismatch"));
  }

  if (!isWithinExpirationDate(dbCode.expiresAt)) {
    return result.fail(new CodedError("CodeExpired"));
  }

  await lucia.invalidateUserSessions(userId);

  await db
    .delete(emailVerificationCodes)
    .where(and(eq(emailVerificationCodes.userId, userId), eq(emailVerificationCodes.email, email)))
    .execute();

  await db.update(users).set({ verifiedAt: new Date() }).where(eq(users.id, userId)).execute();

  return result.success(true);
}
