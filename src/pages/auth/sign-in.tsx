import { useUser } from "@/features/auth/authenticated-user-provider";
import { SIGN_UP_URL } from "@/features/auth/config";
import { SignInForm } from "@/features/auth/sign-in-form";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect } from "react";

export default function SignUpPage() {
  const router = useRouter();
  const { user } = useUser();
  useEffect(() => {
    if (user) {
      router.push("/");
    }
  }, [user, router]);
  return (
    <main>
      <h1>Sign In</h1>
      <SignInForm />
      <Link href={SIGN_UP_URL}>Sign Up</Link>
    </main>
  );
}
