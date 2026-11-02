---
title: Dev Digest — 2026-11-02
date: "2026-11-02"
description: Jepsen says halt ParticleDB deploys after 96 issues; Cloudflare cut DNS zone-build peak memory from 79 GiB to 12 GiB; Ubuntu's tracker still lists CVE-2026-98432 as work in progress.
draft: false
tags: [notes]
---

Four things I'd actually put in front of another engineer today. One of them is a database I would not deploy.

## Top Story

**[ParticleDB 1.1.4](https://jepsen.io/analyses/particledb-1.1.4)** — Jepsen · 2026-10-31

Kyle Kingsbury tested ParticleDB 1.1.4 through 1.1.18.11.rc-22 and calls the "Full ACID" claim premature. The report lists 96 issues. All but three of them showed up on a healthy single node with no fault injection, and most needed only one client. By 1.1.18.11.rc-22, ten were still open. The default `occ` mode still lost committed writes in normal operation. `serializable`, the strongest setting he tested, still allowed internal anomalies and Lost Update. Orkes says 1.1.19-rc.13 addresses the list. Jepsen has not run that build, and the writeup notes the new concurrency-control names may just be the old modes renamed. Orkes funded the work. Jepsen's recommendation is to halt further deployment and migrate, and to rebuild state from somewhere more reliable if you have it. I'd follow that. A vendor release candidate is not a retest.

## Highlights

1. **[How we halved DNS build delay and cut memory use by 85%](https://blog.cloudflare.com/dns-targeted-zone-builds/)** — Cloudflare · 2026-11-02 · `Backend`
   Alex Fattouche on the Zone Builder. Zone-setting changes used to rebuild zones that now hold more than 20 million records. The new planner picks the smallest build they can prove matches a full one. Over 24 hours, 92.95% of builds skipped a complete rebuild, and full builds fell by about 40%. Working-set memory went from 49 GiB average / 79 GiB peak to 7 GiB / 12 GiB. Median time from a change until the Quicksilver write went from about 7.7 seconds to about 3.3 seconds. That clock stops at their edge store, not at global DNS propagation. The part I'd steal is the proof obligation on the small rebuild, not the latency headline.

2. **[CVE-2026-98432](https://ubuntu.com/security/CVE-2026-98432)** — Ubuntu · published 2026-10-15, tracker updated 2026-10-30 · `Security`
   Use-after-free in `ip_options_build`. `tcp_v4_syn_recv_sock()` hands `ireq_opt` to the child socket without copying it, and `inet_sock_destruct()` frees that `inet_opt` with a plain `kfree()` while another CPU can still be building a SYNACK for a retransmitted SYN. IPv6 is not on that first path, because `tcp_v6_syn_recv_sock()` duplicates the options. Ubuntu marks the CVE high priority. When I read the tracker, `linux` was still "Vulnerable, work in progress" on 22.04 (`5.15.0-203.213`), 24.04 (`6.8.0-149.149`), 26.04 (`7.0.0-43.43`), and 26.10 (`7.3.0-10.10`). The page's last-updated line is 30 October. I would not read "work in progress" as a shipped kernel.

3. **[Postgres 19 is late, and it's AI's fault](https://neon.com/blog/postgres-19-is-late-and-its-ais-fault)** — Robert Haas · 2026-10-21 · `Backend`
   Haas, a Postgres committer, says 19 most likely slips into November. Three features came out late in beta, between 27 August and 15 September: `UPDATE`/`DELETE` `FOR PORTION OF`, SQL/PGQ, and `ALTER TABLE … MERGE PARTITION` / `SPLIT PARTITION`. His commit counts, from feature freeze on 8 April through 25 September: the in-progress stable branch went from 724 back-patched commits in 2025 (`REL_18_STABLE`) to 1,169 in 2026 (`REL_19_STABLE`). The prior stable branch went from 248 to 433. He thinks LLMs are surfacing old bugs faster than reviewers can land fixes, and that drafted fixes still need a human who knows the project's bar. I trust the counts. I would not put a ship date on a calendar until the project announces one.

4. **[Sparks of weight-space programming](https://rikiyat.github.io/blog/weight-space-programming/)** — Takehi, Teoh, Zhang, Khattab · 2026-11-02 · `AI/Tooling`
   They asked GPT-6 Astra to make Qwen3.5-0.8B better at math by editing weights in a Python kernel. No gradients. With a budget of 50 forward passes it changed 131,072 weights (0.016% of 0.8 billion): one direction, subtracted from 64 MLP output columns in layers 15 and 19. Same sampling as the base (temperature 0.6, top-p 0.95, top-k 20, presence penalty 1.5, 32,768-token cap). MATH-500 went from 7.9% to 48.1%, GSM8K from 13.8% to 67.1%, IFEval from 21.0% to 62.3%. The share of MATH-500 answers that hit the token cap fell from 93% to 33%. They then tried Gemma 3 270M, which rarely loops (8.5% of answers hit its cap), and no edit moved MATH-500 by more than about a point. The Qwen jump is a loop getting out of the way of answers the model could already finish. They published the run logs with the post. I'd read those before repeating a "6× math" line.
