import { SITE_DESCRIPTION, SITE_TITLE, SITE_URL } from "./config.ts";
import { escapeAttr, escapeHtml } from "./html.ts";
import type { Post } from "./markdown.ts";
import { tagSlug } from "./markdown.ts";
import {
  absoluteUrl,
  postPath,
  tagPath,
  withBase,
} from "./paths.ts";

type PageMeta = {
  title: string;
  description: string;
  canonicalPath: string;
};

function layout(meta: PageMeta, body: string): string {
  const pageTitle =
    meta.title === SITE_TITLE ? SITE_TITLE : `${meta.title} · ${SITE_TITLE}`;
  const description = meta.description || SITE_DESCRIPTION;
  const canonical = absoluteUrl(meta.canonicalPath);
  const cssHref = withBase("/assets/main.css");
  const homeHref = withBase("/");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(pageTitle)}</title>
  <meta name="description" content="${escapeAttr(description)}">
  <link rel="canonical" href="${escapeAttr(canonical)}">
  <meta property="og:title" content="${escapeAttr(pageTitle)}">
  <meta property="og:description" content="${escapeAttr(description)}">
  <meta property="og:url" content="${escapeAttr(canonical)}">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="${escapeAttr(SITE_TITLE)}">
  <link rel="stylesheet" href="${escapeAttr(cssHref)}">
</head>
<body>
  <header class="site-header">
    <a class="site-title" href="${escapeAttr(homeHref)}">${escapeHtml(SITE_TITLE)}</a>
    <nav class="site-nav" aria-label="Primary">
      <a href="${escapeAttr(homeHref)}">Home</a>
    </nav>
  </header>
  <main>
${body}
  </main>
  <footer class="site-footer">
    <p><a href="${escapeAttr(homeHref)}">${escapeHtml(SITE_TITLE)}</a> · ${escapeHtml(SITE_URL.replace(/^https?:\/\//, ""))}</p>
  </footer>
</body>
</html>
`;
}

function formatDate(date: string | undefined): string {
  if (!date) return "";
  const parsed = new Date(`${date}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime())) return escapeHtml(date);
  return parsed.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

function renderTagLinks(tags: string[]): string {
  if (tags.length === 0) return "";
  const links = tags
    .map((tag) => {
      const href = withBase(tagPath(tagSlug(tag)));
      return `<a class="tag" href="${escapeAttr(href)}">${escapeHtml(tag)}</a>`;
    })
    .join(" ");
  return `<p class="tags">${links}</p>`;
}

function postListItem(post: Post): string {
  const href = withBase(postPath(post.slug));
  const date = formatDate(post.date);
  const desc = post.description
    ? `<p class="post-desc">${escapeHtml(post.description)}</p>`
    : "";
  return `<li class="post-item">
  <h2><a href="${escapeAttr(href)}">${escapeHtml(post.title)}</a></h2>
  ${date ? `<time datetime="${escapeAttr(post.date!)}">${date}</time>` : ""}
  ${desc}
  ${renderTagLinks(post.tags)}
</li>`;
}

export function renderIndexPage(posts: Post[]): string {
  const sorted = [...posts].sort((a, b) =>
    (b.date ?? "").localeCompare(a.date ?? ""),
  );
  const list =
    sorted.length === 0
      ? "<p>No posts yet.</p>"
      : `<ul class="post-list">\n${sorted.map(postListItem).join("\n")}\n</ul>`;

  const body = `    <h1>Posts</h1>
    ${list}`;

  return layout(
    {
      title: SITE_TITLE,
      description: SITE_DESCRIPTION,
      canonicalPath: "/",
    },
    body,
  );
}

export function renderPostPage(post: Post): string {
  const date = formatDate(post.date);
  const body = `    <article class="post">
      <header class="post-header">
        <h1>${escapeHtml(post.title)}</h1>
        ${date ? `<time datetime="${escapeAttr(post.date!)}">${date}</time>` : ""}
        ${renderTagLinks(post.tags)}
      </header>
      <div class="post-body">
${post.bodyHtml}
      </div>
    </article>`;

  return layout(
    {
      title: post.title,
      description: post.description || SITE_DESCRIPTION,
      canonicalPath: postPath(post.slug),
    },
    body,
  );
}

export function renderTagPage(tag: string, posts: Post[]): string {
  const sorted = [...posts].sort((a, b) =>
    (b.date ?? "").localeCompare(a.date ?? ""),
  );
  const slug = tagSlug(tag);
  const list = `<ul class="post-list">\n${sorted.map(postListItem).join("\n")}\n</ul>`;
  const body = `    <h1>Tag: ${escapeHtml(tag)}</h1>
    ${list}`;

  return layout(
    {
      title: `Tag: ${tag}`,
      description: `Posts tagged “${tag}” on ${SITE_TITLE}.`,
      canonicalPath: tagPath(slug),
    },
    body,
  );
}

export function renderTagsIndexPage(
  tags: { tag: string; count: number }[],
): string {
  const sorted = [...tags].sort((a, b) => a.tag.localeCompare(b.tag));
  const list =
    sorted.length === 0
      ? "<p>No tags yet.</p>"
      : `<ul class="tag-list">\n${sorted
          .map(({ tag, count }) => {
            const href = withBase(tagPath(tagSlug(tag)));
            return `<li><a href="${escapeAttr(href)}">${escapeHtml(tag)}</a> <span class="count">(${count})</span></li>`;
          })
          .join("\n")}\n</ul>`;

  const body = `    <h1>Tags</h1>
    ${list}`;

  return layout(
    {
      title: "Tags",
      description: `All tags on ${SITE_TITLE}.`,
      canonicalPath: "/tags/",
    },
    body,
  );
}
