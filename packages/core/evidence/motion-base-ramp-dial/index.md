# The base motion duration ramp becomes a dial product

Milestone B, motion axis. Parent commit `12894ff11`. Browser
`chrome-headless-shell 149.0.7827.55`. Every A/B in this folder was measured in
a `git archive HEAD` scratch tree at `/tmp/ds-ab`, not in the working tree: a
second writer was editing `foundation/tokens/css/foundation/themes/default`,
`components/structures/headers/collection` and the adaptation registry
throughout this session, and a shared-tree reading would have carried their
delta into mine.

## 1. The producers

`--ds-motion-fast/-normal/-slow` are emitted by three owners, all of which had
to move together:

| owner | file | what it emits |
|---|---|---|
| tenant deriver | `src/infrastructure/compilers/runtime/theme/runtime/lowering/runtime/derivation/motion/index.ts` (`DURATION_ALIASES`) | the ramp in every compiled tenant artifact |
| foundation sheet | `src/foundation/tokens/css/foundation/animations/transitions/index.css` (MOTION CANON block) | the ramp at rest, for every context with no artifact |
| modern engine | `src/foundation/tokens/css/runtime/engines/modern/compiled/index.css` (`:root`) | the ramp in the standalone engine bundle |

The cadence (`instant`/`calm`/`deliberate`) is emitted by
`lowering/foundation/motion` `setMotionVariables` and is the dial's INPUT. It is
NOT touched by this lot, which is what keeps the dial applied exactly once.

### The divergence this uncovered

The two CSS/TS producers disagreed about which tier the intent names derive
from. The deriver stated `--ds-motion-feedback: calc(var(--ds-motion-instant) *
…)`; the foundation sheet stated `calc(var(--ds-motion-fast) * …)`. At rest the
two resolved identically, so nothing had ever measured the difference — but the
moment the ramp became a product, the sheet's spelling would have applied the
dial TWICE in every context that ships without a compiled artifact. The sheet
now states the intents on the cadence, byte-identical to the deriver.

Measured, not assumed: after the lot, no declaration anywhere in `src/**.css`
multiplies a ramp name by `--ds-motion-duration-scale`.

## 2. Per-name byte-equality, measured in Chromium

`tests/integration/motion-vocabulary/index.test.ts`, one bare probe per
vocabulary name, through the productive door
(`documentThemeIntent -> compileThemeIntent -> emitThemeCss`). The `before`
column was measured at the parent commit in a second scratch tree
(`/tmp/ds-head`) with the same probe.

| name | rottay before/after | evnto before/after | bithire before | bithire after |
|---|---|---|---|---|
| `--ds-motion-instant` | 0.12s / 0.12s | 0.12s / 0.12s | 0.12s | 0.12s |
| `--ds-motion-calm` | 0.2s / 0.2s | 0.2s / 0.2s | 0.2s | 0.2s |
| `--ds-motion-deliberate` | 0.32s / 0.32s | 0.32s / 0.32s | 0.32s | 0.32s |
| `--ds-motion-glacial` | 0.5s / 0.5s | 0.5s / 0.5s | 0.5s | 0.5s |
| `--ds-motion-feedback` | 0.12s / 0.12s | 0.12s / 0.12s | 0.096s | 0.096s |
| `--ds-motion-reveal` | 0.2s / 0.2s | 0.2s / 0.2s | 0.16s | 0.16s |
| `--ds-motion-disclosure` | 0.2s / 0.2s | 0.2s / 0.2s | 0.16s | 0.16s |
| `--ds-motion-resize` | 0.2s / 0.2s | 0.2s / 0.2s | 0.16s | 0.16s |
| `--ds-motion-rearrange` | 0.32s / 0.32s | 0.32s / 0.32s | 0.256s | 0.256s |
| `--ds-motion-attention` | 0.32s / 0.32s | 0.32s / 0.32s | 0.256s | 0.256s |
| **`--ds-motion-fast`** | 0.12s / 0.12s | 0.12s / 0.12s | 0.12s | **0.096s** |
| **`--ds-motion-normal`** | 0.2s / 0.2s | 0.2s / 0.2s | 0.2s | **0.16s** |
| **`--ds-motion-slow`** | 0.32s / 0.32s | 0.32s / 0.32s | 0.32s | **0.256s** |

rottay and evnto compile `durationScale: 1`, so every name is byte-identical.
bithire compiles `0.8`, and exactly three names move — the DECLARED reach of
this lot. Each now equals its intent twin, which is the whole point: one rung,
one duration, whichever spelling a skin binds.

The table is asserted as data in the suite (`RESTING_BEFORE`), so a later lot
that moves a resting value fails here rather than drifting.

### The dial arm

