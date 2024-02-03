import { TriggerResetPasswordForm } from "@/features/auth/trigger-reset-password-form";
import { SignOutButton } from "@/features/auth/sign-out-button-client";
import { trpc } from "@/lib/trpc/next-client";
import { Suspense } from "react";

function Profile() {
  const [details] = trpc.user.me.useSuspenseQuery();
  return (
    <div>
      <h1>Profile</h1>
      <pre>{JSON.stringify(details, null, 2)}</pre>
      {details.user ? <SignOutButton /> : null}
    </div>
  );
}

export default function HomePage() {
  return (
    <main>
      <h1>hello</h1>
      <Suspense fallback="Loading">
        <Profile />
      </Suspense>
      <TriggerResetPasswordForm />
    </main>
  );
}
