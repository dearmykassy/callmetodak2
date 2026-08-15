import type { Metadata } from "next";
import Link from "next/link";

import { BLOG_POSTS, getBlogPostRoute } from "@/src/data/blog";

import styles from "./blog.module.css";

export const metadata: Metadata = {
  title: "이용 안내 블로그",
  description: "콜미토닥이 여성전용 출장마사지 이용 전, 장소·시간·상담과 결제 기준을 살펴보는 안내 글입니다.",
  alternates: { canonical: "/blog" },
  robots: { index: true, follow: true },
  openGraph: {
    title: "콜미토닥이 이용 안내 블로그",
    description: "장소와 시간, 전화상담 전에 확인할 내용을 차분히 정리한 콜미토닥이 안내 글입니다.",
    url: "/blog",
    locale: "ko_KR",
    type: "website",
    images: [],
  },
  twitter: {
    card: "summary",
    title: "콜미토닥이 이용 안내 블로그",
    description: "장소와 시간, 전화상담 전에 확인할 내용을 차분히 정리한 콜미토닥이 안내 글입니다.",
    images: [],
  },
};

export default function BlogPage() {
  return (
    <>
      <header className={styles.hubHead}>
        <p className={styles.eyebrow}>CALLME TODAKI JOURNAL</p>
        <h1>이용 전,<br />차분히 확인하는 글</h1>
        <p>콜미토닥이 여성전용 출장마사지 안내에서 장소와 시간, 전화상담 전에 살펴볼 내용을 정리합니다.</p>
      </header>
      <div className={styles.content}>
        <section className={styles.section} aria-labelledby="blog-posts-title">
          <div className={styles.sectionHeading}>
            <div><p className={styles.eyebrow}>GUIDES</p><h2 id="blog-posts-title">방문형 이용을 생각할 때</h2></div>
            <p>두 글은 상황별로 필요한 확인을 정리한 안내입니다. 실제 이용 가능 여부는 전화상담에서 확인해 주세요.</p>
          </div>
          <div className={styles.postGrid}>
            {BLOG_POSTS.map((post, index) => (
              <Link className={styles.postCard} href={getBlogPostRoute(post)} key={post.slug}>
                <span>GUIDE 0{index + 1}</span>
                <h2>{post.h1}</h2>
                <p>{post.summary}</p>
                <strong>글 읽기 →</strong>
              </Link>
            ))}
          </div>
        </section>
        <section className={styles.section}>
          <div className={styles.notice}>
            <strong>확인된 운영 기준만 안내합니다</strong>
            <p>24시간 전화상담 · 선입금 없는 100% 현장 후불 · 현장 카드 결제 가능. 지역과 희망 시간, 코스는 0508-202-3906으로 확인해 주세요.</p>
          </div>
        </section>
      </div>
    </>
  );
}
