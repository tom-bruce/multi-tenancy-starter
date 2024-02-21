import { useUser } from "@/features/auth/authenticated-user-provider";
import { SIGN_IN_URL } from "@/features/auth/config";
import { SignUpForm } from "@/features/auth/sign-up-form";
import Link from "next/link";
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
    <main className="h-screen flex justify-center items-center flex-col">
      <div className="container mx-auto space-y-2 max-w-lg">
        <h1 className="text-3xl font-semibold tracking-tight text-center">
          Sign Up to Placeholder
        </h1>
        <p className="text-muted-foreground text-center">Setup your email and password</p>
        <SignUpForm />
        <p className="text-muted-foreground">
          Already have an account?{" "}
          <Link
            className="font-semibold hover:underline"
            href={{
              pathname: SIGN_IN_URL,
              query: router.query.returnUrl ? { returnUrl: router.query.returnUrl } : undefined,
            }}
          >
            Sign In
          </Link>
        </p>
      </div>
    </main>
  );
}
