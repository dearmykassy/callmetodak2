#!/usr/bin/env node

import { createHash, randomUUID } from "node:crypto";
import {
  access,
  link,
  lstat,
  mkdir,
  open,
  readFile,
  rename,
  rm,
  unlink,
  writeFile,
} from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { inflateSync } from "node:zlib";
import sharp from "sharp";

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(SCRIPT_DIR, "..");
const PIPELINE_ROOT = "/Users/ssm/Documents/Codex/runtome/pipeline/gpt-image-2-region-banners-v1";
const RELEASE_VERSION = "v1";
const PLATFORM_KEY = "callme-todaki";
const EXPECTED_ROUTE_COUNT = 104;
const EXPECTED_REGIONAL_ASSET_COUNT = 18;
const OUTPUT_DIMENSIONS = {
  desktop: { width: 1672, height: 941 },
  tablet: { width: 1100, height: 619 },
  mobile: { width: 700, height: 394 },
};
const SOURCE_DIMENSIONS = OUTPUT_DIMENSIONS.desktop;
const REVIEW_PATH = path.join(PIPELINE_ROOT, "reviews", "callme-todaki.release-review.v1.json");
const MANIFEST_PATH = path.join(PROJECT_ROOT, "src", "data", "image-release.generated.json");
const ROUTES_PATH = path.join(PROJECT_ROOT, "src", "data", "regions.generated.json");
const PUBLIC_PARENT = path.join(PROJECT_ROOT, "public", "images", PLATFORM_KEY);
const OUTPUT_DIRECTORY = path.join(PUBLIC_PARENT, RELEASE_VERSION);
const ARTIFACTS_DIRECTORY = path.join(PROJECT_ROOT, "artifacts");
const ROUTE_PLAN_PATH = path.join(ARTIFACTS_DIRECTORY, `callme-image-release-${RELEASE_VERSION}.route-plan.json`);
const AUDIT_PATH = path.join(ARTIFACTS_DIRECTORY, `callme-image-release-${RELEASE_VERSION}.audit.json`);
const LOCK_PATH = path.join(PROJECT_ROOT, `.callme-image-release-${RELEASE_VERSION}.lock`);
const PNG_MAGIC = "89504e470d0a1a0a";
const SHA256 = /^[a-f0-9]{64}$/;

function blocked(message) {
  throw new Error(`CALLME_IMAGE_RELEASE_BLOCKED: ${message}`);
}

function assert(condition, message) {
  if (!condition) blocked(message);
}

function asRecord(value, label) {
  assert(value && typeof value === "object" && !Array.isArray(value), `${label} must be an object`);
  return value;
}

function asString(value, label) {
  assert(typeof value === "string" && value.length > 0, `${label} must be a non-empty string`);
  return value;
}

function asSha256(value, label) {
  const sha256 = asString(value, label);
  assert(SHA256.test(sha256), `${label} must be a lowercase SHA-256`);
  return sha256;
}

function copySide(value, label) {
  assert(value === "left" || value === "right", `${label} must be left or right`);
  return value;
}

function isWithin(root, candidate) {
  const relative = path.relative(root, candidate);
  return relative !== "" && !relative.startsWith(`..${path.sep}`) && relative !== ".." && !path.isAbsolute(relative);
}

function resolvePipelineRelative(relativePath, expectedPrefix, label) {
  assert(typeof relativePath === "string" && relativePath.startsWith(expectedPrefix), `${label} must start with ${expectedPrefix}`);
  assert(!relativePath.includes("\\") && !relativePath.includes(".."), `${label} must not contain traversal`);
  const absolutePath = path.resolve(PIPELINE_ROOT, ...relativePath.split("/"));
  assert(isWithin(PIPELINE_ROOT, absolutePath), `${label} escapes the pipeline root`);
  return absolutePath;
}

async function assertRegularFile(filePath, label) {
  let stats;
  try {
    stats = await lstat(filePath);
  } catch (error) {
    if (error && error.code === "ENOENT") blocked(`${label} is missing: ${filePath}`);
    throw error;
  }
  assert(stats.isFile() && !stats.isSymbolicLink(), `${label} must be a regular, non-symlink file: ${filePath}`);
}

async function pathExists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch (error) {
    if (error && error.code === "ENOENT") return false;
    throw error;
  }
}

