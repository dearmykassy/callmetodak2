import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import ts from "typescript";

const analyticsSource = readFileSync(new URL("../src/lib/analytics.ts", import.meta.url), "utf8");
const trackerSource = readFileSync(new URL("../src/components/Ga4Tracker.tsx", import.meta.url), "utf8");
const transpiledAnalytics = ts.transpileModule(analyticsSource, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
}).outputText;
const analytics = await import(
  `data:text/javascript;base64,${Buffer.from(transpiledAnalytics).toString("base64")}`
);

test("GA4 measurement IDs are strictly validated", () => {
  assert.equal(analytics.parseGaMeasurementId(" G-ABC1234 "), "G-ABC1234");
  assert.equal(analytics.parseGaMeasurementId(undefined), undefined);
  assert.equal(analytics.parseGaMeasurementId("UA-123-1"), undefined);
  assert.equal(analytics.parseGaMeasurementId("G-ABC';alert(1)"), undefined);
});

test("analytics paths are query-free and page types are stable", () => {
  assert.equal(analytics.normalizePagePath("areas/seoul?private=value"), "/areas/seoul/");
  assert.equal(analytics.inferAnalyticsPageType("/"), "home");
  assert.equal(analytics.inferAnalyticsPageType("/areas/"), "area_index");
  assert.equal(analytics.inferAnalyticsPageType("/areas/seoul/gangnam/"), "region");
  assert.equal(analytics.inferAnalyticsPageType("/blog/example/"), "blog_post");
});

test("CTA context removes phone numbers and prefers explicit locations", () => {
  assert.equal(
    analytics.resolveCtaLocation(undefined, "0508-202-3906 전화상담", undefined),
    "전화상담",
  );
  assert.equal(analytics.resolveCtaLocation(undefined, "0508-202-3906", undefined), "phone_cta");
  assert.equal(analytics.resolveCtaLocation("footer", "0508-202-3906", undefined), "footer");
});

test("page titles are redacted and length limited", () => {
  const title = `예약 문의 0508-202-3906 user@example.com ${"가".repeat(120)}`;
  const sanitized = analytics.sanitizePageTitle(title);
  assert.equal(sanitized.includes("0508"), false);
  assert.equal(sanitized.includes("@"), false);
  assert.equal(sanitized.length, 100);
});

test("every tel link is delegated without claiming call completion", () => {
  assert.match(trackerSource, /a\[href\^=\\?"tel:\\?"\]/u);
  assert.match(trackerSource, /document\.addEventListener\("click", handlePhoneClick, true\)/u);
  assert.match(trackerSource, /"phone_cta_clicked"/u);
  assert.match(trackerSource, /page_location: `\$\{window\.location\.origin\}\$\{pagePath\}`/u);
  assert.match(trackerSource, /page_title: sanitizePageTitle\(document\.title\)/u);
  assert.match(trackerSource, /transport_type: "beacon"/u);
  assert.doesNotMatch(trackerSource, /phone_call_completed/u);
  assert.doesNotMatch(trackerSource, /anchor\.href/u);
});
