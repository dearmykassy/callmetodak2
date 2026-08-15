/**
 * Materialize Callme-owned regional JSON snapshots.
 *
 * The generator may read MassageBom's canonical regional generators through
 * the read-only materializer, but the app imports only the committed JSON
 * below. Cheongju deliberately uses a locality-specific Callme fallback.
 */
import { execFileSync } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DATA_DIR = path.join(ROOT, "src", "data");
const WORKSPACE_ROOT = path.resolve(ROOT, "..");
const DEFAULT_MASSAGEBOM_ROOT = path.join(WORKSPACE_ROOT, "massagebom");
const MATERIALIZER_PATH = path.join(
  WORKSPACE_ROOT,
  "runtome",
  "pipeline",
  "massagebom-child-site-v1",
  "materialize-live-baseline.mts",
);

const BRAND = "콜미토닥이";
const KEYWORD_SUFFIXES = [
  "토닥이",
  "여성전용마사지",
  "여성전용출장마사지",
  "출장안마",
  "출장마사지",
];

const PHONE = {
  display: "0508-202-3906",
  href: "tel:05082023906",
};

const OPERATING_FACTS = {
  phone: PHONE,
  phoneConsultation: "24시간 전화상담",
  paymentTiming: "선입금 없는 100% 현장 후불",
  cardPayment: "현장 카드 결제 가능",
  availabilityNotice: "서비스 주소와 희망 시각, 코스는 전화상담에서 확인합니다.",
  courses: [
    { name: "타이", items: [[60, 80000], [90, 100000], [120, 120000]] },
    { name: "아로마", items: [[60, 90000], [90, 110000], [120, 130000]] },
    { name: "힐링", items: [[60, 100000], [90, 120000], [120, 140000]] },
    { name: "스페셜", items: [[60, 110000], [90, 130000], [120, 150000]] },
  ],
};

const ROOTS = [
  { key: "seoul", name: "서울", sourceKind: "massagebom-region-semantics" },
  { key: "incheon", name: "인천", sourceKind: "massagebom-region-semantics" },
  { key: "gyeonggi", name: "경기", sourceKind: "massagebom-region-semantics" },
  { key: "cheonan", name: "천안", sourceKind: "massagebom-region-semantics" },
  { key: "asan", name: "아산", sourceKind: "massagebom-region-semantics" },
  { key: "cheongju", name: "청주", sourceKind: "star-verified-locality" },
  { key: "daejeon", name: "대전", sourceKind: "massagebom-region-semantics" },
];

const DISTRICTS = {
  seoul: [
    "강남구", "강동구", "강북구", "강서구", "관악구", "광진구", "구로구", "금천구", "노원구", "도봉구",
    "동대문구", "동작구", "마포구", "서대문구", "서초구", "성동구", "성북구", "송파구", "양천구", "영등포구",
    "용산구", "은평구", "종로구", "중구", "중랑구",
  ],
  incheon: ["검단구", "계양구", "남동구", "미추홀구", "부평구", "서해구", "연수구", "영종구", "제물포구"],
  cheonan: ["동남구", "서북구"],
  cheongju: ["상당구", "서원구", "청원구", "흥덕구"],
  daejeon: ["대덕구", "동구", "서구", "유성구", "중구"],
};

const GYEONGGI_CITIES = [
  "고양시", "과천시", "광명시", "광주시", "구리시", "군포시", "김포시", "남양주시", "동두천시", "부천시",
  "성남시", "수원시", "시흥시", "안산시", "안성시", "안양시", "양주시", "여주시", "오산시", "용인시",
  "의왕시", "의정부시", "이천시", "파주시", "평택시", "포천시", "하남시", "화성시",
];

const GYEONGGI_CITY_DISTRICTS = {
  고양시: ["덕양구", "일산동구", "일산서구"],
  부천시: ["소사구", "오정구", "원미구"],
  성남시: ["분당구", "수정구", "중원구"],
  수원시: ["권선구", "영통구", "장안구", "팔달구"],
  안산시: ["단원구", "상록구"],
  안양시: ["동안구", "만안구"],
  용인시: ["기흥구", "수지구", "처인구"],
  화성시: ["동탄구", "만세구", "병점구", "효행구"],
};

const EXCLUDED_COUNTY_ROUTES = [
  "/areas/incheon/강화군",
  "/areas/incheon/옹진군",
  "/areas/gyeonggi/가평군",
  "/areas/gyeonggi/양평군",
  "/areas/gyeonggi/연천군",
];

