import assert from "node:assert/strict";
import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUTPUT_DIR = path.join(ROOT, "out");
const SITE_URL = "https://callmetodak2.kr";
const fixedRoutes = ["/", "/areas", "/pricing", "/guide", "/notice", "/blog"];
const fixedRouteLastModified = new Map([
  ["/", "2026-08-15T23:15:14+09:00"],
  ["/areas", "2026-08-15T23:15:14+09:00"],
  ["/pricing", "2026-08-15T21:59:21+09:00"],
  ["/guide", "2026-08-15T13:11:46+09:00"],
  ["/notice", "2026-08-15T13:11:46+09:00"],
  ["/blog", "2026-08-15T13:11:46+09:00"],
]);
const REGIONAL_LAST_MODIFIED = "2026-08-19T00:27:35+09:00";
const HOME_METADATA_TITLE = "토닥이 | 여성전용마사지 | 여성전용출장마사지 | 콜미토닥이";
const HOME_METADATA_KEYWORDS = [
  "토닥이",
  "여성전용마사지",
  "여성전용출장마사지",
  "수도권 여성전용출장마사지",
  "지역별 여성전용마사지",
  "24시간 전화상담",
];
const FORBIDDEN_MALE_TERM = String.fromCodePoint(0xb0a8, 0xc131, 0xc804, 0xc6a9);
const TODAKI_COURSE = "센슈얼 감성 테라피";
const TODAKI_PRICES = ["120,000원", "150,000원", "180,000원"];
const LEGACY_COURSES = /타이|아로마|힐링|스페셜/u;

const normalizeRoute = (route) => {
  const decodedRoute = decodeURIComponent(route);
  return decodedRoute === "/" ? decodedRoute : decodedRoute.replace(/\/+$/u, "");
};

async function readJson(relativePath) {
  return JSON.parse(await readFile(path.join(ROOT, relativePath), "utf8"));
}

async function assertRegularFile(filePath) {
  assert.ok((await stat(filePath)).isFile(), `Missing expected export file: ${filePath}`);
}

function outputPathForRoute(route) {
  return route === "/"
    ? path.join(OUTPUT_DIR, "index.html")
    : path.join(OUTPUT_DIR, route.slice(1), "index.html");
}

function assertRouteMatches(url, route, label) {
  const parsed = new URL(url);
  assert.equal(parsed.origin, SITE_URL, `${label} must use the production domain`);
  assert.equal(normalizeRoute(parsed.pathname), normalizeRoute(route), `${label} must match ${route}`);
}

function metadataValue(html, expression, label) {
  const value = html.match(expression)?.[1];
  assert.ok(value, `Missing ${label}`);
  return value;
}

function headMarkup(html) {
  return html.match(/<head(?:\s[^>]*)?>([\s\S]*?)<\/head>/iu)?.[1] ?? "";
}

