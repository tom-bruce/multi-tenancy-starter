const ORG_RESOURCES = {
  overview: "/",
  dashboard: "/dashboard",
  settings: "/settings",
};
export function orgLink(slug: string, resource: keyof typeof ORG_RESOURCES) {
  return `/app/${slug}${ORG_RESOURCES[resource]}`;
}
