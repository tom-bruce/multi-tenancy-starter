import { trpc } from "@/lib/trpc/next-client";
import { useOrganisationSlug } from "./use-organisation-slug";
import { useAuthenticatedUser } from "../auth/authenticated-user-provider";
import { cn } from "@/lib/utils";

export function MembersList() {
  const query = trpc.organisation.members.useQuery({ orgSlug: useOrganisationSlug() });
  const { user } = useAuthenticatedUser();
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
        {query.data?.map((member) => (
          <li className={cn(user.email === member.email && "font-bold")} key={member.id}>
            {member.email} ({member.role}) - Joined {member.joinedAt.toLocaleDateString()}
          </li>
        ))}
      </ul>
    </div>
  );
}
