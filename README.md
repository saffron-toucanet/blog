# blog

Static Markdown blog for [blog.doxiebytes.com](https://blog.doxiebytes.com).

Plain TypeScript build → static HTML/CSS. No runtime frameworks. Deployed to GitHub Pages via Actions (`SITE_URL=https://blog.doxiebytes.com`, `BASE_PATH=/`).

## Build

```bash
npm install
npm run typecheck
npm run build
```

Output lands in `dist/` (HTML pages, `feed.xml`, `sitemap.xml`, `robots.txt`, `404.html`, and a `CNAME` for `blog.doxiebytes.com`).

Preview once:

```bash
npx serve dist
```

CI runs `typecheck` then `build` on every PR; production builds never include drafts.

### Drafts (local preview)

Production and CI skip `draft: true` posts. For local preview of drafts:

```bash
INCLUDE_DRAFTS=1 npm run build
# or
npm run build -- --drafts
INCLUDE_DRAFTS=1 npm run dev
```

### Markdown safety

The generator **strips raw HTML** in Markdown and **rejects** `javascript:` / `data:` / `vbscript:` / `file:` URLs in links and images. Site-absolute paths (`/images/…`) are rewritten with `BASE_PATH`. Treat post content as trusted after this sanitize step (single-author workflow).

The build **fails** on duplicate slugs and on tags that slugify to an empty string.

## Dev (watch)

Rebuild on content/template/style changes and serve `dist/`:

```bash
npm run dev
```

Open http://127.0.0.1:4173/ (override with `PORT=…`).

## Add a post

1. Create `content/posts/YYYY-MM-DD-slug.md` with frontmatter:

   ```yaml
   ---
   title: Post title
   date: "2026-11-02"
   description: One-line summary for listings and SEO.
   draft: false
   tags: [meta]
   # slug: optional-override
   ---
   ```

2. Write the Markdown body (no raw HTML; use normal Markdown links/images).
3. Run `npm run build` (or `npm run dev`), or push to `main` and let CI deploy.
4. Open `dist/posts/<slug>/` (or the live URL after deploy).

Set `draft: true` to keep a post out of the index, tags, feed, sitemap, and Pages deploy. See `content/posts/2026-11-02-draft-example.md`.

## Layout

- `content/posts/` — Markdown posts with YAML frontmatter
- `src/build/` — build-time TypeScript (CLI, markdown, templates, feed/sitemap, dev server)
- `src/site/styles/` — site CSS tokens, type, light/dark
- `src/site/scripts/` — tiny client scripts (theme toggle)
- `public/` — static assets copied into `dist/` (fonts, images)
- Built routes: `/`, `/posts/<slug>/`, `/tags/`, `/tags/<tag>/`, `/feed.xml`, `/sitemap.xml`, `/404.html`

## Look & feel (colophon)

- **Brand / tagline:** doxiebytes — “Dev news, plain.”
- **Type:** self-hosted Source Serif 4 (body) + Source Sans 3 (UI), with system fallbacks; `font-display: swap`.
- **Color:** cool graphite paper + ink-blue links; CSS tokens for light and dark.
- **Theme:** follows `prefers-color-scheme` until you use the header **Light/Dark** toggle (`localStorage` + `data-theme`, no FOUC).
- **CSS stress post:** [/posts/prose-fixtures/](https://blog.doxiebytes.com/posts/prose-fixtures/) covers `h2`/`h3`, lists, image, blockquote, and `hr`.

## Deploy (GitHub Pages + Cloudflare)

CI: on PRs, `npm ci` + `npm run typecheck` + `npm run build`; on push to `main`, also upload `dist/` and deploy Pages. Workflow permissions default to `contents: read`; `pages`/`id-token` are granted only on the deploy job. Concurrency is scoped to deploy so PR builds do not serialize with production deploys.

### One-time GitHub repo settings

1. **Settings → Pages → Build and deployment → Source:** GitHub Actions.
2. After the first successful deploy (or once DNS is ready): **Settings → Pages → Custom domain** → `blog.doxiebytes.com` → Save.
3. Wait for DNS check to pass, then enable **Enforce HTTPS** (manual Pages setting — not controllable from this repo). Verify `http://blog.doxiebytes.com/` redirects to `https://`.

The build writes `dist/CNAME` with `blog.doxiebytes.com` so Pages keeps the custom domain on each deploy.

### Cloudflare DNS (`doxiebytes.com` zone)

| Field | Value |
|---|---|
| Type | **CNAME** |
| Name | **blog** (hostname `blog.doxiebytes.com`) |
| Target / content | **saffron-toucanet.github.io** |
| Proxy status | **DNS only** (grey cloud) |
| TTL | Auto |

**Why DNS only:** GitHub needs a clear CNAME to verify the domain and issue the Pages TLS certificate. Cloudflare orange-cloud proxy often breaks that check / HTTPS until you specially configure SSL (not recommended for this setup).

No A/AAAA records are required for the `blog` subdomain.

### Smoke check

1. Confirm the **Deploy GitHub Pages** Action on `main` succeeds.
2. Open `https://blog.doxiebytes.com/` (or the Pages environment URL before DNS is live).
