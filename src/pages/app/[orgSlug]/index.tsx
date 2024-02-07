import { AuthenticatedProvider } from "@/features/auth/authenticated-user-provider";
import { OrganisationList } from "@/features/organisation/organisation-list";
import {
  OrganisationProvider,
  useOrganisation,
} from "@/features/organisation/organisation-provider";
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
    </div>
  );
}
