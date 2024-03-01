import { AuthenticatedLayout } from "@/features/auth/authenticated-layout";
import {
  AuthenticatedProvider,
  AuthenticationProvider,
} from "@/features/auth/authenticated-user-provider";
import { CreateOrganisationForm } from "@/features/organisation/create-organisation-form";

export default function NewOrganisationPage() {
  return (
    <AuthenticatedLayout>
      <main className="h-screen flex justify-center items-center flex-col">
        <div className="container mx-auto space-y-2 max-w-lg">
          <h1 className="text-3xl font-semibold tracking-tight text-center">
            Create an Organisation
          </h1>
          <CreateOrganisationForm />
          {/* <p className="text-muted-foreground text-center">Setup your email and password</p> */}
        </div>
      </main>
    </AuthenticatedLayout>
  );
}
