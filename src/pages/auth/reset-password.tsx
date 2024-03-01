import { DefaultLayout } from "@/features/auth/default-layout";
import { ResetPasswordWithTokenForm } from "@/features/auth/reset-password-with-token-form";
import { useRouter } from "next/router";
import { z } from "zod";

export default function ResetPasswordPage() {
  return (
    <DefaultLayout>
      <ResetPasswordPageInner />
    </DefaultLayout>
  );
}

function ResetPasswordPageInner() {
  const router = useRouter();
  const parsedQueryParams = z.object({ token: z.string() }).safeParse(router.query);
  if (!parsedQueryParams.success) {
    return (
      <div className="h-screen flex justify-center items-center">
        <p className="text-foreground font-bold text-lg container mx-auto text-center">
          It looks like the reset link you followed is incorrect. Please try reset your password
          again.
        </p>
      </div>
    );
  }
  return (
    <main className="h-screen flex justify-center items-center flex-col">
      <div className="container mx-auto space-y-2 max-w-lg">
        <h1 className="text-3xl font-semibold tracking-tight text-center">Set a New Password</h1>
        <p className="text-muted-foreground text-center">
          Enter a new password. You will be signed out of all other devices once your password is
          changed.
        </p>
        <ResetPasswordWithTokenForm token={parsedQueryParams.data.token} />
      </div>
    </main>
  );
}
