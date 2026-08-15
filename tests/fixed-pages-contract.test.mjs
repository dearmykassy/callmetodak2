import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const read = (path) => readFile(new URL(path, root), "utf8");

test("fixed pages retain the locked Callme operating facts", async () => {
  const [areas, pricing, guide, notice] = await Promise.all([
    read("app/areas/page.tsx"), read("app/pricing/page.tsx"), read("app/guide/page.tsx"), read("app/notice/page.tsx"),
  ]);
  for (const [name, route] of [
    ["서울", "/areas/seoul"],
    ["인천", "/areas/incheon"],
    ["경기", "/areas/gyeonggi"],
    ["천안", "/areas/cheonan"],
    ["아산", "/areas/asan"],
    ["청주", "/areas/cheongju"],
    ["대전", "/areas/daejeon"],
  ]) {
    assert.match(areas, new RegExp(`name: "${name}", route: "${route}"`, "u"));
  }
  assert.match(areas, /동·읍·면·군 페이지는 만들지 않습니다/);
  assert.equal((pricing.match(/\["60분"|\["90분"|\["120분"/g) ?? []).length, 12);
  assert.match(pricing, /선입금 없는 100% 현장 후불/);
  assert.match(guide, /24시간 전화상담/);
  assert.match(guide, /현장 카드 결제 가능/);
  assert.match(notice, /선입금을 요청하지 않습니다/);
  assert.doesNotMatch(`${areas}${pricing}${guide}${notice}`, /후기|평점|도착 시간|관리사|경력/);
  const forbiddenMaleTerm = String.fromCodePoint(0xb0a8, 0xc131, 0xc804, 0xc6a9);
  assert.doesNotMatch(`${areas}${pricing}${guide}${notice}`, new RegExp(forbiddenMaleTerm, "u"));
});
