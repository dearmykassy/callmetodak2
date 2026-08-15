import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const read = (file) => readFile(new URL(file, root), "utf8");

test("Netlify build uses the pinned Next static-export lane", async () => {
  const [packageJson, nextConfig, netlifyConfig, verifier] = await Promise.all([
    read("package.json"),
    read("next.config.ts"),
    read("netlify.toml"),
    read("scripts/verify-netlify-export.mjs"),
  ]);

  assert.match(packageJson, /"next": "16\.2\.6"/u);
  assert.match(packageJson, /"build:netlify": "next build && node scripts\/verify-netlify-export\.mjs"/u);
  assert.match(nextConfig, /output: "export"/u);
  assert.match(nextConfig, /trailingSlash: true/u);
  assert.match(nextConfig, /unoptimized: true/u);
  assert.match(netlifyConfig, /command = "npm run build:netlify"/u);
  assert.match(netlifyConfig, /publish = "out"/u);
  assert.match(verifier, /const TODAKI_COURSE = "센슈얼 감성 테라피"/u);
  assert.match(verifier, /const TODAKI_PRICES = \["120,000원", "150,000원", "180,000원"\]/u);
  assert.match(verifier, /Legacy general-massage course leaked/u);
});
