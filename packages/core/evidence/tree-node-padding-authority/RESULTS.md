# tree's node-padding authority — retiring the legacy `:root` bridge for Modern

- Measured: 2026-09-20
- Tree: `main` @ `cef973cc879ef386cfdea0a564f65b8210d93c62` (recorded at start).
- Every A/B below is one worktree at that SHA with the three source files
  swapped back and forth between the two arms, back to back in the same
  process — not a stale baseline file. The working tree of `main` also carried
  another writer's uncommitted card-ground lot; all measurement ran in the
  clean worktree, and every red gate is A/B'd rather than asserted.
- Instrument: the probe runtime's own `fresh` bundle
  (`resolveBundle`, recomposed in memory from `src/foundation/tokens/css/**`,
  so a source edit IS the arm — no artifact regeneration is involved) read
  back through Chromium; plus `check/theme/axis-difference` itself, unmodified,
  for the axis verdict.

## 1. The consumer map, proven from the composed bundle

Enumerated over the whole bundle text (a reader may wrap across lines) by
`probe/bundle-scan.mjs`; full output in `probe/bundle-scan-{before,after}.txt`.
Line numbers are bithire's; evnto and rottay are the same shape.

### Before

| name | producers | readers | fallback |
| --- | --- | --- | --- |
| `--ds-tree-node-padding` | 1 — `:root` (`presentation/components/tree/index.css:28`) | `html[data-tenant] .ant-tree .ant-tree-treenode` (Classic theme) | NONE |
| | | `[data-engine='modern'] .rottay-tree .rottay-tree-node` (Modern theme bridge) | NONE |
| | | `.rottay-tree--modern […] > [data-part='row']` (Modern skin) | YES |
| `--ds-tree-node-padding-block` | 1 — the tenant root (compiler-emitted, `derivation/chrome/tree`) | `.rottay-tree-node` (Modern skin) | YES |
| `--ds-tree-node-padding-inline` | 1 — the tenant root | `.rottay-tree-node` (Modern skin) | YES |

Three consumers, not one — which is why this was never a grep-delete. Deleting
the `:root` declaration would leave the two `fallback=NONE` readers with an
unresolvable `var()`, and `padding` invalid at computed-value time drops to
`0`.

The second half of the defect is that the Modern theme bridge's selector
(`[data-engine='modern'] .rottay-tree .rottay-tree-node`, specificity 0-3-0)
and the Modern skin's own compound rule (`.rottay-tree-node`, 0-1-0) are in the
SAME cascade layer (`rottay-engines` — the bridge arrives via
`runtime/engines/index.css` at entrypoint line 149, the skin at line 423). The
bridge therefore won, and the Modern engine's node wrapper — which stamps
`class="rottay-tree-node"` as well as `data-part="node"`
(`engines/modern/index.tsx:385`) — painted the legacy shorthand while the skin
rule beside it was inert.

### After

| name | producers | readers | fallback |
| --- | --- | --- | --- |
| `--ds-tree-node-padding` | 1 — `.ant-tree` | `html[data-tenant] .ant-tree .ant-tree-treenode` | NONE |
| `--ds-tree-node-padding-block` | 1 — the tenant root | `[data-part='row']` (Modern skin) **and** `.rottay-tree-node` (Modern skin) | YES |
| `--ds-tree-node-padding-inline` | 1 — the tenant root | same two | YES |

The legacy shorthand keeps exactly one reader and gains a producer that is an
ancestor-or-self of every element that reader can match. Both Modern
authorities now resolve the deriver, and both carry a fallback, so neither can
become unresolvable.

## 2. The repair

Three files, all inside the write set.

1. `src/foundation/tokens/css/presentation/components/tree/index.css` — the
   `--ds-tree-node-padding: 4px 8px` declaration moves out of `:root` into an
   `.ant-tree` block. Only the SELECTOR changes; the value is untouched.
2. `.../runtime/engines/modern/skin/tree/index.css` — the row part's chain
   stops reading the legacy shorthand and reads
   `--ds-tree-node-padding-block` / `-inline`, keeping the
   `--_ds-tree-row-padding-*` proto axes × `--ds-density-effective-scale` as
   the fallback for a page mounted without a tenant artifact.
3. `.../runtime/engines/modern/theme/index.css` — the bridge's `padding`
   declaration is drained. `color` and `transition` stay; only the rhythm half
   goes, because the skin already owns `.rottay-tree-node`'s box.

Nothing in `scripts/check/**`, no baseline, no pin, no generated artifact, no
Classic or Rustic rule.

## 3. Resting paint, all six cells

`probe/measure.mjs`, readings in `probe/reading-{before,after}.json`. Values are
`padding-top / -right / -bottom / -left`.

