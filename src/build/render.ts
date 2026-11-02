import { SITE_TITLE, SITE_URL } from "./config.ts";
import { withBase } from "./paths.ts";
import type { PostFrontmatter } from "./markdown.ts";

/** Minimal HTML shell for Phase A (full layout lands in Phase B). */
export function renderPostPage(
  frontmatter: PostFrontmatter,
  bodyHtml: string,
): string {
  const title = frontmatter.title ?? SITE_TITLE;
  const cssHref = withBase("/assets/main.css");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)}</title>
  <link rel="stylesheet" href="${cssHref}">
  <!-- site: ${SITE_URL} -->
</head>
<body>
  <main>
    <article>
      <h1>${escapeHtml(title)}</h1>
      ${bodyHtml}
    </article>
  </main>
</body>
</html>
`;
}

function escapeHtml(text: string): string {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
