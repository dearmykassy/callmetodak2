import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { RegionalTemplate } from "@/src/components/RegionalTemplate";
import { getRegionalHeroImage, getSocialImage } from "@/src/data/image-release";
import {
  getChildren,
  getNearbyRegions,
  getRegionBySegments,
  getRegionContent,
  REGIONS,
} from "@/src/data/callme-regions";

type RegionPageProps = {
  params: Promise<{ segments: string[] }>;
};

export const dynamicParams = false;

export function generateStaticParams() {
  return REGIONS.map((region) => ({ segments: region.segments }));
}

export async function generateMetadata({ params }: RegionPageProps): Promise<Metadata> {
  const { segments } = await params;
  const region = getRegionBySegments(segments);
  if (!region) return {};

  const content = getRegionContent(region.id);
  const socialImage = getSocialImage(getRegionalHeroImage(region.route), content.h1);
  return {
    title: { absolute: content.title },
    description: content.description,
    keywords: content.keywords,
    alternates: { canonical: region.route },
    robots: { index: true, follow: true },
    openGraph: {
      title: content.title,
      description: content.description,
      url: region.route,
      locale: "ko_KR",
      type: "website",
      ...(socialImage ? { images: socialImage } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: content.title,
      description: content.description,
      ...(socialImage ? { images: socialImage } : {}),
    },
  };
}

export default async function RegionalPage({ params }: RegionPageProps) {
  const { segments } = await params;
  const region = getRegionBySegments(segments);
  if (!region) notFound();

  return (
    <RegionalTemplate
      region={region}
      content={getRegionContent(region.id)}
      childRegions={getChildren(region.id)}
      nearby={getNearbyRegions(region)}
    />
  );
}
