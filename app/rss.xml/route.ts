import { BLOG_POSTS, getBlogPostRoute } from "@/src/data/blog";
import { SITE_URL, canonicalUrl } from "@/src/data/site";
import { buildRssXml } from "@/src/lib/rss";

export const dynamic = "force-static";
export const revalidate = false;

export function buildCallmeTodakiRss(): string {
  return buildRssXml({
    title: "콜미토닥이 블로그",
    siteUrl: canonicalUrl("/"),
    feedUrl: `${SITE_URL}/rss.xml`,
    description:
      "여성전용 출장마사지 이용 전 장소, 시간, 전화상담과 현장 결제 기준을 정리한 콜미토닥이 안내입니다.",
    language: "ko-KR",
    items: BLOG_POSTS.map((post) => ({
      title: post.title,
      url: canonicalUrl(getBlogPostRoute(post)),
      description: [
        post.intro,
        ...post.sections.flatMap((section) => [
          section.heading,
          ...section.paragraphs,
        ]),
      ].join("\n\n"),
      publishedAt: post.publishedAt,
      modifiedAt: post.modifiedAt,
      category: "이용 안내",
    })),
  });
}

export function GET(): Response {
  return new Response(buildCallmeTodakiRss(), {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
