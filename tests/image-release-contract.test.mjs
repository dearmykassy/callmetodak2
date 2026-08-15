import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const read = (file) => readFile(new URL(file, root), "utf8");

test("active image release is bound to the root-owned PASS review and physical files", async () => {
  const [manifestText, runtime, releaseScript] = await Promise.all([
    read("src/data/image-release.generated.json"),
    read("src/data/image-release.ts"),
    read("scripts/release-callme-images.mjs"),
  ]);
  const manifest = JSON.parse(manifestText);

  assert.equal(manifest.schemaVersion, "callme-todaki-runtime-image-release/v1");
  assert.equal(manifest.status, "ACTIVE");
  assert.equal(manifest.releaseVersion, "v1");
  assert.equal(manifest.platformKey, "callme-todaki");
  assert.equal(manifest.review.relativePath, "reviews/callme-todaki.release-review.v1.json");
  assert.match(manifest.review.sha256, /^[a-f0-9]{64}$/u);
  assert.equal(manifest.home.subjectSide, "left");
  assert.equal(manifest.home.copySide, "right");

  const regionalEntries = Object.values(manifest.regions);
  assert.equal(regionalEntries.length, 104);
  const reuseCounts = new Map();
  for (const entry of regionalEntries) {
    reuseCounts.set(entry.assetId, (reuseCounts.get(entry.assetId) ?? 0) + 1);
  }
  assert.equal(reuseCounts.size, 18);
  assert.deepEqual([...reuseCounts.values()].filter((count) => count === 6).length, 14);
  assert.deepEqual([...reuseCounts.values()].filter((count) => count === 5).length, 4);

  const releasedEntries = [manifest.home, ...regionalEntries];
  const releasedFiles = new Set();
  for (const entry of releasedEntries) {
    assert.equal(entry.subjectSide, "left");
    assert.equal(entry.copySide, "right");
    for (const file of Object.values(entry.files)) {
      releasedFiles.add(file);
    }
  }
  assert.equal(releasedFiles.size, 57);
  await Promise.all([...releasedFiles].map((file) => stat(new URL(`public${file}`, root))));

  assert.match(runtime, /rawRelease\.status === "ACTIVE"/u);
  assert.match(releaseScript, /callme-todaki\.release-review\.v1\.json/u);
  assert.match(releaseScript, /review\.status === "PASS"/u);
  assert.match(releaseScript, /review\.reviewer === "root-coordinator"/u);
});

test("image release locks the Callme asset and route contract", async () => {
  const releaseScript = await read("scripts/release-callme-images.mjs");

  assert.match(releaseScript, /EXPECTED_ROUTE_COUNT = 104/u);
  assert.match(releaseScript, /EXPECTED_REGIONAL_ASSET_COUNT = 18/u);
  assert.match(releaseScript, /assetsUsedSixTimes: 14/u);
  assert.match(releaseScript, /assetsUsedFiveTimes: 4/u);
  assert.match(releaseScript, /width: 1672, height: 941/u);
  assert.match(releaseScript, /width: 1100, height: 619/u);
  assert.match(releaseScript, /width: 700, height: 394/u);
  assert.match(releaseScript, /top 18% palette/u);
  assert.match(releaseScript, /refusing to clobber/u);
});
