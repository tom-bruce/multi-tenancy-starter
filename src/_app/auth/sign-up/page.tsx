import { parseFormData } from "@/lib/utils";
import { lucia } from "@/lib/auth";
import { Password } from "@/lib/password";
import { User } from "@/lib/user";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { generateId } from "@/lib/id";

export default function SignUpPage() {
  return (
    <>
      <h1>Create an account</h1>
      <form action={signup}>
        <label htmlFor="email">Email</label>
        <input name="email" id="email" />
        <br />
        <label htmlFor="password">Password</label>
        <input type="password" name="password" id="password" />
        <br />
        <button>Continue</button>
      </form>
    </>
  );
}

const signupSchema = z.object({ email: z.string().email(), password: z.string() });
export async function signup(formData: FormData) {
  "use server";
  const data = parseFormData(formData, signupSchema);
  const hashedPassword = await Password.hash(data.password);
  const { id: userId } = await User.create({ hashedPassword, email: data.email });
  // @ts-expect-error
  const session = await lucia.createSession(userId, {}, { sessionId: generateId("session") });
  const sessionCookie = lucia.createSessionCookie(session.id);
  cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
  return redirect("/");
}
