import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const read = (path) => readFile(new URL(path, root), "utf8");

test("RSS publishes complete editorial posts with stable production canonicals", async () => {
  const [route, helper, site, layout, blogSnapshot] = await Promise.all([
    read("app/rss.xml/route.ts"),
    read("src/lib/rss.ts"),
    read("src/data/site.ts"),
    read("app/layout.tsx"),
    read("src/data/blog.generated.json"),
  ]);
  const { posts } = JSON.parse(blogSnapshot);

  assert.equal(posts.length, 2);
  assert.match(route, /feedUrl: `\$\{SITE_URL\}\/rss\.xml`/u);
  assert.match(route, /url: canonicalUrl\(getBlogPostRoute\(post\)\)/u);
  assert.match(route, /post\.intro,[\s\S]*?post\.sections\.flatMap/u);
  assert.match(route, /publishedAt: post\.publishedAt/u);
  assert.match(route, /modifiedAt: post\.modifiedAt/u);
  assert.match(helper, /RSS_REQUIRES_AT_LEAST_ONE_ITEM/u);
  assert.match(helper, /RSS_NON_CANONICAL_OR_CROSS_ORIGIN_URL/u);
  assert.match(helper, /RSS_DUPLICATE_ITEM_URL/u);
  assert.match(helper, /RSS_MODIFIED_BEFORE_PUBLISHED/u);
  assert.match(site, /url\.pathname = `\$\{url\.pathname\}\//u);
  assert.match(layout, /rel="alternate"[\s\S]*?type="application\/rss\+xml"[\s\S]*?href="\/rss\.xml"/u);

  for (const post of posts) {
    assert.equal(post.publishedAt, "2026-08-15T13:11:46+09:00");
    assert.equal(post.modifiedAt, post.publishedAt);
    assert.ok(post.intro.length > 100);
    assert.equal(post.sections.length, 4);
  }
});

test("RSS route is static and returns the XML media type", async () => {
  const route = await read("app/rss.xml/route.ts");
  assert.match(route, /export const dynamic = "force-static"/u);
  assert.match(route, /export const revalidate = false/u);
  assert.match(route, /"Content-Type": "application\/rss\+xml; charset=utf-8"/u);
});
