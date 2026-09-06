import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

const root = path.resolve(new URL("..", import.meta.url).pathname);
const phoneTokenPattern = /(?:tel:0508\d{7,8}|\+82-508-\d{3,4}-\d{4}|0508-\d{3,4}-\d{4}|(?<![\d:])0508\d{7,8}(?!\d))/gu;

async function listFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const descendants = await Promise.all(entries.map(async (entry) => {
    const entryPath = path.join(directory, entry.name);
    return entry.isDirectory() ? listFiles(entryPath) : [entryPath];
  }));
  return descendants.flat();
}

test("one owner-approved Todaki phone profile governs every active source", async () => {
  const profile = JSON.parse(await readFile(path.join(root, "src/data/phone-profile.json"), "utf8"));
  assert.deepEqual(profile, {
    schemaVersion: "callme-todaki-phone-profile/v1",
    profileId: "todaki-0508-201-1232-v1",
    digits: "05082011232",
    display: "0508-201-1232",
    href: "tel:05082011232",
    schema: "+82-508-201-1232",
  });

  const allowed = new Set([profile.digits, profile.display, profile.href, profile.schema]);
  const sourceFiles = (await Promise.all(
    ["app", "src", "scripts"].map((directory) => listFiles(path.join(root, directory))),
  )).flat().filter((file) => /\.(?:tsx?|mjs|json)$/u.test(file));

  for (const file of sourceFiles) {
    const source = await readFile(file, "utf8");
    for (const token of source.match(phoneTokenPattern) ?? []) {
      assert.ok(allowed.has(token), `${path.relative(root, file)} contains an unapproved phone token: ${token}`);
    }
  }

  const regions = JSON.parse(await readFile(path.join(root, "src/data/regions.generated.json"), "utf8"));
  assert.deepEqual(regions.operatingFacts.phone, {
    display: profile.display,
    href: profile.href,
    schema: profile.schema,
  });
});
