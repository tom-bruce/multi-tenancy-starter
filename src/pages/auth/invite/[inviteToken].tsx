import { Button } from "@/components/ui/button";
import { AuthenticatedProvider } from "@/features/auth/authenticated-user-provider";
import { trpc } from "@/lib/trpc/next-client";
import { useRouter } from "next/router";

function useInviteToken() {
  const router = useRouter();
  const { inviteToken } = router.query;
  if (!inviteToken) {
    throw new Error("Missing invite token");
  }
  if (Array.isArray(inviteToken)) {
    throw new Error("Multiple invite tokens supplied");
  }
  return inviteToken;
}

export default function AcceptInviteToken() {
  return (
    <AuthenticatedProvider>
      <AcceptInviteTokenInner />
    </AuthenticatedProvider>
  );
}
export function AcceptInviteTokenInner() {
  const inviteToken = useInviteToken();
  const query = trpc.organisation.inviteDetails.useQuery({ inviteToken });
  if (query.isError) {
    return <p>Error loading invite details</p>;
  }
  if (query.isLoading) {
    return <p>Loading</p>;
  }
  if (!query.data) {
    throw new Error("No invite data");
  }
  return (
    <div>
      <p>You are invited to join {query.data?.name}</p>
      <JoinOrganisationButton organisationSlug={query.data?.slug} />
    </div>
  );
}

function JoinOrganisationButton({ organisationSlug }: { organisationSlug: string }) {
  const inviteToken = useInviteToken();
  const router = useRouter();
  const utils = trpc.useUtils();
  const acceptInviteMutation = trpc.organisation.acceptInvite.useMutation({
    onSuccess: () => {
      utils.organisation.list.invalidate();
      router.push(`/app/${organisationSlug}`);
    },
  });
  return (
    <Button
      isLoading={acceptInviteMutation.isPending}
      disabled={acceptInviteMutation.isSuccess}
      onClick={() => acceptInviteMutation.mutate({ inviteToken })}
    >
      Join Organisation
    </Button>
  );
}
