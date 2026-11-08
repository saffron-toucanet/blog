---
title: "Weekly Dev Digest — 2026-11-08"
date: "2026-11-08"
description: "pnpm 12.18 changes repeat installs and Cargo updates, React Native 0.89 RC requires the community CLI plugin, and Chrome 157 stable turns on HTML-in-canvas."
draft: false
tags: [notes]
slug: dev-digest-2026-11-08
---

Bundlers and package managers did the useful work this week. pnpm 12.18 stops rereading unchanged workspace manifests, React Native's 0.89 release candidate makes the community CLI an explicit dependency, and Chrome 157's stable channel is where HTML-in-canvas actually turns on. Node has a high-severity release queued for Wednesday. That note is at the bottom.

## Top Story

**[pnpm 12.18.0](https://pnpm.io/blog/releases/12.18.0)** — pnpm · 2026-11-05

On a normal npm registry, the install path is the part I would feel. Repeat installs, and `pnpm run` / `pnpm exec` with `verifyDepsBeforeRun`, no longer read `package.json` for workspace projects whose files have not changed. pnpm's own timing on a 300-project workspace with `sharedWorkspaceLockfile: false` has `pnpm -r exec true` going from 490 ms to 42 ms. `pnpm store add ./tarballs/*.tgz` then `pnpm install --offline --frozen-lockfile` is the offline path if you already have the tarballs.

Platform variants (`publishConfig.variants`, per-target archives, lockfiles that record every variant) need a registry declared `serverType: pnpr`. Publishing variants anywhere else is refused unless you pass `--no-variants`. I would not plan an npmjs publish around this.

Two behavior changes I would read before upgrading a repo that is not a plain JavaScript workspace. Agent skills shipped by a dependency are linked by the skill name (`.claude/skills/auth`, not the old `pnpm-@acme+kit-auth` form), and `pnpm approve` now asks which skills to link when a package ships more than one. And `pnpm update --latest` stops moving three kinds of Cargo dependency that used to jump and leave the workspace unbuildable: a renamed crate that is also declared under its own name, a crate replaced through `[patch.crates-io]`, and a crate whose newest release is older than what you have (a prerelease ahead of latest stable). Those stay put, with a warning, unless you name the crate on the command line.

## Highlights

1. **[pnpm 11.28.11](https://pnpm.io/blog/releases/11.28.11)** — pnpm · 2026-11-05 · `Web`
   If you are still on the 11 line, this is the patch. `pnpm install --frozen-lockfile` accepts the lockfile it wrote when `excludeLinksFromLockfile` and `linkWorkspacePackages` are on and a project depends on a workspace package through a plain range or a `catalog:` entry. That used to fail with `ERR_PNPM_OUTDATED_LOCKFILE`. In a workspace, `pnpm link <path>` now writes the `link:` dependency into the project where you ran the command, not the workspace root `package.json`.

2. **[React Native 0.89.0-rc.0](https://github.com/react/react-native/releases/tag/v0.89.0-rc.0)** — React Native · 2026-11-04 · `React`
   First RC off the branch that cut 2 November. Stable is still scheduled for 7 December on the [release table](https://reactnative.dev/releases/overview). The break I would grep for: `react-native/community-cli-plugin` is no longer auto-detected from `react-native` and has to sit in `devDependencies`. On Android, `DefaultNewArchitectureEntryPoint.fabricEnabled` and the other legacy New Architecture flags are gone, and bridgeless is just on. `Text` gains `lineBreak` and `wordBreak` for phrase breaking on Android 13 and up. I would put the RC on a branch. I would not ship it.

3. **[jsdom 31.0.0](https://github.com/jsdom/jsdom/releases/tag/v31.0.0)** — jsdom · 2026-11-05 · `Web`
   Two breaks if your tests are picky. Optional canvas moves from the `canvas` package to `@napi-rs/canvas` 1.0.13 or later. Installing `canvas` alone no longer turns that on, and encoded bytes can differ. CSS parsing, selector matching, and computed style now go through a new engine (cascade layers, nesting, `@scope`, constructable stylesheets). Parsing also pauses at blocking scripts, so `new JSDOM(...)` can hand you a partial document. Wait for `DOMContentLoaded`, and check `readyState` in case it already fired.

4. **[Vitest 5.1](https://vitest.dev/blog/vitest-5-1)** — Vitest · 2026-11-02 · `Web`
   `--since-last-run` selects tests from the files each test loaded last time, mtimes included, with no git. A test that failed last run is included until it passes. Trace view in browser mode defaults to `failure-only`: passing tests skip the DOM snapshot. Browser-mode mocks go through an import map when the browser supports more than one per document. On their public benchmark (500 files, 1,883 mocks, Chromium, 9 workers, median of 3), the mocks suite went from 56.4 s on 5.0.3 to 27.2 s. A mock registered after the page already imported the module now errors instead of quietly using the original. The default browser-mode port moved from `63315` to `23315`, because Windows was reserving the old one under Hyper-V, WSL2, or Docker Desktop.

5. **[Parcel 3 alpha](https://v3.parceljs.org/blog/v3-alpha/)** — Parcel · 2026-11-04 · `Web`
   A Rust rewrite with no Node dependency. Install `parcel@next`, or `@parcel/parcel3` if you want the `parcel3` binary next to v2. They say cold builds are up to 100× faster than v2 on the same compilers, and that a 450-page site makes 64% fewer HTTP requests per page and transfers 10% fewer bytes. The binary is under 30 MB. They dropped disk caching of every transform on purpose, removed scope hoisting, and still do not generate `.d.ts`. JavaScript plugins run on an embedded QuickJS, not Node, and have no network. I would try `parcel3` on a branch. I would not point a production build at `parcel@next` while type declarations and the programmatic API are still missing.

6. **[Rspack 2.3](https://rspack.rs/blog/announcing-2-3)** — Rspack · 2026-10-29 · `Web`
   This landed 29 October, just before last week's note, and it is still the bundler release I would actually read. The parser is SWC Next. On one real project they measured, peak build RSS went from 28.3 GiB to 20.5 GiB. `splitChunks.dedupDepth` defaults to 1 in production. The new persistent cache is off until you set `experiments.newCache: true` (and `cache.type: 'persistent'`). Their loader-cache test, about 10,000 modules through babel-loader, dropped a serial run from 63.8 s to 11.2 s. Those numbers are theirs. I would turn the new cache on in one CI job before I trusted it as the default I do not have yet.

7. **[HTML-in-canvas](https://developer.chrome.com/blog/html-in-canvas)** — Chrome for Developers · 2026-10-26 · `Web`
   The writeup is from 26 October. The desktop stable channel update for Chrome 157 is [3 November](https://chromereleases.googleblog.com/2026/11/stable-channel-update-for-desktop.html) (157.0.8103.38 / .39), rolling out over the following days. The canvas opts in with `content="drawable"`. In 2D you call `drawElementImage`. In WebGL and WebGPU you pass a matrix to `updateElementGeometry`. Feature detection is `canvas.content === "drawable"` after setting the attribute. I would try it on an internal canvas tool, and I would keep a fallback for any browser where that check fails.

8. **[Delivering skills in NuGet packages](https://devblogs.microsoft.com/dotnet/delivering-skills-in-nuget-packages/)** — .NET Blog · 2026-11-03 · `.NET`
   Richard Lander's note on shipping `SKILL.md` files inside a package, next to the binaries, so a new API is not stuck waiting on the model's training cut. `dotnet restore` already puts them under the global packages folder, and `project.assets.json` lists them. `dotnet-inspect` can print them. `dotnet-package-skills install` copies them into `.agents/skills`. He is explicit that this post does not show an agent actually loading those files. That is the next writeup. I would read a package's skill before I committed the copy. It is instructions, and it rides along with whatever package you already trust.

9. **[Windows Arm64 migration in the Copilot upgrade agent](https://devblogs.microsoft.com/dotnet/modernize-dotnet-apps-for-windows-arm64/)** — .NET Blog · 2026-11-05 · `.NET`
   The GitHub Copilot upgrade agent has a .NET scenario that looks for x64 or x86 assumptions, writes a plan, and edits code, packages, and project settings toward Windows Arm64. A successful build is the checkpoint they name. Runtime still wants Arm64 hardware or a CI runner that matches. I would let it inventory native dependencies. I would not treat a green x64 build as the migration being done.

10. **[Cargo RFC 4013, `required-targets`](https://github.com/rust-lang/rfcs/pull/4013)** — Rust RFCs · merged 2026-11-01 · `Rust`
    Accepted, not in stable Cargo yet. A package can set `required-targets` to a `cfg` expression. `cargo check --workspace` skips a member the selected target does not satisfy. `cargo check --package` that member and it errors. The rendered text is in the [RFC book](https://rust-lang.github.io/rfcs/4013-cargo-required-targets.html). Tracking issue is [cargo#17671](https://github.com/rust-lang/cargo/issues/17671). I would wait for the implementation before I put the field in a manifest I publish.

11. **[Preact 11.2.0](https://github.com/preactjs/preact/releases/tag/11.2.0)** — Preact · 2026-11-06 · `React`
    Scoped custom-element registries work when you render into a shadow root. Non-function `on*` props are ignored instead of being registered as handlers. An error boundary now receives a thrown `null` or `undefined` instead of a `TypeError` that replaced it. Small release. The shadow-root one is the reason I would bump.

12. **[Pull request Overview page](https://github.blog/changelog/2026-11-05-new-pull-request-overview-page-in-public-preview/)** — GitHub Changelog · 2026-11-05 · `Web`
    Opt-in public preview, rollout still going through this weekend. The merge box moves up and gets smaller: checks, comments, and approvals in one summary, then the action that unblocks you. You can filter to unresolved threads or to comments you wrote, and sort newest first. The button is "Try the Overview page" in the header, and the same menu puts the classic page back. I would turn it on for a week on the repos where the conversation is longer than the diff.

13. **[Copilot in Xcode's coding assistant](https://github.blog/changelog/2026-11-04-github-copilot-is-now-available-in-xcodes-coding-assistant/)** — GitHub Changelog · 2026-11-04 · `AI/Tooling`
    Public preview inside Xcode's own assistant, starting with Xcode 27.3 beta on macOS Tahoe 26.6 or later. Settings live under Xcode → Settings → Intelligence. The existing Copilot for Xcode extension is still a separate install. All Copilot plans are supported. If you are not already on that Xcode beta, there is nothing to switch.

## Worth Reading

**[Notable V8 changes from Node.js 26 to 27 (Alpha)](https://nodejs.org/en/blog/announcements/notable-v8-changes-from-node-js-26-to-27-alpha)** — Node.js · 2026-11-05 · `Backend`

Joyee Cheung's walkthrough of the V8 14.6 → 15.6 jump that shipped in the 27 alpha on 29 October. The alpha itself was already in last week's note. This is the page I would hand someone who is about to run library CI on it. `Math.sumPrecise`, new iterator helpers, and `Intl.Locale.prototype.variants` are on by default. `Array.prototype.sort` uses PowerSort for larger arrays and stays stable, but a comparator with side effects can observe a different call pattern. `v8.serialize`, `structuredClone`, and `postMessage` use a new format that older Node cannot read. With `--max-old-space-size` unset, the default old-generation limit is half of physical memory, clamped between 256 MB and 4 GB. On an 8 GB machine that is 4 GB, where it used to be 2 GB. Buffer and ArrayBuffer memory now counts toward V8's global allocation limit. I would set the flag on any 27 alpha job that was leaning on the old cap.

## Security

1. **[Wednesday, November 11, 2026 security releases](https://nodejs.org/en/blog/vulnerability/november-2026-security-releases)** — Node.js · 2026-11-03 · `Security`
   Advance notice only. New 26.x, 24.x, and 22.x builds on or shortly after Wednesday. The highest severity they name for each of those three lines is high. The post does not list the issues. End-of-life lines are affected and will not get builds. I would leave a slot on Wednesday to read the actual release, and I would not guess the patch from this page.

## On the Radar

**[.NET 8 and .NET 9 end of support](https://devblogs.microsoft.com/dotnet/dotnet-8-9-end-of-support/)** — The post is from 29 June. The date it names is this Tuesday, 10 November, which is also the .NET 11 keynote. After that, no more servicing updates for 8 or 9. .NET 10 is the LTS they point at, supported through November 2028. They may ship one last update that day if something critical is open. Apps keep running.

**[TypeScript 7.1 RC](https://github.com/microsoft/TypeScript/issues/63703)** — `[Update]` The beta has been out since 20 October. The iteration plan still lists an RC on 10 November and stable on 24 November, and the issue has not been updated since the beta comment. I still would not book the migration for Tuesday.

**[Cargo 1.100 build-directory layout](https://doc.rust-lang.org/beta/cargo/CHANGELOG.html)** — Rust 1.100 is scheduled for 12 November. The beta changelog says intermediate artifacts move to a new directory layout, and tools that poke around `target/` should use Cargo's JSON messages instead. The layout is not a stable interface.

**[Flutter 3.50](https://docs.flutter.dev/install/archive)** — `[Update]` The public schedule still lists 3.50 as the November stable, branch cutoff 6 October. The stable section I can point at in the [changelog](https://github.com/flutter/flutter/blob/master/CHANGELOG.md) is still 3.47.9.
