import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const read = (path) => readFile(new URL(path, root), "utf8");
const readJson = async (path) => JSON.parse(await read(path));

test("fixed pages retain the locked Callme operating facts", async () => {
  const [areas, pricing, guide, notice, regions] = await Promise.all([
    read("app/areas/page.tsx"), read("app/pricing/page.tsx"), read("app/guide/page.tsx"), read("app/notice/page.tsx"),
    readJson("src/data/regions.generated.json"),
  ]);
  for (const [name, route] of [
    ["서울", "/areas/seoul"],
    ["인천", "/areas/incheon"],
    ["경기", "/areas/gyeonggi"],
    ["천안", "/areas/cheonan"],
    ["아산", "/areas/asan"],
    ["청주", "/areas/cheongju"],
    ["대전", "/areas/daejeon"],
    ["부산", "/areas/busan"],
  ]) {
    assert.match(areas, new RegExp(`name: "${name}", route: "${route}"`, "u"));
  }
  assert.match(areas, /상위 지역에서 연결 지역을 확인하세요\./u);
  assert.match(areas, /각 지역 페이지 하단 카드에서 요청하신 세부 지역으로 이동할 수 있습니다\./u);
  assert.deepEqual(regions.operatingFacts.courses, [
    { name: "센슈얼 감성 테라피", items: [[60, 120000], [90, 150000], [120, 180000]] },
  ]);
  assert.match(pricing, /OPERATING_FACTS\.courses/u);
  assert.match(pricing, /singleCoursePrice/u);
  assert.match(pricing, /선입금 없는 100% 현장 후불/);
  assert.match(guide, /24시간 전화상담/);
  assert.match(guide, /현장 카드 결제 가능/);
  assert.match(notice, /선입금을 요청하지 않습니다/);
  assert.doesNotMatch(`${areas}${pricing}${guide}${notice}`, /후기|평점|도착 시간|관리사|경력/);
  const forbiddenMaleTerm = String.fromCodePoint(0xb0a8, 0xc131, 0xc804, 0xc6a9);
  assert.doesNotMatch(`${areas}${pricing}${guide}${notice}`, new RegExp(forbiddenMaleTerm, "u"));
});
