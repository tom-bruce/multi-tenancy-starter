import {
  IAuthenticationRepository,
  IAuthenticationService,
} from "@/domain/authentication/authentication.interface";
import { UserDTO } from "@/domain/user/user.dto";
import { IUserRepository } from "@/domain/user/user.interface";
import { RESET_PASSWORD_URL } from "@/features/auth/config";
import { lucia } from "@/lib/auth";
import PasswordReset from "@/lib/email/templates/password-reset";
import { getBaseUrl } from "@/lib/utils";
import { Session, TimeSpan, User, generateId } from "lucia";
import { createDate, isWithinExpirationDate } from "oslo";
import { generateId as generateEntityId } from "@/lib/id";
import EmailVerification from "@/lib/email/templates/email-verification";
import { alphabet, generateRandomString } from "oslo/crypto";
import { IEmailService } from "@/domain/email/email.interface";
import { ICookieService } from "@/domain/cookie/cookie.interface";

type ValidateRequestResponse = { user: User; session: Session } | { user: null; session: null };
export class AuthenticationService implements IAuthenticationService {
  private _authenticationRepository: IAuthenticationRepository;
  private _userRepository: IUserRepository; // TODO not sure if we should depend on user repo or user serivce?
  private _emailService: IEmailService;
  private _cookieService: ICookieService;
  private _cachedValidationRequest: ValidateRequestResponse | null = null;
  constructor(
    authenticationRepository: IAuthenticationRepository,
    userRepository: IUserRepository,
    emailService: IEmailService,
    cookieService: ICookieService
  ) {
    this._authenticationRepository = authenticationRepository;
    this._userRepository = userRepository;
    this._emailService = emailService;
    this._cookieService = cookieService;
  }

  private async _validateRequest_cached(): Promise<ValidateRequestResponse> {
    if (!this._cachedValidationRequest) {
      this._cachedValidationRequest = await this._validateRequest__uncached();
    }
    return this._cachedValidationRequest;
  }

  private async _validateRequest__uncached(): Promise<ValidateRequestResponse> {
    const sessionId = lucia.readSessionCookie(this._cookieService.getRaw());
    if (!sessionId) {
      return {
        user: null,
        session: null,
      };
    }
    const result = await lucia.validateSession(sessionId);
    if (result.session && result.session.fresh) {
      this._cookieService.set(lucia.createSessionCookie(result.session.id).serialize());
    }
    if (!result.session) {
      this._cookieService.set(lucia.createBlankSessionCookie().serialize());
    }
    return result;
  }

  async getUser(): Promise<UserDTO | null> {
    // TODO  Need to research how to make sure it can't leak across requests
    const { user } = await this._validateRequest_cached();
    return user;
  }

  async signUpWithEmail({ email, unhashedPassword }: { email: string; unhashedPassword: string }) {
    const maybeUser = await this.getUser();
    if (maybeUser) {
      throw new Error("UserAlreadyAuthenticated");
    }

    const hashedPassword = await this._hashPassword(unhashedPassword);

    const newUser = await this._userRepository.create({ email, hashedPassword });

    await this._initiateEmailVerification(
      { userId: newUser.id, email: newUser.email },
      newUser.verifiedAt
    );

    await this._createAndSetNewSession(newUser.id);
  }

  /**
   * Initiate an email verification request for user that is not logged in.
   * This is primarily used for post sign up verification email dispatching.
   */
  private async _initiateEmailVerification(
    { userId, email }: { userId: string; email: string },
    verifiedAt?: Date | null
  ) {
    // TODO we might want to check debounce these so a verification email can only be sent once per 5 mins
    if (verifiedAt === undefined) {
      // Check that the user email is not verified if a verifiedAt isn't specified
      const user = await this._userRepository.byEmail(email);
      if (user?.verifiedAt) {
        throw new Error("EmailAlreadyVerified");
      }
    }

    if (verifiedAt) {
      throw new Error("EmailAlreadyVerified");
    }

    await this._authenticationRepository.deleteEmailVerificationCodesForUser({
      email,
      userId,
    });
    const verificationCode = generateRandomString(8, alphabet("0-9"));

    await this._authenticationRepository.saveEmailVerificationCode({
      code: verificationCode,
      email,
      userId,
      expiresAt: createDate(new TimeSpan(5, "m")),
    });

    await this._emailService.sendMail({
      to: email,
      subject: "Verify Your Placeholder Account",
      from: "Tom at Placeholder <welcome@tombruce.au>",
      react: EmailVerification({ email, verificationCode }),
    });
  }

  async signInWithEmail({ email, unhashedPassword }: { email: string; unhashedPassword: string }) {
    // TODO? Check whether the user is signed in
    const maybeUser = await this._userRepository.byEmailWithPassword(email);
    if (!maybeUser) {
      throw new Error("UserNotFound");
    }
    if (!maybeUser.hashedPassword) {
      throw new Error("NoPasswordSet");
    }

    const isPasswordValid = await this._verifyPassword({
      unhashedPassword: unhashedPassword,
      hashedPassword: maybeUser.hashedPassword,
    });

    if (!isPasswordValid) {
      throw new Error("InvalidCredentials");
    }

    await this._createAndSetNewSession(maybeUser.id);

    const result: UserDTO = {
      email: maybeUser.email,
      id: maybeUser.email,
      verifiedAt: maybeUser.verifiedAt,
    };

    return result;
  }

