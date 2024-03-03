import { SignOutButton } from "@/features/auth/sign-out-button";
import { useUser } from "@/features/auth/authenticated-user-provider";
import Link from "next/link";
import { SIGN_IN_URL, SIGN_UP_URL } from "@/features/auth/config";
import { DefaultLayout } from "@/features/auth/default-layout";
import { trpc } from "@/lib/trpc/next-client";
import { Suspense } from "react";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Icons } from "@/components/ui/icons";

function HomePageInner() {
  const { user } = useUser();

  return (
    <main className="h-screen flex justify-center items-center flex-col space-y-2">
      <div className="container mx-auto space-y-2 max-w-lg">
        <h1 className="text-3xl font-semibold tracking-tight text-center mb-4">
          Welcome to Placeholder
        </h1>
        {!user ? (
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
        ) : null}
      </div>
      <Suspense
        fallback={
          <div className="h-52 grid place-items-center">
            <Icons.spinner className="animate-spin text-muted-foreground h-12 w-12" />
          </div>
        }
      >
        {user ? <OrganisationPicker /> : null}
      </Suspense>
      {user ? <SignOutButton /> : null}
    </main>
  );
}

export default function HomePage() {
  return (
    <DefaultLayout>
      <HomePageInner />
    </DefaultLayout>
  );
}

function OrganisationPicker() {
  const [orgs] = trpc.organisation.list.useSuspenseQuery();

  if (!orgs.length) {
    return (
      <div>
        <p className="text-muted-foreground">
          Looks like you are not a member of any existing organisations.
        </p>
        <Link
          className={buttonVariants({ variant: "outline", className: "w-full mt-2" })}
          href="/new"
        >
          Create Organisation
        </Link>
      </div>
    );
  }

  return (
    <div className="px-2 max-w-screen-xl">
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
                  <CardTitle className="overflow-hidden text-ellipsis text-nowrap leading-tight">
                    {org.name}
                  </CardTitle>
                  <CardDescription>{org.organisationRole}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