Under `motion.dial: { durationScale: 1.35 }` the cadence holds (0.12s / 0.2s /
0.32s / 0.5s in all three verticals, all six modes), and every intent AND ramp
name moves. Before the lot the ramp names were pinned as dial-INDEPENDENT by the
same suite; that assertion is what this lot inverts, and it is restated rather
than deleted: the cadence and `glacial` still carry it.

## 3. What the axis probe measured — the lot moves the axis by ZERO

`scripts/check/theme/axis-difference`, `--no-write`, both negative controls in
every run, same scratch tree before and after, same catalog revision
(`d9e1541e203de194`), same browser.

```
MOTION AXIS, fleet          before            after
bithire-light           155/195 = 79.5%   155/195 = 79.5%
bithire-dark            155/195 = 79.5%   155/195 = 79.5%
evnto-light             155/195 = 79.5%   155/195 = 79.5%
evnto-dark              155/195 = 79.5%   155/195 = 79.5%
rottay-light            155/195 = 79.5%   155/195 = 79.5%
rottay-dark             155/195 = 79.5%   155/195 = 79.5%
```

Zero families gained, zero lost, in all six cells. The other five axes are
byte-identical too (shape 138/205, typography 173/174, rhythm 166/209, depth
92/187, states 88/147). Both negative controls read 0 % on every axis in every
cell in both runs; zero refusals in both.

**The brief's premise does not hold, and this is the lot's main finding.** The
fleet analysis (`fleet-axis-analysis.md`, dated 2026-09-20 08:40) attributed a
15-family motion cluster to the flat base ramp and predicted that dial-linking
it would take the axis past 80 %. Two things are wrong with that prediction, and
both are measurable:

### (a) The analysis predates the lot that fixed those families

Motion lot 1b (`ccb6b784d`) landed at 10:29 the same morning and rewired those
skins onto the intent names. At the parent commit the subset already reads
**7/15 movers**, not 0 — and the reading is identical after this lot:

| family | before | after | why |
|---|---|---|---|
| badge | MOVE | MOVE | already on `feedback`/`attention` (lot 1b) |
| column-settings | MOVE | MOVE | already on `feedback` |
| command-palette | MOVE | MOVE | already on `feedback` |
| decision-panorama | MOVE | MOVE | glacial loop with the call-site factor |
| loading-overlay | MOVE | MOVE | glacial loop with the call-site factor |
| scope-switcher | MOVE | MOVE | already on `feedback` |
| shortcuts-overlay | MOVE | MOVE | already on `reveal` |
| compare | — | — | outranked: `--ds-skeleton-animation-duration` |
| kanban-surface | — | — | outranked: `--ds-skeleton-animation-duration` |
| operational-surface | — | — | outranked: `--ds-skeleton-animation-duration` |
| report | — | — | outranked: `--ds-skeleton-animation-duration` |
| search | — | — | outranked: `--ds-skeleton-animation-duration` |
| visualization | — | — | outranked: `--ds-skeleton-animation-duration` |
| menu-compounds | — | — | outranked: `runtime/personality` |
| markdown-view | — | — | outranked: the frozen classic theme's anchor rule |

Identical in all six cells. The subset percentage is 46.7 % before and after.

### (b) No remaining non-mover binds a ramp name where the probe can see it

Widening the roster's dial-reaching spellings to include `fast`/`normal`/`slow`
adds exactly EIGHT families: `form-field`, `input`, `otp-input`, `radio`,
`spinner`, `tag-input`, `textarea`, `toggle`. Seven of the eight were ALREADY
motion movers at the parent commit (they bind an intent name elsewhere in the
same skin), and the eighth, `input`, is not in the axis motion population at all
— it is one of the six families the run excludes as unsettled.

So the axis cannot see this lot, and the 40 remaining non-movers
(`anchor`, `ascii-diagram`, `assistant`, `cell-renderers`, `chart-c`,
`chart-foundation`, `collection-workspace-render-dispatch`, `column-menu`,
`compare`, `drawer-compounds`, `dropdown`, `edit-fields`, `export-button`,
`feature-workspace-frame`, `flex`, `form`, `grid`, `hover-card`,
`image-compounds`, `kanban-surface`, `layout`, `list`, `markdown-view`,
`menu-compounds`, `metrics-rows`, `modal-compounds`, `operational-surface`,
`pattern-timeline`, `record`, `record-facts`, `report`, `search`,
`search-command-bar`, `skeleton`, `stack`, `timeline`, `toast-compounds`,
`tooltip`, `tree-view-connector`, `visualization`) are blocked by the analysis's
OTHER clusters: private flat channels, portal mounts, prop gates and raw
literals. **Motion does not cross 80 % on a derivation lot.** What closes it is
the flat-channel cluster below plus the portal/prop instrument work.

### The eight non-movers are private flat channels, not the base ramp

