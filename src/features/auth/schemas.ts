import { z } from "zod";

export const signUpSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const signInSchema = signUpSchema;

export const resetPasswordSchema = z.object({
  email: z.string().email(),
});

export const verifyResetTokenSchema = z.object({
  token: z.string(),
  newPassword: z.string().min(1),
});