function attributes(tag) {
  const result = new Map();
  for (const match of tag.matchAll(/([^\s=/>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/gu)) {
    result.set(match[1].toLowerCase(), match[2] ?? match[3] ?? match[4] ?? "");
  }
  return result;
}

function escapeXml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

async function listFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const descendants = await Promise.all(entries.map(async (entry) => {
    const entryPath = path.join(directory, entry.name);
    return entry.isDirectory() ? listFiles(entryPath) : [entryPath];
  }));
  return descendants.flat();
}

const [regionsSnapshot, blogSnapshot, imageRelease, regionalContentSnapshot] = await Promise.all([
  readJson("src/data/regions.generated.json"),
  readJson("src/data/blog.generated.json"),
  readJson("src/data/image-release.generated.json"),
  readJson("src/data/region-content.generated.json"),
]);
const blogRoutes = blogSnapshot.posts.map((post) => `/blog/${post.slug}`);
const regionalRoutes = regionsSnapshot.regions.map((region) => region.route);
const regionalContentByRoute = new Map(
  regionalContentSnapshot.documents.map((document) => [document.route, document]),
);
const expectedRoutes = [...fixedRoutes, ...blogRoutes, ...regionalRoutes];
const expectedLastModifiedByRoute = new Map([
  ...fixedRouteLastModified,
  ...blogSnapshot.posts.map((post) => [`/blog/${post.slug}`, post.modifiedAt]),
  ...regionalRoutes.map((route) => [route, REGIONAL_LAST_MODIFIED]),
]);

assert.equal(new Set(expectedRoutes).size, expectedRoutes.length, "The release URL graph must be unique");
assert.equal(expectedLastModifiedByRoute.size, expectedRoutes.length, "Every public URL needs one lastmod source");

const sitemap = await readFile(path.join(OUTPUT_DIR, "sitemap.xml"), "utf8");
const sitemapUrls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/gu)].map((match) => match[1]);
const sitemapEntries = [...sitemap.matchAll(/<url>\s*<loc>([^<]+)<\/loc>\s*<lastmod>([^<]+)<\/lastmod>\s*<\/url>/gu)]
  .map((match) => ({ url: match[1], lastModified: match[2] }));
assert.equal(sitemapUrls.length, expectedRoutes.length, "The sitemap must contain every public URL");
assert.equal(new Set(sitemapUrls).size, expectedRoutes.length, "The sitemap must not duplicate URLs");
assert.equal(sitemapEntries.length, expectedRoutes.length, "Every sitemap URL must have exactly one lastmod");
assert.doesNotMatch(sitemap, /<(?:changefreq|priority)>/u, "Sitemap must omit ignored priority/changefreq hints");
assert.deepEqual(
  new Set(sitemapUrls.map((url) => normalizeRoute(new URL(url).pathname))),
  new Set(expectedRoutes.map(normalizeRoute)),
  "The sitemap must match the static route graph",
);
for (const url of sitemapUrls) {
  const parsed = new URL(url);
  assert.equal(parsed.origin, SITE_URL, "Sitemap URL must use production domain");
  assert.equal(parsed.search, "", "Sitemap URL must not contain a query");
  assert.equal(parsed.hash, "", "Sitemap URL must not contain a fragment");
  assert.ok(
    parsed.pathname === "/" || parsed.pathname.endsWith("/"),
    `Sitemap URL must be the non-redirecting trailing-slash canonical: ${url}`,
  );
}
for (const entry of sitemapEntries) {
  const route = normalizeRoute(new URL(entry.url).pathname);
  const expected = expectedLastModifiedByRoute.get(route);
  assert.ok(expected, `Missing lastmod provenance for ${route}`);
  const parsed = new Date(entry.lastModified);
  assert.ok(Number.isFinite(parsed.valueOf()), `Invalid sitemap lastmod for ${route}`);
  assert.ok(parsed.valueOf() <= Date.now(), `Future sitemap lastmod for ${route}`);
  assert.equal(parsed.toISOString(), new Date(expected).toISOString(), `Sitemap lastmod drift for ${route}`);
}

const notFoundHtml = await readFile(path.join(OUTPUT_DIR, "404.html"), "utf8");
const notFoundHead = headMarkup(notFoundHtml);
const notFoundCanonicalLinks = [...notFoundHead.matchAll(/<link\b[^>]*>/giu)].filter((match) =>
  attributes(match[0]).get("rel") === "canonical"
);
const notFoundRobots = [...notFoundHead.matchAll(/<meta\b[^>]*>/giu)].flatMap((match) => {
  const attrs = attributes(match[0]);
  return attrs.get("name") === "robots" ? [attrs.get("content") ?? ""] : [];
});
assert.equal(notFoundCanonicalLinks.length, 0, "404 HTML must not inherit the homepage canonical");
assert.ok(notFoundRobots.some((value) => value.includes("noindex")), "404 HTML must remain noindex");
assert.ok(
  notFoundRobots.every((value) => !/^index(?:,|$)/u.test(value)),
  "404 HTML must not inherit an index directive",
);

