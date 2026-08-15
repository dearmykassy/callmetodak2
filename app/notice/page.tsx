import type { Metadata } from "next";
import styles from "../fixed-page.module.css";
import noticeStyles from "./notice.module.css";

const notices = [
  {
    code: "01",
    category: "CONSULTATION",
    title: "24시간 전화상담",
    copy: "지역, 희망 시간, 코스를 0508-202-3906으로 알려주시면 상담에서 확인할 내용을 안내합니다.",
  },
  {
    code: "02",
    category: "PAYMENT",
    title: "선입금 없는 100% 현장 후불",
    copy: "선입금을 요청하지 않습니다. 이용 금액은 사전 송금 없이 현장에서 결제하며, 결제 기준은 상담 중에도 다시 확인할 수 있습니다.",
  },
  {
    code: "03",
    category: "CARD PAYMENT",
    title: "현장 카드 결제 가능",
    copy: "현장에서 카드로 결제할 수 있습니다. 결제 관련 질문은 전화상담에서 함께 확인해 주세요.",
  },
] as const;

export const metadata: Metadata = {
  title: "이용 공지",
  description: "콜미토닥이 결제와 상담 공지. 선입금 없는 현장 후불 기준을 안내합니다.",
  alternates: { canonical: "/notice" },
  robots: { index: true, follow: true },
  openGraph: {
    title: "콜미토닥이 이용 공지",
    description: "콜미토닥이 결제와 상담 공지. 선입금 없는 현장 후불 기준을 안내합니다.",
    url: "/notice",
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "콜미토닥이 이용 공지",
    description: "콜미토닥이 결제와 상담 공지. 선입금 없는 현장 후불 기준을 안내합니다.",
  },
};

export default function NoticePage() {
  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <header className={styles.head}>
          <span className={styles.eyebrow}>NOTICE BOARD</span>
          <h1>이용 전<br />확인할 공지</h1>
          <p>날짜가 아닌, 지금 확인된 운영 기준만 간결하게 안내합니다.</p>
        </header>
        <div className={styles.content}>
          <section className={noticeStyles.noticeBoard} aria-label="운영 공지 목록">
            {notices.map((notice) => (
              <article className={noticeStyles.noticeItem} key={notice.code}>
                <div className={noticeStyles.noticeMeta}><span>{notice.code}</span><small>{notice.category}</small></div>
                <div><h2>{notice.title}</h2><p>{notice.copy}</p></div>
              </article>
            ))}
          </section>
          <section className={noticeStyles.noticeContact} aria-label="전화상담 안내">
            <p>개별 이용 내용은 전화상담에서 확인해 주세요.</p>
            <a className={styles.cta} href="tel:05082023906">전화상담 0508-202-3906</a>
          </section>
        </div>
      </div>
    </main>
  );
}