async function readJson(filePath, label) {
  await assertRegularFile(filePath, label);
  const text = await readFile(filePath, "utf8");
  try {
    return { value: JSON.parse(text), sha256: sha256Text(text) };
  } catch (error) {
    blocked(`${label} is not valid JSON: ${error.message}`);
  }
}

function sha256Text(value) {
  return createHash("sha256").update(value).digest("hex");
}

async function sha256File(filePath) {
  await assertRegularFile(filePath, "hashed file");
  return createHash("sha256").update(await readFile(filePath)).digest("hex");
}

function hex(rgb) {
  return `#${rgb.map((value) => Math.max(0, Math.min(255, Math.round(value))).toString(16).padStart(2, "0")).join("")}`;
}

function relativeLuminance(rgb) {
  const channel = (value) => {
    const normalized = value / 255;
    return normalized <= 0.03928
      ? normalized / 12.92
      : ((normalized + 0.055) / 1.055) ** 2.4;
  };
  return (0.2126 * channel(rgb[0])) + (0.7152 * channel(rgb[1])) + (0.0722 * channel(rgb[2]));
}

function contrastRatio(first, second) {
  const brighter = Math.max(relativeLuminance(first), relativeLuminance(second));
  const darker = Math.min(relativeLuminance(first), relativeLuminance(second));
  return (brighter + 0.05) / (darker + 0.05);
}

function paeth(left, up, upperLeft) {
  const estimate = left + up - upperLeft;
  const leftDistance = Math.abs(estimate - left);
  const upDistance = Math.abs(estimate - up);
  const upperLeftDistance = Math.abs(estimate - upperLeft);
  if (leftDistance <= upDistance && leftDistance <= upperLeftDistance) return left;
  if (upDistance <= upperLeftDistance) return up;
  return upperLeft;
}

