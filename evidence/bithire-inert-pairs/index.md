---
title: "Why bithire's rhythm and states-emphasis pairs read inert: the delta is empty, the paint is not"
date: 2026-09-19
status: measurement + verdict (READ-ONLY lot; no source edit, no roadmap edit)
base: edb668d15f1e0f68d1e1bc6b8114a975fa10a379 (main, /Users/daniel/Developer/Rottay/r4-recon-opus)
writer: Opus
auditor: Kimi (DT/coordinator)
write-set: evidence/bithire-inert-pairs/ ONLY
---

# bithire's two "inert" pairs

## 0. The verdict, first

Neither pair is a derivation gap, and neither is an honestly inert pair.

Both decisions reach their channels on bithire exactly as they do on rottay and
evnto. What is empty is not the decision's effect — it is the **artifact
delta**, because on bithire one arm of each pair authors the value the
vertical's own preset already states, and the artifact is by definition the
difference against that preset's compile.

The browser half of the same run proves it in the same output: bithire's
`rhythm` cell reads **45/209 = 21.5 %**, byte-identical to rottay's and evnto's,
while the instrument is printing `[NON-EVIDENTIAL]` beside it and failing the
run on it.

So the finding is against the **instrument's standing rule**, not against the
derivation or the preset. Recording these four cells in `INERT_PAIRS` would
write a false statement into the gate: the entry asserts "the decision moves no
channel on this vertical", and this run measures 45 families moving.

## 1. Provenance and commands

Repo `HEAD` at the start and end of the lot: `edb668d15f1e0f68d1e1bc6b8114a975fa10a379`.
`git status --porcelain` before the lot: `?? node_modules` only.
Compiler door: `packages/core/dist/server.js` → `compileTenantThemeDocumentV2`,
the same module and export `COMPILER_MODULE` / `COMPILER_EXPORT` name; build
stamp `schemaVersion 3`, session `e66dad15…`, file dated 2026-09-19 06:11.
Browser: chromium 149.0.7827.55. Catalog revision digest `49bc4572fa60d2e5`.

Commands, all from `packages/core`:

```
node scripts/check/theme/axis-difference/index.mjs --vertical=bithire
node scripts/check/theme/axis-difference/index.mjs --vertical=rottay,evnto
node scripts/check/theme/axis-difference/index.mjs --vertical=bithire --theme=light --families=button --json
```

plus three throwaway probes under `/tmp/axis/` (not part of the write-set) that
call the same published door and the instrument's own exported
`effectiveVariables` / `SCENARIOS`, and one that mounts the instrument's own
scene root (`resolveBundle` + `rootAttributes`, `mode: 'fresh'`) and reads the
baseline values with no arm applied.

## 2. What the instrument does with the pair

`scripts/check/theme/axis-difference/index.mjs`:

- `compileDocument` (line 267) compiles each arm through the published v2 door
  with the cell's `verticalKey`, and keeps `artifact.variables` +
  `artifact.modeDeltas`.
- `effectiveVariables` (line 352) folds the mode block over the base block: the
  map for the cell is base overlaid by that mode's own block.
- `compiledA` / `compiledB` (lines 1039-1040) are `Object.keys(...).length` of
  those two maps.
- `applyVariables` (line 551) **clears every inline `--ds-*` on
  `documentElement` first**, then sets the arm's map. So an arm with an empty
  map is not "nothing applied" — it is *the vertical bundle's own baseline*,
  which is precisely the paint a tenant who authored the preset's value gets.
- `evidential` (line 1112) is `compiledA > 0 && compiledB > 0`.
- `evaluate` (line 1270) fails when `compiledA === 0 || compiledB === 0` unless
  the cell is in `INERT_PAIRS` (line 309, currently empty), with the message
  "the decision moves no channel on this vertical".

The last two are the only consumers of the emptiness test, and they are where
the run fails.

## 3. The measurement

### 3.1 The compiled maps, per vertical

Through `compileTenantThemeDocumentV2` on `dist/server.js`, both modes
identical (neither pair produces a mode block):

