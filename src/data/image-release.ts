import type { CSSProperties } from "react";

import releaseJson from "./image-release.generated.json";

export type CopySide = "left" | "right";

export type HeaderPalette = {
  stripAverage: string;
  headerPrimary: string;
  headerSecondary: string;
  text: string;
  contrastRatio: number;
};

export type ReleasedHeroImage = {
  assetId: string;
  jobId: string;
  sourceSha256: string;
  subjectSide: CopySide;
  copySide: CopySide;
  files: {
    desktop: string;
    tablet: string;
    mobile: string;
  };
  palette: HeaderPalette;
};

type RecordValue = Record<string, unknown>;

type ImageHeaderStyle = CSSProperties & Record<
  "--image-header-primary" | "--image-header-secondary" | "--image-header-text",
  string
>;

const RELEASE_SCHEMA = "callme-todaki-runtime-image-release/v1";
const PUBLIC_IMAGE_PREFIX = "/images/callme-todaki/v1/";
const SHA256 = /^[a-f0-9]{64}$/;
const HEX_COLOR = /^#[a-f0-9]{6}$/i;

function asRecord(value: unknown): RecordValue | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as RecordValue
    : null;
}

function isCopySide(value: unknown): value is CopySide {
  return value === "left" || value === "right";
}

function isPublicWebpPath(value: unknown): value is string {
  return typeof value === "string"
    && value.startsWith(PUBLIC_IMAGE_PREFIX)
    && value.endsWith(".webp")
    && !value.includes("..");
}

function readPalette(value: unknown): HeaderPalette | null {
  const palette = asRecord(value);
  if (!palette
    || typeof palette.stripAverage !== "string"
    || typeof palette.headerPrimary !== "string"
    || typeof palette.headerSecondary !== "string"
    || typeof palette.text !== "string"
    || typeof palette.contrastRatio !== "number"
    || !HEX_COLOR.test(palette.stripAverage)
    || !HEX_COLOR.test(palette.headerPrimary)
    || !HEX_COLOR.test(palette.headerSecondary)
    || !HEX_COLOR.test(palette.text)
    || palette.contrastRatio < 4.5) {
    return null;
  }

  return {
    stripAverage: palette.stripAverage,
    headerPrimary: palette.headerPrimary,
    headerSecondary: palette.headerSecondary,
    text: palette.text,
    contrastRatio: palette.contrastRatio,
  };
}

function readReleasedHero(value: unknown): ReleasedHeroImage | null {
  const image = asRecord(value);
  const files = image && asRecord(image.files);
  const palette = image && readPalette(image.palette);

  if (!image
    || !files
    || !palette
    || typeof image.assetId !== "string"
    || typeof image.jobId !== "string"
    || typeof image.sourceSha256 !== "string"
    || !SHA256.test(image.sourceSha256)
    || !isCopySide(image.subjectSide)
    || !isCopySide(image.copySide)
    || image.subjectSide === image.copySide
    || !isPublicWebpPath(files.desktop)
    || !isPublicWebpPath(files.tablet)
    || !isPublicWebpPath(files.mobile)) {
    return null;
  }

  return {
    assetId: image.assetId,
    jobId: image.jobId,
    sourceSha256: image.sourceSha256,
    subjectSide: image.subjectSide,
    copySide: image.copySide,
    files: {
      desktop: files.desktop,
      tablet: files.tablet,
      mobile: files.mobile,
    },
    palette,
  };
}

const rawRelease = asRecord(releaseJson);
const activeRelease = rawRelease
  && rawRelease.schemaVersion === RELEASE_SCHEMA
  && rawRelease.status === "ACTIVE"
  && rawRelease.releaseVersion === "v1";

const activeHomeHero = activeRelease ? readReleasedHero(rawRelease.home) : null;
const rawRegionalHeroes = activeRelease ? asRecord(rawRelease.regions) : null;

export const imageReleaseStatus = activeRelease && activeHomeHero && rawRegionalHeroes
  ? "ACTIVE"
  : "PENDING";

export function getHomeHeroImage(): ReleasedHeroImage | null {
  return imageReleaseStatus === "ACTIVE" ? activeHomeHero : null;
}

export function getRegionalHeroImage(route: string): ReleasedHeroImage | null {
  if (imageReleaseStatus !== "ACTIVE" || !rawRegionalHeroes) return null;
  return readReleasedHero(rawRegionalHeroes[route]);
}

export function getImageHeaderStyle(image: ReleasedHeroImage | null): ImageHeaderStyle | undefined {
  if (!image) return undefined;

  return {
    "--image-header-primary": image.palette.headerPrimary,
    "--image-header-secondary": image.palette.headerSecondary,
    "--image-header-text": image.palette.text,
  };
}

export function getSocialImage(image: ReleasedHeroImage | null, alt: string) {
  if (!image) return undefined;

  return [{
    url: image.files.desktop,
    width: 1672,
    height: 941,
    type: "image/webp" as const,
    alt,
  }];
}
