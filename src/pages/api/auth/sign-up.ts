import { signUpSchema } from "@/features/auth/schemas";
import { lucia } from "@/lib/auth";
import { generateId } from "@/lib/id";
import { Password } from "@/lib/password";
import { User } from "@/lib/user";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  const parsedBody = signUpSchema.parse(req.body);

  const hashedPassword = await Password.hash(parsedBody.password);

  const user = await User.create({ email: parsedBody.email, hashedPassword });

  //@ts-expect-error
  const session = await lucia.createSession(user.id, {}, { sessionId: generateId("session") });
  const sessionCookie = lucia.createSessionCookie(session.id);
  return res.appendHeader("Set-Cookie", sessionCookie.serialize()).status(200).end();
}
