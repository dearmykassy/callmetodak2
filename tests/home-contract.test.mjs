import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const read = (path) => readFile(new URL(path, root), "utf8");
const readJson = async (path) => JSON.parse(await read(path));

test("Callme Todaki home carries the approved operating slice", async () => {
  const [page, layout, packageJson, regions] = await Promise.all([
    read("app/page.tsx"),
    read("app/layout.tsx"),
    read("package.json"),
    readJson("src/data/regions.generated.json"),
  ]);
  assert.match(packageJson, /"name": "callme-todaki"/);
  const homeTitle = "토닥이 | 여성전용마사지 | 여성전용출장마사지 | 콜미토닥이";
  const coreKeywords = ["토닥이", "여성전용마사지", "여성전용출장마사지"];
  assert.match(layout, new RegExp(`const HOME_METADATA_TITLE = "${homeTitle}"`, "u"));
  assert.match(layout, /title: \{ default: HOME_METADATA_TITLE, template: "%s \| 콜미토닥이" \}/u);
  assert.match(layout, /keywords: HOME_METADATA_KEYWORDS/u);
  assert.match(layout, /openGraph:\s*\{[\s\S]*?title: HOME_METADATA_TITLE/u);
  assert.match(layout, /twitter:\s*\{[\s\S]*?title: HOME_METADATA_TITLE/u);
  const keywordBlock = layout.match(/const HOME_METADATA_KEYWORDS = \[([\s\S]*?)\];/u)?.[1];
  assert.ok(keywordBlock);
  const homeKeywords = [...keywordBlock.matchAll(/"([^"]+)"/gu)].map((match) => match[1]);
  assert.deepEqual(homeKeywords.slice(0, coreKeywords.length), coreKeywords);
  assert.doesNotMatch(layout, /robots: \{ index: true, follow: true \}/);
  assert.doesNotMatch(layout, /alternates: \{ canonical: "\/" \}/);
  assert.match(page, /robots: \{ index: true, follow: true \}/);
  assert.match(page, /alternates: \{ canonical: "\/" \}/);
  assert.match(page, /수도권·충청권/);
  assert.match(page, /0508-202-3906/);
  assert.match(page, /24시간 전화상담/);
  assert.match(page, /선입금 없는 현장 후불/);
  assert.match(page, /현장 카드 결제/);
  for (const [name, route] of [["서울", "/areas/seoul"], ["인천", "/areas/incheon"], ["경기", "/areas/gyeonggi"], ["천안", "/areas/cheonan"], ["아산", "/areas/asan"], ["청주", "/areas/cheongju"], ["대전", "/areas/daejeon"], ["부산", "/areas/busan"]]) {
    assert.match(page, new RegExp(`\\["${name}", "${route}"\\]`));
  }
  assert.match(page, /토닥이 · 여성전용마사지 · 여성전용출장마사지/);
  assert.match(page, /href="\/blog">블로그</u);
  const canonicalFaqs = [
    ["질문 1. 선입금이 정말로 전혀 없나요?", "답변. 네, 어떠한 사전 예약금도 없는 100% 현장 후불제입니다."],
    ["질문 2. 콜미토닥이 서비스 지역 방문이 가능한가요?", "답변. 방문 가능 여부는 희망 날짜와 시각을 함께 알려주시면 예약 확정 전에 확인해 드립니다."],
    ["질문 3. 전화상담에서 무엇을 확인하나요?", "답변. 서비스를 받을 정확한 주소, 희망 시각, 코스와 이용 시간은 전화상담에서 확인합니다."],
    ["질문 4. 현장 카드 결제가 가능한가요?", "답변. 네, 무선 단말기를 소지하여 현장에서 즉시 결제 가능합니다."],
    ["질문 5. 커플/부부 관리도 되나요?", "답변. 네, 2인 동시 관리 프로그램이 완비되어 있습니다."],
    ["질문 6. 새벽 시간에도 이용 가능하나요?", "답변. 네, 365일 24시간 연중무휴로 운영됩니다."],
    ["질문 7. 위생 관리는 철저한가요?", "답변. 네, 일회용 비품 사용 및 철저한 소독을 준수합니다."],
  ];
  assert.equal((page.match(/\["질문 [1-7]\./gu) ?? []).length, canonicalFaqs.length);
  for (const [question, answer] of canonicalFaqs) {
    assert.ok(page.includes(question));
    assert.ok(page.includes(answer));
  }
  assert.deepEqual(regions.operatingFacts.courses, [
    { name: "센슈얼 감성 테라피", items: [[60, 120000], [90, 150000], [120, 180000]] },
  ]);
  assert.match(page, /OPERATING_FACTS\.courses/u);
  assert.match(page, /single-course-card/u);
  const priceSectionIndex = page.indexOf('className="menu-section" id="pricing"');
  const faqSectionIndex = page.indexOf('className="faq-section" id="faq"');
  const areaSectionIndex = page.indexOf('className="copy-section intro-section" id="areas"');
  const footerIndex = page.indexOf('className="footer"');
  assert.ok(priceSectionIndex < faqSectionIndex, "the signature price board must retain its main information-flow position");
  assert.ok(faqSectionIndex < areaSectionIndex, "the home region cards must be the final content section");
  assert.ok(areaSectionIndex < footerIndex, "the home region cards must remain before the footer");
  const forbiddenMaleTerm = String.fromCodePoint(0xb0a8, 0xc131, 0xc804, 0xc6a9);
  assert.doesNotMatch(`${page}\n${layout}`, new RegExp(forbiddenMaleTerm, "u"));
  assert.doesNotMatch(page, /hero\.webp|care\.webp|후기|평점/);
});
