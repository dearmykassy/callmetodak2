import blogJson from "./blog.generated.json";
import { SITE_URL } from "./site";

export type BlogSection = {
  heading: string;
  paragraphs: string[];
};

export type BlogPost = {
  slug: string;
  title: string;
  description: string;
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

export const BLOG_SITE_URL = SITE_URL;
