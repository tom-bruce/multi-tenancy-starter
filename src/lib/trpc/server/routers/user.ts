import { publicProcedure, router } from "../trpc";
import {
  resetPasswordSchema,
  signInSchema,
  signUpSchema,
  verifyResetTokenSchema,
} from "@/features/auth/schemas";
import { Password } from "@/lib/password";
import { User } from "@/lib/user";
import { lucia } from "@/lib/auth";
import { generateId } from "@/lib/id";
import { TRPCError } from "@trpc/server";
import { assertNever, getBaseUrl } from "@/lib/utils";
import {
  RESET_TOKEN_ERRORS,
  SIGN_IN_ERRORS,
  SIGN_UP_ERRORS,
  TRIGGER_RESET_ERRORS,
  VERIFY_RESET_TOKEN_URL,
} from "@/features/auth/config";
import { sendMail } from "@/lib/email/send-mail";
import PasswordReset from "@/lib/email/templates/password-reset";
import Welcome from "@/lib/email/templates/welcome";
import { rateLimiter } from "@/lib/rate-limiter";
import { assertRateLimited } from "@/lib/assert-rate-limited";

export const userRouter = router({
  me: publicProcedure.query(async (opts) => {
    return { user: opts.ctx.user ?? null };
  }),
  signUp: publicProcedure.input(signUpSchema).mutation(async ({ input, ctx }) => {
    await assertRateLimited({ limitType: "auth", identifier: ctx.clientIp });

    if (ctx.user) {
      throw new TRPCError({ code: "BAD_REQUEST", message: "Already signed in" });
    }
    const hashedPassword = await Password.hash(input.password);

    const createResult = await User.create({ email: input.email, hashedPassword });

    if (!createResult._ok) {
      if (createResult.error.code === "UserAlreadyExists") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: SIGN_UP_ERRORS.EMAIL_IN_USE,
        });
      } else {
        assertNever(createResult.error.code);
      }
    }
    const user = createResult.value;
    await sendMail({
      to: input.email,
      subject: "Welcome to Placeholder",
      from: "Tom at Placeholder <welcome@tombruce.au>",
      react: Welcome({ email: input.email }),
    });
    //@ts-expect-error
    const session = await lucia.createSession(user.id, {}, { sessionId: generateId("session") });
    const sessionCookie = lucia.createSessionCookie(session.id);
    ctx.res.appendHeader("Set-Cookie", sessionCookie.serialize());
    return;
  }),
  signIn: publicProcedure.input(signInSchema).mutation(async ({ input, ctx }) => {
    await assertRateLimited({ limitType: "auth", identifier: input.email });

    const maybeUser = await User.byEmail(input.email);

    if (!maybeUser) {
      throw new TRPCError({ code: "BAD_REQUEST", message: SIGN_IN_ERRORS.INVALID_CREDENTIALS });
    }

    if (!maybeUser.hashedPassword) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: SIGN_IN_ERRORS.USER_LINKED_WITH_ANOTHER_ACCOUNT,
      });
    }

    const isValidPassword = await Password.verify({
      password: input.password,
      hash: maybeUser.hashedPassword,
    });

    if (!isValidPassword) {
      throw new TRPCError({ code: "BAD_REQUEST", message: SIGN_IN_ERRORS.INVALID_CREDENTIALS });
    }

    const session = await lucia.createSession(
      maybeUser.id,
      // @ts-expect-error
      {},
      { sessionId: generateId("session") }
    );

    const sessionCookie = lucia.createSessionCookie(session.id);
    ctx.res.appendHeader("Set-Cookie", sessionCookie.serialize());
    return;
  }),
  signOut: publicProcedure.mutation(async ({ ctx }) => {
    if (!ctx.session) {
      throw new TRPCError({ code: "BAD_REQUEST", message: "No session found" });
    }
    await lucia.invalidateSession(ctx.session.id);
    ctx.res.setHeader("Set-Cookie", lucia.createBlankSessionCookie().serialize());
    return;
  }),
  triggerResetPassword: publicProcedure
    .input(resetPasswordSchema)
    .mutation(async ({ ctx, input }) => {
      await assertRateLimited({ limitType: "auth", identifier: ctx.clientIp });

      const maybeUser = await User.byEmail(input.email);
      if (!maybeUser) {
        // Not ideal to expose this information, however it is inevitably exposed during the sign up process hence could be enumerated from there
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: TRIGGER_RESET_ERRORS.EMAIL_NOT_FOUND,
        });
      }

      // Create a reset token
      const resetToken = await User.createResetPasswordToken(maybeUser.id);
      const baseUrl = getBaseUrl();
      const resetUrl = new URL(VERIFY_RESET_TOKEN_URL, baseUrl);
      resetUrl.searchParams.append("token", resetToken);

      // Send the reset email
      await sendMail({
        to: input.email,
        from: "Tom Bruce <support@tombruce.au>",
        subject: "Password Reset Request",
        react: PasswordReset({ resetUrl: resetUrl.toString() }),
      });

      return;
    }),
  verifyResetToken: publicProcedure
    .input(verifyResetTokenSchema)
    .mutation(async ({ ctx, input }) => {
      await assertRateLimited({ limitType: "auth", identifier: ctx.clientIp });

      const newHashedPassword = await Password.hash(input.newPassword);
      const updateUserResult = await User.changePasswordWithResetToken({
        newHashedPassword,
        token: input.token,
      });

      if (!updateUserResult._ok) {
        switch (updateUserResult.error.code) {
          case "TokenExpired":
            throw new TRPCError({ code: "BAD_REQUEST", message: RESET_TOKEN_ERRORS.TOKEN_EXPIRED });
          case "TokenNotFound":
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: RESET_TOKEN_ERRORS.TOKEN_NOT_FOUND,
            });
          default:
            assertNever(updateUserResult.error.code);
        }
      }
      const user = updateUserResult.value;
      await lucia.invalidateSession(user.id);

      //@ts-expect-error
      const session = await lucia.createSession(user.id, {}, { sessionId: generateId("session") });
      const sessionCookie = lucia.createSessionCookie(session.id);
      ctx.res.appendHeader("Set-Cookie", sessionCookie.serialize());
      return;
    }),
});