function getPngPalette(buffer, label) {
  assert(buffer.subarray(0, 8).toString("hex") === PNG_MAGIC, `${label} does not have PNG magic`);
  let offset = 8;
  let header = null;
  let sawEnd = false;
  const idat = [];

  while (offset < buffer.length) {
    assert(offset + 12 <= buffer.length, `${label} has a truncated PNG chunk`);
    const length = buffer.readUInt32BE(offset);
    const type = buffer.toString("ascii", offset + 4, offset + 8);
    const dataStart = offset + 8;
    const dataEnd = dataStart + length;
    const crcEnd = dataEnd + 4;
    assert(crcEnd <= buffer.length, `${label} has a malformed ${type} chunk`);
    const data = buffer.subarray(dataStart, dataEnd);

    if (type === "IHDR") {
      assert(!header && length === 13, `${label} has an invalid IHDR`);
      header = {
        width: data.readUInt32BE(0),
        height: data.readUInt32BE(4),
        bitDepth: data[8],
        colorType: data[9],
        compression: data[10],
        filter: data[11],
        interlace: data[12],
      };
    } else if (type === "IDAT") {
      idat.push(data);
    } else if (type === "IEND") {
      sawEnd = true;
      break;
    }
    offset = crcEnd;
  }

  assert(header, `${label} is missing IHDR`);
  assert(sawEnd, `${label} is missing IEND`);
  assert(header.width === SOURCE_DIMENSIONS.width && header.height === SOURCE_DIMENSIONS.height,
    `${label} must be ${SOURCE_DIMENSIONS.width}x${SOURCE_DIMENSIONS.height}, received ${header.width}x${header.height}`);
  assert(header.bitDepth === 8 && header.compression === 0 && header.filter === 0 && header.interlace === 0,
    `${label} must be a non-interlaced 8-bit PNG`);

  const channelsByColorType = { 0: 1, 2: 3, 4: 2, 6: 4 };
  const channels = channelsByColorType[header.colorType];
  assert(channels, `${label} uses unsupported PNG color type ${header.colorType}`);
  assert(idat.length > 0, `${label} is missing image data`);

  let pixels;
  try {
    pixels = inflateSync(Buffer.concat(idat));
  } catch (error) {
    blocked(`${label} has unreadable PNG image data: ${error.message}`);
  }

  const rowLength = header.width * channels;
  const expectedLength = (rowLength + 1) * header.height;
  assert(pixels.length === expectedLength, `${label} has unexpected decoded PNG length`);

  const sampleHeight = Math.ceil(header.height * 0.18);
  const sampleStride = Math.max(1, Math.floor(header.width / 420));
  const totals = [0, 0, 0];
  let sampleCount = 0;
  let inputOffset = 0;
  let previous = Buffer.alloc(rowLength);

  for (let y = 0; y < header.height; y += 1) {
    const filterType = pixels[inputOffset];
    inputOffset += 1;
    const row = Buffer.from(pixels.subarray(inputOffset, inputOffset + rowLength));
    inputOffset += rowLength;

    for (let index = 0; index < rowLength; index += 1) {
      const left = index >= channels ? row[index - channels] : 0;
      const up = previous[index];
      const upperLeft = index >= channels ? previous[index - channels] : 0;
      if (filterType === 1) row[index] = (row[index] + left) & 0xff;
      else if (filterType === 2) row[index] = (row[index] + up) & 0xff;
      else if (filterType === 3) row[index] = (row[index] + Math.floor((left + up) / 2)) & 0xff;
      else if (filterType === 4) row[index] = (row[index] + paeth(left, up, upperLeft)) & 0xff;
      else assert(filterType === 0, `${label} uses unsupported PNG filter type ${filterType}`);
    }

    if (y < sampleHeight) {
      for (let x = 0; x < header.width; x += sampleStride) {
        const pixelOffset = x * channels;
        const gray = row[pixelOffset];
        const red = header.colorType === 0 || header.colorType === 4 ? gray : row[pixelOffset];
        const green = header.colorType === 0 || header.colorType === 4 ? gray : row[pixelOffset + 1];
        const blue = header.colorType === 0 || header.colorType === 4 ? gray : row[pixelOffset + 2];
        const alpha = header.colorType === 4 ? row[pixelOffset + 1] / 255
          : header.colorType === 6 ? row[pixelOffset + 3] / 255
            : 1;
        totals[0] += red * alpha;
        totals[1] += green * alpha;
        totals[2] += blue * alpha;
        sampleCount += 1;
      }
    }
    previous = row;
  }

  assert(sampleCount > 0, `${label} has no pixels in its top 18% strip`);
  const stripAverage = totals.map((value) => Math.round(value / sampleCount));
  const headerPrimary = stripAverage.map((value) => Math.round(value * 0.8));
  const headerSecondary = stripAverage.map((value) => Math.round(value * 0.64));
  const cream = [255, 247, 235];
  const minimumContrast = Math.min(
    contrastRatio(headerPrimary, cream),
    contrastRatio(headerSecondary, cream),
  );
  assert(minimumContrast >= 4.5,
    `${label} top 18% palette cannot support the required dark translucent header (contrast ${minimumContrast.toFixed(2)})`);

  return {
    dimensions: { width: header.width, height: header.height },
    palette: {
      stripAverage: hex(stripAverage),
      headerPrimary: hex(headerPrimary),
      headerSecondary: hex(headerSecondary),
      text: "#fff7eb",
      contrastRatio: Number(minimumContrast.toFixed(2)),
      sourceStrip: "top_18_percent_of_source_png",
      treatment: "slightly_darker_translucent_gradient",
    },
  };
}

function normalizeReviewEntry(value, label) {
  const entry = asRecord(value, label);
  const contactSheet = asRecord(entry.contactSheet, `${label}.contactSheet`);
  const subjectSide = copySide(entry.subjectSide, `${label}.subjectSide`);
  const copy = copySide(entry.copySide, `${label}.copySide`);
  assert(subjectSide !== copy, `${label} must put copy space opposite the woman`);

  return {
    jobId: asString(entry.jobId, `${label}.jobId`),
    assetId: asString(entry.assetId, `${label}.assetId`),
    sourceSha256: asSha256(entry.sourceSha256, `${label}.sourceSha256`),
    subjectSide,
    copySide: copy,
    contactSheet: {
      relativePath: asString(contactSheet.relativePath, `${label}.contactSheet.relativePath`),
      sha256: asSha256(contactSheet.sha256, `${label}.contactSheet.sha256`),
    },
  };
}