const SOURCE_ROOT_LABELS = {
  seoul: "서울특별시",
  incheon: "인천광역시",
  gyeonggi: "경기도",
  cheonan: "천안시",
  asan: "아산시",
  daejeon: "대전광역시",
};

// Exclude source sentences that assert provider travel/arrival, an unsupported
// program or locality detail, or a medical result. We drop them instead of
// turning them into a new Callme claim.
const UNSUPPORTED_COPY = /관리사|도착|배정|방문|자택|홈케어|고객이\s*머무는\s*공간|집에서|집이라는|공간|이동|외출|매장|현장\s*진행|2인|두\s*명|동시\s*관리|커플|부부|일회용|소독|위생|365일|연중무휴|하루\s*종일|새벽|치료|회복|효능|건강|의료|테라피|출발비|출발금|보증금|송금|입금|환불|사칭|sns|후기|평점|경력|수면|압|강도|몸|피로|긴장|이완|컨디션|근육|호흡|뻐근|가벼워|움직임|스트레칭|오일|150분/iu;
const OUTPUT_UNSUPPORTED_COPY = /관리사|도착|배정|방문|자택|홈케어|고객이\s*머무는\s*공간|집에서|집이라는|공간|이동|외출|매장|현장\s*진행|2인|두\s*명|동시\s*관리|커플|부부|일회용|소독|위생|365일|연중무휴|하루\s*종일|새벽|치료|회복|효능|건강|의료|테라피|출발비|출발금|보증금|송금|환불|사칭|sns|후기|평점|경력|수면|압|강도|몸|피로|긴장|이완|컨디션|근육|호흡|뻐근|가벼워|움직임|스트레칭|오일|150분/iu;
const BRAND_LEAK = /마사지봄|스타토닥이|마사지러브/iu;
const FORBIDDEN_MALE_TERM = /\uB0A8\uC131\uC804\uC6A9/u;
const REDUNDANT_SCOPE_SENTENCE = /^현재 안내 범위는 .+입니다\.$/u;

const compact = (value) => value.normalize("NFC").replace(/\s+/gu, "");
const cityStem = (value) => value.endsWith("시") ? value.slice(0, -1) : value;

function stableHash(value) {
  let hash = 2166136261;
  for (const character of value) {
    hash ^= character.codePointAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function pick(values, seed, offset = 0) {
  return values[(seed + offset) % values.length];
}

function makeRoute(segments) {
  return `/areas/${segments.join("/")}`;
}

function sourceFor(kind, route) {
  return {
    kind,
    route: kind === "massagebom-region-semantics" ? route : null,
    note: kind === "massagebom-region-semantics"
      ? "Matching MassageBom administrative semantic route captured into this Callme-owned snapshot."
      : "Cheongju locality uses a Callme-owned, locality-specific fallback; no MassageBom route is asserted.",
  };
}

function asRecord(value, label) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`CALLME_SOURCE_RECORD_INVALID:${label}`);
  }
  return value;
}

function asString(value, label) {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`CALLME_SOURCE_STRING_INVALID:${label}`);
  }
  return value.normalize("NFC").trim();
}

function asStrings(value, label) {
  if (!Array.isArray(value) || value.some((item) => typeof item !== "string" || !item.trim())) {
    throw new Error(`CALLME_SOURCE_STRING_ARRAY_INVALID:${label}`);
  }
  return value.map((item) => item.normalize("NFC").trim());
}

function canonicalRoute(route) {
  return route
    .split("/")
    .map((segment) => decodeURIComponent(segment).normalize("NFC"))
    .join("/");
}

function materializeMassageBomBaseline() {
  const massageBomRoot = path.resolve(process.env.MASSAGEBOM_ROOT ?? DEFAULT_MASSAGEBOM_ROOT);
  const output = execFileSync(
    process.execPath,
    ["--import", "tsx", MATERIALIZER_PATH, massageBomRoot],
    {
      cwd: massageBomRoot,
      encoding: "utf8",
      maxBuffer: 128 * 1024 * 1024,
    },
  );
  const baseline = JSON.parse(output);
  if (
    baseline?.schemaVersion !== 1 ||
    baseline?.source !== "massagebom-live-canonical-generators" ||
    baseline?.routeCount !== 1291 ||
    !Array.isArray(baseline.entries) ||
    baseline.entries.length !== 1291
  ) {
    throw new Error("CALLME_MASSAGEBOM_BASELINE_INVALID");
  }
  return baseline;
}

