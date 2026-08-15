import type { MetadataRoute } from "next";

import { BLOG_POSTS, getBlogPostRoute } from "@/src/data/blog";
import { REGIONS } from "@/src/data/callme-regions";
import { SITE_URL } from "@/src/data/site";

export const dynamic = "force-static";

const fixedRoutes = ["/", "/areas", "/pricing", "/guide", "/notice", "/blog"] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  return [...fixedRoutes, ...BLOG_POSTS.map(getBlogPostRoute), ...REGIONS.map((region) => region.route)].map((route) => ({
    url: new URL(route, SITE_URL).toString(),
  }));
}
