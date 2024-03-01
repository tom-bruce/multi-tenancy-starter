import { AuthenticatedLayout } from "@/features/auth/authenticated-layout";
import { VerifyEmailForm } from "@/features/auth/verify-email-form";

export default function Page() {
  return (
    <AuthenticatedLayout>
      <VerifyEmailPageInner />
    </AuthenticatedLayout>
  );
}

function VerifyEmailPageInner() {
  return (
    <main className="h-screen flex justify-center items-center flex-col">
      <div className="container mx-auto space-y-2 max-w-lg">
        <h1 className="text-3xl font-semibold tracking-tight text-center">
          Verify your Email to Continue
        </h1>
        <p className="text-muted-foreground text-center">
          We&apos;ve sent you an email with a code to verify ownership of this email address
        </p>
        <VerifyEmailForm />
      </div>
    </main>
  );
}