function joinMassageBomSources(regions, baseline) {
  const expected = regions.filter((region) => region.source.kind === "massagebom-region-semantics");
  if (expected.length !== 99) throw new Error("CALLME_MASSAGEBOM_EXPECTED_ROUTE_COUNT_INVALID");

  const sourceByRoute = new Map();
  for (const entry of baseline.entries) {
    const source = asRecord(entry, "baseline.entry");
    const rawRoute = asString(source.route, "baseline.entry.route");
    const route = canonicalRoute(rawRoute);
    if (sourceByRoute.has(route)) throw new Error(`CALLME_MASSAGEBOM_DUPLICATE_ROUTE:${route}`);
    sourceByRoute.set(route, source);
  }

  const matched = new Map();
  for (const region of expected) {
    const source = sourceByRoute.get(region.route);
    if (!source) throw new Error(`CALLME_MASSAGEBOM_ROUTE_JOIN_FAILED:${region.route}`);
    matched.set(region.route, source);
  }
  if (matched.size !== expected.length) throw new Error("CALLME_MASSAGEBOM_MATCH_COUNT_INVALID");
  return matched;
}

function buildRegions() {
  const regions = [];
  const rootsByKey = new Map(ROOTS.map((root) => [root.key, root]));

  const add = ({ rootKey, segments, name, label, keywordBase, parentId = null, ancestors = [], sourceKind }) => {
    const route = makeRoute(segments);
    const region = {
      id: parentId ? `admin-${rootKey}-${segments.slice(1).join("--")}` : `root-${rootKey}`,
      kind: parentId ? "administrative-hub" : "service-root",
      rootKey,
      name,
      label,
      keywordBase: compact(keywordBase),
      route,
      segments,
      parentId,
      ancestors,
      scopeLabel: parentId ? `${label} 행정 기준 안내` : `${label} 운영권역 안내`,
      source: sourceFor(sourceKind, route),
    };
    regions.push(region);
    return region;
  };

  for (const root of ROOTS) {
    add({
      rootKey: root.key,
      segments: [root.key],
      name: root.name,
      label: root.name,
      keywordBase: root.name,
      sourceKind: root.sourceKind,
    });
  }

  for (const rootKey of ["seoul", "incheon", "cheonan", "cheongju", "daejeon"]) {
    const root = regions.find((region) => region.id === `root-${rootKey}`);
    const rootInfo = rootsByKey.get(rootKey);
    for (const district of DISTRICTS[rootKey]) {
      add({
        rootKey,
        segments: [rootKey, district],
        name: district,
        label: `${rootInfo.name} ${district}`,
        keywordBase: `${rootInfo.name}${district}`,
        parentId: root.id,
        ancestors: [root.id],
        sourceKind: rootInfo.sourceKind,
      });
    }
  }

  const gyeonggiRoot = regions.find((region) => region.id === "root-gyeonggi");
  for (const city of GYEONGGI_CITIES) {
    const stem = cityStem(city);
    const cityRegion = add({
      rootKey: "gyeonggi",
      segments: ["gyeonggi", city],
      name: city,
      label: stem,
      keywordBase: stem,
      parentId: gyeonggiRoot.id,
      ancestors: [gyeonggiRoot.id],
      sourceKind: "massagebom-region-semantics",
    });

    for (const district of GYEONGGI_CITY_DISTRICTS[city] ?? []) {
      add({
        rootKey: "gyeonggi",
        segments: ["gyeonggi", city, district],
        name: district,
        label: `${stem} ${district}`,
        keywordBase: `${stem}${district}`,
        parentId: cityRegion.id,
        ancestors: [gyeonggiRoot.id, cityRegion.id],
        sourceKind: "massagebom-region-semantics",
      });
    }
  }

  return regions.sort((left, right) => left.route.localeCompare(right.route, "ko"));
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
}

