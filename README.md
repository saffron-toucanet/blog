# blog

Static Markdown blog for [blog.doxiebytes.com](https://blog.doxiebytes.com).

Plain TypeScript build → static HTML/CSS. No runtime frameworks. Deployed to GitHub Pages via Actions (`BASE_PATH=/`).

## Develop

```bash
npm install
npm run build
```

Output lands in `dist/` (includes a `CNAME` for `blog.doxiebytes.com`). Preview with any static server, e.g. `npx serve dist`.

## Add a post

1. Create `content/posts/YYYY-MM-DD-slug.md` with frontmatter (`title`, `date`, `description`, `tags`, optional `draft` / `slug`).
2. Run `npm run build` (or push to `main` and let CI build + deploy).
3. Open `dist/posts/<slug>/`.

## Layout

- `content/posts/` — Markdown posts with YAML frontmatter
- `src/build/` — build-time TypeScript (CLI, markdown, templates)
- `src/site/` — site CSS (and later optional client scripts)
- `public/` — static assets copied into `dist/`
- Built routes: `/`, `/posts/<slug>/`, `/tags/`, `/tags/<tag>/`

## Deploy (GitHub Pages + Cloudflare)

CI: on PRs, `npm ci` + `npm run build`; on push to `main`, also upload `dist/` and deploy Pages.

### One-time GitHub repo settings

1. **Settings → Pages → Build and deployment → Source:** GitHub Actions.
2. After the first successful deploy (or once DNS is ready): **Settings → Pages → Custom domain** → `blog.doxiebytes.com` → Save.
3. Wait for DNS check to pass, then enable **Enforce HTTPS**.

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

1. Merge the Pages workflow to `main` and confirm the **Deploy GitHub Pages** Action succeeds.
2. Confirm `https://saffron-toucanet.github.io/blog/` or the Pages environment URL serves the site (until the custom domain is live).
3. After DNS + custom domain + Enforce HTTPS: open `https://blog.doxiebytes.com/`.
