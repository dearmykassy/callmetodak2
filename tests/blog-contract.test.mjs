import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const read = (file) => readFile(new URL(file, root), "utf8");
const readJson = async (file) => JSON.parse(await read(file));

test("Callme blog keeps two distinct, substantive, independently written guides", async () => {
  const snapshot = await readJson("src/data/blog.generated.json");
  const { posts } = snapshot;

  assert.equal(snapshot.schemaVersion, "callme-todaki-blog/v1");
  assert.equal(posts.length, 2);
  assert.deepEqual(posts.map((post) => post.slug), [
    "masaji-shop-gagi-himdeul-ttae",
    "jibeseo-masaji-badeul-su-issnayo",
  ]);
  assert.equal(new Set(posts.map((post) => post.title)).size, 2);
  assert.equal(new Set(posts.map((post) => post.description)).size, 2);
  assert.equal(new Set(posts.map((post) => post.h1)).size, 2);

  for (const post of posts) {
    const articleText = [post.intro, ...post.sections.flatMap((section) => section.paragraphs)].join("");
    assert.ok(articleText.length >= 900 && articleText.length <= 1400, `${post.slug} body must be 900–1400 characters`);
    assert.match(articleText, /24시간 전화상담/u);
    assert.match(articleText, /100% 현장 후불/u);
    assert.match(articleText, /현장 카드 결제/u);
    assert.doesNotMatch(articleText, /후기|평점|도착\s*시간|배정|관리사|경력|효능/u);
    assert.notEqual(post.slug, post.relatedSlug);
  }
});

test("blog routes use production-indexable metadata, JSON-LD, and required internal links", async () => {
  const [hub, postPage, layout, sitemap, home] = await Promise.all([
    read("app/blog/page.tsx"),
    read("app/blog/[slug]/page.tsx"),
    read("app/blog/layout.tsx"),
    read("app/sitemap.ts"),
    read("app/page.tsx"),
  ]);

  assert.match(hub, /alternates: \{ canonical: "\/blog" \}/u);
  assert.match(hub, /robots: \{ index: true, follow: true \}/u);
  assert.match(postPage, /generateStaticParams/u);
  assert.match(postPage, /generateMetadata/u);
  assert.match(postPage, /robots: \{ index: true, follow: true \}/u);
  assert.match(postPage, /"@type": "BlogPosting"/u);
  assert.match(postPage, /href="\/areas"/u);
  assert.match(postPage, /href="tel:05082023906"/u);
  assert.equal((postPage.match(/images: \[\]/gu) ?? []).length, 2);
  assert.match(layout, /href: "\/blog", label: "블로그"/u);
  assert.match(home, /href="\/blog">블로그/u);
  assert.match(sitemap, /BLOG_POSTS\.map\(getBlogPostRoute\)/u);
});