function sourceLocationAliases(source, region) {
  const approved = asRecord(source.approved, `${region.route}:approved`);
  const node = asRecord(source.node, `${region.route}:node`);
  const locality = asString(approved.locality_label, `${region.route}:approved.locality_label`);
  const nodeName = asString(node.displayName, `${region.route}:node.displayName`);
  const rootLabel = SOURCE_ROOT_LABELS[region.rootKey];
  const sourceFullLabel = [rootLabel, ...region.segments.slice(1)].filter(Boolean).join(" ");

  return [...new Set([
    sourceFullLabel,
    locality,
    nodeName,
    region.rootKey === "gyeonggi" ? `경기도 ${locality}` : null,
  ].filter((value) => value && value !== region.label))]
    .sort((left, right) => right.length - left.length);
}

function correctLocalityParticles(text, label) {
  const lastCodePoint = label.trim().codePointAt(label.trim().length - 1);
  const isHangul = lastCodePoint >= 0xac00 && lastCodePoint <= 0xd7a3;
  if (!isHangul) return text;

  const jongseong = (lastCodePoint - 0xac00) % 28;
  const hasBatchim = jongseong !== 0;
  const ro = !hasBatchim || jongseong === 8 ? "로" : "으로";
  return text
    .replaceAll(`${label}으로`, `${label}${ro}`)
    .replaceAll(`${label}은`, `${label}${hasBatchim ? "은" : "는"}`)
    .replaceAll(`${label}는`, `${label}${hasBatchim ? "은" : "는"}`)
    .replaceAll(`${label}을`, `${label}${hasBatchim ? "을" : "를"}`)
    .replaceAll(`${label}를`, `${label}${hasBatchim ? "을" : "를"}`)
    .replaceAll(`${label}이`, `${label}${hasBatchim ? "이" : "가"}`)
    .replaceAll(`${label}가`, `${label}${hasBatchim ? "이" : "가"}`)
    .replaceAll(`${label}과`, `${label}${hasBatchim ? "과" : "와"}`)
    .replaceAll(`${label}와`, `${label}${hasBatchim ? "과" : "와"}`);
}

function applySmallGrammarSubstitution(text, route, slot) {
  const endings = [
    [/확인해 주세요\.$/u, ["확인해 보세요.", "살펴보세요."]],
    [/확인하세요\.$/u, ["살펴보세요.", "확인해 보세요."]],
    [/살펴보세요\.$/u, ["확인해 보세요.", "다시 확인하세요."]],
    [/알려 주세요\.$/u, ["말씀해 주세요."]],
    [/안내합니다\.$/u, ["소개합니다."]],
    [/정리했습니다\.$/u, ["정리해 두었습니다."]],
  ];
  for (const [pattern, replacements] of endings) {
    if (pattern.test(text)) return text.replace(pattern, pick(replacements, stableHash(`${route}\u0000${slot}`)));
  }

  const phraseSubstitutions = [
    ["먼저", "우선"],
    ["함께", "같이"],
    ["정확한", "분명한"],
    ["원하는", "희망하는"],
    ["차례로", "순서대로"],
  ];
  const candidates = phraseSubstitutions.filter(([from]) => text.includes(from));
  if (candidates.length === 0) return text;
  const [from, to] = pick(candidates, stableHash(`${route}\u0000${slot}`));
  return text.replace(from, to);
}

function rewriteSourceText(input, source, region, slot) {
  const approved = asRecord(source.approved, `${region.route}:approved`);
  const sourceCommercialName = asString(
    approved.commercial_name,
    `${region.route}:approved.commercial_name`,
  );
  let rewritten = asString(input, `${region.route}:${slot}`)
    .replace(/마사지\s*봄/gu, BRAND)
    .replaceAll(sourceCommercialName, BRAND);
  const aliases = sourceLocationAliases(source, region);
  if (aliases.length > 0) {
    rewritten = rewritten.replace(new RegExp(aliases.map(escapeRegExp).join("|"), "gu"), region.label);
  }
  rewritten = correctLocalityParticles(rewritten, region.label);
  return applySmallGrammarSubstitution(rewritten, region.route, slot);
}

function splitSentences(text) {
  return text
    .split(/(?<=[.!?])\s+/u)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
}

function isSupportedCopy(text) {
  return !UNSUPPORTED_COPY.test(text) && !BRAND_LEAK.test(text) && !FORBIDDEN_MALE_TERM.test(text);
}

function adaptedSentences(input, source, region, slot) {
  return splitSentences(asString(input, `${region.route}:${slot}`))
    .map((sentence, index) => rewriteSourceText(sentence, source, region, `${slot}.${index}`))
    .filter(isSupportedCopy);
}

