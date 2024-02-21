import { RouterOutput, trpc } from "@/lib/trpc/next-client";
import { createContext, useContext } from "react";
import { ForbiddenErrorScreen } from "../errors/forbidden-error-screen";
import { UnknownErrorScreen } from "../errors/unknown-error-screen";
import { useOrganisationSlug } from "./use-organisation-slug";
import { PageLoader } from "@/components/page-loader";

type OrganisationContext = RouterOutput["organisation"]["bySlug"];

const organisationContext = createContext<OrganisationContext | null>(null);

export function OrganisationProvider({ children }: { children: React.ReactNode }) {
  const orgSlug = useOrganisationSlug();
  const orgQuery = trpc.organisation.bySlug.useQuery({ orgSlug });
  if (orgQuery.isError) {
    if (orgQuery.error.data?.code === "FORBIDDEN") {
      return <ForbiddenErrorScreen />;
    }
    return <UnknownErrorScreen />;
  }
  if (orgQuery.isLoading) {
    return <PageLoader />;
  }
  if (!orgQuery.data) {
    return <UnknownErrorScreen />;
  }
  return (
    <organisationContext.Provider value={orgQuery.data}>{children}</organisationContext.Provider>
  );
}

export function useOrganisation() {
  const ctx = useContext(organisationContext);
  if (!ctx) {
    throw new Error("useOrganisation must be used within an OrganisationProvider");
  }
  return ctx;
}
