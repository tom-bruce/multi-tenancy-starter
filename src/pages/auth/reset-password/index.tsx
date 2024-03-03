import { DefaultLayout } from "@/features/auth/default-layout";
import { TriggerResetPasswordForm } from "@/features/auth/trigger-reset-password-form";

export default function TriggerPasswordResetPage() {
  return (
    <DefaultLayout>
      <main className="h-screen flex justify-center items-center flex-col">
        <div className="container mx-auto space-y-2 max-w-lg">
          <h1 className="text-3xl font-semibold tracking-tight text-center">Set a New Password</h1>
          <p className="text-muted-foreground text-center">
            Enter a new password. You will be signed out of all other devices once your password is
            changed.
          </p>
          <TriggerResetPasswordForm />
        </div>
      </main>
    </DefaultLayout>
  );
}