function keywordSet(region) {
  return KEYWORD_SUFFIXES.map((suffix) => `${region.keywordBase}${suffix}`);
}

function metadataFor(region, keywords, sourceLead) {
  return {
    // Mirrors MassageBom's canonical structure:
    // primary keyword + secondary keyword | service identity · platform brand.
    title: `${keywords[0]} ${keywords[1]} | ${keywords[2]} · ${BRAND}`,
    description: `${keywords[1]} 안내입니다. ${sourceLead}`,
    h1: `${region.label} 여성전용출장마사지 안내`,
  };
}

function titleWithoutSourceLocality(title, source, region, slot) {
  const rewritten = rewriteSourceText(title, source, region, slot);
  if (isSupportedCopy(rewritten)) return rewritten;
  return `${region.label} 상담 전 운영 기준`;
}

function trustTitle(source, region) {
  const trust = asRecord(asRecord(source.editorial, `${region.route}:editorial`).trust, `${region.route}:trust`);
  const original = asString(trust.title, `${region.route}:trust.title`);
  if (/후불|결제/u.test(original)) return `${region.label} 현장 후불 원칙`;
  if (/선입금|사기|안전/u.test(original)) return `${region.label} 결제 기준 확인`;
  return `${region.label} 운영 기준`;
}

function stripFaqPrefix(value) {
  return value.replace(/^질문\s*\d+\.\s*/u, "").replace(/^답변\.\s*/u, "").trim();
}

function findFaqItem(items, pattern, label) {
  const item = items.find((candidate) => pattern.test(asString(candidate.question, `${label}:question`)));
  if (!item) throw new Error(`CALLME_SOURCE_FAQ_MISSING:${label}`);
  return asRecord(item, label);
}

function sourceFaqAnswer(item, source, region, slot, fallback) {
  const answer = stripFaqPrefix(asString(item.answer, `${region.route}:${slot}`));
  const answers = adaptedSentences(answer, source, region, slot);
  return answers.find((candidate) => !/^(?:네|예)[.!]?$/u.test(candidate)) ?? fallback;
}

