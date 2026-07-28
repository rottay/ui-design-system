# W-T · Negative architecture tests for the tenant-first product rule

State: all five implemented and green. Focal single-file vitest runs only, one at
a time. No suites, no builds, no typecheck, no git operations. Every file below
is NEW and untracked; no pre-existing file was modified.

Product rule under test: colors always come from the tenant (BrandTheme static /
Appearance DB); Modern consumes semantic channels and owns no light/dark
identity; rottay dark is a dark palette; no tenant value is a global default; no
component knows a tenant slug; no manual extension beats tenant config.

## Files and results

| # | Test | File | Result |
|---|------|------|--------|
| 1 | MODERN-TENANT-VALUE-FREE | `packages/core/src/foundation/tokens/__tests__/modern-tenant-value-free.test.ts` | 5/5 pass |
| 2 | SLUG-NEUTRAL COMPILER | `packages/core/src/infrastructure/compilers/runtime/tenant-css/artifact-renderer/tests/slug-neutral-values.test.ts` | 9/9 pass |
| 3 | STATIC/DB SAME VOCABULARY | `packages/core/src/infrastructure/compilers/composition/tenant-theme/tests/static-db-channel-vocabulary.test.ts` | 7/7 pass |
| 4 | TENANT-COLOR PROPAGATION | `packages/core/src/infrastructure/compilers/kernel/runtime/brand-theme/tests/tenant-color-propagation.test.ts` | 11/11 pass |
| 5 | EXTENSION-CANNOT-BEAT-TENANT | `packages/core/src/infrastructure/compilers/runtime/tenant-css/artifact-renderer/tests/extension-cannot-beat-tenant.test.ts` | 9/9 pass |
| — | shared detector (not a test file) | `.../artifact-renderer/tests/support/index.ts` | used by #4 and #5 |

Existing `.../brand-theme/tests/no-vertical-branch.test.ts` re-run unmodified:
3/3 pass.

Total: 41 assertions across five files.

## Pinned inventories

### #1 — tenant literals declared outside the tenant

- Modern engine CSS tree (`foundation/tokens/css/runtime/engines/modern/**`,
  122 files): **0**. Pinned as a hard floor, not a ratchet — there is nothing to
  drain, so there is no budget to spend.
- `foundation/tokens/css/foundation/themes/default.css`: **43** entries,
  decrease-only. This is the entire debt, and it is the "no tenant value may be
  a global default" violation verbatim.
  - Vertical identity (8): `#0c0c0e` `#0d0d10` `#18181c` `#6b6b72` `#a0a0a5`
    `#475569` `#7a6a5a` `#f8fafc` — rottay's canvas and neutrals shipped as
    everyone's default ground.
  - Semantic ramps (35): green/amber/red/blue steps plus three `rgba(...)` tints
    the BrandThemes also author.
- Corpus: 366 distinct non-achromatic literals across the three BrandThemes
  (palette bodies + `modes` overlays). Achromatic values (r=g=b, `transparent`,
  zero-chroma oklch) are excluded as non-identifying; untokenized neutral paint
  is the `engine-token-audit` gate's concern, not this one.

### #3 — static vs DB channel vocabulary

Set relation, measured on a maximal advanced customer document for bithire:

- static (`compileBrandTheme`): **1024** channels
- DB (`compileTenantThemeConfig`): **126** channels, **104** in core families
- DB-only within core families: **5** (pinned, decrease-only, target is zero)
  - `--ds-color-text-on-primary`, `--ds-layout-header-height`,
    `--ds-shell-header-block-size`, `--ds-shell-sidebar-width`,
    `--ds-sidebar-width`
  - Two of these (`--ds-shell-sidebar-width`, `--ds-color-text-on-primary`)
    reach the bithire artifact only through its declared extension — the same
    finding from the other side: the typed contract cannot express them, so both
    paths reach outside it.
- static-only within core families: **540** (expected; the DB path is bounded)
- DB-only overall: 22 (adds chart series, elevation, motion, density scalars)

Per-family depth (customer / vertical): color 79/91 · border 5/121 ·
text 4/60 · surface 1/22 · chrome 25/421. All five exercised on both sides, so
the subset assertion is not vacuous.

Families are matched semantically, not by prefix: this system has no
`--ds-border-*` or `--ds-text-*` root namespace (borders are
`--ds-color-border`, `--ds-surface-border-strong`, `--ds-sidebar-border`).

### #5 — same-reachable-state re-declarations

**9** pinned, decrease-only — reproduces `artifact-provenance-gate` exactly
(bithire 2, evnto 0, rottay 7):

