import type { Metadata } from "next";
import Link from "next/link";

import styles from "../fixed-page.module.css";

export const metadata: Metadata = {
  title: "지역 안내",
  description: "콜미토닥이 서비스 지역 안내. 서울·인천·경기와 천안·아산·청주·대전을 확인하세요.",
  alternates: { canonical: "/areas" },
  robots: { index: true, follow: true },
  openGraph: {
    title: "콜미토닥이 지역 안내",
    description: "콜미토닥이 서비스 지역 안내. 서울·인천·경기와 천안·아산·청주·대전을 확인하세요.",
    url: "/areas",
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "콜미토닥이 지역 안내",
    description: "콜미토닥이 서비스 지역 안내. 서울·인천·경기와 천안·아산·청주·대전을 확인하세요.",
  },
};

const areas = [
  { name: "서울", route: "/areas/seoul" },
  { name: "인천", route: "/areas/incheon" },
  { name: "경기", route: "/areas/gyeonggi" },
  { name: "천안", route: "/areas/cheonan" },
  { name: "아산", route: "/areas/asan" },
  { name: "청주", route: "/areas/cheongju" },
  { name: "대전", route: "/areas/daejeon" },
] as const;

export default function AreasPage() { return <main className={styles.page}><div className={styles.shell}><header className={styles.head}><span className={styles.eyebrow}>SERVICE AREAS</span><h1>내 지역을<br />먼저 확인하세요</h1><p>서울·인천·경기와 천안·아산·청주·대전의 행정시·행정구 기준으로 지역 안내를 준비합니다.</p></header><div className={styles.content}><section className={styles.section}><span className={styles.eyebrow}>7 ROOT AREAS</span><h2>서비스 지역</h2><div className={styles.cards}>{areas.map((area) => <Link className={styles.card} href={area.route} key={area.name}><strong>{area.name}</strong><span>시·구 안내 보기 →</span></Link>)}</div></section><section className={styles.section}><div className={styles.notice}><strong>동·읍·면·군 페이지는 만들지 않습니다.</strong><p>지역 검색은 7개 서비스 root와 해당 행정시·행정구 페이지로 안내합니다. 정확한 서비스 주소와 희망 시간은 전화상담에서 확인해 주세요.</p></div><a className={styles.cta} href="tel:05082023906">전화로 지역 확인하기</a></section></div></div></main>; }
