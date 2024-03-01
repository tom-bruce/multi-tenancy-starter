import { useUser } from "@/features/auth/authenticated-user-provider";
import { SIGN_UP_URL } from "@/features/auth/config";
import { DefaultLayout } from "@/features/auth/default-layout";
import { SignInForm } from "@/features/auth/sign-in-form";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect } from "react";

export default function SignUpPage() {
  return (
    <DefaultLayout>
      <SignUpPageInner />
    </DefaultLayout>
  );
}
function SignUpPageInner() {
  const router = useRouter();
  const { user } = useUser();
  useEffect(() => {
    if (user) {
      router.push("/");
    }
  }, [user, router]);
  return (
    <main className="h-screen flex justify-center items-center flex-col">
      <div className="container mx-auto space-y-2 max-w-lg">
        <h1 className="text-3xl font-semibold tracking-tight text-center">
          Sign In to Placeholder
        </h1>
        <p className="text-muted-foreground text-center">Enter your email and password below</p>
        <SignInForm />
        <p className="text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link
            className="font-semibold hover:underline"
            href={{
              pathname: SIGN_UP_URL,
              query: router.query.returnUrl ? { returnUrl: router.query.returnUrl } : undefined,
            }}
          >
            Sign Up
          </Link>
        </p>
      </div>
    </main>
  );
}
