"use server";
import { lucia } from "@/lib/auth";
import { Password } from "@/lib/password";
import { User } from "@/lib/user";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { signInSchema } from "./sign-in-schema";
import { generateId } from "@/lib/id";

interface ActionResult {
  error?: string;
}
export async function signIn(previousState: any, formData: FormData) {
  const parseResult = signInSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parseResult.success) {
    return {
      error: parseResult.error.toString(),
    };
  }

  const data = parseResult.data;
  const maybeUser = await User.byEmail(data.email);

  if (!maybeUser) {
    return {
      error: "User not found",
    };
  }
  if (!maybeUser.hashedPassword) {
    return {
      error: "User has no password",
    };
  }
  // const isValidPassword = false;
  const isValidPassword = await Password.verify({
    password: data.password,
    hash: maybeUser.hashedPassword,
  });
  if (!isValidPassword) {
    return {
      error: "Invalid password",
    };
  }
  // @ts-expect-error
  const session = await lucia.createSession(maybeUser.id, {}, { sessionId: generateId("session") });
  // const sessionCookie = lucia.createSessionCookie(session.id);
  // cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
  return {
    error: JSON.stringify(session, null, 2),
  };
  // return redirect("/");
}
