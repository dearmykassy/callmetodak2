import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const read = (path) => readFile(new URL(path, root), "utf8");
const readJson = async (path) => JSON.parse(await read(path));

// This is the owner-approved 70-term routing table.  It intentionally uses
// several term-specific pages that live next to a wider existing gu page
// (for example, 구로 → 구로동), so matching only normalized display names
// would conceal duplicate or mis-parented routes.
const REQUESTED_REGIONAL_ROUTES = {
  "간석": { route: "/areas/incheon/남동구/간석동", parentRoute: "/areas/incheon/남동구" },
  "고덕": { route: "/areas/gyeonggi/평택시/고덕동", parentRoute: "/areas/gyeonggi/평택시" },
  "광교": { route: "/areas/gyeonggi/수원시/영통구/광교동", parentRoute: "/areas/gyeonggi/수원시/영통구" },
  "남양주": { route: "/areas/gyeonggi/남양주시", parentRoute: "/areas/gyeonggi" },
  "동대문": { route: "/areas/seoul/동대문구", parentRoute: "/areas/seoul" },
  "동탄": { route: "/areas/gyeonggi/화성시/동탄구/동탄동", parentRoute: "/areas/gyeonggi/화성시/동탄구" },
  "수지": { route: "/areas/gyeonggi/용인시/수지구", parentRoute: "/areas/gyeonggi/용인시" },
  "안성": { route: "/areas/gyeonggi/안성시", parentRoute: "/areas/gyeonggi" },
  "안중": { route: "/areas/gyeonggi/평택시/안중읍", parentRoute: "/areas/gyeonggi/평택시" },
  "위례": { route: "/areas/gyeonggi/성남시/수정구/위례동", parentRoute: "/areas/gyeonggi/성남시/수정구" },
  "인덕원": { route: "/areas/gyeonggi/안양시/동안구/인덕원동", parentRoute: "/areas/gyeonggi/안양시/동안구" },
  "판교": { route: "/areas/gyeonggi/성남시/분당구/판교동", parentRoute: "/areas/gyeonggi/성남시/분당구" },
  "합정동": { route: "/areas/seoul/마포구/합정동", parentRoute: "/areas/seoul/마포구" },
  "송탄": { route: "/areas/gyeonggi/평택시/송탄동", parentRoute: "/areas/gyeonggi/평택시" },
  "신도림": { route: "/areas/seoul/구로구/신도림동", parentRoute: "/areas/seoul/구로구" },
  "기흥": { route: "/areas/gyeonggi/용인시/기흥구", parentRoute: "/areas/gyeonggi/용인시" },
  "분당": { route: "/areas/gyeonggi/성남시/분당구", parentRoute: "/areas/gyeonggi/성남시" },
  "향남": { route: "/areas/gyeonggi/화성시/만세구/향남읍", parentRoute: "/areas/gyeonggi/화성시/만세구" },
  "서정동": { route: "/areas/gyeonggi/평택시/서정동", parentRoute: "/areas/gyeonggi/평택시" },
  "미추홀": { route: "/areas/incheon/미추홀구", parentRoute: "/areas/incheon" },
  "월미도": { route: "/areas/incheon/제물포구/월미도", parentRoute: "/areas/incheon/제물포구" },
  "이태원": { route: "/areas/seoul/용산구/이태원동", parentRoute: "/areas/seoul/용산구" },
  "홍대": { route: "/areas/seoul/마포구/홍대", parentRoute: "/areas/seoul/마포구" },
  "건대": { route: "/areas/seoul/광진구/건대", parentRoute: "/areas/seoul/광진구" },
  "논현동": { route: "/areas/seoul/강남구/논현동", parentRoute: "/areas/seoul/강남구" },
  "삼성동": { route: "/areas/seoul/강남구/삼성동", parentRoute: "/areas/seoul/강남구" },
  "역삼동": { route: "/areas/seoul/강남구/역삼동", parentRoute: "/areas/seoul/강남구" },
  "신사동": { route: "/areas/seoul/강남구/신사동", parentRoute: "/areas/seoul/강남구" },
  "신림": { route: "/areas/seoul/관악구/신림동", parentRoute: "/areas/seoul/관악구" },
  "구로": { route: "/areas/seoul/구로구/구로동", parentRoute: "/areas/seoul/구로구" },
  "망원동": { route: "/areas/seoul/마포구/망원동", parentRoute: "/areas/seoul/마포구" },
  "상암": { route: "/areas/seoul/마포구/상암동", parentRoute: "/areas/seoul/마포구" },
  "등촌동": { route: "/areas/seoul/강서구/등촌동", parentRoute: "/areas/seoul/강서구" },
  "부평": { route: "/areas/incheon/부평구/부평동", parentRoute: "/areas/incheon/부평구" },
  "주안": { route: "/areas/incheon/미추홀구/주안동", parentRoute: "/areas/incheon/미추홀구" },
  "송도": { route: "/areas/incheon/연수구/송도동", parentRoute: "/areas/incheon/연수구" },
  "고잔동": { route: "/areas/gyeonggi/안산시/단원구/고잔동", parentRoute: "/areas/gyeonggi/안산시/단원구" },
  "평촌": { route: "/areas/gyeonggi/안양시/동안구/평촌동", parentRoute: "/areas/gyeonggi/안양시/동안구" },
  "인계동": { route: "/areas/gyeonggi/수원시/팔달구/인계동", parentRoute: "/areas/gyeonggi/수원시/팔달구" },
  "범계": { route: "/areas/gyeonggi/안양시/동안구/범계동", parentRoute: "/areas/gyeonggi/안양시/동안구" },
  "병점": { route: "/areas/gyeonggi/화성시/병점구/병점동", parentRoute: "/areas/gyeonggi/화성시/병점구" },
  "여의도": { route: "/areas/seoul/영등포구/여의동", parentRoute: "/areas/seoul/영등포구" },
  "서현": { route: "/areas/gyeonggi/성남시/분당구/서현동", parentRoute: "/areas/gyeonggi/성남시/분당구" },
  "야탑": { route: "/areas/gyeonggi/성남시/분당구/야탑동", parentRoute: "/areas/gyeonggi/성남시/분당구" },
  "모란": { route: "/areas/gyeonggi/성남시/중원구/모란", parentRoute: "/areas/gyeonggi/성남시/중원구" },
  "성남": { route: "/areas/gyeonggi/성남시", parentRoute: "/areas/gyeonggi" },
  "부산": { route: "/areas/busan", parentRoute: null },
  "해운대": { route: "/areas/busan/해운대구", parentRoute: "/areas/busan" },
  "서면": { route: "/areas/busan/부산진구/서면", parentRoute: "/areas/busan/부산진구" },
  "광안리": { route: "/areas/busan/수영구/광안리", parentRoute: "/areas/busan/수영구" },
  "영통": { route: "/areas/gyeonggi/수원시/영통구", parentRoute: "/areas/gyeonggi/수원시" },
  "신갈": { route: "/areas/gyeonggi/용인시/기흥구/신갈동", parentRoute: "/areas/gyeonggi/용인시/기흥구" },
  "미금": { route: "/areas/gyeonggi/성남시/분당구/미금", parentRoute: "/areas/gyeonggi/성남시/분당구" },
  "정자": { route: "/areas/gyeonggi/성남시/분당구/정자동", parentRoute: "/areas/gyeonggi/성남시/분당구" },
  "수내": { route: "/areas/gyeonggi/성남시/분당구/수내동", parentRoute: "/areas/gyeonggi/성남시/분당구" },
  "청라": { route: "/areas/incheon/서해구/청라동", parentRoute: "/areas/incheon/서해구" },
  "월곶": { route: "/areas/gyeonggi/시흥시/월곶동", parentRoute: "/areas/gyeonggi/시흥시" },
  "갈곶": { route: "/areas/gyeonggi/오산시/갈곶", parentRoute: "/areas/gyeonggi/오산시" },
  "시화": { route: "/areas/gyeonggi/시흥시/시화", parentRoute: "/areas/gyeonggi/시흥시" },
  "검단": { route: "/areas/incheon/검단구", parentRoute: "/areas/incheon" },
  "잠실": { route: "/areas/seoul/송파구/잠실동", parentRoute: "/areas/seoul/송파구" },
  "송파": { route: "/areas/seoul/송파구", parentRoute: "/areas/seoul" },
  "소래포구": { route: "/areas/incheon/남동구/소래포구", parentRoute: "/areas/incheon/남동구" },
  "인천공항": { route: "/areas/incheon/영종구/인천공항", parentRoute: "/areas/incheon/영종구" },
  "수유리": { route: "/areas/seoul/강북구/수유동", parentRoute: "/areas/seoul/강북구" },
  "노원": { route: "/areas/seoul/노원구", parentRoute: "/areas/seoul" },
  "중앙동": { route: "/areas/gyeonggi/평택시/중앙동", parentRoute: "/areas/gyeonggi/평택시" },
  "일산": { route: "/areas/gyeonggi/고양시/일산", parentRoute: "/areas/gyeonggi/고양시" },
  "천안": { route: "/areas/cheonan", parentRoute: null },
  "아산": { route: "/areas/asan", parentRoute: null },
};