async function loadRootReview() {
  const { value, sha256 } = await readJson(REVIEW_PATH, "root-authored Callme PASS review");
  const review = asRecord(value, "root-authored Callme PASS review");
  assert(review.schemaVersion === "callme-todaki-image-release-review/v1", "review schemaVersion is not supported");
  assert(review.platformKey === PLATFORM_KEY, "review platformKey is not callme-todaki");
  assert(review.status === "PASS", "review status must be PASS");
  assert(review.reviewer === "root-coordinator" && review.authoredBy === "root-coordinator",
    "review must be authored and signed off by root-coordinator");
  assert(Array.isArray(review.regional) && review.regional.length === EXPECTED_REGIONAL_ASSET_COUNT,
    `review must list exactly ${EXPECTED_REGIONAL_ASSET_COUNT} regional originals`);

  return {
    sha256,
    home: normalizeReviewEntry(review.home, "review.home"),
    regional: review.regional.map((entry, index) => normalizeReviewEntry(entry, `review.regional[${index}]`)),
  };
}

async function verifyContactSheet(binding, label, cache) {
  assert(binding.relativePath.startsWith("reviews/contact-sheets/") && binding.relativePath.endsWith(".png"),
    `${label}.contactSheet.relativePath must point to a pipeline PNG contact sheet`);
  const contactSheetPath = resolvePipelineRelative(binding.relativePath, "reviews/contact-sheets/", `${label}.contactSheet.relativePath`);
  const actual = cache.get(contactSheetPath) ?? await sha256File(contactSheetPath);
  cache.set(contactSheetPath, actual);
  assert(actual === binding.sha256, `${label} contact sheet SHA-256 does not match`);
}

async function verifyAsset(entry, assetClass, contactSheetCache) {
  await verifyContactSheet(entry.contactSheet, `review entry ${entry.jobId}`, contactSheetCache);
  assert(/^[a-z0-9][a-z0-9-]{2,80}$/.test(entry.jobId), `review entry ${entry.jobId} has an unsafe jobId`);
  const jobPath = path.join(PIPELINE_ROOT, "queue", "jobs", `${entry.jobId}.json`);
  const { value: jobValue } = await readJson(jobPath, `job ${entry.jobId}`);
  const job = asRecord(jobValue, `job ${entry.jobId}`);
  assert(job.jobId === entry.jobId, `job ${entry.jobId} does not self-identify correctly`);
  assert(job.platformKey === PLATFORM_KEY, `job ${entry.jobId} is not for ${PLATFORM_KEY}`);
  assert(job.assetClass === assetClass, `job ${entry.jobId} is not a ${assetClass}`);
  assert(job.assetId === entry.assetId, `job ${entry.jobId} assetId does not match the PASS review`);
  const routeCapacity = Number(job.routeCapacity);
  if (assetClass === "homepage-master") assert(routeCapacity === 0, `homepage job ${entry.jobId} must have zero regional capacity`);
  if (assetClass === "regional-master") assert(routeCapacity === 5 || routeCapacity === 6,
    `regional job ${entry.jobId} must declare a five- or six-route cap`);

  const output = asRecord(job.output, `job ${entry.jobId}.output`);
  const originalRelativePath = asString(output.relativePath, `job ${entry.jobId}.output.relativePath`);
  assert(originalRelativePath === `originals/${PLATFORM_KEY}/${entry.assetId}.png`,
    `job ${entry.jobId} must use its deterministic Callme original path`);
  const originalPath = resolvePipelineRelative(originalRelativePath, `originals/${PLATFORM_KEY}/`, `job ${entry.jobId}.output.relativePath`);
  await assertRegularFile(originalPath, `source ${entry.jobId}`);
  const original = await readFile(originalPath);
  const actualSha256 = createHash("sha256").update(original).digest("hex");
  assert(actualSha256 === entry.sourceSha256, `source SHA-256 mismatch for ${entry.jobId}`);

  const png = getPngPalette(original, `source ${entry.jobId}`);
  return {
    ...entry,
    assetClass,
    originalPath,
    originalRelativePath,
    routeCapacity,
    dimensions: png.dimensions,
    palette: png.palette,
  };
}