const robots = await readFile(path.join(OUTPUT_DIR, "robots.txt"), "utf8");
assert.match(robots, /Allow: \/$/mu);
assert.doesNotMatch(robots, /Disallow: \/$/mu);
assert.match(robots, /https:\/\/callmetodak2\.kr\/sitemap\.xml/u);

const rssPath = path.join(OUTPUT_DIR, "rss.xml");
await assertRegularFile(rssPath);
const rss = await readFile(rssPath, "utf8");
assert.ok(Buffer.byteLength(rss, "utf8") < 10 * 1024 * 1024, "RSS must remain below Naver's 10 MB limit");
assert.match(rss, /^<\?xml version="1\.0" encoding="UTF-8"\?>/u);
assert.match(rss, /<rss version="2\.0" xmlns:atom="http:\/\/www\.w3\.org\/2005\/Atom">/u);
assert.match(rss, /<language>ko-KR<\/language>/u);
assert.match(
  rss,
  /<atom:link href="https:\/\/callmetodak2\.kr\/rss\.xml" rel="self" type="application\/rss\+xml" \/>/u,
);

const rssItems = [...rss.matchAll(/<item>([\s\S]*?)<\/item>/gu)].map((match) => match[1]);
assert.equal(rssItems.length, blogSnapshot.posts.length, "RSS must include every dated editorial post");
assert.equal(new Set(rssItems.map((item) => metadataValue(item, /<link>([^<]+)<\/link>/u, "RSS item link"))).size, rssItems.length, "RSS item links must be unique");
const latestModifiedAt = new Date(
  Math.max(...blogSnapshot.posts.map((post) => new Date(post.modifiedAt).valueOf())),
).toUTCString();
assert.match(rss, new RegExp(`<lastBuildDate>${latestModifiedAt.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&")}<\\/lastBuildDate>`, "u"));

for (const post of blogSnapshot.posts) {
  const canonical = `${SITE_URL}/blog/${post.slug}/`;
  const item = rssItems.find((candidate) => candidate.includes(`<link>${canonical}</link>`));
  assert.ok(item, `RSS must include canonical item ${canonical}`);
  assert.match(item, new RegExp(`<guid isPermaLink="true">${canonical.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&")}<\\/guid>`, "u"));
  assert.ok(item.includes(`<pubDate>${new Date(post.publishedAt).toUTCString()}</pubDate>`));
  assert.ok(item.includes(escapeXml(post.intro)), `RSS must include the full intro for ${post.slug}`);
  for (const section of post.sections) {
    assert.ok(item.includes(escapeXml(section.heading)), `RSS must include ${section.heading}`);
    for (const paragraph of section.paragraphs) {
      assert.ok(item.includes(escapeXml(paragraph)), `RSS must include the full body for ${post.slug}`);
    }
  }
}

