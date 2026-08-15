import type { Metadata } from "next";
import styles from "../fixed-page.module.css";

export const metadata: Metadata = {
  title: "이용 안내",
  description: "콜미토닥이 전화상담과 이용 안내. 지역, 시간, 코스를 순서대로 확인하세요.",
  alternates: { canonical: "/guide" },
  robots: { index: true, follow: true },
  openGraph: {
    title: "콜미토닥이 이용 안내",
    description: "콜미토닥이 전화상담과 이용 안내. 지역, 시간, 코스를 순서대로 확인하세요.",
    url: "/guide",
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "콜미토닥이 이용 안내",
    description: "콜미토닥이 전화상담과 이용 안내. 지역, 시간, 코스를 순서대로 확인하세요.",
  },
};
const steps = [["01", "지역 확인", "서비스를 받을 지역을 먼저 알려주세요."], ["02", "시간 확인", "희망 시간을 기준으로 가능한 일정을 확인합니다."], ["03", "코스 안내", "원하는 시간에 맞는 코스를 안내합니다."], ["04", "현장 결제", "선입금 없이 현장에서 후불로 결제합니다."]] as const;

export default function GuidePage() { return <main className={styles.page}><div className={styles.shell}><header className={styles.head}><span className={styles.eyebrow}>HOW TO USE</span><h1>전화 한 통으로<br />순서대로 안내합니다</h1><p>콜미토닥이는 서비스 주소, 희망 시간, 코스를 기준으로 24시간 전화상담을 제공합니다.</p></header><div className={styles.content}><section className={styles.section}><div className={styles.steps}>{steps.map(([number, title, copy]) => <article key={number}><span>{number}</span><h3>{title}</h3><p>{copy}</p></article>)}</div></section><section className={styles.section}><div className={styles.notice}><strong>확인된 운영 기준</strong><p>24시간 전화상담 · 선입금 없는 100% 현장 후불 · 현장 카드 결제 가능</p></div><a className={styles.cta} href="tel:05082023906">전화상담 0508-202-3906</a></section></div></div></main>; }
