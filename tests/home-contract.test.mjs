import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const read = (path) => readFile(new URL(path, root), "utf8");

test("Callme Todaki home carries the approved operating slice", async () => {
  const [page, layout, packageJson] = await Promise.all([read("app/page.tsx"), read("app/layout.tsx"), read("package.json")]);
  assert.match(packageJson, /"name": "callme-todaki"/);
  assert.match(layout, /title: \{ default: "콜미토닥이"/);
  assert.match(layout, /robots: \{ index: true, follow: true \}/);
  assert.match(page, /수도권·충청권/);
  assert.match(page, /0508-202-3906/);
  assert.match(page, /24시간 전화상담/);
  assert.match(page, /선입금 없는 현장 후불/);
  assert.match(page, /현장 카드 결제/);
  for (const [name, route] of [["서울", "/areas/seoul"], ["인천", "/areas/incheon"], ["경기", "/areas/gyeonggi"], ["천안", "/areas/cheonan"], ["아산", "/areas/asan"], ["청주", "/areas/cheongju"], ["대전", "/areas/daejeon"]]) {
    assert.match(page, new RegExp(`\\["${name}", "${route}"\\]`));
  }
  assert.match(page, /토닥이 · 여성전용마사지 · 여성전용출장마사지/);
  assert.match(page, /href="\/blog">블로그</u);
  assert.equal((page.match(/\["60분"|\["90분"|\["120분"/g) ?? []).length, 14);
  assert.doesNotMatch(page, /hero\.webp|care\.webp|후기|평점/);
});
