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
import { assertNever } from "@/lib/utils";

export const userRouter = router({
  me: publicProcedure.query(async (opts) => {
    return {
      user: opts.ctx.user,
    };
  }),
  signUp: publicProcedure.input(signUpSchema).mutation(async ({ input, ctx }) => {
    if (ctx.user) {
      throw new TRPCError({ code: "BAD_REQUEST", message: "Already signed in" });
    }
    const hashedPassword = await Password.hash(input.password);

    const user = await User.create({ email: input.email, hashedPassword });

    //@ts-expect-error
    const session = await lucia.createSession(user.id, {}, { sessionId: generateId("session") });
    const sessionCookie = lucia.createSessionCookie(session.id);
    ctx.res.appendHeader("Set-Cookie", sessionCookie.serialize());
    return { success: true };
  }),
  signIn: publicProcedure.input(signInSchema).mutation(async ({ input, ctx }) => {
    const maybeUser = await User.byEmail(input.email);

    if (!maybeUser) {
      throw new TRPCError({ code: "BAD_REQUEST", message: "User not found" });
    }

    if (!maybeUser.hashedPassword) {
      throw new TRPCError({ code: "BAD_REQUEST", message: "User linked with another account" });
    }

    const isValidPassword = await Password.verify({
      password: input.password,
      hash: maybeUser.hashedPassword,
    });

    if (!isValidPassword) {
      throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid password" });
    }

    const session = await lucia.createSession(
      maybeUser.id,
      // @ts-expect-error
      {},
      { sessionId: generateId("session") }
    );

    const sessionCookie = lucia.createSessionCookie(session.id);
    ctx.res.appendHeader("Set-Cookie", sessionCookie.serialize());
    console.log(sessionCookie);
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
      // Check if the user exists
      const maybeUser = await User.byEmail(input.email);
      if (!maybeUser) {
        // Not ideal to expose this information, however it is inevitably exposed during the sign up process hence could be enumerated from there
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "An account doesn't exist with this email",
        });
      }

      // Create a reset token
      const resetToken = await User.createResetPasswordToken(maybeUser.id);
      console.log({ resetToken, maybeUser });
      // TODO send an actual email
      // Send the reset email
      return;
    }),
  verifyResetToken: publicProcedure
    .input(verifyResetTokenSchema)
    .mutation(async ({ ctx, input }) => {
      const newHashedPassword = await Password.hash(input.newPassword);
      const updateUserResult = await User.changePasswordWithResetToken({
        newHashedPassword,
        token: input.token,
      });

      if (!updateUserResult._ok) {
        switch (updateUserResult.error.code) {
          case "TokenExpired":
            throw new TRPCError({ code: "BAD_REQUEST", message: "Token expired" });
          case "TokenNotFound":
            throw new TRPCError({ code: "BAD_REQUEST", message: "Token not found" });
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
