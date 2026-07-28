# W-C · tenant propagation (KNOWN_INERT_UNDER_PRIMARY drain)

## Step 0 — baseline, scope porcelain, freshness

Porcelain (per-file, before any edit) — all ours-dirty from this program:

```
 M packages/core/src/infrastructure/compilers/kernel/foundation/css/chrome-variables/index.ts
 M packages/core/src/infrastructure/compilers/kernel/runtime/brand-theme/index.ts
 M packages/core/src/infrastructure/compilers/kernel/runtime/brand-theme/tests/color-ramps.test.ts
 M packages/core/src/infrastructure/compilers/kernel/runtime/brand-theme/tests/i0-inventory.test.ts
 M packages/core/src/infrastructure/compilers/kernel/runtime/brand-theme/tests/premium-regression.test.ts
?? .../tests/mandatory-font-fallback.test.ts  mode-overlay.test.ts  no-vertical-branch.test.ts
?? .../tests/sidebar-group-channels.test.ts   tenant-color-propagation.test.ts
```
`kernel/runtime/appearance/**` — clean.

Freshness, both builders, BEFORE any edit:
* `node scripts/build-vertical-artifacts.mjs --check` (dist compiler) → all 3 up to date, exit 0
* `node .../r1p/scripts/build-artifacts-from-source.mjs --check` (src compiler) → all 3 up to date, exit 0

So dist and src agree with the committed artifacts at the starting line.

Effective BEFORE snapshot (scratchpad `wcprop-effective-BEFORE.json`):
`bithire 1381/1381/1291 · evnto 383/383/347 · rottay 1172/1155/1172` (default/light/dark).

## Step 1 — inventory: what the families contain today

Compiled `cssVariables` per path (`scratchpad/wc-inventory.mjs`):

| family | bithire | evnto | rottay | DB path |
|---|---:|---:|---:|---:|
| primary ramp | 11 | 11 | 11 | 11 |
| chart series | 0 | 0 | 0 | 10 |
| grounds | 4 | 4 | 1 | 0 |
| button primary chrome | 5 | 5 | 7 | 0 |
| focus ring | 8 | 0 | 1 | 0 |
| links | 1 | 0 | 3 | 0 |
| cards | 168 | 5 | 21 | 0 |
| inputs | 137 | 10 | 32 | 0 |

Key finding that makes the acid winnable: the channels the derivation wants
(`--ds-color-link*`, `--ds-focus-ring-color`, `--ds-color-bg-surface`,
`--ds-button-primary-bg-active`) are already declared by the **artifact
extension block**, which is emitted AFTER the compiled block and at strictly
higher specificity
(`:is(html[data-tenant="x"], …):not([data-theme="dark"]):not(.dark)` = (0,3,1)
vs the compiled `:is(html[data-tenant='x'], …)` = (0,1,1)).
A derived default emitted into the compiled block is therefore shadowed for the
three shipped verticals — zero effective change — while a palette-only fixture
theme (no extension, no authored chrome) receives it.

`compileModeBlocks` re-runs `brandThemeToCssVariables` on the mode-merged
theme, so derivations are mode-aware for free and only surface in a mode block
when they actually move.

## Step 2 — the shared derivation module

New file (the only new one):
`packages/core/src/infrastructure/compilers/kernel/foundation/css/palette-derivations/index.ts`
exported from the `foundation/css` barrel. It is the SINGLE derivation
authority for both compile paths, which is what stops the two from drifting.

Wired in at the TOP of each compiler's palette block, so every authored layer
outranks it:

* `runtime/brand-theme` — `derivePaletteSemantics(...)` is the first thing
  written into `vars` inside `if (bt.palette)`. The palette literals below
  restate their own channels, and `compileBrandTheme` merges
  `{...paletteVars, ...chromeVars}`, so authored chrome is last and wins.
* `runtime/appearance` — same call at the top of `if (general.palette)`, per
  mode half, combined by `mergeDerivedModeHalves` (a channel whose halves agree
  stays one mode-blind value; only real divergence becomes `light-dark()`).
  General's own `setColor` calls and the Advanced tier both merge after, and
  `enforceTextContrast` still runs last in `compileAppearanceVariables`.
* the appearance compiler's private `deriveSurfaces` ladder was DELETED and its
  two call sites now use the shared `deriveGroundLadder`, so the ground math is
  literally one implementation. `mixColor`/`isDarkSurface` imports dropped with it.

**The var()-chain decision (load-bearing).** First cut emitted resolved literals
and produced 52 effective deltas. Root cause: a computed literal differs between
modes, so `compileModeBlocks` duplicates it into the dark block at
`html[data-tenant='x'][data-theme='dark']` = (0,2,1), which OUT-SPECIFIES an
un-moded artifact extension at (0,1,1) — the compiler silently outranked
authorship the tenant already owned. Emitting seed-valued channels as `var()`
chains makes the string mode-invariant, so `compileModeBlocks` (which keeps only
channels whose value moves) leaves it in the base block and it re-resolves per
mode. That single change took the delta 52 → 24.

