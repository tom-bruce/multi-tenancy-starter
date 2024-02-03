import { redirect } from "next/navigation";
import { validateRequest } from "../validate-request";
import { SignInForm } from "@/features/auth/sign-in-form";

export default async function SignInPage() {
  const { user } = await validateRequest();
  if (user) {
    return redirect("/");
  }
  return (
    <>
      <h1>Sign in</h1>
      <SignInForm />
    </>
  );
}
