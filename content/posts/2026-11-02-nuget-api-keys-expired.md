---
title: NuGet API keys from before August 17 expired on November 1
date: "2026-11-02"
description: Keys created before August 17, 2026 expired on November 1. I would move GitHub Actions and GitLab to Trusted Publishing, set a package scope, and leave other CI on 30-day keys.
draft: false
tags: [notes, dotnet]
---

NuGet.org API keys created before August 17, 2026 expired on November 1. The [.NET blog post](https://devblogs.microsoft.com/dotnet/strengthening-nuget-supply-chain-security-reducing-api-key-lifetime/) that set that date is from August, and I have not seen a retraction. A publish workflow still holding one of those keys needs a new credential before the next push.

An API key is a password for pushing packages. Since August 17, new keys last at most 30 days. A shorter lifetime cuts how long a leaked key keeps working. It is still a reusable secret. That post tells GitHub Actions and GitLab publishers to move to Trusted Publishing, and tells everyone else to plan on 30-day keys.

Trusted Publishing is an OIDC exchange. The job presents a short-lived identity token, nuget.org matches it to a policy you configured, and you get back a temporary API key. [The docs](https://learn.microsoft.com/en-us/nuget/nuget-org/trusted-publishing) say that key lasts one hour, and one token buys one key. Request it in the step right before `dotnet nuget push`. If login runs at the top of a long pack-and-test job, the key can expire before the push. That is where the OIDC advice fails in practice.

```yaml
- name: NuGet login (OIDC → temp API key)
  uses: NuGet/login@v1
  id: login
  with:
    user: contoso-bot
- name: NuGet push
  run: dotnet nuget push artifacts/my-sdk.nupkg --api-key ${{steps.login.outputs.NUGET_API_KEY}} --source https://api.nuget.org/v3/index.json
```

That is the GitHub sample from the docs, with the build steps removed. The job also needs `permissions: id-token: write`. `user` is the nuget.org profile name. The docs recommend passing it from a secret, and they say not to use your email. I would keep the login step adjacent to the push, as written.

Scope is the part I would not skip. Through mid-August a trusted repository could publish every package under the account that owned the policy. [NuGetGallery#10587](https://github.com/NuGet/NuGetGallery/issues/10587) tracked that hole. On August 19 a NuGet maintainer wrote that existing policies keep working, and that creating or editing a policy now requires scopes. The docs describe those scopes as a glob over package names, plus whether the policy may create new packages or only push new versions. I would open any policy from before that change and set the glob. I would not assume an old policy picked one up on its own.

Private GitHub repositories get an extra timer. The docs say a new policy there is temporarily active for 7 days, because nuget.org needs a successful publish to pin the GitHub repository and owner IDs. Miss that window and the policy goes inactive. You can restart the 7 days. I would do a real push before assuming the policy stuck.

I would move GitHub Actions and GitLab publishes to Trusted Publishing, with the login step next to the push and a package glob on the policy. I would leave a 30-day key for CI the docs do not cover, scoped to the packages that job publishes, with a rotation reminder on the calendar. A new pipeline on GitHub Actions or GitLab gets the OIDC policy.
