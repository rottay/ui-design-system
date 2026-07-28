# W-B state (dual-mode BrandTheme contract, Codex C6.1)

## Step 0 — verify + measure (DONE)

### Porcelain law
Target areas were **clean at Phase 0** (`grep` over `phase0-uids-porcelain.txt` for
`brand-theme|brand-themes|artifact-renderer|facade/artifacts|composition/tenants/themes`
returns nothing). They are dirty **only from W1 of this same wave** — W1's output is my
declared input. No Kimi-WIP file is in my write scope. Not a stop condition.

Pre-edit porcelain (`git status --porcelain`, ui-design-system):
```
 M packages/core/src/foundation/contracts/composition/tenants/themes/index.ts
 M packages/core/src/foundation/tokens/css/facade/artifacts/{bithire,evnto,rottay}/_source/extension.css
 M packages/core/src/foundation/tokens/css/facade/artifacts/{bithire,evnto,rottay}/index.css
 M packages/core/src/foundation/tokens/ts/presentation/brand-themes/{bithire,evnto,platform}/index.ts
 M packages/core/src/infrastructure/compilers/kernel/runtime/brand-theme/index.ts
 M packages/core/src/infrastructure/compilers/kernel/runtime/brand-theme/tests/{i0-inventory,premium-regression}.test.ts
 M packages/core/src/infrastructure/compilers/runtime/tenant-css/artifact-renderer/index.ts
?? packages/core/src/infrastructure/compilers/kernel/runtime/brand-theme/tests/mandatory-font-fallback.test.ts
?? packages/core/src/infrastructure/compilers/runtime/tenant-css/artifact-renderer/tests/
```

### Builder status
- `node packages/core/scripts/build-vertical-artifacts.mjs --check` → **GREEN** (exit 0).
  dist WAS rebuilt after W1, so the real script is usable as of now.
- `r1p/scripts/build-artifacts-from-source.mjs --check` → **GREEN** too. Both builders
  reproduce all three committed artifacts byte-identically, so the source builder remains a
  validated stand-in once my compiler edit makes dist stale again.
- Pre-WB snapshot of the 3 artifacts + 3 extensions + 3 BrandThemes:
  `r1p/closure/wb-snapshot/` (shasums recorded). This is the acid-test baseline for W-B:
  HEAD-vs-now already carries W1's authorized deltas, so **my** target is
  snapshot-vs-now = ZERO in every state.

### Measurement of the three authored mode blocks
`r1p/scripts/wb-analyze-modes.mjs` + `wb-coverage.mjs` + `wb-probe-contract.mjs`
(the Round 3 probe only walked leaves the theme already set, so it under-reported
capability; `wb-probe-contract.mjs` probes the UNION of every leaf across all 3 themes +
4 fixtures against each vertical = "can this contract carry this channel").

| vertical | mode block | decls | reachable verbatim | derived-only (ramp steps) | unreachable |
|---|---|---:|---:|---:|---:|
| bithire | `[data-theme=dark]` | 191 | 84 | 31 | 75 |
| evnto | `[data-theme=dark]` | 83 | 62 | 0 | 20 |
| rottay | `[data-theme=light]` | 959 | 214 | 73 | 671 |

Of the compiler-owned decls, value-identical-to-base (pure redundancy, AD-2 violation
"mode-block redeclares the DEFAULT mode's channels"): bithire 17, evnto 19, rottay 44.

Rottay's 959 (not the 1,747 quoted in the brief — that figure is the WHOLE extension;
the mode-block region itself is 959).

### Classification decision
`ramps` derivation couples a seed field to 10 ramp channels, so authoring a dark seed
re-derives ramps that the hand blocks pinned by hand. That is the one genuine contract
gap blocking a value-preserving migration → **explicit typed ramp overrides**.

Contract additions (each 1:1 to exactly one channel, so migration is verbatim):
- `BrandPalette`: hover seeds (3), ink (3), grounds (5), separators (4), links (3),
  interactive (4), status surfaces (8), `ramps` (closed role × closed step).
