import { EmailTokenDTO, PasswordResetTokenDTO } from "@/domain/authentication/authentication.dto";
import { IAuthenticationRepository } from "@/domain/authentication/authentication.interface";
import { db } from "@/lib/db";
import { emailVerificationCodes } from "@/lib/db/schema/email-verification-codes";
import { passwordResetTokens } from "@/lib/db/schema/password-reset-tokens";
import { users } from "@/lib/db/schema/users";
import { and, eq } from "drizzle-orm";

export class AuthenticationRepository implements IAuthenticationRepository {
  async deleteResetPassworkTokensForUser(userId: string) {
    await db.delete(passwordResetTokens).where(eq(passwordResetTokens.userId, userId)).execute();
  }

  async saveResetPasswordTokenForUser(
    userId: string,
    { token, expiresAt }: { token: string; expiresAt: Date }
  ) {
    await db.insert(passwordResetTokens).values({ id: token, userId, expiresAt }).execute();
  }

  async getPasswordResetToken(token: string) {
    const dbToken = await db
      .select()
      .from(passwordResetTokens)
      .where(eq(passwordResetTokens.id, token))
      .execute()
      .then((r) => r[0] ?? null);

    if (!dbToken) return null;

    const result: PasswordResetTokenDTO = {
      code: dbToken.id,
      userId: dbToken.userId,
      expiresAt: dbToken.expiresAt,
    };

    return result;
  }

  async deletePasswordResetToken(token: string) {
    await db.delete(passwordResetTokens).where(eq(passwordResetTokens.id, token)).execute();
  }

  async updatePassword({
    userId,
    newHashedPassword,
  }: {
    userId: string;
    newHashedPassword: string;
  }) {
    // Should auth related user data be in a seperate table?
    const _updatedUser = await db
      .update(users)
      .set({ hashedPassword: newHashedPassword })
      .where(eq(users.id, userId))
      .returning()
      .execute()
      .then((r) => r[0]);

    if (!_updatedUser) {
      throw new Error("Invalid user id");
    }

    return true;
  }

  async getEmailVerificationCodeForUser(userId: string) {
    const dbCode = await db
      .select()
      .from(emailVerificationCodes)
      .where(eq(emailVerificationCodes.userId, userId))
      .execute()
      .then((r) => r[0] ?? null);

    if (!dbCode) return null;

    const result: EmailTokenDTO = {
      code: dbCode.code,
      email: dbCode.email,
      expiresAt: dbCode.expiresAt,
      userId: dbCode.userId,
    };
    return result;
  }
  async saveEmailVerificationCode({
    code,
    email,
    userId,
    expiresAt,
  }: {
    code: string;
    email: string;
    userId: string;
    expiresAt: Date;
  }) {
    await db.insert(emailVerificationCodes).values({ code, email, userId, expiresAt }).execute();
  }

  // TODO consider we need both the email and user id in the repository
  async deleteEmailVerificationCodesForUser({ userId, email }: { userId: string; email: string }) {
    await db
      .delete(emailVerificationCodes)
      .where(
        and(eq(emailVerificationCodes.userId, userId), eq(emailVerificationCodes.email, email))
      )
      .execute();
  }

  async markUserVerified(userId: string, verifiedAt: Date) {
    const result = await db
      .update(users)
      .set({ verifiedAt })
      .where(eq(users.id, userId))
      .returning()
      .execute();
    if (result.length === 0) return false;
    if (result.length !== 1) throw new Error("Duplicate users found");
    return true;
  }
}