function buildMassageBomContent(region, source) {
  const editorial = asRecord(source.editorial, `${region.route}:editorial`);
  const introduction = asRecord(editorial.introduction, `${region.route}:introduction`);
  const trust = asRecord(editorial.trust, `${region.route}:trust`);
  const customer = asRecord(source.customer, `${region.route}:customer`);
  const standards = asRecord(customer.standards, `${region.route}:standards`);
  const faq = asRecord(customer.faq, `${region.route}:faq`);
  const seo = asRecord(source.seo, `${region.route}:seo`);
  const seoHero = asRecord(seo.hero, `${region.route}:seo.hero`);
  const seoLead = asString(asRecord(seoHero.lead, `${region.route}:seo.hero.lead`).text, `${region.route}:seo.hero.lead.text`);

  const sourceHeroLead = adaptedSentences(seoLead, source, region, "seo.hero.lead")[0];
  if (!sourceHeroLead) throw new Error(`CALLME_SOURCE_HERO_UNSUPPORTED:${region.route}`);
  const heroLead = REDUNDANT_SCOPE_SENTENCE.test(sourceHeroLead)
    ? `${region.label}의 지역 안내와 코스·가격, 전화상담 정보를 확인하세요.`
    : sourceHeroLead;

  const trustSentences = asStrings(trust.paragraphs, `${region.route}:trust.paragraphs`)
    .flatMap((paragraph, index) => adaptedSentences(paragraph, source, region, `trust.${index}`));
  const trustDescription = trustSentences.length > 0
    ? pick(trustSentences, stableHash(`${region.route}\u0000trust`))
    : `${BRAND} ${region.label} 안내는 선입금 없는 100% 현장 후불을 기준으로 확인합니다.`;

  const standardDescriptions = asStrings(
    standards.itemDescriptions,
    `${region.route}:standards.itemDescriptions`,
  )
    .flatMap((item, index) => adaptedSentences(item, source, region, `standards.${index}`));
  if (standardDescriptions.length === 0) throw new Error(`CALLME_SOURCE_STANDARDS_UNSUPPORTED:${region.route}`);

  const introCandidates = [
    ...asStrings(introduction.paragraphs, `${region.route}:introduction.paragraphs`)
      .flatMap((paragraph, index) => adaptedSentences(paragraph, source, region, `introduction.${index}`)),
    ...adaptedSentences(standards.lead, source, region, "standards.lead"),
    ...standardDescriptions,
    heroLead,
  ];
  if (introCandidates.length < 2) throw new Error(`CALLME_SOURCE_INTRO_UNSUPPORTED:${region.route}`);
  const introStart = stableHash(`${region.route}\u0000intro`) % introCandidates.length;
  const introParagraphs = [
    introCandidates[introStart],
    introCandidates[(introStart + 1) % introCandidates.length],
  ];

  if (!Array.isArray(faq.items)) throw new Error(`CALLME_SOURCE_FAQ_INVALID:${region.route}`);
  const faqItems = faq.items.map((item, index) => asRecord(item, `${region.route}:faq.items.${index}`));
  const paymentFaq = findFaqItem(faqItems, /선입금/u, `${region.route}:faq.payment`);
  const consultationFaq = findFaqItem(faqItems, /전화상담/u, `${region.route}:faq.consultation`);
  const cardFaq = findFaqItem(faqItems, /카드/u, `${region.route}:faq.card`);

  const paymentQuestion = stripFaqPrefix(
    rewriteSourceText(paymentFaq.question, source, region, "faq.payment.question"),
  );
  const consultationQuestion = stripFaqPrefix(
    rewriteSourceText(consultationFaq.question, source, region, "faq.consultation.question"),
  );
  const cardQuestion = stripFaqPrefix(
    rewriteSourceText(cardFaq.question, source, region, "faq.card.question"),
  );
  const paymentAnswer = sourceFaqAnswer(
    paymentFaq,
    source,
    region,
    "faq.payment.answer",
    "선입금 없는 100% 현장 후불입니다.",
  );
  const consultationAnswer = sourceFaqAnswer(
    consultationFaq,
    source,
    region,
    "faq.consultation.answer",
    "서비스 주소와 희망 시각, 코스는 전화상담에서 확인합니다.",
  );

  const keywords = keywordSet(region);
  const metadata = metadataFor(region, keywords, heroLead);
  return {
    regionId: region.id,
    route: region.route,
    ...metadata,
    keywords,
    hero: {
      eyebrow: "CALLME LOCAL GUIDE",
      lead: heroLead,
    },
    intro: {
      heading: titleWithoutSourceLocality(standards.title, source, region, "standards.title"),
      paragraphs: introParagraphs,
    },
    principles: [
      {
        title: trustTitle(source, region),
        description: trustDescription,
      },
      {
        title: titleWithoutSourceLocality(standards.title, source, region, "standards.title.principle"),
        description: pick(standardDescriptions, stableHash(`${region.route}\u0000standards`)),
      },
      {
        title: "현장 카드 결제 가능",
        description: "선입금 없는 100% 현장 후불 기준과 함께 안내합니다.",
      },
    ],
    faqs: [
      {
        question: paymentQuestion,
        answer: paymentAnswer,
      },
      {
        question: consultationQuestion,
        answer: consultationAnswer,
      },
      {
        question: cardQuestion,
        answer: "현장 카드 결제 가능",
      },
    ],
  };
}

function buildCheongjuFallbackContent(region) {
  const seed = stableHash(region.route);
  const keywords = keywordSet(region);
  const heroLead = pick([
    `${region.label} 지역 안내에서는 서비스 주소와 희망 시각, 코스 정보를 순서대로 확인합니다.`,
    `${region.label} 페이지는 전화상담 전에 주소, 시간, 코스를 정리할 수 있도록 구성했습니다.`,
    `${region.label} 안내에서 현재 행정 경로와 상담에 필요한 정보를 함께 살펴보세요.`,
  ], seed);
  const metadata = metadataFor(region, keywords, heroLead);
  return {
    regionId: region.id,
    route: region.route,
    ...metadata,
    keywords,
    hero: {
      eyebrow: "CALLME LOCAL GUIDE",
      lead: heroLead,
    },
    intro: {
      heading: `${region.label} 지역 안내`,
      paragraphs: [
        `${region.label} 페이지는 동·읍·면이 아닌 현재 경로의 행정시·행정구 기준으로 구성했습니다. 서비스 주소가 이 경로와 맞는지 먼저 확인하세요.`,
        `${region.label}에서 필요한 시간과 코스 정보는 가격표와 전화상담 안내를 함께 살펴보세요. 희망 시각과 코스 후보를 정리하면 상담이 간결합니다.`,
      ],
    },
    principles: [
      {
        title: `${region.label} 상담 준비`,
        description: "서비스 주소, 희망 시각, 코스를 순서대로 정리한 뒤 전화상담에서 확인합니다.",
      },
      {
        title: `${region.label} 현장 후불 기준`,
        description: "선입금 없는 100% 현장 후불 기준으로 결제 정보를 안내합니다.",
      },
      {
        title: "현장 카드 결제 가능",
        description: "선입금 없는 100% 현장 후불 기준과 함께 안내합니다.",
      },
    ],
    faqs: [
      {
        question: "선입금이 있나요?",
        answer: "선입금 없는 100% 현장 후불입니다.",
      },
      {
        question: `${region.label} 안내는 어떻게 확인하나요?`,
        answer: "서비스 주소와 희망 시각, 코스는 전화상담에서 확인합니다.",
      },
      {
        question: "현장 카드 결제가 가능한가요?",
        answer: "현장 카드 결제 가능",
      },
    ],
  };
}

