import type { Metadata } from "next";
import { formatPrice, OPERATING_FACTS } from "@/src/data/callme-regions";
import styles from "../fixed-page.module.css";

export const metadata: Metadata = {
  title: "코스·가격",
  description: "콜미토닥이 센슈얼 감성 테라피의 60분·90분·120분 이용 가격을 확인하세요.",
  alternates: { canonical: "/pricing" },
  robots: { index: true, follow: true },
  openGraph: {
    title: "콜미토닥이 코스·가격",
    description: "콜미토닥이 센슈얼 감성 테라피의 60분·90분·120분 이용 가격을 확인하세요.",
    url: "/pricing",
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "콜미토닥이 코스·가격",
    description: "콜미토닥이 센슈얼 감성 테라피의 60분·90분·120분 이용 가격을 확인하세요.",
  },
};

export default function PricingPage() { return <main className={styles.page}><div className={styles.shell}><header className={styles.head}><span className={styles.eyebrow}>TODAKI SIGNATURE COURSE</span><h1>센슈얼 감성 테라피 가격</h1><p>한 가지 전용 코스를 이용 시간에 맞춰 선택하고 전화로 일정을 확인하세요.</p></header><div className={styles.content}><section className={styles.section}><div className={`${styles.table} ${styles.singleCourseTable}`}>{OPERATING_FACTS.courses.map((course) => <article className={`${styles.price} ${styles.singleCoursePrice}`} key={course.name}><h3>{course.name}</h3><ul>{course.items.map(([minutes, price]) => <li key={minutes}><span>{minutes}분</span><b>{formatPrice(price)}</b></li>)}</ul></article>)}</div></section><section className={styles.section}><div className={styles.notice}><strong>선입금 없는 100% 현장 후불</strong><p>이용 금액은 현장에서 결제하며, 현장 카드 결제가 가능합니다.</p></div><a className={styles.cta} href="tel:05082023906">코스 전화상담</a></section></div></div></main>; }
