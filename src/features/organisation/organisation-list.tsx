import { trpc } from "@/lib/trpc/next-client";

export function OrganisationList() {
  const [orgs] = trpc.organisation.list.useSuspenseQuery();
  return (
    <div>
      <h1>Organisations</h1>
      <pre>{JSON.stringify(orgs, null, 2)}</pre>
    </div>
  );
}
