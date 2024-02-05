import { AuthenticatedProvider } from "@/features/auth/authenticated-user-provider";
import { CreateOrganisationForm } from "@/features/organisation/create-organisation-form";
import { OrganisationList } from "@/features/organisation/organisation-list";
import { Suspense } from "react";

export default function OrganisationPage() {
  return (
    <AuthenticatedProvider>
      <main>
        <CreateOrganisationForm />
        <Suspense fallback="Loading Organisations...">
          <OrganisationList />
        </Suspense>
      </main>
    </AuthenticatedProvider>
  );
}
