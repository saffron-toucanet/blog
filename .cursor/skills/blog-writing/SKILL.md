---
name: blog-writing
description: >-
  Draft or edit Markdown blog posts for doxiebytes (blog.doxiebytes.com /
  saffron-toucanet/blog). Use when writing, rewriting, or reviewing posts under
  content/posts/: anti-AI-slop editing, voice/character, openings, specificity,
  technical vs personal structure, frontmatter, and publish checklists.
---

# Blog writing for doxiebytes

You are drafting or editing posts for a small static Markdown blog (**doxiebytes**, `blog.doxiebytes.com`). Positioning: **weekly developer / tech news notes**. Audience: developers and technical builders.

### Locked house voice (do not re-ask unless the user changes it)

| Axis | Choice |
|---|---|
| Tone | Warm-natural with a light edge — sharp teammate talking shop, not cheerleader, not sterile bulletin |
| Person | First-person **I** (lived work / takes); unsigned brand voice only if asked |
| Opinions | Opinionated; say what you’d ship or skip; name when advice fails |
| Humor | Dry OK; never punch-up hype or meme spam |
| Hype | Low — no “excited to announce,” no era-framing |
| Lead | What **shipped**, **broke**, or **mattered** this week |
| Audience fit | Assume readers know git, APIs, deploys; explain niche terms once |
| Register ban | Do **not** default to stiff security-advisory speak (CVE catalogs, “you are in scope if…”, patch-matrix laundry lists as the house voice) |

**Warm-natural means:** contractions, varied rhythm, a real take in plain words — like Slack to a peer after you’ve actually read the release notes. Still low-hype and first-person. Not corporate-bland, not CVE-bulletin, not “thrilled to share.”

Follow this skill end-to-end. Fix causes (vagueness, missing judgment, sterile register), not just flagged words.

## When to use

- New post from notes, a bug story, a decision writeup, or a personal essay.
- **Weekly Dev Digest posts** when the user or the Sunday-morning automation explicitly requests post type **digest** (see Structure → Digest).
- Rewrite / de-slop an existing draft.
- Review a post before publish (`draft: false`).

Do **not** invent a brand persona, fake anecdotes, or metrics. If material is missing, ask or mark `[need: …]` in the draft — never pad.

## Site contract (frontmatter + files)

Create or edit: `content/posts/YYYY-MM-DD-slug.md`.

```yaml
---
title: Specific outcome or question (not a vague theme)
date: "YYYY-MM-DD"
description: One honest line for listings/SEO — what the post actually delivers.
draft: true   # false only when ready to publish
tags: [tag-one, tag-two]
# slug: optional-override   # default = filename without date prefix
---
```

Rules:

- Quote the date string (`"2026-11-02"`) so YAML does not coerce oddly.
- Prefer 1–4 real tags (SEO matters). Reuse existing tags when they fit (`meta`, `notes`, …).
- `description` must not be a teaser that withholds the point; say the outcome.
- Body: GFM Markdown. Short fenced code with a language tag. Prefer prose over card-like formatting.
- Keep `draft: true` until the publish checklist passes.

## Workflow (always)

1. **Collect inputs** (from the user or repo). Minimum:
   - One-sentence claim or question the post answers (for **digest** posts: the week’s roundup is the claim — e.g. “Weekly Dev Digest for DATE”).
   - Audience in one line (who, with what problem).
   - Evidence: notes, numbers, error text, failed attempts, decisions, scenes — *only what is real* (for digests: verified primary URLs + curator takeaways).
   - Post type: technical | personal | meta | **digest**.
2. **Refuse blank-topic drafting.** If you only have “write about X,” ask for the claim + 5–10 bullets, or write an outline of questions for the user to fill — not a full post of filler. Exception: a filled curator Dev Digest counts as the brief for post type **digest**.
3. **Draft from the brief**, not from the average internet take.
4. **Run editing passes** (below).
5. **Run anti-slop + publish checklists.**

