import { trpc } from "@/lib/trpc/next-client";
import { useOrganisationSlug } from "./use-organisation-slug";

export function OrganisationInviteList() {
  const invitesQuery = trpc.organisation.invites.useQuery(
    { orgSlug: useOrganisationSlug() },
    { retry: false }
  );
  // const [invites] = trpc.organisation.invites.useSuspenseQuery(
  //   { orgSlug: useOrganisationSlug() },
  //   { retry: false }
  // );

  return (
    <div>
      <h2>Pending Invites</h2>
      <pre>{JSON.stringify(invitesQuery.data, null, 2)}</pre>
    </div>
  );
}
