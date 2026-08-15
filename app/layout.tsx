import type { Metadata } from "next";
import "./globals.css";
import "./image-release.css";

import { getHomeHeroImage, getSocialImage } from "@/src/data/image-release";
import { SITE_URL } from "@/src/data/site";

const homeSocialImage = getSocialImage(getHomeHeroImage(), "콜미토닥이 여성전용 출장마사지 안내");
const HOME_METADATA_TITLE = "토닥이 | 여성전용마사지 | 여성전용출장마사지 | 콜미토닥이";
const HOME_METADATA_KEYWORDS = [
  "토닥이",
  "여성전용마사지",
  "여성전용출장마사지",
  "수도권 여성전용출장마사지",
  "지역별 여성전용마사지",
  "24시간 전화상담",
];

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: HOME_METADATA_TITLE, template: "%s | 콜미토닥이" },
  description: "서울·인천·경기와 충청권 지역별 여성전용출장마사지 안내. 코스와 가격, 24시간 전화상담 기준을 콜미토닥이에서 확인하세요.",
  keywords: HOME_METADATA_KEYWORDS,
  robots: { index: true, follow: true },
  alternates: { canonical: "/" },
  openGraph: {
    title: HOME_METADATA_TITLE,
    description: "서울·인천·경기와 충청권 지역별 여성전용출장마사지 안내. 코스와 가격, 24시간 전화상담 기준을 확인하세요.",
    type: "website",
    url: "/",
    locale: "ko_KR",
    ...(homeSocialImage ? { images: homeSocialImage } : {}),
  },
  twitter: {
    card: "summary_large_image",
    title: HOME_METADATA_TITLE,
    description: "서울·인천·경기와 충청권 지역별 여성전용출장마사지 안내. 코스와 가격, 24시간 전화상담 기준을 확인하세요.",
    ...(homeSocialImage ? { images: homeSocialImage } : {}),
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
