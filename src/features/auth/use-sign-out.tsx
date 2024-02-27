import { trpc } from "@/lib/trpc/next-client";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/router";

export function useSignOut() {
  const router = useRouter();
  const qc = useQueryClient();
  const signOutMutation = trpc.user.signOut.useMutation({
    onSuccess: () => {
      router.push("/");
      qc.removeQueries();
    },
  });
  return signOutMutation;
}
