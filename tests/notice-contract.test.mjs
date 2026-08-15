import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const read = (path) => readFile(new URL(path, root), "utf8");

test("desktop and mobile page bars link to the existing notice route", async () => {
  const [home, homeCss, imageCss, blogLayout, blogCss, regionalTemplate, regionalCss] = await Promise.all([
    read("app/page.tsx"),
    read("app/globals.css"),
    read("app/image-release.css"),
    read("app/blog/layout.tsx"),
    read("app/blog/blog.module.css"),
    read("src/components/RegionalTemplate.tsx"),
    read("src/components/RegionalTemplate.module.css"),
  ]);

  assert.match(home, /className="header-link" href="\/notice">공지사항/u);
  assert.match(home, /className="quick-nav"[\s\S]*?href="\/notice">공지사항/u);
  assert.match(blogLayout, /href: "\/notice", label: "공지사항"/u);
  assert.match(regionalTemplate, /className=\{styles\.headerNotice\} href="\/notice">공지사항/u);

  assert.match(homeCss, /@media\(max-width:430px\)\{[\s\S]*?\.header-link,\.header-button/u);
  assert.match(imageCss, /\.topbar\.image-header \.header-link/u);
  assert.match(blogCss, /@media \(max-width: 760px\) \{[\s\S]*?\.pageLinks \{ display: grid; grid-template-columns: repeat\(3, 1fr\);/u);
  assert.match(regionalCss, /@media \(max-width: 700px\) \{[\s\S]*?\.headerNotice, \.headerBlog, \.headerCall/u);
});

test("notice board contains only confirmed operating notices without made-up dates", async () => {
  const [noticePage, sitemap] = await Promise.all([
    read("app/notice/page.tsx"),
    read("app/sitemap.ts"),
  ]);

  assert.match(noticePage, /alternates: \{ canonical: "\/notice" \}/u);
  assert.match(noticePage, /robots: \{ index: true, follow: true \}/u);
  assert.equal((noticePage.match(/code: "0[1-3]"/gu) ?? []).length, 3);
  assert.match(noticePage, /24시간 전화상담/u);
  assert.match(noticePage, /선입금 없는 100% 현장 후불/u);
  assert.match(noticePage, /현장 카드 결제 가능/u);
  assert.match(noticePage, /0508-202-3906/u);
  assert.doesNotMatch(noticePage, /\b20\d{2}[-./]\d{1,2}[-./]\d{1,2}\b/u);
  assert.doesNotMatch(noticePage, /후기|평점|도착\s*시간|배정|관리사|경력|효능/u);
  assert.match(sitemap, /"\/notice"/u);
});
