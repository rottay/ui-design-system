# Methodology

## Audit Inputs

This audit combines:

- direct repo inspection
- previous audit tracks already present in `packages/core/docs`
- 10 specialist agent passes

The 10 specialist passes were:

| Agent | Focus |
|---|---|
| Euclid | runtime / theming / tenant precedence |
| Pasteur | Modern inputs / forms |
| Tesla | Modern foundation / display / layout |
| Mill | Modern navigation / feedback / overlay / patterns |
| Copernicus | `brandTheme`, `appearance`, premium compiler pipeline |
| Carver | hooks / system integration |
| Boyle | Rotate / `app-platform` host integration |
| Arendt | cross-vertical coherence across `app-platform`, `app-evnto`, `app-bithire` |
| Poincare | docs / tests / guardrails / taxonomy hygiene |
| Galileo the 2nd | performance / accessibility / resilience / security-adjacent concerns |

## Scoring Scale

| Score | Meaning |
|---|---|
| 9-10 | Strong, honest, production-grade, low ambiguity |
| 7-8 | Healthy and shippable, but with visible debt |
| 5-6 | Functional but materially incomplete or drift-prone |
| 3-4 | Partial, inconsistent, or mostly declarative |
| 1-2 | Broken, misleading, or effectively unused |

## Rating Rules

Each score is based on rendered/system behavior, not on declared contract size.

We scored higher when:

- the runtime path is real
- the token path is canonical
- the same contract works across apps/hosts
- the behavior is testable and documented honestly

We scored lower when:

- the contract is wider than the implementation
- the implementation bypasses its own token/bridge path
- the app host owns visible styling that should belong to DS
- runtime DB tenants use a different model than bundled tenants
- docs/tests still tell an older story

## Working Definitions

### Bundled first-party verticals

These are code-owned product identities shipped with the repo:

- `rottay` / platform
- `evnto`
- `bithire`

For these, the ideal source of truth is:

`tenantSlug -> DS registry / bundled CSS / brandTheme / product profile`

### Runtime DB tenants

These are unknown-at-build-time tenants created while the app is already running.

For these, the ideal MVP contract is smaller:

- `branding` identity
- `appearance.general` core fields
- locale
- optional `vertical`

Advanced premium styling should only be available if explicitly supported and validated, not assumed.

## Important Constraint

This audit intentionally treats `Modern` as the primary MVP engine, not as one engine among equals. That changes the grading bar:

- Modern debt is weighted heavily
- Classic-only examples lower trust when they live in host docs/showrooms
- cross-engine neutrality is secondary to Modern truthfulness

## Evidence Style

Most findings in this folder cite file paths rather than reproducing large code excerpts. The repo already contains large historical tracks; this audit tries to synthesize rather than duplicate them.
