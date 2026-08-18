import type { MetadataRoute } from "next";

import { BLOG_POSTS, getBlogPostRoute } from "@/src/data/blog";
import { REGIONS } from "@/src/data/callme-regions";
import { canonicalUrl } from "@/src/data/site";

export const dynamic = "force-static";

const fixedRoutes = ["/", "/areas", "/pricing", "/guide", "/notice", "/blog"] as const;

// These are pinned to the commits that last changed each public route group.
// They are intentionally not derived from build time: a deploy without a
// content change must not make every sitemap entry look newly modified.
export const FIXED_ROUTE_LAST_MODIFIED = {
  "/": "2026-08-15T23:15:14+09:00", // f3082c43 — regional coverage/home content
  "/areas": "2026-08-15T23:15:14+09:00", // f3082c43 — expanded area directory
  "/pricing": "2026-08-15T21:59:21+09:00", // 927cdf3b — Todaki course pricing
  "/guide": "2026-08-15T13:11:46+09:00", // eadecf87 — production launch
  "/notice": "2026-08-15T13:11:46+09:00", // eadecf87 — production launch
  "/blog": "2026-08-15T13:11:46+09:00", // eadecf87 — production launch
} as const;

// 9a724ac9 is the latest meaningful revision shared by every regional page:
// customer-search-form metadata was shortened on 2026-08-19.
export const REGIONAL_LAST_MODIFIED = "2026-08-19T00:27:35+09:00";

export default function sitemap(): MetadataRoute.Sitemap {
  const fixed = fixedRoutes.map((route) => ({
    url: canonicalUrl(route),
    lastModified: new Date(FIXED_ROUTE_LAST_MODIFIED[route]),
  }));
  const blog = BLOG_POSTS.map((post) => ({
    url: canonicalUrl(getBlogPostRoute(post)),
    lastModified: new Date(post.modifiedAt),
  }));
  const regions = REGIONS.map((region) => ({
    url: canonicalUrl(region.route),
    lastModified: new Date(REGIONAL_LAST_MODIFIED),
  }));

  return [...fixed, ...blog, ...regions];
}
