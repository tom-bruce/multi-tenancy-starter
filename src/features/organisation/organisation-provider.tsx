import { RouterOutput, trpc } from "@/lib/trpc/next-client";
import { createContext, useContext } from "react";
import { ForbiddenErrorScreen } from "../errors/forbidden-error-screen";
import { UnknownErrorScreen } from "../errors/unknown-error-screen";
import { PageLoader } from "@/components/page-loader";
import { useRouter } from "next/router";
import { VerifiedEmailGuard, authenticatedAuthContext } from "../auth/authenticated-user-provider";
import { SIGN_IN_URL } from "../auth/config";
import { Redirect } from "@/components/redirect";

type OrganisationContext = RouterOutput["organisation"]["bySlug"];

const organisationContext = createContext<OrganisationContext | null>(null);

export function OrganisationProvider({ children }: { children: React.ReactNode }) {
  const userQuery = trpc.user.me.useQuery(undefined, { retry: false });

  const router = useRouter();
  // Note we can't use useOrganisationSlug because this page might be server rendered
  const maybeOrgSlug = router.query.orgSlug;
  const orgQuery = trpc.organisation.bySlug.useQuery(
    { orgSlug: maybeOrgSlug as string },
    { enabled: !!maybeOrgSlug }
  );
  if (userQuery.isLoading || orgQuery.isLoading) {
    return <PageLoader />;
  }
  if (userQuery.isError) {
    return <div>Unexpected user error</div>;
  }

  if (!userQuery.data) {
    // This shouldn't happen
    return <UnknownErrorScreen />;
  }
  if (userQuery.data.user === null) {
    const url = new URL(SIGN_IN_URL, window.location.origin);
    url.searchParams.set("returnUrl", router.asPath);
    return <Redirect url={url} />;
  }

  if (orgQuery.isError) {
    if (orgQuery.error.data?.code === "FORBIDDEN") {
      return <ForbiddenErrorScreen />;
    }
    return <UnknownErrorScreen />;
  }

  if (!orgQuery.data) {
    return <UnknownErrorScreen />;
  }
  return (
    <authenticatedAuthContext.Provider value={{ user: userQuery.data.user }}>
      <VerifiedEmailGuard>
        <organisationContext.Provider value={orgQuery.data}>
          {children}
        </organisationContext.Provider>
      </VerifiedEmailGuard>
    </authenticatedAuthContext.Provider>
  );
}

export function useOrganisation() {
  const ctx = useContext(organisationContext);
  if (!ctx) {
    throw new Error("useOrganisation must be used within an OrganisationProvider");
  }
  return ctx;
}
