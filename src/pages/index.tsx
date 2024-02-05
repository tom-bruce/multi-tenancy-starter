import { TriggerResetPasswordForm } from "@/features/auth/trigger-reset-password-form";
import { SignOutButton } from "@/features/auth/sign-out-button-client";
import { useUser } from "@/features/auth/authenticated-user-provider";

function Profile() {
  const { user } = useUser();
  return (
    <div>
      <h1>Profile</h1>
      <pre>{JSON.stringify(user, null, 2)}</pre>
      {user ? <SignOutButton /> : null}
    </div>
  );
}

export default function HomePage() {
  return (
    <main>
      <h1>hello</h1>
      <Profile />
      <TriggerResetPasswordForm />
    </main>
  );
}
