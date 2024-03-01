import { AuthenticatedLayout } from "@/features/auth/authenticated-layout";
import { CreateOrganisationForm } from "@/features/organisation/create-organisation-form";
import { OrganisationList } from "@/features/organisation/organisation-list";
import { Suspense } from "react";

export default function OrganisationPage() {
  return (
    <AuthenticatedLayout>
      <main>
        <CreateOrganisationForm />
        <Suspense fallback="Loading Organisations...">
          <OrganisationList />
        </Suspense>
      </main>
    </AuthenticatedLayout>
  );
}
