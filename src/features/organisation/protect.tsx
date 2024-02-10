import { ReactNode } from "react";
import { useOrganisation } from "./organisation-provider";
import type { OrganisationRole } from "@/lib/db/schema/members";

interface ProtectProps {
  children: ReactNode;
  role: OrganisationRole;
  fallback?: ReactNode;
}
export function Protect({ children, role, fallback }: ProtectProps) {
  const org = useOrganisation();
  if (org.organisationRole !== role) {
    return fallback ?? null;
  }
  return children;
}
