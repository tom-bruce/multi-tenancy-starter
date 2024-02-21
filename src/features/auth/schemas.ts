import { z } from "zod";

export const signUpSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email" }),
  password: z.string().min(1, { message: "Please enter a password" }),
});

export const signInSchema = signUpSchema;

export const resetPasswordSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email" }),
});

export const verifyResetTokenSchema = z.object({
  token: z.string().min(1, { message: "Please enter the token that was sent to your email" }),
  newPassword: z.string().min(1, { message: "Please enter a new password" }),
});

export const verifyEmailSchema = z.object({
  code: z.string().min(1, { message: "Please enter the code that was sent to your email" }),
});