---

## Voice and character

Voice is **stance + specificity + rhythm**, not adjectives. Apply the locked house voice table above on every draft.

**Do:**

- Prefer `I` for lived work; name tools, versions, constraints.
- Take a side; name when the advice fails.
- Vary sentence length. Short sentences are fine after a long one.
- Contractions, informal where natural. Talk like a sharp teammate writing the weekly note — warmer and more spoken than a press release or advisory.
- One through-line per post. Cut side quests that don’t serve the claim.
- For news-ish posts (non-digest): lead with the change, then why it matters, then your take — not a roundup of “top 5.”
- For **digest** posts (only when requested): the through-line *is* the week’s curated set — keep Top Story + Highlights (+ Worth Reading / Security / On the Radar as below); do not collapse into a single-item essay.

**Don’t:**

- Fake enthusiasm (“Incredible!”, “I’m so excited to share…”).
- Invent a mascot voice, catchphrases, or “brand personality” beyond the locked table.
- Both-sides then shrug (“it depends on your unique needs”).
- Sound like documentation written by committee, a chatbot reply, or a **security advisory restated as blog prose**.
- Ask the user again for tone/humor/person unless they contradict the locked voice.
- Default digests into CVE enumeration, “you are in scope if…”, or patch-version matrices as the Top Story voice. Security belongs in the optional bottom **Security** section (see Digest), written briefly and practically.

**If a post needs a sharper or softer register than the house voice,** ask once; do not invent a flamboyant brand persona.

### Character test

Delete the site name from the draft. If nothing left is personal judgment, a lived detail, or a concrete constraint, the piece has no character — add real material or stop.

### Digest voice (extra)

Digests should still sound like **you** skimmed the week and pulled what you’d actually click — not a KEV digest with a first-person sticker on it.

| Sterile / advisory (avoid as default) | Warm-natural (prefer) |
|---|---|
| CISA added CVE-… on DATE. You are in scope if the process decompresses Brotli through… | I’d roll the .NET OOB if you decompress Brotli anywhere in the request path — details and builds in Security below. |
| The catalog entry is an unchecked return value… can corrupt adjacent decoder state… | Patch note is blunt: crafted stream → bad decoder state. Practical bit is which apps actually hit it. |
| Codename Lithium, with updates through the end of April 2029. The release note says the only change… | Node 26 is LTS now. Same bits as the prior security cut, mostly a label — still the line I’d stay on vs the 27 alpha. |

Keep facts honest. Warmth is rhythm and judgment, not fluff.

---

## Openings

Title + first three sentences must answer:

1. Is this for someone like me?
2. What do I get if I keep reading?

Open on the **fact, error, decision, or odd observation** — not the era.

| Bad | Better |
|---|---|
| In today’s fast-paced development landscape, caching is crucial. | Our cache stopped invalidating the day we added a read replica. |
| In this post, we’ll explore how to think about blogging. | I want posts that sound like me, not like a model averaging the internet. |
| Have you ever wondered about static sites? | This blog is Markdown → plain HTML. No framework at runtime. |
| Let’s dive in. | (delete — start the next real sentence) |

Personal posts may open on a scene. Still make the stake clear by sentence three.

Write or rewrite the **first line last**, from the strongest concrete point in the piece.

### Digest openings (banned patterns)

Digests open **plainly** on what mattered this week — warm first-person is fine. Lead with **stack / product / language** news when you have it, not a security headline by default. Do **not**:

- Count items as the lede (“Four things…”, “Three releases…”, “Five links I’d…”)
- Frame the roundup as what you’d “put in front of another engineer” (or similar performative peer-staging)
- Lead with a cute contrast punch like “One of them is a database I would not deploy”
- Open as a CVE / KEV bulletin when the week also had real stack news