function buildContent(regions, massageBomSources) {
  return regions.map((region) => {
    if (region.source.kind === "massagebom-region-semantics") {
      const source = massageBomSources.get(region.route);
      if (!source) throw new Error(`CALLME_MASSAGEBOM_SOURCE_MISSING:${region.route}`);
      return buildMassageBomContent(region, source);
    }
    return buildCheongjuFallbackContent(region);
  });
}

function assertDocumentSafety(document, region, source) {
  const serialized = JSON.stringify(document);
  if (/현재 안내 범위는 .+입니다\./u.test(serialized)) {
    throw new Error(`REDUNDANT_SCOPE_SENTENCE:${document.route}`);
  }
  if (FORBIDDEN_MALE_TERM.test(serialized)) {
    throw new Error(`FORBIDDEN_MALE_TERM:${document.route}`);
  }
  const unsupportedMatch = serialized.match(OUTPUT_UNSUPPORTED_COPY);
  if (unsupportedMatch) throw new Error(`UNSUPPORTED_COPY:${document.route}:${unsupportedMatch[0]}`);
  if (BRAND_LEAK.test(serialized)) throw new Error(`BRAND_LEAK:${document.route}`);
  if (source) {
    const commercialName = asString(
      asRecord(source.approved, `${region.route}:approved`).commercial_name,
      `${region.route}:approved.commercial_name`,
    );
    if (serialized.includes(commercialName)) throw new Error(`SOURCE_COMMERCIAL_NAME_LEAK:${document.route}`);
  }
  if (!document.principles.some((principle) => principle.title === "현장 카드 결제 가능")) {
    throw new Error(`CARD_PAYMENT_NOT_UNCONDITIONAL:${document.route}`);
  }
  if (!document.faqs.some((faq) => faq.answer === "현장 카드 결제 가능")) {
    throw new Error(`CARD_PAYMENT_FAQ_NOT_UNCONDITIONAL:${document.route}`);
  }
}

