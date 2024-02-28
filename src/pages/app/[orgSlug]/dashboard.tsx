import { useAuthenticatedUser } from "@/features/auth/authenticated-user-provider";
import { OrganisationLayout } from "@/features/organisation/organisation-layout";
import { useOrganisation } from "@/features/organisation/organisation-provider";

export default function OrganisationDashboardPage() {
  return (
    <OrganisationLayout>
      <PageInner />
    </OrganisationLayout>
  );
}

function PageInner() {
  const org = useOrganisation();
  const { user } = useAuthenticatedUser();
  return (
    <div>
      <h1>{org.name} Dashboard</h1>
      <p>Logged in as {user.email}</p>
    </div>
  );
}