const EXPECTED_EXPANDED_REGION_COUNT = 162;
const FORBIDDEN_MALE_TERM = String.fromCodePoint(0xb0a8, 0xc131, 0xc804, 0xc6a9);

test("expanded locality graph has exactly 162 routes and a direct parent-card path for every owner request", async () => {
  const snapshot = await readJson("src/data/regions.generated.json");
  const { regions, counts } = snapshot;

  assert.equal(counts.regions, EXPECTED_EXPANDED_REGION_COUNT);
  assert.equal(regions.length, EXPECTED_EXPANDED_REGION_COUNT);
  assert.equal(new Set(regions.map((region) => region.route)).size, EXPECTED_EXPANDED_REGION_COUNT);
  assert.equal(new Set(regions.map((region) => region.id)).size, EXPECTED_EXPANDED_REGION_COUNT);
  assert.equal(new Set(regions.map((region) => region.keywordBase)).size, EXPECTED_EXPANDED_REGION_COUNT);

  assert.equal(Object.keys(REQUESTED_REGIONAL_ROUTES).length, 70);
  const byId = new Map(regions.map((region) => [region.id, region]));
  const byRoute = new Map(regions.map((region) => [region.route, region]));
  for (const [term, { route, parentRoute }] of Object.entries(REQUESTED_REGIONAL_ROUTES)) {
    const region = byRoute.get(route);
    assert.ok(region, `${term} must resolve to ${route}`);

    if (parentRoute === null) {
      assert.equal(region.parentId, null, `${term} must remain a service-root route`);
      continue;
    }

    const expectedParent = byRoute.get(parentRoute);
    assert.ok(expectedParent, `${term} is missing its parent route ${parentRoute}`);
    const parent = byId.get(region.parentId);
    assert.equal(parent?.route, parentRoute, `${term} must be directly listed under ${parentRoute}`);
    assert.equal(region.ancestors.at(-1), expectedParent.id, `${term} must retain its direct parent in breadcrumbs`);
    assert.ok(
      regions.some((candidate) => candidate.parentId === parent.id && candidate.route === region.route),
      `${term} must be directly listed as a child card on ${parent.route}`,
    );
  }

  const busan = regions.find((region) => region.route === "/areas/busan");
  assert.deepEqual(busan && { name: busan.name, parentId: busan.parentId }, { name: "부산", parentId: null });
  for (const route of ["/areas/busan/부산진구", "/areas/busan/수영구", "/areas/busan/해운대구"]) {
    const region = byRoute.get(route);
    assert.ok(region, `Busan hierarchy is missing ${route}`);
    assert.equal(byId.get(region.parentId)?.route, "/areas/busan", `${route} must be a direct Busan card`);
  }
});