| cell | site | before | after | verdict |
| --- | --- | --- | --- | --- |
| bithire/light | modern row | 4 / 8 / 4 / 0 | **2.996 / 5.993 / 2.996 / 0** | declared |
| bithire/light | modern node wrapper | 4 / 8 / 4 / 8 | **2.996 / 5.993 / 2.996 / 5.993** | declared |
| bithire/light | node compound | 2.996 / 5.993 / 2.996 / 5.993 | 2.996 / 5.993 / 2.996 / 5.993 | IDENTICAL |
| bithire/light | classic treenode | 4 / 8 / 4 / 8 | 4 / 8 / 4 / 8 | IDENTICAL |
| bithire/dark | (all four) | — | — | identical to bithire/light |
| evnto/light | modern row | 4 / 8 / 4 / 0 | **3.75 / 7.5 / 3.75 / 0** | declared |
| evnto/light | modern node wrapper | 4 / 8 / 4 / 8 | **3.75 / 7.5 / 3.75 / 7.5** | declared |
| evnto/light | node compound | 3.75 / 7.5 / 3.75 / 7.5 | 3.75 / 7.5 / 3.75 / 7.5 | IDENTICAL |
| evnto/light | classic treenode | 4 / 8 / 4 / 8 | 4 / 8 / 4 / 8 | IDENTICAL |
| evnto/dark, rottay/light, rottay/dark | | | | identical to evnto/light |

The row's `padding-left: 0` in both arms is not a defect: the skin's
`[role='treeitem']` rule overrides `padding-inline-start` with
`--ds-tree-row-indent`, which is `0` at level 0. That rule is untouched.

### The second declared change, stated plainly

The packet allowed evnto/rottay to move only if the deriver's rung honestly
differs. **It does, and this is the measurement.** `4px 8px` is a px literal
authored against a 16px root. The deriver mints `var(--ds-spacing-1)` /
`var(--ds-spacing-2)` = `0.25rem` / `0.5rem` × `--ds-density-effective-scale`,
and the fluid root in these verticals is **15px** (bithire **14.1px**):

| vertical | root font-size | density factor | deriver's rung |
| --- | --- | --- | --- |
| bithire | 14.1px | 0.85 | 2.996px / 5.993px |
| evnto | 15px | 1 | 3.75px / 7.5px |
| rottay | 15px | 1 | 3.75px / 7.5px |

So evnto/rottay move −6.25 %, not 0 %. This is also why bithire's move is
−25.1 % and not the −15 % the rhythm census predicted: the census A/B only
DELETED the shorthand, which dropped the row to the proto-axis literal
(`4px × 0.85 = 3.4px`). Wiring to the deriver, as adjudicated, lands on
`0.25rem × 14.1px × 0.85` instead. Both numbers are correct answers to
different questions; the deriver's is the one this lot was told to make
canonical.

The outcome is that the three Modern sites agree for the first time: the row
and the node wrapper converge onto the value the node compound was already
painting.

## 4. No unresolvable `var()` — with a floor that can detect one

Two controls ride in the same page as the real reading:

| node | what it is | before | after |
| --- | --- | --- | --- |
| `classic-treenode` | the real Classic node | 4 / 8 / 4 / 8 | 4 / 8 / 4 / 8 |
| `control-iacvt-treenode` | same node, inside an `.ant-tree` that sets `--ds-tree-node-padding: initial` (the guaranteed-invalid value) | 0 / 0 / 0 / 0 | 0 / 0 / 0 / 0 |
| `control-orphan-treenode` | `.ant-tree-treenode` with no `.ant-tree` ancestor — the Classic rule does not match it at all | 0 / 0 / 0 / 0 | 0 / 0 / 0 / 0 |
| `control-bare` (`--ds-tree-node-padding` as resolved on a node outside every tree) | the `:root` reach of the legacy name | `4px 8px` | `` (empty) |

The IACVT control is the non-vacuity floor: it proves the instrument reads an
unresolvable `var()` as `0px`, in the same page and the same run where the real
Classic node reads `4px 8px`. Without it, "Classic is fine" would be an
unfalsifiable reading. `control-bare` is the retirement itself: the legacy name
no longer reaches anything outside `.ant-tree`.

Bundle-text proof of the same fact in §1: after the repair the one
`fallback=NONE` reader left in the package has a producer whose selector is an
ancestor-or-self of every element it can match.

## 5. The rhythm axis, in the probe's own terms

`node scripts/check/theme/axis-difference/index.mjs --families=tree --no-write`,
unmodified, on both arms. Full output in
`probe/axis-difference-{before,after}.txt`.

| cell | before | after |
| --- | --- | --- |
| bithire/light rhythm | 0/1 = 0.0 % | **1/1 = 100.0 %** |
| bithire/dark rhythm | 0/1 = 0.0 % | **1/1 = 100.0 %** |
| evnto/light rhythm | 0/1 = 0.0 % | **1/1 = 100.0 %** |
| evnto/dark rhythm | 0/1 = 0.0 % | **1/1 = 100.0 %** |
| rottay/light rhythm | 0/1 = 0.0 % | **1/1 = 100.0 %** |
| rottay/dark rhythm | 0/1 = 0.0 % | **1/1 = 100.0 %** |

