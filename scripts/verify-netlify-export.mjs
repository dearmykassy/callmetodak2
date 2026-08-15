import assert from "node:assert/strict";
import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUTPUT_DIR = path.join(ROOT, "out");
const SITE_URL = "https://callmetodak2.kr";
const fixedRoutes = ["/", "/areas", "/pricing", "/guide", "/notice", "/blog"];

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

const [regionsSnapshot, blogSnapshot, imageRelease] = await Promise.all([
  readJson("src/data/regions.generated.json"),
  readJson("src/data/blog.generated.json"),
  readJson("src/data/image-release.generated.json"),
]);
const blogRoutes = blogSnapshot.posts.map((post) => `/blog/${post.slug}`);
const regionalRoutes = regionsSnapshot.regions.map((region) => region.route);
const expectedRoutes = [...fixedRoutes, ...blogRoutes, ...regionalRoutes];

assert.equal(expectedRoutes.length, 112, "The release must expose 112 public URLs");
assert.equal(new Set(expectedRoutes).size, 112, "The release URL graph must be unique");

const sitemap = await readFile(path.join(OUTPUT_DIR, "sitemap.xml"), "utf8");
const sitemapUrls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/gu)].map((match) => match[1]);
assert.equal(sitemapUrls.length, 112, "The sitemap must contain 112 URLs");
assert.equal(new Set(sitemapUrls).size, 112, "The sitemap must not duplicate URLs");
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

  assert.doesNotMatch(html, /placeholder\.callme-todaki\.local|noindex|nofollow/u);
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

process.stdout.write("Verified Netlify export: 112 URLs, 19 active originals, 57 WebP assets.\n");