async function loadRoutes() {
  const { value } = await readJson(ROUTES_PATH, "Callme regional route source");
  const snapshot = asRecord(value, "Callme regional route source");
  assert(Array.isArray(snapshot.regions), "Callme regional route source must contain regions");
  const routes = snapshot.regions.map((region, index) => {
    const record = asRecord(region, `regions[${index}]`);
    const route = asString(record.route, `regions[${index}].route`);
    assert(route.startsWith("/areas/"), `regions[${index}].route is not a regional route`);
    return route;
  }).sort((left, right) => (left < right ? -1 : left > right ? 1 : 0));

  assert(routes.length === EXPECTED_ROUTE_COUNT, `expected ${EXPECTED_ROUTE_COUNT} regional routes, received ${routes.length}`);
  assert(new Set(routes).size === EXPECTED_ROUTE_COUNT, "regional routes must be unique");
  return routes;
}

function planRegionalRoutes(regionalAssets, routes) {
  const orderedAssets = [...regionalAssets].sort((left, right) => (
    left.assetId < right.assetId ? -1 : left.assetId > right.assetId ? 1 : 0
  ));
  const plannedCapacities = orderedAssets.map((asset) => asset.routeCapacity);
  assert(plannedCapacities.filter((capacity) => capacity === 6).length === 14,
    "selected regional jobs must contain exactly fourteen six-route originals");
  assert(plannedCapacities.filter((capacity) => capacity === 5).length === 4,
    "selected regional jobs must contain exactly four five-route originals");
  assert(plannedCapacities.reduce((total, capacity) => total + capacity, 0) === EXPECTED_ROUTE_COUNT,
    "selected 14×6 + 4×5 regional capacities do not equal 104 routes");

  let cursor = 0;
  const assignments = orderedAssets.map((asset, index) => {
    const assignedRoutes = routes.slice(cursor, cursor + plannedCapacities[index]);
    cursor += plannedCapacities[index];
    assert(assignedRoutes.length === plannedCapacities[index], `not enough routes for ${asset.assetId}`);
    return { ...asset, routes: assignedRoutes };
  });

  assert(cursor === routes.length, "route allocation did not consume every regional route");
  assert(assignments.filter((assignment) => assignment.routes.length === 6).length === 14,
    "regional plan must assign six routes to exactly fourteen originals");
  assert(assignments.filter((assignment) => assignment.routes.length === 5).length === 4,
    "regional plan must assign five routes to exactly four originals");
  assert(Math.max(...assignments.map((assignment) => assignment.routes.length)) <= 6,
    "regional plan exceeds the six-route reuse ceiling");
  return assignments;
}

function relativePublicPath(...parts) {
  return `/${path.posix.join("images", PLATFORM_KEY, RELEASE_VERSION, ...parts)}`;
}

function publicFilesForAsset(asset) {
  const assetDirectory = asset.assetClass === "homepage-master" ? ["home"] : ["regional", asset.assetId];
  return {
    desktop: relativePublicPath(...assetDirectory, "desktop.webp"),
    tablet: relativePublicPath(...assetDirectory, "tablet.webp"),
    mobile: relativePublicPath(...assetDirectory, "mobile.webp"),
  };
}

function manifestAsset(asset) {
  return {
    assetId: asset.assetId,
    jobId: asset.jobId,
    sourceSha256: asset.sourceSha256,
    subjectSide: asset.subjectSide,
    copySide: asset.copySide,
    files: publicFilesForAsset(asset),
    palette: {
      stripAverage: asset.palette.stripAverage,
      headerPrimary: asset.palette.headerPrimary,
      headerSecondary: asset.palette.headerSecondary,
      text: asset.palette.text,
      contrastRatio: asset.palette.contrastRatio,
    },
  };
}