The palette negative control stays at 0/1 = 0.0 % on the rhythm axis in all six
cells in both arms, so the movement is attributable to the rhythm pair and not
to a repaint. `axis-difference` exits OK on both arms.

## 6. Sighted verdict

`probe/capture.mjs`, twelve PNGs in `captures/` — `{before,after}` ×
`{bithire,evnto,rottay}` × `{light,dark}`, each showing the Modern tree and the
Classic tree side by side on ONE page so the declared move and Classic's
stillness are in the same image. Pink dashes outline the measured padding box,
blue the Modern node wrapper.

Looked at: `before/after-bithire-light`, `before/after-evnto-light`,
`before/after-rottay-dark`.

- bithire is the visible one: five rows drop from ~345px of stack to ~310px,
  and the blue node wrappers close onto their rows. It reads as the compact
  posture bithire's preset already asks for everywhere else, not as a change of
  design.
- evnto and rottay tighten by a hair (~10px over five rows), legible when the
  two images are alternated and invisible in isolation. Nothing else in the
  frame moves — same colours, same selection wash, same radii.
- The Classic column is pixel-identical between arms in every image checked,
  including the selected row's ground and the row baselines.

**Verdict: ACCEPT.** The declared changes are the rhythm the deriver was
already minting, and the frozen engine did not move.

## 7. Validation

| command | result |
| --- | --- |
| `vitest run` over the 10 tree suites + the tree deriver suite + `EmbeddedCssRecovery` | The 11 tree-owned files pass whole: **104 tests, 0 failures**. The twelfth file is the foreign `EmbeddedCssRecovery.contract.test.ts`, which runs **21 of 23** (2 ScrollArea-selector failures) — **A/B'd at clean HEAD in the worktree: the same 2 failures, pre-existing, untouched by this lot.** No tree test is skipped or missing; 104 + 21 is the 125 a whole-run line would report. |
| `pnpm exec tsc --noEmit` | clean |
| `structure:check` | passed — 4509 files, 0 findings |
| `csssource:check` | passed |
| `root-catalog:check` | OK — 100 roots agree with `src/` |
| `root-exposure:check` | OK — every dial has an owner, no knobless root gained one |
| `csspaint:check` | FAIL, **byte-identical before/after** (radius-field + two retired-entrypoint findings; no tree finding) |
| `theme-parity:check` | FAIL, **byte-identical before/after**; no tree channel named |
| `hooks:check` | FAIL (`MANIFEST_STALE`), **byte-identical before/after** — the hook surface did not change, the shorthand is still declared |
| `cascade-ratchet:check` | FAIL in both arms; the only delta is `denominator 5823 → 5822`. `debt` and `transitivelyUnwired` are identical, so no channel lost its path to a root |
| `engine-audit:check` | FAIL in both arms; the only delta is `themeCss.lineCount 187 → 188` (the two-line drain comment, one line net over the deleted declaration), far under its 1345 baseline, and it produces no failure line |

## 8. Owed to the DT, outside this write set

`docs-engineering/engineering/design-system/tokens/catalog/families/tree.md` is
a GENERATED catalog view and states reader counts that this lot changes:

| name | doc says | now | 
| --- | --- | --- |
| `--ds-tree-node-padding` | `3/0 · engine:modern(2), engine:classic(1)` | `1/0 · engine:classic(1)` |
| `--ds-tree-node-padding-block` | `1/0 · engine:modern(1)` | `2/0 · engine:modern(2)` |
| `--ds-tree-node-padding-inline` | `1/0 · engine:modern(1)` | `2/0 · engine:modern(2)` |

Its `source` column for the shorthand (`presentation/components/tree/index.css`)
stays correct. Regeneration is the DT's window
(`pnpm -C packages/core tokens:catalog:write`), as is the vertical-artifact
regeneration — note that `build:vertical-css --check` is ALREADY stale at
`cef973cc8` for an unrelated reason (the `input` ground repair in `0d4e4da81`
landed without it), so that staleness is not this lot's.

## 9. What this lot did NOT do

- The Modern node wrapper and the row still nest two paddings. They now agree
  on their value, which is the capability question this packet owns; whether
  the wrapper should carry padding at all is a family question and was not
  touched.
- The Modern theme bridge still exists for tree, carrying `color`,
  `transition`, a `:hover` background and a reduced-motion block. Draining
  those is a colour/motion question with its own consumers (the `Tree.TreeNode`
  compound has no skin rule for them), not this write set.
- Rustic was not read or touched; it has no reader of any of the three names.
