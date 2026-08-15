import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  BLOG_POSTS,
  BLOG_SITE_URL,
  getBlogPost,
  getBlogPostRoute,
} from "@/src/data/blog";

import styles from "../blog.module.css";

type BlogPostPageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamicParams = false;

export function generateStaticParams() {
  return BLOG_POSTS.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) return {};

  const route = getBlogPostRoute(post);
  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: route },
    robots: { index: true, follow: true },
    openGraph: {
      title: post.title,
      description: post.description,
      url: route,
      locale: "ko_KR",
      type: "article",
      images: [],
    },
    twitter: {
      card: "summary",
      title: post.title,
      description: post.description,
      images: [],
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) notFound();

  const route = getBlogPostRoute(post);
  const relatedRoute = `/blog/${post.relatedSlug}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.h1,
    description: post.description,
    url: `${BLOG_SITE_URL}${route}`,
    mainEntityOfPage: `${BLOG_SITE_URL}${route}`,
    inLanguage: "ko-KR",
    articleSection: "이용 안내",
    isPartOf: {
      "@type": "Blog",
      name: "콜미토닥이 블로그",
      url: `${BLOG_SITE_URL}/blog`,
    },
    publisher: {
      "@type": "Organization",
      name: "콜미토닥이",
      telephone: "0508-202-3906",
    },
  };

  return (
    <>
      <header className={styles.articleHead}>
        <p className={styles.eyebrow}>{post.eyebrow}</p>
        <h1>{post.h1}</h1>
        <p>{post.description}</p>
      </header>
      <div className={styles.content}>
        <article className={styles.article}>
          <p className={styles.articleIntro}>{post.intro}</p>
          {post.sections.map((section) => (
            <section className={styles.articleSection} key={section.heading}>
              <h2>{section.heading}</h2>
              {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            </section>
          ))}
          <nav className={styles.articleLinks} aria-label="글 관련 링크">
            <Link href="/areas">서비스 지역 안내</Link>
            <a className={styles.call} href="tel:05082023906">24시간 전화상담<br />0508-202-3906</a>
            <Link href={relatedRoute}>관련 글<br />{post.relatedLabel}</Link>
          </nav>
          <Link className={styles.backLink} href="/blog">← 블로그 목록으로</Link>
        </article>
      </div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
    </>
  );
}
