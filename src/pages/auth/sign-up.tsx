import { useUser } from "@/features/auth/authenticated-user-provider";
import { SignUpForm } from "@/features/auth/sign-up-form";
import { useRouter } from "next/router";
import { useEffect } from "react";

export default function SignUpPage() {
  const { user } = useUser();
  const router = useRouter();
  useEffect(() => {
    if (user) {
      router.push("/");
    }
  }, [user, router]);
  return (
    <main>
      <h1>Sign Up</h1>
      <SignUpForm />
    </main>
  );
}