| vertical | pair | `compiledA`/`compiledB` | arm A keys | arm B keys |
|---|---|---|---|---|
| rottay | rhythm | 2/2 | `--ds-density-mode-factor: 0.85`, `--ds-rhythm-scale: 0.85` | `1.15`, `1.2` |
| evnto | rhythm | 2/2 | `0.85`, `0.85` | `1.15`, `1.2` |
| **bithire** | **rhythm** | **0/2** | **(none)** | `1.15`, `1.2` |
| rottay | states-emphasis-only | 6/6 | the six subtle values | the six strong values |
| evnto | states-emphasis-only | 6/6 | the six subtle values | the six strong values |
| **bithire** | **states-emphasis-only** | **6/0** | the six subtle values | **(none)** |

The six state channels are `--ds-state-{hover,active,selected}-shift`,
`--ds-state-press-scale`, `--ds-state-disabled-opacity`,
`--ds-state-disabled-mix`. `subtle` → `2% / 4% / 5% / 0.99 / 0.68 / 88%`;
`strong` → `8% / 13% / 17% / 0.965 / 0.5 / 72%`.

### 3.2 Where the channels go — traced, per pair

**They are not dropped anywhere. They are subtracted at the end.**

1. **Preset.** `src/foundation/presets/verticals/bithire/document/index.json`
   lines **34, 35, 39**:
   ```json
   "density.mode": "compact",
   "spacing.rhythm": "tight",
   "states.emphasis": "strong",
   ```
   evnto's and rottay's preset documents state `normal` / `normal` / `medium`
   for the same three rows. This is the whole asymmetry.

2. **Derivation.** The channels are produced unconditionally for an authored
   decision. `src/infrastructure/compilers/runtime/theme/runtime/lowering/runtime/derivation/density/index.ts:66-71`
   emits `--ds-density-mode-factor` for any authored posture, *including at the
   identity value* — its own header records that this was fixed precisely so a
   compact-baseline vertical could be brought back to `normal`. The rhythm and
   states derivators behave the same; the proof is that the identical decision
   on rottay and evnto emits 2 and 6 channels, and that on bithire the *other*
   arm of each pair emits them.

3. **Emission / artifact assembly.** `compileThemeIntent`
   (`src/infrastructure/compilers/runtime/theme/facade/runtime/compile/index.ts:151`)
   compiles the tenant, compiles the vertical's own baseline through the same
   lowering, and hands both to `admitThemeCompilation`
   (`.../facade/foundation/admission/index.ts:181`), which calls
   `themeChannelDelta`.

   **The exact line where the channel disappears** —
   `src/infrastructure/compilers/runtime/theme/facade/foundation/admission/runtime/limits/index.ts:497`:
   ```ts
   if (baseline.cssVariables[key] !== value) base[key] = value;
   ```
   Value equality against the vertical's own compile. On bithire the tenant's
   `compact`/`tight` compile equals the preset's compile on those two keys, and
   the tenant's `strong` compile equals it on those six. They are dropped —
   correctly, because the artifact's contract is "what did this tenant move",
   and the answer is "nothing, it re-stated the vertical".

   This is not a bug to fix. An artifact that restated every baseline value
   would be a second copy of the vertical bundle on every tenant row.

### 3.3 The baseline the empty arm actually paints

Read on the instrument's own scene (`resolveBundle({ mode: 'fresh' })` +
`rootAttributes`), no arm applied, `light`:

| channel | bithire | evnto | rottay |
|---|---|---|---|
| `--ds-density-mode-factor` | **0.85** | 1 | 1 |
| `--ds-rhythm-scale` | **0.85** | 1 | 1 |
| `--ds-state-hover-shift` | **8%** | 4% | 4% |
| `--ds-state-active-shift` | **13%** | 7% | 7% |
| `--ds-state-selected-shift` | **17%** | 9% | 9% |
| `--ds-state-press-scale` | **0.965** | 0.98 | 0.98 |
| `--ds-state-disabled-opacity` | **0.5** | 0.6 | 0.6 |
| `--ds-state-disabled-mix` | **72%** | 82% | 82% |

bithire's empty arm resolves to exactly the values the *other* verticals' arms
emit explicitly — `0.85 / 0.85` is `compact`/`tight`, and the six state values
are bit-for-bit rottay's `strong` arm. The empty map is the decision, already
paid for by the bundle.

### 3.4 What the page measured

