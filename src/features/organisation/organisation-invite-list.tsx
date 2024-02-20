import { trpc } from "@/lib/trpc/next-client";
import { useOrganisationSlug } from "./use-organisation-slug";
import { Button } from "@/components/ui/button";

export function OrganisationInviteList() {
  const invitesQuery = trpc.organisation.invites.useQuery(
    { orgSlug: useOrganisationSlug() },
    { retry: false }
  );

  return (
    <div>
      <h2>Pending Invites</h2>
      <ul>
        {invitesQuery.data?.map((invite) => {
          return (
            <li key={invite.id}>
              {invite.email} invited {invite.invitedAt.toLocaleString()} expires{" "}
              {invite.expiresAt.toLocaleString()} <RevokeInviteButton inviteId={invite.id} />
            </li>
          );
        })}
      </ul>
      <pre>{JSON.stringify(invitesQuery.data, null, 2)}</pre>
    </div>
  );
}

function RevokeInviteButton({ inviteId }: { inviteId: string }) {
  const utils = trpc.useUtils();
  const mutation = trpc.organisation.revokeInvite.useMutation({
    onSuccess() {
      utils.organisation.invites.invalidate();
    },
  });
  const orgSlug = useOrganisationSlug();
  return (
    <Button
      isLoading={mutation.isPending}
      disabled={mutation.isSuccess}
      onClick={() => mutation.mutate({ orgSlug, inviteId })}
      variant="destructive"
    >
      Revoke
    </Button>
  );
}
