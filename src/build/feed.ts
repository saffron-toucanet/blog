import { SITE_DESCRIPTION, SITE_TITLE, SITE_URL } from "./config.ts";
import type { Post } from "./markdown.ts";
import { absoluteUrl, postPath, tagPath } from "./paths.ts";
import { escapeXml } from "./xml.ts";

function sortByDateDesc(posts: Post[]): Post[] {
  return [...posts].sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""));
}

function rfc822Date(date: string | undefined): string {
  const d = date ? new Date(`${date}T00:00:00Z`) : new Date();
  return d.toUTCString();
}

/** RSS 2.0 feed at /feed.xml */
export function renderRssFeed(posts: Post[]): string {
  const sorted = sortByDateDesc(posts);
  const channelLink = absoluteUrl("/");
  const items = sorted
    .map((post) => {
      const link = absoluteUrl(postPath(post.slug));
      const description = post.description || SITE_DESCRIPTION;
      return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${escapeXml(link)}</link>
      <guid isPermaLink="true">${escapeXml(link)}</guid>
      <pubDate>${rfc822Date(post.date)}</pubDate>
      <description>${escapeXml(description)}</description>
    </item>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${escapeXml(SITE_TITLE)}</title>
    <link>${escapeXml(channelLink)}</link>
    <description>${escapeXml(SITE_DESCRIPTION)}</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${items}
  </channel>
</rss>
`;
}

/** Sitemap including home, posts, and tag pages. */
export function renderSitemap(
  posts: Post[],
  tags: Map<string, { label: string; posts: Post[] }>,
): string {
  const urls: string[] = [
    absoluteUrl("/"),
    absoluteUrl("/tags/"),
    ...sortByDateDesc(posts).map((p) => absoluteUrl(postPath(p.slug))),
    ...[...tags.keys()]
      .sort()
      .map((slug) => absoluteUrl(tagPath(slug))),
  ];

  const body = urls
    .map(
      (loc) => `  <url>
    <loc>${escapeXml(loc)}</loc>
  </url>`,
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</urlset>
`;
}

export function renderRobotsTxt(): string {
  const sitemapUrl = `${SITE_URL.replace(/\/$/, "")}/sitemap.xml`;
  return `User-agent: *
Allow: /

Sitemap: ${sitemapUrl}
`;
}
