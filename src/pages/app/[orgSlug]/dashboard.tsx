import {
  AuthenticatedProvider,
  useAuthenticatedUser,
} from "@/features/auth/authenticated-user-provider";
import {
  OrganisationProvider,
  useOrganisation,
} from "@/features/organisation/organisation-provider";

export default function OrganisationDashboardPage() {
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
  const { user } = useAuthenticatedUser();
  return (
    <div>
      <h1>{org.name} Dashboard</h1>
      <p>Logged in as {user.email}</p>
    </div>
  );
}
