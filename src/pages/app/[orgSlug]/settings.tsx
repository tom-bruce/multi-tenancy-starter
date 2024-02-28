import { useAuthenticatedUser } from "@/features/auth/authenticated-user-provider";
import { ForbiddenErrorScreen } from "@/features/errors/forbidden-error-screen";
import { OrganisationLayout } from "@/features/organisation/organisation-layout";
import { useOrganisation } from "@/features/organisation/organisation-provider";
import { Protect } from "@/features/organisation/protect";

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
    <Protect role="admin" fallback={<ForbiddenErrorScreen />}>
      <div>
        <h1>{org.name} Settings</h1>
        <p>Logged in as {user.email}</p>
      </div>
    </Protect>
  );
}