for (const route of expectedRoutes) {
  const pagePath = outputPathForRoute(route);
  await assertRegularFile(pagePath);
  const html = await readFile(pagePath, "utf8");
  const title = metadataValue(html, /<title>([^<]+)<\/title>/u, `title metadata for ${route}`);

  assert.doesNotMatch(html, /placeholder\.callme-todaki\.local|noindex|nofollow/u);
  assert.doesNotMatch(html, new RegExp(FORBIDDEN_MALE_TERM, "u"));
  assert.doesNotMatch(html, LEGACY_COURSES, `Legacy general-massage course leaked into ${route}`);
  assert.equal(
    (html.match(/type="application\/rss\+xml"/gu) ?? []).length,
    1,
    `Each HTML page must expose exactly one RSS autodiscovery link: ${route}`,
  );
  assert.match(html, /<link rel="alternate" type="application\/rss\+xml" title="콜미토닥이 블로그 RSS" href="\/rss\.xml"\/>/u);
  assertRouteMatches(
    metadataValue(html, /<link rel="canonical" href="([^"]+)"/u, `canonical metadata for ${route}`),
    route,
    `Canonical metadata for ${route}`,
  );
  assertRouteMatches(
    metadataValue(html, /<meta property="og:url" content="([^"]+)"/u, `Open Graph URL for ${route}`),
    route,
    `Open Graph URL for ${route}`,
  );
  assert.ok(html.includes('name="twitter:title"'), `Missing Twitter title for ${route}`);
  assert.ok(html.includes('name="twitter:description"'), `Missing Twitter description for ${route}`);

  if (route === "/") {
    assert.equal(title, HOME_METADATA_TITLE, "Home title must lead with the approved core keywords");
    const homeKeywords = metadataValue(
      html,
      /<meta name="keywords" content="([^"]+)"/u,
      "home keywords metadata",
    ).split(",");
    assert.deepEqual(homeKeywords, HOME_METADATA_KEYWORDS, "Home keywords must preserve the approved order");
  }

  const regionalContent = regionalContentByRoute.get(route);
  if (route === "/" || route === "/pricing" || regionalContent) {
    assert.ok(html.includes(TODAKI_COURSE), `Missing the Todaki signature course on ${route}`);
    for (const price of TODAKI_PRICES) {
      assert.ok(html.includes(price), `Missing ${price} on ${route}`);
    }
  }
  if (regionalContent) {
    assert.equal(title, regionalContent.title, `Regional title must not receive the layout suffix twice: ${route}`);
    assert.equal(
      metadataValue(html, /<meta name="description" content="([^"]+)"/u, `regional description metadata for ${route}`),
      regionalContent.description,
      `Regional description must match the concise search snapshot: ${route}`,
    );
    const regionalKeywords = metadataValue(
      html,
      /<meta name="keywords" content="([^"]+)"/u,
      `regional keywords metadata for ${route}`,
    ).split(",");
    assert.deepEqual(regionalKeywords, regionalContent.keywords, `Regional keyword order must match the snapshot: ${route}`);
    assert.equal(
      metadataValue(html, /<meta property="og:description" content="([^"]+)"/u, `Open Graph description for ${route}`),
      regionalContent.description,
      `Open Graph description must match the concise search snapshot: ${route}`,
    );
    assert.equal(
      metadataValue(html, /<meta name="twitter:description" content="([^"]+)"/u, `Twitter description for ${route}`),
      regionalContent.description,
      `Twitter description must match the concise search snapshot: ${route}`,
    );
  }

  for (const match of html.matchAll(/<meta name="twitter:image" content="([^"]+)"/gu)) {
    assert.equal(new URL(match[1]).origin, SITE_URL, `Twitter image for ${route} must use production domain`);
  }
}

assert.equal(imageRelease.status, "ACTIVE", "Image release must remain ACTIVE");
const releasedImages = [imageRelease.home, ...Object.values(imageRelease.regions)];
assert.equal(new Set(releasedImages.map((image) => image.assetId)).size, 19, "Release must retain 19 source images");
const webpFiles = new Set(releasedImages.flatMap((image) => Object.values(image.files)));
assert.equal(webpFiles.size, 57, "Release must retain 57 WebP derivatives");

const exportedWebpFiles = (await listFiles(path.join(OUTPUT_DIR, "images", "callme-todaki", "v1")))
  .filter((file) => file.endsWith(".webp"));
assert.equal(exportedWebpFiles.length, 57, "Netlify export must include 57 WebP files");
for (const webpFile of webpFiles) await assertRegularFile(path.join(OUTPUT_DIR, webpFile));

process.stdout.write(`Verified Netlify export: ${expectedRoutes.length} canonical URLs with stable lastmod, ${rssItems.length} RSS items, 19 active originals, 57 WebP assets, isolated 404 metadata.\n`);
