export const SITE_URL = "https://callmetodak2.kr";

/**
 * Return the one public, indexable URL for an HTML route.
 *
 * The production export uses trailing-slash pages. Keeping this conversion in
 * one place prevents sitemap and structured-data URLs from pointing at the
 * redirecting, slashless aliases.
 */
export function canonicalUrl(route: string): string {
  const url = new URL(route, `${SITE_URL}/`);

  if (
    url.protocol !== "https:" ||
    url.origin !== SITE_URL ||
    url.search !== "" ||
    url.hash !== ""
  ) {
    throw new Error("NON_CANONICAL_SITE_URL");
  }

  if (url.pathname !== "/" && !url.pathname.endsWith("/")) {
    url.pathname = `${url.pathname}/`;
  }

  return url.toString();
}