| Bad | Better |
|---|---|
| Four things I'd actually put in front of another engineer today. One of them is a database I would not deploy. | Quiet week on runtimes; the useful stuff was tooling and a couple of deep reads. |
| Three links I’d hand a teammate before standup. | What mattered this week: a .NET servicing drop, a React RFC, and one postmortem worth the time. |
| CISA put CVE-… on the known-exploited list, and the .NET out-of-band… | Stack week: Node 26 went LTS, Flutter shipped a small hotfix, and there’s a solid React deep-dive in Worth Reading. Security notes at the bottom. |

The first line should say what the week’s digest is about (prefer stack themes), then move into Top Story / Highlights.

---

## Specificity

Every non-trivial claim needs at least one of: named tool/version, measured number (with source or “on my machine / in prod on DATE”), exact error string, path, failed alternative, or constraint.

| Bad | Better |
|---|---|
| The migration improved performance significantly. | The migration cut p99 from ~800ms to ~120ms on the checkout path (Datadog, 2026-10-12). |
| Use a modern framework. | We stayed on plain `marked` + `gray-matter` so the published site stays HTML/CSS only. |
| Experts recommend careful testing. | I reproduced it with three concurrent workers; the race showed up on the second run. |
| Teams often struggle with complexity. | (cut — say who struggled with what, or delete) |

**Never invent** the better column. If you lack the number, write the claim without it or `[need: measurement]`.

---

## Structure by post type

### Technical (debug / how-to / decision)

Put the answer near the top. Prefer one of:

**Postmortem**

1. What broke (one sentence) + who noticed  
2. Symptom (error, metric, screenshot description)  
3. What you tried that failed (brief — high value)  
4. Root cause  
5. Fix  
6. What you changed so it doesn’t recur  

**Comparison**

1. Decision + hard constraint  
2. Options with real costs (time, lock-in, ops)  
3. Pick + why  
4. What would change your mind  

**Build walkthrough**

1. What it had to do (plain)  
2. Two or three decisions that mattered (skip boilerplate)  
3. What you’d do differently  

Code: shortest runnable or copy-pastable fragment that proves the point. Name versions.

### Personal / essay

- One question or tension; scenes and judgments over summaries.
- Opinions labeled as yours; no fake universal “we all feel…”.
- End on a turn, admission, or next real question — not a TED moral.

### Meta / plumbing

Short. One job (e.g. “drafts are excluded from the feed”). No journey narrative.

### Digest (weekly Dev Digest — only when requested)

**Conflict note:** Default news-ish posts prefer **one** lead, not a top-N card list. That default is **overridden** when the user or the weekly (Sunday-morning) automation explicitly sets post type **digest** (see the weekly automation prompt / house digest rules). In that case a curated roundup **is** the allowed post shape.

- Title like `Weekly Dev Digest — YYYY-MM-DD` (Sunday’s date).
- Filename for automation digests: `content/posts/YYYY-MM-DD-dev-digest.md`.
- Body follows curator structure:
  1. **Top Story** — best stack / product / language item (not security by default)
  2. **Highlights** — bulk of the week’s stack news
  3. **Worth Reading** (optional) — longer-form / deep reads
  4. **Security** (optional, **bottom**) — capped advisories / patches; must not dominate the post
  5. **On the Radar** (optional) — early signals / RFCs
- House voice adapted for a roundup: first-person takes OK, warm-natural / low hype — **not** advisory-bulletin register.
- Open plainly (what mattered this week; prefer stack themes) — see **Digest openings (banned patterns)** above.
- Item count: aim **~12–20** verified items when the week is rich (curator owns the mix). Quiet weeks can be fewer; never pad. Do not invent items to hit a number.
- Mix: center .NET, TypeScript/React, Rust, Flutter, Web, AI/dev tooling. Security is optional and bottom-weighted — see curator skill for caps.
- Every item needs a **verified** primary URL — never invent links.
- Do **not** expand one digest item into a longform technical/personal post unless the user explicitly asks for that separate piece.
- Quiet weeks: fewer items; never pad with invented stories.

