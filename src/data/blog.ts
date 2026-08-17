import blogJson from "./blog.generated.json";

export type BlogSection = {
  heading: string;
  paragraphs: string[];
};

export type BlogPost = {
  slug: string;
  title: string;
  description: string;
  publishedAt: string;
  modifiedAt: string;
  h1: string;
  eyebrow: string;
  summary: string;
  intro: string;
  sections: BlogSection[];
  relatedSlug: string;
  relatedLabel: string;
};

type BlogSnapshot = {
  schemaVersion: "callme-todaki-blog/v1";
  posts: BlogPost[];
};

const snapshot = blogJson as BlogSnapshot;

export const BLOG_POSTS = snapshot.posts;

export function getBlogPost(slug: string): BlogPost | null {
  return BLOG_POSTS.find((post) => post.slug === slug) ?? null;
}

export function getBlogPostRoute(post: Pick<BlogPost, "slug">): string {
  return `/blog/${post.slug}`;
}