test("expanded regional content keeps unique owner metadata and blocks male-only language", async () => {
  const [regionSnapshot, contentSnapshot] = await Promise.all([
    readJson("src/data/regions.generated.json"),
    readJson("src/data/region-content.generated.json"),
  ]);
  const { regions, operatingFacts } = regionSnapshot;
  const { documents, counts } = contentSnapshot;

  assert.equal(counts.documents, EXPECTED_EXPANDED_REGION_COUNT);
  assert.equal(counts.uniqueTitles, EXPECTED_EXPANDED_REGION_COUNT);
  assert.equal(counts.uniqueDescriptions, EXPECTED_EXPANDED_REGION_COUNT);
  assert.equal(counts.uniqueH1, EXPECTED_EXPANDED_REGION_COUNT);
  assert.equal(counts.exactKeywordsPerRoute, 5);
  assert.equal(documents.length, EXPECTED_EXPANDED_REGION_COUNT);
  assert.equal(new Set(documents.map((document) => document.title)).size, EXPECTED_EXPANDED_REGION_COUNT);
  assert.equal(new Set(documents.map((document) => document.description)).size, EXPECTED_EXPANDED_REGION_COUNT);
  assert.equal(new Set(documents.map((document) => document.h1)).size, EXPECTED_EXPANDED_REGION_COUNT);
  assert.equal(new Set(documents.map((document) => [
    ...document.intro.paragraphs,
    ...document.principles.map((principle) => `${principle.title} ${principle.description}`),
    ...document.faqs.map((faq) => `${faq.question} ${faq.answer}`),
  ].join("\n"))).size, EXPECTED_EXPANDED_REGION_COUNT);
  assert.deepEqual(operatingFacts.courses, [
    { name: "센슈얼 감성 테라피", items: [[60, 120000], [90, 150000], [120, 180000]] },
  ]);

  const regionById = new Map(regions.map((region) => [region.id, region]));
  for (const document of documents) {
    const region = regionById.get(document.regionId);
    assert.ok(region, `missing region for ${document.route}`);
    assert.equal(document.route, region.route);
    assert.deepEqual(document.keywords, [
      `${region.keywordBase}토닥이`,
      `${region.keywordBase}여성전용마사지`,
      `${region.keywordBase}여성전용출장마사지`,
      `${region.keywordBase}출장안마`,
      `${region.keywordBase}출장마사지`,
    ]);
    assert.ok(document.title.includes(document.keywords[0]));
    assert.ok(document.title.includes(document.keywords[1]));
    assert.ok(document.title.includes(document.keywords[2]));
    assert.ok(document.h1.includes(region.label));

    const body = JSON.stringify(document);
    assert.ok(document.principles.some((principle) => principle.title === "현장 카드 결제 가능"));
    assert.ok(document.faqs.some((faq) => faq.answer === "현장 카드 결제 가능"));
    assert.doesNotMatch(body, new RegExp(FORBIDDEN_MALE_TERM, "u"));
    assert.doesNotMatch(body, /마사지봄|스타토닥이|마사지러브|후기|평점|도착|관리사|경력|배정|효능|방문|자택|홈케어|365일|연중무휴|일회용|소독/u);
  }
});