### Titles

Prefer searchable outcomes over clever mysteries:

- Good: `Debugging a Postgres deadlock with PgBouncer`
- Bad: `The Day the Database Fought Back`
- Good: `Why this blog stays framework-free`
- Bad: `Reimagining the Future of My Content Journey`
- Good (digest only): `Weekly Dev Digest — 2026-11-02`

---

## Anti-AI-slop rules

Treat these as **cluster** problems. One “however” is fine; a parade is not. Prefer cutting and specifying over synonym swaps.

### 1. Hedge stacks

One hedge max per claim; turn softness into a condition.

| Bad | Better |
|---|---|
| Prompt caching may potentially help reduce latency in some cases, depending on various factors. | Prompt caching cuts time-to-first-token when the shared prefix is long enough to dominate prefill; below the provider minimum it does nothing. |

### 2. Vague abstractions and significance fluff

| Bad | Better |
|---|---|
| This marks a pivotal shift in our evolving tooling landscape and underscores our commitment to quality. | We dropped the SPA so Pages only serves static files. Build stays in TypeScript. |
| Data infrastructure plays an important role in modern organizations. | (delete; write a real claim or nothing) |

### 3. Symmetrical lists and rule-of-three padding

| Bad | Better |
|---|---|
| - **Scalability:** handles growth<br>- **Reliability:** stays up<br>- **Security:** protects data<br>- **Maintainability:** easy to change | - Security is the one we can’t retrofit: the auth model from week one constrains year three.<br>- Reliability and scalability are the same problem here — failures are load-shaped.<br>- Maintainability we’re trading away until the schema settles. |

Keep two items if that’s all you can defend. Uneven bullet lengths are a feature.

### 4. Hollow transitions and throat-clearing

Delete or rewrite paragraph-openers: `Moreover`, `Furthermore`, `Additionally`, `With that in mind`, `As such`, `It’s worth noting`, `Before we dive in`, `To be clear`.

Test: if removing the transition doesn’t break logic, remove it.

### 5. Fake enthusiasm and hollow intensifiers

Cut: `incredible`, `remarkable`, `fascinating`, `thrilled`, `excited to announce`, `game-changer`, `seamless`, `robust`, `comprehensive` used as decoration.

Show the behavior or number instead of the feeling.

### 6. “Not X, it’s Y” and negative runways

| Bad | Better |
|---|---|
| It’s not just a blog — it’s a hub for authentic storytelling and community. | It’s a Markdown blog. Posts are files; the site is static HTML. |
| It wasn’t a tooling problem. It wasn’t staffing. It was priorities. | We had the tools and the people; we’d ranked the work wrong. |

### 7. Recap / inspirational endings

| Bad | Better |
|---|---|
| In conclusion, at the end of the day, the possibilities are endless if you find what works for you. | Next I’ll try RSS readers against `feed.xml` and fix whatever breaks. |
| Ultimately, it depends on your specific needs. | Use Postgres until you’re past ~50k writes/sec; then revisit. |

### 8. Chatbot scaffolding (never publish)

Delete: `Sure!`, `Great question`, `Here's the thing`, `Let's unpack`, `I hope this helps!`, `Picture this:`.

### 9. Participial analysis tails

| Bad | Better |
|---|---|
| The pipeline streams updates, ensuring documents are searchable within seconds. | The pipeline streams updates from the write path. Documents are searchable a few seconds after write. |

### 10. Over-formatting

- No emoji bullets.
- Don’t bold-lead every list item (`- **Term:** gloss`) unless the list is a true glossary.
- Sentence-case headings; sparse bold.
- Don’t turn every paragraph into a bullet list.

### 11. Sterile advisory register (digests especially)

Cut or rewrite when the whole piece reads like a pasted MSRC/CISA note: long CVE restatements, “remote unauthenticated attacker” boilerplate, “you are in scope if” trees, and version matrices with no human take. Keep the versions and the “should I care?” judgment; drop the bulletin voice.