From the two full runs (254 mountable families; rhythm denominator 209, shape
205, typography 174):

| cell | bithire | evnto | rottay |
|---|---|---|---|
| `rhythm` / rhythm, light | **45/209 = 21.5 %** | 45/209 = 21.5 % | 45/209 = 21.5 % |
| `rhythm` / rhythm, dark | **45/209 = 21.5 %** | 45/209 = 21.5 % | 45/209 = 21.5 % |
| `states-emphasis-only` / shape | **0/205 = 0 %** | 0/205 | 0/205 |
| `states-emphasis-only` / typography | **0/174 = 0 %** | 0/174 | 0/174 |
| (`states` positive, for the control's witness) | 3/146 = 2.1 % | 3/146 | 3/146 |

Identical on all three verticals. bithire's four cells were nonetheless printed
`[NON-EVIDENTIAL: the pair compiles to an empty delta]` and failed the run.

The page received what was compiled, so this is not an instrument-loss case
either — `--families=button --json` on bithire reads `applied` equal to
`compiled` on every arm, the zero arms included (`rhythm` 0/2 applied 0/2;
`states-emphasis-only` 6/0 applied 6/0).

## 4. Answer per pair

### bithire `rhythm` (light and dark) — NOT a derivation gap, NOT inert

The moved decision reaches its channels. Arm B emits both of them; arm A emits
neither because bithire's preset already states `compact`/`tight`, and line 497
of `.../admission/runtime/limits/index.ts` subtracts a value equal to the
baseline's. The painted difference between the two arms is real and is the
same 21.5 % the other two verticals measure.

Milestone B's law — "two tenants of the same vertical must differ in shape,
rhythm, states and mode" — is **satisfied** on bithire: a bithire tenant that
moves to `spacious`/`airy` moves 45 of 209 families away from a tenant that
stays on the vertical default. The gate cannot see it because it asks the
artifact instead of the page.

### bithire `states-emphasis-only` (light and dark) — NOT a derivation gap, NOT inert

Same mechanism with the arms swapped: `strong` *is* bithire's preset, so arm B
is empty and arm A carries the six subtle channels. The two arms do reach the
page as different paint (subtle values inline vs. the bundle's strong values),
the control reads the 0 % on shape and typography that rule 4 demands, and its
`axis-positive` witness stands — the `states` positive moves 3/146 on bithire,
exactly as on rottay and evnto.

The one extra cost here is structural: `states-emphasis-only` is the single
member of `VACUITY_PERMITTED_CONTROLS` (line 1204), so its four bithire cells
going non-evidential is *permitted* rather than fatal — which means the
mis-standing would have silently shrunk the negative control's fleet coverage
from 12 evidential cells to 8 even if the emptiness rule had not also been a
hard failure.

## 5. The repair, measured

The emptiness test answers the wrong question. Because `applyVariables` clears
the root before each arm, an empty map is a legitimate arm — "paint the
vertical's baseline". A pair is inert when **the two arms reach the page as the
same effective paint**, not when either map is empty.

### 5.1 Recommended: resolve each arm against the scene baseline

The honest form, and the one that makes the failure message true. The scene
already exists per `(vertical, theme)` before any arm is applied, so one
`page.evaluate` there reads the root's computed value for every channel name
any scenario compiles. Then compare *resolved* values:

```
resolved(name, map) = map[name] ?? baselineRoot[name]
differing = union(keys(A), keys(B)).filter(n => resolved(n, A) !== resolved(n, B))
```

- `evidential: differing > 0`
- fail when `differing === 0` and the cell is not in `INERT_PAIRS`, with the
  message unchanged (it becomes accurate).

Under this rule bithire/rhythm resolves arm A to `0.85 / 0.85` and arm B to
`1.15 / 1.2` → 2 differing; `states-emphasis-only` resolves to the subtle six
vs the strong six → 6 differing. Both become evidential, both stop failing, and
a genuinely inert pair (both arms resolving identically) still fails exactly as
today.

Cost: ~12 lines in `run()`, one extra `page.evaluate` per `(vertical, theme)`
— 6 evaluations on a full run.

### 5.2 Minimal fallback: union-difference over the compiled maps

The instrument already ships this comparator — it is the `effective-map`
witness at line 842, `names.filter((name) => variablesA[name] !== variablesB[name])`.
Lifting it out of the witness and using it as the standing rule is a two-line
change.

Measured over all 48 cells of the fleet (3 verticals x 2 modes x 8 scenarios),
`differing/union`:

```
bithire  shape 8/8   typography 8/8  rhythm 2/2  depth 9/10  states 9/9  motion 9/9
         palette-only 40/40 (both modes)   states-emphasis-only 6/6
evnto    shape 8/8   typography 8/8  rhythm 2/2  depth 9/10  states 9/9  motion 9/9
         palette-only 40/52 (both modes)   states-emphasis-only 6/6
rottay   shape 8/8   typography 8/8  rhythm 2/2  depth 9/10  states 9/9  motion 9/9
         palette-only 40/52 (both modes)   states-emphasis-only 6/6
```

**Every one of the 48 cells reads `differing > 0`.** So the switch clears
exactly the six reported failures (2 rhythm + 4 states-emphasis) and costs no
cell its standing: 48/48 evidential, `palette-only` 24/24 and
`states-emphasis-only` 12/12 instead of 8/12.

Its known weakness, named rather than hidden: it treats an absent name as
different from a present one, so a pair where one arm *explicitly restates*
the baseline value the other arm omits would be called evidential while
painting identically. That error is in the safe direction — the cell then
publishes an honest 0 % and a positive axis is still caught by `--threshold` —
but it is why 5.1 is the recommendation.

### 5.3 A second, smaller finding in the same block

The instrument-loss guard at line 1262 is `compiledA > 0 && compiledB > 0 &&
(appliedA === 0 || appliedB === 0)`. Because the precondition is ANDed across
both arms, a pair with one empty arm skips the guard entirely: if bithire's
rhythm arm B had compiled 2 channels and applied 0, nothing would have caught
it. The guard should be per arm (`compiledX > 0 && appliedX === 0`). Not the
cause of any current failure — `applied` equals `compiled` on every bithire
arm measured — but it is a hole the same rewrite should close.

## 6. What the owner should NOT do

Do not record these four cells in `INERT_PAIRS`. The entry's contract is a
measurement that the decision moves no channel on that vertical; the run that
would carry the entry simultaneously measures 45/209 families moving on the
rhythm axis. That would be a false statement pinned into the gate, and the
`INERT_PAIRS` re-check at line 1285 would never retire it, because it tests
`compiledA > 0 && compiledB > 0` — the very condition a baseline-coincident arm
can never satisfy. The entry would be permanent by construction.

## 7. Proposed next lot

**WO (bounded, instrument-only): "axis-difference — a pair is inert when its
arms paint the same, not when a map is empty".**

Write-set: `packages/core/scripts/check/theme/axis-difference/index.mjs` and
its `tests/`.

1. Read the scene root's computed value for every channel name any scenario
   compiles, once per `(vertical, theme)`, before the first arm.
2. Replace `evidential: compiledA > 0 && compiledB > 0` with
   `evidential: differing > 0` over baseline-resolved values; publish
   `differing` and `resolvedDiffering` on the cell beside `compiledA`/`compiledB`
   so a reader can still see which arm was baseline-coincident.
3. Replace the line-1270 failure with the same test, message unchanged.
4. Make the line-1262 instrument-loss guard per arm.
5. Keep `INERT_PAIRS` empty, and update its header to say what an entry now
   means: both arms resolve to the same paint.
6. Unit tests in `tests/`: a 0/N pair whose arms resolve differently must be
   evidential and must not fail; a pair whose arms resolve identically must
   fail and must be excusable by `INERT_PAIRS`; the per-arm loss guard must
   fire on `compiled 2 / applied 0` in a pair whose other arm is empty.

Acceptance: `node scripts/check/theme/axis-difference/index.mjs` green on all
three verticals with `INERT_PAIRS` still empty; `palette-only` 24/24 evidential
and `states-emphasis-only` 12/12; bithire's rhythm cells publishing
45/209 = 21.5 % as evidential readings.

Not in scope, and deliberately: the bithire preset, the density/rhythm/states
derivators, `themeChannelDelta`, and `VACUITY_PERMITTED_CONTROLS`. Nothing in
the product is wrong here.
