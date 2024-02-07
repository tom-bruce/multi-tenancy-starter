import { trpc } from "@/lib/trpc/next-client";
import Link from "next/link";

export function OrganisationList() {
  const [orgs] = trpc.organisation.list.useSuspenseQuery();
  return (
    <div className="flex gap-8">
      {orgs.map((org) => (
        <Link className="font-bold" href={`/app/${org.slug}`} key={org.id}>
          {org.name}
        </Link>
      ))}
    </div>
  );
}
