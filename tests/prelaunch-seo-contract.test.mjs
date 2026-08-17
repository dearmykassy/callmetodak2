import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const read = (path) => readFile(new URL(path, root), "utf8");

const fixedPages = [
  ["app/areas/page.tsx", "/areas"],
  ["app/pricing/page.tsx", "/pricing"],
  ["app/guide/page.tsx", "/guide"],
  ["app/notice/page.tsx", "/notice"],
];

test("fixed pages use distinct production metadata and areas links service roots", async () => {
  const sources = await Promise.all(fixedPages.map(([file]) => read(file)));

  for (const [index, [, route]] of fixedPages.entries()) {
    const source = sources[index];
    assert.match(source, new RegExp(`alternates: \\{ canonical: "${route}" \\}`, "u"));
    assert.match(source, /robots: \{ index: true, follow: true \}/u);
    assert.match(source, new RegExp(`url: "${route}"`, "u"));
    assert.match(source, /openGraph:/u);
    assert.match(source, /twitter:/u);
  }

  const openGraphTitles = sources.map((source) => {
    const title = source.match(/openGraph:\s*\{[\s\S]*?title: "([^"]+)"/u)?.[1];
    assert.ok(title);
    return title;
  });
  assert.equal(new Set(openGraphTitles).size, 4);
  assert.match(sources[0], /href=\{area\.route\}/u);
  for (const route of ["/areas/seoul", "/areas/incheon", "/areas/gyeonggi", "/areas/cheonan", "/areas/asan", "/areas/cheongju", "/areas/daejeon", "/areas/busan"]) {
    assert.match(sources[0], new RegExp(`route: "${route}"`, "u"));
  }
});

test("production robots allow crawling while sitemap enumerates every public route", async () => {
  const [sitemap, robots, snapshot, blogSnapshot, site] = await Promise.all([
    read("app/sitemap.ts"),
    read("app/robots.ts"),
    read("src/data/regions.generated.json"),
    read("src/data/blog.generated.json"),
    read("src/data/site.ts"),
  ]);
  const { regions } = JSON.parse(snapshot);
  const { posts } = JSON.parse(blogSnapshot);

  assert.equal(regions.length, 162);
  assert.equal(regions.filter((region) => region.route.startsWith("/areas/busan")).length, 6);
  assert.equal(posts.length, 2);
  assert.equal(6 + posts.length + regions.length, 170, "the public sitemap must contain the expanded 170-URL graph");
  assert.match(sitemap, /const fixedRoutes = \["\/", "\/areas", "\/pricing", "\/guide", "\/notice", "\/blog"\]/u);
  assert.match(sitemap, /BLOG_POSTS\.map\(getBlogPostRoute\)/u);
  assert.match(sitemap, /REGIONS\.map\(\(region\) => region\.route\)/u);
  assert.match(site, /https:\/\/callmetodak2\.kr/u);
  assert.match(sitemap, /import \{ canonicalUrl \} from "@\/src\/data\/site"/u);
  assert.match(sitemap, /url: canonicalUrl\(route\)/u);
  assert.match(robots, /userAgent: "\*"/u);
  assert.match(robots, /allow: "\/"/u);
  assert.doesNotMatch(robots, /disallow: "\/"/u);
  assert.match(robots, /sitemap: `\$\{SITE_URL\}\/sitemap\.xml`/u);
});
