import fs from "node:fs";
import matter from "gray-matter";
import { marked } from "marked";

export type PostFrontmatter = {
  title?: string;
  date?: string;
  description?: string;
  draft?: boolean;
  tags?: string[];
  slug?: string;
};

export type ParsedPost = {
  frontmatter: PostFrontmatter;
  bodyHtml: string;
  rawBody: string;
};

/** Parse YAML frontmatter + Markdown body → HTML fragment. */
export function parseMarkdownFile(filePath: string): ParsedPost {
  const raw = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(raw);
  const bodyHtml = marked.parse(content, { async: false }) as string;
  return {
    frontmatter: data as PostFrontmatter,
    bodyHtml,
    rawBody: content,
  };
}
