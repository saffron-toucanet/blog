import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { SITE_URL } from "./config.ts";
import {
  renderRobotsTxt,
  renderRssFeed,
  renderSitemap,
} from "./feed.ts";
import { loadPost, tagSlug, type Post } from "./markdown.ts";
import {
  DIST_DIR,
  POSTS_DIR,
  PUBLIC_DIR,
  STYLES_DIR,
  postPath,
  tagPath,
} from "./paths.ts";
import {
  renderIndexPage,
  renderNotFoundPage,
  renderPostPage,
  renderTagPage,
  renderTagsIndexPage,
} from "./render.ts";

function ensureDir(dir: string): void {
  fs.mkdirSync(dir, { recursive: true });
}

function copyDirIfExists(src: string, dest: string): void {
  if (!fs.existsSync(src)) return;
  ensureDir(dest);
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    // Keep dist clean of placeholder keep-files.
    if (entry.name === ".gitkeep") continue;
    const from = path.join(src, entry.name);
    const to = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirIfExists(from, to);
    } else {
      fs.copyFileSync(from, to);
    }
  }
}

function writePage(dir: string, html: string): void {
  ensureDir(dir);
  fs.writeFileSync(path.join(dir, "index.html"), html, "utf8");
}

function loadAllPosts(): Post[] {
  if (!fs.existsSync(POSTS_DIR)) return [];
  return fs
    .readdirSync(POSTS_DIR)
    .filter((f) => f.endsWith(".md"))
    .map((filename) => loadPost(path.join(POSTS_DIR, filename), filename));
}

function buildTagMap(posts: Post[]): Map<string, { label: string; posts: Post[] }> {
  const map = new Map<string, { label: string; posts: Post[] }>();
  for (const post of posts) {
    for (const tag of post.tags) {
      const key = tagSlug(tag);
      if (!key) continue;
      const existing = map.get(key);
      if (existing) {
        existing.posts.push(post);
      } else {
        map.set(key, { label: tag, posts: [post] });
      }
    }
  }
  return map;
}

/** Build the static site into `dist/`. Draft posts are excluded. */
export function build(): void {
  fs.rmSync(DIST_DIR, { recursive: true, force: true });
  ensureDir(DIST_DIR);

  copyDirIfExists(PUBLIC_DIR, DIST_DIR);
  copyDirIfExists(STYLES_DIR, path.join(DIST_DIR, "assets"));

  // GitHub Pages custom domain (blog.doxiebytes.com) — overwritten after public/ copy.
  const customDomain = new URL(SITE_URL).hostname;
  fs.writeFileSync(path.join(DIST_DIR, "CNAME"), `${customDomain}\n`, "utf8");
  console.log(`Wrote CNAME → dist/CNAME (${customDomain})`);

  const allPosts = loadAllPosts();
  const drafts = allPosts.filter((p) => p.draft);
  const posts = allPosts.filter((p) => !p.draft);

  if (drafts.length > 0) {
    console.log(
      `Skipped ${drafts.length} draft post(s): ${drafts.map((p) => p.slug).join(", ")}`,
    );
  }

  if (posts.length === 0) {
    throw new Error(`No published Markdown posts found in ${POSTS_DIR}`);
  }

  writePage(DIST_DIR, renderIndexPage(posts));
  console.log("Built home → dist/index.html");

  for (const post of posts) {
    const outDir = path.join(DIST_DIR, "posts", post.slug);
    writePage(outDir, renderPostPage(post));
    console.log(`Built post → dist${postPath(post.slug)}index.html`);
  }

  const tags = buildTagMap(posts);
  writePage(
    path.join(DIST_DIR, "tags"),
    renderTagsIndexPage(
      [...tags.entries()].map(([, { label, posts: tagged }]) => ({
        tag: label,
        count: tagged.length,
      })),
    ),
  );
  console.log("Built tags index → dist/tags/index.html");

  for (const [slug, { label, posts: tagged }] of tags) {
    writePage(path.join(DIST_DIR, "tags", slug), renderTagPage(label, tagged));
    console.log(`Built tag → dist${tagPath(slug)}index.html`);
  }

  fs.writeFileSync(path.join(DIST_DIR, "404.html"), renderNotFoundPage(), "utf8");
  console.log("Built 404 → dist/404.html");

  fs.writeFileSync(path.join(DIST_DIR, "feed.xml"), renderRssFeed(posts), "utf8");
  console.log("Built feed → dist/feed.xml");

  fs.writeFileSync(
    path.join(DIST_DIR, "sitemap.xml"),
    renderSitemap(posts, tags),
    "utf8",
  );
  console.log("Built sitemap → dist/sitemap.xml");

  fs.writeFileSync(path.join(DIST_DIR, "robots.txt"), renderRobotsTxt(), "utf8");
  console.log("Built robots → dist/robots.txt");
}

const isMain =
  process.argv[1] !== undefined &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isMain) {
  build();
}