- `BrandSurfaces.borderRadius.full`.
- `BrandSidebarChrome`: group spacing/border + item indent (5).
- `BrandTheme.modes` — the dual-mode overlay itself.

NOT added (left as declared capability-gap with owner+retire, reported as residue):
- product vocabulary — `--ds-candidate-*` (12), `--ds-job-*` (8), `--ds-interview-*` (8),
  `--ds-evnto-*` (3): "No product semantics in the DS".
- dead legacy aliases whose canonical twin is the consumed one (consumer census via
  `wb-consumers.sh`): `--ds-input-text` (0 consumers vs `--ds-input-color` 23),
  `--ds-input-placeholder` (0 vs 11), `--ds-input-focus-border` (0 vs 20),
  `--ds-table-row-hover` (0 vs `--ds-table-row-bg-hover` 5), `--ds-sidebar-active-*` (0),
  `--ds-color-accent-live*` (0). Adding contract fields would enshrine the duplicate.
- rottay's 671-channel Ant component-token layer (`--ds-select-*`, `--ds-upload-*`,
  `--ds-tag-*`, `--ds-avatar-*`, …). Typing 671 component fields would move Codex's
  "second UI system" into TypeScript rather than remove it.

## Steps 1-3 — contract + compiler + renderer (DONE)

Contract (`foundation/contracts/composition/tenants/themes/index.ts`):
- `BrandThemeMode`, `BrandThemeModeOverlay`, `BrandThemeModes`, `BrandTheme.modes?`.
  The overlay is a DEEP PARTIAL of the semantic families (`palette` is `Partial<>`
  only because `primaryColor` is required; the other three families are already
  all-optional, so they are their own deep partials). No `Record<string,string>`.
- `BrandRampRole` (8, incl. authored-only `neutral`) x `BrandRampStep` (10) ->
  `BrandColorRamp` / `BrandColorRamps`; `BrandPalette.ramps?`.
- 30 extended palette fields (hover seeds 3, ink 3, grounds 5, separators 4,
  links 3, interactive 4, status surfaces 8), each 1:1 to ONE channel.
- `BrandSurfaces.borderRadius.full`; `BrandSidebarChrome` +5 (group spacing/border,
  item indent).
- `CompiledBrand.modeBlocks?` + `CompiledBrandModeBlock`.

Compiler (`compilers/kernel/runtime/brand-theme/index.ts`):
- `mergeModeOverlay` / `applyModeOverlay` / `compileModeBlocks`. Each authored mode
  is merged over the base theme and run through the SAME family compilers
  (`brandThemeToCssVariables` + `brandThemeToChromeVariables`); the block keeps only
  the channels whose value differs from base. Zero per-vertical branches.
- Fail-closed: authoring `modes.<defaultMode>` throws.
- AD-6 guard now also runs over each mode block's own emission.
- `brandModeSelector()` is the single source for the mode selector, consumed by the
  compiler's `cssString` and by the artifact renderer.
- `deriveTenantColorRamps` applies `palette.ramps` over the derived ramp.

Renderer: `modeBlocks` input -> one `/* === Compiled from BrandTheme.modes.<m> === */`
section per mode, emitted between the base block and the residual extension.

BACKWARD-COMPAT PIN verified BEFORE migrating: with no `modes` authored, the source
builder reproduced all three committed artifacts byte-identically (`--check` green).

## Step 4 — migration (DONE)

| vertical | mode | block decls | dropped | migrated | ramp pins | residue |
|---|---|---:|---:|---:|---:|---:|
| bithire | dark | 191 | 22 | 139 | 41 | 30 |
| evnto | dark | 83 | 20 | 52 | 66 | 11 |
| rottay | light | 959 | 48 | 286 | 0 | 625 |

Zero `kind=mode-block` regions remain in any extension. Residue regions carry
`kind=capability-gap` + owner + reachability + retire, and have ZERO overlap with
BOTH the compiled base block and the compiled mode block (`wb-overlap.mjs`).

