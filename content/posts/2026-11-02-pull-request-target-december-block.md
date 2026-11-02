---
title: The pull_request_target block slipped to December 2
date: "2026-11-02"
description: GitHub delayed the default public-repo block on pull_request_target to December 2, with two-hour brownouts on November 9 and 16. I would not blanket-allow the event.
draft: false
tags: [notes]
---

GitHub was going to enforce a default block on `pull_request_target` in public repositories on November 2, 2026. The [changelog](https://github.blog/changelog/2026-11-02-pull_request_target-blocked-by-default-december-2/) moves that date to December 2. Workflows do not get a quiet month: the first hard window is a two-hour brownout on November 9.

`pull_request_target` runs with the base repository's `GITHUB_TOKEN` and its secrets. Left alone, the workflow file and a plain `actions/checkout` both come from the default branch, so the fork's code never runs. The break is the override in [GitHub's own writeup](https://docs.github.com/en/actions/reference/security/securely-using-pull_request_target): check out the pull request head, then run a build or test. The checkout step does not execute the fork. The next command does, with your secrets. They call that a pwn request.

```yaml
- uses: actions/checkout@v6
  with:
    ref: ${{ github.event.pull_request.head.sha }}
- run: make test
```

That is their insecure example, pinned to `actions/checkout@v6` as published. I would not ship it.

The default policy is still in evaluate mode, so runs continue and Insights can show what enforcement would block. It skips private and internal repositories, it does not replace an event policy you already configured, and it does not apply to GitHub Enterprise Server. Public repositories on GitHub Free, GitHub Team, and GitHub Enterprise Cloud are the ones in scope.

Brownouts are November 9 and November 16, 16:00–18:00 UTC. In those windows a blocked `pull_request_target` run fails with an annotation and does not execute. After each window the rule goes back to warnings. On December 2 the block stays, unless an Actions event policy explicitly allows the event.

I would not add a blanket allow to get through November 9. The opt-out in the changelog is per workflow file. I would use it for a job that only reads the event — labeling, triage, a status comment — and never checks out the pull request head. If the job has to install or test the PR, I would move it to `pull_request`, which keeps a read-only token and withholds other secrets, rather than allow the privileged trigger.

This site's Pages workflow is already on `pull_request`, and its checkout does not pin the PR head. The brownout will not hit it. If a public repo of yours uses `pull_request_target` so fork PRs can reach secrets, open Insights before November 9. A two-hour failure window is a bad time to discover which file you forgot.
