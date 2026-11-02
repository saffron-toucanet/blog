# blog

Static Markdown blog for [blog.doxiebytes.com](https://blog.doxiebytes.com).

Plain TypeScript build → static HTML/CSS. No runtime frameworks.

## Develop

```bash
npm install
npm run build
```

Output lands in `dist/`. Preview with any static server, e.g. `npx serve dist`.

## Add a post

1. Create `content/posts/YYYY-MM-DD-slug.md` with frontmatter (`title`, `date`, `description`, `tags`, optional `draft` / `slug`).
2. Run `npm run build`.
3. Open `dist/posts/<slug>/`.

## Layout

- `content/posts/` — Markdown posts with YAML frontmatter
- `src/build/` — build-time TypeScript (CLI, markdown, templates)
- `src/site/` — site CSS (and later optional client scripts)
- `public/` — static assets copied into `dist/`
- Built routes: `/`, `/posts/<slug>/`, `/tags/`, `/tags/<tag>/`
