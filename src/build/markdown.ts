import fs from "node:fs";
import matter from "gray-matter";
import { marked } from "marked";
import { slugFromFilename, slugifyTag } from "./paths.ts";

export type PostFrontmatter = {
  title?: string;
  date?: string;
  description?: string;
  draft?: boolean;
  tags?: string[];
  slug?: string;
};

export type Post = {
  slug: string;
  title: string;
  date: string | undefined;
  description: string;
  draft: boolean;
  tags: string[];
  bodyHtml: string;
  filename: string;
};

/** Parse YAML frontmatter + Markdown body → HTML fragment. */
export function parseMarkdownFile(filePath: string): {
  frontmatter: PostFrontmatter;
  bodyHtml: string;
} {
  const raw = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(raw);
  const bodyHtml = marked.parse(content, { async: false }) as string;
  return {
    frontmatter: data as PostFrontmatter,
    bodyHtml,
  };
}

/** gray-matter may coerce YAML dates to Date; normalize to YYYY-MM-DD. */
function normalizeDate(value: unknown): string | undefined {
  if (value == null || value === "") return undefined;
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10);
  }
  const text = String(value).trim();
  if (!text) return undefined;
  const match = text.match(/^(\d{4}-\d{2}-\d{2})/);
  if (match) return match[1];
  const parsed = new Date(text);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toISOString().slice(0, 10);
  }
  return text;
}

export function loadPost(filePath: string, filename: string): Post {
  const { frontmatter, bodyHtml } = parseMarkdownFile(filePath);
  const tags = (frontmatter.tags ?? [])
    .map((t) => String(t).trim())
    .filter(Boolean);

  return {
    slug: frontmatter.slug ?? slugFromFilename(filename),
    title: frontmatter.title ?? slugFromFilename(filename),
    date: normalizeDate(frontmatter.date),
    description: frontmatter.description ?? "",
    draft: Boolean(frontmatter.draft),
    tags,
    bodyHtml,
    filename,
  };
}

export function tagSlug(tag: string): string {
  return slugifyTag(tag);
}