Reported, not forced — these are other owners' channels and outside this lot's
write set:

1. **`--ds-skeleton-animation-duration: 1.5s`**, declared at
   `src/foundation/tokens/css/foundation/themes/default/index.css:1696`. Six
   families (`compare`, `kanban-surface`, `operational-surface`, `report`,
   `search`, `visualization`) paint their only probe-visible motion as
   `animation: ds-foundation-pulse var(--ds-skeleton-animation-duration,
   var(--ds-motion-attention, 1.5s))`. The channel IS declared, so the intent
   fallback beside it is dead. Closing this is a skeleton-family wiring lot —
   six of the fifteen, and the single largest motion cluster still open.
2. **`--ds-personality-animation-entrance-duration`**, written by
   `src/foundation/tokens/css/runtime/personality/index.css:866` for
   `[data-engine] .ds-menu-item`. The menu-compounds skin already reads
   `--ds-motion-disclosure`; the personality sheet outranks it.
3. **The frozen Classic theme's anchor rule**,
   `src/foundation/tokens/css/runtime/engines/classic/theme/index.css:1768`:
   `html[data-tenant] a { transition: var(--ds-transition-fast) }`. Worth
   recording: `--ds-transition-fast` is
   `var(--ds-motion-fast) var(--ds-motion-ease-standard)` (`themes/default:940`),
   so that composite DOES become dial-reaching with this lot — markdown-view's
   axis-probe node simply is not the `<a>` the rule needs.

## 4. Roster, suites and gates

The dial-reach roster is read from source, so widening the dial-reaching
spellings to include the ramp names grows it rather than re-pinning it by hand:
**432 sites / 172 families -> 456 sites / 180 families**. The pins follow and
stay decrease-only by review.

| check | result |
|---|---|
| `tests/integration/motion-vocabulary/index.test.ts` | **5/5 green** (the new law, the before-table, the twin equality) |
| `tests/integration/motion-vocabulary/dial-reach.test.ts` | **NOT COMPLETED on this host** — see below |
| `pnpm exec tsc --noEmit` | **NOT COMPLETED on this host** — five attempts, every one killed mid-run with an empty log and no exit code, while three other agents' full typechecks ran concurrently at load 50-107. Must be run before integration. The `src` delta is type-invariant by construction (three string literals inside an existing `Readonly<Record<string, string>>`); the two changed test files execute cleanly under vitest, which is not a type proof. |
| `pnpm run csssource:check` | PASS |
| `pnpm run motion-contracts:check` | RED at HEAD and on the candidate with byte-identical `ui-design-system` finding hashes — pre-existing, A/B'd in `/tmp/ds-head` with the sibling repos symlinked. Not this lot. |
| `axis-difference` negative controls | 0 % in every cell, both runs, both controls |

### dial-reach could not be executed, and the reason is the host

Three attempts, each timing out inside `beforeAll`: 600s, 900s, 1800s (the last
spent 1805s in the hook). The cause is measured, not guessed — the SAME suite at
the parent commit, with 432 sites and a 600s ceiling, spent 603s in that hook on
this machine and timed out identically. This session ran at load average 40-107
throughout (other agents holding three concurrent full typechecks among other
work); the original 240s pin was fitted to an idle host.

The committed ceiling is **600_000**: 2.5x the old pin for a 5.5 % larger scene,
which is headroom for a busy machine without normalising a half-hour CI hook.
**This suite must be run to green before the lot is integrated**, together with
`tsc --noEmit`. Its three
registries are the part of this lot that is asserted but unverified: the new
`fast`/`normal`/`slow` sites are in the roster, and whether any of the eight
newly-entered families (`form-field`, `input`, `otp-input`, `radio`, `spinner`,
`tag-input`, `textarea`, `toggle`) is outranked on the rule the ramp name sits
in is exactly what the `OUTRANKED` registry has to answer.

## 5. Not this lot, recorded for whoever takes them

- Five raw-ms decorative durations still emitted flat by chrome derivers, none
  of them a ramp rung: `--ds-search-command-bar-pulse-duration` (1.6s),
  `--ds-search-command-bar-spin-duration` (1s), `--ds-stats-header-ping-duration`
  (400ms), `--ds-collection-header-sheen-duration` (17s),
  `--ds-page-shell-header-sheen-duration` (14s). The analysis's "literal
  duration" cluster.
- `--ds-skeleton-animation-duration: 1.5s` is the single largest open motion
  cluster (six families) and the cheapest next lot on this axis.

## 6. Files

- `probe-fleet.json` — every axis-difference cell, before and after, full fleet.
- `probe-subset.json` — the 15-family cells, both runs.
- `vocabulary.json` — the per-name Chromium readings, both arms, three verticals,
  at the parent commit and on the candidate.
