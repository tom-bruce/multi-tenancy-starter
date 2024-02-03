import { trpc } from "@/lib/trpc/next-client";
import { verifyResetTokenSchema } from "./schemas";
import { useRouter } from "next/router";

export function ResetPasswordWithTokenForm({ token }: { token: string }) {
  const router = useRouter();
  const setPasswordMutation = trpc.user.verifyResetToken.useMutation({
    onSuccess: () => router.push("/"),
  });
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const data = verifyResetTokenSchema
          .pick({ newPassword: true })
          .parse(Object.fromEntries(new FormData(e.target as any).entries()));
        setPasswordMutation.mutate({ newPassword: data.newPassword, token });
      }}
    >
      <input type="password" name="newPassword" placeholder="New password" />
      <button>Reset password</button>
    </form>
  );
}
