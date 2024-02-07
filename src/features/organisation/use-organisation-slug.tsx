import { useRouter } from "next/router";

/**
 * Gathers the organisation slug from the URL validates that it is a string. Throws an error otherwise
 */
export function useOrganisationSlug() {
  const router = useRouter();
  const maybeOrgSlug = router.query.orgSlug;
  if (!maybeOrgSlug) {
    throw new Error("Organisation slug is not present in the URL");
  }
  if (Array.isArray(maybeOrgSlug)) {
    throw new Error("Duplicate organisation slugs in the URL");
  }
  return maybeOrgSlug;
}
