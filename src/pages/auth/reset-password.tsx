import { ResetPasswordWithTokenForm } from "@/features/auth/reset-password-with-token-form";
import { useRouter } from "next/router";
import { z } from "zod";

export default function ResetPasswordPage() {
  const router = useRouter();
  const parsedQueryParams = z.object({ token: z.string() }).safeParse(router.query);
  if (!parsedQueryParams.success) {
    return <p>Missing reset password token</p>;
  }
  return (
    <main>
      <h1>Reset Password</h1>
      <ResetPasswordWithTokenForm token={parsedQueryParams.data.token} />
    </main>
  );
}
