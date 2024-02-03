import { trpc } from "@/lib/trpc/next-client";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/router";

export function SignOutButton() {
  const router = useRouter();
  const qc = useQueryClient();
  const signOutMutation = trpc.user.signOut.useMutation({
    onSettled: () => {
      router.push("/");
      qc.removeQueries();
    },
  });
  return <button onClick={() => signOutMutation.mutate()}>Sign Out</button>;
}
