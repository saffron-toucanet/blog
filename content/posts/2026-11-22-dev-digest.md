---
title: "Weekly Dev Digest — 2026-11-22"
date: "2026-11-22"
description: "Rust's parallel compiler frontend is on by default in nightly, NuGet.org can hold a package until you promote it, and Flutter 3.50.1 fixes the 3.50 split-APK versionCode bug."
draft: false
tags: [notes]
slug: dev-digest-2026-11-22
---

Nightly Rust now typechecks on more than one thread. NuGet.org will hold a package until someone promotes it. Flutter 3.50.1 is the hotfix I would take if a 3.50 Android build started dropping assets or shipping identical split version codes. A Bun security bump is at the bottom.

## Top Story

**[Enabling the parallel frontend on nightly](https://blog.rust-lang.org/2026/11/16/enabling-parallel-frontend-on-nightly/)** — Rust Blog · 2026-11-16

The compiler frontend (type checking and borrow checking) has been one thread for years. Since `nightly-2026-11-14` it runs in parallel by default, on nightly only, at 2 threads. Stable is still sequential. I would leave the default on. I would raise `--jobs-frontend` on a machine that is not already full of Cargo and LLVM.

Their suite measures one crate, from scratch. Mean wall-time change at 8 threads: check −44.23%, clippy −41.76%, debug −36.1%, opt −27.88%. `cargo check` of nalgebra, cargo, or diesel was almost three times faster in some of those runs. Incremental rebuilds in the same suite averaged 3–5%, and they say they do not have a good benchmark for that case. A whole-graph `cargo check` of the cargo crate on an 8-core machine went from 36.7s with 1 frontend thread to 30.8s with 8, about 15%, because the cores were already busy.

Diagnostics can come out in a different order. They treat a non-reproducible binary as a bug they want reported. Opt out with `-Zunstable-options --jobs-frontend=1`. They do not expect it to scale well past about 8 threads, and memory goes up with the thread count. I would not pin a CI assertion to diagnostic order on this nightly.

## Highlights

1. **[Staged publishing on NuGet.org](https://devblogs.microsoft.com/dotnet/nuget-staged-publishing/)** — .NET Blog · 2026-11-17 · `.NET`
   Upload can stop before the package is public. NuGet.org still validates it (malware scan, signature, repository signing), and an authorized maintainer promotes it on the website. A staged package cannot be restored at all. An unlisted package still can, by exact version. There is no private restore feed, even for the owner. Test on a local feed first.

   A staging-only API key can upload and cannot take the normal push path. Trusted Publishing policies can be limited the same way. Promotion wants an account with two-factor authentication enabled. The post is explicit that this is not a fresh two-factor challenge on every promote. A staging group is one review surface for a set of packages, and group promotion is not atomic: packages become restorable on their own clocks. Staged content expires if you never promote it. They do not give the window in the post.

   The CLI they show is `dotnet package stage push`, and they name the .NET 11 RC2 SDK as what supports it. Listing and group management are roadmap examples. Jon Douglas replied on the post that a CLI approve command is not ruled out. The wording in the post overstated that. I would give the pipeline a staging-only credential and keep the promote click with a person. I would check `dotnet package stage --help` on the SDK I actually have before I rewrote a release workflow around the RC2 example.

2. **[Flutter 3.50.1 changelog](https://github.com/flutter/flutter/blob/3.50.1/CHANGELOG.md)** — Flutter · 2026-11-20 · `Flutter`
   Stable hotfix on the 3.50.1 tag. The [release tracker](https://github.com/flutter/flutter/issues/196743) records the publish, archive check, and announce as done; it was last updated 20 November. Dart stays on the 3.50 hash.

   Two Android failures from 3.50.0 are why I would upgrade a shipping app. Assets whose names start with a dot (`.env`) or an underscore folder were left out of the APK or AAB, and the app then failed at runtime. `--split-per-abi` with `versionCode` set only in `AndroidManifest.xml` gave every split the same `versionCode`.

   A few more I would retest if they match a bug I have open. Dynamic text on web `--wasm` with cross-origin isolation could freeze or crash. Gradle's configuration cache could not store the entry, so it never reused it. `flutter build web` without `--web-content-hash` after a hashed build deleted `build/web/index.html`. `flutter run` / `flutter attach` crashed when the temp directory was missing or full, most often on Windows and the iOS Simulator. I would `flutter upgrade` on stable and rebuild the Android artifact I was about to upload.

3. **[pnpm 12.22.0](https://pnpm.io/blog/releases/12.22.0)** — pnpm · 2026-11-17 · `Web`
   `globalPackagesConfig` in the global `config.yaml` applies only to global commands (`pnpm add -g`, `pnpm update -g`). `pnpm approve-builds -g` saves build decisions there. The global packages directory's `pnpm-workspace.yaml` still applies, with a deprecation warning, until the next approval moves it. `pnpm why --ranges` prints the range each direct dependent declares. `pnpm list --recursive` lists workspace projects in dependency order (`--no-sort` keeps workspace order).

   A `file:` dependency on a local directory now resolves that directory's `catalog:` specifiers against the workspace catalogs. Before, install failed with `ERR_PNPM_SPEC_NOT_SUPPORTED_BY_ANY_RESOLVER`. The experimental v13 lockfile records those declared specifiers next to the resolved versions and drops `dependenciesMeta` (`injected: true` moves onto the dependency). Run install to rewrite a v13 lockfile an earlier 12.x wrote. I still would not commit v13 on a shared repo.

   The fix I would actually upgrade for: if the default registry or a scoped registry changed, install could reuse the cached resolution and skip `minimumReleaseAge` and `trustPolicy` against the new registry. 12.22 re-verifies. `pnpm dlx` also stops reusing a cache built under looser `overrides`, `minimumReleaseAge`, `trustPolicy`, and related settings, and it stops applying those from a local `pnpm-workspace.yaml`. `pnpm audit` was dropping advisories whose `id` is a string and then reporting a clean tree. The same registry check is in [11.28.13](https://pnpm.io/blog/releases/11.28.13) if you are still on 11. I would take 12.22 on a 12.x workspace. I would take 11.28.13 the same day if I cannot move major versions yet.

4. **[React Native 0.89.0-rc.2](https://github.com/react/react-native/releases/tag/v0.89.0-rc.2)** — React Native · 2026-11-18 · `React`
   `[Update]` C++ Native Animated (`cxxNativeAnimatedEnabled`) is promoted to stable in this RC. The shared animation backend (`useSharedAnimatedBackend`, `optimizedAnimatedPropUpdates`) turns on in canary and nightly only. Both flags stay off by default in stable releases. DevTools picks up the React DevTools 8.0.0 Suspense panel, and timeline frames plus Performance-panel screenshots are on by default. Android stops Base64-encoding `fetch` bodies for DevTools when no debugger is attached.

   On iOS, `contentInsetAdjustmentBehavior` now keeps content clear of the safe area along the scroll axis (the rail on iPhone Duo, the notch in landscape) and pads by the larger of the safe area or `contentContainerStyle` padding. It used to add the two. `react-native spm add --deintegrate` keeps the Podfile, and `pod install` errors if the app is on SwiftPM. `react-native spm deinit` then `pod install` is the way back to CocoaPods. I would try rc.2 on a branch if I am already on the 0.89 RCs. I would not call the line stable until the stable tag exists. The community CLI devDependency break from rc.0 is still the one I would grep for.

5. **[Vite 8.4.0-beta.1](https://github.com/vitejs/vite/releases/tag/v8.4.0-beta.1)** — Vite · 2026-11-16 · `Web`
   A beta, so I would try it on a branch and leave production on 8.3.8. The bits I would actually poke: `server.fs.strict: 'extended'`, bundled dev mode for SSR, worker chunks in the build manifest, and a retry for failed CSS preloads. CSS `url()` can use subpath imports. Empty CSS files are skipped. `dev.sourcemap.css` replaces `css.devSourcemap`. `--configLoader` is stabilized and `--configLoader=runner` is deprecated. `optimizeDeps.rollupOptions` is removed.

   Last week's 8.3.8 added, then reverted, keeping `magicString` and `ast` on transform-hook meta. This beta puts that keep back (`#24067`). If a plugin was written against the revert, the beta will surprise it. I would not bump a shared preset to 8.4 until it leaves beta.

6. **[typescript-eslint 8.73.0](https://github.com/typescript-eslint/typescript-eslint/releases/tag/v8.73.0)** — typescript-eslint · 2026-11-16 · `TypeScript`
   Opt-in native parser for the TypeScript 7.1 backend, over IPC: `parserOptions.projectService.EXPERIMENTAL_backend: 'tsgo'`. There is also `TYPESCRIPT_ESLINT_EXPERIMENTAL_BACKEND`. The [PR](https://github.com/typescript-eslint/typescript-eslint/pull/12803) adapts the native AST and checker so existing rules still see the classic shapes. Joshua Goldberg's numbers, on an M1 Max: a single-rule run like `no-floating-promises` was about even, and `recommendedTypeChecked` got slower as the file count grew (8192 files: 58.49s classic, 100.63s native) because each type query is a round trip and 7.1 does not have the bulk APIs they want yet. There is a new `no-unsafe-class-instance-assignment` rule, and `consistent-type-imports` reports a narrower range. I would run the experimental backend on one repo and compare times. I would not point CI at it this week.

7. **[Wait for pull request events with GitHub CLI](https://github.blog/changelog/2026-11-18-wait-for-pull-request-events-with-github-cli/)** — GitHub Changelog · 2026-11-18 · `AI/Tooling`
   `gh` 2.105.0 adds `gh event listen`. Pass a pull request URL and the events you care about (submitted review, state, head, merge conflicts, completed check suites) and it prints each one as a line of JSON. It exits after the first event unless you pass `--count` or `--follow`. `gh pr create`, `gh pr view`, `gh run view`, `gh run watch`, and `gh api` now suggest this instead of a poll loop. The commands are in preview, and Event Streams access is a waitlist on GitHub.com. I would use it in an agent loop once I have access. I would not rebuild a required check around a preview command.

8. **[Copilot Fusion updates](https://github.blog/changelog/2026-11-17-github-copilot-fusion-updates-more-availability-benchmarks-and-models/)** — GitHub Changelog · 2026-11-17 · `AI/Tooling`
   Fusion can now be selected on github.com, Visual Studio, and the GitHub Mobile beta apps. Production mobile apps are "coming shortly." New models inside Fusion: Claude Sonnet 5.5 on Max, GPT-6.1 Terra on High, MAI-Code-2 on Standard. GitHub's changelog says Fusion Max scored 71.2% on the Terminal-Bench 4.1 public leaderboard, 5.4 points ahead of Opus 5.5 and Fable 5.2, at 88% less cost than Fable 5.2 and 57% less than Opus 5.5. Those figures are theirs. I would try Fusion on a task I can already grade. I would not move a pinned model in a shared agent config because a leaderboard line moved.

9. **[GPT-6.2 Astra and Sol](https://openai.com/index/introducing-gpt-6-2-astra-sol)** — OpenAI · 2026-11-17 · `AI/Tooling`
   API ids are `gpt-6.2-astra` and `gpt-6.2-sol`. OpenAI's standard short-context rates (≤272K input tokens), per million: Astra $8 input, $0.40 cached input, $40 output. Sol stays at GPT-6.1 Sol's $2 / $0.10 / $10. Past 272K, input doubles and output is 1.5× for the whole request. Astra's short-context input and output are 20% under GPT-6 Astra ($10 / $50). In Copilot, both are generally available for Pro+, Max, Business, and Enterprise, billed at list price, with a gradual rollout. Business and Enterprise admins still gate them in the model policy if the org turned off the default for new models. [Gemini 4 Neon](https://github.blog/changelog/2026-11-18-gemini-4-neon-in-github-copilot/) landed in Copilot the next day, on the same plans. GitHub says Google reports quality close to Gemini 4 Carbon at a lower token cost per task. I would price a long agent session off the cached-input rate before I swapped a default. I would not treat "fewer tokens" in a launch post as a measurement I ran.

10. **[Azure SQL Database container, public preview](https://devblogs.microsoft.com/azure-sql/build-locally-with-azure-sql-database-container-now-in-public-preview/)** — Azure SQL · 2026-11-17 · `Backend`
    The image is `mcr.microsoft.com/mssql/azure-sql-db-server:latest`. It runs on x64 or ARM64, including Apple Silicon, and local use does not need an Azure subscription. Their sample binds `127.0.0.1:1433`, wants 2 CPUs, 4 GB, and 10 GB of disk, and expects `SERVERPROPERTY('EngineEdition')` of `5` after you create the database. `sqlcmd` is in the container. The `-C` flag trusts the local self-signed certificate. They say the container is for development and testing, and it is not a full stand-in for the managed service. I would pin a digest in CI. I would not point a production connection string at it.

11. **[GitHub Desktop 3.7.0](https://github.blog/changelog/2026-11-19-github-desktop-now-supports-multiple-accounts-per-host/)** — GitHub Changelog · 2026-11-19 · `Web`
    Desktop can sign in more than one account on the same host: GitHub.com, Enterprise Server, or GHE.com. Each repository is tied to an account, so clone, publish, and Git operations use that account's credentials. Existing repositories are migrated to the account you were already using. If you only have one account per host, nothing changes. I would add the work account here before I keep swapping `gh auth` in a terminal just to push.

## Worth Reading

**[AI is changing the cross-platform decision matrix](https://devblogs.microsoft.com/dotnet/ai-cross-platform-decision-matrix/)** — David Ortinau, .NET Blog · 2026-11-20

Ortinau had agents rebuild the iOS and Android UI of Barista Notes (a .NET MAUI app, about 31,000 lines of C#, MauiReactor) as UIKit and Android Views in C#, over a shared library. The first pass was about three elapsed days and under four hours of his time: 58 hours of model time, 699 passing tests, shared code across both platforms from 99.2% to 40.4%. Adding one feature later cost 87.6 model minutes on the MAUI side and 121.2 on the two platform UIs. A coordinator spent 616 minutes against 209 for the two implementation groups, and he counts part of that as the comparison harness.

On 18 November he remeasured on SDK `11.0.100` and MAUI Controls `11.0.0`, full ReadyToRun on both, 30 launches: Android startup median 1,233 ms (MAUI) vs 615 ms (platform UI); iOS 569 ms vs 367 ms. Signed packages were smaller on the platform UI builds in that matched configuration (Android 45.64 MiB vs 31.74 MiB). Android's defaults are different ReadyToRun modes, and swapping to those defaults flipped the size comparison. I would read the measurement-scope section before I quoted the startup cut in a design doc. His own ending matches what I would do: start with one shared UI, and treat a platform-specific screen as something to measure, because the rewrite got cheap and the ownership did not.

## Security

1. **[Bun v1.4.5](https://bun.com/blog/bun-v1.4.5)** — Bun · 2026-11-19 · `Security`
   A security release. It updates lsquic 4.9.4 → 4.11.2, c-ares 1.34.8 → 1.34.9, SQLite 3.53.4 → 3.54.1, llhttp 9.4.2 → 9.4.4, and BoringSSL from the August 2026 snapshot to November 2026. The post names HTTP/3, HTTP/1.1, TLS, DNS, and Zstandard, and the APIs that sit on them: `Bun.serve`, `fetch`, `node:http`, `node:quic`, `node:tls`, `Bun.zstdDecompress`, and the rest of that list. SQLite 3.54 refuses `ALTER TABLE` that adds, renames, or drops a column named `rowid`, `oid`, or `_rowid_`. On macOS, Bun uses the system SQLite, so that particular change is the bundled library. I would `bun upgrade` if anything in that API list is on a request path. I would retest a migration that touches `rowid` on Linux, where the bundled SQLite is the one that changed.

## On the Radar

**[TypeScript 7.1 iteration plan](https://github.com/microsoft/TypeScript/issues/63703)** — `[Unconfirmed]` on the new dates. The plan table still says RC on 2026-11-10 and stable on 2026-11-24. The team has not edited that table since the beta comment on 20 October. This morning `npm view typescript dist-tags` shows `latest` at 7.0.2, `beta` at 7.1.0-beta, and `rc` still at 7.0.1-rc. `next` is the nightly `7.1.0-dev.20261121.1`. A comment on 21 November says the writer was told the RC is 1 December and stable is the second week of December, and says they are not on the TypeScript team. I would not book a migration for the 24th. I would keep a branch on `typescript@beta` until `rc` actually points at a 7.1 build.
