import { EmailTokenDTO, PasswordResetTokenDTO } from "@/domain/authentication/authentication.dto";
import { UserDTO } from "@/domain/user/user.dto";

export interface IAuthenticationRepository {
  deleteResetPassworkTokensForUser(userId: string): Promise<void>;
  saveResetPasswordTokenForUser(
    userId: string,
    tokenArgs: { token: string; expiresAt: Date }
  ): Promise<void>;
  getPasswordResetToken(token: string): Promise<PasswordResetTokenDTO | null>;
  deletePasswordResetToken(token: string): Promise<void>;
  updatePassword(args: { userId: string; newHashedPassword: string }): Promise<boolean>; //TODO should be result type

  getEmailVerificationCodeForUser(userId: string): Promise<EmailTokenDTO | null>;
  saveEmailVerificationCode(tokenArgs: {
    code: string;
    email: string;
    userId: string;
    expiresAt: Date;
  }): Promise<void>;
  //   getActiveSessionsForUser(userId: string): void;
  deleteEmailVerificationCodesForUser(userArgs: { userId: string; email: string }): Promise<void>;
  markUserVerified(userId: string, verifiedAt: Date): Promise<boolean>;
}

export interface IAuthenticationService {
  // It would be great if this method didn't need any arguments sot hat we don't have to pass the jwt/session token around
  getUser(): Promise<UserDTO | null>;

  signUpWithEmail(userArgs: { email: string; unhashedPassword: string }): Promise<void>; // TODO should be a result
  signInWithEmail(userArgs: { email: string; unhashedPassword: string }): Promise<UserDTO>; // TODO should be result type

  signOut(): Promise<boolean>; // This could also return a result type

  // Should this send an email using some sort of notification service?
  initiatePasswordResetWithToken(email: string): Promise<boolean>; // TOOD ResultType
  updatePasswordWithResetToken(token: string, newUnhashedPassword: string): Promise<boolean>; // TODO ResultType TokenExpired | TokenNotFound

  // Should this send an email using some sort of notification service?
  initiateEmailVerification(userArgs: { userId: string; email: string }): Promise<void>;
  verifyEmailWithCode({
    code,
    userId,
    email,
  }: {
    code: string;
    userId: string;
    email: string;
  }): Promise<boolean>; // should ideally be a result type
}