Derived channels, final set (16):

| from primary | from background |
|---|---|
| `--ds-button-primary-bg` → `var(--ds-color-primary)` | `--ds-color-bg-secondary` (ladder) |
| `--ds-button-primary-border` → `var(--ds-color-primary)` | `--ds-color-bg-tertiary` (ladder) |
| `--ds-button-primary-bg-hover` (OKLCH shade) | `--ds-color-bg-elevated` (ladder) |
| `--ds-button-primary-color` → `var(--ds-color-text-on-primary)` | `--ds-color-bg-input` (ladder) |
| `--ds-color-text-on-primary` (readable ink) | `--ds-card-bg` → `var(--ds-color-bg-elevated)` |
| `--ds-color-border-focus` → `var(--ds-color-primary)` | `--ds-input-bg` → `var(--ds-color-bg-input)` |
| `--ds-input-border-focus` → focus alias | `--ds-table-header-bg` → `var(--ds-color-bg-secondary)` |
| `--ds-input-shadow-focus` (wash of focus) | |
| `--ds-color-link` → `var(--ds-color-primary)` | |

Hover-shade direction is keyed to the SEED's own lightness, not the ground —
that is the only rule that reproduces all three shipped verticals (bithire
#3A6FB0→#2C5587 darkens on a light ground; evnto #171717→#262626 lightens on a
WHITE ground; rottay #FFFFFF→#E0E0E0 darkens on a BLACK ground).

## Step 3 — acid, and the channels STOPPED to win it

`scratchpad/wc-acid.mjs` renders all three artifacts from the EDITED source and
diffs the effective map against the pre-edit snapshot.

```
bithire default/light/dark  +0 -0 ~0
evnto   default/light        +0 -0 ~0
evnto   dark                 +1 -0 ~0   (--ds-color-link)
rottay  default/light/dark   +0 -0 ~0
TOTAL EFFECTIVE DELTA = 1
```

The one residual is identity-proven, not a repaint: `themes/default.css:225` is
the ONLY declaration of `--ds-color-link` in the whole DS tree, it sits in
`:root`, and its value is byte-identical to what the derivation emits
(`var(--ds-color-primary)`). evnto's extension declares its link inks in a
light-gated block only, so in dark the channel simply moves from the `:root`
copy of the same expression to the tenant copy of the same expression. The
resolved color cannot change.

STOPPED — derived correctly, NOT shipped, each repaints a shipped vertical:

| channel | proposed | DS default it would displace | who it repaints |
|---|---|---|---|
| `--ds-focus-ring-color` | `var(--ds-color-border-focus, var(--ds-color-primary))` | `#ECECEC` / `var(--ds-color-primary-400)` | bithire + evnto DARK (extensions cover light only) |
| `--ds-shadow-focus-ring` | `0 0 0 3px color-mix(… 24%, transparent)` | `0 0 0 3px var(--ds-color-alpha-primary-20…)` | bithire + evnto, ALL states |
| `--ds-color-link-hover` | OKLCH hover shade | `var(--ds-color-primary-hover)` | evnto dark |
| `--ds-color-link-visited` | chroma-reduced seed | `var(--ds-color-neutral-600)` | evnto dark |
| `--ds-color-interactive-border` | `color-mix(… 40%)` | `var(--ds-color-border-secondary)` | evnto, all states |
| `--ds-color-interactive-bg-hover` | `color-mix(… 8%)` | `var(--ds-color-bg-hover)` | evnto, all states |
| `--ds-color-interactive-bg-active` | `color-mix(… 14%)` | `var(--ds-color-alpha-primary-10)` | evnto, all states |
| `--ds-color-interactive-bg-muted` | `color-mix(… 5%)` | `var(--ds-color-bg-subtle)` | evnto, all states |
| `--ds-color-bg-surface` | ladder lift | `var(--ds-color-bg-secondary)` | evnto, all states |
| `--ds-table-bg` / `--ds-table-row-bg` | `var(--ds-color-bg-surface)` | `#ffffff` | evnto, all states |
| `--ds-button-primary-bg-active` | OKLCH active shade | — | evnto both states; CHANGED bithire dark (mode-block specificity beat the extension) |
| `--ds-color-bg-canvas` | the ground | — | bithire + evnto; also redundant with `--ds-color-bg` |
| `--ds-color-bg-overlay` / `--ds-overlay-bg` | tinted scrim | — | bithire + evnto; the scrim alpha is a design call, not mechanical |

## Step 4 — reach, before vs after

Measured with `scratchpad/wc-reach.mjs`. "moved" = the channel's own compiled
value changed; "reach" = moved, or resolves transitively through a channel that
moved (a `var()` chain propagates even though its text does not change, so
textual movement alone under-counts).

Baseline captured by neutralizing the derivation in place (`WC_NO_DERIVE`
probe, since removed) — ground truth, not reconstruction.

| path / seed | before moved | after moved | before reach | after reach |
|---|---:|---:|---:|---:|
| bithire · primary | 11 | 11 | 36 | 38 |
| bithire · background | 39 | **42** | 73 | **76** |
| fixture · primary | 11 | **12** | 16 | **23** |
| fixture · background | 9 | **13** | 14 | **21** |
| DB · primary | 22 | 22 | (n/a) | 28 |
| DB · background | 25 | 25 | (n/a) | 28 |

Per family, reach under the primary seed (before → after):

| family | bithire | minimal fixture | DB path |
|---|---|---|---|
| button primary chrome | 0 → 0 (chrome pins it — BY DESIGN) | 0 → **3** | 0 → **3** |
| links | 0 → **1** | 0 → **1** | 0 → **1** |
| inputs | 0 → 0 | 0 → **2** | 0 → **2** |
| cards | 5 → 5 | 0 → **1** (under background) | 0 → **1** (under background) |
| focus ring | 2 → 2 | 0 → 0 (STOPPED) | 0 → 0 (STOPPED) |
| grounds (background seed) | 3 → **6** | 3 → **7** | 0 → **7** |

Two honesty notes that belong in the record:

1. bithire's `focus ring = 2` and `cards = 5` were ALREADY non-zero before this
   change — bithire's own authored chrome writes `var(--ds-color-primary)`
   expressions. The original KNOWN_INERT pin was true as written (textual
   movement was 0) but a reach measure would have shown those families were
   already partly connected. My change did not create that.
2. On the bithire path the button/input families still do not move, and that is
   the CORRECT result: bithire authors that chrome by hand and authored chrome
   must outrank a derivation. The propagation win is visible exactly where it
   should be — on a theme that authors nothing.

## Step 5 — two laws bit back; the final shipped set (SUPERSEDES steps 2-4)

Running the focal tests turned up two guards that the step-3 acid could not
see, because both are about AUTHORSHIP, not about pixels. Both were fixed by
removing my competing emission at its source — never by filtering at a merge,
which is what each guard's own message forbids.

**(a) `assertSingleLightEmitter` — one channel, one author.**
`brand-compiler.test.ts` failed with:

```
Tenant "bithire" light block has more than one author for 2 channel(s):
  --ds-color-link         (compiled-brand-theme=var(--ds-color-primary) vs legacy-branding=#0A66C2)
  --ds-color-border-focus (compiled-brand-theme=var(--ds-color-primary) vs legacy-branding=#0A66C2)
```

The legacy-branding emitter in `runtime/tenant-css/visual-config` ALREADY
derives both from the same primary seed. So the `links` family was never inert
on the path that ships it — only in this compiler's own map. Both channels were
dropped from the derivation. `--ds-input-border-focus` /
`--ds-input-shadow-focus` now read THROUGH `--ds-color-border-focus`, so the
focused control still tracks the seed. Removing `--ds-color-link` also took the
last acid delta to zero.

**(b) `EXTENSION-CANNOT-BEAT-TENANT` — 12 new conflicts.**
Deriving the ground ladder produced 4 channels × 3 verticals of same-state
re-declaration:
`--ds-color-bg-secondary`, `--ds-color-bg-tertiary`, `--ds-color-bg-elevated`,
`--ds-color-text-on-primary`.

The extensions author all four by hand with values that differ from any
mechanical derivation (bithire `bg-secondary` `#f3f2ef` warm vs derived
`#eef2f5` cool; rottay `text-on-primary` `#0C0C0E` vs derived `#171717`), so
neither adopting nor deleting them is free. The test's
`KNOWN_SAME_STATE_REDECLARATIONS` is an explicitly **decrease-only** debt
ledger of channels whose "authored BrandTheme value is dead on arrival" —
growing it by 12 would have re-created the very defect this phase exists to
close, one tier down. So the four were dropped from the STATIC path. The DB
path, which has no extension, still emits the full ladder via the shared
`deriveGroundLadder`, and still derives its on-primary ink with the WCAG math
the axe gates grade.

### Final derived set (10 channels)

| from primary | from background |
|---|---|
| `--ds-button-primary-bg` → `var(--ds-color-primary)` | `--ds-color-bg-input` (ladder) |
| `--ds-button-primary-border` → `var(--ds-color-primary)` | `--ds-card-bg` → `var(--ds-color-bg-elevated)` |
| `--ds-button-primary-bg-hover` (OKLCH shade) | `--ds-input-bg` → `var(--ds-color-bg-input)` |
| `--ds-button-primary-color` → `var(--ds-color-text-on-primary)` | `--ds-table-header-bg` → `var(--ds-color-bg-secondary)` |
| `--ds-input-border-focus` → focus alias | |
| `--ds-input-shadow-focus` (wash of focus) | |

### Final acid — ZERO, and stronger than asked

```
bithire default/light/dark  +0 -0 ~0
evnto   default/light/dark  +0 -0 ~0
rottay  default/light/dark  +0 -0 ~0
TOTAL EFFECTIVE DELTA = 0
```

Stronger claim available: the artifacts are **byte-identical**, not merely
effective-identical. `packages/core/scripts/build-vertical-artifacts.mjs
--check` runs the FROZEN dist compiler, which contains none of this work, and
reports all three up to date against the files this phase regenerated. Every
derived channel is fully shadowed by authored chrome for all three verticals.

**dist rebuild NOT required.** Mid-phase (while the ground ladder was still
derived) dist went stale; pruning to the final set restored agreement. Both
builders are green:
* `node packages/core/scripts/build-vertical-artifacts.mjs --check` → 3/3 up to date
* `node .../r1p/scripts/build-artifacts-from-source.mjs --check` → 3/3 up to date

### Final reach

| path / seed | before moved | after moved | before reach | after reach |
|---|---:|---:|---:|---:|
| bithire · primary | 11 | 11 | 36 | 36 |
| bithire · background | 39 | 39 | 73 | 73 |
| fixture · primary | 11 | **12** | 16 | **21** |
| fixture · background | 9 | **10** | 14 | **16** |
| DB · primary | 22 | 22 | — | 26 |
| DB · background | 25 | 25 | — | 28 |

Family reach under its seed (before → after):

| family | minimal fixture | DB path | bithire |
|---|---|---|---|
| button primary chrome | 0 → **3** | 0 → **3** | 0 → 0 (chrome pins it, by design) |
| inputs | 0 → **2** | 0 → **2** | 0 → 0 (same) |
| cards | 0 → 0 (ground authored a tier down) | 0 → **1** | 5 → 5 (pre-existing) |
| grounds (background) | 3 → **4** | 0 → **7** | 3 → 3 |
| links | withheld — owned by the legacy-branding emitter |||
| focus ring | withheld — see stopped list |||

bithire's totals are unchanged, which is the correct result and the same fact
as the byte-identical artifacts: a theme that authors its chrome keeps it.

### Tests

| command | result |
|---|---|
| `vitest run .../brand-theme/tests/tenant-color-propagation.test.ts` | 17 passed |
| `vitest run .../brand-theme/tests/` (19 files) | 657 passed |
| `vitest run .../artifact-renderer/tests/extension-cannot-beat-tenant.test.ts` | 9 passed |
| `vitest run .../artifact-renderer/tests/` | 31 passed |
| `vitest run .../composition/tenant-theme/tests/static-db-channel-vocabulary.test.ts` | 7 passed |
| `vitest run .../kernel/runtime/appearance/tests/` | 71 passed |
| `vitest run .../tenant-css/visual-config/tests/` | 28 passed |

Adversarial check: neutralizing the derivation in place made 6 of the
propagation tests fail, so the new assertions are load-bearing rather than
tautological. The probe was removed (0 occurrences of `WC_NO_DERIVE` remain).

### Files touched

```
NEW  packages/core/src/infrastructure/compilers/kernel/foundation/css/palette-derivations/index.ts
M    packages/core/src/infrastructure/compilers/kernel/foundation/css/index.ts          (barrel)
M    packages/core/src/infrastructure/compilers/kernel/runtime/brand-theme/index.ts
M    packages/core/src/infrastructure/compilers/kernel/runtime/appearance/index.ts
M    packages/core/src/infrastructure/compilers/kernel/runtime/brand-theme/tests/tenant-color-propagation.test.ts
=    the 3 artifacts were regenerated and came out byte-identical
```

`chrome-variables/index.ts` was NOT edited — the derivation got its own folder
because it derives semantic palette channels, not chrome, and a file named for
one responsibility should not quietly acquire the other.

### Recommended follow-up (owner decision, NOT taken here)

Draining the 4 ground channels is mechanical and provably zero-repaint IF done
as a migration rather than an adoption: move each extension literal into the
BrandTheme palette field that already maps to it
(`backgroundSecondaryColor`, `backgroundTertiaryColor`,
`backgroundElevatedColor`, `onPrimaryColor` — all four already exist in
`EXTENDED_PALETTE_CHANNELS`), then delete the extension copy. Same values, so
no pixel moves; the compiled block becomes the single author; the
`KNOWN_SAME_STATE_REDECLARATIONS` ledger shrinks instead of growing; and the
ground ladder becomes derivable for every future tenant. 12 declarations across
3 extension files and 3 theme files.
