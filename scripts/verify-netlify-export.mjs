import assert from "node:assert/strict";
import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUTPUT_DIR = path.join(ROOT, "out");
const SITE_URL = "https://callmetodak2.kr";
const fixedRoutes = ["/", "/areas", "/pricing", "/guide", "/notice", "/blog"];
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

assert.equal(new Set(expectedRoutes).size, expectedRoutes.length, "The release URL graph must be unique");

const sitemap = await readFile(path.join(OUTPUT_DIR, "sitemap.xml"), "utf8");
const sitemapUrls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/gu)].map((match) => match[1]);
assert.equal(sitemapUrls.length, expectedRoutes.length, "The sitemap must contain every public URL");
assert.equal(new Set(sitemapUrls).size, expectedRoutes.length, "The sitemap must not duplicate URLs");
assert.deepEqual(
  new Set(sitemapUrls.map((url) => normalizeRoute(new URL(url).pathname))),
  new Set(expectedRoutes.map(normalizeRoute)),
  "The sitemap must match the static route graph",
);
for (const url of sitemapUrls) assert.equal(new URL(url).origin, SITE_URL, "Sitemap URL must use production domain");

const robots = await readFile(path.join(OUTPUT_DIR, "robots.txt"), "utf8");
assert.match(robots, /Allow: \/$/mu);
assert.doesNotMatch(robots, /Disallow: \/$/mu);
assert.match(robots, /https:\/\/callmetodak2\.kr\/sitemap\.xml/u);

for (const route of expectedRoutes) {
  const pagePath = outputPathForRoute(route);
  await assertRegularFile(pagePath);
  const html = await readFile(pagePath, "utf8");
  const title = metadataValue(html, /<title>([^<]+)<\/title>/u, `title metadata for ${route}`);

  assert.doesNotMatch(html, /placeholder\.callme-todaki\.local|noindex|nofollow/u);
  assert.doesNotMatch(html, new RegExp(FORBIDDEN_MALE_TERM, "u"));
  assert.doesNotMatch(html, LEGACY_COURSES, `Legacy general-massage course leaked into ${route}`);
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
    const regionalKeywords = metadataValue(
      html,
      /<meta name="keywords" content="([^"]+)"/u,
      `regional keywords metadata for ${route}`,
    ).split(",");
    assert.deepEqual(regionalKeywords, regionalContent.keywords, `Regional keyword order must match the snapshot: ${route}`);
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

process.stdout.write(`Verified Netlify export: ${expectedRoutes.length} URLs, 19 active originals, 57 WebP assets.\n`);
