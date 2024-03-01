import { TriggerResetPasswordForm } from "@/features/auth/trigger-reset-password-form";
import { SignOutButton } from "@/features/auth/sign-out-button";
import { useUser } from "@/features/auth/authenticated-user-provider";
import Link from "next/link";
import { SIGN_IN_URL } from "@/features/auth/config";
import { DefaultLayout } from "@/features/auth/default-layout";

function Profile() {
  const { user } = useUser();
  return (
    <div>
      <h1>Profile</h1>
      <pre>{JSON.stringify(user, null, 2)}</pre>
      {user ? <SignOutButton /> : <Link href={SIGN_IN_URL}>Sign in</Link>}
    </div>
  );
}

export default function HomePage() {
  return (
    <DefaultLayout>
      <main>
        <h1>hello</h1>
        <Profile />
        <TriggerResetPasswordForm />
      </main>
    </DefaultLayout>
  );
}
