# Candidates same-tree tenant capability — Codex sighted audit

Date: 2026-08-03
Status: `CAPABILITY_ACCEPTED_PRODUCT_CRAFT_REJECTED`

## Question under test

Can the existing Rottay tenant contract make BitHire and The Management look materially different
while rendering the same production Candidates route-loader tree, without tenant branches, manual
root-attribute spoofing or app-authored theme CSS?

## Verdict

Yes for platform capability; no for finished product quality.

The same tree now visibly diverges through palette, body/display typography, type scale, density,
elevation/effect, sidebar tone and four canonical anatomy selections (`card=underline`,
`table=open`, `sidebar=panel`, `layout=floating`). Color is not the only differentiator. The
architecture is therefore capable enough to release a bounded Candidates product-design wave.

The rendered product is not yet premium. Listing is usable, Detail is serviceable, and Overview
mobile remains visibly weak: the stacked deck consumes space poorly and reads as layered cards
rather than an intelligent responsive composition. Several important component channels also
resolve identically across tenants, so this evidence does not claim that every family is tenant-
expressive.

Sighted scoring on this evidence:

- tenant capability / wiring: **8.5/10**;
- visible tenant divergence: **7.5/10**;
- current Candidates craft: **6–6.5/10**;
- responsive safety: **pass for horizontal overflow at 390/768/1440**, premium composition fail.

## Corrections required before the sighted pass

1. The local canary lost its Candidates authorization after client hydration and redirected to
   `/home`. It now inherits the real `ROUTES.CANDIDATES` permission.
2. The runtime branding refresh attempted the real The Management database after hydration. The
   proxy now continues the fixture identity only for the exact same-origin branding request, and
   strips caller-supplied canary headers first.
3. The The Management DB document described structural divergence in prose but authored no
   `visualFoundation.advanced.chrome` selection. It now selects four existing canonical anatomy
   axes. No public token or tenant-specific CSS branch was added.

## Capture matrix

All captures render `/canary/candidates` with the production Listing, Overview and Detail route
loaders. The authenticated session, data loaders, tenant validator, compiler, SSR style artifact,
root projection and hydration remain in the path.

| Scene | Tenant | Viewports |
|---|---|---|
| Listing | `bithire-static` | 1440×1000, 768×1024, 390×844 |
| Listing | `themanagement-db` | 1440×1000, 768×1024, 390×844 |
| Overview | `bithire-static` | 1440×1000, 768×1024, 390×844 |
| Overview | `themanagement-db` | 1440×1000, 768×1024, 390×844 |
| Detail | `bithire-static` | 1440×1000, 768×1024, 390×844 |
| Detail | `themanagement-db` | 1440×1000, 768×1024, 390×844 |

The PNG files beside this report are the normative sighted evidence for this pass. `SHA256SUMS`
pins their exact bytes.

## Mechanical reproduction

- app canary focal tests: 4 suites / 26 tests, exit 0;
- app typecheck: exit 0;
- scoped app ESLint: exit 0;
- Candidates boundary gate: 22/22 conforming, exit 0;
- detail-chrome fence: 317/317 and 399/399 ceilings unchanged, exit 0;
- DS tenant-theme focal tests: 2 files / 34 tests, exit 0;
- DS fixture freshness: exit 0;
- DS typecheck: exit 0;
- app and DS `git diff --check`: exit 0.

## Binding next move

Release Kimi to one product scene at a time: **Detail, then Listing, then Overview**. The objective
is product composition and craft, not another token inventory. Kimi may use the existing tenant
axes and private `--_ds-proto-*` proposals with byte-identical fallbacks, but may not add tenant
branches, root writers or public `--ds-*` tokens. Codex re-captures both tenants at all three
viewports and accepts each scene at 8/10 before the next scene propagates.
