import contentJson from "./region-content.generated.json";
import regionsJson from "./regions.generated.json";

export type RegionKind = "service-root" | "administrative-hub" | "locality-page";

export type CallmeRegion = {
  id: string;
  kind: RegionKind;
  rootKey: string;
  name: string;
  label: string;
  keywordBase: string;
  route: string;
  segments: string[];
  parentId: string | null;
  ancestors: string[];
  scopeLabel: string;
  source: {
    kind:
      | "massagebom-region-semantics"
      | "massagebom-nearest-locality-adaptation"
      | "star-verified-locality"
      | "callme-locality-fallback";
    route: string | null;
    note: string;
  };
};

export type RegionContent = {
  regionId: string;
  route: string;
  title: string;
  description: string;
  h1: string;
  keywords: string[];
  hero: { eyebrow: string; lead: string };
  intro: { heading: string; paragraphs: string[] };
  principles: Array<{ title: string; description: string }>;
  faqs: Array<{ question: string; answer: string }>;
};

export type OperatingFacts = {
  phone: { display: string; href: string };
  phoneConsultation: string;
  paymentTiming: string;
  cardPayment: string;
  availabilityNotice: string;
  courses: Array<{ name: string; items: Array<[number, number]> }>;
};

type RegionalSnapshot = {
  counts: {
    regions: number;
    serviceRoots: number;
    administrativeHubs: number;
    localityPages: number;
    massageBomSemanticRoutes: number;
    massageBomAdaptedRoutes: number;
    starVerifiedCheongjuRoutes: number;
    callmeFallbackRoutes: number;
  };
  operatingFacts: OperatingFacts;
  regions: CallmeRegion[];
};

type ContentSnapshot = {
  documents: RegionContent[];
};

const regionalSnapshot = regionsJson as unknown as RegionalSnapshot;
const contentSnapshot = contentJson as unknown as ContentSnapshot;

export const REGION_COUNTS = regionalSnapshot.counts;
export const OPERATING_FACTS = regionalSnapshot.operatingFacts;
export const REGIONS = regionalSnapshot.regions;
export const REGION_CONTENT = contentSnapshot.documents;

const regionByRoute = new Map(REGIONS.map((region) => [region.route, region]));
const contentById = new Map(REGION_CONTENT.map((content) => [content.regionId, content]));
const regionById = new Map(REGIONS.map((region) => [region.id, region]));

export function regionRoute(segments: readonly string[]): string {
  return `/areas/${segments.map((segment) => decodeURIComponent(segment).normalize("NFC")).join("/")}`;
}

export function getRegionBySegments(segments: readonly string[]): CallmeRegion | null {
  return regionByRoute.get(regionRoute(segments)) ?? null;
}

export function getRegionContent(regionId: string): RegionContent {
  const content = contentById.get(regionId);
  if (!content) throw new Error(`MISSING_REGION_CONTENT:${regionId}`);
  return content;
}

export function getChildren(regionId: string): CallmeRegion[] {
  return REGIONS
    .filter((region) => region.parentId === regionId)
    .sort((left, right) => left.label.localeCompare(right.label, "ko"));
}

export function getBreadcrumbs(region: CallmeRegion): CallmeRegion[] {
  return [...region.ancestors, region.id]
    .map((id) => regionById.get(id))
    .filter((entry): entry is CallmeRegion => Boolean(entry));
}

export function getNearbyRegions(region: CallmeRegion): CallmeRegion[] {
  const candidates = region.parentId
    ? getChildren(region.parentId).filter((candidate) => candidate.id !== region.id)
    : getChildren(region.id);

  return candidates.slice(0, 6);
}

export function formatPrice(value: number): string {
  return `${value.toLocaleString("ko-KR")}원`;
}
