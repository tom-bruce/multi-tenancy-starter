import { AuthenticatedProvider } from "@/features/auth/authenticated-user-provider";
import { OrganisationInviteForm } from "@/features/organisation/organisation-invite-form";
import { OrganisationInviteList } from "@/features/organisation/organisation-invite-list";
import { OrganisationList } from "@/features/organisation/organisation-list";
import {
  OrganisationProvider,
  useOrganisation,
} from "@/features/organisation/organisation-provider";
import { Protect } from "@/features/organisation/protect";
import { useOrganisationSlug } from "@/features/organisation/use-organisation-slug";
import { trpc } from "@/lib/trpc/next-client";
import { Suspense } from "react";

export default function OrganisationHomePage() {
  return (
    <AuthenticatedProvider>
      <OrganisationProvider>
        <PageInner />
      </OrganisationProvider>
    </AuthenticatedProvider>
  );
}

function PageInner() {
  const org = useOrganisation();
  return (
    <div>
      <h1>{org.name} Home Page</h1>
      <pre>{JSON.stringify(org, null, 2)}</pre>
      <Suspense>
        <OrganisationList />
      </Suspense>
      <OrganisationInviteList />
      <Protect
        role="admin"
        fallback={<p>Only admins can invite new members to join the organisation.</p>}
      >
        <div className="mx-auto max-w-2xl">
          <OrganisationInviteForm />
          <Suspense fallback={<p>Loading...</p>}>
            <OrganisationInviteList />
          </Suspense>
        </div>
      </Protect>
    </div>
  );
}
