import fs from "node:fs";
import path from "node:path";
import { parseMarkdownFile } from "./markdown.ts";
import {
  DIST_DIR,
  POSTS_DIR,
  PUBLIC_DIR,
  STYLES_DIR,
  slugFromFilename,
} from "./paths.ts";
import { renderPostPage } from "./render.ts";

function ensureDir(dir: string): void {
  fs.mkdirSync(dir, { recursive: true });
}

function copyDirIfExists(src: string, dest: string): void {
  if (!fs.existsSync(src)) return;
  ensureDir(dest);
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const from = path.join(src, entry.name);
    const to = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirIfExists(from, to);
    } else {
      fs.copyFileSync(from, to);
    }
  }
}

function build(): void {
  ensureDir(DIST_DIR);

  // Copy static assets (Phase A: public/ + styles).
  copyDirIfExists(PUBLIC_DIR, DIST_DIR);
  copyDirIfExists(STYLES_DIR, path.join(DIST_DIR, "assets"));

  const postFiles = fs.existsSync(POSTS_DIR)
    ? fs.readdirSync(POSTS_DIR).filter((f) => f.endsWith(".md"))
    : [];

  if (postFiles.length === 0) {
    throw new Error(`No Markdown posts found in ${POSTS_DIR}`);
  }

  // Phase A: wire one Markdown file → HTML (first post only).
  // Full index listing + multi-post build is Phase B.
  const filename = postFiles.sort()[0]!;
  const filePath = path.join(POSTS_DIR, filename);
  const parsed = parseMarkdownFile(filePath);
  const slug = parsed.frontmatter.slug ?? slugFromFilename(filename);

  const postDir = path.join(DIST_DIR, "posts", slug);
  ensureDir(postDir);
  const html = renderPostPage(parsed.frontmatter, parsed.bodyHtml);
  fs.writeFileSync(path.join(postDir, "index.html"), html, "utf8");

  // Placeholder home page pointing at the scaffolded post.
  const home = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>doxiebytes</title>
  <link rel="stylesheet" href="/assets/main.css">
</head>
<body>
  <main>
    <p>Scaffold build OK. Post: <a href="/posts/${slug}/">${escapeAttr(parsed.frontmatter.title ?? slug)}</a></p>
  </main>
</body>
</html>
`;
  fs.writeFileSync(path.join(DIST_DIR, "index.html"), home, "utf8");

  console.log(`Built post → dist/posts/${slug}/index.html`);
  console.log("Built home → dist/index.html");
}

function escapeAttr(text: string): string {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

build();
