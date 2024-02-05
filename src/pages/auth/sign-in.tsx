import { useUser } from "@/features/auth/authenticated-user-provider";
import { signUpSchema } from "@/features/auth/schemas";
import { trpc } from "@/lib/trpc/next-client";
import { useRouter } from "next/router";
import { useEffect } from "react";

function SignInForm() {
  const router = useRouter();
  const signInMutation = trpc.user.signIn.useMutation({
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
        signInMutation.mutate(data);
      }}
    >
      <input name="email" type="email" />
      <input name="password" type="password" />
      <button type="submit">Sign In</button>
    </form>
  );
}
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
    </main>
  );
}