function buildDocuments(review, home, assignments) {
  const manifestRegions = {};
  for (const assignment of assignments) {
    const asset = manifestAsset(assignment);
    for (const route of assignment.routes) manifestRegions[route] = asset;
  }

  const routePlan = {
    schemaVersion: "callme-todaki-image-route-plan/v1",
    releaseVersion: RELEASE_VERSION,
    platformKey: PLATFORM_KEY,
    review: {
      relativePath: path.posix.join("reviews", "callme-todaki.release-review.v1.json"),
      sha256: review.sha256,
    },
    regionalRouteCount: EXPECTED_ROUTE_COUNT,
    regionalAssetCount: EXPECTED_REGIONAL_ASSET_COUNT,
    distribution: {
      assetsUsedSixTimes: 14,
      assetsUsedFiveTimes: 4,
      maximumReuse: 6,
    },
    assignments: assignments.map((assignment) => ({
      assetId: assignment.assetId,
      jobId: assignment.jobId,
      sourceSha256: assignment.sourceSha256,
      routes: assignment.routes,
      reuseCount: assignment.routes.length,
      palette: assignment.palette,
    })),
  };

  const manifest = {
    schemaVersion: "callme-todaki-runtime-image-release/v1",
    status: "ACTIVE",
    releaseVersion: RELEASE_VERSION,
    platformKey: PLATFORM_KEY,
    review: routePlan.review,
    home: manifestAsset(home),
    regions: manifestRegions,
  };

  const audit = {
    schemaVersion: "callme-todaki-image-release-audit/v1",
    status: "PASS",
    releaseVersion: RELEASE_VERSION,
    platformKey: PLATFORM_KEY,
    review: routePlan.review,
    sourceOriginals: {
      home: { jobId: home.jobId, assetId: home.assetId, sha256: home.sourceSha256 },
      regional: assignments.map((assignment) => ({
        jobId: assignment.jobId,
        assetId: assignment.assetId,
        sha256: assignment.sourceSha256,
        reuseCount: assignment.routes.length,
      })),
    },
    sourceDimensions: SOURCE_DIMENSIONS,
    derivedDimensions: OUTPUT_DIMENSIONS,
    routeCount: EXPECTED_ROUTE_COUNT,
    uniqueRegionalAssetCount: EXPECTED_REGIONAL_ASSET_COUNT,
    derivedFileCount: (EXPECTED_REGIONAL_ASSET_COUNT + 1) * Object.keys(OUTPUT_DIMENSIONS).length,
    distribution: routePlan.distribution,
    outputDirectory: path.relative(PROJECT_ROOT, OUTPUT_DIRECTORY),
  };

  return { routePlan, manifest, audit };
}

async function verifyPendingManifest() {
  const { value } = await readJson(MANIFEST_PATH, "runtime image manifest");
  const manifest = asRecord(value, "runtime image manifest");
  assert(manifest.schemaVersion === "callme-todaki-runtime-image-release/v1", "runtime image manifest schemaVersion is not supported");
  assert(manifest.status === "PENDING" && manifest.releaseVersion === RELEASE_VERSION,
    "runtime image manifest must be the checked-in PENDING v1 manifest before release");
}

async function assertOutputIsUnused() {
  assert(!await pathExists(OUTPUT_DIRECTORY), `refusing to clobber existing output directory ${OUTPUT_DIRECTORY}`);
  assert(!await pathExists(ROUTE_PLAN_PATH), `refusing to clobber existing route plan ${ROUTE_PLAN_PATH}`);
  assert(!await pathExists(AUDIT_PATH), `refusing to clobber existing audit ${AUDIT_PATH}`);
}

async function createWebp(sourcePath, destinationPath, dimensions) {
  await mkdir(path.dirname(destinationPath), { recursive: true });
  try {
    await sharp(sourcePath)
      .resize({
        width: dimensions.width,
        height: dimensions.height,
        fit: "cover",
        position: "centre",
      })
      .webp({ quality: 88, effort: 5 })
      .toFile(destinationPath);
  } catch (error) {
    blocked(`Sharp failed while deriving ${path.basename(destinationPath)}: ${error.message}`);
  }

  await assertRegularFile(destinationPath, `derived ${path.basename(destinationPath)}`);
  const webpMagic = await readFile(destinationPath);
  assert(webpMagic.subarray(0, 4).toString("ascii") === "RIFF" && webpMagic.subarray(8, 12).toString("ascii") === "WEBP",
    `${path.basename(destinationPath)} is not a WebP file`);
  const metadata = await sharp(destinationPath).metadata();
  assert(metadata.format === "webp", `${path.basename(destinationPath)} metadata format must be WebP`);
  assert(metadata.width === dimensions.width && metadata.height === dimensions.height,
    `${path.basename(destinationPath)} must be ${dimensions.width}x${dimensions.height}, received ${metadata.width}x${metadata.height}`);
}

