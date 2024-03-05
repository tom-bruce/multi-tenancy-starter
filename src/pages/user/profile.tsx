import { AuthenticatedLayout } from "@/features/auth/authenticated-layout";
import { useAuthenticatedUser } from "@/features/auth/authenticated-user-provider";
import { trpc } from "@/lib/trpc/next-client";
import { cn } from "@/lib/utils";
import { Suspense } from "react";

export default function ProfilePage() {
  return (
    <AuthenticatedLayout>
      <ProfilePageInner />
    </AuthenticatedLayout>
  );
}
function ProfilePageInner() {
  const { user } = useAuthenticatedUser();
  return (
    <div>
      <h1>Mock Profile Page</h1>
      <pre>{JSON.stringify(user, null, 2)}</pre>
      <Suspense fallback={"Loading"}>
        <SessionList />
      </Suspense>
    </div>
  );
}

function SessionList() {
  const { session: activeSession } = useAuthenticatedUser();
  const [sessions] = trpc.user.activeSessions.useSuspenseQuery();
  return (
    <ul>
      {sessions.map((session) => (
        <li className={cn(session.id === activeSession.id && "font-bold")} key={session.id}>
          {session.id}
        </li>
      ))}
    </ul>
  );
}
