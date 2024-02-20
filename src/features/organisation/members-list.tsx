import { trpc } from "@/lib/trpc/next-client";
import { useOrganisationSlug } from "./use-organisation-slug";
import { useAuthenticatedUser } from "../auth/authenticated-user-provider";
import { cn } from "@/lib/utils";
import { useOrganisation } from "./organisation-provider";
import { Button } from "@/components/ui/button";

export function MembersList() {
  const query = trpc.organisation.members.useQuery({ orgSlug: useOrganisationSlug() });
  const { user } = useAuthenticatedUser();
  const org = useOrganisation();
  if (query.isError) {
    return <p>Error loading members</p>;
  }
  if (query.isLoading) {
    return <p>Loading</p>;
  }
  if (!query.data?.length) {
    return <p>No members</p>;
  }
  return (
    <div>
      <h2>Members</h2>
      <ul>
        {query.data?.map((member) => {
          const canRemove = user.email !== member.email && org.organisationRole === "admin";
          return (
            <li className={cn(user.email === member.email && "font-bold")} key={member.id}>
              {member.email} ({member.role}) - Joined {member.joinedAt.toLocaleDateString()}{" "}
              {canRemove ? <RemoveMembershipButton memberId={member.id} /> : null}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function RemoveMembershipButton({ memberId }: { memberId: string }) {
  const utils = trpc.useUtils();
  const orgSlug = useOrganisationSlug();
  const mutation = trpc.organisation.removeMember.useMutation({
    onSuccess() {
      utils.organisation.members.invalidate();
    },
  });

  return (
    <Button
      onClick={() => mutation.mutate({ orgSlug, memberId })}
      isLoading={mutation.isPending}
      disabled={mutation.isSuccess}
      variant="destructive"
    >
      Remove
    </Button>
  );
}
