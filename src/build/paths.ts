import path from "node:path";
import { fileURLToPath } from "node:url";
import { BASE_PATH, SITE_URL } from "./config.ts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const ROOT = path.resolve(__dirname, "../..");
export const CONTENT_DIR = path.join(ROOT, "content");
export const POSTS_DIR = path.join(CONTENT_DIR, "posts");
export const PUBLIC_DIR = path.join(ROOT, "public");
export const STYLES_DIR = path.join(ROOT, "src", "site", "styles");
export const SCRIPTS_DIR = path.join(ROOT, "src", "site", "scripts");
export const DIST_DIR = path.join(ROOT, "dist");

export function withBase(sitePath: string): string {
  const normalized = sitePath.startsWith("/") ? sitePath : `/${sitePath}`;
  if (BASE_PATH === "/" || BASE_PATH === "") {
    return normalized;
  }
  const base = BASE_PATH.replace(/\/$/, "");
  return `${base}${normalized}`;
}

export function absoluteUrl(sitePath: string): string {
  const origin = SITE_URL.replace(/\/$/, "");
  let pathname = withBase(sitePath);
  if (!pathname.endsWith("/") && !pathname.includes(".")) {
    pathname = `${pathname}/`;
  }
  if (pathname === "//") pathname = "/";
  return `${origin}${pathname}`;
}

/** Slug from `YYYY-MM-DD-slug.md` (date prefix stripped). */
export function slugFromFilename(filename: string): string {
  const base = filename.replace(/\.md$/i, "");
  const match = base.match(/^\d{4}-\d{2}-\d{2}-(.+)$/);
  return match ? match[1]! : base;
}

export function slugifyTag(tag: string): string {
  return tag
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function postPath(slug: string): string {
  return `/posts/${slug}/`;
}

export function tagPath(tagSlug: string): string {
  return `/tags/${tagSlug}/`;
}
