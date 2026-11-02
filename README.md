# blog

Static Markdown blog for [blog.doxiebytes.com](https://blog.doxiebytes.com).

Plain TypeScript build → static HTML/CSS. No runtime frameworks.

## Develop

```bash
npm install
npm run build
```

Output lands in `dist/`. Preview with any static server, e.g. `npx serve dist`.

## Layout

- `content/posts/` — Markdown posts with YAML frontmatter
- `src/build/` — build-time TypeScript (CLI, markdown, templates)
- `src/site/` — site CSS (and later optional client scripts)
- `public/` — static assets copied into `dist/`
