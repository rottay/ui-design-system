# P4A ledger — CRA-12 motion-governance legitimate re-anchor

Wave: R1-P remediation closure, P4A. Date 2026-07-27. Owner claude/R1-P.
Gate: `packages/core/scripts/cra-12-motion-governance.mjs --repositories ui-design-system`.

## Verdict

GREEN. Two rows re-anchored DOWNWARD, both attributable to the R1-P Phase-3
drain (W-C) with a byte-exact reproduction proof. Zero additions anywhere in the
DS slice. Thirty-two of the thirty-four registry rows untouched, including every
row the concurrent visual session authored.

## Entry state (before P4A)

```
CRA12 motion governance failed (2):
  - global-keyframes: path/body hash drift at ui-design-system/ds-internal
      6b03c0fc1ed7bc5ebfe2dc6674ff384395cd22c72d68c55d9e1ba370ce06e015 != 2761d903…
  - raw-motion-timing: path/body hash drift at ui-design-system/ds-internal
      19c74b4a01f22873f0c792aff2ea951122434ca6b10c5f9d190c4dd8352dffe3 != cf64542f…
```

Hash drift only. No `ratchet grew`, no `unregistered finding`, no `stale registry
row` — the count ceilings were already satisfied before the re-anchor.

## Attribution proof (the load-bearing step)

The registry rows were anchored to "HEAD f3720ea8 plus the wave's uncommitted
work", which is not reproducible from Git alone. It IS reproducible from the W-B
snapshot, which was taken before W-C drained the extension:

1. Copied the scanned tree (`packages/core/src`, `packages/showroom/src`,
   both `package.json`, `pnpm-lock.yaml`) to a scratch mirror. Scanning the
   mirror as-is reproduced all ten live rows exactly — copy fidelity confirmed.
2. Restored ONLY the six vertical-artifact files from
   `r1p/closure/wb-snapshot/` (`{bithire,evnto,rottay}.{extension,index}.css`)
   into the mirror. Nothing else was changed.
3. Re-scanned. The mirror reproduced the **superseded registry byte-exact on all
   ten rows**, including the two that had drifted:

| row | pre-drain mirror | superseded registry | match |
|---|---|---|---|
| global-keyframes / ds-internal | 130 in 16, `2761d903…` | 130 in 16, `2761d903…` | exact |
| raw-motion-timing / ds-internal | 584 in 231, `cf64542f…` | 584 in 231, `cf64542f…` | exact |
| the other 8 ui-design-system rows | unchanged | unchanged | exact |

Because restoring two BitHire artifact files is sufficient to reproduce the old
registry exactly, no other edit in this tree — including every in-flight edit
from the concurrent visual session — contributed to the drift.

Finding-set diff, pre-drain mirror → live tree: **18 removals, 0 additions, 0 new
paths.** All 18 sit in two files.

### The 18 removed findings

Both files are generated-from/source-of the same extension, so every finding
appears twice (once in `_source/extension.css`, once in the built `index.css`).

| channel | kind | symbol | evidence | ×2 files |
|---|---|---|---|---|
| global-keyframes | duplicate-keyframe-definition | `bithire-preview-enter` | `@keyframes bithire-preview-enter` | yes |
| global-keyframes | duplicate-keyframe-definition | `rt-detail-floating-toggle-in` | `@keyframes rt-detail-floating-toggle-in` | yes |
| global-keyframes | bare-animation-reference | `bithire-preview-enter` | `animation: bithire-preview-enter var(--ds-list-preview-motion-duration)` | yes |
| global-keyframes | bare-animation-reference | `rt-detail-floating-toggle-in` | `animation: rt-detail-floating-toggle-in 180ms ease-out` | yes |
| raw-motion-timing | css-or-style-time | `animation` | `animation: rt-detail-floating-toggle-in 180ms ease-out` | yes |
| raw-motion-timing | css-or-style-time | `transition` | `transition: background-color var(--ds-motion-instant, 120ms)` | yes |
| raw-motion-timing | css-or-style-time | `transition` | `transition: border-color 160ms ease, background-color 160ms ease,` | yes |
| raw-motion-timing | css-or-style-time | `transition` | `transition: color var(--ds-motion-instant, 120ms)` | yes |
| raw-motion-timing | css-or-style-time | `transition` | `transition: width 180ms ease` | yes |

Files: `packages/core/src/foundation/tokens/css/facade/artifacts/bithire/_source/extension.css`
and `packages/core/src/foundation/tokens/css/facade/artifacts/bithire/index.css`.
Both now contribute zero CRA-12 findings.

