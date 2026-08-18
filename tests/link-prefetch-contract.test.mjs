import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

async function sourceFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const descendants = await Promise.all(entries.map(async (entry) => {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return sourceFiles(entryPath);
    return /\.(?:ts|tsx)$/u.test(entry.name) ? [entryPath] : [];
  }));
  return descendants.flat();
}

test("all Next links use the production no-prefetch wrapper", async () => {
  const files = (await Promise.all([
    sourceFiles(path.join(root, "app")),
    sourceFiles(path.join(root, "src")),
  ])).flat();
  const sources = await Promise.all(files.map(async (file) => ({
    file,
    source: await readFile(file, "utf8"),
  })));
  const relative = (file) => path.relative(root, file);
  const directNextImports = sources
    .filter(({ source }) => /from ["']next\/link["']/u.test(source))
    .map(({ file }) => relative(file));

  assert.deepEqual(directNextImports, ["src/components/SiteLink.tsx"]);
  for (const { file, source } of sources.filter(({ source }) => /<Link\b/u.test(source))) {
    assert.match(source, /import Link from "@\/src\/components\/SiteLink"/u, relative(file));
  }

  const wrapper = sources.find(({ file }) => relative(file) === "src/components/SiteLink.tsx")?.source;
  assert.ok(wrapper);
  assert.match(wrapper, /process\.env\.NODE_ENV === "production" \? false : props\.prefetch/u);
  assert.match(wrapper, /<NextLink \{\.\.\.props\} prefetch=\{prefetch\} \/>/u);
});
