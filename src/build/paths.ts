import path from "node:path";
import { fileURLToPath } from "node:url";
import { BASE_PATH } from "./config.ts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** Repo root (parent of `src/`). */
export const ROOT = path.resolve(__dirname, "../..");
export const CONTENT_DIR = path.join(ROOT, "content");
export const POSTS_DIR = path.join(CONTENT_DIR, "posts");
export const PUBLIC_DIR = path.join(ROOT, "public");
export const STYLES_DIR = path.join(ROOT, "src", "site", "styles");
export const DIST_DIR = path.join(ROOT, "dist");

/**
 * Join a site-absolute path with BASE_PATH.
 * BASE_PATH is `/` for the custom domain (blog.doxiebytes.com).
 */
export function withBase(sitePath: string): string {
  const normalized = sitePath.startsWith("/") ? sitePath : `/${sitePath}`;
  if (BASE_PATH === "/" || BASE_PATH === "") {
    return normalized;
  }
  const base = BASE_PATH.replace(/\/$/, "");
  return `${base}${normalized}`;
}

/** Default slug from `YYYY-MM-DD-slug.md` filename (strip date prefix). */
export function slugFromFilename(filename: string): string {
  const base = filename.replace(/\.md$/i, "");
  const match = base.match(/^\d{4}-\d{2}-\d{2}-(.+)$/);
  return match ? match[1]! : base;
}
