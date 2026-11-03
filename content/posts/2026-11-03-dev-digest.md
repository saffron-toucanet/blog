---
title: "Weekly Dev Digest — 2026-11-03"
date: "2026-11-03"
description: "CISA added Brotli CVE-2026-111497 to the KEV catalog on 27 October; the .NET fix is 8.0.33, 9.0.22, 10.0.14, or 11 RC3, and self-contained apps need a rebuild."
draft: false
tags: [notes]
---

What mattered this week: CISA put the Brotli decoder flaw on the known-exploited list, and the .NET out-of-band from 25 October is the build I'd roll. Node 26 took an LTS label the same week the 27 alpha opened.

## Top Story

**[.NET October 2026 Out-of-Band Security Updates](https://devblogs.microsoft.com/dotnet/dotnet-october-2026-oob-security-updates/)** — .NET Blog · 2026-10-25

CISA added [CVE-2026-111497](https://www.cisa.gov/news-events/alerts/2026/10/27/cisa-adds-two-known-exploited-vulnerabilities-catalog) on 27 October, due 10 November. The catalog entry is an unchecked return value in Google Brotli: a remote unauthenticated attacker, with a crafted compressed stream, can corrupt adjacent decoder state, disclose memory, cause a denial of service, or potentially run code. .NET's 25 October out-of-band calls the same CVE a buffer overflow in its Brotli path, on every platform. You are in scope if the process decompresses Brotli through ASP.NET Core request decompression, `HttpClient` automatic response decompression, or `System.IO.Compression`. The first two are off by default. .NET Framework is not affected.

The builds are 8.0.33, 9.0.22, 10.0.14, and .NET 11 RC3. RC2 needs the move to RC3 to pick up the fix. The same drop covers CVE-2026-114148 (unsafe ownership metadata in Linux tarballs: source-build on 10 and 11; ASP.NET Core tarballs as well on 8 and 9) and re-ships the SocketAsyncEventArgs fix (CVE-2026-70197) and the Blazor WebAssembly debugger fix (CVE-2026-102870), because the 13 October release did not fully address them. A framework-dependent app needs the new runtime and a restart. A self-contained app, Native AOT publish, or container keeps the runtime it was built with until you rebuild and redeploy. [MSRC's 30 October note](https://www.microsoft.com/en-us/msrc/blog/2026/10/patch-now-php2shell-brotli-emudhra-guidance-for-customers/) says Windows Update skips these .NET packages unless you opted into updates for other Microsoft products. `dotnet --list-runtimes` shows the host. It does not show the runtime baked into a self-contained publish. I'd check both.

## Highlights

1. **[Node.js 27.0.0-alpha.0.0.0](https://nodejs.org/en/blog/release/v27.0.0-alpha.0.0.0)** — Node.js · 2026-10-29 · `Backend`
   First alpha of the once-a-year line. The [10 March schedule note](https://nodejs.org/en/blog/announcements/evolving-the-nodejs-release-schedule) still puts 27.0.0 Current in April 2027 and says this channel is for library authors and CI, with semver-major changes allowed during alpha. V8 goes from 14.6 on Node 26 to 15.6.75.13. Leave `--max-old-space-size` unset and the default heap cap is half of physical memory, clamped between 256 MB and 4 GB, and `Buffer` / `ArrayBuffer` memory counts toward that cap. `v8.serialize()`, `structuredClone()`, and `postMessage()` write a format older Node releases cannot read. The commit list also marks Intel macOS support experimental and ends OpenSSL engine support, with OpenSSL sources at 4.1.0. I'd add the alpha to a compat job and keep production on 26.

2. **[Node.js 26.13.0 (LTS)](https://nodejs.org/en/blog/release/v26.13.0)** — Node.js · 2026-10-28 · `Backend`
   Codename Lithium, with updates through the end of April 2029. The release note says the only change from 26.12.1 is LTS metadata on `process.release`. 26.12.1 is the [21 October security release](https://nodejs.org/en/blog/vulnerability/october-2026-security-releases) that includes CVE-2026-111497, so the LTS tag still carries that fix. MSRC's floor for Node is 22.23.4, 24.22.1, or 26.12.1. Coming from 24, 22, or older: official Linux binaries have linked libatomic since Node 25, and some distros need that package installed separately. 26 is the last line on the old schedule.

3. **[Push protection beyond predefined secret patterns](https://github.blog/changelog/2026-10-28-push-protection-beyond-predefined-secret-patterns/)** — GitHub Changelog · 2026-10-28 · `Security`
   Public preview, off by default. It only runs where push protection and AI-detected secret scanning are already enabled, and a hit rejects the push. GitHub's early results say the classifier more than doubled the pushes where push protection caught a secret, with user-reported precision rivaling issuer-defined detectors. That figure is theirs. Enabling it consumes AI credits; post-push AI secret alerts stay included with Secret Protection or Advanced Security. Existing bypass flows still apply, and agents need authorization before they bypass a block. I'd turn it on for repos that already pay for secret protection, and I'd keep the pattern detectors.

4. **[Flutter 3.47.9](https://github.com/flutter/flutter/blob/main/CHANGELOG.md)** — Flutter changelog · 2026-10-29 · `Flutter`
   Stable hotfix. On Windows, a path or command past `MAX_PATH` (OS error 206) used to crash `flutter_tools` with an unhandled `ProcessPackageException` or `FileSystemException`. `flutter test` in a pub workspace, monorepo, or symlinked directory crashed native-asset compilation with a `StateError`. Custom text-selection menus can add actions through `ContextMenuButtonKind` without breaking an exhaustive switch on `ContextMenuButtonType`. The security lines under that heading still say to upgrade to 3.47.8 for the Dart BoringSSL and Android certificate-store fixes. The 3.47.9 tag adds the three items above. I'd upgrade when one of those crashes is in the way.

## On the Radar

**[Upcoming Next.js November security release](https://nextjs.org/blog/upcoming-nextjs-security-release-november-2026)** — `[Update]` The [security index](https://nextjs.org/blog/security) still leads with the 27 October advance notice: seven medium issues, advisories published with the release. I read that index on the morning of 3 November. [v16.4.4](https://github.com/vercel/next.js/releases/tag/v16.4.4) (2 November) is a bugfix backport and says the security release publishes the next day.
