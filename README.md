# blog

Static Markdown blog for [blog.doxiebytes.com](https://blog.doxiebytes.com). TypeScript build → plain HTML/CSS on GitHub Pages (`BASE_PATH=/`).

## Build

```bash
npm install
npm run typecheck
npm run build
```

Output is `dist/`. Preview with `npx serve dist`, or watch with `npm run dev` (http://127.0.0.1:4173/, `PORT=…` to override).

Drafts (`draft: true`) are skipped in CI/production. Locally:

```bash
INCLUDE_DRAFTS=1 npm run build   # or: npm run build -- --drafts
INCLUDE_DRAFTS=1 npm run dev
```

Markdown: raw HTML is escaped; `javascript:` / `data:` / `vbscript:` / `file:` URLs are dropped. Duplicate slugs and empty tag slugs fail the build.

## Add a post

Create `content/posts/YYYY-MM-DD-slug.md`:

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

Write Markdown (no raw HTML). Build or push to `main` to deploy.

Agents/automations: Cursor skills live under [`.cursor/skills/`](.cursor/skills/) (`blog-writing`, `new-blog-post`, `dev-news-curator`).

## Deploy

PRs: `npm ci` → typecheck → build. Push to `main`: also deploy Pages.

**Pages (once):** Source = GitHub Actions; custom domain `blog.doxiebytes.com`; enable **Enforce HTTPS** after DNS checks (manual Pages setting).

**Cloudflare DNS** (`doxiebytes.com` zone) — DNS only (grey cloud), not proxied:

| Field | Value |
|---|---|
| Type | CNAME |
| Name | blog |
| Target | saffron-toucanet.github.io |

Build writes `dist/CNAME` each deploy. Smoke: Action green on `main`, then https://blog.doxiebytes.com/.
