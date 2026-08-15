import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const read = (file) => readFile(new URL(file, root), "utf8");

test("Netlify build uses the pinned Next static-export lane", async () => {
  const [packageJson, nextConfig, netlifyConfig] = await Promise.all([
    read("package.json"),
    read("next.config.ts"),
    read("netlify.toml"),
  ]);

  assert.match(packageJson, /"next": "16\.2\.6"/u);
  assert.match(packageJson, /"build:netlify": "next build && node scripts\/verify-netlify-export\.mjs"/u);
  assert.match(nextConfig, /output: "export"/u);
  assert.match(nextConfig, /trailingSlash: true/u);
  assert.match(nextConfig, /unoptimized: true/u);
  assert.match(netlifyConfig, /command = "npm run build:netlify"/u);
  assert.match(netlifyConfig, /publish = "out"/u);
});