RAMP PINS: a mode overlay that moves the ground re-derives every ramp the hand block
did not pin. AD-1 says the shipping value is canonical, so each such step is pinned to
its shipped value. Deleting a pin later returns that role to the OKLCH derivation --
a sighted decision, not an architectural one.

BONUS (the brief's "77 -> near zero"): rottay's 77 default-state capability-gap
overlaps were 70 hand-tuned ramp steps that had nowhere to live before
`palette.ramps`. Adopted into the platform BrandTheme base body; extension
declarations deleted. **77 -> 7** (3 font `var()` indirections + `--ds-color-info`,
`--ds-color-error`, `--ds-color-bg-input`, `--ds-card-shadow-elevated`).
Provenance-gate outstanding debt 822 -> 752, no growth.

## Step 5 — acid test (DONE)

Baseline = pre-WB snapshot (`wb-snapshot/`), NOT HEAD: HEAD-vs-now would fold in W1's
authorized deltas. Per state, snapshot vs now:

```
bithire default +0 -0 ~0 | light +0 -0 ~0 | dark +0 -0 ~7
evnto   default +0 -0 ~0 | light +0 -0 ~0 | dark +0 -0 ~3
rottay  default +0 -0 ~0 | light +0 -0 ~8 | dark +0 -0 ~0
```

ZERO added, ZERO dropped, 18 changed — machine-classified (`wb-classify-deltas.mjs`)
into exactly two classes with **0 unexplained**:

1. **alias-follows-field (11)** — every one VERIFIED to have been showing the
   DEFAULT mode's value in a non-default state, because the hand block set one
   channel of a field that emits several. bithire dark painted a LIGHT ground on
   `--ds-color-bg` / `--ds-color-background` / `--ds-color-bg-input` while
   `--ds-color-bg-primary` was dark; evnto dark the same on 3; rottay light showed
   DARK card borders/shadow on 5. A single-source typed contract cannot reproduce
   the skew — that is what makes it single-source.
2. **font restoration (7)** — bithire dark (4) and rottay light (3) restated
   `--ds-font-family-*` without the mandatory `"Noto Sans Arabic"` fallback
   (bithire also discarded its Public Sans / Space Grotesk font-pack identity;
   rottay's stack was otherwise byte-identical). Same regression class W1
   adjudicated for evnto under AD-1; the AD-6 guard now makes it unrepeatable.

## APCA

Ramp check extended to mode blocks: each block is validated against ITS OWN ground
(`--ds-color-bg-primary` from the block, falling back to base), over base+block merged.
This surfaced 16 pairings that ALREADY ship and that an architecture wave may not
silently repaint, so a decrease-only baseline was added
(`scripts/build-vertical-artifacts.apca-baseline.json`, owner + retire):
- 12 mode-block: bithire dark accent/success/warning/error-900 + info-900; evnto dark
  all 7 roles' -900. Cause: an unpinned ramp inherits the base block's light-ground
  values into a dark state, where -900 is invisible.
- 4 rottay base: success/warning/error/info-900, newly visible because the hand ramp
  moved out of the extension into `palette.ramps`.
Anything not on the list fails the build — demonstrated live: the 4 rottay entries went
RED before being recorded.

## Step 6 — tests

NEW: `brand-theme/tests/mode-overlay.test.ts` (12), `artifact-renderer/tests/mode-blocks.test.ts` (5).
Covers: no-modes emits nothing (backward-compat pin); base block byte-identical when a
mode is added; typed seed edit reaches the artifact's dark block (drill: unedited theme
does not contain the value); mode block restates NO base channel; selector one attribute
above base; deep merge keeps siblings; default-mode overlay throws; AD-6 guard on mode
type; authored ramp step wins while the rest keeps deriving; authored-only `neutral`.

RE-ANCHORED (behavioral reason, not baseline-widening):
- `i0-inventory.test.ts` — 8 assertions asked "is this channel restated INSIDE the dark
  block". A delta block makes that the wrong question; they now assert the EFFECTIVE
  value via a new `modeEffective()` helper, which is what they were trying to prove.
- `color-ramps.test.ts` — rottay's authored steps are any CSS color (its success-50 is
  an alpha tint), so the hex-shape assertion now applies to DERIVED steps only; the
  step-900 APCA assertion now pins the exact 4 known-failing status ramps.
