---
title: Prose fixtures for the stylesheet
date: "2026-11-02"
description: Stress-test post for headings, lists, images, and blockquotes.
draft: false
tags: [meta, css]
---

I needed one published page that hits the Markdown shapes the CSS claims to style. This is that page—not news, just fixtures.

## Why this post exists

The generator emits whatever Markdown throws at it. If `h3`, nested lists, or images look broken, I want to notice here before a real note ships looking half-finished.

### What I’m checking

- Heading rhythm under the post title
- Lists (including a nested level)
- A full-bleed-friendly image in the measure
- Blockquote contrast on graphite paper

## Checklist in list form

1. Ordered items stay readable at body size.
2. Unordered siblings don’t collapse into each other.
3. Nested detail still indents cleanly:
   - Image `max-width: 100%`
   - Code blocks still scroll instead of blowing the column
   - `hr` doesn’t shout

## Image

Here’s a tiny graphite + ink swatch so the stylesheet’s image rules have something real to hang on:

![Graphite paper with an ink-blue accent bar](/images/graphite-swatch.svg)

## Quote and rule

> Measure is a promise. If the column wanders, the post stops feeling like reading and starts feeling like a dashboard.

---

If this page looks calm in light and dark, the Phase 1–3 tokens are doing their job. If it doesn’t, fix the CSS—not the fixtures.
