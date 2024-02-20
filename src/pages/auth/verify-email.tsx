import { AuthenticatedProvider } from "@/features/auth/authenticated-user-provider";
import { VerifyEmailForm } from "@/features/auth/verify-email-form";

export default function Page() {
  return (
    <AuthenticatedProvider>
      <VerifyEmailPageInner />
    </AuthenticatedProvider>
  );
}

function VerifyEmailPageInner() {
  return (
    <div>
      <h1>Verify Email</h1>
      <p>We&apos;ve sent you an email with a code to verify ownership of this email address</p>
      <VerifyEmailForm />
    </div>
  );
}
