import { ReactNode } from "react";
import { AuthenticatedProvider } from "../auth/authenticated-user-provider";
import { OrganisationProvider } from "./organisation-provider";
import { OrganisationSelector } from "./organisation-selector";
import { UserDropdown } from "../user/user-dropdown";
import Link from "next/link";
import { useOrganisationSlug } from "./use-organisation-slug";

const ORG_RESOURCES = {
  overview: "/",
  dashboard: "/dashboard",
  settings: "/settings",
};
function orgLink(slug: string, resource: keyof typeof ORG_RESOURCES) {
  return `/app/${slug}${ORG_RESOURCES[resource]}`;
}

function NavLinks() {
  const orgSlug = useOrganisationSlug();
  return (
    <>
      <Link
        href={orgLink(orgSlug, "overview")}
        className="text-sm font-medium transition-colors hover:text-primary"
      >
        Overview
      </Link>
      <Link
        href={orgLink(orgSlug, "dashboard")}
        className="text-sm font-medium transition-colors hover:text-primary"
      >
        Dashboard
      </Link>
      <Link
        href={orgLink(orgSlug, "settings")}
        className="text-sm font-medium transition-colors hover:text-primary"
      >
        Settings
      </Link>
    </>
  );
}
export function OrganisationLayout({ children }: { children: ReactNode }) {
  // TODO prevent the cascade of providers - make the user & org request parallel
  return (
    <OrganisationProvider>
      <header className="flex flex-col">
        <div className="border-b">
          <div className="flex h-16 items-center px-4">
            <OrganisationSelector />
            <nav className="mx-6 space-x-6 flex items-center">
              <NavLinks />
            </nav>
            <div className="ml-auto flex items-center">
              <UserDropdown />
            </div>
          </div>
        </div>
      </header>
      <div>{children}</div>
    </OrganisationProvider>
  );
}
