---
name: new-blog-post
description: >-
  Add a new post to saffron-toucanet/blog (Markdown → static HTML → GitHub Pages).
  Use when publishing or drafting a post end-to-end: brief, write file under
  content/posts/, local build check, commit, open a PR (or push to main only if
  explicitly requested). Pair with the blog-writing skill for prose and frontmatter.
---

# Add a new blog post (doxiebytes)

End-to-end workflow for **saffron-toucanet/blog**: draft Markdown → local build → GitHub PR → Pages deploy from `main`.

Site: [blog.doxiebytes.com](https://blog.doxiebytes.com). Tagline: **“Dev news, plain.”**

**Prose, voice, anti-slop, and frontmatter detail:** follow [`../blog-writing/SKILL.md`](../blog-writing/SKILL.md). This skill covers **shipping the file**, not writing craft.

## When to use

- User asks to add / publish / ship a new blog post.
- You have a brief (or notes) and need the file on GitHub so Pages can deploy it.
- Drafting into the repo with `draft: true` for later publish.

Do **not** invent a post from a bare topic — collect a brief first (see writing skill).

## Prerequisites

| Need | Notes |
|---|---|
| Repo checkout | `saffron-toucanet/blog` on an up-to-date `main` |
| Node | `npm ci` then `npm run build` / `npm run dev` |
| Auth | Secret `GH_TOKEN` (classic or fine-grained PAT with `repo` + ability to open PRs) set on the agent — **never** paste into chat, files, commits, or logs |

### `GH_TOKEN` safety

- Read the token **only** from the environment (`GH_TOKEN` or `GITHUB_TOKEN`).
- Prefer `gh` with the env var set; do not put the token on the CLI argv when avoidable (`gh` reads `GH_TOKEN` / `GITHUB_TOKEN`).
- **Never** `echo`, print, log, or commit the token. Never write it into repo files, skill notes, or PR bodies.
- If missing: stop and ask the user to set the agent secret — do not proceed with push/PR.

```bash
# Prefer: gh uses GH_TOKEN / GITHUB_TOKEN from the environment
export GH_TOKEN="${GH_TOKEN:-$GITHUB_TOKEN}"
gh auth status   # confirms auth without printing the secret
```

## End-to-end workflow

### 1. Brief

Collect (or ask for) at least:

- One-sentence claim / question
- Post type: technical | personal | meta
- Real notes / evidence (or explicit gaps)
- Publish intent: **draft** (`draft: true`) or **live** (`draft: false`)
- Suggested slug (kebab-case) and 1–4 tags (reuse existing tags when they fit: `meta`, `notes`, …)

Refuse blank-topic drafting — see writing skill.

### 2. Draft with the writing skill

Follow **blog-writing** for voice, openings, specificity, anti-slop passes, and frontmatter.

Target path:

```text
content/posts/YYYY-MM-DD-slug.md
```

Frontmatter contract:

```yaml
---
title: Specific outcome or question
date: "YYYY-MM-DD"
description: One honest line for listings/SEO — what the post delivers.
draft: true   # false only when ready to publish
tags: [tag-one, tag-two]
# slug: optional-override   # default = filename without date prefix
---
```

Rules:

- Quote the date (`"2026-11-02"`).
- `description` states the outcome (SEO matters — prefs).
- `draft: true` excludes the post from index, tags, feed, sitemap, and the live site.
- `draft: false` only after the writing skill’s publish checklist.

### 3. Write the file

1. `git fetch origin main && git checkout main && git pull origin main`
2. Create a feature branch (prefer PR path — see below).
3. Write `content/posts/YYYY-MM-DD-slug.md` only (plus nothing unrelated).
4. Confirm filename date matches frontmatter `date`.

### 4. Local build check (if possible)

```bash
npm ci          # if node_modules missing
npm run build
```

Expect success and the post under `dist/posts/<slug>/` **only when** `draft: false`. Drafts must **not** appear in `dist/` index / feed / sitemap.

Optional preview: `npm run dev` → http://127.0.0.1:4173/

If build cannot run (no Node, etc.): say so, still open the PR, and rely on CI (`npm ci` + `npm run build` on PRs).

### 5. Commit

```bash
git status
git add content/posts/YYYY-MM-DD-slug.md
git commit -m "Add post: <short title>"
```

Commit message: short, factual. Do not stage secrets, `dist/`, or unrelated dirty files.

### 6. Push + open PR (preferred)

**Default: PR into `main`.** Pages deploys **only from `main`** (push / workflow_dispatch). Prefer review via PR unless the user explicitly asks to push straight to `main`.

```bash
BRANCH="post/YYYY-MM-DD-slug"
git checkout -b "$BRANCH"
# … write file, commit …
git push -u origin "$BRANCH"

gh pr create \
  --base main \
  --head "$BRANCH" \
  --title "Add post: <title>" \
  --body "$(cat <<'EOF'
## Summary
- New post: `content/posts/YYYY-MM-DD-slug.md`
- `draft: true|false`

## Check
- [ ] Local / CI build
- [ ] Frontmatter + tags
- [ ] Intentional draft flag
EOF
)"
```

After merge to `main`, Actions builds and deploys Pages. Live URL pattern: `https://blog.doxiebytes.com/posts/<slug>/`.

### Push to `main` (only if requested)

If the user explicitly wants direct publish:

```bash
git checkout main
git pull origin main
# … commit on main …
git push origin main
```

Still never force-push `main`. Still never print `GH_TOKEN`.

## Draft vs publish

| Flag | Effect |
|---|---|
| `draft: true` | File can live in the repo; **excluded** from site, feed, sitemap, tag pages |
| `draft: false` | Included in build; appears on site after `main` deploy |

Common flow: land the PR with `draft: true`, then a follow-up commit/PR flips to `false` when ready — or ship `false` in one PR if the publish checklist already passed.

## Failure modes

| Problem | What to do |
|---|---|
| Missing / invalid `GH_TOKEN` | Stop. Ask user to set the agent secret. Do not embed a token in the repo or chat. |
| Dirty working tree | Inspect `git status`. Commit only the new post (or stash unrelated work). Do not sweep unrelated changes into the post commit. |
| `npm run build` fails | Fix frontmatter/Markdown (or report the error). Do not push a known-broken post unless CI must be the first signal and you disclosed that. |
| `draft: true` left by mistake | Before claiming “published,” confirm frontmatter and that the slug appears under `dist/posts/` (or on the live site after deploy). Flip to `false` and re-run build / open a fix PR if needed. |
| Filename / date mismatch | Align `YYYY-MM-DD` in the filename with quoted `date` in frontmatter. |
| Duplicate slug | Check existing `content/posts/*-slug.md`; pick a unique slug or set explicit `slug:`. |
| Push rejected | Re-auth via env `GH_TOKEN`; confirm scope includes contents + pull requests. Never log the token while debugging. |

## Checklists

### Ship checklist

- [ ] Brief complete (claim, type, real notes, draft vs live)
- [ ] Wrote with **blog-writing** skill (voice + anti-slop + publish checks)
- [ ] File at `content/posts/YYYY-MM-DD-slug.md`
- [ ] Frontmatter: `title`, quoted `date`, honest `description`, `tags`, correct `draft`
- [ ] `npm run build` OK (or CI-only path disclosed)
- [ ] Single-purpose commit; no secrets / no `dist/`
- [ ] Branch pushed; **PR to `main`** opened (unless user ordered direct push)
- [ ] If publishing: `draft: false` intentional; post will appear after merge + Pages deploy

### Auth checklist

- [ ] `GH_TOKEN` present in env (not in files)
- [ ] `gh auth status` OK
- [ ] Token never printed, logged, or committed
- [ ] Prefer `gh pr create` over raw token URLs in remotes you invent

## Output shape

When done, report:

1. Path of the new Markdown file
2. `draft: true|false`
3. Branch + PR URL (or commit on `main` if direct-push was requested)
4. Build result (local and/or CI)
5. Any `[need: …]` left from the writing skill
