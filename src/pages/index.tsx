import { SignOutButton } from "@/features/auth/sign-out-button";
import { useUser } from "@/features/auth/authenticated-user-provider";
import Link from "next/link";
import { SIGN_IN_URL, SIGN_UP_URL } from "@/features/auth/config";
import { Redirect } from "@/components/redirect";
import { DefaultLayout } from "@/features/auth/default-layout";
import { trpc } from "@/lib/trpc/next-client";
import { Suspense } from "react";
import { PageLoader } from "@/components/page-loader";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

function HomePageInner() {
  const { user } = useUser();

  if (!user) {
    return <Welcome />;
  }
  return (
    <Suspense fallback={<PageLoader />}>
      <OrganisationPicker />
    </Suspense>
  );
}

export default function HomePage() {
  return (
    <DefaultLayout>
      <HomePageInner />
    </DefaultLayout>
  );
}

function Welcome() {
  return (
    <main className="h-screen flex justify-center items-center flex-col">
      <div className="container mx-auto space-y-2 max-w-lg">
        <h1 className="text-3xl font-semibold tracking-tight text-center mb-4">
          Welcome to Placeholder
        </h1>
        <div className="flex flex-col space-y-2">
          <Link href={SIGN_UP_URL} className={buttonVariants({ size: "lg" })}>
            Get Started
          </Link>
          <p className="text-muted-foreground">
            Already a member?{" "}
            <Link className="font-semibold hover:underline" href={SIGN_IN_URL}>
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}

function OrganisationPicker() {
  const [orgs] = trpc.organisation.list.useSuspenseQuery();
  return (
    <main className="min-h-screen flex justify-center items-center flex-col">
      <div className="container mx-auto space-y-2 max-w-lg">
        <h1 className="text-3xl font-semibold tracking-tight text-center mb-4">
          Welcome to Placeholder
        </h1>
      </div>
      <div className="px-2 w-full">
        <div className="flex justify-between mb-2 gap-2 flex-col md:flex-row">
          <p className="text-muted-foreground">Selet an organisation to get going</p>
          <Link className={buttonVariants({ variant: "secondary" })} href="/new">
            Create Organisation
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-2 mb-2">
          {orgs.map((org) => {
            return (
              <Link prefetch={false} key={org.id} className="group" href={`/app/${org.slug}`}>
                <Card key={org.id} className="group-hover:opacity-75 h-full">
                  <CardHeader>
                    <CardTitle>{org.name}</CardTitle>
                    <CardDescription>{org.organisationRole}</CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
      <SignOutButton />
    </main>
  );
}
