import type { Metadata } from "next";
import styles from "../fixed-page.module.css";

export const metadata: Metadata = {
  title: "코스·가격",
  description: "콜미토닥이 코스별 이용 금액 안내. 희망 시간과 코스를 전화로 확인하세요.",
  alternates: { canonical: "/pricing" },
  robots: { index: true, follow: true },
  openGraph: {
    title: "콜미토닥이 코스·가격",
    description: "콜미토닥이 코스별 이용 금액 안내. 희망 시간과 코스를 전화로 확인하세요.",
    url: "/pricing",
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "콜미토닥이 코스·가격",
    description: "콜미토닥이 코스별 이용 금액 안내. 희망 시간과 코스를 전화로 확인하세요.",
  },
};
const courses = [["타이", [["60분", "80,000원"], ["90분", "100,000원"], ["120분", "120,000원"]]], ["아로마", [["60분", "90,000원"], ["90분", "110,000원"], ["120분", "130,000원"]]], ["힐링", [["60분", "100,000원"], ["90분", "120,000원"], ["120분", "140,000원"]]], ["스페셜", [["60분", "110,000원"], ["90분", "130,000원"], ["120분", "150,000원"]]], ["남성전용", [["60분", "120,000원"], ["90분", "150,000원"]]]] as const;

export default function PricingPage() { return <main className={styles.page}><div className={styles.shell}><header className={styles.head}><span className={styles.eyebrow}>COURSE & PRICE</span><h1>코스별 이용 금액</h1><p>희망 시간과 코스를 알려주시면 가능한 구성을 전화로 확인해 드립니다.</p></header><div className={styles.content}><section className={styles.section}><div className={styles.table}>{courses.map(([name, rows]) => <article className={styles.price} key={name}><h3>{name}</h3><ul>{rows.map(([time, price]) => <li key={time}><span>{time}</span><b>{price}</b></li>)}</ul></article>)}</div></section><section className={styles.section}><div className={styles.notice}><strong>선입금 없는 100% 현장 후불</strong><p>이용 금액은 현장에서 결제하며, 현장 카드 결제가 가능합니다.</p></div><a className={styles.cta} href="tel:05082023906">코스 전화상담</a></section></div></div></main>; }