### Words that often cluster in slop

`delve`, `tapestry`, `landscape`, `navigate`, `leverage`, `showcase`, `underscore`, `pivotal`, `multifaceted`, `nuanced`, `foster`, `harness`, `vibrant`, `nestled`, `testament`, `realm`, `utilize`.

Replace with a plain word **or cut the sentence** if nothing concrete remains. Do not swap `crucial` → `vital` and call it done.

---

## Editing passes (in order)

1. **Cut** — Remove summary sections, filler CTAs, restated intros, vacuous paragraphs. Expect to lose words without losing content.
2. **Structure** — Answer near top; break false balance; uneven lists; one job per section; headings useful to skimmers. For digests: stack news first; Security last if present.
3. **Specify** — Add only real conditions, numbers, examples. Mark gaps; never fabricate.
4. **Mechanics** — Transitions, hedges, not-X/Y, participial tails, synonym stacks, tricolons.
5. **Stance** — Commit. Cut “It’s important to remember…” announcements.
6. **Voice** — Read aloud (or simulate): does it sound like a person with judgment talking about one thing — warm enough to be human, not a sterile advisory or a hype reel?
7. **Frontmatter** — Title/description match the body; tags real; draft flag correct.

---

## What NOT to do

- Draft from a bare topic with no claim or notes.
- Invent stories, quotes, teammates, customers, benchmarks, or citations.
- Synonym-wash empty prose.
- Pad with balanced pros/cons when the user already decided.
- Write SEO keyword salad in the body.
- Open with world-historical framing for a small note.
- Close with a motivational poster.
- Paste assistant chat tone into the article.
- Ship `draft: false` with `[need: …]` placeholders still present.
- Open a digest with counting-as-lede or “put in front of another engineer” framing.
- Let security advisories dominate a digest’s Top Story / Highlights / lede when stack news exists.
- Ship digests that sound like CVE bulletins with a thin first-person coat of paint.

---

## Checklists

### Pre-draft brief (fill or ask)

- [ ] One-sentence claim / question  
- [ ] Named reader  
- [ ] Post type (technical / personal / meta / digest)  
- [ ] Real notes, numbers, scenes (or explicit gaps)  
- [ ] Filename `YYYY-MM-DD-slug.md` + frontmatter stub  

### Anti-slop scan

- [ ] No chatbot scaffolding  
- [ ] No stacked hedges; conditions named  
- [ ] No vague “studies/experts” without names  
- [ ] Lists uneven and fully earned (not forced threes)  
- [ ] ≤1 deliberate “not X, it’s Y” (prefer zero)  
- [ ] No Moreover/Furthermore/Additionally parade; no “In conclusion”  
- [ ] Sentence length varies  
- [ ] Ending adds a fact, decision, or real question — not a recap  
- [ ] No invented specifics  
- [ ] Nothing left that could sit unchanged on a random corporate blog  
- [ ] Digest lede (if digest): plain “what mattered this week,” not counting / peer-staging / CVE-bulletin tricks  
- [ ] Digest mix (if digest): stack-first; Security only as optional bottom section and not the main diet  
- [ ] Digest voice (if digest): warm-natural teammate, not sterile advisory  

### Publish

- [ ] Frontmatter complete; `description` honest  
- [ ] `draft: false` only when ready  
- [ ] Tags chosen; links/code fences OK  
- [ ] First three sentences pass the Lynch test  
- [ ] Claim still matches the user’s notes  

---

## Output shape when helping the user

When producing a post:

1. Emit the full Markdown file content (frontmatter + body), ready for `content/posts/`.
2. Optionally a short bullet list of assumptions and any `[need: …]` unresolved items.
3. Voice is locked (see table); only ask if this post needs an exception.

When editing: show the revised Markdown (or a clear diff of substantive changes) and list which anti-slop rules you applied.