- `bithire :: --ds-color-bg-primary`, `--ds-surface-card-border-strong`
- `rottay :: --ds-card-shadow-elevated`, `--ds-color-bg-input`,
  `--ds-color-error`, `--ds-color-info`, `--ds-font-family-base`,
  `--ds-font-family-display`, `--ds-font-family-heading`

**The "green NOW post-drain" premise in the task is false.** The drain is not
complete. These 9 survive under declared `capability-gap` headers and are
grandfathered by channel name in the gate baseline, which is why the committed
tree is green while the property is not yet true.

### #4 — propagation reach

Reach that exists (asserted as floors):

| seed | path | channels moved |
|---|---|---|
| primary | static bithire | 11 (ramp only) |
| primary | DB document | 21 (ramp + 10 chart series) |
| background | static bithire | 39 (grounds + ramp tint re-derivation) |
| background | DB document | 25 |

Reach that does NOT exist — pinned as `KNOWN_INERT_UNDER_PRIMARY`, and the test
goes RED when any of it is fixed so the pin comes out in the same change:

- button primary chrome, focus ring, links, cards, inputs

Each is verified to be a real, populated part of the compiled vocabulary before
inertness is asserted, so the assertion is not vacuous. Confirmed on all three
paths (static bithire 1024 channels, a palette-only theme 161, DB document 45).

## Drills

| # | Drill | Outcome |
|---|---|---|
| 1 | rottay canvas + bithire primary planted into a temp copy of `skin/card.css` | detected; undrilled donor asserted clean in the same test |
| 2 | slug-conditional value planted downstream of `compileBrandTheme` | rename-equality and per-block declaration comparison both go red |
| 3 | one emitted channel renamed in a compiled DB result | reported as DB-only, and distinguished from the 5 ambient divergences |
| 4 | extension literal freezes `--ds-color-primary-500` while its seed moves | served default-state value frozen at the plant; flagged by the shared detector; clean-extension control tracks the seed and is not flagged |
| 5 | base-state re-declaration planted for each of the three verticals | detected for all three; plus proof the planted value is the one that would paint (later in file at equal reach) |

## Coverage verdict on #2

`no-vertical-branch.test.ts` **already covers** the two things the task asked
about, and covers them well: `compileBrandTheme` output invariance under slug
swap (including the strong form — compiling bithire's theme under evnto's slug
reproduces bithire's output channel for channel), and a source scan proving the
compiler names no vertical outside comments.

Its gap is scope, not rigor: it stops at the channel map. Everything downstream
— the artifact renderer, the scope projection, the DB path — is unasserted, and
a slug-conditional planted in any of them leaves all three of its assertions
green while the shipped CSS still differs per vertical. Covered by the new
sibling file rather than by editing the existing one (the tree is shared with
concurrent agents). New coverage:

- values are slug-invariant across three themes and two synthetic tenants
- renaming one tenant into the other reproduces the artifact byte for byte
- every line that differs between two tenants is a prelude or header, never a
  declaration
- the slug reaches mode blocks only through `brandModeSelector`
- `projectFirstPartyArtifactScopes` rewrites preludes only: a declaration value
  containing the owned selector is preserved, and another tenant's rules are
  untouched
- the DB path compiles identical `variables` under two slugs while `scopes` and
  `digest` differ

## Notes for the lead

1. **#5's premise was wrong** — 9 same-state re-declarations survive. See above.
2. **#4 found the largest gap in the wave.** A tenant's primary color reaches
   its ramp and nothing else. Buttons, focus ring, links, cards and inputs
   follow the theme only when a BrandTheme author restates them by hand in
   `chrome` — which is the "manual layer outranks the tenant seed" shape the
   extension law forbids one tier down, reappearing one tier up. The DB path has
   the same gap, so a customer moving their brand color in the admin UI does not
   move their buttons.
3. **The Modern engine is clean** on tenant literals (0 of 366 across 122
   files). The whole leak is `foundation/themes/default.css`.
4. **#5 is stricter than the gate, deliberately.** The gate asks whether a rule
   matches the DEFAULT mode; this asks whether the extension and the compiled
   side overlap in ANY state. For a dark-default vertical whose base block is
   unconditional, a light-gated extension re-declaration beats the compiled
   light mode block and the gate would not report it. No such case exists today
   — the inventories agree at 9 — but the mechanic is pinned by an explicit test
   so the difference is recorded rather than latent.
5. All three committed artifacts verified fresh (`build-vertical-artifacts.mjs
   --check`); none of the findings above is a staleness artifact.
