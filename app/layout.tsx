import type { Metadata } from "next";
import "./globals.css";
import "./image-release.css";

import { getHomeHeroImage, getSocialImage } from "@/src/data/image-release";
import { SITE_URL } from "@/src/data/site";

const homeSocialImage = getSocialImage(getHomeHeroImage(), "콜미토닥이 여성전용 출장마사지 안내");

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "콜미토닥이", template: "%s | 콜미토닥이" },
  description: "서울·인천·경기와 충청권 여성전용 출장마사지 안내. 지역과 시간을 전화로 확인하는 콜미토닥이.",
  robots: { index: true, follow: true },
  alternates: { canonical: "/" },
  openGraph: {
    title: "콜미토닥이",
    description: "서울·인천·경기와 충청권 여성전용 출장마사지 안내. 지역과 시간을 전화로 확인하세요.",
    type: "website",
    url: "/",
    locale: "ko_KR",
    ...(homeSocialImage ? { images: homeSocialImage } : {}),
  },
  twitter: {
    card: "summary_large_image",
    title: "콜미토닥이",
    description: "서울·인천·경기와 충청권 여성전용 출장마사지 안내. 지역과 시간을 전화로 확인하세요.",
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