test("runtime turns every direct child into a visible directory card and preserves static SEO wiring", async () => {
  const [runtime, template, stylesheet, page] = await Promise.all([
    read("src/data/callme-regions.ts"),
    read("src/components/RegionalTemplate.tsx"),
    read("src/components/RegionalTemplate.module.css"),
    read("app/areas/[...segments]/page.tsx"),
  ]);

  assert.doesNotMatch(runtime, /from\s+["'][^"']*(?:massagebom|star-todaki)/u);
  assert.doesNotMatch(page, /from\s+["'][^"']*(?:massagebom|star-todaki)/u);
  assert.match(page, /dynamicParams = false/u);
  assert.match(page, /generateStaticParams/u);
  assert.match(page, /generateMetadata/u);
  assert.match(page, /title: \{ absolute: content\.title \}/u);
  assert.match(page, /keywords: content\.keywords/u);
  assert.match(page, /alternates: \{ canonical: region\.route \}/u);
  assert.match(page, /robots: \{ index: true, follow: true \}/u);
  assert.match(page, /openGraph:\s*\{[\s\S]*?title: content\.title,[\s\S]*?description: content\.description,[\s\S]*?url: region\.route,/u);
  assert.match(page, /twitter:\s*\{[\s\S]*?card: "summary_large_image",[\s\S]*?title: content\.title,[\s\S]*?description: content\.description,/u);
  assert.match(template, /childRegions\.map\(\(child, index\)/u);
  assert.match(template, /href=\{child\.route\}/u);
  assert.match(template, /styles\.regionCard/u);
  assert.match(template, /DIRECTORY/u);
  assert.match(template, /CALL PREP/u);
  assert.match(template, /LOCAL INTRO/u);
  assert.match(template, /TODAKI SIGNATURE COURSE/u);
  assert.match(template, /OPERATING PRINCIPLES/u);
  assert.match(template, /FAQ/u);
  assert.match(template, /NEARBY GUIDE/u);
  assert.match(template, /전화상담/u);
  assert.match(template, /singleCourseCard/u);
  const priceSectionIndex = template.indexOf("className={styles.priceSection}");
  const principlesSectionIndex = template.indexOf("className={styles.principles}");
  const nearbySectionIndex = template.indexOf("className={styles.nearby}");
  const directorySectionIndex = template.indexOf("className={styles.directory}");
  const calloutSectionIndex = template.indexOf("className={styles.callout}");
  assert.ok(priceSectionIndex < principlesSectionIndex, "the signature price board must retain its information-flow position");
  assert.ok(nearbySectionIndex < directorySectionIndex, "regional card directories must be the final content section");
  assert.ok(directorySectionIndex < calloutSectionIndex, "regional card directories must remain before the closing CTA");
  assert.match(template, /getRegionalHeroImage/u);
  assert.match(template, /<picture\b/u);
  assert.match(template, /type="image\/webp"/u);
  assert.doesNotMatch(template, /(?:hero|care)\.webp/u);
  assert.doesNotMatch(stylesheet, /url\(/u);
});

test("regional snapshot generation still materializes source content only at generation time", async () => {
  const generator = await read("scripts/generate-regional-data.mjs");

  assert.match(generator, /materialize-live-baseline\.mts/u);
  assert.match(generator, /CALLME_MASSAGEBOM_ROUTE_JOIN_FAILED/u);
  assert.match(generator, /canonicalRoute\(rawRoute\)/u);
  assert.match(generator, /현장 카드 결제 가능/u);
  assert.match(generator, /FORBIDDEN_MALE_TERM/u);
});