- `first-party-artifacts-generated.test.ts` — the authored-owner count now includes the
  compiled mode selectors (a mode block IS authored, in the BrandTheme).
- `premium-regression.test.ts` — `--ds-table-header-color` #A0A0A5 -> #B3B3B8. **NOT
  MINE**: bisected (`wb-diag`/probe4) with `modes` AND `palette.ramps` removed, value is
  still #B3B3B8. Cause is W2's AD-4 §4 change making the LEGACY visual-config path run
  `enforceTextContrast` over the final composed map. Re-anchored because the test lives
  in my file area; flagged for orchestrator adjudication.

## Verification run (one command at a time)

| command | result |
|---|---|
| `vitest run .../brand-theme/tests/mode-overlay.test.ts` | 12 passed |
| `vitest run .../artifact-renderer/tests/` | 13 passed (2 files) |
| `vitest run .../brand-theme/tests/` | 632 passed (16 files) |
| `vitest run src/foundation/tokens/__tests__/` | 126 passed (16 files) |
| `vitest run whitelabel-field-coverage + host-tenancy-boundary + cascade-layers` | 70 passed |
| `vitest run .../composition/tenant-theme/tests/` | 130 passed (8 files) |
| `node --test scripts/artifact-provenance-gate.test.mjs` | 23 passed |
| `node scripts/artifact-provenance-gate.mjs` | GREEN, no debt growth |
| `build-artifacts-from-source.mjs --check` | GREEN (3/3) |
| `node scripts/build-vertical-artifacts.mjs --check` | **RED — dist stale (expected)** |

## BLOCKER for W4 (re-opened)

`scripts/build-vertical-artifacts.mjs --check` is RED because dist/ predates my compiler
change. It fails LOUDLY (reports the artifacts as out of sync) rather than silently
regenerating with the old compiler. W4's serial chain must run
`pnpm -C packages/core build` before any dist-backed gate. Source equivalence is proven:
the source builder reproduced all three committed artifacts byte-identically BEFORE the
migration and is green now.

## Files touched (all clean at phase 0; none in Kimi's WIP census)

In declared scope:
- `foundation/contracts/composition/tenants/themes/index.ts`
- `foundation/tokens/ts/presentation/brand-themes/{bithire,evnto,platform}/index.ts`
- `foundation/tokens/css/facade/artifacts/{bithire,evnto,rottay}/_source/extension.css`
- `foundation/tokens/css/facade/artifacts/{bithire,evnto,rottay}/index.css` (regenerated)
- `infrastructure/compilers/kernel/runtime/brand-theme/index.ts` + tests
  {color-ramps, i0-inventory, premium-regression}.test.ts + NEW mode-overlay.test.ts
- `infrastructure/compilers/runtime/tenant-css/artifact-renderer/index.ts`
  + NEW tests/mode-blocks.test.ts

Outside declared scope, DECLARED (each verified clean at phase 0 and absent from
phase0-uids-porcelain.txt):
- `scripts/build-vertical-artifacts.mjs` — APCA over mode blocks + baseline read
  (W1 also edited this file under the same judgment)
- `scripts/build-vertical-artifacts.apca-baseline.json` — NEW
- `infrastructure/compilers/kernel/foundation/css/chrome-variables/index.ts` — +5
  sidebar field emissions; without it the 5 new contract fields would type-check and
  emit nothing (a silently inert field, the exact defect class Round 3 flagged)
- `foundation/tokens/__tests__/first-party-artifacts-generated.test.ts` — owner-count
  re-anchor forced by the renderer change
