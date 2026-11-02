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
  noindex?: boolean;
  home?: boolean;
  ogType?: "website" | "article";
  publishedTime?: string;
  tags?: string[];
};

type PostNeighbors = {
  newer?: Post;
  older?: Post;
};

const THEME_BOOT =
  "(function(){try{var t=localStorage.getItem('theme');if(t==='light'||t==='dark')document.documentElement.setAttribute('data-theme',t)}catch(e){}})();";

function navCurrent(path: string, href: string): string {
  if (href === "/") {
    return path === "/" ? ' aria-current="page"' : "";
  }
  if (href === "/tags/") {
    return path === "/tags/" || path.startsWith("/tags/")
      ? ' aria-current="page"'
      : "";
  }
  return "";
}

function readingMinutes(html: string): number {
  const text = html
    .replace(/<[^>]+>/g, " ")
    .replace(/&[a-z]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
  const words = text ? text.split(" ").length : 0;
  return Math.max(1, Math.round(words / 200));
}

function layout(meta: PageMeta, body: string): string {
  const pageTitle =
    meta.title === SITE_TITLE ? SITE_TITLE : `${meta.title} · ${SITE_TITLE}`;
  const description = meta.description || SITE_DESCRIPTION;
  const canonical = absoluteUrl(meta.canonicalPath);
  const cssHref = withBase("/assets/main.css");
  const themeHref = withBase("/assets/theme.js");
  const homeHref = withBase("/");
  const tagsHref = withBase("/tags/");
  const feedHref = withBase("/feed.xml");
  const faviconHref = withBase("/favicon.svg");
  const ogImage = absoluteUrl("/images/og-default.svg");
  const serifHref = withBase("/fonts/source-serif-4-latin-wght-normal.woff2");
  const sansHref = withBase("/fonts/source-sans-3-latin-wght-normal.woff2");
  const path = meta.canonicalPath;
  const homeCurrent = navCurrent(path, "/");
  const tagsCurrent = navCurrent(path, "/tags/");
  const robots = meta.noindex
    ? `\n  <meta name="robots" content="noindex">`
    : "";
  const ogType = meta.ogType ?? "website";
  const articleMeta =
    ogType === "article"
      ? [
          meta.publishedTime
            ? `\n  <meta property="article:published_time" content="${escapeAttr(meta.publishedTime)}">`
            : "",
          ...(meta.tags ?? []).map(
            (tag) =>
              `\n  <meta property="article:tag" content="${escapeAttr(tag)}">`,
          ),
        ].join("")
      : "";

  const bodyClass = meta.home ? ' class="home"' : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="color-scheme" content="light dark">
  <script>${THEME_BOOT}</script>
  <title>${escapeHtml(pageTitle)}</title>
  <meta name="description" content="${escapeAttr(description)}">${robots}
  <link rel="canonical" href="${escapeAttr(canonical)}">
  <link rel="icon" href="${escapeAttr(faviconHref)}" type="image/svg+xml">
  <link rel="alternate" type="application/rss+xml" title="${escapeAttr(SITE_TITLE)}" href="${escapeAttr(feedHref)}">
  <meta property="og:title" content="${escapeAttr(pageTitle)}">
  <meta property="og:description" content="${escapeAttr(description)}">
  <meta property="og:url" content="${escapeAttr(canonical)}">
  <meta property="og:type" content="${escapeAttr(ogType)}">
  <meta property="og:site_name" content="${escapeAttr(SITE_TITLE)}">
  <meta property="og:image" content="${escapeAttr(ogImage)}">
  <meta name="twitter:card" content="summary_large_image">${articleMeta}
  <link rel="preload" href="${escapeAttr(serifHref)}" as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="${escapeAttr(sansHref)}" as="font" type="font/woff2" crossorigin>
  <link rel="stylesheet" href="${escapeAttr(cssHref)}">
</head>
<body${bodyClass}>
  <a class="skip-link" href="#main">Skip to content</a>
  <header class="site-header">
    <a class="site-title" href="${escapeAttr(homeHref)}">${escapeHtml(SITE_TITLE)}</a>
    <nav class="site-nav" aria-label="Primary">
      <a href="${escapeAttr(homeHref)}"${homeCurrent}>Home</a>
      <a href="${escapeAttr(tagsHref)}"${tagsCurrent}>Tags</a>
      <button type="button" class="theme-toggle" data-theme-toggle aria-label="Toggle color theme">Theme</button>
    </nav>
  </header>
  <main id="main">
${body}
  </main>
  <footer class="site-footer">
    <p><a href="${escapeAttr(homeHref)}">${escapeHtml(SITE_TITLE)}</a> · ${escapeHtml(SITE_URL.replace(/^https?:\/\//, ""))} · <a href="${escapeAttr(tagsHref)}">Tags</a> · <a href="${escapeAttr(feedHref)}">RSS</a></p>
  </footer>
  <script src="${escapeAttr(themeHref)}" defer></script>
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

function postNav(neighbors: PostNeighbors): string {
  const { newer, older } = neighbors;
  if (!newer && !older) return "";
  const newerLink = newer
    ? `<a class="post-nav-newer" href="${escapeAttr(withBase(postPath(newer.slug)))}"><span class="post-nav-label">Newer</span> ${escapeHtml(newer.title)}</a>`
    : `<span class="post-nav-newer"></span>`;
  const olderLink = older
    ? `<a class="post-nav-older" href="${escapeAttr(withBase(postPath(older.slug)))}"><span class="post-nav-label">Older</span> ${escapeHtml(older.title)}</a>`
    : `<span class="post-nav-older"></span>`;
  return `<nav class="post-nav" aria-label="Adjacent posts">
      ${newerLink}
      ${olderLink}
    </nav>`;
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

function sortPosts(posts: Post[]): Post[] {
  return [...posts].sort((a, b) => {
    const byDate = (b.date ?? "").localeCompare(a.date ?? "");
    return byDate !== 0 ? byDate : a.slug.localeCompare(b.slug);
  });
}

export function renderIndexPage(posts: Post[]): string {
  const sorted = sortPosts(posts);
  const list =
    sorted.length === 0
      ? "<p>No posts yet.</p>"
      : `<ul class="post-list">\n${sorted.map(postListItem).join("\n")}\n</ul>`;

  const body = `    <p class="site-intro">${escapeHtml(SITE_DESCRIPTION)}</p>
    <h1 class="section-label">Posts</h1>
    ${list}`;

  return layout(
    {
      title: SITE_TITLE,
      description: SITE_DESCRIPTION,
      canonicalPath: "/",
      home: true,
    },
    body,
  );
}

export function renderPostPage(
  post: Post,
  neighbors: PostNeighbors = {},
): string {
  const date = formatDate(post.date);
  const minutes = readingMinutes(post.bodyHtml);
  const metaBits = [
    date
      ? `<time datetime="${escapeAttr(post.date!)}">${date}</time>`
      : "",
    `<span class="reading-time">${minutes} min read</span>`,
  ]
    .filter(Boolean)
    .join("");

  const body = `    <article class="post">
      <header class="post-header">
        <h1>${escapeHtml(post.title)}</h1>
        <p class="post-meta">${metaBits}</p>
        ${renderTagLinks(post.tags)}
      </header>
      <div class="post-body">
${post.bodyHtml}
      </div>
      ${postNav(neighbors)}
    </article>`;

  return layout(
    {
      title: post.title,
      description: post.description || SITE_DESCRIPTION,
      canonicalPath: postPath(post.slug),
      ogType: "article",
      publishedTime: post.date,
      tags: post.tags,
    },
    body,
  );
}

export function renderTagPage(tag: string, posts: Post[]): string {
  const sorted = sortPosts(posts);
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

export function renderNotFoundPage(): string {
  const homeHref = withBase("/");
  const tagsHref = withBase("/tags/");
  const body = `    <section class="not-found">
      <p class="section-label">Error</p>
      <h1>Page not found</h1>
      <p>That URL does not match a post or page.</p>
      <p class="not-found-links"><a href="${escapeAttr(homeHref)}">Back home</a> · <a href="${escapeAttr(tagsHref)}">Tags</a></p>
    </section>`;

  return layout(
    {
      title: "Not found",
      description: `Page not found on ${SITE_TITLE}.`,
      canonicalPath: "/404.html",
      noindex: true,
    },
    body,
  );
}
