import { useUser } from "@/features/auth/authenticated-user-provider";
import { signUpSchema } from "@/features/auth/schemas";
import { trpc } from "@/lib/trpc/next-client";
import { useRouter } from "next/router";
import { useEffect } from "react";

function SignUpForm() {
  const router = useRouter();
  const { user } = useUser();
  useEffect(() => {
    if (user) {
      router.push("/");
    }
  }, [user, router]);
  const signUpMutation = trpc.user.signUp.useMutation({
    onSuccess: () => {
      router.push("/");
    },
  });
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const data = signUpSchema.parse(
          Object.fromEntries(new FormData(e.target as any).entries())
        );
        signUpMutation.mutate(data);
      }}
    >
      <input name="email" type="email" />
      <input name="password" type="password" />
      <button type="submit">Sign up</button>
    </form>
  );
}
export default function SignUpPage() {
  return (
    <main>
      <h1>Sign Up</h1>
      <SignUpForm />
    </main>
  );
}