Class (a) — legitimate drain removal: 18/18. Documented in `wc-state.md`
(component-local 15→0, media 3→0, reduced-motion 2→1, rules 388→8) and
`phase3-ledger.json`; `rt-detail-floating-toggle-in` is named there with its
cascade-position proof. Class (b) — increase or new path: **none**. Class (c) —
concurrent-session edits: none reached these two channels' drifted rows; the
concurrent session's own rows reproduce byte-exact untouched.

## Per-row before → after

| channel | repo / scope | count | files | digest |
|---|---|---|---|---|
| global-keyframes | ui-design-system / ds-internal | 130 → **122** | 16 → **14** | `2761d903…` → `6b03c0fc1ed7bc5ebfe2dc6674ff384395cd22c72d68c55d9e1ba370ce06e015` |
| raw-motion-timing | ui-design-system / ds-internal | 584 → **574** | 231 → **229** | `cf64542f…` → `19c74b4a01f22873f0c792aff2ea951122434ca6b10c5f9d190c4dd8352dffe3` |

Both strictly downward. No row was widened.

## Provenance records

Both channels' `reanchor` objects were rewritten to the existing schema
(`kind`/`snapshotSha`/`snapshotDate`/`owner`/`verifiedBy`/`reason`/
`notAnImprovement`/`doNotRepeat`), snapshot SHA `f3720ea8`, date 2026-07-27,
owner `claude/R1-P`. The superseded record of each channel is preserved verbatim
under a new `supersedes` array so the earlier waves' reasoning (a5a4c3b4 for
global-keyframes, the R2/R3 literal drain for raw-motion-timing) is not lost.

## Rows deliberately NOT touched (32 of 34)

- `policy` (canonical versions, allowed direct-import roots, allowed dynamic
  keyframes) — untouched.
- `dependency-state`: all 4 rows + its `reanchor` — untouched.
- `direct-motion-import`: all 3 rows — untouched.
- `transition-all`: all 8 rows + its `reanchor` — untouched. Its ds-internal
  digest `cb5c27a3…` still matches the live tree exactly, which independently
  confirms the concurrent session's anchor is intact.
- `global-keyframes`: the other 7 rows (app-bithire ×2, app-evnto, app-platform
  ×2, ui-design-system showroom + test) — untouched.
- `raw-motion-timing`: the other 10 rows (app-bithire ×4, app-evnto ×2,
  app-platform ×2, ui-design-system showroom + test) — untouched.

Structural key-by-key diff of the pre-P4A reconstruction against the written
file lists exactly 6 changed leaves (2 × maxCount/maxFiles/digest), 12 changed
provenance strings, and 2 added `supersedes` arrays. Nothing else.

## Gates

| command | exit |
|---|---|
| `node scripts/cra-12-motion-governance.mjs --repositories ui-design-system` (entry) | 1 — 2 failures |
| `node scripts/cra-12-motion-governance.mjs --repositories ui-design-system` (after) | **0 — PASS** |
| `node --test scripts/cra-12-motion-governance.reanchor.test.mjs` | **0 — 4/4** |
| `node --test scripts/cra-12-motion-governance.test.mjs` | **0 — 12/12** |

The drill's planted-violation arm passed unmodified: injecting a new raw timing
into the real scanned tree still turns the gate red on `raw-motion-timing` /
`ds-internal`, and the tree is green again after removal. No drill fixture was
re-anchored — the drill pins behaviour, not counts.

## REFUSED to re-anchor

The full four-repository run (`node scripts/cra-12-motion-governance.mjs`, no
`--repositories`) is RED with 14 failures, two of which are **increases**:

```
raw-motion-timing: file ratchet grew at app-bithire/product: 292 > 282
raw-motion-timing: ratchet grew at app-bithire/marketing:     69 > 68
```

These are the receiving side of the same drain (462 `!important` and 355 rules
moved into `app-bithire/src/styles/{collection-preview-chrome,detail-editor-chrome}.css`
per `wc-state.md`) plus foreign in-flight app work. They are increases, so the
decrease-only law forbids re-anchoring them here, and app-bithire is outside
this mission's scope. Left RED for the cross-repo lane.

One structural note for that lane: `global-keyframes` digests are **not**
comparable across scan scopes. `duplicate-keyframe-definition` is decided over
the union of scanned repositories, so ui-design-system/ds-internal hashes to
`6b03c0fc…` in the DS-only run and `c814ff29…` in the four-repo run. The
registry can satisfy one or the other, not both. It is currently anchored to the
DS-only slice, which is what C6.8 certifies. Making the four-repo run green will
require either per-slice registries or a scope-independent duplicate rule — a
design decision, not a baseline refresh.
