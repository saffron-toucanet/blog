import fs from "node:fs";
import { Marked } from "marked";
import matter from "gray-matter";
import { escapeAttr, escapeHtml } from "./html.ts";
import { slugFromFilename, slugifyTag, withBase } from "./paths.ts";

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

/**
 * Markdown → HTML policy: no raw HTML; only http(s)/mailto/relative URLs.
 * Site-absolute paths (`/…`) are rewritten with BASE_PATH.
 */
function isSafeHref(href: string): boolean {
  const trimmed = href.trim();
  if (!trimmed) return false;
  // Block dangerous schemes (also after leading whitespace / control chars).
  if (/^[\s\u0000-\u001F]*(?:javascript|data|vbscript|file)\s*:/i.test(trimmed)) {
    return false;
  }
  return true;
}

function rewriteHref(href: string): string {
  const trimmed = href.trim();
  if (trimmed.startsWith("/") && !trimmed.startsWith("//")) {
    return withBase(trimmed);
  }
  return trimmed;
}

const marked = new Marked();
marked.use({
  // Disable raw HTML tokens so tags are escaped as text (not executed, and
  // not greedily absorbed into HTML blocks that would drop following Markdown).
  tokenizer: {
    html() {
      return undefined;
    },
    tag() {
      return undefined;
    },
  },
  renderer: {
    html() {
      return "";
    },
    link({ href, title, tokens }) {
      const text = this.parser.parseInline(tokens);
      if (!href || !isSafeHref(href)) return text;
      const safe = rewriteHref(href);
      const titleAttr = title ? ` title="${escapeAttr(title)}"` : "";
      return `<a href="${escapeAttr(safe)}"${titleAttr}>${text}</a>`;
    },
    image({ href, title, text }) {
      if (!href || !isSafeHref(href)) return escapeHtml(text || "");
      const safe = rewriteHref(href);
      const titleAttr = title ? ` title="${escapeAttr(title)}"` : "";
      return `<img src="${escapeAttr(safe)}" alt="${escapeAttr(text)}"${titleAttr}>`;
    },
  },
});

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

  const emptySlugTags = tags.filter((t) => !slugifyTag(t));
  if (emptySlugTags.length > 0) {
    throw new Error(
      `Post ${filename}: tag(s) slugify to empty string: ${emptySlugTags
        .map((t) => JSON.stringify(t))
        .join(", ")}`,
    );
  }

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