async function deriveAsset(asset, stagingAssetsDirectory) {
  const publicFiles = publicFilesForAsset(asset);
  for (const [variant, dimensions] of Object.entries(OUTPUT_DIMENSIONS)) {
    const publicPath = publicFiles[variant];
    const relative = publicPath.slice(`/${path.posix.join("images", PLATFORM_KEY, RELEASE_VERSION)}/`.length);
    const destinationPath = path.join(stagingAssetsDirectory, ...relative.split("/"));
    await createWebp(asset.originalPath, destinationPath, dimensions);
  }
}

async function writeJson(filePath, value) {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

async function writeNoClobber(sourcePath, destinationPath) {
  assert(!await pathExists(destinationPath), `refusing to clobber ${destinationPath}`);
  await mkdir(path.dirname(destinationPath), { recursive: true });
  try {
    await link(sourcePath, destinationPath);
  } catch (error) {
    if (error && error.code === "EEXIST") blocked(`refusing to clobber ${destinationPath}`);
    throw error;
  }
}

async function replacePendingManifest(sourcePath) {
  await verifyPendingManifest();
  await rename(sourcePath, MANIFEST_PATH);
}

async function acquireLock() {
  try {
    const handle = await open(LOCK_PATH, "wx");
    await handle.writeFile(`pid=${process.pid}\nrelease=${RELEASE_VERSION}\n`);
    return handle;
  } catch (error) {
    if (error && error.code === "EEXIST") blocked(`release lock already exists: ${LOCK_PATH}`);
    throw error;
  }
}

async function main() {
  const review = await loadRootReview();
  const contactSheetCache = new Map();
  const home = await verifyAsset(review.home, "homepage-master", contactSheetCache);
  const regional = await Promise.all(review.regional.map((entry) => verifyAsset(entry, "regional-master", contactSheetCache)));

  const sourceHashes = [home, ...regional].map((asset) => asset.sourceSha256);
  assert(new Set(sourceHashes).size === sourceHashes.length, "home and all eighteen regional originals must have distinct SHA-256 values");
  assert(new Set(regional.map((asset) => asset.assetId)).size === EXPECTED_REGIONAL_ASSET_COUNT,
    "regional PASS review must list eighteen unique asset IDs");
  assert(new Set([home, ...regional].map((asset) => asset.jobId)).size === EXPECTED_REGIONAL_ASSET_COUNT + 1,
    "PASS review must list nineteen unique job IDs");

  const routes = await loadRoutes();
  const assignments = planRegionalRoutes(regional, routes);
  const documents = buildDocuments(review, home, assignments);

  await verifyPendingManifest();
  await assertOutputIsUnused();
  const lock = await acquireLock();
  const stagingDirectory = path.join(PUBLIC_PARENT, `.${RELEASE_VERSION}-staging-${randomUUID()}`);

  try {
    await verifyPendingManifest();
    await assertOutputIsUnused();
    await mkdir(PUBLIC_PARENT, { recursive: true });
    await mkdir(stagingDirectory, { recursive: false });
    const stagingAssetsDirectory = path.join(stagingDirectory, "assets");
    const stagingRoutePlan = path.join(stagingDirectory, "route-plan.json");
    const stagingAudit = path.join(stagingDirectory, "audit.json");
    const stagingManifest = path.join(stagingDirectory, "manifest.json");

    await deriveAsset(home, stagingAssetsDirectory);
    for (const asset of assignments) await deriveAsset(asset, stagingAssetsDirectory);
    await writeJson(stagingRoutePlan, documents.routePlan);
    await writeJson(stagingAudit, documents.audit);
    await writeJson(stagingManifest, documents.manifest);

    await rename(stagingAssetsDirectory, OUTPUT_DIRECTORY);
    await writeNoClobber(stagingRoutePlan, ROUTE_PLAN_PATH);
    await writeNoClobber(stagingAudit, AUDIT_PATH);
    await replacePendingManifest(stagingManifest);

    console.log(`Callme image release ${RELEASE_VERSION} complete: ${EXPECTED_ROUTE_COUNT} regional routes, 19 originals, 57 WebP files.`);
  } finally {
    await rm(stagingDirectory, { recursive: true, force: true });
    await lock.close();
    await unlink(LOCK_PATH).catch((error) => {
      if (!error || error.code !== "ENOENT") throw error;
    });
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
