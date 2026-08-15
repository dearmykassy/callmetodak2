import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const read = (path) => readFile(new URL(path, root), "utf8");
const readJson = async (path) => JSON.parse(await read(path));

const excludedCountyRoutes = [
  "/areas/incheon/강화군",
  "/areas/incheon/옹진군",
  "/areas/gyeonggi/가평군",
  "/areas/gyeonggi/양평군",
  "/areas/gyeonggi/연천군",
];

test("Callme-owned regional snapshot locks the 104 administrative route graph", async () => {
  const snapshot = await readJson("src/data/regions.generated.json");
  const { regions, counts } = snapshot;

  assert.deepEqual(counts, {
    regions: 104,
    serviceRoots: 7,
    administrativeHubs: 97,
    massageBomSemanticRoutes: 99,
    starVerifiedCheongjuRoutes: 5,
  });
  assert.equal(regions.length, 104);
  assert.equal(regions.filter((region) => region.kind === "service-root").length, 7);
  assert.equal(regions.filter((region) => region.kind === "administrative-hub").length, 97);
  assert.equal(new Set(regions.map((region) => region.route)).size, 104);
  assert.ok(regions.every((region) => region.segments.every((segment) => !/[군동읍면]$/u.test(segment))));
  assert.ok(excludedCountyRoutes.every((route) => !regions.some((region) => region.route === route)));

  const cheongju = regions.filter((region) => region.rootKey === "cheongju");
  assert.deepEqual(cheongju.map((region) => region.route), [
    "/areas/cheongju",
    "/areas/cheongju/상당구",
    "/areas/cheongju/서원구",
    "/areas/cheongju/청원구",
    "/areas/cheongju/흥덕구",
  ]);
  assert.ok(cheongju.every((region) => region.source.kind === "star-verified-locality" && region.source.route === null));

  const massageBomMapped = regions.filter((region) => region.source.kind === "massagebom-region-semantics");
  assert.equal(massageBomMapped.length, 99);
  assert.ok(massageBomMapped.every((region) => region.source.route === region.route));
  assert.equal(regions.find((region) => region.route === "/areas/seoul/중구")?.keywordBase, "서울중구");
  assert.equal(regions.find((region) => region.route === "/areas/daejeon/중구")?.keywordBase, "대전중구");
  assert.equal(regions.find((region) => region.route === "/areas/gyeonggi/고양시/덕양구")?.keywordBase, "고양덕양구");

  const gyeonggiCities = regions.filter((region) => region.rootKey === "gyeonggi" && region.segments.length === 2);
  assert.equal(gyeonggiCities.length, 28);
  for (const city of gyeonggiCities) {
    const stem = city.name.replace(/시$/u, "");
    assert.equal(city.label, stem, `${city.route} must use the city stem as its visible label`);
    assert.equal(city.keywordBase, stem, `${city.route} must use the city stem as its keyword base`);
  }
  const suwon = regions.find((region) => region.route === "/areas/gyeonggi/수원시");
  assert.deepEqual(suwon && {
    label: suwon.label,
    keywordBase: suwon.keywordBase,
  }, {
    label: "수원",
    keywordBase: "수원",
  });
  const suwonGwonseon = regions.find((region) => region.route === "/areas/gyeonggi/수원시/권선구");
  assert.deepEqual(suwonGwonseon && {
    label: suwonGwonseon.label,
    keywordBase: suwonGwonseon.keywordBase,
  }, {
    label: "수원 권선구",
    keywordBase: "수원권선구",
  });
});

test("regional metadata and body obey the five-keyword, uniqueness, and operating-fact contract", async () => {
  const [regionSnapshot, contentSnapshot] = await Promise.all([
    readJson("src/data/regions.generated.json"),
    readJson("src/data/region-content.generated.json"),
  ]);
  const { regions, operatingFacts } = regionSnapshot;
  const { documents, counts, materialization } = contentSnapshot;

  assert.deepEqual(counts, {
    documents: 104,
    uniqueTitles: 104,
    uniqueDescriptions: 104,
    uniqueH1: 104,
    exactKeywordsPerRoute: 5,
  });
  assert.equal(documents.length, 104);
  assert.equal(new Set(documents.map((document) => document.title)).size, 104);
  assert.equal(new Set(documents.map((document) => document.description)).size, 104);
  assert.equal(new Set(documents.map((document) => document.h1)).size, 104);
  assert.equal(new Set(documents.map((document) => [
    ...document.intro.paragraphs,
    ...document.principles.map((principle) => `${principle.title} ${principle.description}`),
    ...document.faqs.map((faq) => `${faq.question} ${faq.answer}`),
  ].join("\n"))).size, 104);
  assert.deepEqual(operatingFacts.courses, [
    { name: "센슈얼 감성 테라피", items: [[60, 120000], [90, 150000], [120, 180000]] },
  ]);
  assert.equal(operatingFacts.cardPayment, "현장 카드 결제 가능");
  assert.deepEqual(materialization, {
    source: "massagebom-live-canonical-generators",
    massageBomMatchedRoutes: 99,
    cheongjuFallbackRoutes: 5,
  });

  for (const document of documents) {
    const region = regions.find((candidate) => candidate.id === document.regionId);
    assert.ok(region, `missing region for ${document.route}`);
    assert.deepEqual(document.keywords, [
      `${region.keywordBase}토닥이`,
      `${region.keywordBase}여성전용마사지`,
      `${region.keywordBase}여성전용출장마사지`,
      `${region.keywordBase}출장안마`,
      `${region.keywordBase}출장마사지`,
    ]);
    assert.equal(
      document.title,
      `${region.keywordBase}토닥이 ${region.keywordBase}여성전용마사지 | ${region.keywordBase}여성전용출장마사지 · 콜미토닥이`,
    );
    assert.match(document.h1, new RegExp(region.label, "u"));

    const body = JSON.stringify(document);
    assert.ok(document.principles.some((principle) => principle.title === "현장 카드 결제 가능"));
    assert.ok(document.faqs.some((faq) => faq.answer === "현장 카드 결제 가능"));
    assert.doesNotMatch(body, /마사지봄|스타토닥이|마사지러브|후기|평점|도착|관리사|경력|배정|효능|방문|자택|홈케어|365일|연중무휴|일회용|소독/u);
    const forbiddenMaleTerm = String.fromCodePoint(0xb0a8, 0xc131, 0xc804, 0xc6a9);
    assert.doesNotMatch(body, new RegExp(forbiddenMaleTerm, "u"));
  }

  const suwon = documents.find((document) => document.route === "/areas/gyeonggi/수원시");
  assert.equal(suwon?.keywords[0], "수원토닥이");
});

test("regional runtime has no cross-repository dependency and uses the requested page structure", async () => {
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

test("regional snapshot generation joins MassageBom only at generation time", async () => {
  const generator = await read("scripts/generate-regional-data.mjs");

  assert.match(generator, /materialize-live-baseline\.mts/u);
  assert.match(generator, /CALLME_MASSAGEBOM_ROUTE_JOIN_FAILED/u);
  assert.match(generator, /canonicalRoute\(rawRoute\)/u);
  assert.match(generator, /cheongjuFallbackRoutes/u);
  assert.match(generator, /현장 카드 결제 가능/u);
});