  async signOut() {
    const { session } = await this._validateRequest_cached();
    if (!session) {
      // TODO ResultType
      throw new Error("MissingSession");
    }
    // TODO should throw an error if no session
    await lucia.invalidateSession(session.id);
    this._cookieService.set(lucia.createBlankSessionCookie().serialize());
    this._cachedValidationRequest = null;
    return true;
  }

  async initiatePasswordResetWithToken(email: string) {
    const maybeUser = await this._userRepository.byEmail(email);

    if (!maybeUser) {
      //TODO ResultType here
      // Not ideal to expose this information, however it is inevitably exposed during the sign up process hence could be enumerated from there
      throw new Error("User doesn't exist");
    }

    await this._authenticationRepository.deleteResetPassworkTokensForUser(maybeUser.id);
    const resetToken = generateId(40);
    await this._authenticationRepository.saveResetPasswordTokenForUser(maybeUser.id, {
      token: resetToken,
      expiresAt: createDate(new TimeSpan(5, "m")),
    });

    const baseUrl = getBaseUrl();
    const resetUrl = new URL(`${RESET_PASSWORD_URL}/${resetToken}`, baseUrl);

    await this._emailService.sendMail({
      to: email,
      from: "Tom Bruce <support@tombruce.au>",
      subject: "Password Reset Request",
      react: PasswordReset({ resetUrl: resetUrl.toString() }),
    });
    return true;
  }

  async updatePasswordWithResetToken(code: string, newUnhashedPassword: string) {
    // Note: It's important to hash the new password before verifying token to mitigate timing attacks
    const newHashedPassword = await this._hashPassword(newUnhashedPassword);
    const persistedToken = await this._authenticationRepository.getPasswordResetToken(code);

    if (persistedToken) {
      await this._authenticationRepository.deletePasswordResetToken(code);
    } else {
      // TODO ResultType result.fail TOKENNOTFOUND
      throw new Error("Code not found");
    }
    if (!isWithinExpirationDate(persistedToken.expiresAt)) {
      // TODO ResultType
      throw new Error("Code Expired");
    }

    // TODO ResultType error updating password
    const isSuccess = await this._authenticationRepository.updatePassword({
      userId: persistedToken.userId,
      newHashedPassword,
    });

    if (!isSuccess) {
      throw new Error("Unable to persist updated password");
    }

    await lucia.invalidateSession(persistedToken.userId);

    await this._createAndSetNewSession(persistedToken.userId);
    return true;
  }

  /**
   * Initiate an email verification request for a logged in user
   */
  async initiateEmailVerification() {
    const user = await this.getUser();

    if (!user) {
      throw new Error("Unauthenticated");
    }
    return this._initiateEmailVerification({ email: user.email, userId: user.id }, user.verifiedAt);
  }

  async verifyEmailWithCode({ code }: { code: string }) {
    const user = await this.getUser();
    if (!user) {
      throw new Error("Unauthenticated");
    }
    if (user.verifiedAt) {
      throw new Error("EmailAlreadyVerified");
    }
    const userId = user.id;
    const email = user.email;

    // TODO ideally this is in a transaction
    // Need to work out a good way to make a persistence layer agnostic transaction
    const persistedToken = await this._authenticationRepository.getEmailVerificationCodeForUser(
      userId
    );

    // TODO ResultType
    if (!persistedToken) {
      throw new Error("CodeNotFound");
    }

    if (persistedToken.email !== email) {
      throw new Error("EmailMismatch");
    }

    if (persistedToken.code !== code) {
      throw new Error("CodeMismatch");
    }

    if (!isWithinExpirationDate(persistedToken.expiresAt)) {
      throw new Error("CodeExpired");
    }

    await lucia.invalidateUserSessions(userId);
    // TODO can this move up to the initial persistedToken query?
    await this._authenticationRepository.deleteEmailVerificationCodesForUser({ email, userId });
    await this._authenticationRepository.markUserVerified(userId, new Date());

    await this._createAndSetNewSession(user.id);
    return true;
  }

  private async _createAndSetNewSession(id: string) {
    const session = await lucia.createSession(
      id,
      // @ts-expect-error
      {},
      { sessionId: generateEntityId("session") }
    );
    const sessionCookie = lucia.createSessionCookie(session.id);
    this._cookieService.set(sessionCookie.serialize());
    this._cachedValidationRequest = null;
  }

  private async _hashPassword(unhashedPassword: string): Promise<string> {
    return new (await import("oslo/password")).Argon2id().hash(unhashedPassword);
  }

  private async _verifyPassword({
    unhashedPassword,
    hashedPassword,
  }: {
    unhashedPassword: string;
    hashedPassword: string;
  }) {
    return new (await import("oslo/password")).Argon2id().verify(hashedPassword, unhashedPassword);
  }
}