function assertSnapshot(regions, documents, massageBomSources) {
  const roots = regions.filter((region) => region.kind === "service-root");
  const admins = regions.filter((region) => region.kind === "administrative-hub");
  const massageBom = regions.filter((region) => region.source.kind === "massagebom-region-semantics");
  const star = regions.filter((region) => region.source.kind === "star-verified-locality");
  const unique = (values, code) => {
    if (new Set(values).size !== values.length) throw new Error(code);
  };

  if (regions.length !== 104 || roots.length !== 7 || admins.length !== 97) throw new Error("REGION_COUNT_MISMATCH");
  if (massageBom.length !== 99 || star.length !== 5 || massageBomSources.size !== 99) {
    throw new Error("SOURCE_COUNT_MISMATCH");
  }
  if (OPERATING_FACTS.cardPayment !== "현장 카드 결제 가능") throw new Error("CARD_PAYMENT_FACT_MISMATCH");
  if (regions.some((region) => region.segments.some((segment) => /[군동읍면]$/u.test(segment)))) {
    throw new Error("FORBIDDEN_LOCALITY_ROUTE");
  }
  if (EXCLUDED_COUNTY_ROUTES.some((route) => regions.some((region) => region.route === route))) {
    throw new Error("EXCLUDED_COUNTY_INCLUDED");
  }
  if (documents.length !== regions.length) throw new Error("CONTENT_COUNT_MISMATCH");

  unique(regions.map((region) => region.route), "DUPLICATE_ROUTE");
  unique(regions.map((region) => region.keywordBase), "DUPLICATE_KEYWORD_BASE");
  unique(documents.map((document) => document.title), "DUPLICATE_TITLE");
  unique(documents.map((document) => document.description), "DUPLICATE_DESCRIPTION");
  unique(documents.map((document) => document.h1), "DUPLICATE_H1");
  unique(documents.map((document) => [
    ...document.intro.paragraphs,
    ...document.principles.map((principle) => `${principle.title} ${principle.description}`),
    ...document.faqs.map((faq) => `${faq.question} ${faq.answer}`),
  ].join("\n")), "DUPLICATE_BODY");

  for (const city of GYEONGGI_CITIES) {
    const cityRegion = regions.find((region) => region.route === `/areas/gyeonggi/${city}`);
    const stem = cityStem(city);
    if (!cityRegion || cityRegion.label !== stem || cityRegion.keywordBase !== stem) {
      throw new Error(`GYEONGGI_CITY_LABEL_MISMATCH:${city}`);
    }
    for (const district of GYEONGGI_CITY_DISTRICTS[city] ?? []) {
      const districtRegion = regions.find((region) => region.route === `/areas/gyeonggi/${city}/${district}`);
      if (!districtRegion || districtRegion.label !== `${stem} ${district}` || districtRegion.keywordBase !== `${stem}${district}`) {
        throw new Error(`GYEONGGI_DISTRICT_LABEL_MISMATCH:${city}:${district}`);
      }
    }
  }

  for (const document of documents) {
    const region = regions.find((candidate) => candidate.id === document.regionId);
    if (!region) throw new Error(`MISSING_DOCUMENT_REGION:${document.route}`);
    const expected = keywordSet(region);
    if (JSON.stringify(document.keywords) !== JSON.stringify(expected)) {
      throw new Error(`KEYWORD_CONTRACT:${document.route}`);
    }
    assertDocumentSafety(document, region, massageBomSources.get(region.route));
  }
}

const regions = buildRegions();
const massageBomBaseline = materializeMassageBomBaseline();
const massageBomSources = joinMassageBomSources(regions, massageBomBaseline);
const documents = buildContent(regions, massageBomSources);
assertSnapshot(regions, documents, massageBomSources);

const regionalSnapshot = {
  schemaVersion: 1,
  status: "CALLME_OWNED_REGION_SNAPSHOT",
  scope: "7 service roots plus 97 administrative city/gu routes; dong/eup/myeon/gun excluded",
  counts: {
    regions: regions.length,
    serviceRoots: regions.filter((region) => region.kind === "service-root").length,
    administrativeHubs: regions.filter((region) => region.kind === "administrative-hub").length,
    massageBomSemanticRoutes: regions.filter((region) => region.source.kind === "massagebom-region-semantics").length,
    starVerifiedCheongjuRoutes: regions.filter((region) => region.source.kind === "star-verified-locality").length,
  },
  excludedCountyRoutes: EXCLUDED_COUNTY_ROUTES,
  operatingFacts: OPERATING_FACTS,
  regions,
};

const contentSnapshot = {
  schemaVersion: 1,
  status: "CALLME_OWNED_CONTENT_SNAPSHOT",
  materialization: {
    source: "massagebom-live-canonical-generators",
    massageBomMatchedRoutes: massageBomSources.size,
    cheongjuFallbackRoutes: regions.filter((region) => region.rootKey === "cheongju").length,
  },
  counts: {
    documents: documents.length,
    uniqueTitles: documents.length,
    uniqueDescriptions: documents.length,
    uniqueH1: documents.length,
    exactKeywordsPerRoute: KEYWORD_SUFFIXES.length,
  },
  documents,
};

await mkdir(DATA_DIR, { recursive: true });
await Promise.all([
  writeFile(path.join(DATA_DIR, "regions.generated.json"), `${JSON.stringify(regionalSnapshot, null, 2)}\n`),
  writeFile(path.join(DATA_DIR, "region-content.generated.json"), `${JSON.stringify(contentSnapshot, null, 2)}\n`),
]);

console.log(`CALLME_REGION_SNAPSHOT_OK regions=${regions.length} roots=7 admin=97 massagebom=99 cheongju=5`);
