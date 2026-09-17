# R17-07 — cascade-ratchet set attribution (WO-EVI-02)

Read-only investigation. Execution checkout `/Users/daniel/Developer/Rottay/r4-recon-opus`,
branch `main`, base HEAD `ef34493c5`. Writer seat: Opus (profile `claude-admin`).
DT / auditor / integrator: Kimi.

**Bounds honoured.** No baseline was written, no product source was edited, no
`git add`/`commit`/`mv` was run, `roadmap/` was not touched. The only file this
packet writes is this report. Every historical measurement was taken by exporting
the tree with `git archive` into `/tmp` and running the checked-out instrument
there; the repository working tree was never mutated.

---

## 0. Answer in one screen

| question | answer |
| --- | --- |
| Is the +267 debt overshoot caused by the 42 audited commits? | **No.** The audited delta `b29cf1e20..814927519` moves debt by **+9** (13 names in, 4 out). |
| Where does the overshoot come from? | **+348** of it was already false the day the baseline was written, in `8bcc3852b`. The tree has since moved **−81** against that write. |
| Was the baseline ever true? | The nine baseline writes before `8bcc3852b` were all honest (gate exit 0 on their own trees). `8bcc3852b` is the single bad write, and its own gate rejects it. |
| Is the DT's 2427-at-`8bcc3852b` figure right? | **Confirmed exactly**, by re-running that commit's own gate on that commit's own tree. |
| Is the DT's "251 names of family-cut drift" right? | **Corrected.** 251 is a scalar subtraction against a pin that never named a set. The real named movement over that span is +328 / −425 — the family cuts *lowered* real debt by 97 names. |
| Of the 13 new debt names, how many are real new defects? | **1** (`--ds-listing-grid-bottom-bleed`, nobody writes it). 4 are byte-identical renames of the 4 exits; 8 are produced channels whose read site states a literal fallback. |

---

## 1. Method, and what it can and cannot see

Every figure below comes from the checked-out instrument
`packages/core/scripts/check/engine/cascade-wiring/index.mjs`, imported rather than
re-implemented. Its exported `classifyCascadeWiring(files, producers)` returns the
named sets that the gate itself only ever prints as scalars; the extractor calls it
with each tree's own `collectSkinFiles()` and its own
`collectChannelProducers()`, so a historical figure is what that commit's gate
would have printed, not what today's gate says about an old tree.

Faithfulness check: the extractor reproduces the live gate exactly —
`denominator 5439 / debt 2346 / transitivelyUnwired 2359`, the same three numbers
`node scripts/check/engine/cascade-wiring/index.mjs` prints and the same three the
2026-09-17 audit reproduced.

The live measurement was taken in a checkout shared with three concurrent writers on
disjoint directories. No `.css` file was dirty at any point during this packet
(`git status --porcelain | grep '\.css'` empty at start and at close), and the
pristine `git archive` export of `814927519` reproduces the working-tree figures
name for name, so the in-flight `.tsx`/`.ts` edits of the other writers do not
enter the corpus or these numbers.

**The instrument keeps no baseline names.** `baseline/index.json` pins four scalars
(`denominator`, `wired`, `debt`, `transitivelyUnwired`) plus `rootsExcluded` and a
stale `skinFiles`. The only named material in it is prose: `debtNote` enumerates
some entries and exits per lot. Section 3 shows that this prose is where the false
baseline came from. **A scalar pin cannot name a subset**, so "which 348 names the
baseline never counted" has no answer in the baseline itself; it is recoverable only
by re-measuring the historical trees, which is what this report does.

Two caveats on my own probe, stated so they are not mistaken for findings:

- Read-site line numbers are computed after blanking comments **in place**, so
  offsets match the original file. An earlier pass of this extractor removed
  comments and reported shifted lines; those numbers were discarded, not reported.
- I attempted to classify deriver-emitted values with
  `extractDirectVarsAssignments` from the liveness library. That extractor returns
  **occurrence metadata, not values**, so its output would have scored every
  deriver-produced name as "literal". That measurement was thrown away and redone
  with a direct value-carrying read of `vars["--ds-x"] = <literal>` over the three
  `COMPILER_PRODUCER_ROOTS`. Only the second measurement is reported.

---

## 2. Chronology, measured

Each row is that commit's own tree measured by that commit's own instrument.

| commit | date | subject | denominator | debt | transitivelyUnwired | skin files |
| --- | --- | --- | --- | --- | --- | --- |
| `25d245167` | 2026-09-13 | WO-FAM-04 claimed for dispatch | 4789 | 2080 | 2121 | 387 |
| `8bcc3852b` | 2026-09-14 | chore(fam-04): refresh the remaining gate baselines and censuses | **5263** | **2427** | **2462** | 384 |
| `8bcc3852b` **as written into the baseline** | | | 5210 | 2079 | 2114 | 391 |
| `212439653` | 2026-09-16 | re-anchor radio/modal/message entrypoint ceilings | 5420 | 2330 | 2343 | 391 |
| `9d48a93b0` | 2026-09-16 | DT wave 8/9 progress (incl. `1f171b2db` data-table cut) | 5426 | 2337 | 2350 | 391 |
| `b29cf1e20` | 2026-09-16 | audit comparison base | 5426 | 2337 | 2350 | 391 |
| `814927519` | 2026-09-17 | audit candidate | 5439 | 2346 | 2359 | 391 |
| `ef34493c5` | 2026-09-17 | HEAD (two docs-only commits later) | 5439 | 2346 | 2359 | 391 |

The HEAD debt set is **identical name-for-name** to the candidate's: the two commits
after `814927519` touch only `roadmap/`. The audit's candidate figures are therefore
today's figures.

### The +267, decomposed

```
2079  written baseline
+348  never true: real debt at the write commit 8bcc3852b was 2427
 -90  real decrease 8bcc3852b -> b29cf1e20 (the family cuts, net, by name)
  +9  the 42 audited commits b29cf1e20..814927519 (13 in, 4 out)
----
2346  measured at HEAD          (2346 - 2079 = 267)
```

The same decomposition holds for `transitivelyUnwired` (+348 / −103 / +9 → 2359 vs
2114) and for the denominator (+53 / +163 / +13 → 5439 vs 5210).

---

## 3. Provenance of the invalid baseline — the decisive finding

**`8bcc3852b` is the single bad write, and it was red on arrival.** Exporting that
commit and running *its own* gate against *its own* tree:

```
cascade-wiring-ratchet FAILED:
  - debt GREW from 2079 to 2427
  - transitivelyUnwired GREW from 2114 to 2462
  - denominator moved from 5210 to 5263
```

The same procedure on the nine earlier baseline-writing commits returns **exit 0**
at every one (`a3ba2e479`, `59439fa13`, `cc99db18a`, `3f03ae71a`, `cea31faca`,
`14ce59e9c`, `cbce5ba71`, `bebfa7d3e`). The ratchet's history is honest up to and
including `bebfa7d3e` (2080/2121/4789, measured and matching).

Neither the walker nor the classifier can be blamed:
`git diff 8bcc3852b..HEAD` is **empty** for
`scripts/libraries/engine/skins/files/index.mjs` and for
`scripts/check/engine/cascade-wiring/index.mjs`. The corpus definition and the two
rules are byte-identical to the ones in force when the pin was written. Only
`scripts/libraries/tokens/producers/index.mjs` changed (+127/−9), and it feeds the
transitive arm alone.

**How the wrong number was produced.** `8bcc3852b` changes only gate baselines and
contracts — no CSS — so its CSS tree is identical to its parent `be96f027b`. The
`debtNote` records the method in its own words:

> "2080 → 2079 in WO-FAM-04, lowered in the commit that moved it. Set difference
> against 25d245167: 99 exits and 98 entries."

Measured against `25d245167`, the real set difference over that lot is
**442 entries and 95 exits** (2080 + 442 − 95 = 2427). The note's 98 named entries
are a verified **subset** of the 442: all 14 of its named runtime channels
(`--ds-dropdown-arrow-anchor-offset`, `--ds-tour-spotlight-*`, `--ds-viewport-*`, …)
really are new entries. The defect is not that the enumeration is wrong — it is that
**a hand enumeration was used as the census**. The lot's 344 unenumerated entries —
overwhelmingly the rewritten `notifier`, `alert`, `alert-dialog` and
`confirm-dialog` namespaces — were never counted, and the arithmetic of the sample
(−1) was written where the walker's number (+347) belonged.

The same hand-arithmetic signature is on the sibling fields. `rootsExcludedNote`
says "752 → 772 … 64 targets entered and 44 left" (752 + 64 − 44 = 772); the walker
measures **726** on that tree. The denominator was written 5210 against a measured
5263. No field in that write came from running the walker.

This matters for the disposition: the pin is not a stale measurement of an older
tree and not an instrument drift. **It is a number no tree in this repository has
ever produced.** Re-anchoring it to a measured value is a correction of a false
record, categorically different from widening a decrease-only ceiling — but it is
still an owner-reviewed act, not a writer's.

---

## 4. Class attribution of the 2346 debt names

Classes are assigned by membership in the historical named sets, so every one of the
2346 names carries exactly one class. Full per-name table in Appendix A.

| class | definition | count |
| --- | --- | --- |
| **(a)** | already debt at `8bcc3852b`, the commit that wrote `debt: 2079` — pre-existing debt the false baseline never counted | **1955** |
| **(a2)** | became debt between `8bcc3852b` and `b29cf1e20` — after the bad pin, before the audited delta (the WO-FAM-05..07 cuts, `1f171b2db`) | **378** |
| **(b)** | introduced by `b29cf1e20..814927519`, the 42 audited commits | **13** |
| | total | **2346** |

Neither "all new" nor "all inherited" survives: 83.3 % of today's debt predates the
bad pin, 16.1 % arrived between the pin and the audit base, and 0.55 % is the
audited delta — of which one name is a genuine new defect (§5).

### (c) — denominator moves

Rule (a) of the instrument excludes fallback destinations from the denominator, so
the denominator moves for two different reasons: new reads enter, and names that
*become* fallback targets leave. Both are legitimate; neither is debt.

| span | entries | exits | net | denominator |
| --- | --- | --- | --- | --- |
| `8bcc3852b` → HEAD | 460 | 284 | +176 | 5263 → 5439 |
| `b29cf1e20` → `814927519` (audited) | 20 | 7 | +13 | 5426 → 5439 |

Of the 460 denominator entries since the bad pin,
326 are debt at HEAD and
134 reach a root on arrival.
Full lists in Appendix D. The written 5210 was itself 53 short of its own tree, so
the gate's "denominator moved from 5210 to 5439" line overstates the real movement
by that much: the honest denominator movement since the write commit is
5263 → 5439.

---

## 5. The 42 audited commits, named in full

Thirteen names entered debt and four left. All thirteen come from three commits of
WO-FAM-08:

| channel | introduced by | read site | producer today |
| --- | --- | --- | --- |
| `--ds-gallery-view-aspect-ratio` | `be69bb75e (B7)` | `src/foundation/tokens/css/presentation/components/skin/gallery-view/index.css:70` | declared in its own skin |
| `--ds-gallery-view-columns` | `be69bb75e (B7)` | `src/foundation/tokens/css/presentation/components/skin/gallery-view/index.css:57` | declared in its own skin |
| `--ds-kanban-board-column-accent` | `32b2da644 (B5)` | `src/foundation/tokens/css/runtime/engines/modern/skin/pattern-kanban-board/index.css:159` | `kanbanBoardChromeDeriver` |
| `--ds-kanban-board-column-max-height` | `32b2da644 (B5)` | `src/foundation/tokens/css/runtime/engines/modern/skin/pattern-kanban-board/index.css:249` | `kanbanBoardChromeDeriver` |
| `--ds-kanban-board-column-min-width` | `32b2da644 (B5)` | `src/foundation/tokens/css/runtime/engines/modern/skin/pattern-kanban-board/index.css:143` | `kanbanBoardChromeDeriver` |
| `--ds-kanban-board-touch-target` | `32b2da644 (B5)` | `src/foundation/tokens/css/runtime/engines/modern/skin/pattern-kanban-board/index.css:354` | `kanbanBoardChromeDeriver` |
| `--ds-listing-grid-bottom-bleed` | `be69bb75e (B7)` | `src/foundation/tokens/css/presentation/components/skin/grid-view/index.css:55` | **none** |
| `--ds-virtual-list-block-size` | `be69bb75e (B7)` | `src/foundation/tokens/css/presentation/components/skin/virtual-list/index.css:45` | declared in its own skin |
| `--ds-virtual-list-item-inset-block-start` | `be69bb75e (B7)` | `src/foundation/tokens/css/presentation/components/skin/virtual-list/index.css:71` | declared in its own skin |
| `--ds-virtual-list-spacer-block-size` | `be69bb75e (B7)` | `src/foundation/tokens/css/presentation/components/skin/virtual-list/index.css:64` | declared in its own skin |
| `--ds-widget-board-cell-column` | `39e13cd80 (B6)` | `src/foundation/tokens/css/presentation/components/skin/widget-board/index.css:1554` | declared in its own skin |
| `--ds-widget-board-cell-height` | `39e13cd80 (B6)` | `src/foundation/tokens/css/presentation/components/skin/widget-board/index.css:1560` | declared in its own skin |
| `--ds-widget-board-cell-row` | `39e13cd80 (B6)` | `src/foundation/tokens/css/presentation/components/skin/widget-board/index.css:1555` | declared in its own skin |

Four names left debt in the same span:

- `--ds-kanban-column-accent`
- `--ds-kanban-column-max-height`
- `--ds-kanban-column-min-width`
- `--ds-kanban-touch-target`

**All four exits are the same four channels as four of the entries.** `32b2da644`
renamed the `--ds-kanban-*` spelling to `--ds-kanban-board-*` with byte-identical
fallbacks (`git show 32b2da644` on the kanban skin: `min-inline-size:
var(--ds-kanban-column-min-width, 280px)` → `var(--ds-kanban-board-column-min-width,
280px)`, and the same for accent, max-height and touch-target). **A scalar ratchet
cannot see a rename**: it reports +4/−4 where nothing changed. This is the single
strongest argument for pinning the named set rather than the count (§8).

Net of the rename, the audited delta introduces **nine** names:

- **One genuine defect.** `--ds-listing-grid-bottom-bleed`, read once at
  `src/foundation/tokens/css/presentation/components/skin/grid-view/index.css:55`
  as `padding-block: 1px var(--ds-listing-grid-bottom-bleed, 8px)`. Nobody declares
  it and no deriver emits it — its two namespace siblings
  `--ds-listing-grid-gap` and `--ds-listing-grid-min-compact-width` are both
  produced (`presentation/components/patterns/index.css:485,487` and
  `compilers/kernel/foundation/css/chrome-variables/index.ts:1149,1153`). This one
  read is the only name in the audited delta that is debt under any reading.
- **Eight produced channels with a literal read-site fallback.** `gallery-view` ×2,
  `virtual-list` ×3, `widget-board` ×3 — each declared with its resting value on
  its own family root, in the same file, by the same commit
  (`--ds-virtual-list-block-size: 100%` at `virtual-list/index.css:39`, etc.). The
  paint lands on a real value; only the read-site idiom differs.

The point is visible **inside one CSS rule**, authored by one commit
(`gallery-view/index.css:55-62`):

```css
.ds-pattern-gallery-view[data-part='root'][data-empty='false'] {
  grid-template-columns: var(--ds-gallery-view-columns, repeat(auto-fill, …));  /* debt */
  gap: var(--ds-gallery-view-gap, var(--ds-spacing-4, 16px));                    /* wired */
}
```

Both channels are declared on the family root four lines earlier. One repeats its
resting literal in the fallback and is counted as debt; the other names
`--ds-spacing-4` and is counted as wired. **The ratchet is measuring the read-site
fallback idiom, not whether the channel lands on a real value.**

The same lot produced seven new names that *do* reach a root and therefore never
entered debt (`--ds-kanban-board-column-gap`, `--ds-collection-card-gap`,
`--ds-calendar-view-entry-accent`, `--ds-grid-view-columns`, `--ds-grid-view-gap`,
`--ds-gallery-view-gap`, `--ds-column-menu-row-motion-duration`) — proof that the
distinction is an authoring convention inside a single lot, not a property of the
families.

---

## 6. Cross-check against `dt-gate-attribution-2026-09-16.md`

| DT claim | verdict | evidence |
| --- | --- | --- |
| "at `8bcc3852b`, the last baseline write, measured debt was already 2427 vs the 2079 written" | **CONFIRMED, exactly** | That commit's own gate on its own tree prints `debt GREW from 2079 to 2427`. Transitive 2462 and denominator 5263 are also confirmed, and were not in the DT's report. |
| "Pre-existing at `212439653`: debt 2079 → 2330, transitivelyUnwired 2114 → 2343" | **CONFIRMED** as measurements of `212439653` (2330 / 2343 / 5420) | Independent extraction of that tree. |
| "+7 debt / +7 transitive / +6 denominator by `1f171b2db`" | **CONFIRMED** | `212439653` → `9d48a93b0`: 2330→2337, 2343→2350, 5420→5426; named movement +50 / −43. |
| "251 names of family-cut drift" | **CORRECTED** | 251 is `2330 − 2079`, a subtraction against a pin that never named a set — it is **not a named class and no 251 names exist**. The real named movement `8bcc3852b` → `212439653` is **+328 entries / −425 exits, net −97**. The family cuts *reduced* measured debt by 97 names over that span. The entire 251 is 348 of false pin minus 97 of real improvement. |
| "the ratchet's read-site rule needs a `--ds-*` inside the fallback text, and derivers do count as producers (not a deriver blind spot)" | **CONFIRMED and extended** | Correct for the direct rule. §7 quantifies how far it reaches: 1744 of 2346 debt names have a producer. |
| "the 251 pre-existing cannot be re-pinned (decrease-only) and is a separate lot" | **CORRECTED in kind** | The decrease-only law binds a pin that was a measurement. `8bcc3852b`'s pin never was one, and its own gate rejected it the day it landed. The disposition is a reviewed correction of a false record, not a ceiling widening — see §9. |

The DT's report is sound wherever it reports a measurement. Its one incorrect move
is presenting a scalar difference as a named class, which is precisely what
finding R17-07 forbids.

---

## 7. What the 2346 actually are

Rule (b) asks only whether some read site spells a `--ds-` name inside the
`var()` fallback. `reachesTerminalRoot` deliberately "does not start from the name
itself", so a channel that is declared or emitted, but read with a literal fallback,
is counted identically to a channel nobody writes anywhere.

| | count | share |
| --- | --- | --- |
| debt names that **have a producer** (authored declaration or deriver emission) | **1744** | 74.3 % |
| debt names with **no producer anywhere** | **602** | 25.7 % |

Split by whether a root is already named in the producer's own value — i.e. whether
the read site could repeat it with **zero paint change**:

| producer / root status | total | live (modern, presentation) | frozen-only (classic, rustic) |
| --- | --- | --- | --- |
| yes-declared | 496 | 407 | 89 |
| yes-derived | 283 | 283 | 0 |
| no-literal-declared | 647 | 560 | 87 |
| no-literal-derived | 317 | 313 | 4 |
| unmeasured | 1 | 1 | 0 |
| no-producer | 602 | 452 | 150 |

And by skin home, which decides who may repair it at all:

| | count |
| --- | --- |
| read only in **frozen** engines (classic / rustic) | 330 |
| reachable by live work (modern and/or presentation) | 2016 |

**330 of the 2346 debt names live only in Classic and Rustic skins.**
Owner decision 2026-09-05 freezes both engines and forbids adding content, tokens,
tests or accessibility work to them. That fraction of the ratchet is, by standing
policy, unrepairable — a fact the scalar pin has never expressed.

### The transitive arm is a 13-name question

`transitivelyUnwired` (2359) exceeds `debt` (2346) by exactly **13** names. Those
are the chains that name a root and then die on a name nobody writes:

- `--ds-action-dock-safe-area-bottom` → `--ds-safe-area-bottom`
- `--ds-action-dock-safe-area-top` → `--ds-safe-area-top`
- `--ds-button-active-transform` → `--ds-recipe-scale-from`
- `--ds-button-transition` → `--ds-recipe-curve`, `--ds-recipe-enter`
- `--ds-collection-card-grid-bg` → `--ds-collection-card-grid-line`
- `--ds-data-table-header-font-family` → `--ds-typography-label-family`
- `--ds-rate-hover-color` → `--ds-rate-star-fill`
- `--ds-shell-header-padding-block-start` → `--ds-shell-safe-area-top`
- `--ds-shell-main-padding-block-end` → `--ds-shell-bottom-inset`
- `--ds-shell-main-padding-block-start` → `--ds-shell-safe-area-top`
- `--ds-shell-main-padding-inline-end` → `--ds-shell-safe-area-left`, `--ds-shell-safe-area-right`
- `--ds-shell-main-padding-inline-start` → `--ds-shell-safe-area-left`, `--ds-shell-safe-area-right`
- `--ds-shell-main-transition` → `--ds-shell-resolved-main-transition`

They die on **13 distinct terminals**, each already a fallback destination (so
already outside the denominator) and each with no producer:

- `--ds-collection-card-grid-line`
- `--ds-rate-star-fill`
- `--ds-recipe-curve`
- `--ds-recipe-enter`
- `--ds-recipe-scale-from`
- `--ds-safe-area-bottom`
- `--ds-safe-area-top`
- `--ds-shell-bottom-inset`
- `--ds-shell-resolved-main-transition`
- `--ds-shell-safe-area-left`
- `--ds-shell-safe-area-right`
- `--ds-shell-safe-area-top`
- `--ds-typography-label-family`

---

## 8. Instrument findings (proposals for the instrument's owner, not repairs)

1. **The baseline must pin the named set, not a scalar.** Four byte-identical
   renames in `32b2da644` netted to zero in a set of 2346 and would have netted to
   zero even if the rename had lost paint. The instrument already computes the
   arrays; only `main()` discards them. Pinning `debt` and `transitivelyUnwired`
   as sorted arrays makes the gate report entries and exits by name, makes a
   hand-enumerated note structurally impossible to substitute for a census, and
   would have made `8bcc3852b` fail review rather than fail CI two days later.
2. **A third class is needed: produced residue.** 74.3 % of the debt has a producer.
   The family-cut method — declare the family's resting value on its own root, read
   it in the skin — is the programme's own sanctioned method, and it raises this
   counter every time it is applied correctly. That is the exact failure the
   instrument's own header forbids under rule (a): *"Un ratchet que sube cuando
   arreglas algo no mide lo que dice medir."* Rule (a) excluded fallback
   destinations for this reason; the same reasoning applies to a name the tree
   genuinely produces.
3. **Frozen engines should be a declared, separate population.** 330
   names cannot be repaired by any authorized work order. Keeping them in one
   undifferentiated ceiling means the number can never reach zero and no lot can
   ever be scored against it.
4. **`skinFiles` has been stale since `a3ba2e479`** (391 pinned; 384 measured at
   `8bcc3852b`, 391 at HEAD by coincidence of the retirements and additions
   cancelling). No gate reads it. Either measure it or delete the field.

These are proposals. The instrument's owner is not this packet.

---

## 9. Source-bound repair path

Ordered by cost and risk. Owners are named where the source owner is unambiguous;
none of this is claimed as done, and none of it was performed.

**P0 — the one real defect from the audited delta.** Owner: **WO-FAM-08 B7**
(grid-view family). Give `--ds-listing-grid-bottom-bleed` a root-reaching read at
`grid-view/index.css:55`:
`padding-block: 1px var(--ds-listing-grid-bottom-bleed, var(--ds-spacing-2, 8px))`.
`--ds-spacing-2` is already a fallback destination and already produced, so the
denominator does not move and no paint changes (the ramp rests at the same 8px).
Effect: debt 2346 → 2345, transitive 2359 → 2358.

**P1 — the 13 dead terminals.** Owners by cluster:
- `--ds-safe-area-top`, `--ds-safe-area-bottom`, `--ds-shell-safe-area-{top,left,right}`,
  `--ds-shell-bottom-inset` — the shell/action-dock owner. These are viewport
  insets; the honest producer is a declared default beside the shell roots
  (`env(safe-area-inset-*)` at rest), not a fallback invented in each reader.
- `--ds-recipe-curve`, `--ds-recipe-enter`, `--ds-recipe-scale-from` — the motion
  recipe owner (`WO-EMI-02` retains the `--ds-recipe-profile` runtime readers).
  `--ds-button-transition` and `--ds-button-active-transform` name them and land
  nowhere.
- `--ds-shell-resolved-main-transition`, `--ds-collection-card-grid-line`,
  `--ds-rate-star-fill`, `--ds-typography-label-family` — one producer each, in the
  owning family's deriver or skin root.
  Note `--ds-data-table-header-font-family` falls back to
  `--ds-typography-label-family` while the type system produces the
  `--ds-type-*` spelling; this is the same produced-vs-consumed spelling mismatch
  R17-04 names for `--ds-type-section-title-font-weight` /
  `--ds-typography-section-title-weight`. Resolve the spelling, do not add a second
  name.
  Effect of P1 in full, simulated over the measured graph: transitive 2359 → 2346,
  debt and denominator unchanged. With P0, both land on **2345**.

**P2 — the 690 mechanically repairable live names.** For these the producer's own
value already names a `--ds-` root (`--ds-aspect-ratio-clip = var(--ds-aspect-ratio-overflow, hidden)`,
`--ds-avatar-initials-tracking = var(--ds-letter-spacing-wide, 0.025em)`, and the
496 authored declarations of the same shape). The read site repeats the root already
present in the declaration. **Zero paint change by construction**, verifiable by
artifact diff. This is a per-family mechanical lane and should be attached to each
family's own cut rather than run as one sweep — a sweep would collide with every
family write-set currently in flight.

**P3 — the 873 live names whose producer value is a bare literal.** These are
family structural constants. Each needs one of two owner decisions, per name or per
tight cluster:
- a root of the same meaning exists → root it, and **state the paint delta**. Worked
  example: `--ds-kanban-board-touch-target` rests at `2.75rem`; the root of the same
  meaning, `--ds-touch-target-min`, is `44px`
  (`foundation/themes/default/index.css:877`). At the 15px document root, 2.75rem is
  41.25px, so rooting it **changes the touch target by 2.75px upward** — a WCAG
  target-size improvement and a real visual change. It is a family-owner decision,
  not a mechanical rewire, and must not be slipped in as ratchet maintenance.
- no root of the same meaning → **named residue**, recorded with its reason.
  The honest residue categories visible in the audited delta are: measured runtime
  geometry (`--ds-virtual-list-block-size`, `-spacer-block-size`,
  `-item-inset-block-start`; `--ds-widget-board-cell-{row,column,height}` — values
  the virtualizer and the board compute per instance, which no theme root can own),
  caller-stated track models (`--ds-gallery-view-columns`,
  `--ds-gallery-view-aspect-ratio`), and absence-valued keywords
  (`--ds-kanban-board-column-max-height: none`,
  `--ds-kanban-board-column-accent: transparent` — where the resting value *is* the
  absence of the thing).

**P4 — the 452 live names with no producer anywhere.** These are the honest
overlap with the global `read-without-producer` gate (which reports 547 unresolved
of 4665 on a different corpus). Each is a producer decision or a dead-read
retirement, and belongs to the family cut that owns the skin. The largest clusters
are `detail-header` (17), `live-feed` (17), `form-builder` (11), `table-mobile` (11),
`step-wizard` (10), `workspace-switcher` (10). Full list in Appendix C.

**P5 — the 330 frozen-only names.** No repair is authorized. They need an
owner disposition: either a declared frozen-engine population excluded from the
live ceiling, or an explicit written exception. Until then no lot can drive this
ratchet to zero, and no lot should be asked to.

---

## 10. Derived baseline figures

**Marked derived. Nothing here was written to `baseline/index.json`, and writing it
is not this packet's to do.**

| scenario | denominator | debt | transitivelyUnwired | how obtained |
| --- | --- | --- | --- | --- |
| currently pinned | 5210 | 2079 | 2114 | a number no tree has produced |
| honest value of the pinned tree | 5263 | 2427 | 2462 | re-ran `8bcc3852b`'s gate on `8bcc3852b` |
| **honest value at HEAD `ef34493c5`** | **5439** | **2346** | **2359** | live gate, reproduced by the audit |
| after P1 (13 terminals produced) | 5439 | 2346 | 2346 | simulated on the measured fallback graph |
| after P0 + P1 | 5439 | **2345** | **2345** | simulated on the measured fallback graph |

The correct current baseline is therefore **5439 / 2346 / 2359**, with
`rootsExcluded` **755** and `skinFiles` **391** (measured, for the first time in
this field's history). Re-anchoring to it is a correction of a false record and
needs the owner's review; it is not the decrease-only law being widened, because
the law never had a measurement to bind. The DT's caution that "the 251 pre-existing
cannot be re-pinned (decrease-only)" is the right instinct applied to the wrong
object: the 2079 is not a floor the tree rose above, it is a clerical error in a
`chore` commit.

If the owner prefers not to re-anchor at all, the alternative that keeps the law
intact is to pin the named set as of HEAD, marked as a corrected census with this
report as its provenance, and require every later lot to report entries and exits
by name.

---

## 11. What this report does not establish

- It does not establish that the 2346 names are 2346 visual defects. 1744 have a
  producer; how many of those actually mispaint is a per-family question this
  packet did not open.
- It does not measure paint. No browser ran, no artifact was regenerated, no build
  was executed — the validation slot granted was read-only.
- It does not name *which* 348 names the `8bcc3852b` pin omitted, because a scalar
  cannot omit names. What it establishes is that the pin was never a measurement of
  any tree, and reconstructs the real set at that commit (2427 names, Appendix E).
- The P2/P3/P4 lane sizes are counts of names by producer shape, not estimates of
  effort. Whether a given read site can repeat its root without changing paint must
  be verified per name by the family owner.
- The `skinFiles` count reconciles at HEAD (391 pinned, 391 measured) only by
  coincidence; at `8bcc3852b` the tree held 384.

---

## Appendix A — all 2346 debt names at HEAD, classified

`class`: **a** = already debt at `8bcc3852b`; **a2** = entered between `8bcc3852b`
and `b29cf1e20`; **b** = entered in the 42 audited commits.
`producer/root`: `yes-declared`/`yes-derived` = a producer exists **and** its value
already names a `--ds-` root (P2, mechanical); `no-literal-*` = a producer exists
whose value is a bare literal (P3); `no-producer` = nobody writes it (P4);
`unmeasured` = produced, value shape not recoverable by a literal read.

| channel | class | producer/root | skin home | first read site |
| --- | --- | --- | --- | --- |
| `--ds-active-filters-bar-chips-basis` | a | no-literal-derived | presentation | `src/foundation/tokens/css/presentation/components/skin/active-filters-bar/index.css:154` |
| `--ds-active-filters-bar-count-block-size` | a | no-literal-derived | presentation | `src/foundation/tokens/css/presentation/components/skin/active-filters-bar/index.css:170` |
| `--ds-active-filters-bar-embedded-padding-block` | a | no-literal-derived | presentation | `src/foundation/tokens/css/presentation/components/skin/active-filters-bar/index.css:148` |
| `--ds-active-filters-bar-padding-block` | a | no-literal-derived | presentation | `src/foundation/tokens/css/presentation/components/skin/active-filters-bar/index.css:112` |
| `--ds-active-filters-bar-padding-inline` | a | no-literal-derived | presentation | `src/foundation/tokens/css/presentation/components/skin/active-filters-bar/index.css:113` |
| `--ds-activity-log-padding` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/activity-log/index.css:39` |
| `--ds-affix-affixed-backdrop` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/affix/index.css:69` |
| `--ds-affix-affixed-radius` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/affix/index.css:68` |
| `--ds-affix-shadow` | a | yes-declared | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/affix/index.css:17` |
| `--ds-alert-close-size` | a | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/alert/index.css:169` |
| `--ds-alert-compact-well-size` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/alert/index.css:114` |
| `--ds-alert-description-measure` | a | no-literal-declared | modern+presentation | `src/foundation/tokens/css/presentation/components/skin/alert-compounds/index.css:11` |
| `--ds-alert-dialog-enter-scale` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/alert-dialog/index.css:19` |
| `--ds-alert-dialog-enter-y` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/alert-dialog/index.css:19` |
| `--ds-alert-dialog-icon-size` | a | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/alert-dialog/index.css:136` |
| `--ds-alert-dialog-inline-size` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/alert-dialog/index.css:72` |
| `--ds-alert-dialog-max-inline-size` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/alert-dialog/index.css:74` |
| `--ds-alert-scale-step` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/alert/index.css:17` |
| `--ds-alert-well-size` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/alert/index.css:104` |
| `--ds-anchor-focus-ring-offset` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/anchor/index.css:175` |
| `--ds-anchor-item-font-size` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/anchor/index.css:107` |
| `--ds-anchor-item-font-weight-selected` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/anchor/index.css:138` |
| `--ds-anchor-item-line-height` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/anchor/index.css:108` |
| `--ds-anchor-list-max-block-size` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/anchor/index.css:81` |
| `--ds-approval-action-font-size` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/approval-workflow/index.css:139` |
| `--ds-approval-action-height` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/approval-workflow/index.css:135` |
| `--ds-approval-action-padding-inline` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/approval-workflow/index.css:137` |
| `--ds-approval-actions-gap` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/approval-workflow/index.css:310` |
| `--ds-approval-actions-margin-block-start` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/approval-workflow/index.css:311` |
| `--ds-approval-approver-font-size` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/approval-workflow/index.css:260` |
| `--ds-approval-approver-row-gap` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/approval-workflow/index.css:252` |
| `--ds-approval-badge-font-size` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/approval-workflow/index.css:275` |
| `--ds-approval-comment-font-size` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/approval-workflow/index.css:296` |
| `--ds-approval-comment-margin-block-start` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/approval-workflow/index.css:293` |
| `--ds-approval-comment-padding` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/approval-workflow/index.css:294` |
| `--ds-approval-connector-min-height` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/approval-workflow/index.css:238` |
| `--ds-approval-connector-width` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/approval-workflow/index.css:236` |
| `--ds-approval-disabled-opacity` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/approval-workflow/index.css:335` |
| `--ds-approval-dot-margin-block-start` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/approval-workflow/index.css:216` |
| `--ds-approval-dot-size` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/approval-workflow/index.css:213` |
| `--ds-approval-footer-margin-block-start` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/approval-workflow/index.css:181` |
| `--ds-approval-footer-padding-block-start` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/approval-workflow/index.css:182` |
| `--ds-approval-header-gap` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/approval-workflow/index.css:318` |
| `--ds-approval-header-margin-block-end` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/approval-workflow/index.css:319` |
| `--ds-approval-metadata-font-size` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/approval-workflow/index.css:301` |
| `--ds-approval-metadata-margin-block-start` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/approval-workflow/index.css:300` |
| `--ds-approval-skeleton-line-gap` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/approval-workflow/index.css:414` |
| `--ds-approval-skeleton-line-height` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/approval-workflow/index.css:419` |
| `--ds-approval-skeleton-steps-gap` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/approval-workflow/index.css:396` |
| `--ds-approval-skeleton-title-margin-block-end` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/approval-workflow/index.css:426` |
| `--ds-approval-skipped-opacity` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/approval-workflow/index.css:282` |
| `--ds-approval-step-gap` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/approval-workflow/index.css:203` |
| `--ds-approval-step-padding-block-end` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/approval-workflow/index.css:245` |
| `--ds-approval-timestamp-font-size` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/approval-workflow/index.css:287` |
| `--ds-approval-timestamp-margin-block-start` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/approval-workflow/index.css:286` |
| `--ds-approval-timestamp-numeric` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/approval-workflow/index.css:289` |
| `--ds-approval-title-font-size` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/approval-workflow/index.css:324` |
| `--ds-aspect-ratio-clip` | a2 | yes-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/aspect-ratio/index.css:20` |
| `--ds-aspect-ratio-corner` | a2 | yes-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/aspect-ratio/index.css:24` |
| `--ds-aspect-ratio-depth` | a2 | yes-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/aspect-ratio/index.css:25` |
| `--ds-aspect-ratio-frame` | a2 | yes-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/aspect-ratio/index.css:23` |
| `--ds-aspect-ratio-instance-max-width` | a | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/aspect-ratio/index.css:18` |
| `--ds-aspect-ratio-instance-ratio` | a | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/aspect-ratio/index.css:19` |
| `--ds-aspect-ratio-object-fit` | a | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/aspect-ratio/index.css:44` |
| `--ds-aspect-ratio-object-position` | a | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/aspect-ratio/index.css:45` |
| `--ds-aspect-ratio-surface` | a2 | yes-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/aspect-ratio/index.css:22` |
| `--ds-aspect-ratio-transition-duration` | a2 | yes-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/aspect-ratio/index.css:27` |
| `--ds-aspect-ratio-transition-timing` | a2 | yes-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/aspect-ratio/index.css:27` |
| `--ds-auto-complete-autofill-spread` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/auto-complete/index.css:122` |
| `--ds-auto-complete-dropdown-inline-size` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/auto-complete/index.css:197` |
| `--ds-auto-complete-dropdown-max-width` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/auto-complete/index.css:193` |
| `--ds-auto-complete-empty-min-height` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/auto-complete/index.css:250` |
| `--ds-autocomplete-bg` | a | no-literal-declared | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/autocomplete/index.css:38` |
| `--ds-autocomplete-border` | a | no-literal-declared | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/autocomplete/index.css:35` |
| `--ds-autocomplete-border-focus` | a | no-literal-declared | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/autocomplete/index.css:42` |
| `--ds-autocomplete-clear-color` | a | no-literal-declared | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/autocomplete/index.css:55` |
| `--ds-autocomplete-dropdown-bg` | a | no-literal-declared | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/autocomplete/index.css:59` |
| `--ds-autocomplete-dropdown-radius` | a | yes-declared | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/autocomplete/index.css:60` |
| `--ds-autocomplete-dropdown-shadow` | a | yes-declared | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/autocomplete/index.css:61` |
| `--ds-autocomplete-empty-color` | a | no-literal-declared | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/autocomplete/index.css:72` |
| `--ds-autocomplete-error-border` | a | no-literal-declared | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/autocomplete/index.css:45` |
| `--ds-autocomplete-option-bg-hover` | a | yes-declared | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/autocomplete/index.css:68` |
| `--ds-autocomplete-radius` | a | yes-declared | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/autocomplete/index.css:36` |
| `--ds-autocomplete-warning-border` | a | no-literal-declared | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/autocomplete/index.css:48` |
| `--ds-avatar-2xl-font-size` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/avatar/index.css:128` |
| `--ds-avatar-3xl-font-size` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/avatar/index.css:131` |
| `--ds-avatar-badge-dot-size` | a2 | no-producer | presentation | `src/foundation/tokens/css/presentation/components/skin/avatar-compounds/index.css:103` |
| `--ds-avatar-badge-size` | a2 | no-literal-declared | presentation | `src/foundation/tokens/css/presentation/components/skin/avatar-compounds/index.css:97` |
| `--ds-avatar-border-color` | a | no-literal-declared | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/avatar/index.css:81` |
| `--ds-avatar-border-width` | a | no-literal-declared | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/avatar/index.css:81` |
| `--ds-avatar-error-color` | a | yes-declared | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/avatar/index.css:72` |
| `--ds-avatar-fallback-icon-color` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/avatar/index.css:145` |
| `--ds-avatar-fallback-icon-size` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/avatar/index.css:143` |
| `--ds-avatar-gradient-color` | a | yes-declared | modern+rustic | `src/foundation/tokens/css/runtime/engines/modern/skin/avatar/index.css:199` |
| `--ds-avatar-initials-tracking` | a | yes-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/avatar/index.css:171` |
| `--ds-avatar-ink` | a2 | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/avatar/index.css:409` |
| `--ds-avatar-lg-font-size` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/avatar/index.css:122` |
| `--ds-avatar-lg-size` | a2 | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/avatar/index.css:395` |
| `--ds-avatar-md-font-size` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/avatar/index.css:119` |
| `--ds-avatar-primary-color` | a | yes-declared | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/avatar/index.css:56` |
| `--ds-avatar-radius-circle` | a | no-literal-declared | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/avatar/index.css:43` |
| `--ds-avatar-radius-rounded` | a | yes-declared | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/avatar/index.css:37` |
| `--ds-avatar-radius-square` | a | no-literal-declared | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/avatar/index.css:46` |
| `--ds-avatar-ring-offset` | a | no-literal-declared | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/avatar/index.css:87` |
| `--ds-avatar-ring-width` | a | no-literal-declared | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/avatar/index.css:86` |
| `--ds-avatar-secondary-color` | a | yes-declared | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/avatar/index.css:60` |
| `--ds-avatar-sm-size` | a2 | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/avatar/index.css:385` |
| `--ds-avatar-status-away` | a | no-literal-declared | modern+rustic | `src/foundation/tokens/css/runtime/engines/modern/skin/avatar/index.css:238` |
| `--ds-avatar-status-border` | a | no-literal-declared | modern+rustic | `src/foundation/tokens/css/runtime/engines/modern/skin/avatar/index.css:214` |
| `--ds-avatar-status-border-width` | a | yes-declared | modern+rustic | `src/foundation/tokens/css/runtime/engines/modern/skin/avatar/index.css:214` |
| `--ds-avatar-status-busy` | a | no-literal-declared | modern+rustic | `src/foundation/tokens/css/runtime/engines/modern/skin/avatar/index.css:241` |
| `--ds-avatar-status-offline` | a | no-literal-declared | modern+rustic | `src/foundation/tokens/css/runtime/engines/modern/skin/avatar/index.css:235` |
| `--ds-avatar-status-offset-x` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/avatar/index.css:216` |
| `--ds-avatar-status-online` | a | no-literal-declared | modern+rustic | `src/foundation/tokens/css/runtime/engines/modern/skin/avatar/index.css:232` |
| `--ds-avatar-success-color` | a | yes-declared | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/avatar/index.css:64` |
| `--ds-avatar-transition-timing` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/avatar/index.css:218` |
| `--ds-avatar-warning-color` | a | yes-declared | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/avatar/index.css:68` |
| `--ds-avatar-xl-font-size` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/avatar/index.css:125` |
| `--ds-avatar-xl-size` | a2 | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/avatar/index.css:400` |
| `--ds-avatar-xs-font-size` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/avatar/index.css:113` |
| `--ds-avatar-xs-size` | a2 | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/avatar/index.css:380` |
| `--ds-backtop-focus-ring-offset` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/back-top/index.css:125` |
| `--ds-backtop-hover-transform` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/back-top/index.css:106` |
| `--ds-backtop-inset-block-end` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/back-top/index.css:46` |
| `--ds-backtop-inset-inline-end` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/back-top/index.css:47` |
| `--ds-backtop-pressed-transform` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/back-top/index.css:118` |
| `--ds-backtop-size` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/back-top/index.css:57` |
| `--ds-badge-avatar-bleed` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/badge/index.css:198` |
| `--ds-badge-avatar-border` | a | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/badge/index.css:201` |
| `--ds-badge-avatar-border-width` | a | yes-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/badge/index.css:200` |
| `--ds-badge-avatar-radius` | a | yes-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/badge/index.css:202` |
| `--ds-badge-avatar-shadow` | a | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/badge/index.css:204` |
| `--ds-badge-bg` | a | no-producer | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/badge/index.css:53` |
| `--ds-badge-border-color` | a | yes-declared | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/badge/index.css:59` |
| `--ds-badge-border-radius` | a | yes-declared | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/badge/index.css:50` |
| `--ds-badge-border-width` | a | yes-declared | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/badge/index.css:59` |
| `--ds-badge-chip-max-inline-size` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/badge/index.css:88` |
| `--ds-badge-color` | a | no-producer | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/badge/index.css:54` |
| `--ds-badge-compact-font-weight` | a | yes-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/badge/index.css:84` |
| `--ds-badge-container-padding-inline` | a | yes-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/badge/index.css:559` |
| `--ds-badge-count-border-width` | a | yes-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/badge/index.css:240` |
| `--ds-badge-count-font-size` | a | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/badge/index.css:254` |
| `--ds-badge-count-font-weight` | a | yes-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/badge/index.css:255` |
| `--ds-badge-count-padding-inline` | a | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/badge/index.css:239` |
| `--ds-badge-count-radius` | a | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/badge/index.css:242` |
| `--ds-badge-disabled-filter` | a | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/badge/index.css:151` |
| `--ds-badge-disabled-opacity` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/badge/index.css:150` |
| `--ds-badge-dot-bg` | a | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/badge/index.css:220` |
| `--ds-badge-dot-border` | a | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/badge/index.css:218` |
| `--ds-badge-dot-border-width` | a | yes-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/badge/index.css:217` |
| `--ds-badge-dot-shadow` | a | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/badge/index.css:221` |
| `--ds-badge-dot-size` | a | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/badge/index.css:215` |
| `--ds-badge-font-weight` | a | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/badge/index.css:46` |
| `--ds-badge-frame` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/badge/index.css:51` |
| `--ds-badge-frame-width` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/badge/index.css:50` |
| `--ds-badge-ghost-bg` | a | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/badge/index.css:435` |
| `--ds-badge-ghost-border` | a | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/badge/index.css:437` |
| `--ds-badge-ghost-shadow` | a | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/badge/index.css:438` |
| `--ds-badge-hover-transform` | a | no-literal-declared | modern+rustic | `src/foundation/tokens/css/runtime/engines/modern/skin/badge/index.css:507` |
| `--ds-badge-icon-bg` | a | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/badge/index.css:187` |
| `--ds-badge-icon-border` | a | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/badge/index.css:185` |
| `--ds-badge-icon-border-width` | a | yes-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/badge/index.css:184` |
| `--ds-badge-icon-color` | a | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/badge/index.css:179` |
| `--ds-badge-icon-radius` | a | yes-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/badge/index.css:186` |
| `--ds-badge-icon-size` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/badge/index.css:177` |
| `--ds-badge-indicator-max-inline-size` | a | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/badge/index.css:345` |
| `--ds-badge-indicator-radius` | a | yes-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/badge/index.css:346` |
| `--ds-badge-letter-spacing` | a | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/badge/index.css:49` |
| `--ds-badge-line-height` | a | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/badge/index.css:48` |
| `--ds-badge-loading-opacity` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/badge/index.css:155` |
| `--ds-badge-max-inline-size` | a | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/badge/index.css:33` |
| `--ds-badge-outline-bg` | a | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/badge/index.css:442` |
| `--ds-badge-outline-shadow` | a | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/badge/index.css:445` |
| `--ds-badge-padding-y` | a | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/cockpit-header/index.css:399` |
| `--ds-badge-pill-max-inline-size` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/badge/index.css:93` |
| `--ds-badge-position-transform` | a | no-literal-derived | modern+rustic | `src/foundation/tokens/css/runtime/engines/modern/skin/badge/index.css:506` |
| `--ds-badge-press-transform` | a | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/badge/index.css:518` |
| `--ds-badge-pulse-duration` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/badge/index.css:543` |
| `--ds-badge-pulse-scale` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/badge/index.css:549` |
| `--ds-badge-pulse-timing` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/badge/index.css:544` |
| `--ds-badge-radius-full` | a | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/badge/index.css:111` |
| `--ds-badge-radius-none` | a | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/badge/index.css:99` |
| `--ds-badge-remove-bg` | a | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/badge/index.css:288` |
| `--ds-badge-remove-bleed` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/badge/index.css:282` |
| `--ds-badge-remove-border` | a | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/badge/index.css:285` |
| `--ds-badge-remove-border-width` | a | yes-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/badge/index.css:284` |
| `--ds-badge-remove-color` | a | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/badge/index.css:289` |
| `--ds-badge-remove-focus-ring` | a | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/badge/index.css:319` |
| `--ds-badge-remove-hover-bg` | a | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/badge/index.css:308` |
| `--ds-badge-remove-hover-transform` | a | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/badge/index.css:307` |
| `--ds-badge-remove-opacity` | a | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/badge/index.css:290` |
| `--ds-badge-remove-radius` | a | yes-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/badge/index.css:286` |
| `--ds-badge-remove-size` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/badge/index.css:275` |
| `--ds-badge-remove-touch-size` | a | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/badge/index.css:576` |
| `--ds-badge-shadow` | a | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/badge/index.css:61` |
| `--ds-badge-shadow-hover` | a | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/badge/index.css:505` |
| `--ds-badge-shadow-pressed` | a | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/badge/index.css:519` |
| `--ds-badge-soft-border` | a | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/badge/index.css:431` |
| `--ds-badge-solid-border` | a | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/badge/index.css:425` |
| `--ds-badge-touch-target` | a | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/badge/index.css:565` |
| `--ds-badge-z-index` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/badge/index.css:343` |
| `--ds-border-width-none` | a | yes-declared | presentation | `src/foundation/tokens/css/presentation/components/skin/collection-shell/index.css:180` |
| `--ds-border-width-thin` | a | yes-declared | presentation | `src/foundation/tokens/css/presentation/components/skin/gallery-view/index.css:143` |
| `--ds-bottom-tab-bar-z` | a | no-producer | presentation | `src/foundation/tokens/css/presentation/components/skin/bottom-tab-bar/index.css:128` |
| `--ds-box-corner-2xl` | a2 | yes-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/box/index.css:58` |
| `--ds-box-corner-full` | a2 | yes-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/box/index.css:62` |
| `--ds-box-corner-lg` | a2 | yes-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/box/index.css:50` |
| `--ds-box-corner-md` | a2 | yes-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/box/index.css:46` |
| `--ds-box-corner-sm` | a2 | yes-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/box/index.css:42` |
| `--ds-box-corner-xl` | a2 | yes-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/box/index.css:54` |
| `--ds-box-corner-xs` | a2 | unmeasured | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/box/index.css:38` |
| `--ds-box-depth-2xl` | a2 | yes-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/box/index.css:88` |
| `--ds-box-depth-lg` | a2 | yes-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/box/index.css:80` |
| `--ds-box-depth-md` | a2 | yes-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/box/index.css:76` |
| `--ds-box-depth-sm` | a2 | yes-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/box/index.css:72` |
| `--ds-box-depth-xl` | a2 | yes-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/box/index.css:84` |
| `--ds-box-depth-xs` | a2 | yes-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/box/index.css:68` |
| `--ds-breadcrumb-current-bg` | a2 | yes-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/breadcrumb/index.css:141` |
| `--ds-breadcrumb-current-border` | a2 | yes-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/breadcrumb/index.css:140` |
| `--ds-breadcrumb-current-keyline` | a2 | yes-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/breadcrumb/index.css:144` |
| `--ds-breadcrumb-ellipsis-bg` | a2 | yes-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/breadcrumb/index.css:174` |
| `--ds-breadcrumb-ellipsis-min-width` | a2 | yes-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/breadcrumb/index.css:170` |
| `--ds-breadcrumb-ellipsis-padding-inline` | a2 | yes-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/breadcrumb/index.css:172` |
| `--ds-breadcrumb-hover-bg` | a2 | yes-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/breadcrumb/index.css:107` |
| `--ds-breadcrumb-hover-border` | a2 | yes-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/breadcrumb/index.css:106` |
| `--ds-breadcrumb-hover-lift` | a2 | yes-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/breadcrumb/index.css:110` |
| `--ds-breadcrumb-hover-shadow` | a2 | yes-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/breadcrumb/index.css:109` |
| `--ds-breadcrumb-icon-bg` | a2 | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/breadcrumb/index.css:155` |
| `--ds-breadcrumb-item-height` | a | yes-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/breadcrumb/index.css:53` |
| `--ds-breadcrumb-item-padding-inline` | a | yes-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/breadcrumb/index.css:57` |
| `--ds-breadcrumb-label-max-width` | a | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/breadcrumb/index.css:86` |
| `--ds-breadcrumb-link-underline` | a2 | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/breadcrumb/index.css:94` |
| `--ds-breadcrumb-list-gap` | a2 | yes-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/breadcrumb/index.css:35` |
| `--ds-breadcrumb-motion-duration` | a2 | yes-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/breadcrumb/index.css:71` |
| `--ds-breadcrumb-motion-easing` | a2 | yes-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/breadcrumb/index.css:71` |
| `--ds-breadcrumb-padding` | a | yes-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/breadcrumb/index.css:17` |
| `--ds-breadcrumb-separator-opacity` | a2 | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/breadcrumb/index.css:165` |
| `--ds-breadcrumb-shadow` | a2 | yes-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/breadcrumb/index.css:23` |
| `--ds-button-active-filter` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/button/index.css:855` |
| `--ds-button-ai-bg` | a | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/button/index.css:660` |
| `--ds-button-ai-bg-active` | a | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/button/index.css:939` |
| `--ds-button-ai-bg-hover` | a | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/button/index.css:828` |
| `--ds-button-ai-border` | a | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/button/index.css:663` |
| `--ds-button-ai-border-active` | a | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/button/index.css:941` |
| `--ds-button-ai-border-hover` | a | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/button/index.css:830` |
| `--ds-button-ai-color` | a | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/button/index.css:662` |
| `--ds-button-ai-color-active` | a | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/button/index.css:940` |
| `--ds-button-ai-color-hover` | a | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/button/index.css:829` |
| `--ds-button-ai-texture` | a | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/button/index.css:661` |
| `--ds-button-attention-iteration-count` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/button/index.css:1098` |
| `--ds-button-border-width` | a | yes-declared | modern+presentation | `src/foundation/tokens/css/presentation/components/skin/button-group/index.css:91` |
| `--ds-button-border-width-focus` | a | no-literal-declared | modern+presentation | `src/foundation/tokens/css/presentation/components/skin/button-group/index.css:70` |
| `--ds-button-bordered-border` | a | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/button/index.css:687` |
| `--ds-button-danger-bg` | a | no-literal-derived | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/button/index.css:231` |
| `--ds-button-danger-border` | a | no-literal-derived | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/button/index.css:111` |
| `--ds-button-danger-color` | a | no-literal-derived | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/button/index.css:81` |
| `--ds-button-danger-hover-bg` | a | no-literal-derived | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/button/index.css:199` |
| `--ds-button-dashed-bg` | a | no-literal-declared | modern+rustic | `src/foundation/tokens/css/runtime/engines/modern/skin/button/index.css:624` |
| `--ds-button-dashed-bg-active` | a | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/button/index.css:904` |
| `--ds-button-dashed-bg-hover` | a | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/button/index.css:793` |
| `--ds-button-dashed-border` | a | yes-declared | modern+rustic | `src/foundation/tokens/css/runtime/engines/modern/skin/button/index.css:626` |
| `--ds-button-dashed-border-active` | a | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/button/index.css:906` |
| `--ds-button-dashed-border-hover` | a | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/button/index.css:795` |
| `--ds-button-dashed-border-style` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/button/index.css:627` |
| `--ds-button-dashed-color` | a | yes-declared | modern+rustic | `src/foundation/tokens/css/runtime/engines/modern/skin/button/index.css:625` |
| `--ds-button-dashed-color-active` | a | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/button/index.css:905` |
| `--ds-button-dashed-color-hover` | a | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/button/index.css:794` |
| `--ds-button-dashed-hover-bg` | a | no-producer | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/button/index.css:208` |
| `--ds-button-default-bg` | a | yes-declared | modern+rustic | `src/foundation/tokens/css/runtime/engines/modern/skin/button/index.css:603` |
| `--ds-button-default-bg-active` | a | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/button/index.css:1054` |
| `--ds-button-default-bg-hover` | a | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/button/index.css:772` |
| `--ds-button-default-border` | a | yes-declared | modern+rustic | `src/foundation/tokens/css/runtime/engines/modern/skin/button/index.css:1056` |
| `--ds-button-default-border-active` | a | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/button/index.css:885` |
| `--ds-button-default-border-hover` | a | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/button/index.css:774` |
| `--ds-button-default-color` | a | yes-declared | modern+rustic | `src/foundation/tokens/css/runtime/engines/modern/skin/button/index.css:604` |
| `--ds-button-default-color-active` | a | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/button/index.css:884` |
| `--ds-button-default-color-hover` | a | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/button/index.css:773` |
| `--ds-button-default-hover-bg` | a | no-producer | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/button/index.css:202` |
| `--ds-button-disabled-bg` | a | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/button/index.css:1124` |
| `--ds-button-disabled-border-color` | a | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/button/index.css:1126` |
| `--ds-button-disabled-color` | a | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/button/index.css:1125` |
| `--ds-button-disabled-cursor` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/button/index.css:1123` |
| `--ds-button-error-bg` | a | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/button/index.css:1015` |
| `--ds-button-error-bg-active` | a | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/button/index.css:911` |
| `--ds-button-error-bg-hover` | a | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/button/index.css:800` |
| `--ds-button-error-border` | a | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/button/index.css:634` |
| `--ds-button-error-border-active` | a | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/button/index.css:1016` |
| `--ds-button-error-border-hover` | a | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/button/index.css:1003` |
| `--ds-button-error-color` | a | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/button/index.css:633` |
| `--ds-button-error-color-active` | a | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/button/index.css:912` |
| `--ds-button-error-color-hover` | a | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/button/index.css:801` |
| `--ds-button-focus-ring-offset` | a | yes-declared | modern+presentation | `src/foundation/tokens/css/presentation/components/skin/button-group/index.css:70` |
| `--ds-button-font-family` | a | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/button/index.css:98` |
| `--ds-button-font-weight` | a | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/button/index.css:99` |
| `--ds-button-ghost-bg` | a | yes-declared | modern+rustic | `src/foundation/tokens/css/runtime/engines/modern/skin/button/index.css:610` |
| `--ds-button-ghost-bg-active` | a | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/button/index.css:890` |
| `--ds-button-ghost-border` | a | yes-declared | modern+rustic | `src/foundation/tokens/css/runtime/engines/modern/skin/button/index.css:612` |
| `--ds-button-ghost-border-active` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/button/index.css:892` |
| `--ds-button-ghost-border-hover` | a | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/button/index.css:781` |
| `--ds-button-ghost-color` | a | yes-declared | modern+rustic | `src/foundation/tokens/css/runtime/engines/modern/skin/button/index.css:611` |
| `--ds-button-ghost-color-active` | a | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/button/index.css:891` |
| `--ds-button-ghost-color-hover` | a | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/button/index.css:780` |
| `--ds-button-ghost-hover-bg` | a | no-producer | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/button/index.css:193` |
| `--ds-button-gradient` | a | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/button/index.css:677` |
| `--ds-button-group-divider-color` | a | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/button/index.css:526` |
| `--ds-button-group-mobile-direction` | a | no-literal-declared | presentation | `src/foundation/tokens/css/presentation/components/skin/button-group/index.css:111` |
| `--ds-button-group-mobile-gap` | a | yes-declared | presentation | `src/foundation/tokens/css/presentation/components/skin/button-group/index.css:112` |
| `--ds-button-group-mobile-width` | a | no-literal-declared | presentation | `src/foundation/tokens/css/presentation/components/skin/button-group/index.css:110` |
| `--ds-button-hover-filter` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/button/index.css:744` |
| `--ds-button-hover-transform` | a | no-literal-declared | modern+rustic | `src/foundation/tokens/css/runtime/engines/modern/skin/button/index.css:743` |
| `--ds-button-icon-active-transform` | a | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/button/index.css:865` |
| `--ds-button-icon-hover-transform` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/button/index.css:754` |
| `--ds-button-info-bg` | a | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/button/index.css:653` |
| `--ds-button-info-bg-active` | a | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/button/index.css:932` |
| `--ds-button-info-bg-hover` | a | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/button/index.css:821` |
| `--ds-button-info-border` | a | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/button/index.css:655` |
| `--ds-button-info-border-active` | a | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/button/index.css:934` |
| `--ds-button-info-border-hover` | a | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/button/index.css:823` |
| `--ds-button-info-color` | a | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/button/index.css:654` |
| `--ds-button-info-color-active` | a | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/button/index.css:933` |
| `--ds-button-info-color-hover` | a | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/button/index.css:822` |
| `--ds-button-label-offset-y` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/button/index.css:188` |
| `--ds-button-letter-spacing` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/button/index.css:101` |
| `--ds-button-lg-padding` | a | no-literal-declared | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/button/index.css:135` |
| `--ds-button-lg-padding-y` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/button/index.css:414` |
| `--ds-button-link-bg` | a | no-literal-declared | modern+rustic | `src/foundation/tokens/css/runtime/engines/modern/skin/button/index.css:668` |
| `--ds-button-link-bg-active` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/button/index.css:946` |
| `--ds-button-link-bg-hover` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/button/index.css:835` |
| `--ds-button-link-border` | a | no-literal-declared | modern+rustic | `src/foundation/tokens/css/runtime/engines/modern/skin/button/index.css:670` |
| `--ds-button-link-border-active` | a | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/button/index.css:948` |
| `--ds-button-link-border-hover` | a | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/button/index.css:837` |
| `--ds-button-link-color` | a | yes-declared | modern+rustic | `src/foundation/tokens/css/runtime/engines/modern/skin/button/index.css:669` |
| `--ds-button-link-color-active` | a | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/button/index.css:947` |
| `--ds-button-link-color-hover` | a | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/button/index.css:836` |
| `--ds-button-link-hover-bg` | a | no-producer | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/button/index.css:196` |
| `--ds-button-link-text-decoration` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/button/index.css:672` |
| `--ds-button-link-text-decoration-hover` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/button/index.css:839` |
| `--ds-button-link-underline-offset` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/button/index.css:673` |
| `--ds-button-loading-cursor` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/button/index.css:1138` |
| `--ds-button-md-padding` | a | no-literal-declared | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/button/index.css:130` |
| `--ds-button-md-padding-y` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/button/index.css:401` |
| `--ds-button-outline-bg` | a | no-producer | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/button/index.css:222` |
| `--ds-button-outline-border` | a | no-producer | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/button/index.css:67` |
| `--ds-button-outline-color` | a | no-producer | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/button/index.css:66` |
| `--ds-button-outline-hover-bg` | a | no-producer | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/button/index.css:190` |
| `--ds-button-primary-bg-active` | a | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/button/index.css:869` |
| `--ds-button-primary-bg-hover` | a | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/button/index.css:758` |
| `--ds-button-primary-border-active` | a | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/button/index.css:871` |
| `--ds-button-primary-border-hover` | a | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/button/index.css:760` |
| `--ds-button-primary-color-active` | a | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/button/index.css:870` |
| `--ds-button-primary-color-hover` | a | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/button/index.css:759` |
| `--ds-button-primary-hover-bg` | a | no-producer | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/button/index.css:184` |
| `--ds-button-pulse-shadow-end` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/button/index.css:1108` |
| `--ds-button-pulse-shadow-start` | a | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/button/index.css:1104` |
| `--ds-button-radius-circle` | a | no-producer | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/button/index.css:152` |
| `--ds-button-radius-round` | a | no-producer | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/button/index.css:149` |
| `--ds-button-resolved-height` | a | yes-declared | modern+presentation | `src/foundation/tokens/css/presentation/components/skin/button-icon/index.css:12` |
| `--ds-button-resolved-icon-size` | a | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/button/index.css:209` |
| `--ds-button-resolved-padding-y` | a | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/button/index.css:322` |
| `--ds-button-secondary-bg-active` | a | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/button/index.css:876` |
| `--ds-button-secondary-bg-hover` | a | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/button/index.css:765` |
| `--ds-button-secondary-border-active` | a | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/button/index.css:878` |
| `--ds-button-secondary-border-hover` | a | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/button/index.css:767` |
| `--ds-button-secondary-color-active` | a | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/button/index.css:877` |
| `--ds-button-secondary-color-hover` | a | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/button/index.css:766` |
| `--ds-button-secondary-hover-bg` | a | no-producer | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/button/index.css:187` |
| `--ds-button-sm-padding` | a | no-literal-declared | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/button/index.css:125` |
| `--ds-button-sm-padding-y` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/button/index.css:388` |
| `--ds-button-spinner-color` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/button/index.css:258` |
| `--ds-button-spinner-duration` | a | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/button/index.css:259` |
| `--ds-button-spinner-stroke-width` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/button/index.css:264` |
| `--ds-button-spinner-track-opacity` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/button/index.css:268` |
| `--ds-button-success-bg` | a | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/button/index.css:639` |
| `--ds-button-success-bg-active` | a | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/button/index.css:918` |
| `--ds-button-success-bg-hover` | a | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/button/index.css:807` |
| `--ds-button-success-border` | a | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/button/index.css:641` |
| `--ds-button-success-border-active` | a | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/button/index.css:920` |
| `--ds-button-success-border-hover` | a | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/button/index.css:809` |
| `--ds-button-success-color` | a | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/button/index.css:640` |
| `--ds-button-success-color-active` | a | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/button/index.css:919` |
| `--ds-button-success-color-hover` | a | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/button/index.css:808` |
| `--ds-button-surface-highlight` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/button/index.css:149` |
| `--ds-button-surface-highlight-active-opacity` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/button/index.css:860` |
| `--ds-button-surface-highlight-hover-opacity` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/button/index.css:749` |
| `--ds-button-surface-highlight-opacity` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/button/index.css:151` |
| `--ds-button-text-bg` | a | no-literal-declared | modern+rustic | `src/foundation/tokens/css/runtime/engines/modern/skin/button/index.css:617` |
| `--ds-button-text-bg-active` | a | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/button/index.css:897` |
| `--ds-button-text-bg-hover` | a | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/button/index.css:786` |
| `--ds-button-text-border` | a | no-literal-declared | modern+rustic | `src/foundation/tokens/css/runtime/engines/modern/skin/button/index.css:619` |
| `--ds-button-text-border-active` | a | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/button/index.css:899` |
| `--ds-button-text-border-hover` | a | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/button/index.css:788` |
| `--ds-button-text-color` | a | yes-declared | modern+rustic | `src/foundation/tokens/css/runtime/engines/modern/skin/button/index.css:618` |
| `--ds-button-text-color-active` | a | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/button/index.css:898` |
| `--ds-button-text-color-hover` | a | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/button/index.css:787` |
| `--ds-button-text-hover-bg` | a | no-producer | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/button/index.css:205` |
| `--ds-button-text-transform` | a | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/button/index.css:104` |
| `--ds-button-touch-target-min` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/button/index.css:1146` |
| `--ds-button-transition-duration` | a | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/button/index.css:117` |
| `--ds-button-transition-timing` | a | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/button/index.css:117` |
| `--ds-button-warning-bg` | a | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/button/index.css:646` |
| `--ds-button-warning-bg-active` | a | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/button/index.css:925` |
| `--ds-button-warning-bg-hover` | a | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/button/index.css:814` |
| `--ds-button-warning-border` | a | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/button/index.css:648` |
| `--ds-button-warning-border-active` | a | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/button/index.css:927` |
| `--ds-button-warning-border-hover` | a | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/button/index.css:816` |
| `--ds-button-warning-color` | a | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/button/index.css:647` |
| `--ds-button-warning-color-active` | a | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/button/index.css:926` |
| `--ds-button-warning-color-hover` | a | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/button/index.css:815` |
| `--ds-button-xl-font-size` | a | yes-declared | modern+rustic | `src/foundation/tokens/css/runtime/engines/modern/skin/button/index.css:432` |
| `--ds-button-xl-gap` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/button/index.css:431` |
| `--ds-button-xl-height` | a | no-literal-declared | modern+rustic | `src/foundation/tokens/css/runtime/engines/modern/skin/button/index.css:426` |
| `--ds-button-xl-icon-size` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/button/index.css:424` |
| `--ds-button-xl-line-height` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/button/index.css:433` |
| `--ds-button-xl-padding` | a | no-literal-declared | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/button/index.css:140` |
| `--ds-button-xl-padding-x` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/button/index.css:429` |
| `--ds-button-xl-padding-y` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/button/index.css:427` |
| `--ds-button-xs-font-size` | a | yes-declared | modern+rustic | `src/foundation/tokens/css/runtime/engines/modern/skin/button/index.css:380` |
| `--ds-button-xs-gap` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/button/index.css:379` |
| `--ds-button-xs-height` | a | no-literal-declared | modern+rustic | `src/foundation/tokens/css/runtime/engines/modern/skin/button/index.css:374` |
| `--ds-button-xs-icon-size` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/button/index.css:372` |
| `--ds-button-xs-line-height` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/button/index.css:381` |
| `--ds-button-xs-padding` | a | no-literal-declared | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/button/index.css:120` |
| `--ds-button-xs-padding-x` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/button/index.css:377` |
| `--ds-button-xs-padding-y` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/button/index.css:375` |
| `--ds-calendar-cell-disabled-opacity` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/calendar/index.css:200` |
| `--ds-calendar-compact-width` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/calendar/index.css:114` |
| `--ds-calendar-compact-width-coarse` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/calendar/index.css:118` |
| `--ds-calendar-nav-radius` | a | no-producer | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/calendar/index.css:46` |
| `--ds-calendar-view-cell-min-height` | a | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/pattern-calendar-view/index.css:169` |
| `--ds-calendar-view-cell-min-height-compact` | a | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/pattern-calendar-view/index.css:305` |
| `--ds-calendar-view-touch-target` | a | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/pattern-calendar-view/index.css:328` |
| `--ds-capability-anatomy-label-tracking` | a | no-producer | presentation | `src/foundation/tokens/css/presentation/components/skin/surface-states/index.css:78` |
| `--ds-capability-cell-min-size` | a | no-producer | presentation | `src/foundation/tokens/css/presentation/components/skin/surface-states/index.css:84` |
| `--ds-capability-disabled-opacity` | a | no-producer | presentation | `src/foundation/tokens/css/presentation/components/skin/surface-states/index.css:97` |
| `--ds-capability-opacity` | a | no-producer | presentation | `src/foundation/tokens/css/presentation/components/skin/surface-states/index.css:93` |
| `--ds-card-active-transform` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/card/index.css:162` |
| `--ds-card-body-font-size-sm` | a2 | yes-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/card/index.css:311` |
| `--ds-card-body-inline-min-size` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/card/index.css:377` |
| `--ds-card-body-padding-lg` | a | yes-declared | presentation | `src/foundation/tokens/css/presentation/components/skin/card-compounds/index.css:187` |
| `--ds-card-body-padding-sm` | a | yes-declared | presentation | `src/foundation/tokens/css/presentation/components/skin/card-compounds/index.css:181` |
| `--ds-card-border-style` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/card/index.css:134` |
| `--ds-card-bordered-shadow` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/card/index.css:115` |
| `--ds-card-cover-block-min-size` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/card/index.css:373` |
| `--ds-card-cover-inline-min-size` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/card/index.css:372` |
| `--ds-card-cover-inline-size` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/card/index.css:371` |
| `--ds-card-cover-min-height` | a2 | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/card/index.css:258` |
| `--ds-card-cover-object-position` | a | no-literal-declared | modern+presentation | `src/foundation/tokens/css/presentation/components/skin/card-compounds/index.css:309` |
| `--ds-card-cover-overlay-bg` | a | no-literal-declared | presentation | `src/foundation/tokens/css/presentation/components/skin/card-compounds/index.css:361` |
| `--ds-card-disabled-cursor` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/card/index.css:534` |
| `--ds-card-elevation-surface` | a | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/card/index.css:103` |
| `--ds-card-error-bg` | a2 | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/card/index.css:212` |
| `--ds-card-error-border-color` | a2 | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/card/index.css:211` |
| `--ds-card-error-title-color` | a2 | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/card/index.css:234` |
| `--ds-card-flat-border-width` | a | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/card/index.css:120` |
| `--ds-card-flat-shadow` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/card/index.css:121` |
| `--ds-card-focus-ring-offset` | a | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/card/index.css:190` |
| `--ds-card-footer-actions-gap` | a | yes-declared | presentation | `src/foundation/tokens/css/presentation/components/skin/card-compounds/index.css:195` |
| `--ds-card-footer-actions-inset` | a2 | yes-derived | presentation | `src/foundation/tokens/css/presentation/components/skin/card-compounds/index.css:236` |
| `--ds-card-footer-bg` | a | no-literal-declared | modern+presentation | `src/foundation/tokens/css/presentation/components/skin/card-compounds/index.css:197` |
| `--ds-card-footer-border-width` | a | yes-declared | modern+presentation | `src/foundation/tokens/css/presentation/components/skin/card-compounds/index.css:225` |
| `--ds-card-footer-padding` | a | yes-declared | presentation | `src/foundation/tokens/css/presentation/components/skin/card-compounds/index.css:219` |
| `--ds-card-footer-padding-lg` | a | yes-declared | presentation | `src/foundation/tokens/css/presentation/components/skin/card-compounds/index.css:222` |
| `--ds-card-footer-padding-sm` | a | yes-declared | presentation | `src/foundation/tokens/css/presentation/components/skin/card-compounds/index.css:216` |
| `--ds-card-ghost-bg` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/card/index.css:124` |
| `--ds-card-ghost-shadow` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/card/index.css:127` |
| `--ds-card-header-border-width` | a | yes-declared | modern+presentation | `src/foundation/tokens/css/presentation/components/skin/card-compounds/index.css:89` |
| `--ds-card-header-copy-max-width` | a | no-literal-declared | modern+presentation | `src/foundation/tokens/css/presentation/components/skin/card-compounds/index.css:107` |
| `--ds-card-header-extra-min-height` | a2 | yes-derived | presentation | `src/foundation/tokens/css/presentation/components/skin/card-compounds/index.css:151` |
| `--ds-card-header-extra-padding` | a | no-literal-declared | presentation | `src/foundation/tokens/css/presentation/components/skin/card-compounds/index.css:152` |
| `--ds-card-header-eyebrow-color` | a2 | yes-derived | presentation | `src/foundation/tokens/css/presentation/components/skin/card-compounds/index.css:112` |
| `--ds-card-header-eyebrow-size` | a | no-literal-declared | presentation | `src/foundation/tokens/css/presentation/components/skin/card-compounds/index.css:114` |
| `--ds-card-header-eyebrow-tracking` | a | no-literal-declared | presentation | `src/foundation/tokens/css/presentation/components/skin/card-compounds/index.css:116` |
| `--ds-card-header-icon-lift` | a2 | yes-derived | presentation | `src/foundation/tokens/css/presentation/components/skin/card-compounds/index.css:143` |
| `--ds-card-header-icon-shadow` | a2 | yes-derived | presentation | `src/foundation/tokens/css/presentation/components/skin/card-compounds/index.css:136` |
| `--ds-card-header-icon-shadow-hover` | a2 | yes-derived | presentation | `src/foundation/tokens/css/presentation/components/skin/card-compounds/index.css:146` |
| `--ds-card-header-icon-size` | a | no-literal-declared | presentation | `src/foundation/tokens/css/presentation/components/skin/card-compounds/index.css:127` |
| `--ds-card-header-min-height` | a | no-literal-declared | presentation | `src/foundation/tokens/css/presentation/components/skin/card-compounds/index.css:33` |
| `--ds-card-header-padding-bottom` | a | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/card/index.css:397` |
| `--ds-card-header-padding-lg` | a | yes-declared | presentation | `src/foundation/tokens/css/presentation/components/skin/card-compounds/index.css:54` |
| `--ds-card-header-padding-sm` | a | yes-declared | presentation | `src/foundation/tokens/css/presentation/components/skin/card-compounds/index.css:48` |
| `--ds-card-image-aspect-ratio` | a | no-literal-derived | presentation | `src/foundation/tokens/css/presentation/components/skin/card-compounds/index.css:252` |
| `--ds-card-image-block-size` | a2 | yes-derived | presentation | `src/foundation/tokens/css/presentation/components/skin/card-compounds/index.css:250` |
| `--ds-card-image-error-icon-size` | a | no-literal-declared | presentation | `src/foundation/tokens/css/presentation/components/skin/card-compounds/index.css:352` |
| `--ds-card-image-loading-duration` | a | yes-declared | presentation | `src/foundation/tokens/css/presentation/components/skin/card-compounds/index.css:349` |
| `--ds-card-image-loading-size` | a | no-literal-declared | presentation | `src/foundation/tokens/css/presentation/components/skin/card-compounds/index.css:344` |
| `--ds-card-image-loading-stroke` | a | no-literal-declared | presentation | `src/foundation/tokens/css/presentation/components/skin/card-compounds/index.css:346` |
| `--ds-card-image-placeholder-fill` | a2 | yes-derived | presentation | `src/foundation/tokens/css/presentation/components/skin/card-compounds/index.css:339` |
| `--ds-card-image-placeholder-ink` | a2 | yes-derived | presentation | `src/foundation/tokens/css/presentation/components/skin/card-compounds/index.css:340` |
| `--ds-card-image-radius-lg` | a2 | yes-derived | presentation | `src/foundation/tokens/css/presentation/components/skin/card-compounds/index.css:268` |
| `--ds-card-image-radius-md` | a2 | yes-derived | presentation | `src/foundation/tokens/css/presentation/components/skin/card-compounds/index.css:265` |
| `--ds-card-image-radius-sm` | a2 | yes-derived | presentation | `src/foundation/tokens/css/presentation/components/skin/card-compounds/index.css:262` |
| `--ds-card-info-bg` | a2 | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/card/index.css:217` |
| `--ds-card-info-border-color` | a2 | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/card/index.css:216` |
| `--ds-card-info-title-color` | a2 | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/card/index.css:238` |
| `--ds-card-instance-padding` | a2 | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/card/index.css:265` |
| `--ds-card-loading-backdrop-blur` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/card/index.css:274` |
| `--ds-card-loading-cover-opacity` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/card/index.css:259` |
| `--ds-card-loading-min-height` | a2 | yes-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/card/index.css:264` |
| `--ds-card-loading-overlay-bg` | a2 | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/card/index.css:276` |
| `--ds-card-nested-shadow` | a | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/card/index.css:521` |
| `--ds-card-outlined-border-hover` | a2 | yes-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/card/index.css:158` |
| `--ds-card-primary-bg` | a2 | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/card/index.css:197` |
| `--ds-card-primary-border-color` | a2 | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/card/index.css:196` |
| `--ds-card-primary-title-color` | a2 | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/card/index.css:222` |
| `--ds-card-radius-lg` | a | yes-declared | modern+rustic | `src/foundation/tokens/css/runtime/engines/modern/skin/card/index.css:92` |
| `--ds-card-radius-xl` | a | yes-declared | modern+rustic | `src/foundation/tokens/css/runtime/engines/modern/skin/card/index.css:96` |
| `--ds-card-shadow-lg` | a | yes-declared | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/card/index.css:68` |
| `--ds-card-spinner-size` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/card/index.css:281` |
| `--ds-card-spinner-stroke` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/card/index.css:283` |
| `--ds-card-state-overlay` | a | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/card/index.css:49` |
| `--ds-card-state-overlay-active-opacity` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/card/index.css:171` |
| `--ds-card-state-overlay-hover-opacity` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/card/index.css:63` |
| `--ds-card-state-overlay-selected-opacity` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/card/index.css:185` |
| `--ds-card-subtitle-font-size` | a | yes-declared | modern+presentation | `src/foundation/tokens/css/presentation/components/skin/card-compounds/index.css:104` |
| `--ds-card-subtitle-margin-top` | a | yes-declared | modern+presentation | `src/foundation/tokens/css/presentation/components/skin/card-compounds/index.css:106` |
| `--ds-card-success-bg` | a2 | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/card/index.css:202` |
| `--ds-card-success-border-color` | a2 | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/card/index.css:201` |
| `--ds-card-success-title-color` | a2 | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/card/index.css:226` |
| `--ds-card-title-font-size-lg` | a2 | yes-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/card/index.css:316` |
| `--ds-card-title-font-size-sm` | a2 | yes-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/card/index.css:310` |
| `--ds-card-title-line-height` | a | yes-declared | modern+presentation | `src/foundation/tokens/css/presentation/components/skin/card-compounds/index.css:96` |
| `--ds-card-transition` | a | yes-declared | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/card/index.css:30` |
| `--ds-card-transition-duration` | a | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/card/index.css:33` |
| `--ds-card-transition-timing` | a | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/card/index.css:33` |
| `--ds-card-underline-border-width` | a | yes-derived | modern+rustic | `src/foundation/tokens/css/runtime/engines/modern/skin/card/index.css:495` |
| `--ds-card-warning-bg` | a2 | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/card/index.css:207` |
| `--ds-card-warning-border-color` | a2 | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/card/index.css:206` |
| `--ds-card-warning-title-color` | a2 | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/card/index.css:230` |
| `--ds-carousel-arrow-bg` | a | no-producer | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/carousel/index.css:38` |
| `--ds-carousel-arrow-border` | a | no-producer | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/carousel/index.css:39` |
| `--ds-carousel-arrow-radius` | a | no-producer | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/carousel/index.css:40` |
| `--ds-carousel-arrow-size` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/carousel/index.css:126` |
| `--ds-carousel-arrow-size-coarse` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/carousel/index.css:177` |
| `--ds-carousel-controls-z` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/carousel/index.css:201` |
| `--ds-carousel-dot-radius` | a | no-producer | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/carousel/index.css:50` |
| `--ds-carousel-dot-selected-inline-size` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/carousel/index.css:219` |
| `--ds-carousel-dot-size` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/carousel/index.css:205` |
| `--ds-carousel-dot-touch-size` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/carousel/index.css:189` |
| `--ds-carousel-dots-gap` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/carousel/index.css:200` |
| `--ds-carousel-dots-transform` | a | no-producer | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/carousel/index.css:45` |
| `--ds-carousel-item-bg` | a | no-producer | presentation | `src/foundation/tokens/css/presentation/components/skin/carousel-compounds/index.css:24` |
| `--ds-carousel-item-bg-image` | a | no-producer | presentation | `src/foundation/tokens/css/presentation/components/skin/carousel-compounds/index.css:25` |
| `--ds-carousel-radius` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/carousel/index.css:64` |
| `--ds-carousel-slide-transform` | a | no-producer | modern+rustic | `src/foundation/tokens/css/runtime/engines/modern/skin/carousel/index.css:103` |
| `--ds-cascader-arrow-color` | a | no-producer | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/cascader/index.css:149` |
| `--ds-cascader-arrow-rotate-open` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/cascader/index.css:162` |
| `--ds-cascader-border-error` | a | no-producer | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/cascader/index.css:129` |
| `--ds-cascader-border-warning` | a | no-producer | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/cascader/index.css:132` |
| `--ds-cascader-clear-gap` | a | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/cascader/index.css:144` |
| `--ds-cascader-clear-inset-inline-end` | a | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/cascader/index.css:125` |
| `--ds-cascader-clear-size` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/cascader/index.css:128` |
| `--ds-cascader-column-max-height` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/cascader/index.css:254` |
| `--ds-cascader-column-width` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/cascader/index.css:252` |
| `--ds-cascader-empty-color` | a | no-producer | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/cascader/index.css:185` |
| `--ds-cascader-empty-min-height` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/cascader/index.css:235` |
| `--ds-cascader-item-bg-hover` | a | no-producer | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/cascader/index.css:201` |
| `--ds-cascader-item-bg-selected` | a | no-producer | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/cascader/index.css:204` |
| `--ds-cascader-menu-border` | a | no-producer | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/cascader/index.css:167` |
| `--ds-cascader-placeholder-color` | a | no-producer | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/cascader/index.css:139` |
| `--ds-cell-renderers-mono-color` | a | no-producer | presentation | `src/foundation/tokens/css/presentation/components/skin/cell-renderers/index.css:70` |
| `--ds-cell-renderers-score-radius` | a | no-producer | presentation | `src/foundation/tokens/css/presentation/components/skin/cell-renderers/index.css:151` |
| `--ds-chart-legend-font-size` | a | yes-declared | presentation | `src/foundation/tokens/css/presentation/components/skin/chart-foundation/index.css:56` |
| `--ds-chart-legend-gap` | a | yes-declared | presentation | `src/foundation/tokens/css/presentation/components/skin/chart-foundation/index.css:48` |
| `--ds-chart-legend-item-gap` | a | yes-declared | presentation | `src/foundation/tokens/css/presentation/components/skin/chart-foundation/index.css:55` |
| `--ds-chart-legend-margin-top` | a | yes-declared | presentation | `src/foundation/tokens/css/presentation/components/skin/chart-foundation/index.css:49` |
| `--ds-chart-tooltip-shift-x` | a | no-literal-declared | presentation | `src/foundation/tokens/css/presentation/components/skin/chart-foundation/index.css:982` |
| `--ds-chart-tooltip-x` | a | no-producer | presentation | `src/foundation/tokens/css/presentation/components/skin/chart-foundation/index.css:969` |
| `--ds-chart-tooltip-y` | a | no-producer | presentation | `src/foundation/tokens/css/presentation/components/skin/chart-foundation/index.css:968` |
| `--ds-checkbox-bg` | a | no-literal-declared | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/checkbox/index.css:34` |
| `--ds-checkbox-bg-disabled` | a | yes-declared | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/checkbox/index.css:39` |
| `--ds-checkbox-border-width` | a | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/checkbox/index.css:138` |
| `--ds-checkbox-box-radius` | a | no-producer | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/checkbox/index.css:33` |
| `--ds-checkbox-checked-color` | a | no-literal-declared | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/checkbox/index.css:65` |
| `--ds-checkbox-disabled-cursor` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/checkbox/index.css:70` |
| `--ds-checkbox-disabled-opacity` | a | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/checkbox/index.css:239` |
| `--ds-checkbox-error-border` | a | yes-declared | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/checkbox/index.css:55` |
| `--ds-checkbox-error-color` | a | no-literal-declared | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/checkbox/index.css:76` |
| `--ds-checkbox-fill` | a | no-producer | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/checkbox/index.css:42` |
| `--ds-checkbox-label-color-disabled` | a | yes-declared | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/checkbox/index.css:73` |
| `--ds-checkbox-md-size` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/checkbox/index.css:103` |
| `--ds-checkbox-radius-none` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/checkbox/index.css:119` |
| `--ds-checkbox-size-lg` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/checkbox/index.css:108` |
| `--ds-checkbox-size-xl` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/checkbox/index.css:113` |
| `--ds-checkbox-sm-size` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/checkbox/index.css:100` |
| `--ds-checkbox-text-gap` | a | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/checkbox/index.css:264` |
| `--ds-checkbox-xs-size` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/checkbox/index.css:93` |
| `--ds-cockpit-header-action-gap` | a | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/cockpit-header/index.css:354` |
| `--ds-cockpit-header-actions-backdrop` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/cockpit-header/index.css:243` |
| `--ds-cockpit-header-icon-size` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/cockpit-header/index.css:149` |
| `--ds-cockpit-header-item-gap` | a | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/cockpit-header/index.css:259` |
| `--ds-cockpit-header-padding` | a | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/cockpit-header/index.css:83` |
| `--ds-cockpit-header-padding-compact` | a | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/cockpit-header/index.css:91` |
| `--ds-cockpit-header-section-gap` | a | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/cockpit-header/index.css:321` |
| `--ds-cockpit-header-sticky-top` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/cockpit-header/index.css:95` |
| `--ds-cockpit-header-sticky-z` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/cockpit-header/index.css:96` |
| `--ds-collapse-arrow-motion-duration` | a2 | yes-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/collapse/index.css:473` |
| `--ds-collapse-arrow-motion-easing` | a2 | yes-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/collapse/index.css:333` |
| `--ds-collapse-content-bg` | a | no-literal-declared | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/collapse/index.css:69` |
| `--ds-collapse-content-default-idle-bg` | a | yes-declared | classic | `src/foundation/tokens/css/runtime/engines/classic/skin/collapse/index.css:110` |
| `--ds-collapse-content-default-idle-color` | a | yes-declared | classic+modern | `src/foundation/tokens/css/runtime/engines/classic/skin/collapse/index.css:111` |
| `--ds-collapse-content-default-idle-font-size` | a | yes-declared | classic+modern | `src/foundation/tokens/css/runtime/engines/classic/skin/collapse/index.css:118` |
| `--ds-collapse-content-default-idle-line-height` | a | yes-declared | classic+modern | `src/foundation/tokens/css/runtime/engines/classic/skin/collapse/index.css:119` |
| `--ds-collapse-content-default-idle-padding-x` | a | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/collapse/index.css:293` |
| `--ds-collapse-content-default-idle-padding-y` | a | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/collapse/index.css:297` |
| `--ds-collapse-content-ghost-idle-bg` | a | no-literal-declared | classic+modern | `src/foundation/tokens/css/runtime/engines/classic/skin/collapse/index.css:178` |
| `--ds-collapse-content-ghost-idle-color` | a2 | yes-declared | classic | `src/foundation/tokens/css/runtime/engines/classic/skin/collapse/index.css:179` |
| `--ds-collapse-content-ghost-idle-padding-x` | a2 | yes-declared | classic | `src/foundation/tokens/css/runtime/engines/classic/skin/collapse/index.css:184` |
| `--ds-collapse-content-ghost-idle-padding-y` | a2 | yes-declared | classic | `src/foundation/tokens/css/runtime/engines/classic/skin/collapse/index.css:183` |
| `--ds-collapse-content-lg-idle-padding-x` | a | yes-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/collapse/index.css:309` |
| `--ds-collapse-content-lg-idle-padding-y` | a | yes-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/collapse/index.css:313` |
| `--ds-collapse-content-padding-x` | a2 | no-producer | classic | `src/foundation/tokens/css/runtime/engines/classic/skin/collapse/index.css:117` |
| `--ds-collapse-content-padding-y` | a2 | no-producer | classic | `src/foundation/tokens/css/runtime/engines/classic/skin/collapse/index.css:116` |
| `--ds-collapse-content-sm-idle-padding-x` | a | yes-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/collapse/index.css:301` |
| `--ds-collapse-content-sm-idle-padding-y` | a | yes-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/collapse/index.css:305` |
| `--ds-collapse-content-surface` | a2 | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/collapse/index.css:240` |
| `--ds-collapse-header-default-active-bg` | a2 | yes-declared | classic | `src/foundation/tokens/css/runtime/engines/classic/skin/collapse/index.css:90` |
| `--ds-collapse-header-default-disabled-bg` | a | yes-declared | classic+modern | `src/foundation/tokens/css/runtime/engines/classic/skin/collapse/index.css:102` |
| `--ds-collapse-header-default-disabled-cursor` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/collapse/index.css:158` |
| `--ds-collapse-header-default-disabled-opacity` | a | no-literal-declared | classic+modern | `src/foundation/tokens/css/runtime/engines/classic/skin/collapse/index.css:105` |
| `--ds-collapse-header-default-expanded-bg` | a | yes-declared | classic+modern | `src/foundation/tokens/css/runtime/engines/classic/skin/collapse/index.css:95` |
| `--ds-collapse-header-default-expanded-border-color` | a2 | yes-declared | classic | `src/foundation/tokens/css/runtime/engines/classic/skin/collapse/index.css:97` |
| `--ds-collapse-header-default-expanded-color` | a2 | yes-declared | classic | `src/foundation/tokens/css/runtime/engines/classic/skin/collapse/index.css:96` |
| `--ds-collapse-header-default-focus-outline` | a2 | yes-declared | classic | `src/foundation/tokens/css/runtime/engines/classic/skin/collapse/index.css:85` |
| `--ds-collapse-header-default-focus-outline-offset` | a2 | no-literal-declared | classic | `src/foundation/tokens/css/runtime/engines/classic/skin/collapse/index.css:86` |
| `--ds-collapse-header-default-hover-color` | a2 | yes-declared | classic | `src/foundation/tokens/css/runtime/engines/classic/skin/collapse/index.css:81` |
| `--ds-collapse-header-default-idle-bg` | a | yes-declared | classic+modern | `src/foundation/tokens/css/runtime/engines/classic/skin/collapse/index.css:67` |
| `--ds-collapse-header-default-idle-border-color` | a2 | yes-declared | classic | `src/foundation/tokens/css/runtime/engines/classic/skin/collapse/index.css:143` |
| `--ds-collapse-header-default-idle-color` | a | yes-declared | classic+modern | `src/foundation/tokens/css/runtime/engines/classic/skin/collapse/index.css:68` |
| `--ds-collapse-header-default-idle-cursor` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/collapse/index.css:192` |
| `--ds-collapse-header-default-idle-font-size` | a | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/collapse/index.css:180` |
| `--ds-collapse-header-default-idle-line-height` | a | yes-declared | classic+modern | `src/foundation/tokens/css/runtime/engines/classic/skin/collapse/index.css:73` |
| `--ds-collapse-header-default-idle-padding-x` | a | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/collapse/index.css:270` |
| `--ds-collapse-header-default-idle-padding-y` | a | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/collapse/index.css:269` |
| `--ds-collapse-header-expanded-ink` | a2 | yes-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/collapse/index.css:207` |
| `--ds-collapse-header-font-size` | a2 | no-producer | classic | `src/foundation/tokens/css/runtime/engines/classic/skin/collapse/index.css:71` |
| `--ds-collapse-header-gap` | a2 | yes-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/collapse/index.css:434` |
| `--ds-collapse-header-ghost-hover-bg` | a2 | yes-declared | classic | `src/foundation/tokens/css/runtime/engines/classic/skin/collapse/index.css:173` |
| `--ds-collapse-header-ghost-hover-color` | a2 | yes-declared | classic | `src/foundation/tokens/css/runtime/engines/classic/skin/collapse/index.css:174` |
| `--ds-collapse-header-ghost-idle-bg` | a | no-literal-declared | classic+modern | `src/foundation/tokens/css/runtime/engines/classic/skin/collapse/index.css:165` |
| `--ds-collapse-header-ghost-idle-color` | a2 | yes-declared | classic | `src/foundation/tokens/css/runtime/engines/classic/skin/collapse/index.css:166` |
| `--ds-collapse-header-ghost-idle-padding-x` | a | yes-declared | classic+modern | `src/foundation/tokens/css/runtime/engines/classic/skin/collapse/index.css:169` |
| `--ds-collapse-header-ghost-idle-padding-y` | a | yes-declared | classic+modern | `src/foundation/tokens/css/runtime/engines/classic/skin/collapse/index.css:168` |
| `--ds-collapse-header-lg-idle-padding-x` | a | yes-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/collapse/index.css:278` |
| `--ds-collapse-header-lg-idle-padding-y` | a | yes-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/collapse/index.css:277` |
| `--ds-collapse-header-padding-x` | a2 | no-producer | classic | `src/foundation/tokens/css/runtime/engines/classic/skin/collapse/index.css:70` |
| `--ds-collapse-header-padding-y` | a2 | no-producer | classic | `src/foundation/tokens/css/runtime/engines/classic/skin/collapse/index.css:69` |
| `--ds-collapse-header-sm-idle-padding-x` | a | yes-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/collapse/index.css:274` |
| `--ds-collapse-header-sm-idle-padding-y` | a | yes-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/collapse/index.css:273` |
| `--ds-collapse-icon-default-disabled-color` | a2 | yes-declared | classic | `src/foundation/tokens/css/runtime/engines/classic/skin/collapse/index.css:138` |
| `--ds-collapse-icon-default-expanded-color` | a2 | yes-declared | classic | `src/foundation/tokens/css/runtime/engines/classic/skin/collapse/index.css:134` |
| `--ds-collapse-icon-default-idle-color` | a2 | yes-declared | classic | `src/foundation/tokens/css/runtime/engines/classic/skin/collapse/index.css:124` |
| `--ds-collapse-icon-default-idle-transition` | a2 | no-literal-declared | classic | `src/foundation/tokens/css/runtime/engines/classic/skin/collapse/index.css:125` |
| `--ds-collapse-icon-size` | a2 | no-producer | classic | `src/foundation/tokens/css/runtime/engines/classic/skin/collapse/index.css:129` |
| `--ds-collapse-panel-surface` | a2 | yes-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/collapse/index.css:144` |
| `--ds-collapse-radius` | a | yes-declared | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/collapse/index.css:43` |
| `--ds-collapse-reveal-motion-duration` | a2 | yes-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/collapse/index.css:450` |
| `--ds-collapse-reveal-motion-easing` | a2 | yes-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/collapse/index.css:451` |
| `--ds-collapse-root-bg` | a2 | no-producer | classic | `src/foundation/tokens/css/runtime/engines/classic/skin/collapse/index.css:28` |
| `--ds-collapse-root-border-color` | a2 | no-producer | classic | `src/foundation/tokens/css/runtime/engines/classic/skin/collapse/index.css:29` |
| `--ds-collapse-root-border-radius` | a2 | no-producer | classic | `src/foundation/tokens/css/runtime/engines/classic/skin/collapse/index.css:151` |
| `--ds-collapse-root-border-width` | a2 | no-producer | classic | `src/foundation/tokens/css/runtime/engines/classic/skin/collapse/index.css:30` |
| `--ds-collapse-root-bordered-idle-bg` | a2 | no-literal-declared | classic | `src/foundation/tokens/css/runtime/engines/classic/skin/collapse/index.css:49` |
| `--ds-collapse-root-bordered-idle-border-color` | a2 | yes-declared | classic | `src/foundation/tokens/css/runtime/engines/classic/skin/collapse/index.css:50` |
| `--ds-collapse-root-default-idle-border-style` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/collapse/index.css:170` |
| `--ds-collapse-root-default-idle-border-width` | a | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/collapse/index.css:170` |
| `--ds-collapse-root-default-idle-shadow` | a | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/collapse/index.css:145` |
| `--ds-collapse-root-ghost-idle-bg` | a | no-literal-declared | classic+modern | `src/foundation/tokens/css/runtime/engines/classic/skin/collapse/index.css:43` |
| `--ds-collapse-root-ghost-idle-border-radius` | a | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/collapse/index.css:148` |
| `--ds-collapse-root-ghost-idle-shadow` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/collapse/index.css:150` |
| `--ds-collapse-root-shadow` | a2 | no-producer | classic | `src/foundation/tokens/css/runtime/engines/classic/skin/collapse/index.css:33` |
| `--ds-collapse-size-large-content-padding-x` | a2 | yes-declared | classic | `src/foundation/tokens/css/runtime/engines/classic/skin/collapse/index.css:225` |
| `--ds-collapse-size-large-content-padding-y` | a2 | yes-declared | classic | `src/foundation/tokens/css/runtime/engines/classic/skin/collapse/index.css:224` |
| `--ds-collapse-size-large-header-font-size` | a2 | yes-declared | classic | `src/foundation/tokens/css/runtime/engines/classic/skin/collapse/index.css:220` |
| `--ds-collapse-size-large-header-padding-x` | a2 | yes-declared | classic | `src/foundation/tokens/css/runtime/engines/classic/skin/collapse/index.css:219` |
| `--ds-collapse-size-large-header-padding-y` | a2 | yes-declared | classic | `src/foundation/tokens/css/runtime/engines/classic/skin/collapse/index.css:218` |
| `--ds-collapse-size-large-icon-size` | a2 | no-literal-declared | classic | `src/foundation/tokens/css/runtime/engines/classic/skin/collapse/index.css:229` |
| `--ds-collapse-size-small-content-padding-x` | a2 | yes-declared | classic | `src/foundation/tokens/css/runtime/engines/classic/skin/collapse/index.css:208` |
| `--ds-collapse-size-small-content-padding-y` | a2 | yes-declared | classic | `src/foundation/tokens/css/runtime/engines/classic/skin/collapse/index.css:207` |
| `--ds-collapse-size-small-header-font-size` | a2 | yes-declared | classic | `src/foundation/tokens/css/runtime/engines/classic/skin/collapse/index.css:203` |
| `--ds-collapse-size-small-header-padding-x` | a2 | yes-declared | classic | `src/foundation/tokens/css/runtime/engines/classic/skin/collapse/index.css:202` |
| `--ds-collapse-size-small-header-padding-y` | a2 | yes-declared | classic | `src/foundation/tokens/css/runtime/engines/classic/skin/collapse/index.css:201` |
| `--ds-collapse-size-small-icon-size` | a2 | no-literal-declared | classic | `src/foundation/tokens/css/runtime/engines/classic/skin/collapse/index.css:212` |
| `--ds-collapse-state-motion-duration` | a2 | yes-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/collapse/index.css:333` |
| `--ds-collapse-transition` | a2 | yes-declared | classic | `src/foundation/tokens/css/runtime/engines/classic/skin/collapse/index.css:75` |
| `--ds-collection-card-depth` | a | no-producer | presentation | `src/foundation/tokens/css/presentation/components/skin/grid-view/index.css:130` |
| `--ds-collection-card-glass-bg` | a | no-producer | presentation | `src/foundation/tokens/css/presentation/components/skin/grid-view/index.css:80` |
| `--ds-collection-card-hover-transform` | a | no-producer | presentation | `src/foundation/tokens/css/presentation/components/skin/grid-view/index.css:139` |
| `--ds-collection-card-min-height` | a | no-producer | presentation | `src/foundation/tokens/css/presentation/components/skin/grid-view/index.css:81` |
| `--ds-collection-card-overlay` | a | no-producer | presentation | `src/foundation/tokens/css/presentation/components/skin/grid-view/index.css:121` |
| `--ds-collection-card-sheen` | a | no-producer | presentation | `src/foundation/tokens/css/presentation/components/skin/grid-view/index.css:122` |
| `--ds-collection-filter-dropdown-width` | a | no-producer | presentation | `src/foundation/tokens/css/presentation/components/skin/collection-workspace/index.css:999` |
| `--ds-collection-header-actions-backdrop` | a | no-producer | presentation | `src/foundation/tokens/css/presentation/components/skin/collection-header/index.css:412` |
| `--ds-collection-header-sheen-duration` | a | no-producer | presentation | `src/foundation/tokens/css/presentation/components/skin/collection-header/index.css:166` |
| `--ds-collection-header-sheen-opacity` | a | no-producer | presentation | `src/foundation/tokens/css/presentation/components/skin/collection-header/index.css:162` |
| `--ds-color-accent` | a | yes-declared | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/workspace-switcher/index.css:39` |
| `--ds-color-alpha-black-40` | a | no-literal-declared | modern+rustic | `src/foundation/tokens/css/runtime/engines/modern/skin/image/index.css:179` |
| `--ds-color-alpha-black-70` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/moderation-gallery/index.css:141` |
| `--ds-color-alpha-error-10` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/badge/index.css:410` |
| `--ds-color-alpha-primary-5` | a | no-producer | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/table/index.css:169` |
| `--ds-color-alpha-white-80` | a | no-literal-declared | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/form-builder/index.css:174` |
| `--ds-color-bg-subtle` | a | yes-declared | presentation | `src/foundation/tokens/css/presentation/components/skin/data-terminal-card/index.css:207` |
| `--ds-color-error-100` | a | no-literal-declared | modern+presentation | `src/foundation/tokens/css/presentation/components/skin/activity-cards/index.css:159` |
| `--ds-color-error-200` | a | no-literal-declared | modern+presentation | `src/foundation/tokens/css/presentation/components/skin/activity-cards/index.css:165` |
| `--ds-color-error-300` | a | no-literal-declared | modern+rustic | `src/foundation/tokens/css/runtime/engines/modern/skin/detail-panel/index.css:284` |
| `--ds-color-error-50` | a | no-literal-declared | modern+rustic | `src/foundation/tokens/css/runtime/engines/modern/skin/detail-panel/index.css:283` |
| `--ds-color-error-600` | a | no-literal-declared | modern+rustic | `src/foundation/tokens/css/runtime/engines/modern/skin/approval-inbox/index.css:214` |
| `--ds-color-error-800` | a | no-literal-declared | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/callout/index.css:39` |
| `--ds-color-hairline` | a | yes-declared | presentation | `src/foundation/tokens/css/presentation/components/skin/ascii-frame/index.css:25` |
| `--ds-color-hairline-strong` | a | yes-declared | presentation | `src/foundation/tokens/css/presentation/components/skin/ascii-diagram/index.css:52` |
| `--ds-color-info-100` | a | no-literal-declared | modern+presentation | `src/foundation/tokens/css/presentation/components/skin/activity-cards/index.css:157` |
| `--ds-color-info-200` | a | no-literal-declared | modern+presentation | `src/foundation/tokens/css/presentation/components/skin/activity-cards/index.css:163` |
| `--ds-color-info-50` | a | no-literal-declared | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/callout/index.css:30` |
| `--ds-color-info-500` | a | no-literal-declared | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/callout/index.css:49` |
| `--ds-color-info-800` | a | no-literal-declared | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/callout/index.css:31` |
| `--ds-color-mono-0` | a | yes-declared | presentation | `src/foundation/tokens/css/presentation/components/skin/invert-section/index.css:43` |
| `--ds-color-mono-1000` | a | yes-declared | presentation | `src/foundation/tokens/css/presentation/components/skin/invert-section/index.css:19` |
| `--ds-color-mono-400` | a | yes-declared | presentation | `src/foundation/tokens/css/presentation/components/skin/invert-section/index.css:46` |
| `--ds-color-mono-600` | a | yes-declared | presentation | `src/foundation/tokens/css/presentation/components/skin/invert-section/index.css:23` |
| `--ds-color-mono-700` | a | yes-declared | presentation | `src/foundation/tokens/css/presentation/components/skin/terminal-block/index.css:51` |
| `--ds-color-neutral-0` | a | yes-declared | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/approval-workflow/index.css:25` |
| `--ds-color-picker-check-height` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/color-picker/index.css:276` |
| `--ds-color-picker-check-transform` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/color-picker/index.css:279` |
| `--ds-color-picker-check-width` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/color-picker/index.css:275` |
| `--ds-color-picker-height` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/color-picker/index.css:138` |
| `--ds-color-picker-preset-color` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/color-picker/index.css:249` |
| `--ds-color-picker-swatch-color` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/color-picker/index.css:49` |
| `--ds-color-picker-swatch-hover-scale` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/color-picker/index.css:286` |
| `--ds-color-primary-600` | a | no-literal-declared | modern+rustic | `src/foundation/tokens/css/runtime/engines/modern/skin/detail-panel/index.css:261` |
| `--ds-color-primary-subtle` | a | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/approval-inbox/index.css:249` |
| `--ds-color-secondary-100` | a | no-literal-declared | presentation | `src/foundation/tokens/css/presentation/components/skin/activity-ticker/index.css:94` |
| `--ds-color-secondary-600` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/badge/index.css:390` |
| `--ds-color-success-50` | a | no-literal-declared | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/approval-workflow/index.css:108` |
| `--ds-color-success-800` | a | no-literal-declared | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/callout/index.css:43` |
| `--ds-color-surface-ink` | a | yes-declared | presentation | `src/foundation/tokens/css/presentation/components/skin/invert-section/index.css:20` |
| `--ds-color-surface-paper` | a | yes-declared | presentation | `src/foundation/tokens/css/presentation/components/skin/invert-section/index.css:44` |
| `--ds-color-text-subtle` | a | yes-declared | presentation | `src/foundation/tokens/css/presentation/components/skin/data-terminal-card/index.css:202` |
| `--ds-color-warning-100` | a | no-literal-declared | modern+presentation | `src/foundation/tokens/css/presentation/components/skin/activity-cards/index.css:158` |
| `--ds-color-warning-200` | a | no-literal-declared | modern+presentation | `src/foundation/tokens/css/presentation/components/skin/activity-cards/index.css:164` |
| `--ds-color-warning-400` | a | no-literal-declared | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/approval-workflow/index.css:164` |
| `--ds-color-warning-50` | a | no-literal-declared | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/approval-workflow/index.css:118` |
| `--ds-color-warning-800` | a | no-literal-declared | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/callout/index.css:35` |
| `--ds-colorpicker-clear-bg` | a | no-producer | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/color-picker/index.css:85` |
| `--ds-colorpicker-clear-border` | a | no-producer | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/color-picker/index.css:89` |
| `--ds-colorpicker-clear-radius` | a | no-producer | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/color-picker/index.css:86` |
| `--ds-colorpicker-divider-color` | a | no-producer | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/color-picker/index.css:81` |
| `--ds-colorpicker-dropdown-bg` | a | no-producer | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/color-picker/index.css:50` |
| `--ds-colorpicker-dropdown-radius` | a | no-producer | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/color-picker/index.css:51` |
| `--ds-colorpicker-dropdown-shadow` | a | no-producer | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/color-picker/index.css:52` |
| `--ds-colorpicker-input-bg` | a | no-producer | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/color-picker/index.css:61` |
| `--ds-colorpicker-input-border` | a | no-producer | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/color-picker/index.css:64` |
| `--ds-colorpicker-input-radius` | a | no-producer | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/color-picker/index.css:60` |
| `--ds-colorpicker-label-color` | a | no-producer | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/color-picker/index.css:68` |
| `--ds-colorpicker-preset-border` | a | no-producer | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/color-picker/index.css:76` |
| `--ds-colorpicker-preset-color` | a | no-producer | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/color-picker/index.css:73` |
| `--ds-colorpicker-preset-radius` | a | no-producer | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/color-picker/index.css:72` |
| `--ds-colorpicker-swatch-border` | a | no-producer | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/color-picker/index.css:46` |
| `--ds-colorpicker-swatch-color` | a | no-producer | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/color-picker/index.css:43` |
| `--ds-colorpicker-swatch-radius` | a | no-producer | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/color-picker/index.css:41` |
| `--ds-colorpicker-swatch-shadow` | a | no-producer | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/color-picker/index.css:42` |
| `--ds-column-menu-body-max-block-size` | a | no-literal-derived | presentation | `src/foundation/tokens/css/presentation/components/skin/column-menu/index.css:156` |
| `--ds-column-menu-body-padding` | a | no-literal-derived | presentation | `src/foundation/tokens/css/presentation/components/skin/column-menu/index.css:159` |
| `--ds-column-menu-count-block-size` | a | no-literal-derived | presentation | `src/foundation/tokens/css/presentation/components/skin/column-menu/index.css:175` |
| `--ds-column-menu-count-min-inline-size` | a | no-literal-derived | presentation | `src/foundation/tokens/css/presentation/components/skin/column-menu/index.css:174` |
| `--ds-column-menu-count-padding-inline` | a | no-literal-derived | presentation | `src/foundation/tokens/css/presentation/components/skin/column-menu/index.css:176` |
| `--ds-column-menu-footer-padding` | a | no-literal-derived | presentation | `src/foundation/tokens/css/presentation/components/skin/column-menu/index.css:401` |
| `--ds-column-menu-header-padding` | a | no-literal-derived | presentation | `src/foundation/tokens/css/presentation/components/skin/column-menu/index.css:124` |
| `--ds-column-menu-panel-backdrop` | a | no-literal-derived | presentation | `src/foundation/tokens/css/presentation/components/skin/column-menu/index.css:97` |
| `--ds-column-menu-panel-focus-outline-offset` | a | no-literal-derived | presentation | `src/foundation/tokens/css/presentation/components/skin/column-menu/index.css:120` |
| `--ds-column-menu-panel-inline-size` | a | no-literal-derived | presentation | `src/foundation/tokens/css/presentation/components/skin/column-menu/index.css:53` |
| `--ds-column-menu-row-padding` | a | no-literal-derived | presentation | `src/foundation/tokens/css/presentation/components/skin/column-menu/index.css:238` |
| `--ds-column-menu-section-gap` | a | no-literal-derived | presentation | `src/foundation/tokens/css/presentation/components/skin/column-menu/index.css:378` |
| `--ds-column-menu-section-padding-block-start` | a | no-literal-derived | presentation | `src/foundation/tokens/css/presentation/components/skin/column-menu/index.css:379` |
| `--ds-column-menu-viewport-gutter` | a | no-literal-derived | presentation | `src/foundation/tokens/css/presentation/components/skin/column-menu/index.css:54` |
| `--ds-column-menu-viewport-reservation` | a | no-literal-derived | presentation | `src/foundation/tokens/css/presentation/components/skin/column-menu/index.css:157` |
| `--ds-column-settings-empty-padding-block` | a | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/column-settings/index.css:184` |
| `--ds-column-settings-empty-padding-inline` | a | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/column-settings/index.css:185` |
| `--ds-column-settings-footer-padding-block` | a | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/column-settings/index.css:192` |
| `--ds-column-settings-footer-padding-inline` | a | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/column-settings/index.css:193` |
| `--ds-column-settings-header-padding-block` | a | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/column-settings/index.css:43` |
| `--ds-column-settings-header-padding-block-end` | a | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/column-settings/index.css:44` |
| `--ds-column-settings-header-padding-inline` | a | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/column-settings/index.css:45` |
| `--ds-column-settings-list-max-block-size` | a | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/column-settings/index.css:67` |
| `--ds-column-settings-list-padding-block` | a | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/column-settings/index.css:68` |
| `--ds-column-settings-pin-side-font-size` | a | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/column-settings/index.css:176` |
| `--ds-column-settings-row-padding-block` | a | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/column-settings/index.css:80` |
| `--ds-column-settings-row-padding-inline` | a | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/column-settings/index.css:81` |
| `--ds-column-settings-search-padding-block` | a | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/column-settings/index.css:61` |
| `--ds-column-settings-search-padding-inline` | a | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/column-settings/index.css:62` |
| `--ds-comment-thread-rail-width` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/comment-thread/index.css:162` |
| `--ds-comment-thread-touch-target-min` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/comment-thread/index.css:201` |
| `--ds-compare-divider-width` | a | no-producer | presentation | `src/foundation/tokens/css/presentation/components/skin/compare/index.css:40` |
| `--ds-confirm-dialog-enter-scale` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/confirm-dialog/index.css:19` |
| `--ds-confirm-dialog-enter-y` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/confirm-dialog/index.css:19` |
| `--ds-confirm-dialog-icon-size` | a | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/confirm-dialog/index.css:136` |
| `--ds-confirm-dialog-inline-size` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/confirm-dialog/index.css:72` |
| `--ds-confirm-dialog-max-inline-size` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/confirm-dialog/index.css:74` |
| `--ds-container-2xl` | a2 | yes-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/container/index.css:52` |
| `--ds-container-corner` | a2 | yes-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/container/index.css:24` |
| `--ds-container-depth` | a2 | yes-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/container/index.css:25` |
| `--ds-container-frame` | a2 | yes-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/container/index.css:23` |
| `--ds-container-lg` | a2 | yes-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/container/index.css:44` |
| `--ds-container-md` | a2 | yes-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/container/index.css:40` |
| `--ds-container-measure` | a2 | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/container/index.css:20` |
| `--ds-container-pad` | a2 | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/container/index.css:21` |
| `--ds-container-padding-lg` | a2 | yes-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/container/index.css:73` |
| `--ds-container-padding-md` | a2 | yes-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/container/index.css:69` |
| `--ds-container-padding-none` | a2 | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/container/index.css:61` |
| `--ds-container-padding-sm` | a2 | yes-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/container/index.css:65` |
| `--ds-container-sm` | a2 | yes-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/container/index.css:36` |
| `--ds-container-surface` | a2 | yes-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/container/index.css:22` |
| `--ds-container-transition-duration` | a2 | yes-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/container/index.css:27` |
| `--ds-container-transition-timing` | a2 | yes-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/container/index.css:27` |
| `--ds-container-xl` | a2 | yes-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/container/index.css:48` |
| `--ds-context-menu-divider-margin-block` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/context-menu/index.css:164` |
| `--ds-context-menu-group-letter-spacing` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/context-menu/index.css:174` |
| `--ds-context-menu-group-padding` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/context-menu/index.css:169` |
| `--ds-context-menu-item-padding` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/context-menu/index.css:195` |
| `--ds-context-menu-max-block-size` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/context-menu/index.css:154` |
| `--ds-context-menu-touch-target-min` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/context-menu/index.css:288` |
| `--ds-context-menu-width` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/context-menu/index.css:102` |
| `--ds-control-height-sm` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/cockpit-header/index.css:235` |
| `--ds-control-size-md` | a | no-producer | modern+presentation | `src/foundation/tokens/css/presentation/components/skin/active-filters-bar/index.css:317` |
| `--ds-control-size-sm` | a | no-producer | modern+presentation | `src/foundation/tokens/css/presentation/components/skin/active-filters-bar/index.css:106` |
| `--ds-dashboard-header-actions-backdrop` | a | no-producer | presentation | `src/foundation/tokens/css/presentation/components/skin/dashboard-header/index.css:276` |
| `--ds-dashboard-header-icon-size` | a | no-producer | presentation | `src/foundation/tokens/css/presentation/components/skin/dashboard-header/index.css:154` |
| `--ds-dashboard-header-sheen-opacity` | a | no-producer | presentation | `src/foundation/tokens/css/presentation/components/skin/dashboard-header/index.css:114` |
| `--ds-dashboard-metric-bg` | a | no-producer | presentation | `src/foundation/tokens/css/presentation/components/skin/dashboard-header/index.css:328` |
| `--ds-dashboard-metric-border` | a | no-producer | presentation | `src/foundation/tokens/css/presentation/components/skin/dashboard-header/index.css:340` |
| `--ds-dashboard-metric-radius` | a | no-producer | presentation | `src/foundation/tokens/css/presentation/components/skin/dashboard-header/index.css:327` |
| `--ds-dashboard-skeleton-line-height` | a | no-producer | presentation | `src/foundation/tokens/css/presentation/components/skin/dashboard/index.css:75` |
| `--ds-dashboard-skeleton-stat-height` | a | no-producer | presentation | `src/foundation/tokens/css/presentation/components/skin/dashboard/index.css:63` |
| `--ds-dashboard-skeleton-title-height` | a | no-producer | presentation | `src/foundation/tokens/css/presentation/components/skin/dashboard/index.css:69` |
| `--ds-dashboard-skeleton-title-width` | a | no-producer | presentation | `src/foundation/tokens/css/presentation/components/skin/dashboard/index.css:68` |
| `--ds-data-table-action-cell-padding-comfortable` | a2 | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/data-table/index.css:61` |
| `--ds-data-table-action-cell-padding-compact` | a2 | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/data-table/index.css:119` |
| `--ds-data-table-action-cell-padding-spacious` | a2 | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/data-table/index.css:144` |
| `--ds-data-table-action-shadow` | a2 | no-literal-derived | modern+presentation | `src/foundation/tokens/css/presentation/components/skin/data-table-actions/index.css:28` |
| `--ds-data-table-actions-col-inline-size` | a2 | no-literal-declared | presentation | `src/foundation/tokens/css/presentation/components/skin/data-table-interactions/index.css:223` |
| `--ds-data-table-bulk-bar-padding` | a2 | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/data-table/index.css:937` |
| `--ds-data-table-col-inline-size` | a2 | no-literal-declared | presentation | `src/foundation/tokens/css/presentation/components/skin/data-table-interactions/index.css:215` |
| `--ds-data-table-col-max-inline-size` | a2 | no-literal-declared | presentation | `src/foundation/tokens/css/presentation/components/skin/data-table-interactions/index.css:217` |
| `--ds-data-table-col-min-inline-size` | a2 | no-literal-declared | presentation | `src/foundation/tokens/css/presentation/components/skin/data-table-interactions/index.css:216` |
| `--ds-data-table-collapsed-min-inline-size` | a2 | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/data-table/index.css:2163` |
| `--ds-data-table-control-size` | a2 | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/data-table/index.css:65` |
| `--ds-data-table-control-size-compact` | a2 | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/data-table/index.css:123` |
| `--ds-data-table-control-size-spacious` | a2 | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/data-table/index.css:148` |
| `--ds-data-table-drag-grip-opacity` | a2 | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/data-table/index.css:539` |
| `--ds-data-table-drop-indicator-inset` | a2 | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/data-table/index.css:1654` |
| `--ds-data-table-editor-checkbox-size` | a2 | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/data-table/index.css:757` |
| `--ds-data-table-editor-input-line-height` | a2 | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/data-table/index.css:747` |
| `--ds-data-table-editor-input-padding` | a2 | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/data-table/index.css:741` |
| `--ds-data-table-editorial-cell-padding-block` | a2 | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/data-table/index.css:1989` |
| `--ds-data-table-editorial-header-bg` | a2 | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/data-table/index.css:1975` |
| `--ds-data-table-editorial-header-padding-block` | a2 | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/data-table/index.css:1981` |
| `--ds-data-table-editorial-header-transform` | a2 | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/data-table/index.css:1984` |
| `--ds-data-table-expanded-padding` | a2 | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/data-table/index.css:778` |
| `--ds-data-table-header-content-gap` | a2 | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/data-table/index.css:506` |
| `--ds-data-table-leading-cell-padding-comfortable` | a2 | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/data-table/index.css:53` |
| `--ds-data-table-leading-cell-padding-compact` | a2 | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/data-table/index.css:111` |
| `--ds-data-table-leading-cell-padding-spacious` | a2 | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/data-table/index.css:136` |
| `--ds-data-table-min-inline-size` | a2 | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/data-table/index.css:354` |
| `--ds-data-table-minimal-shadow` | a2 | no-literal-derived | modern+presentation | `src/foundation/tokens/css/presentation/components/skin/data-table-mobile/index.css:247` |
| `--ds-data-table-open-cell-padding-block` | a2 | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/data-table/index.css:2092` |
| `--ds-data-table-pagination-padding` | a2 | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/data-table/index.css:851` |
| `--ds-data-table-pinned-inset-end` | a2 | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/data-table/index.css:499` |
| `--ds-data-table-pinned-inset-start` | a2 | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/data-table/index.css:492` |
| `--ds-data-table-resize-bar-height` | a2 | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/data-table/index.css:636` |
| `--ds-data-table-resize-bar-width` | a2 | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/data-table/index.css:635` |
| `--ds-data-table-resize-hit-size` | a2 | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/data-table/index.css:1530` |
| `--ds-data-table-row-block-size` | a2 | no-literal-declared | presentation | `src/foundation/tokens/css/presentation/components/skin/data-table-interactions/index.css:235` |
| `--ds-data-table-scroll-max-block-size` | a2 | no-literal-declared | presentation | `src/foundation/tokens/css/presentation/components/skin/data-table-interactions/index.css:230` |
| `--ds-data-table-selection-cell-padding-comfortable` | a2 | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/data-table/index.css:57` |
| `--ds-data-table-selection-cell-padding-compact` | a2 | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/data-table/index.css:115` |
| `--ds-data-table-selection-cell-padding-spacious` | a2 | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/data-table/index.css:140` |
| `--ds-data-table-sort-bg` | a2 | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/data-table/index.css:1567` |
| `--ds-data-table-sort-border` | a2 | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/data-table/index.css:1586` |
| `--ds-data-table-sort-control-offset` | a2 | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/data-table/index.css:1562` |
| `--ds-data-table-sort-control-size` | a2 | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/data-table/index.css:1560` |
| `--ds-data-table-sort-opacity` | a2 | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/data-table/index.css:1569` |
| `--ds-data-table-state-copy-max-inline-size` | a2 | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/data-table/index.css:332` |
| `--ds-data-table-touch-hit-expansion` | a2 | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/data-table/index.css:2135` |
| `--ds-data-table-touch-target` | a2 | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/data-table/index.css:2140` |
| `--ds-data-table-virtual-spacer-block-size` | a2 | no-literal-declared | presentation | `src/foundation/tokens/css/presentation/components/skin/data-table-interactions/index.css:239` |
| `--ds-date-picker-double-nav-overlap` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/date-picker/index.css:272` |
| `--ds-date-picker-today-marker-offset` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/date-picker/index.css:407` |
| `--ds-datepicker-cell-radius` | a | no-producer | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/date-picker/index.css:199` |
| `--ds-datepicker-panel-radius` | a | no-producer | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/date-picker/index.css:175` |
| `--ds-datepicker-radius` | a | yes-declared | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/date-picker/index.css:132` |
| `--ds-decision-comparison-badges-min-height` | a | no-literal-declared | presentation | `src/foundation/tokens/css/presentation/components/skin/decision-comparison/index.css:388` |
| `--ds-decision-comparison-bg` | a | yes-declared | presentation | `src/foundation/tokens/css/presentation/components/skin/decision-comparison/index.css:148` |
| `--ds-decision-comparison-body-font-size` | a | yes-declared | presentation | `src/foundation/tokens/css/presentation/components/skin/decision-comparison/index.css:192` |
| `--ds-decision-comparison-border` | a | yes-declared | presentation | `src/foundation/tokens/css/presentation/components/skin/decision-comparison/index.css:146` |
| `--ds-decision-comparison-columns` | a | no-producer | presentation | `src/foundation/tokens/css/presentation/components/skin/decision-comparison/index.css:240` |
| `--ds-decision-comparison-detail-font-size` | a | yes-declared | presentation | `src/foundation/tokens/css/presentation/components/skin/decision-comparison/index.css:207` |
| `--ds-decision-comparison-footer-bg` | a | yes-declared | presentation | `src/foundation/tokens/css/presentation/components/skin/decision-comparison/index.css:567` |
| `--ds-decision-comparison-identity-min-height` | a | no-literal-declared | presentation | `src/foundation/tokens/css/presentation/components/skin/decision-comparison/index.css:294` |
| `--ds-decision-comparison-insight-bg` | a | yes-declared | presentation | `src/foundation/tokens/css/presentation/components/skin/decision-comparison/index.css:592` |
| `--ds-decision-comparison-leading-accent` | a | yes-declared | presentation | `src/foundation/tokens/css/presentation/components/skin/decision-comparison/index.css:285` |
| `--ds-decision-comparison-motion-duration` | a | yes-declared | presentation | `src/foundation/tokens/css/presentation/components/skin/decision-comparison/index.css:152` |
| `--ds-decision-comparison-motion-easing` | a | yes-declared | presentation | `src/foundation/tokens/css/presentation/components/skin/decision-comparison/index.css:153` |
| `--ds-decision-comparison-pad` | a | yes-declared | presentation | `src/foundation/tokens/css/presentation/components/skin/decision-comparison/index.css:173` |
| `--ds-decision-comparison-radius` | a | yes-declared | presentation | `src/foundation/tokens/css/presentation/components/skin/decision-comparison/index.css:147` |
| `--ds-decision-comparison-row-height` | a | no-literal-declared | presentation | `src/foundation/tokens/css/presentation/components/skin/decision-comparison/index.css:440` |
| `--ds-decision-comparison-section-border` | a | yes-declared | presentation | `src/foundation/tokens/css/presentation/components/skin/decision-comparison/index.css:174` |
| `--ds-decision-comparison-shadow` | a | yes-declared | presentation | `src/foundation/tokens/css/presentation/components/skin/decision-comparison/index.css:149` |
| `--ds-decision-comparison-subject-bg` | a | yes-declared | presentation | `src/foundation/tokens/css/presentation/components/skin/decision-comparison/index.css:256` |
| `--ds-decision-comparison-subject-index` | a | no-producer | presentation | `src/foundation/tokens/css/presentation/components/skin/decision-comparison/index.css:263` |
| `--ds-decision-comparison-subject-leading-bg` | a | yes-declared | presentation | `src/foundation/tokens/css/presentation/components/skin/decision-comparison/index.css:274` |
| `--ds-decision-comparison-title-font-size` | a | yes-declared | presentation | `src/foundation/tokens/css/presentation/components/skin/decision-comparison/index.css:321` |
| `--ds-decision-comparison-toolbar-bg` | a | yes-declared | presentation | `src/foundation/tokens/css/presentation/components/skin/decision-comparison/index.css:175` |
| `--ds-decision-comparison-toolbar-min-height` | a | no-literal-declared | presentation | `src/foundation/tokens/css/presentation/components/skin/decision-comparison/index.css:172` |
| `--ds-decision-comparison-verdict-bg` | a | yes-declared | presentation | `src/foundation/tokens/css/presentation/components/skin/decision-comparison/index.css:225` |
| `--ds-decision-comparison-visual-grid-color` | a | yes-declared | presentation | `src/foundation/tokens/css/presentation/components/skin/decision-comparison/index.css:408` |
| `--ds-decision-comparison-visual-grid-size` | a | no-literal-declared | presentation | `src/foundation/tokens/css/presentation/components/skin/decision-comparison/index.css:417` |
| `--ds-decision-comparison-visual-min-height` | a | no-literal-declared | presentation | `src/foundation/tokens/css/presentation/components/skin/decision-comparison/index.css:251` |
| `--ds-density-factor-comfortable` | a | no-producer | presentation | `src/foundation/tokens/css/presentation/components/skin/data-table-mobile/index.css:114` |
| `--ds-density-factor-compact` | a | no-producer | modern+presentation | `src/foundation/tokens/css/presentation/components/skin/data-table-mobile/index.css:103` |
| `--ds-density-factor-spacious` | a | no-producer | modern+presentation | `src/foundation/tokens/css/presentation/components/skin/data-table-mobile/index.css:125` |
| `--ds-descriptions-border-color` | a | no-producer | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/descriptions/index.css:41` |
| `--ds-descriptions-column-count` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/descriptions/index.css:152` |
| `--ds-descriptions-column-gap` | a | yes-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/descriptions/index.css:315` |
| `--ds-descriptions-content-line-height` | a | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/descriptions/index.css:291` |
| `--ds-descriptions-extra-padding` | a | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/descriptions/index.css:117` |
| `--ds-descriptions-grid-gap` | a | yes-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/descriptions/index.css:155` |
| `--ds-descriptions-grid-padding` | a | yes-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/descriptions/index.css:156` |
| `--ds-descriptions-header-min-height` | a | yes-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/descriptions/index.css:55` |
| `--ds-descriptions-header-padding` | a | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/descriptions/index.css:57` |
| `--ds-descriptions-item-border-color` | a | no-producer | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/descriptions/index.css:53` |
| `--ds-descriptions-item-span` | a | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/descriptions/index.css:215` |
| `--ds-descriptions-label-gap` | a | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/descriptions/index.css:261` |
| `--ds-descriptions-label-letter-spacing` | a | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/descriptions/index.css:279` |
| `--ds-descriptions-label-line-height` | a | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/descriptions/index.css:278` |
| `--ds-descriptions-label-transform` | a | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/descriptions/index.css:280` |
| `--ds-descriptions-row-padding` | a | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/descriptions/index.css:216` |
| `--ds-descriptions-row-padding-md` | a | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/descriptions/index.css:363` |
| `--ds-descriptions-row-padding-sm` | a | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/descriptions/index.css:360` |
| `--ds-descriptions-section-gap` | a | yes-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/descriptions/index.css:56` |
| `--ds-descriptions-title-letter-spacing` | a | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/descriptions/index.css:107` |
| `--ds-descriptions-title-line-height` | a | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/descriptions/index.css:106` |
| `--ds-detail-control-bg` | a | no-literal-declared | presentation | `src/foundation/tokens/css/presentation/components/skin/detail-header/index.css:134` |
| `--ds-detail-control-shadow` | a | no-literal-declared | presentation | `src/foundation/tokens/css/presentation/components/skin/detail-header/index.css:143` |
| `--ds-detail-header-avatar-initials-size` | a | no-producer | presentation | `src/foundation/tokens/css/presentation/components/skin/detail-header/index.css:312` |
| `--ds-detail-header-avatar-size` | a | no-producer | presentation | `src/foundation/tokens/css/presentation/components/skin/detail-header/index.css:286` |
| `--ds-detail-header-avatar-size-compact` | a | no-producer | presentation | `src/foundation/tokens/css/presentation/components/skin/detail-header/index.css:643` |
| `--ds-detail-header-back-button-padding` | a | no-producer | presentation | `src/foundation/tokens/css/presentation/components/skin/detail-header/index.css:231` |
| `--ds-detail-header-context-rail-margin-block-start` | a | no-producer | presentation | `src/foundation/tokens/css/presentation/components/skin/detail-header/index.css:381` |
| `--ds-detail-header-eyebrow-tracking` | a | no-producer | presentation | `src/foundation/tokens/css/presentation/components/skin/detail-header/index.css:321` |
| `--ds-detail-header-hero-panel-padding-compact` | a | no-producer | presentation | `src/foundation/tokens/css/presentation/components/skin/detail-header/index.css:631` |
| `--ds-detail-header-metadata-card-children-margin-block-start` | a | no-producer | presentation | `src/foundation/tokens/css/presentation/components/skin/detail-header/index.css:438` |
| `--ds-detail-header-metadata-card-margin-block-start` | a | no-producer | presentation | `src/foundation/tokens/css/presentation/components/skin/detail-header/index.css:424` |
| `--ds-detail-header-metadata-card-padding-compact` | a | no-producer | presentation | `src/foundation/tokens/css/presentation/components/skin/detail-header/index.css:647` |
| `--ds-detail-header-metadata-chip-label-tracking` | a | no-producer | presentation | `src/foundation/tokens/css/presentation/components/skin/detail-header/index.css:481` |
| `--ds-detail-header-root-margin-block-end` | a | no-producer | presentation | `src/foundation/tokens/css/presentation/components/skin/detail-header/index.css:165` |
| `--ds-detail-header-subtitle-leading` | a | no-producer | presentation | `src/foundation/tokens/css/presentation/components/skin/detail-header/index.css:374` |
| `--ds-detail-header-subtitle-max-inline-size` | a | no-producer | presentation | `src/foundation/tokens/css/presentation/components/skin/detail-header/index.css:377` |
| `--ds-detail-header-tab-active-bg` | a | no-producer | presentation | `src/foundation/tokens/css/presentation/components/skin/detail-header/index.css:539` |
| `--ds-detail-header-tab-count-padding` | a | no-producer | presentation | `src/foundation/tokens/css/presentation/components/skin/detail-header/index.css:606` |
| `--ds-detail-header-tab-padding` | a | no-producer | presentation | `src/foundation/tokens/css/presentation/components/skin/detail-header/index.css:522` |
| `--ds-detail-panel-content-gap` | a | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/detail-panel/index.css:148` |
| `--ds-detail-panel-item-gap` | a | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/detail-panel/index.css:193` |
| `--ds-detail-panel-padding` | a | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/detail-panel/index.css:140` |
| `--ds-detail-panel-section-gap` | a | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/detail-panel/index.css:561` |
| `--ds-disabled-opacity` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/rate/index.css:152` |
| `--ds-divider-edge-basis` | a2 | yes-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/divider/index.css:135` |
| `--ds-divider-gap` | a2 | yes-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/divider/index.css:26` |
| `--ds-divider-inset` | a2 | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/divider/index.css:40` |
| `--ds-divider-inset-lg` | a2 | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/divider/index.css:79` |
| `--ds-divider-inset-md` | a2 | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/divider/index.css:75` |
| `--ds-divider-inset-none` | a2 | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/divider/index.css:63` |
| `--ds-divider-inset-sm` | a2 | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/divider/index.css:71` |
| `--ds-divider-inset-xl` | a2 | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/divider/index.css:83` |
| `--ds-divider-inset-xs` | a2 | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/divider/index.css:67` |
| `--ds-divider-label-case` | a2 | yes-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/divider/index.css:157` |
| `--ds-divider-label-ink` | a2 | yes-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/divider/index.css:153` |
| `--ds-divider-label-leading` | a2 | yes-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/divider/index.css:156` |
| `--ds-divider-label-measure` | a2 | yes-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/divider/index.css:145` |
| `--ds-divider-label-size` | a2 | yes-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/divider/index.css:154` |
| `--ds-divider-label-track` | a2 | yes-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/divider/index.css:158` |
| `--ds-divider-label-weight` | a2 | yes-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/divider/index.css:155` |
| `--ds-divider-segment-min` | a2 | yes-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/divider/index.css:118` |
| `--ds-divider-transition-duration` | a2 | yes-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/divider/index.css:123` |
| `--ds-divider-transition-timing` | a2 | yes-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/divider/index.css:123` |
| `--ds-divider-vertical-min` | a2 | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/divider/index.css:55` |
| `--ds-drawer-body-bg` | a | no-literal-derived | modern+presentation | `src/foundation/tokens/css/presentation/components/skin/drawer-compounds/index.css:102` |
| `--ds-drawer-close-size` | a | no-literal-declared | modern+presentation | `src/foundation/tokens/css/presentation/components/skin/drawer-compounds/index.css:39` |
| `--ds-drawer-icon-size` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/drawer/index.css:329` |
| `--ds-drawer-overlay-opacity` | a | no-literal-declared | modern+rustic | `src/foundation/tokens/css/runtime/engines/modern/skin/drawer/index.css:69` |
| `--ds-drawer-size-full` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/drawer/index.css:184` |
| `--ds-drawer-size-lg` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/drawer/index.css:176` |
| `--ds-drawer-size-sm` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/drawer/index.css:172` |
| `--ds-drawer-size-xl` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/drawer/index.css:180` |
| `--ds-drawer-texture` | a | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/drawer/index.css:104` |
| `--ds-dropdown-arrow-anchor-offset` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/dropdown/index.css:456` |
| `--ds-dropdown-arrow-size` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/dropdown/index.css:422` |
| `--ds-dropdown-divider-margin-x` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/dropdown/index.css:380` |
| `--ds-dropdown-divider-margin-y` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/dropdown/index.css:380` |
| `--ds-dropdown-enter-scale` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/dropdown/index.css:16` |
| `--ds-dropdown-enter-y` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/dropdown/index.css:16` |
| `--ds-dropdown-exit-scale` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/dropdown/index.css:31` |
| `--ds-dropdown-exit-y` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/dropdown/index.css:31` |
| `--ds-dropdown-group-bg` | a | yes-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/dropdown/index.css:369` |
| `--ds-dropdown-group-margin-end` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/dropdown/index.css:365` |
| `--ds-dropdown-group-margin-start` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/dropdown/index.css:365` |
| `--ds-dropdown-group-padding-x` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/dropdown/index.css:366` |
| `--ds-dropdown-group-padding-y` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/dropdown/index.css:366` |
| `--ds-dropdown-icon-bg` | a | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/dropdown/index.css:322` |
| `--ds-dropdown-icon-bg-hover` | a | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/dropdown/index.css:329` |
| `--ds-dropdown-icon-color` | a | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/dropdown/index.css:320` |
| `--ds-dropdown-icon-lift` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/dropdown/index.css:330` |
| `--ds-dropdown-icon-well-size` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/dropdown/index.css:318` |
| `--ds-dropdown-item-gap` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/dropdown/index.css:171` |
| `--ds-dropdown-item-height` | a | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/dropdown/index.css:197` |
| `--ds-dropdown-item-padding-x` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/dropdown/index.css:198` |
| `--ds-dropdown-item-padding-y` | a | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/dropdown/index.css:198` |
| `--ds-dropdown-max-width` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/dropdown/index.css:82` |
| `--ds-dropdown-menu-max-block-size` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/dropdown/index.css:180` |
| `--ds-dropdown-min-width` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/dropdown/index.css:392` |
| `--ds-dropdown-padding` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/dropdown/index.css:394` |
| `--ds-dropdown-position-left` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/dropdown/index.css:140` |
| `--ds-dropdown-position-top` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/dropdown/index.css:139` |
| `--ds-dropdown-selection-scale` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/dropdown/index.css:305` |
| `--ds-dropdown-sheen-opacity` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/dropdown/index.css:260` |
| `--ds-dropdown-submenu-indicator-bg` | a | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/dropdown/index.css:352` |
| `--ds-dropdown-submenu-indicator-size` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/dropdown/index.css:349` |
| `--ds-dropdown-submenu-inset` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/dropdown/index.css:387` |
| `--ds-dropdown-submenu-nudge` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/dropdown/index.css:357` |
| `--ds-dropdown-submenu-offset` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/dropdown/index.css:388` |
| `--ds-dropdown-texture` | a | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/dropdown/index.css:88` |
| `--ds-dropdown-viewport-gap` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/dropdown/index.css:81` |
| `--ds-dtc-live` | a | no-producer | presentation | `src/foundation/tokens/css/presentation/components/skin/data-terminal-card/index.css:246` |
| `--ds-dtc-radius` | a | no-producer | presentation | `src/foundation/tokens/css/presentation/components/skin/data-terminal-card/index.css:303` |
| `--ds-duration-fast` | a | yes-declared | presentation | `src/foundation/tokens/css/presentation/components/skin/tree-view-connector/index.css:71` |
| `--ds-duration-slow` | a | no-literal-declared | presentation | `src/foundation/tokens/css/presentation/components/skin/ascii-diagram/index.css:122` |
| `--ds-ease-out` | a | yes-declared | presentation | `src/foundation/tokens/css/presentation/components/skin/ascii-diagram/index.css:122` |
| `--ds-ease-spring` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/dropdown/index.css:217` |
| `--ds-ease-standard` | a2 | no-literal-derived | presentation | `src/foundation/tokens/css/presentation/components/skin/markdown-view/index.css:38` |
| `--ds-edit-fields-grid-columns` | a | no-producer | presentation | `src/foundation/tokens/css/presentation/components/skin/edit-fields/index.css:145` |
| `--ds-edit-fields-grid-gap` | a | no-producer | presentation | `src/foundation/tokens/css/presentation/components/skin/edit-fields/index.css:146` |
| `--ds-edit-header-context-card-filter` | a | no-producer | presentation | `src/foundation/tokens/css/presentation/components/skin/edit-header/index.css:317` |
| `--ds-edit-header-context-gap` | a | yes-declared | presentation | `src/foundation/tokens/css/presentation/components/skin/edit-header/index.css:307` |
| `--ds-edit-header-hero-padding` | a | yes-declared | presentation | `src/foundation/tokens/css/presentation/components/skin/edit-header/index.css:203` |
| `--ds-edit-header-icon-badge-glyph-size` | a | no-literal-declared | presentation | `src/foundation/tokens/css/presentation/components/skin/edit-header/index.css:219` |
| `--ds-edit-header-icon-badge-size` | a | no-literal-declared | presentation | `src/foundation/tokens/css/presentation/components/skin/edit-header/index.css:215` |
| `--ds-edit-header-status-tone-bd` | a | no-producer | presentation | `src/foundation/tokens/css/presentation/components/skin/edit-header/index.css:267` |
| `--ds-edit-header-status-tone-bg` | a | no-producer | presentation | `src/foundation/tokens/css/presentation/components/skin/edit-header/index.css:263` |
| `--ds-edit-header-status-tone-fg` | a | no-producer | presentation | `src/foundation/tokens/css/presentation/components/skin/edit-header/index.css:270` |
| `--ds-edit-header-top-bar-padding-block` | a | yes-declared | presentation | `src/foundation/tokens/css/presentation/components/skin/edit-header/index.css:144` |
| `--ds-edit-header-top-bar-padding-inline` | a | yes-declared | presentation | `src/foundation/tokens/css/presentation/components/skin/edit-header/index.css:145` |
| `--ds-elevation-lift` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/card/index.css:31` |
| `--ds-elevation-lift-strength` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/card/index.css:31` |
| `--ds-empty-description-width` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/empty/index.css:91` |
| `--ds-empty-icon-size` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/empty/index.css:76` |
| `--ds-empty-min-height` | a | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/empty/index.css:34` |
| `--ds-empty-simple-min-height` | a | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/empty/index.css:123` |
| `--ds-empty-state-content-width` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/empty-state/index.css:71` |
| `--ds-empty-state-lg-min-height` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/empty-state/index.css:61` |
| `--ds-empty-state-lg-visual-size` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/empty-state/index.css:103` |
| `--ds-empty-state-loading-height` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/empty-state/index.css:65` |
| `--ds-empty-state-min-height` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/empty-state/index.css:35` |
| `--ds-empty-state-shadow` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/empty-state/index.css:50` |
| `--ds-empty-state-sm-min-height` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/empty-state/index.css:56` |
| `--ds-empty-state-sm-visual-size` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/empty-state/index.css:97` |
| `--ds-empty-state-visual-size` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/empty-state/index.css:81` |
| `--ds-environment-toggle-panel-min-width` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/environment-toggle/index.css:90` |
| `--ds-envtoggle-accent` | a | no-producer | modern+rustic | `src/foundation/tokens/css/runtime/engines/modern/skin/environment-toggle/index.css:135` |
| `--ds-envtoggle-accent-soft` | a | no-producer | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/environment-toggle/index.css:136` |
| `--ds-export-button-panel-min-width` | a | no-producer | presentation | `src/foundation/tokens/css/presentation/components/skin/export-button/index.css:72` |
| `--ds-export-button-toast-duration` | a | no-producer | presentation | `src/foundation/tokens/css/presentation/components/skin/export-button/index.css:57` |
| `--ds-feature-workspace-max-width-content` | a | no-producer | presentation | `src/foundation/tokens/css/presentation/components/skin/feature-workspace-frame/index.css:78` |
| `--ds-feature-workspace-max-width-wide` | a | no-producer | presentation | `src/foundation/tokens/css/presentation/components/skin/feature-workspace-frame/index.css:71` |
| `--ds-feature-workspace-navigation-z-index` | a | no-producer | presentation | `src/foundation/tokens/css/presentation/components/skin/feature-workspace-frame/index.css:100` |
| `--ds-feature-workspace-skeleton-card-height` | a | no-producer | presentation | `src/foundation/tokens/css/presentation/components/skin/feature-workspace-frame/index.css:160` |
| `--ds-feature-workspace-skeleton-min-height` | a | no-producer | presentation | `src/foundation/tokens/css/presentation/components/skin/feature-workspace-frame/index.css:155` |
| `--ds-feature-workspace-sticky-offset` | a | no-producer | presentation | `src/foundation/tokens/css/presentation/components/skin/feature-workspace-frame/index.css:108` |
| `--ds-file-manager-content-min-height` | a | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/file-manager/index.css:245` |
| `--ds-file-manager-touch-target` | a | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/file-manager/index.css:428` |
| `--ds-filter-builder-control-min` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/filter-builder/index.css:96` |
| `--ds-filter-builder-dropdown-max-height` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/filter-builder/index.css:188` |
| `--ds-filter-builder-dropdown-min-width` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/filter-builder/index.css:186` |
| `--ds-filter-builder-logic-width` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/filter-builder/index.css:84` |
| `--ds-filter-builder-row-padding-y-compact` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/filter-builder/index.css:79` |
| `--ds-filter-builder-value-min` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/filter-builder/index.css:100` |
| `--ds-filter-panel-content-max-height` | a | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/filter-panel/index.css:216` |
| `--ds-filter-panel-inline-control-width` | a | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/filter-panel/index.css:151` |
| `--ds-filter-panel-inline-flex` | a | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/filter-panel/index.css:142` |
| `--ds-filter-panel-inline-min-width` | a | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/filter-panel/index.css:143` |
| `--ds-filter-panel-inline-wrap` | a | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/filter-panel/index.css:127` |
| `--ds-filter-panel-touch-target` | a | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/filter-panel/index.css:257` |
| `--ds-filter-pill-bg` | a | no-literal-declared | modern+presentation | `src/foundation/tokens/css/presentation/components/skin/status-filter-pills/index.css:103` |
| `--ds-flex-column-gap` | a | no-literal-derived | modern+presentation | `src/foundation/tokens/css/presentation/components/skin/layout-primitives/index.css:88` |
| `--ds-flex-gap` | a | no-literal-derived | modern+presentation | `src/foundation/tokens/css/presentation/components/skin/layout-primitives/index.css:84` |
| `--ds-flex-reflow-transition` | a2 | yes-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/flex/index.css:160` |
| `--ds-flex-row-gap` | a | no-literal-derived | modern+presentation | `src/foundation/tokens/css/presentation/components/skin/layout-primitives/index.css:89` |
| `--ds-floatbutton-badge-font-size` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/float-button/index.css:172` |
| `--ds-floatbutton-badge-line-height` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/float-button/index.css:173` |
| `--ds-floatbutton-badge-offset-block` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/float-button/index.css:166` |
| `--ds-floatbutton-badge-offset-inline` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/float-button/index.css:167` |
| `--ds-floatbutton-badge-padding-block` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/float-button/index.css:171` |
| `--ds-floatbutton-badge-padding-inline` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/float-button/index.css:171` |
| `--ds-floatbutton-dot-offset-block` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/float-button/index.css:158` |
| `--ds-floatbutton-dot-offset-inline` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/float-button/index.css:159` |
| `--ds-floatbutton-dot-size` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/float-button/index.css:160` |
| `--ds-floatbutton-padding-block` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/float-button/index.css:127` |
| `--ds-floatbutton-padding-inline` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/float-button/index.css:127` |
| `--ds-floatbutton-size` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/float-button/index.css:122` |
| `--ds-floatbutton-size-coarse` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/float-button/index.css:134` |
| `--ds-floatbutton-square-radius` | a | no-producer | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/float-button/index.css:43` |
| `--ds-font-mono` | a | no-literal-declared | presentation | `src/foundation/tokens/css/presentation/components/skin/ascii-diagram/index.css:43` |
| `--ds-font-size-6xl` | a | yes-declared | presentation | `src/foundation/tokens/css/presentation/components/skin/data-terminal-card/index.css:821` |
| `--ds-font-weight-display` | a | yes-declared | presentation | `src/foundation/tokens/css/presentation/components/skin/markdown-view/index.css:104` |
| `--ds-font-weight-heading` | a | yes-declared | presentation | `src/foundation/tokens/css/presentation/components/skin/chart-foundation/index.css:26` |
| `--ds-font-weight-regular` | a | no-producer | modern+presentation | `src/foundation/tokens/css/presentation/components/skin/decision-comparison/index.css:506` |
| `--ds-form-action-dock-reserved-space` | a | no-producer | presentation | `src/foundation/tokens/css/presentation/components/skin/form-surface/index.css:53` |
| `--ds-form-badge-letter-spacing` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/form/index.css:238` |
| `--ds-form-builder-counter-font-size` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/form-builder/index.css:308` |
| `--ds-form-builder-max-inline-size` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/form-builder/index.css:63` |
| `--ds-form-builder-section-description-font-size` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/form-builder/index.css:254` |
| `--ds-form-builder-section-divider-gap` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/form-builder/index.css:221` |
| `--ds-form-builder-section-header-padding` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/form-builder/index.css:232` |
| `--ds-form-builder-section-title-font-size` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/form-builder/index.css:246` |
| `--ds-form-builder-section-title-letter-spacing` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/form-builder/index.css:249` |
| `--ds-form-builder-title-font-size` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/form-builder/index.css:74` |
| `--ds-form-builder-title-letter-spacing` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/form-builder/index.css:77` |
| `--ds-form-builder-title-line-height` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/form-builder/index.css:76` |
| `--ds-form-builder-wizard-nav-offset` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/form-builder/index.css:293` |
| `--ds-form-error-color` | a | no-literal-declared | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/form-field/index.css:30` |
| `--ds-form-extra-color` | a | no-literal-declared | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/form/index.css:48` |
| `--ds-form-field-label-letter-spacing` | a | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/form-field/index.css:85` |
| `--ds-form-field-label-text-transform` | a | yes-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/form-field/index.css:91` |
| `--ds-form-field-message-lines` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/form-field/index.css:115` |
| `--ds-form-field-required-gap` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/form-field/index.css:98` |
| `--ds-form-header-context-backdrop` | a | no-producer | presentation | `src/foundation/tokens/css/presentation/components/skin/form-header/index.css:242` |
| `--ds-form-header-context-gap` | a | yes-declared | presentation | `src/foundation/tokens/css/presentation/components/skin/form-header/index.css:228` |
| `--ds-form-header-hero-padding` | a | yes-declared | presentation | `src/foundation/tokens/css/presentation/components/skin/form-header/index.css:158` |
| `--ds-form-header-icon-badge-glyph-size` | a | no-literal-declared | presentation | `src/foundation/tokens/css/presentation/components/skin/form-header/index.css:189` |
| `--ds-form-header-icon-badge-size` | a | no-literal-declared | presentation | `src/foundation/tokens/css/presentation/components/skin/form-header/index.css:185` |
| `--ds-form-header-root-margin` | a | no-producer | presentation | `src/foundation/tokens/css/presentation/components/skin/form-header/index.css:97` |
| `--ds-form-header-top-bar-padding-block` | a | yes-declared | presentation | `src/foundation/tokens/css/presentation/components/skin/form-header/index.css:119` |
| `--ds-form-header-top-bar-padding-inline` | a | yes-declared | presentation | `src/foundation/tokens/css/presentation/components/skin/form-header/index.css:120` |
| `--ds-form-help-color` | a | no-literal-declared | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/form-field/index.css:34` |
| `--ds-form-info-color` | a | no-producer | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/form/index.css:38` |
| `--ds-form-label-letter-spacing` | a | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/form/index.css:188` |
| `--ds-form-label-text-transform` | a | yes-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/form/index.css:189` |
| `--ds-form-label-width` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/form/index.css:135` |
| `--ds-form-required-color` | a | no-literal-declared | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/form-field/index.css:26` |
| `--ds-form-sections-accent` | a | yes-declared | presentation | `src/foundation/tokens/css/presentation/components/skin/form-sections/index.css:244` |
| `--ds-form-sections-accent-secondary` | a | yes-declared | presentation | `src/foundation/tokens/css/presentation/components/skin/form-sections/index.css:245` |
| `--ds-form-sections-active-border` | a | yes-declared | presentation | `src/foundation/tokens/css/presentation/components/skin/form-sections/index.css:196` |
| `--ds-form-sections-badge-bg` | a | yes-declared | presentation | `src/foundation/tokens/css/presentation/components/skin/form-sections/index.css:398` |
| `--ds-form-sections-badge-border` | a | yes-declared | presentation | `src/foundation/tokens/css/presentation/components/skin/form-sections/index.css:397` |
| `--ds-form-sections-border` | a | yes-declared | presentation | `src/foundation/tokens/css/presentation/components/skin/form-sections/index.css:186` |
| `--ds-form-sections-divider` | a | yes-declared | presentation | `src/foundation/tokens/css/presentation/components/skin/form-sections/index.css:222` |
| `--ds-form-sections-grid-color` | a | yes-declared | presentation | `src/foundation/tokens/css/presentation/components/skin/form-sections/index.css:249` |
| `--ds-form-sections-grid-size` | a | no-literal-declared | presentation | `src/foundation/tokens/css/presentation/components/skin/form-sections/index.css:257` |
| `--ds-form-sections-muted-surface` | a | yes-declared | presentation | `src/foundation/tokens/css/presentation/components/skin/form-sections/index.css:187` |
| `--ds-form-sections-shadow` | a | yes-declared | presentation | `src/foundation/tokens/css/presentation/components/skin/form-sections/index.css:198` |
| `--ds-form-sections-surface` | a | yes-declared | presentation | `src/foundation/tokens/css/presentation/components/skin/form-sections/index.css:197` |
| `--ds-form-success-color` | a | no-literal-declared | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/form/index.css:29` |
| `--ds-form-warning-color` | a | no-literal-declared | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/form/index.css:35` |
| `--ds-gallery-view-aspect-ratio` | b | no-literal-declared | presentation | `src/foundation/tokens/css/presentation/components/skin/gallery-view/index.css:70` |
| `--ds-gallery-view-columns` | b | no-literal-declared | presentation | `src/foundation/tokens/css/presentation/components/skin/gallery-view/index.css:57` |
| `--ds-glass-blur-sm` | a | no-literal-declared | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/modal/index.css:38` |
| `--ds-gradient-mesh` | a | yes-declared | presentation | `src/foundation/tokens/css/presentation/components/skin/marketing-surface/index.css:57` |
| `--ds-grid-gap` | a | yes-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/grid/index.css:51` |
| `--ds-grid-reflow-transition` | a2 | yes-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/grid/index.css:116` |
| `--ds-header-icon-tone-bd` | a | no-producer | presentation | `src/foundation/tokens/css/presentation/components/skin/header-hero-shared/index.css:120` |
| `--ds-header-icon-tone-bg` | a | no-producer | presentation | `src/foundation/tokens/css/presentation/components/skin/header-hero-shared/index.css:112` |
| `--ds-header-icon-tone-fg` | a | no-producer | presentation | `src/foundation/tokens/css/presentation/components/skin/header-hero-shared/index.css:113` |
| `--ds-hover-card-max-block-size` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/hover-card/index.css:44` |
| `--ds-hover-card-scrollbar-width` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/hover-card/index.css:47` |
| `--ds-hover-card-texture` | a | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/hover-card/index.css:52` |
| `--ds-hover-card-width` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/hover-card/index.css:42` |
| `--ds-icon-size-status` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/form-field/index.css:182` |
| `--ds-icon-size-well` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/context-menu/index.css:308` |
| `--ds-icon-xl-size` | a | no-literal-declared | modern+presentation | `src/foundation/tokens/css/presentation/components/skin/gallery-view/index.css:93` |
| `--ds-image-border-color` | a | no-producer | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/image/index.css:44` |
| `--ds-image-fallback-bg` | a | no-producer | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/image/index.css:67` |
| `--ds-image-fallback-color` | a | no-producer | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/image/index.css:68` |
| `--ds-image-fallback-icon-size` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/image/index.css:153` |
| `--ds-image-loading-bg` | a | no-producer | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/image/index.css:62` |
| `--ds-image-overlay-bg` | a | no-literal-declared | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/image/index.css:74` |
| `--ds-image-placeholder-bg` | a | no-producer | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/image/index.css:58` |
| `--ds-image-resolved-radius` | a | no-producer | presentation+rustic | `src/foundation/tokens/css/presentation/components/skin/image-compounds/index.css:38` |
| `--ds-image-shadow` | a | no-producer | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/image/index.css:47` |
| `--ds-image-zoom-close-bg` | a | no-producer | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/image/index.css:88` |
| `--ds-image-zoom-close-color` | a | no-producer | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/image/index.css:91` |
| `--ds-image-zoom-indicator-bg` | a | no-producer | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/image/index.css:78` |
| `--ds-image-zoom-indicator-color` | a | no-producer | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/image/index.css:80` |
| `--ds-image-zoom-indicator-padding` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/image/index.css:183` |
| `--ds-image-zoom-overlay-bg` | a | no-producer | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/image/index.css:85` |
| `--ds-input-action-shadow-hover` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/input/index.css:187` |
| `--ds-input-addon-padding-x` | a | yes-declared | presentation | `src/foundation/tokens/css/presentation/components/skin/input-compounds/index.css:81` |
| `--ds-input-affix-bg` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/input/index.css:138` |
| `--ds-input-affix-border` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/input/index.css:139` |
| `--ds-input-affix-padding-x` | a | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/input/index.css:136` |
| `--ds-input-clear-bg` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/input/index.css:161` |
| `--ds-input-clear-border` | a | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/input/index.css:162` |
| `--ds-input-disabled-cursor` | a | no-literal-declared | modern+presentation | `src/foundation/tokens/css/presentation/components/skin/input-compounds/index.css:350` |
| `--ds-input-filled-border` | a | no-literal-derived | modern+presentation | `src/foundation/tokens/css/presentation/components/skin/input-compounds/index.css:290` |
| `--ds-input-group-focus-z` | a | no-producer | presentation | `src/foundation/tokens/css/presentation/components/skin/input-compounds/index.css:43` |
| `--ds-input-group-gap` | a | yes-declared | presentation | `src/foundation/tokens/css/presentation/components/skin/input-compounds/index.css:22` |
| `--ds-input-group-min-item-width` | a | no-literal-declared | presentation | `src/foundation/tokens/css/presentation/components/skin/input-compounds/index.css:31` |
| `--ds-input-inset-shadow` | a | no-literal-declared | modern+presentation | `src/foundation/tokens/css/presentation/components/skin/input-compounds/index.css:235` |
| `--ds-input-letter-spacing` | a | no-literal-declared | modern+presentation | `src/foundation/tokens/css/presentation/components/skin/input-compounds/index.css:238` |
| `--ds-input-loading-duration` | a | no-literal-declared | modern+presentation | `src/foundation/tokens/css/presentation/components/skin/input-compounds/index.css:382` |
| `--ds-input-number-control-bg` | a | no-literal-declared | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/input-number/index.css:88` |
| `--ds-input-number-control-color` | a | no-literal-declared | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/input-number/index.css:89` |
| `--ds-input-number-corner-radius` | a | yes-declared | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/input-number/index.css:69` |
| `--ds-input-number-disabled-cursor` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/input-number/index.css:189` |
| `--ds-input-number-letter-spacing` | a | yes-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/input-number/index.css:21` |
| `--ds-input-number-placeholder-opacity` | a | yes-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/input-number/index.css:40` |
| `--ds-input-number-radius` | a | no-producer | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/input-number/index.css:43` |
| `--ds-input-placeholder-opacity` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/auto-complete/index.css:70` |
| `--ds-input-readonly-border-style` | a | no-literal-declared | modern+presentation | `src/foundation/tokens/css/presentation/components/skin/input-compounds/index.css:342` |
| `--ds-input-readonly-cursor` | a | no-literal-declared | modern+presentation | `src/foundation/tokens/css/presentation/components/skin/input-compounds/index.css:343` |
| `--ds-input-resolved-radius` | a | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/input/index.css:67` |
| `--ds-input-shadow-disabled` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/input/index.css:397` |
| `--ds-input-touch-target-min` | a | yes-declared | modern+presentation | `src/foundation/tokens/css/presentation/components/skin/input-compounds/index.css:435` |
| `--ds-input-xl-padding-y` | a | yes-declared | presentation | `src/foundation/tokens/css/presentation/components/skin/input-compounds/index.css:283` |
| `--ds-input-xs-padding-y` | a | no-literal-declared | presentation | `src/foundation/tokens/css/presentation/components/skin/input-compounds/index.css:263` |
| `--ds-invoice-template-logo-height` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/invoice-template/index.css:84` |
| `--ds-invoice-template-max-width` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/invoice-template/index.css:47` |
| `--ds-invoice-template-totals-width` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/invoice-template/index.css:227` |
| `--ds-kanban-board-column-accent` | b | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/pattern-kanban-board/index.css:159` |
| `--ds-kanban-board-column-max-height` | b | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/pattern-kanban-board/index.css:249` |
| `--ds-kanban-board-column-min-width` | b | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/pattern-kanban-board/index.css:143` |
| `--ds-kanban-board-touch-target` | b | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/pattern-kanban-board/index.css:354` |
| `--ds-kbd-depth-width` | a | no-producer | modern+presentation | `src/foundation/tokens/css/presentation/components/skin/collection-header/index.css:113` |
| `--ds-kbd-font-weight` | a | no-producer | modern+presentation | `src/foundation/tokens/css/presentation/components/skin/collection-header/index.css:109` |
| `--ds-kbd-lg-font-size` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/kbd/index.css:94` |
| `--ds-kbd-lg-min-height` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/kbd/index.css:90` |
| `--ds-kbd-lg-min-width` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/kbd/index.css:91` |
| `--ds-kbd-lg-padding-block` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/kbd/index.css:92` |
| `--ds-kbd-lg-padding-inline` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/kbd/index.css:93` |
| `--ds-kbd-md-font-size` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/kbd/index.css:86` |
| `--ds-kbd-md-min-height` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/kbd/index.css:82` |
| `--ds-kbd-md-min-width` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/kbd/index.css:83` |
| `--ds-kbd-md-padding-block` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/kbd/index.css:84` |
| `--ds-kbd-md-padding-inline` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/kbd/index.css:85` |
| `--ds-kbd-sm-font-size` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/kbd/index.css:78` |
| `--ds-kbd-sm-min-height` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/kbd/index.css:74` |
| `--ds-kbd-sm-min-width` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/kbd/index.css:75` |
| `--ds-kbd-sm-padding-block` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/kbd/index.css:76` |
| `--ds-kbd-sm-padding-inline` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/kbd/index.css:77` |
| `--ds-kbd-vertical-align` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/kbd/index.css:48` |
| `--ds-layout-content-min-basis` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/layout/index.css:160` |
| `--ds-layout-root-min-block-size` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/layout/index.css:133` |
| `--ds-layout-sider-trigger-block-size` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/layout/index.css:206` |
| `--ds-letter-spacing-tighter` | a2 | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/typography/index.css:587` |
| `--ds-letter-spacing-wide` | a | no-literal-declared | modern+presentation | `src/foundation/tokens/css/presentation/components/skin/guided-draft-form/index.css:120` |
| `--ds-letter-spacing-widest` | a | no-literal-declared | modern+presentation | `src/foundation/tokens/css/presentation/components/skin/auth-surface/index.css:94` |
| `--ds-line-height-2xl` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/statistic/index.css:143` |
| `--ds-line-height-heading` | a | no-literal-declared | modern+presentation | `src/foundation/tokens/css/presentation/components/skin/chart-foundation/index.css:28` |
| `--ds-line-height-loose` | a2 | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/typography/index.css:581` |
| `--ds-line-height-none` | a | no-literal-declared | modern+presentation | `src/foundation/tokens/css/presentation/components/skin/form-sections/index.css:436` |
| `--ds-line-height-relaxed` | a | no-literal-declared | modern+presentation | `src/foundation/tokens/css/presentation/components/skin/empty-state-surface/index.css:58` |
| `--ds-line-height-sm` | a | no-producer | modern+rustic | `src/foundation/tokens/css/runtime/engines/modern/skin/statistic/index.css:78` |
| `--ds-link-disabled-decoration` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/link/index.css:151` |
| `--ds-link-disabled-opacity` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/link/index.css:148` |
| `--ds-link-external-icon-gap` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/link/index.css:158` |
| `--ds-link-external-icon-offset` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/link/index.css:159` |
| `--ds-link-focus-ring-offset` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/link/index.css:143` |
| `--ds-link-focus-ring-width` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/link/index.css:141` |
| `--ds-link-underline-offset` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/file-manager/index.css:158` |
| `--ds-link-underline-offset-hover` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/link/index.css:74` |
| `--ds-link-underline-thickness` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/file-manager/index.css:157` |
| `--ds-link-underline-thickness-hover` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/link/index.css:75` |
| `--ds-list-actions-gap` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/list/index.css:262` |
| `--ds-list-background-color` | a | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/list/index.css:53` |
| `--ds-list-border-width` | a | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/list/index.css:114` |
| `--ds-list-default-padding-horizontal` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/list/index.css:206` |
| `--ds-list-default-padding-vertical` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/list/index.css:206` |
| `--ds-list-extra-margin-left` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/list/index.css:255` |
| `--ds-list-footer-background-color` | a | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/list/index.css:111` |
| `--ds-list-footer-padding-horizontal` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/list/index.css:109` |
| `--ds-list-footer-padding-vertical` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/list/index.css:109` |
| `--ds-list-header-background-color` | a | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/list/index.css:106` |
| `--ds-list-header-font-weight` | a | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/list/index.css:105` |
| `--ds-list-header-padding-horizontal` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/list/index.css:103` |
| `--ds-list-header-padding-vertical` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/list/index.css:103` |
| `--ds-list-item-background-color` | a | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/list/index.css:207` |
| `--ds-list-lg-padding-horizontal` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/list/index.css:83` |
| `--ds-list-lg-padding-vertical` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/list/index.css:83` |
| `--ds-list-loading-opacity` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/list/index.css:89` |
| `--ds-list-meta-avatar-margin-right` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/list/index.css:294` |
| `--ds-list-meta-description-font-size` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/list/index.css:311` |
| `--ds-list-meta-description-margin-top` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/list/index.css:312` |
| `--ds-list-meta-title-font-size` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/list/index.css:304` |
| `--ds-list-meta-title-font-weight` | a | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/list/index.css:305` |
| `--ds-list-preview-panel-shadow` | a | no-literal-derived | presentation | `src/foundation/tokens/css/presentation/components/skin/collection-workspace/index.css:446` |
| `--ds-list-sm-padding-horizontal` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/list/index.css:80` |
| `--ds-list-sm-padding-vertical` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/list/index.css:80` |
| `--ds-list-split-inset-inline` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/list/index.css:196` |
| `--ds-list-split-width` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/list/index.css:197` |
| `--ds-list-text-color` | a | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/list/index.css:208` |
| `--ds-list-toolbar-radius-shell` | a | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/list-toolbar/index.css:106` |
| `--ds-list-transition-timing` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/list/index.css:209` |
| `--ds-listing-grid-bottom-bleed` | b | no-producer | presentation | `src/foundation/tokens/css/presentation/components/skin/grid-view/index.css:55` |
| `--ds-live-feed-banner-gap` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/live-feed/index.css:124` |
| `--ds-live-feed-banner-height` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/live-feed/index.css:123` |
| `--ds-live-feed-banner-margin-block-end` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/live-feed/index.css:127` |
| `--ds-live-feed-banner-padding-inline` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/live-feed/index.css:126` |
| `--ds-live-feed-body-padding` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/live-feed/index.css:49` |
| `--ds-live-feed-control-font-size` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/live-feed/index.css:114` |
| `--ds-live-feed-control-height` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/live-feed/index.css:175` |
| `--ds-live-feed-control-padding-inline` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/live-feed/index.css:177` |
| `--ds-live-feed-empty-padding-block` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/live-feed/index.css:159` |
| `--ds-live-feed-footer-margin-block-start` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/live-feed/index.css:169` |
| `--ds-live-feed-header-margin-block-end` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/live-feed/index.css:94` |
| `--ds-live-feed-load-more-gap` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/live-feed/index.css:174` |
| `--ds-live-feed-refresh-size` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/live-feed/index.css:107` |
| `--ds-live-feed-skeleton-row-gap` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/live-feed/index.css:66` |
| `--ds-live-feed-skeleton-row-height` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/live-feed/index.css:76` |
| `--ds-live-feed-skeleton-title-gap` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/live-feed/index.css:72` |
| `--ds-live-feed-skeleton-title-height` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/live-feed/index.css:70` |
| `--ds-loading-overlay-scrim-opacity` | a | no-producer | presentation | `src/foundation/tokens/css/presentation/components/skin/loading-overlay/index.css:128` |
| `--ds-loading-skeleton-header-height` | a | no-producer | presentation | `src/foundation/tokens/css/presentation/components/skin/surface-states/index.css:36` |
| `--ds-markdown-link-decoration-hover` | a | no-producer | presentation | `src/foundation/tokens/css/presentation/components/skin/markdown-view/index.css:48` |
| `--ds-markdown-view-measure` | a | no-producer | presentation | `src/foundation/tokens/css/presentation/components/skin/markdown-view/index.css:169` |
| `--ds-material-overlay-texture` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/context-menu/index.css:118` |
| `--ds-material-panel-texture` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/empty-state/index.css:48` |
| `--ds-mentions-autosize-height` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/mentions/index.css:54` |
| `--ds-mentions-autosize-overflow` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/mentions/index.css:55` |
| `--ds-mentions-bg` | a | no-producer | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/mentions/index.css:30` |
| `--ds-mentions-border-error` | a | no-producer | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/mentions/index.css:37` |
| `--ds-mentions-border-warning` | a | no-producer | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/mentions/index.css:40` |
| `--ds-mentions-empty-color` | a | no-producer | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/mentions/index.css:57` |
| `--ds-mentions-spinner-gap` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/mentions/index.css:198` |
| `--ds-mentions-spinner-offset` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/mentions/index.css:199` |
| `--ds-mentions-spinner-size` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/mentions/index.css:196` |
| `--ds-menu-arrow-bg` | a2 | yes-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/menu/index.css:292` |
| `--ds-menu-arrow-opacity` | a2 | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/menu/index.css:293` |
| `--ds-menu-border-radius` | a | yes-declared | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/menu/index.css:42` |
| `--ds-menu-disabled-opacity` | a | no-literal-derived | modern+presentation | `src/foundation/tokens/css/presentation/components/skin/menu-compounds/index.css:40` |
| `--ds-menu-group-bg` | a2 | yes-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/menu/index.css:352` |
| `--ds-menu-icon-color` | a | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/menu/index.css:260` |
| `--ds-menu-icon-opacity` | a2 | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/menu/index.css:263` |
| `--ds-menu-icon-plate-bg` | a2 | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/menu/index.css:262` |
| `--ds-menu-icon-scale` | a2 | yes-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/menu/index.css:189` |
| `--ds-menu-item-keyline` | a2 | yes-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/menu/index.css:209` |
| `--ds-menu-item-lift` | a2 | yes-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/menu/index.css:177` |
| `--ds-menu-level` | a2 | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/menu/index.css:127` |
| `--ds-menu-panel-enter-distance` | a | yes-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/menu/index.css:398` |
| `--ds-message-radius` | a | no-producer | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/message/index.css:27` |
| `--ds-message-shadow` | a | no-producer | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/message/index.css:28` |
| `--ds-metric-card-body-color` | a | no-producer | presentation | `src/foundation/tokens/css/presentation/components/skin/metrics-cards/index.css:144` |
| `--ds-metric-card-footer-bg` | a | no-producer | presentation | `src/foundation/tokens/css/presentation/components/skin/metrics-cards/index.css:205` |
| `--ds-metric-card-footer-border` | a | no-producer | presentation | `src/foundation/tokens/css/presentation/components/skin/metrics-cards/index.css:209` |
| `--ds-metric-card-footer-color` | a | no-producer | presentation | `src/foundation/tokens/css/presentation/components/skin/metrics-cards/index.css:206` |
| `--ds-metric-card-hover-transform` | a | no-producer | presentation | `src/foundation/tokens/css/presentation/components/skin/dashboard-metrics-interactions/index.css:123` |
| `--ds-metric-card-meter-height` | a | no-literal-declared | presentation | `src/foundation/tokens/css/presentation/components/skin/metrics-cards/index.css:284` |
| `--ds-metric-card-meter-track-border` | a | yes-declared | presentation | `src/foundation/tokens/css/presentation/components/skin/metrics-cards/index.css:291` |
| `--ds-metric-card-overlay` | a | no-producer | presentation | `src/foundation/tokens/css/presentation/components/skin/metrics-cards/index.css:184` |
| `--ds-mobile-header-sticky-backdrop` | a | no-producer | presentation | `src/foundation/tokens/css/presentation/components/skin/mobile-header/index.css:119` |
| `--ds-mobile-header-sticky-z` | a | no-producer | presentation | `src/foundation/tokens/css/presentation/components/skin/mobile-header/index.css:121` |
| `--ds-modal-action-lift` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/modal/index.css:371` |
| `--ds-modal-btn-radius` | a | no-producer | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/modal/index.css:76` |
| `--ds-modal-close-size` | a | no-literal-declared | modern+presentation | `src/foundation/tokens/css/presentation/components/skin/modal-compounds/index.css:97` |
| `--ds-modal-close-size-lg` | a | no-literal-declared | presentation | `src/foundation/tokens/css/presentation/components/skin/modal-compounds/index.css:119` |
| `--ds-modal-close-size-sm` | a | no-literal-declared | presentation | `src/foundation/tokens/css/presentation/components/skin/modal-compounds/index.css:114` |
| `--ds-modal-enter-scale` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/modal/index.css:25` |
| `--ds-modal-enter-y` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/modal/index.css:25` |
| `--ds-modal-max-block-size` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/modal/index.css:126` |
| `--ds-modal-max-inline-size` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/modal/index.css:125` |
| `--ds-modal-overlay-strength` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/modal/index.css:97` |
| `--ds-modal-placement-offset` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/modal/index.css:75` |
| `--ds-modal-scrim-opacity` | a | no-producer | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/modal/index.css:30` |
| `--ds-modal-width-2xl` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/modal/index.css:156` |
| `--ds-modal-width-3xl` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/modal/index.css:160` |
| `--ds-modal-width-4xl` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/modal/index.css:164` |
| `--ds-modal-width-5xl` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/modal/index.css:168` |
| `--ds-modal-width-full` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/modal/index.css:172` |
| `--ds-modal-width-lg` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/modal/index.css:148` |
| `--ds-modal-width-md` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/modal/index.css:124` |
| `--ds-modal-width-sm` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/modal/index.css:144` |
| `--ds-modal-width-xl` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/modal/index.css:152` |
| `--ds-modal-width-xs` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/modal/index.css:140` |
| `--ds-modern-table-action-cell-padding` | a | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/data-table/index.css:653` |
| `--ds-modern-table-cell-padding` | a | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/data-table/index.css:384` |
| `--ds-modern-table-divider` | a | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/data-table/index.css:1262` |
| `--ds-modern-table-leading-cell-padding` | a | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/data-table/index.css:448` |
| `--ds-modern-table-selection-cell-padding` | a | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/data-table/index.css:434` |
| `--ds-motion-instant` | a | no-literal-declared | modern+presentation | `src/foundation/tokens/css/presentation/components/skin/markdown-view/index.css:38` |
| `--ds-motion-intensity` | a | no-literal-declared | modern+presentation | `src/foundation/tokens/css/presentation/components/skin/bottom-tab-bar/index.css:340` |
| `--ds-motion-rearrange` | a2 | yes-declared | presentation | `src/foundation/tokens/css/presentation/components/skin/widget-board/index.css:430` |
| `--ds-motion-resize` | a | yes-declared | presentation | `src/foundation/tokens/css/presentation/components/skin/widget-board/index.css:434` |
| `--ds-motion-scale-in` | a | no-literal-declared | modern+presentation | `src/foundation/tokens/css/presentation/components/skin/saved-views-menu/index.css:131` |
| `--ds-motion-spring` | a | no-literal-declared | presentation | `src/foundation/tokens/css/presentation/components/skin/dashboard-activity-interactions/index.css:81` |
| `--ds-notification-center-panel-width` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/notification-center/index.css:83` |
| `--ds-notification-center-touch-target` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/notification-center/index.css:309` |
| `--ds-notification-radius` | a | yes-declared | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/notification/index.css:25` |
| `--ds-notifier-clickable-lift` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/notifier/index.css:388` |
| `--ds-notifier-control-lift` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/notifier/index.css:376` |
| `--ds-notifier-control-size` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/notifier/index.css:342` |
| `--ds-notifier-lifetime` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/notifier/index.css:440` |
| `--ds-notifier-message-control-size` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/notifier/index.css:369` |
| `--ds-notifier-message-min-width` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/notifier/index.css:134` |
| `--ds-notifier-message-well-size` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/notifier/index.css:262` |
| `--ds-notifier-message-width` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/notifier/index.css:61` |
| `--ds-notifier-notification-width` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/notifier/index.css:59` |
| `--ds-notifier-scale-step` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/notifier/index.css:19` |
| `--ds-notifier-sheen-angle` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/notifier/index.css:115` |
| `--ds-notifier-sheen-stop` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/notifier/index.css:117` |
| `--ds-notifier-stack-recede` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/notifier/index.css:84` |
| `--ds-notifier-stack-step` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/notifier/index.css:84` |
| `--ds-notifier-travel` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/notifier/index.css:18` |
| `--ds-notifier-travel-direction` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/notifier/index.css:18` |
| `--ds-notifier-well-size` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/notifier/index.css:251` |
| `--ds-numeric-tabular` | a | no-literal-declared | modern+presentation | `src/foundation/tokens/css/presentation/components/skin/chart-bullet/index.css:26` |
| `--ds-overlay-backdrop-filter` | a | no-producer | presentation | `src/foundation/tokens/css/presentation/components/skin/overlay-modal-compounds/index.css:89` |
| `--ds-page-header-eyebrow-tracking` | a | no-producer | modern+presentation | `src/foundation/tokens/css/presentation/components/skin/collection-header/index.css:91` |
| `--ds-page-header-sheen-duration` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/page-shell/index.css:190` |
| `--ds-page-header-sheen-opacity` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/page-shell/index.css:181` |
| `--ds-page-header-subtitle-max-width` | a | no-producer | modern+presentation | `src/foundation/tokens/css/presentation/components/skin/collection-header/index.css:373` |
| `--ds-page-header-title-max-width` | a | no-producer | modern+presentation | `src/foundation/tokens/css/presentation/components/skin/collection-header/index.css:115` |
| `--ds-page-shell-action-gap` | a | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/page-shell/index.css:602` |
| `--ds-page-shell-actions-backdrop` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/page-shell/index.css:321` |
| `--ds-page-shell-content-padding` | a | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/page-shell/index.css:613` |
| `--ds-page-shell-header-padding` | a | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/page-shell/index.css:146` |
| `--ds-page-shell-item-gap` | a | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/page-shell/index.css:585` |
| `--ds-page-shell-max-width` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/page-shell/index.css:135` |
| `--ds-page-shell-section-gap` | a | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/page-shell/index.css:325` |
| `--ds-pagination-active-color` | a | no-producer | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/pagination/index.css:47` |
| `--ds-pagination-bg` | a | no-producer | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/pagination/index.css:40` |
| `--ds-pagination-controls-bleed` | a2 | yes-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/pagination/index.css:53` |
| `--ds-pagination-gap` | a2 | yes-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/pagination/index.css:21` |
| `--ds-pagination-item-bg` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/pagination/index.css:175` |
| `--ds-pagination-item-bg-active` | a2 | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/pagination/index.css:130` |
| `--ds-pagination-item-bg-hover` | a2 | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/pagination/index.css:122` |
| `--ds-pagination-jumper-width` | a2 | yes-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/pagination/index.css:188` |
| `--ds-pagination-lg-font-size` | a | yes-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/pagination/index.css:37` |
| `--ds-pagination-lg-height` | a | yes-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/pagination/index.css:35` |
| `--ds-pagination-lg-padding-x` | a | yes-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/pagination/index.css:36` |
| `--ds-pagination-md-font-size` | a | yes-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/pagination/index.css:17` |
| `--ds-pagination-md-height` | a | yes-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/pagination/index.css:15` |
| `--ds-pagination-md-padding-x` | a | yes-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/pagination/index.css:16` |
| `--ds-pagination-motion-duration` | a2 | yes-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/pagination/index.css:181` |
| `--ds-pagination-motion-easing` | a2 | yes-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/pagination/index.css:181` |
| `--ds-pagination-nav-inline-size` | a2 | yes-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/pagination/index.css:96` |
| `--ds-pagination-numeric` | a | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/pagination/index.css:155` |
| `--ds-pagination-range-margin-block-end` | a | yes-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/pagination/index.css:42` |
| `--ds-pagination-row-gap` | a2 | yes-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/pagination/index.css:22` |
| `--ds-pagination-simple-gap` | a2 | yes-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/pagination/index.css:145` |
| `--ds-pagination-sm-font-size` | a | yes-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/pagination/index.css:31` |
| `--ds-pagination-sm-height` | a | yes-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/pagination/index.css:29` |
| `--ds-pagination-sm-padding-x` | a | yes-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/pagination/index.css:30` |
| `--ds-password-strength-fill` | a | no-producer | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/password-input/index.css:111` |
| `--ds-pattern-timeline-marker-color` | a | no-producer | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/pattern-timeline/index.css:11` |
| `--ds-personality-animation-entrance-duration` | a | no-producer | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/stats-grid/index.css:11` |
| `--ds-personality-animation-offset-distance` | a | no-producer | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/message/index.css:117` |
| `--ds-popconfirm-button-radius` | a | no-producer | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/popconfirm/index.css:68` |
| `--ds-popconfirm-danger-color` | a | no-producer | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/popconfirm/index.css:82` |
| `--ds-popconfirm-icon-offset` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/popconfirm/index.css:145` |
| `--ds-popconfirm-max-width` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/popconfirm/index.css:108` |
| `--ds-popconfirm-min-width` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/popconfirm/index.css:104` |
| `--ds-popconfirm-motion-offset` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/popconfirm/index.css:57` |
| `--ds-popconfirm-motion-scale` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/popconfirm/index.css:58` |
| `--ds-popconfirm-primary-color` | a | no-producer | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/popconfirm/index.css:86` |
| `--ds-popover-arrow-anchor-offset` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/popover/index.css:344` |
| `--ds-popover-arrow-edge-offset` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/popover/index.css:324` |
| `--ds-popover-arrow-shadow` | a | no-producer | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/popover/index.css:58` |
| `--ds-popover-arrow-size` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/popover/index.css:264` |
| `--ds-popover-body-scrollbar-width` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/popover/index.css:246` |
| `--ds-popover-bordered-texture` | a | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/popover/index.css:56` |
| `--ds-popover-bordered-title-padding-inline` | a2 | yes-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/popover/index.css:59` |
| `--ds-popover-closed-transform` | a | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/popover/index.css:129` |
| `--ds-popover-comfortable-title-padding-inline` | a2 | yes-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/popover/index.css:199` |
| `--ds-popover-compact-title-padding-inline` | a2 | yes-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/popover/index.css:191` |
| `--ds-popover-inverse-texture` | a | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/popover/index.css:170` |
| `--ds-popover-max-height` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/popover/index.css:72` |
| `--ds-popover-min-width` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/popover/index.css:70` |
| `--ds-popover-minimal-texture` | a | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/popover/index.css:156` |
| `--ds-popover-minimal-title-padding-inline` | a2 | yes-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/popover/index.css:159` |
| `--ds-popover-motion-distance` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/popover/index.css:134` |
| `--ds-popover-motion-scale` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/popover/index.css:134` |
| `--ds-popover-padding-block-current` | a | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/popover/index.css:241` |
| `--ds-popover-radius-current` | a | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/popover/index.css:75` |
| `--ds-popover-rich-texture` | a | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/popover/index.css:180` |
| `--ds-popover-rich-title-padding-inline` | a2 | yes-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/popover/index.css:183` |
| `--ds-popover-spacious-title-padding-inline` | a2 | yes-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/popover/index.css:205` |
| `--ds-popover-texture-current` | a | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/popover/index.css:103` |
| `--ds-popover-title-background` | a | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/popover/index.css:229` |
| `--ds-popover-title-color` | a | no-literal-declared | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/popover/index.css:48` |
| `--ds-popover-title-divider-width` | a | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/popover/index.css:225` |
| `--ds-popover-viewport-gap` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/popover/index.css:70` |
| `--ds-premium-card-action-bg` | a | yes-declared | presentation | `src/foundation/tokens/css/presentation/components/skin/card-compounds/index.css:239` |
| `--ds-premium-card-action-border` | a | yes-declared | presentation | `src/foundation/tokens/css/presentation/components/skin/card-compounds/index.css:237` |
| `--ds-premium-card-min-height` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/card/index.css:23` |
| `--ds-presence-badge-ring` | a | no-producer | presentation | `src/foundation/tokens/css/presentation/components/skin/presence/index.css:117` |
| `--ds-presence-cursor-x` | a | no-producer | presentation | `src/foundation/tokens/css/presentation/components/skin/presence/index.css:179` |
| `--ds-presence-cursor-y` | a | no-producer | presentation | `src/foundation/tokens/css/presentation/components/skin/presence/index.css:180` |
| `--ds-pricing-table-features-head-min-inline-size` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/pricing-table/index.css:147` |
| `--ds-pricing-table-highlight-frame-width` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/pricing-table/index.css:177` |
| `--ds-progress-bar-radius` | a | no-producer | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/progress/index.css:81` |
| `--ds-progress-bg` | a | yes-declared | modern+presentation | `src/foundation/tokens/css/presentation/components/skin/progress-compounds/index.css:28` |
| `--ds-progress-circle-size` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/progress/index.css:261` |
| `--ds-progress-circle-thickness` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/progress/index.css:262` |
| `--ds-progress-circle-value` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/progress/index.css:260` |
| `--ds-progress-height` | a | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/progress/index.css:188` |
| `--ds-progress-radius` | a | yes-declared | modern+presentation | `src/foundation/tokens/css/presentation/components/skin/progress-compounds/index.css:29` |
| `--ds-qrcode-bg` | a | no-producer | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/qrcode/index.css:37` |
| `--ds-qrcode-border-width` | a | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/qrcode/index.css:54` |
| `--ds-qrcode-expired-color` | a | no-producer | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/qrcode/index.css:54` |
| `--ds-qrcode-icon-padding` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/qrcode/index.css:214` |
| `--ds-qrcode-loading-opacity` | a | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/qrcode/index.css:84` |
| `--ds-qrcode-overlay-bg` | a | no-producer | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/qrcode/index.css:42` |
| `--ds-qrcode-radius` | a | no-producer | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/qrcode/index.css:36` |
| `--ds-qrcode-refresh-button-bg` | a | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/qrcode/index.css:161` |
| `--ds-qrcode-refresh-button-font-size` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/qrcode/index.css:149` |
| `--ds-qrcode-refresh-button-padding-x` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/qrcode/index.css:148` |
| `--ds-qrcode-refresh-button-size` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/qrcode/index.css:146` |
| `--ds-qrcode-root-padding` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/qrcode/index.css:52` |
| `--ds-qrcode-spinner-size` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/qrcode/index.css:114` |
| `--ds-qrcode-spinner-track` | a | no-producer | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/qrcode/index.css:47` |
| `--ds-qrcode-status-expired-opacity` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/qrcode/index.css:81` |
| `--ds-qrcode-status-icon-size` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/qrcode/index.css:202` |
| `--ds-qrcode-status-scanned-opacity` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/qrcode/index.css:87` |
| `--ds-qrcode-transition-duration` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/qrcode/index.css:96` |
| `--ds-qrcode-transition-timing` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/qrcode/index.css:96` |
| `--ds-radio-bg` | a | no-literal-declared | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/radio/index.css:30` |
| `--ds-radio-bg-disabled` | a | yes-declared | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/radio/index.css:35` |
| `--ds-radio-border-width` | a | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/radio/index.css:106` |
| `--ds-radio-disabled-cursor` | a | no-literal-declared | modern+presentation | `src/foundation/tokens/css/presentation/components/skin/radio-group/index.css:171` |
| `--ds-radio-disabled-opacity` | a | yes-declared | modern+presentation | `src/foundation/tokens/css/presentation/components/skin/radio-group/index.css:173` |
| `--ds-radio-dot-fill` | a | no-producer | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/radio/index.css:44` |
| `--ds-radio-dot-scale` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/radio/index.css:201` |
| `--ds-radio-error-border` | a | yes-declared | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/radio/index.css:47` |
| `--ds-radio-error-color` | a | no-literal-declared | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/radio/index.css:66` |
| `--ds-radio-label-color-disabled` | a | yes-declared | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/radio/index.css:63` |
| `--ds-radio-md-size` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/radio/index.css:84` |
| `--ds-radio-size-lg` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/radio/index.css:89` |
| `--ds-radio-size-xl` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/radio/index.css:94` |
| `--ds-radio-sm-size` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/radio/index.css:79` |
| `--ds-radio-text-gap` | a | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/radio/index.css:228` |
| `--ds-radio-xs-size` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/radio/index.css:74` |
| `--ds-radius-2xl` | a | no-literal-declared | presentation+rustic | `src/foundation/tokens/css/presentation/components/skin/decision-panorama/index.css:31` |
| `--ds-radius-none` | a | no-literal-declared | presentation | `src/foundation/tokens/css/presentation/components/skin/collection-shell/index.css:181` |
| `--ds-rate-focus-ring-offset` | a | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/rate/index.css:147` |
| `--ds-rate-focus-ring-width` | a | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/rate/index.css:146` |
| `--ds-rate-gap` | a | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/rate/index.css:56` |
| `--ds-rate-hover-scale` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/rate/index.css:134` |
| `--ds-rate-lg-size` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/rate/index.css:74` |
| `--ds-rate-md-size` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/rate/index.css:70` |
| `--ds-rate-sm-size` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/rate/index.css:66` |
| `--ds-rate-star-active` | a | no-producer | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/rate/index.css:40` |
| `--ds-rate-star-inactive` | a | no-producer | modern+rustic | `src/foundation/tokens/css/runtime/engines/modern/skin/rate/index.css:207` |
| `--ds-rate-xl-size` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/rate/index.css:78` |
| `--ds-rate-xs-size` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/rate/index.css:62` |
| `--ds-record-fact-span` | a | no-producer | presentation | `src/foundation/tokens/css/presentation/components/skin/record-facts/index.css:171` |
| `--ds-record-facts-border` | a | yes-declared | presentation | `src/foundation/tokens/css/presentation/components/skin/record-facts/index.css:36` |
| `--ds-record-facts-compact-item-height` | a | no-producer | modern+presentation | `src/foundation/tokens/css/presentation/components/skin/record-facts/index.css:175` |
| `--ds-record-facts-compact-item-padding` | a | no-producer | presentation | `src/foundation/tokens/css/presentation/components/skin/record-facts/index.css:176` |
| `--ds-record-facts-divider` | a | yes-declared | presentation | `src/foundation/tokens/css/presentation/components/skin/record-facts/index.css:55` |
| `--ds-record-facts-header-height` | a | no-producer | modern+presentation | `src/foundation/tokens/css/presentation/components/skin/record-facts/index.css:53` |
| `--ds-record-facts-header-padding` | a | no-producer | presentation | `src/foundation/tokens/css/presentation/components/skin/record-facts/index.css:54` |
| `--ds-record-facts-item-height` | a | no-producer | modern+presentation | `src/foundation/tokens/css/presentation/components/skin/record-facts/index.css:163` |
| `--ds-record-facts-item-padding` | a | no-producer | presentation | `src/foundation/tokens/css/presentation/components/skin/record-facts/index.css:165` |
| `--ds-record-facts-label-size` | a | no-producer | presentation | `src/foundation/tokens/css/presentation/components/skin/record-facts/index.css:217` |
| `--ds-result-code-size` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/result/index.css:118` |
| `--ds-result-content-width` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/result/index.css:172` |
| `--ds-result-description-width` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/result/index.css:150` |
| `--ds-result-icon-well-size` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/result/index.css:76` |
| `--ds-result-min-height` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/result/index.css:46` |
| `--ds-saved-views-bar-min-height` | a | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/saved-views/index.css:52` |
| `--ds-saved-views-bar-padding-inline` | a | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/saved-views/index.css:55` |
| `--ds-saved-views-bar-padding-inline-compact` | a | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/saved-views/index.css:105` |
| `--ds-saved-views-create-button-gap` | a | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/saved-views/index.css:434` |
| `--ds-saved-views-create-button-padding-block` | a | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/saved-views/index.css:435` |
| `--ds-saved-views-create-button-padding-inline` | a | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/saved-views/index.css:436` |
| `--ds-saved-views-create-form-gap` | a | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/saved-views/index.css:424` |
| `--ds-saved-views-create-form-padding-block` | a | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/saved-views/index.css:425` |
| `--ds-saved-views-drag-handle-opacity` | a | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/saved-views/index.css:251` |
| `--ds-saved-views-gap` | a | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/saved-views/index.css:47` |
| `--ds-saved-views-gap-compact` | a | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/saved-views/index.css:104` |
| `--ds-saved-views-input-font-size` | a | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/saved-views/index.css:395` |
| `--ds-saved-views-input-height` | a | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/saved-views/index.css:389` |
| `--ds-saved-views-input-padding-inline` | a | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/saved-views/index.css:391` |
| `--ds-saved-views-input-width` | a | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/saved-views/index.css:380` |
| `--ds-saved-views-menu-list-max-block-size` | a | no-literal-declared | presentation | `src/foundation/tokens/css/presentation/components/skin/saved-views-menu/index.css:586` |
| `--ds-saved-views-menu-panel-left` | a2 | no-literal-declared | presentation | `src/foundation/tokens/css/presentation/components/skin/saved-views-menu/index.css:154` |
| `--ds-saved-views-menu-panel-top` | a2 | no-literal-declared | presentation | `src/foundation/tokens/css/presentation/components/skin/saved-views-menu/index.css:153` |
| `--ds-saved-views-menu-panel-width` | a2 | no-literal-declared | presentation | `src/foundation/tokens/css/presentation/components/skin/saved-views-menu/index.css:155` |
| `--ds-saved-views-menu-trigger-size` | a | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/saved-views/index.css:315` |
| `--ds-saved-views-menu-view-item-label-measure` | a | no-literal-declared | presentation | `src/foundation/tokens/css/presentation/components/skin/saved-views-menu/index.css:632` |
| `--ds-saved-views-pill-font-size` | a | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/saved-views/index.css:130` |
| `--ds-saved-views-pill-font-weight` | a | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/saved-views/index.css:215` |
| `--ds-saved-views-pill-gap` | a | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/saved-views/index.css:117` |
| `--ds-saved-views-pill-label-max-width` | a | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/saved-views/index.css:233` |
| `--ds-saved-views-pill-line-height` | a | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/saved-views/index.css:132` |
| `--ds-saved-views-pill-padding-block` | a | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/saved-views/index.css:122` |
| `--ds-saved-views-pill-padding-inline` | a | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/saved-views/index.css:125` |
| `--ds-saved-views-unsaved-dot-size` | a | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/saved-views/index.css:263` |
| `--ds-scroll-area-focus-ring-offset` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/scroll-area/index.css:54` |
| `--ds-scroll-area-overscroll-behavior` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/scroll-area/index.css:81` |
| `--ds-scroll-area-scrollbar-radius` | a | no-literal-declared | modern+rustic | `src/foundation/tokens/css/runtime/engines/modern/skin/scroll-area/index.css:161` |
| `--ds-scroll-area-scrollbar-size` | a | no-literal-declared | modern+presentation+rustic | `src/foundation/tokens/css/presentation/components/skin/scroll-area/index.css:39` |
| `--ds-scroll-area-track-bg` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/scroll-area/index.css:122` |
| `--ds-search-empty-bg` | a | no-literal-derived | presentation | `src/foundation/tokens/css/presentation/components/skin/search/index.css:118` |
| `--ds-search-shadow` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/list-toolbar/index.css:922` |
| `--ds-section-card-eyebrow-tracking` | a | no-producer | presentation | `src/foundation/tokens/css/presentation/components/skin/surface-section-card/index.css:92` |
| `--ds-section-card-header-min-height` | a | no-producer | presentation | `src/foundation/tokens/css/presentation/components/skin/surface-section-card/index.css:46` |
| `--ds-section-card-icon-size` | a | no-producer | presentation | `src/foundation/tokens/css/presentation/components/skin/surface-section-card/index.css:70` |
| `--ds-segmented-active-bg` | a | no-producer | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/segmented/index.css:35` |
| `--ds-segmented-active-shadow` | a | no-producer | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/segmented/index.css:36` |
| `--ds-segmented-current-font-size` | a | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/segmented/index.css:268` |
| `--ds-segmented-current-gap` | a | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/segmented/index.css:257` |
| `--ds-segmented-current-height` | a | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/segmented/index.css:262` |
| `--ds-segmented-current-icon-size` | a | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/segmented/index.css:300` |
| `--ds-segmented-current-line-height` | a | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/segmented/index.css:270` |
| `--ds-segmented-current-padding-x` | a | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/segmented/index.css:263` |
| `--ds-segmented-current-radius` | a | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/segmented/index.css:265` |
| `--ds-segmented-gap` | a | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/segmented/index.css:84` |
| `--ds-segmented-item-bg` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/segmented/index.css:317` |
| `--ds-segmented-item-max-inline-size` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/segmented/index.css:261` |
| `--ds-segmented-item-transform-selected` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/segmented/index.css:364` |
| `--ds-segmented-padding` | a | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/segmented/index.css:86` |
| `--ds-select-action-size` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/select/index.css:255` |
| `--ds-select-arrow-rotate` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/select/index.css:296` |
| `--ds-select-arrow-rotate-open` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/select/index.css:304` |
| `--ds-select-backdrop-filter` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/select/index.css:383` |
| `--ds-select-border` | a | no-literal-declared | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/select/index.css:176` |
| `--ds-select-border-focus` | a | no-literal-declared | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/select/index.css:66` |
| `--ds-select-clear-color` | a | yes-declared | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/select/index.css:118` |
| `--ds-select-color-placeholder` | a | yes-declared | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/select/index.css:149` |
| `--ds-select-dropdown-border` | a | no-literal-declared | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/select/index.css:142` |
| `--ds-select-dropdown-inline-size` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/select/index.css:370` |
| `--ds-select-dropdown-max-width` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/select/index.css:372` |
| `--ds-select-dropdown-min-width` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/select/index.css:371` |
| `--ds-select-dropdown-texture` | a | yes-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/select/index.css:379` |
| `--ds-select-empty-bg` | a | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/select/index.css:652` |
| `--ds-select-empty-min-height` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/select/index.css:645` |
| `--ds-select-enter-y` | a | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/select/index.css:15` |
| `--ds-select-group-height` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/select/index.css:491` |
| `--ds-select-loading-size` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/select/index.css:353` |
| `--ds-select-max-height` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/select/index.css:449` |
| `--ds-select-option-check-bg` | a | yes-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/select/index.css:639` |
| `--ds-select-option-checkbox-size` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/select/index.css:567` |
| `--ds-select-option-content-gap` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/select/index.css:608` |
| `--ds-select-option-height` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/select/index.css:518` |
| `--ds-select-option-icon-well-size` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/select/index.css:590` |
| `--ds-select-scrollbar-size` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/select/index.css:481` |
| `--ds-select-search-height` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/select/index.css:402` |
| `--ds-select-tag-max-width` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/select/index.css:221` |
| `--ds-select-tag-remove-touch-min` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/select/index.css:686` |
| `--ds-select-virtual-height` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/select/index.css:459` |
| `--ds-select-virtual-offset` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/select/index.css:469` |
| `--ds-select-virtual-row` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/select/index.css:475` |
| `--ds-select-virtual-total` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/select/index.css:464` |
| `--ds-selection-preview-rail-close-backdrop` | a | no-producer | presentation | `src/foundation/tokens/css/presentation/components/skin/selection-preview-rail/index.css:154` |
| `--ds-shadow-input-error` | a | yes-declared | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/form-builder/index.css:115` |
| `--ds-shadow-none` | a | yes-declared | presentation | `src/foundation/tokens/css/presentation/components/skin/collection-shell/index.css:182` |
| `--ds-sheet-body-padding` | a | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/sheet/index.css:248` |
| `--ds-sheet-close-size` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/sheet/index.css:277` |
| `--ds-sheet-handle-area-padding-block-end` | a | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/sheet/index.css:205` |
| `--ds-sheet-handle-area-padding-block-start` | a | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/sheet/index.css:204` |
| `--ds-sheet-handle-block-size` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/sheet/index.css:210` |
| `--ds-sheet-handle-inline-size` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/sheet/index.css:209` |
| `--ds-sheet-max-height` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/sheet/index.css:107` |
| `--ds-sheet-min-height` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/sheet/index.css:108` |
| `--ds-sheet-panel-layer` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/sheet/index.css:80` |
| `--ds-sheet-safe-area-bottom` | a | no-producer | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/sheet/index.css:54` |
| `--ds-sheet-side-width` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/sheet/index.css:115` |
| `--ds-shell-collapse-transition` | a | no-producer | presentation | `src/foundation/tokens/css/presentation/components/skin/app-shell/index.css:67` |
| `--ds-shell-content-background` | a | no-producer | presentation | `src/foundation/tokens/css/presentation/components/skin/app-shell/index.css:345` |
| `--ds-shell-content-border` | a | no-producer | presentation | `src/foundation/tokens/css/presentation/components/skin/app-shell/index.css:346` |
| `--ds-shell-content-padding` | a | no-producer | presentation | `src/foundation/tokens/css/presentation/components/skin/app-shell/index.css:344` |
| `--ds-shell-footer-background` | a | no-producer | presentation | `src/foundation/tokens/css/presentation/components/skin/app-shell/index.css:352` |
| `--ds-shell-footer-border` | a | no-producer | presentation | `src/foundation/tokens/css/presentation/components/skin/app-shell/index.css:353` |
| `--ds-shell-footer-padding` | a | no-producer | presentation | `src/foundation/tokens/css/presentation/components/skin/app-shell/index.css:351` |
| `--ds-shell-footer-shadow` | a | no-producer | presentation | `src/foundation/tokens/css/presentation/components/skin/app-shell/index.css:354` |
| `--ds-shell-grid-line` | a | no-literal-derived | modern+rustic | `src/foundation/tokens/css/runtime/engines/modern/skin/page-shell/index.css:332` |
| `--ds-shell-grid-size` | a | no-literal-derived | modern+rustic | `src/foundation/tokens/css/runtime/engines/modern/skin/page-shell/index.css:332` |
| `--ds-shell-header-inset-block-start` | a | no-producer | presentation | `src/foundation/tokens/css/presentation/components/skin/app-shell/index.css:276` |
| `--ds-shell-header-inset-inline` | a | no-producer | presentation | `src/foundation/tokens/css/presentation/components/skin/app-shell/index.css:277` |
| `--ds-shell-header-radius` | a | no-producer | presentation | `src/foundation/tokens/css/presentation/components/skin/app-shell/index.css:304` |
| `--ds-shell-header-shadow` | a | no-producer | presentation | `src/foundation/tokens/css/presentation/components/skin/app-shell/index.css:305` |
| `--ds-shell-inline-start-inset` | a | no-producer | presentation | `src/foundation/tokens/css/presentation/components/skin/app-shell/index.css:234` |
| `--ds-shell-main-background` | a | no-producer | presentation | `src/foundation/tokens/css/presentation/components/skin/app-shell/index.css:254` |
| `--ds-shell-main-border` | a | no-producer | presentation | `src/foundation/tokens/css/presentation/components/skin/app-shell/index.css:255` |
| `--ds-shell-main-shadow` | a | no-producer | presentation | `src/foundation/tokens/css/presentation/components/skin/app-shell/index.css:256` |
| `--ds-shell-navigation-header-background` | a | no-producer | presentation | `src/foundation/tokens/css/presentation/components/skin/app-shell/index.css:130` |
| `--ds-shell-navigation-logo-padding-collapsed` | a | no-producer | presentation | `src/foundation/tokens/css/presentation/components/skin/app-shell/index.css:178` |
| `--ds-shell-navigation-radius` | a | no-producer | presentation | `src/foundation/tokens/css/presentation/components/skin/app-shell/index.css:105` |
| `--ds-shell-resolved-drawer-inline-size` | a | no-producer | presentation | `src/foundation/tokens/css/presentation/components/skin/app-shell/index.css:85` |
| `--ds-shell-resolved-sidebar-header-block-size` | a | no-producer | presentation | `src/foundation/tokens/css/presentation/components/skin/app-shell/index.css:162` |
| `--ds-shell-resolved-sidebar-header-min-block-size` | a | no-producer | presentation | `src/foundation/tokens/css/presentation/components/skin/app-shell/index.css:119` |
| `--ds-shell-safe-area-bottom` | a | no-producer | presentation | `src/foundation/tokens/css/presentation/components/skin/app-shell/index.css:66` |
| `--ds-shell-top-inset` | a | no-producer | presentation | `src/foundation/tokens/css/presentation/components/skin/app-shell/index.css:279` |
| `--ds-sidebar-collapsed-width` | a | no-literal-derived | modern+rustic | `src/foundation/tokens/css/runtime/engines/modern/skin/layout/index.css:347` |
| `--ds-sidebar-surface-aside-inline-size` | a2 | yes-declared | presentation | `src/foundation/tokens/css/presentation/components/skin/sidebar-surface/index.css:30` |
| `--ds-sidebar-surface-aside-width` | a2 | no-literal-derived | presentation | `src/foundation/tokens/css/presentation/components/skin/sidebar-surface/index.css:17` |
| `--ds-sidebar-surface-collapsed-width` | a2 | yes-derived | presentation | `src/foundation/tokens/css/presentation/components/skin/sidebar-surface/index.css:26` |
| `--ds-sidebar-surface-divider` | a2 | yes-derived | presentation | `src/foundation/tokens/css/presentation/components/skin/sidebar-surface/index.css:65` |
| `--ds-sidebar-surface-gap` | a2 | yes-derived | presentation | `src/foundation/tokens/css/presentation/components/skin/sidebar-surface/index.css:20` |
| `--ds-sidebar-surface-inline-size` | a2 | yes-declared | presentation | `src/foundation/tokens/css/presentation/components/skin/sidebar-surface/index.css:19` |
| `--ds-sidebar-surface-main-gap` | a2 | yes-derived | presentation | `src/foundation/tokens/css/presentation/components/skin/sidebar-surface/index.css:60` |
| `--ds-sidebar-surface-motion-duration` | a2 | yes-derived | presentation | `src/foundation/tokens/css/presentation/components/skin/sidebar-surface/index.css:22` |
| `--ds-sidebar-surface-motion-easing` | a2 | yes-derived | presentation | `src/foundation/tokens/css/presentation/components/skin/sidebar-surface/index.css:22` |
| `--ds-sidebar-surface-panel-gap` | a2 | yes-derived | presentation | `src/foundation/tokens/css/presentation/components/skin/sidebar-surface/index.css:48` |
| `--ds-sidebar-surface-stacked-gap` | a2 | yes-derived | presentation | `src/foundation/tokens/css/presentation/components/skin/sidebar-surface/index.css:38` |
| `--ds-sidebar-surface-width` | a2 | yes-derived | presentation | `src/foundation/tokens/css/presentation/components/skin/sidebar-surface/index.css:16` |
| `--ds-size-touch-target` | a | no-producer | presentation | `src/foundation/tokens/css/presentation/components/skin/action-dock/index.css:257` |
| `--ds-skeleton-avatar-radius` | a | no-producer | modern+rustic | `src/foundation/tokens/css/runtime/engines/modern/skin/skeleton/index.css:70` |
| `--ds-skeleton-line-height` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/skeleton/index.css:65` |
| `--ds-skeleton-shape-radius` | a | no-producer | modern+rustic | `src/foundation/tokens/css/runtime/engines/modern/skin/skeleton/index.css:62` |
| `--ds-skeleton-title-height` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/skeleton/index.css:88` |
| `--ds-slider-focus-ring` | a | yes-declared | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/slider/index.css:62` |
| `--ds-slider-handle-bg` | a | no-literal-declared | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/slider/index.css:49` |
| `--ds-slider-handle-bg-disabled` | a | yes-declared | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/slider/index.css:59` |
| `--ds-slider-handle-border` | a | no-literal-declared | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/slider/index.css:56` |
| `--ds-slider-handle-border-width` | a | no-literal-declared | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/slider/index.css:56` |
| `--ds-slider-handle-shadow` | a | no-literal-declared | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/slider/index.css:51` |
| `--ds-slider-mark-color` | a | no-literal-declared | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/slider/index.css:72` |
| `--ds-slider-mark-gap` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/slider/index.css:196` |
| `--ds-slider-rail-color` | a | no-literal-declared | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/slider/index.css:24` |
| `--ds-slider-single-percent` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/slider/index.css:288` |
| `--ds-slider-thumb-size` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/slider/index.css:150` |
| `--ds-slider-track-color` | a | no-literal-declared | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/slider/index.css:35` |
| `--ds-slider-track-color-disabled` | a | yes-declared | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/slider/index.css:39` |
| `--ds-slider-track-radius` | a | yes-declared | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/slider/index.css:25` |
| `--ds-slider-track-size` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/slider/index.css:110` |
| `--ds-space-gap` | a2 | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/space/index.css:20` |
| `--ds-space-gap-lg` | a2 | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/space/index.css:38` |
| `--ds-space-gap-md` | a2 | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/space/index.css:33` |
| `--ds-space-gap-sm` | a2 | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/space/index.css:28` |
| `--ds-space-transition-duration` | a2 | yes-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/space/index.css:22` |
| `--ds-space-transition-timing` | a2 | yes-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/space/index.css:22` |
| `--ds-spacing-20` | a | yes-declared | modern+presentation | `src/foundation/tokens/css/presentation/components/skin/collection-workspace/index.css:582` |
| `--ds-spacing-24` | a | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/statistic/index.css:96` |
| `--ds-spacing-36` | a | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/pricing-table/index.css:159` |
| `--ds-spacing-40` | a | yes-declared | presentation | `src/foundation/tokens/css/presentation/components/skin/collection-workspace-render-dispatch/index.css:105` |
| `--ds-spinner-lg-ring-width` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/spinner/index.css:101` |
| `--ds-spinner-lg-size` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/spinner/index.css:100` |
| `--ds-spinner-md-ring-width` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/spinner/index.css:96` |
| `--ds-spinner-md-size` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/spinner/index.css:94` |
| `--ds-spinner-ring-color` | a | no-producer | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/spinner/index.css:30` |
| `--ds-spinner-sm-ring-width` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/spinner/index.css:91` |
| `--ds-spinner-sm-size` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/spinner/index.css:89` |
| `--ds-spinner-spin-easing` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/spinner/index.css:83` |
| `--ds-spinner-stroke-width` | a | no-literal-declared | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/spinner/index.css:29` |
| `--ds-spinner-xl-ring-width` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/spinner/index.css:106` |
| `--ds-spinner-xl-size` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/spinner/index.css:104` |
| `--ds-splitter-gutter-bg-dragging` | a2 | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/splitter/index.css:97` |
| `--ds-splitter-gutter-bg-hover` | a2 | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/splitter/index.css:87` |
| `--ds-splitter-gutter-focus-ring-offset` | a | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/splitter/index.css:143` |
| `--ds-splitter-gutter-grip-color` | a2 | yes-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/splitter/index.css:109` |
| `--ds-splitter-gutter-grip-color-locked` | a2 | yes-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/splitter/index.css:136` |
| `--ds-splitter-gutter-grip-length` | a | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/splitter/index.css:113` |
| `--ds-splitter-gutter-grip-thickness` | a2 | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/splitter/index.css:112` |
| `--ds-splitter-gutter-reach` | a2 | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/splitter/index.css:156` |
| `--ds-splitter-gutter-size` | a | yes-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/splitter/index.css:72` |
| `--ds-splitter-gutter-transition-duration` | a2 | yes-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/splitter/index.css:68` |
| `--ds-splitter-gutter-transition-timing` | a2 | yes-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/splitter/index.css:69` |
| `--ds-splitter-panel-grow` | a2 | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/splitter/index.css:45` |
| `--ds-stack-divider-gutter` | a2 | yes-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/stack/index.css:44` |
| `--ds-stack-divider-ink` | a2 | yes-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/stack/index.css:166` |
| `--ds-stack-divider-inset` | a | no-producer | presentation | `src/foundation/tokens/css/presentation/components/skin/layout-primitives/index.css:123` |
| `--ds-stack-divider-opacity` | a | no-literal-derived | presentation | `src/foundation/tokens/css/presentation/components/skin/layout-primitives/index.css:269` |
| `--ds-stack-divider-size` | a | no-literal-derived | presentation | `src/foundation/tokens/css/presentation/components/skin/layout-primitives/index.css:254` |
| `--ds-stack-divider-thickness` | a2 | yes-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/stack/index.css:161` |
| `--ds-stack-divider-veil` | a2 | yes-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/stack/index.css:167` |
| `--ds-stack-gap` | a | no-literal-derived | modern+presentation | `src/foundation/tokens/css/presentation/components/skin/layout-primitives/index.css:232` |
| `--ds-stack-gap-2xl` | a2 | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/stack/index.css:128` |
| `--ds-stack-gap-3xl` | a2 | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/stack/index.css:132` |
| `--ds-stack-gap-4xl` | a2 | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/stack/index.css:136` |
| `--ds-stack-gap-lg` | a2 | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/stack/index.css:120` |
| `--ds-stack-gap-md` | a2 | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/stack/index.css:116` |
| `--ds-stack-gap-none` | a2 | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/stack/index.css:104` |
| `--ds-stack-gap-sm` | a2 | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/stack/index.css:112` |
| `--ds-stack-gap-xl` | a2 | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/stack/index.css:124` |
| `--ds-stack-gap-xs` | a2 | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/stack/index.css:108` |
| `--ds-stack-reflow-transition` | a2 | yes-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/stack/index.css:174` |
| `--ds-statistic-affix-bg` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/statistic/index.css:219` |
| `--ds-statistic-affix-height` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/statistic/index.css:211` |
| `--ds-statistic-affix-letter-spacing` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/statistic/index.css:228` |
| `--ds-statistic-affix-padding-x` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/statistic/index.css:212` |
| `--ds-statistic-affix-radius` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/statistic/index.css:218` |
| `--ds-statistic-countdown-letter-spacing` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/statistic/index.css:233` |
| `--ds-statistic-prefix-color` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/statistic/index.css:191` |
| `--ds-statistic-suffix-color` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/statistic/index.css:195` |
| `--ds-statistic-title-letter-spacing` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/statistic/index.css:75` |
| `--ds-statistic-title-transform` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/statistic/index.css:76` |
| `--ds-statistic-value-letter-spacing` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/statistic/index.css:141` |
| `--ds-stats-grid-icon-size` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/stats-grid/index.css:118` |
| `--ds-stats-grid-skeleton-wave-gradient` | a | yes-declared | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/stats-grid/index.css:139` |
| `--ds-stats-header-card-min-height` | a | no-producer | presentation | `src/foundation/tokens/css/presentation/components/skin/stats-header/index.css:242` |
| `--ds-stats-header-card-padding` | a | no-producer | presentation | `src/foundation/tokens/css/presentation/components/skin/stats-header/index.css:243` |
| `--ds-stats-header-card-padding-compact` | a | no-producer | presentation | `src/foundation/tokens/css/presentation/components/skin/stats-header/index.css:277` |
| `--ds-stats-header-columns` | a | no-producer | presentation | `src/foundation/tokens/css/presentation/components/skin/stats-header/index.css:63` |
| `--ds-stats-header-ping-duration` | a | no-producer | presentation | `src/foundation/tokens/css/presentation/components/skin/stats-header/index.css:194` |
| `--ds-stats-header-value-font-size` | a | no-literal-declared | presentation | `src/foundation/tokens/css/presentation/components/skin/stats-header/index.css:130` |
| `--ds-stats-header-value-font-weight` | a | no-producer | presentation | `src/foundation/tokens/css/presentation/components/skin/stats-header/index.css:131` |
| `--ds-step-wizard-action-dock-reserved-space` | a | no-producer | modern+rustic | `src/foundation/tokens/css/runtime/engines/modern/skin/step-wizard/index.css:56` |
| `--ds-step-wizard-content-min-height` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/step-wizard/index.css:121` |
| `--ds-step-wizard-error-gap` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/step-wizard/index.css:143` |
| `--ds-step-wizard-progress-height` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/step-wizard/index.css:95` |
| `--ds-step-wizard-rail-offset` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/step-wizard/index.css:102` |
| `--ds-step-wizard-skeleton-content-height` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/step-wizard/index.css:86` |
| `--ds-step-wizard-skeleton-duration` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/step-wizard/index.css:77` |
| `--ds-step-wizard-skeleton-progress-height` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/step-wizard/index.css:80` |
| `--ds-step-wizard-touch-target-min` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/step-wizard/index.css:217` |
| `--ds-step-wizard-vertical-rail-width` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/step-wizard/index.css:106` |
| `--ds-stepper-circles-ring` | a2 | yes-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/stepper/index.css:155` |
| `--ds-stepper-connector-block-gap` | a2 | yes-derived | presentation | `src/foundation/tokens/css/presentation/components/skin/stepper-compounds/index.css:241` |
| `--ds-stepper-connector-clearance` | a2 | yes-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/stepper/index.css:354` |
| `--ds-stepper-connector-inset` | a2 | yes-derived | presentation | `src/foundation/tokens/css/presentation/components/skin/stepper-compounds/index.css:159` |
| `--ds-stepper-connector-min-length` | a2 | yes-derived | presentation | `src/foundation/tokens/css/presentation/components/skin/stepper-compounds/index.css:230` |
| `--ds-stepper-description-font-size-lg` | a2 | yes-derived | modern+presentation | `src/foundation/tokens/css/presentation/components/skin/stepper-compounds/index.css:215` |
| `--ds-stepper-description-font-size-md` | a2 | yes-derived | modern+presentation | `src/foundation/tokens/css/presentation/components/skin/stepper-compounds/index.css:210` |
| `--ds-stepper-description-font-size-sm` | a | yes-derived | modern+presentation | `src/foundation/tokens/css/presentation/components/skin/stepper-compounds/index.css:205` |
| `--ds-stepper-description-line-height` | a2 | yes-derived | modern+presentation | `src/foundation/tokens/css/presentation/components/skin/stepper-compounds/index.css:188` |
| `--ds-stepper-dot-size` | a2 | yes-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/stepper/index.css:160` |
| `--ds-stepper-hover-lift` | a2 | yes-derived | modern+presentation | `src/foundation/tokens/css/presentation/components/skin/stepper-compounds/index.css:51` |
| `--ds-stepper-hover-shadow` | a2 | yes-derived | modern+presentation | `src/foundation/tokens/css/presentation/components/skin/stepper-compounds/index.css:50` |
| `--ds-stepper-item-bg-error` | a2 | yes-derived | modern+presentation | `src/foundation/tokens/css/presentation/components/skin/stepper-compounds/index.css:108` |
| `--ds-stepper-item-bg-finish` | a2 | yes-derived | modern+presentation | `src/foundation/tokens/css/presentation/components/skin/stepper-compounds/index.css:95` |
| `--ds-stepper-item-border-error` | a2 | yes-derived | modern+presentation | `src/foundation/tokens/css/presentation/components/skin/stepper-compounds/index.css:107` |
| `--ds-stepper-item-border-finish` | a2 | yes-derived | modern+presentation | `src/foundation/tokens/css/presentation/components/skin/stepper-compounds/index.css:94` |
| `--ds-stepper-item-font-size-lg` | a2 | yes-derived | modern+presentation | `src/foundation/tokens/css/presentation/components/skin/stepper-compounds/index.css:140` |
| `--ds-stepper-item-font-size-md` | a2 | yes-derived | modern+presentation | `src/foundation/tokens/css/presentation/components/skin/stepper-compounds/index.css:133` |
| `--ds-stepper-item-font-size-sm` | a2 | yes-derived | modern+presentation | `src/foundation/tokens/css/presentation/components/skin/stepper-compounds/index.css:126` |
| `--ds-stepper-item-gap` | a | yes-derived | presentation | `src/foundation/tokens/css/presentation/components/skin/stepper-compounds/index.css:16` |
| `--ds-stepper-item-size-lg` | a | yes-derived | modern+presentation | `src/foundation/tokens/css/presentation/components/skin/stepper-compounds/index.css:137` |
| `--ds-stepper-item-size-md` | a | yes-derived | modern+presentation | `src/foundation/tokens/css/presentation/components/skin/stepper-compounds/index.css:130` |
| `--ds-stepper-item-size-sm` | a | yes-derived | modern+presentation | `src/foundation/tokens/css/presentation/components/skin/stepper-compounds/index.css:123` |
| `--ds-stepper-label-font-size-lg` | a2 | yes-derived | modern+presentation | `src/foundation/tokens/css/presentation/components/skin/stepper-compounds/index.css:200` |
| `--ds-stepper-label-font-size-md` | a2 | yes-derived | modern+presentation | `src/foundation/tokens/css/presentation/components/skin/stepper-compounds/index.css:196` |
| `--ds-stepper-label-font-size-sm` | a2 | yes-derived | modern+presentation | `src/foundation/tokens/css/presentation/components/skin/stepper-compounds/index.css:192` |
| `--ds-stepper-label-line-height` | a2 | yes-derived | modern+presentation | `src/foundation/tokens/css/presentation/components/skin/stepper-compounds/index.css:162` |
| `--ds-stepper-motion-duration` | a2 | yes-derived | modern+presentation | `src/foundation/tokens/css/presentation/components/skin/stepper-compounds/index.css:164` |
| `--ds-stepper-motion-easing` | a2 | yes-derived | modern+presentation | `src/foundation/tokens/css/presentation/components/skin/stepper-compounds/index.css:164` |
| `--ds-stepper-numeric` | a | no-literal-derived | modern+presentation | `src/foundation/tokens/css/presentation/components/skin/stepper-compounds/index.css:84` |
| `--ds-stepper-panel-motion-duration` | a2 | yes-derived | presentation | `src/foundation/tokens/css/presentation/components/skin/stepper-compounds/index.css:260` |
| `--ds-stepper-panel-motion-easing` | a2 | yes-derived | presentation | `src/foundation/tokens/css/presentation/components/skin/stepper-compounds/index.css:260` |
| `--ds-stepper-panel-slide-distance` | a2 | yes-derived | presentation | `src/foundation/tokens/css/presentation/components/skin/stepper-compounds/index.css:279` |
| `--ds-stepper-pressed-transform` | a2 | yes-derived | modern+presentation | `src/foundation/tokens/css/presentation/components/skin/stepper-compounds/index.css:57` |
| `--ds-stepper-process-ring` | a2 | yes-derived | modern+presentation | `src/foundation/tokens/css/presentation/components/skin/stepper-compounds/index.css:103` |
| `--ds-stepper-text-gap` | a | yes-derived | modern+presentation | `src/foundation/tokens/css/presentation/components/skin/stepper-compounds/index.css:148` |
| `--ds-stepper-text-margin-block-start` | a | yes-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/stepper/index.css:211` |
| `--ds-stepper-vertical-gap` | a | yes-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/stepper/index.css:339` |
| `--ds-stepper-vertical-item-gap` | a | yes-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/stepper/index.css:341` |
| `--ds-surface-bg` | a | yes-declared | presentation | `src/foundation/tokens/css/presentation/components/skin/ascii-diagram/index.css:79` |
| `--ds-surface-fg` | a | yes-declared | presentation | `src/foundation/tokens/css/presentation/components/skin/ascii-diagram/index.css:18` |
| `--ds-table-bulk-bar-min-height` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/data-table/index.css:936` |
| `--ds-table-cell-ellipsis-max-width` | a2 | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/table/index.css:796` |
| `--ds-table-cell-line-height` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/data-table/index.css:166` |
| `--ds-table-cell-numeric` | a | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/table/index.css:365` |
| `--ds-table-col-min-width` | a2 | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/table/index.css:784` |
| `--ds-table-col-width` | a2 | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/table/index.css:783` |
| `--ds-table-drag-grip-offset` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/data-table/index.css:1554` |
| `--ds-table-editorial-mobile-title-size` | a | no-producer | presentation | `src/foundation/tokens/css/presentation/components/skin/data-table-mobile/index.css:277` |
| `--ds-table-footer-margin-block-start` | a | yes-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/table/index.css:351` |
| `--ds-table-header-block-size` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/data-table/index.css:383` |
| `--ds-table-mobile-actions-padding-block` | a | no-producer | presentation | `src/foundation/tokens/css/presentation/components/skin/data-table-mobile/index.css:337` |
| `--ds-table-mobile-bulk-padding` | a | no-producer | presentation | `src/foundation/tokens/css/presentation/components/skin/data-table-mobile/index.css:349` |
| `--ds-table-mobile-card-hover-lift` | a | no-producer | presentation | `src/foundation/tokens/css/presentation/components/skin/data-table-mobile/index.css:172` |
| `--ds-table-mobile-control-size` | a | no-producer | presentation | `src/foundation/tokens/css/presentation/components/skin/data-table-mobile/index.css:329` |
| `--ds-table-mobile-pagination-padding` | a | no-producer | presentation | `src/foundation/tokens/css/presentation/components/skin/data-table-mobile/index.css:365` |
| `--ds-table-mobile-selected-outline-offset` | a | no-producer | presentation | `src/foundation/tokens/css/presentation/components/skin/data-table-mobile/index.css:166` |
| `--ds-table-mobile-state-min-height` | a | no-producer | presentation | `src/foundation/tokens/css/presentation/components/skin/data-table-mobile/index.css:395` |
| `--ds-table-mobile-state-padding` | a | no-producer | presentation | `src/foundation/tokens/css/presentation/components/skin/data-table-mobile/index.css:396` |
| `--ds-table-mobile-summary-min-height` | a | no-producer | presentation | `src/foundation/tokens/css/presentation/components/skin/data-table-mobile/index.css:308` |
| `--ds-table-mobile-summary-padding-block` | a | no-producer | presentation | `src/foundation/tokens/css/presentation/components/skin/data-table-mobile/index.css:309` |
| `--ds-table-mobile-summary-padding-inline` | a | no-producer | presentation | `src/foundation/tokens/css/presentation/components/skin/data-table-mobile/index.css:310` |
| `--ds-table-open-cell-padding-block` | a | no-producer | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/data-table/index.css:225` |
| `--ds-table-pagination-font-size` | a | yes-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/table/index.css:616` |
| `--ds-table-pagination-margin-block-start` | a | yes-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/table/index.css:608` |
| `--ds-table-pagination-min-height` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/data-table/index.css:850` |
| `--ds-table-pagination-numeric` | a | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/table/index.css:358` |
| `--ds-table-resize-bar-height-active` | a | no-producer | presentation | `src/foundation/tokens/css/presentation/components/skin/data-table-interactions/index.css:18` |
| `--ds-table-resize-bar-width-active` | a | no-producer | presentation | `src/foundation/tokens/css/presentation/components/skin/data-table-interactions/index.css:17` |
| `--ds-table-row-transition` | a | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/data-table/index.css:670` |
| `--ds-table-ruled-mobile-shadow` | a | no-producer | presentation | `src/foundation/tokens/css/presentation/components/skin/data-table-mobile/index.css:257` |
| `--ds-table-scroll-x` | a2 | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/table/index.css:773` |
| `--ds-table-scroll-y` | a2 | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/table/index.css:805` |
| `--ds-table-selection-control-coarse-size` | a | yes-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/table/index.css:669` |
| `--ds-table-sheen` | a | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/data-table/index.css:974` |
| `--ds-table-sticky-top` | a2 | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/table/index.css:788` |
| `--ds-table-title-margin-block-end` | a | yes-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/table/index.css:64` |
| `--ds-table-virtual-spacer` | a2 | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/table/index.css:801` |
| `--ds-tabs-active-color` | a | no-producer | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/tabs/index.css:53` |
| `--ds-tabs-active-highlight` | a2 | yes-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/tabs/index.css:212` |
| `--ds-tabs-active-highlight-opacity` | a | yes-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/tabs/index.css:221` |
| `--ds-tabs-active-reveal-duration` | a2 | yes-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/tabs/index.css:223` |
| `--ds-tabs-active-transform` | a | yes-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/detail-panel/index.css:349` |
| `--ds-tabs-badge-bg` | a2 | yes-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/tabs/index.css:391` |
| `--ds-tabs-badge-bg-active` | a | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/tabs/index.css:407` |
| `--ds-tabs-badge-border` | a | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/tabs/index.css:389` |
| `--ds-tabs-badge-border-active` | a | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/tabs/index.css:406` |
| `--ds-tabs-badge-color-active` | a | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/tabs/index.css:408` |
| `--ds-tabs-badge-height` | a | yes-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/tabs/index.css:384` |
| `--ds-tabs-badge-keyline` | a2 | yes-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/tabs/index.css:397` |
| `--ds-tabs-badge-min-width` | a | yes-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/tabs/index.css:383` |
| `--ds-tabs-badge-padding` | a | yes-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/tabs/index.css:388` |
| `--ds-tabs-disabled-bg` | a | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/tabs/index.css:311` |
| `--ds-tabs-disabled-opacity` | a | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/tabs/index.css:313` |
| `--ds-tabs-icon-bg` | a2 | yes-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/tabs/index.css:260` |
| `--ds-tabs-icon-bg-active` | a2 | yes-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/tabs/index.css:271` |
| `--ds-tabs-icon-color` | a | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/tabs/index.css:261` |
| `--ds-tabs-icon-padding` | a | yes-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/tabs/index.css:258` |
| `--ds-tabs-icon-shadow` | a2 | yes-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/tabs/index.css:262` |
| `--ds-tabs-icon-shadow-active` | a2 | yes-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/tabs/index.css:272` |
| `--ds-tabs-icon-transform-active` | a | yes-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/tabs/index.css:270` |
| `--ds-tabs-indicator-offset` | a2 | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/tabs/index.css:420` |
| `--ds-tabs-indicator-radius` | a | yes-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/tabs/index.css:423` |
| `--ds-tabs-indicator-scale` | a2 | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/tabs/index.css:420` |
| `--ds-tabs-indicator-shadow` | a | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/tabs/index.css:424` |
| `--ds-tabs-item-gap` | a | yes-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/detail-panel/index.css:324` |
| `--ds-tabs-item-lift` | a2 | yes-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/tabs/index.css:287` |
| `--ds-tabs-item-max-width` | a | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/tabs/index.css:177` |
| `--ds-tabs-lg-font-size` | a2 | yes-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/tabs/index.css:40` |
| `--ds-tabs-lg-height` | a | yes-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/tabs/index.css:38` |
| `--ds-tabs-lg-icon-size` | a | yes-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/tabs/index.css:41` |
| `--ds-tabs-lg-padding` | a2 | yes-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/tabs/index.css:39` |
| `--ds-tabs-line-active-bg` | a2 | yes-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/tabs/index.css:345` |
| `--ds-tabs-line-hover-bg` | a2 | yes-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/tabs/index.css:291` |
| `--ds-tabs-list-blur` | a | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/tabs/index.css:167` |
| `--ds-tabs-list-highlight` | a2 | yes-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/tabs/index.css:150` |
| `--ds-tabs-list-max-width` | a | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/tabs/index.css:57` |
| `--ds-tabs-list-padding` | a | yes-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/detail-panel/index.css:523` |
| `--ds-tabs-list-shadow` | a2 | yes-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/tabs/index.css:138` |
| `--ds-tabs-list-texture` | a2 | yes-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/tabs/index.css:148` |
| `--ds-tabs-list-texture-opacity` | a | yes-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/tabs/index.css:153` |
| `--ds-tabs-list-texture-size` | a | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/tabs/index.css:149` |
| `--ds-tabs-list-width` | a | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/tabs/index.css:56` |
| `--ds-tabs-loading-color` | a | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/tabs/index.css:333` |
| `--ds-tabs-loading-track` | a | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/tabs/index.css:332` |
| `--ds-tabs-mobile-gap` | a | yes-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/tabs/index.css:578` |
| `--ds-tabs-mobile-item-max-width` | a | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/tabs/index.css:582` |
| `--ds-tabs-mobile-padding` | a2 | yes-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/tabs/index.css:577` |
| `--ds-tabs-motion-duration` | a2 | yes-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/tabs/index.css:199` |
| `--ds-tabs-motion-easing` | a2 | yes-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/tabs/index.css:199` |
| `--ds-tabs-overflow-control-size` | a | yes-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/tabs/index.css:442` |
| `--ds-tabs-overflow-fade-color` | a2 | yes-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/tabs/index.css:103` |
| `--ds-tabs-overflow-fade-width` | a | yes-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/tabs/index.css:94` |
| `--ds-tabs-panel-gap` | a2 | yes-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/tabs/index.css:497` |
| `--ds-tabs-panel-highlight` | a2 | yes-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/tabs/index.css:512` |
| `--ds-tabs-panel-motion-distance` | a | yes-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/tabs/index.css:552` |
| `--ds-tabs-panel-padding` | a2 | yes-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/tabs/index.css:490` |
| `--ds-tabs-panel-texture` | a2 | yes-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/tabs/index.css:511` |
| `--ds-tabs-pills-list-bg` | a2 | yes-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/tabs/index.css:166` |
| `--ds-tabs-pressed-transform` | a | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/tabs/index.css:374` |
| `--ds-tabs-radius` | a | no-producer | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/tabs/index.css:48` |
| `--ds-tabs-segmented-list-bg` | a2 | yes-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/tabs/index.css:161` |
| `--ds-tabs-sm-font-size` | a2 | yes-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/tabs/index.css:33` |
| `--ds-tabs-sm-height` | a | yes-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/tabs/index.css:31` |
| `--ds-tabs-sm-icon-size` | a | yes-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/tabs/index.css:34` |
| `--ds-tabs-sm-padding` | a2 | yes-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/tabs/index.css:32` |
| `--ds-tabs-underline-list-bg` | a2 | yes-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/tabs/index.css:130` |
| `--ds-tabs-underline-list-shadow` | a2 | yes-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/tabs/index.css:131` |
| `--ds-tabs-underline-list-width` | a | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/tabs/index.css:127` |
| `--ds-tag-border` | a | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/tag/index.css:159` |
| `--ds-tag-close-focus-ring` | a | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/tag/index.css:329` |
| `--ds-tag-close-gap` | a | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/tag/index.css:260` |
| `--ds-tag-close-radius` | a | yes-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/tag/index.css:263` |
| `--ds-tag-close-size` | a | yes-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/tag/index.css:253` |
| `--ds-tag-close-touch-size` | a | yes-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/tag/index.css:348` |
| `--ds-tag-compact-font-weight` | a | yes-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/tag/index.css:66` |
| `--ds-tag-default-border` | a | no-literal-declared | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/tag/index.css:108` |
| `--ds-tag-default-color` | a | no-literal-declared | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/tag/index.css:62` |
| `--ds-tag-error-border` | a | no-literal-declared | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/tag/index.css:128` |
| `--ds-tag-error-color` | a | no-literal-declared | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/tag/index.css:77` |
| `--ds-tag-font-weight` | a | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/tag/index.css:53` |
| `--ds-tag-icon-gap` | a | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/tag/index.css:52` |
| `--ds-tag-icon-radius` | a | yes-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/tag/index.css:233` |
| `--ds-tag-icon-size` | a | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/tag/index.css:230` |
| `--ds-tag-input-placeholder-opacity` | a | yes-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/tag-input/index.css:98` |
| `--ds-tag-lg-font-size` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/tag/index.css:91` |
| `--ds-tag-lg-height` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/tag/index.css:88` |
| `--ds-tag-lg-padding-inline` | a | yes-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/tag/index.css:90` |
| `--ds-tag-line-height` | a | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/tag/index.css:56` |
| `--ds-tag-max-inline-size` | a | yes-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/tag/index.css:50` |
| `--ds-tag-md-padding-inline` | a | yes-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/tag/index.css:84` |
| `--ds-tag-press-transform` | a | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/tag/index.css:324` |
| `--ds-tag-primary-border` | a | no-literal-declared | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/tag/index.css:112` |
| `--ds-tag-primary-color` | a | no-literal-declared | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/tag/index.css:65` |
| `--ds-tag-radius-full` | a | yes-declared | modern+rustic | `src/foundation/tokens/css/runtime/engines/modern/skin/tag/index.css:114` |
| `--ds-tag-radius-none` | a | yes-declared | modern+rustic | `src/foundation/tokens/css/runtime/engines/modern/skin/tag/index.css:102` |
| `--ds-tag-radius-sm` | a | no-literal-declared | modern+rustic | `src/foundation/tokens/css/runtime/engines/modern/skin/tag/index.css:105` |
| `--ds-tag-secondary-border` | a | no-literal-declared | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/tag/index.css:116` |
| `--ds-tag-secondary-color` | a | no-literal-declared | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/tag/index.css:68` |
| `--ds-tag-shadow` | a | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/tag/index.css:165` |
| `--ds-tag-sm-font-size` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/tag/index.css:79` |
| `--ds-tag-sm-height` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/tag/index.css:76` |
| `--ds-tag-sm-padding-inline` | a | yes-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/tag/index.css:78` |
| `--ds-tag-success-border` | a | no-literal-declared | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/tag/index.css:120` |
| `--ds-tag-success-color` | a | no-literal-declared | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/tag/index.css:71` |
| `--ds-tag-touch-target` | a | yes-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/tag/index.css:338` |
| `--ds-tag-warning-border` | a | no-literal-declared | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/tag/index.css:124` |
| `--ds-tag-warning-color` | a | no-literal-declared | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/tag/index.css:74` |
| `--ds-tag-xl-font-size` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/tag/index.css:97` |
| `--ds-tag-xl-height` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/tag/index.css:94` |
| `--ds-tag-xl-padding-inline` | a | yes-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/tag/index.css:96` |
| `--ds-tag-xs-font-size` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/tag/index.css:73` |
| `--ds-tag-xs-height` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/tag/index.css:70` |
| `--ds-tag-xs-padding-inline` | a | yes-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/tag/index.css:72` |
| `--ds-tenant-preview-input-max-width` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/tenant-preview/index.css:156` |
| `--ds-text-transform-uppercase` | a | no-literal-declared | presentation | `src/foundation/tokens/css/presentation/components/skin/auth-surface/index.css:95` |
| `--ds-textarea-max-height` | a | no-literal-declared | presentation | `src/foundation/tokens/css/presentation/components/skin/input-compounds/index.css:224` |
| `--ds-textarea-min-height` | a | no-literal-declared | presentation | `src/foundation/tokens/css/presentation/components/skin/input-compounds/index.css:223` |
| `--ds-textarea-resize` | a | no-literal-declared | modern+presentation | `src/foundation/tokens/css/presentation/components/skin/input-compounds/index.css:226` |
| `--ds-texture-backdrop-ink` | a | yes-declared | presentation | `src/foundation/tokens/css/presentation/components/skin/terminal-block/index.css:32` |
| `--ds-texture-backdrop-opacity` | a | no-literal-declared | presentation | `src/foundation/tokens/css/presentation/components/skin/terminal-block/index.css:29` |
| `--ds-texture-backdrop-paper` | a | yes-declared | presentation | `src/foundation/tokens/css/presentation/components/skin/texture-backdrop/index.css:35` |
| `--ds-time-picker-column-height` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/time-picker/index.css:217` |
| `--ds-time-picker-label-transform` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/time-picker/index.css:248` |
| `--ds-timeline-badge-font-size` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/pattern-timeline/index.css:354` |
| `--ds-timeline-badge-padding-inline` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/pattern-timeline/index.css:352` |
| `--ds-timeline-content-font-size` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/timeline/index.css:64` |
| `--ds-timeline-content-line-height` | a | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/timeline/index.css:65` |
| `--ds-timeline-custom-dot-size` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/timeline/index.css:170` |
| `--ds-timeline-date-heading-letter-spacing` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/pattern-timeline/index.css:273` |
| `--ds-timeline-dot-border-width` | a | yes-declared | modern+rustic | `src/foundation/tokens/css/runtime/engines/modern/skin/timeline/index.css:217` |
| `--ds-timeline-dot-size` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/timeline/index.css:213` |
| `--ds-timeline-empty-padding-block` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/pattern-timeline/index.css:280` |
| `--ds-timeline-label-font-variant-numeric` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/timeline/index.css:197` |
| `--ds-timeline-label-letter-spacing` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/timeline/index.css:196` |
| `--ds-timeline-line-width` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/pattern-timeline/index.css:90` |
| `--ds-timeline-loading-padding-block` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/pattern-timeline/index.css:294` |
| `--ds-timeline-marker-size` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/pattern-timeline/index.css:192` |
| `--ds-timeline-pending-animation` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/timeline/index.css:283` |
| `--ds-timeline-pending-color` | a | no-producer | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/timeline/index.css:64` |
| `--ds-timeline-timestamp-letter-spacing` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/pattern-timeline/index.css:232` |
| `--ds-timepicker-bg` | a | no-literal-declared | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/time-picker/index.css:44` |
| `--ds-timepicker-bg-disabled` | a | yes-declared | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/time-picker/index.css:50` |
| `--ds-timepicker-border` | a | no-literal-declared | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/time-picker/index.css:59` |
| `--ds-timepicker-border-focus` | a | no-literal-declared | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/time-picker/index.css:63` |
| `--ds-timepicker-clear-color` | a | no-literal-declared | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/time-picker/index.css:83` |
| `--ds-timepicker-color` | a | no-literal-declared | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/time-picker/index.css:45` |
| `--ds-timepicker-error-border` | a | no-literal-declared | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/time-picker/index.css:67` |
| `--ds-timepicker-icon-color` | a | no-literal-declared | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/time-picker/index.css:77` |
| `--ds-timepicker-radius` | a | yes-declared | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/time-picker/index.css:42` |
| `--ds-timepicker-separator-color` | a | no-literal-declared | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/time-picker/index.css:87` |
| `--ds-timepicker-shadow-focus` | a | no-literal-declared | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/time-picker/index.css:54` |
| `--ds-timepicker-warning-border` | a | no-literal-declared | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/time-picker/index.css:71` |
| `--ds-toast-action-radius` | a | no-producer | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/toast/index.css:149` |
| `--ds-toast-elevation` | a | no-producer | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/toast/index.css:33` |
| `--ds-toast-radius` | a | no-producer | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/toast/index.css:32` |
| `--ds-toast-stack-transform` | a | no-producer | presentation | `src/foundation/tokens/css/presentation/components/skin/toast-compounds/index.css:41` |
| `--ds-toast-tone-icon` | a | yes-declared | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/toast/index.css:140` |
| `--ds-toast-transform` | a | no-producer | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/toast/index.css:34` |
| `--ds-toggle-disabled-cursor` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/toggle/index.css:72` |
| `--ds-toggle-disabled-opacity` | a | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/toggle/index.css:171` |
| `--ds-toggle-dot-border-radius` | a | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/toggle/index.css:192` |
| `--ds-toggle-error-color` | a | no-literal-declared | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/toggle/index.css:35` |
| `--ds-toggle-focus-ring-offset` | a | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/toggle/index.css:178` |
| `--ds-toggle-focus-ring-width` | a | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/toggle/index.css:177` |
| `--ds-toggle-inner-label-color` | a | no-literal-declared | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/toggle/index.css:54` |
| `--ds-toggle-lg-dot` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/toggle/index.css:108` |
| `--ds-toggle-lg-height` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/toggle/index.css:107` |
| `--ds-toggle-lg-width` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/toggle/index.css:106` |
| `--ds-toggle-md-dot` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/toggle/index.css:103` |
| `--ds-toggle-md-height` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/toggle/index.css:102` |
| `--ds-toggle-md-width` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/toggle/index.css:101` |
| `--ds-toggle-resolved-thumb` | a | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/toggle/index.css:184` |
| `--ds-toggle-resolved-track-h` | a | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/toggle/index.css:118` |
| `--ds-toggle-resolved-track-w` | a | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/toggle/index.css:117` |
| `--ds-toggle-sm-dot` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/toggle/index.css:98` |
| `--ds-toggle-sm-height` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/toggle/index.css:97` |
| `--ds-toggle-sm-width` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/toggle/index.css:96` |
| `--ds-toggle-text-gap` | a | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/toggle/index.css:268` |
| `--ds-toggle-track-fill` | a | no-producer | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/toggle/index.css:29` |
| `--ds-toggle-track-radius` | a | no-literal-declared | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/toggle/index.css:28` |
| `--ds-toggle-xl-dot` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/toggle/index.css:113` |
| `--ds-toggle-xl-height` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/toggle/index.css:112` |
| `--ds-toggle-xl-width` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/toggle/index.css:111` |
| `--ds-toggle-xs-dot` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/toggle/index.css:93` |
| `--ds-toggle-xs-height` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/toggle/index.css:92` |
| `--ds-toggle-xs-width` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/toggle/index.css:91` |
| `--ds-token-inspector-swatch` | a | no-producer | presentation | `src/foundation/tokens/css/presentation/components/skin/token-inspector/index.css:159` |
| `--ds-toolbar-control-pressed-scale` | a | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/list-toolbar/index.css:308` |
| `--ds-toolbar-controls-bg` | a | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/list-toolbar/index.css:805` |
| `--ds-toolbar-controls-blur` | a | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/list-toolbar/index.css:807` |
| `--ds-toolbar-controls-border` | a | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/list-toolbar/index.css:800` |
| `--ds-toolbar-controls-padding` | a | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/list-toolbar/index.css:799` |
| `--ds-toolbar-controls-shadow` | a | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/list-toolbar/index.css:806` |
| `--ds-toolbar-divider-opacity` | a | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/list-toolbar/index.css:337` |
| `--ds-toolbar-entry-animation` | a | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/list-toolbar/index.css:126` |
| `--ds-toolbar-mobile-actions-bg` | a | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/list-toolbar/index.css:1186` |
| `--ds-toolbar-mobile-actions-border` | a | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/list-toolbar/index.css:1181` |
| `--ds-toolbar-mobile-actions-padding` | a | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/list-toolbar/index.css:1180` |
| `--ds-toolbar-mobile-rail-bg` | a | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/list-toolbar/index.css:1212` |
| `--ds-toolbar-mobile-rail-border` | a | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/list-toolbar/index.css:1207` |
| `--ds-toolbar-primary-action-max-width` | a | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/list-toolbar/index.css:816` |
| `--ds-toolbar-saved-views-border` | a | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/list-toolbar/index.css:862` |
| `--ds-toolbar-search-max-width` | a | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/list-toolbar/index.css:767` |
| `--ds-toolbar-search-min-width` | a | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/list-toolbar/index.css:766` |
| `--ds-toolbar-search-wide-max-width` | a | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/list-toolbar/index.css:774` |
| `--ds-toolbar-sheen-animation` | a | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/list-toolbar/index.css:162` |
| `--ds-toolbar-sheen-opacity` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/list-toolbar/index.css:160` |
| `--ds-toolbar-title-icon-size` | a | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/list-toolbar/index.css:715` |
| `--ds-toolbar-title-max-width` | a | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/list-toolbar/index.css:755` |
| `--ds-toolbar-title-section-padding` | a | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/list-toolbar/index.css:706` |
| `--ds-toolbar-touch-target` | a | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/list-toolbar/index.css:1300` |
| `--ds-tooltip-arrow-anchor-offset` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/tooltip/index.css:359` |
| `--ds-tooltip-arrow-edge-offset` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/tooltip/index.css:339` |
| `--ds-tooltip-arrow-safe-min-inline-size` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/tooltip/index.css:298` |
| `--ds-tooltip-bordered-highlight` | a | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/tooltip/index.css:28` |
| `--ds-tooltip-bordered-texture` | a | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/tooltip/index.css:27` |
| `--ds-tooltip-closed-transform` | a | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/tooltip/index.css:199` |
| `--ds-tooltip-highlight-current` | a | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/tooltip/index.css:80` |
| `--ds-tooltip-inverse-border` | a | yes-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/tooltip/index.css:108` |
| `--ds-tooltip-inverse-highlight` | a | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/tooltip/index.css:112` |
| `--ds-tooltip-inverse-texture` | a | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/tooltip/index.css:111` |
| `--ds-tooltip-minimal-border` | a | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/tooltip/index.css:94` |
| `--ds-tooltip-minimal-highlight` | a | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/tooltip/index.css:98` |
| `--ds-tooltip-minimal-texture` | a | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/tooltip/index.css:97` |
| `--ds-tooltip-motion-distance` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/tooltip/index.css:170` |
| `--ds-tooltip-motion-scale` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/tooltip/index.css:170` |
| `--ds-tooltip-padding-block-current` | a | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/tooltip/index.css:41` |
| `--ds-tooltip-padding-inline-current` | a | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/tooltip/index.css:42` |
| `--ds-tooltip-radius-current` | a | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/tooltip/index.css:45` |
| `--ds-tooltip-rich-highlight` | a | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/tooltip/index.css:126` |
| `--ds-tooltip-rich-texture` | a | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/tooltip/index.css:125` |
| `--ds-tooltip-shortcut-chip-gap` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/tooltip/index.css:261` |
| `--ds-tooltip-shortcut-key-background` | a | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/tooltip/index.css:271` |
| `--ds-tooltip-shortcut-key-border` | a | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/tooltip/index.css:269` |
| `--ds-tooltip-shortcut-key-border-width` | a | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/tooltip/index.css:268` |
| `--ds-tooltip-shortcut-key-min-size` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/tooltip/index.css:265` |
| `--ds-tooltip-shortcut-key-padding-block` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/tooltip/index.css:266` |
| `--ds-tooltip-shortcut-key-padding-inline` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/tooltip/index.css:267` |
| `--ds-tooltip-shortcut-key-shadow` | a | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/tooltip/index.css:272` |
| `--ds-tooltip-texture-current` | a | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/tooltip/index.css:286` |
| `--ds-tooltip-texture-opacity` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/tooltip/index.css:81` |
| `--ds-tooltip-tone-border` | a | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/tooltip/index.css:212` |
| `--ds-tooltip-viewport-gap` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/tooltip/index.css:40` |
| `--ds-tour-action-height` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/tour/index.css:158` |
| `--ds-tour-action-lift` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/tour/index.css:194` |
| `--ds-tour-action-padding-inline` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/tour/index.css:160` |
| `--ds-tour-action-prev-bg-hover` | a | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/tour/index.css:190` |
| `--ds-tour-bg` | a | no-producer | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/tour/index.css:46` |
| `--ds-tour-close-bg-hover` | a | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/tour/index.css:200` |
| `--ds-tour-close-size` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/tour/index.css:91` |
| `--ds-tour-indicator-current-size` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/tour/index.css:148` |
| `--ds-tour-indicator-size` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/tour/index.css:138` |
| `--ds-tour-layer` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/tour/index.css:20` |
| `--ds-tour-mask-color` | a | yes-declared | modern+rustic | `src/foundation/tokens/css/runtime/engines/modern/skin/tour/index.css:21` |
| `--ds-tour-shadow` | a | no-producer | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/tour/index.css:48` |
| `--ds-tour-spotlight-height` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/tour/index.css:31` |
| `--ds-tour-spotlight-left` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/tour/index.css:29` |
| `--ds-tour-spotlight-spread` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/tour/index.css:34` |
| `--ds-tour-spotlight-top` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/tour/index.css:28` |
| `--ds-tour-spotlight-width` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/tour/index.css:30` |
| `--ds-tour-surface-max-width` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/tour/index.css:42` |
| `--ds-transfer-bg` | a | no-literal-derived | modern+rustic | `src/foundation/tokens/css/runtime/engines/modern/skin/transfer/index.css:28` |
| `--ds-transfer-button-bg` | a | no-producer | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/transfer/index.css:107` |
| `--ds-transfer-button-color` | a | no-producer | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/transfer/index.css:108` |
| `--ds-transfer-button-radius` | a | no-producer | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/transfer/index.css:109` |
| `--ds-transfer-count-color` | a | no-producer | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/transfer/index.css:57` |
| `--ds-transfer-empty-color` | a | no-producer | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/transfer/index.css:87` |
| `--ds-transfer-gap` | a | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/transfer/index.css:16` |
| `--ds-transfer-list-max-height` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/transfer/index.css:121` |
| `--ds-transfer-list-width` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/transfer/index.css:24` |
| `--ds-transfer-search-input-border` | a | no-producer | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/transfer/index.css:69` |
| `--ds-transfer-search-input-radius` | a | no-producer | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/transfer/index.css:65` |
| `--ds-transition-fade` | a | yes-declared | presentation | `src/foundation/tokens/css/presentation/components/skin/card-compounds/index.css:311` |
| `--ds-tree-bg` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/tree/index.css:75` |
| `--ds-tree-checkbox-margin` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/tree/index.css:295` |
| `--ds-tree-checkbox-size` | a | yes-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/tree/index.css:293` |
| `--ds-tree-connector-inset` | a2 | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/tree/index.css:406` |
| `--ds-tree-disabled-opacity` | a | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/tree/index.css:155` |
| `--ds-tree-drop-bg` | a | no-producer | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/tree/index.css:66` |
| `--ds-tree-filtered-out-opacity` | a | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/tree/index.css:326` |
| `--ds-tree-highlight-bg` | a | no-producer | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/tree/index.css:93` |
| `--ds-tree-highlight-color` | a | no-producer | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/tree/index.css:94` |
| `--ds-tree-icon-size` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/tree/index.css:301` |
| `--ds-tree-line-width` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/tree/index.css:84` |
| `--ds-tree-loading-size` | a | yes-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/tree/index.css:273` |
| `--ds-tree-node-bg` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/tree/index.css:137` |
| `--ds-tree-node-color` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/tree/index.css:138` |
| `--ds-tree-node-hover-bg` | a | no-producer | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/tree/index.css:75` |
| `--ds-tree-node-opacity` | a2 | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/tree/index.css:443` |
| `--ds-tree-row-indent` | a2 | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/tree/index.css:422` |
| `--ds-tree-select-arrow-rotate-open` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/tree-select/index.css:151` |
| `--ds-tree-select-chevron-rotate-open` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/tree-select/index.css:319` |
| `--ds-tree-select-clear-gap` | a | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/tree-select/index.css:132` |
| `--ds-tree-select-clear-inset-inline-end` | a | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/tree-select/index.css:114` |
| `--ds-tree-select-clear-size` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/tree-select/index.css:117` |
| `--ds-tree-select-dropdown-max-height` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/tree-select/index.css:155` |
| `--ds-tree-select-empty-min-height` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/tree-select/index.css:217` |
| `--ds-tree-select-level` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/tree-select/index.css:231` |
| `--ds-tree-switcher-size` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/tree/index.css:224` |
| `--ds-tree-view-skeleton-row-height` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/tree-view/index.css:54` |
| `--ds-treeselect-arrow-color` | a | no-producer | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/tree-select/index.css:130` |
| `--ds-treeselect-bg` | a | no-producer | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/tree-select/index.css:104` |
| `--ds-treeselect-border` | a | no-producer | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/tree-select/index.css:107` |
| `--ds-treeselect-border-error` | a | no-producer | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/tree-select/index.css:113` |
| `--ds-treeselect-border-focus` | a | no-producer | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/tree-select/index.css:110` |
| `--ds-treeselect-border-warning` | a | no-producer | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/tree-select/index.css:116` |
| `--ds-treeselect-clear-color` | a | no-producer | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/tree-select/index.css:126` |
| `--ds-treeselect-dropdown-bg` | a | no-producer | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/tree-select/index.css:142` |
| `--ds-treeselect-dropdown-radius` | a | no-producer | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/tree-select/index.css:143` |
| `--ds-treeselect-empty-color` | a | no-producer | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/tree-select/index.css:171` |
| `--ds-treeselect-expand-color` | a | no-producer | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/tree-select/index.css:201` |
| `--ds-treeselect-node-bg-hover` | a | no-producer | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/tree-select/index.css:180` |
| `--ds-treeselect-node-bg-selected` | a | no-producer | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/tree-select/index.css:183` |
| `--ds-treeselect-node-color-selected` | a | no-producer | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/tree-select/index.css:191` |
| `--ds-treeselect-node-radius` | a | no-producer | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/tree-select/index.css:177` |
| `--ds-treeselect-placeholder-color` | a | no-producer | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/tree-select/index.css:120` |
| `--ds-treeselect-radius` | a | no-producer | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/tree-select/index.css:103` |
| `--ds-type-body` | a | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/typography/index.css:98` |
| `--ds-type-body-font-variant-numeric` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/typography/index.css:101` |
| `--ds-type-body-text-transform` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/typography/index.css:100` |
| `--ds-type-caption-font-variant-numeric` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/page-shell/index.css:545` |
| `--ds-type-caption-text-transform` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/page-shell/index.css:544` |
| `--ds-type-code-font-variant-numeric` | a | no-literal-declared | modern+presentation | `src/foundation/tokens/css/presentation/components/skin/edit-header/index.css:192` |
| `--ds-type-code-inline-padding` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/typography/index.css:273` |
| `--ds-type-code-inline-size` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/typography/index.css:280` |
| `--ds-type-code-letter-spacing` | a | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/typography/index.css:123` |
| `--ds-type-code-text-transform` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/typography/index.css:124` |
| `--ds-type-decoration-thickness` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/typography/index.css:264` |
| `--ds-type-display` | a | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/typography/index.css:80` |
| `--ds-type-display-font-variant-numeric` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/typography/index.css:83` |
| `--ds-type-display-letter-spacing` | a | yes-declared | modern+presentation | `src/foundation/tokens/css/presentation/components/skin/collection-header/index.css:277` |
| `--ds-type-display-line-height` | a | no-literal-declared | presentation | `src/foundation/tokens/css/presentation/components/skin/collection-header/index.css:278` |
| `--ds-type-display-text-transform` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/typography/index.css:82` |
| `--ds-type-font-synthesis` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/typography/index.css:34` |
| `--ds-type-font-variation-settings` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/typography/index.css:35` |
| `--ds-type-label-font-variant-numeric` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/typography/index.css:113` |
| `--ds-type-label-text-transform` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/dropdown/index.css:375` |
| `--ds-type-line-clamp` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/typography/index.css:163` |
| `--ds-type-mark-padding` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/typography/index.css:286` |
| `--ds-type-motion-distance` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/typography/index.css:172` |
| `--ds-type-numeric` | a | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/typography/index.css:128` |
| `--ds-type-numeric-font-family` | a | yes-declared | presentation | `src/foundation/tokens/css/presentation/components/skin/dashboard-header/index.css:376` |
| `--ds-type-numeric-font-size` | a | yes-declared | presentation | `src/foundation/tokens/css/presentation/components/skin/dashboard-header/index.css:377` |
| `--ds-type-numeric-font-variant-numeric` | a | no-literal-declared | modern+presentation | `src/foundation/tokens/css/presentation/components/skin/dashboard-header/index.css:379` |
| `--ds-type-numeric-font-weight` | a | no-literal-declared | presentation | `src/foundation/tokens/css/presentation/components/skin/dashboard-header/index.css:378` |
| `--ds-type-numeric-letter-spacing` | a | yes-declared | modern+presentation | `src/foundation/tokens/css/presentation/components/skin/dashboard-header/index.css:380` |
| `--ds-type-numeric-line-height` | a | yes-declared | presentation | `src/foundation/tokens/css/presentation/components/skin/dashboard-header/index.css:381` |
| `--ds-type-numeric-text-transform` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/typography/index.css:130` |
| `--ds-type-optical-sizing` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/typography/index.css:33` |
| `--ds-type-page-title` | a | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/typography/index.css:86` |
| `--ds-type-page-title-font-variant-numeric` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/page-shell/index.css:502` |
| `--ds-type-page-title-text-transform` | a | no-literal-declared | modern+presentation | `src/foundation/tokens/css/presentation/components/skin/dashboard-header/index.css:202` |
| `--ds-type-paragraph-measure` | a | no-literal-declared | modern+presentation | `src/foundation/tokens/css/presentation/components/skin/section-frame/index.css:38` |
| `--ds-type-scale` | a2 | no-literal-derived | modern+presentation | `src/foundation/tokens/css/presentation/components/skin/collection-header/index.css:286` |
| `--ds-type-section-title` | a | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/typography/index.css:92` |
| `--ds-type-section-title-font-variant-numeric` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/typography/index.css:95` |
| `--ds-type-section-title-text-transform` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/typography/index.css:94` |
| `--ds-type-selection-color` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/typography/index.css:323` |
| `--ds-type-supporting-font-variant-numeric` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/typography/index.css:107` |
| `--ds-type-supporting-text-transform` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/typography/index.css:106` |
| `--ds-type-tier-2xl-letter-spacing` | a2 | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/typography/index.css:436` |
| `--ds-type-tier-2xl-line-height` | a2 | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/typography/index.css:389` |
| `--ds-type-tier-3xl-letter-spacing` | a2 | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/typography/index.css:439` |
| `--ds-type-tier-3xl-line-height` | a2 | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/typography/index.css:393` |
| `--ds-type-tier-lg-letter-spacing` | a2 | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/typography/index.css:430` |
| `--ds-type-tier-lg-line-height` | a2 | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/typography/index.css:381` |
| `--ds-type-tier-md-letter-spacing` | a2 | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/typography/index.css:427` |
| `--ds-type-tier-md-line-height` | a2 | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/typography/index.css:377` |
| `--ds-type-tier-sm-line-height` | a2 | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/typography/index.css:373` |
| `--ds-type-tier-xl-letter-spacing` | a2 | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/typography/index.css:433` |
| `--ds-type-tier-xl-line-height` | a2 | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/typography/index.css:385` |
| `--ds-type-tier-xs-line-height` | a2 | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/typography/index.css:369` |
| `--ds-typography-body-family` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/data-table/index.css:98` |
| `--ds-typography-display-tracking` | a | no-producer | presentation | `src/foundation/tokens/css/presentation/components/skin/data-table-mobile/index.css:278` |
| `--ds-typography-label-size` | a | no-producer | presentation | `src/foundation/tokens/css/presentation/components/skin/data-table-mobile/index.css:292` |
| `--ds-typography-label-tracking` | a | no-producer | modern+presentation | `src/foundation/tokens/css/presentation/components/skin/data-table-mobile/index.css:294` |
| `--ds-typography-label-weight` | a | no-producer | presentation | `src/foundation/tokens/css/presentation/components/skin/data-table-mobile/index.css:293` |
| `--ds-typography-numeric-family` | a | no-producer | presentation | `src/foundation/tokens/css/presentation/components/skin/decision-comparison/index.css:357` |
| `--ds-typography-section-title-family` | a | no-producer | modern+presentation | `src/foundation/tokens/css/presentation/components/skin/data-table-mobile/index.css:285` |
| `--ds-typography-section-title-tracking` | a | no-producer | modern+presentation | `src/foundation/tokens/css/presentation/components/skin/decision-comparison/index.css:194` |
| `--ds-typography-section-title-weight` | a | no-producer | modern+presentation | `src/foundation/tokens/css/presentation/components/skin/data-table-mobile/index.css:286` |
| `--ds-typography-supporting-family` | a | no-producer | modern+presentation | `src/foundation/tokens/css/presentation/components/skin/decision-comparison/index.css:504` |
| `--ds-typography-supporting-size` | a | no-producer | presentation | `src/foundation/tokens/css/presentation/components/skin/data-table-mobile/index.css:343` |
| `--ds-upload-action-font-size` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/upload/index.css:500` |
| `--ds-upload-button-bg` | a | yes-declared | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/upload/index.css:199` |
| `--ds-upload-button-border` | a | yes-declared | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/upload/index.css:197` |
| `--ds-upload-button-color` | a | yes-declared | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/upload/index.css:200` |
| `--ds-upload-button-radius` | a | yes-declared | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/upload/index.css:198` |
| `--ds-upload-card-bg` | a | yes-declared | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/upload/index.css:111` |
| `--ds-upload-card-border` | a | yes-declared | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/upload/index.css:112` |
| `--ds-upload-card-size` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/upload/index.css:333` |
| `--ds-upload-dragger-bg` | a | yes-declared | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/upload/index.css:210` |
| `--ds-upload-dragger-bg-hover` | a | yes-declared | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/upload/index.css:214` |
| `--ds-upload-dragger-border` | a | yes-declared | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/upload/index.css:208` |
| `--ds-upload-dragger-border-active` | a | yes-declared | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/upload/index.css:213` |
| `--ds-upload-dragger-icon-color` | a | yes-declared | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/upload/index.css:178` |
| `--ds-upload-dragger-radius` | a | yes-declared | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/upload/index.css:209` |
| `--ds-upload-dragger-text-color` | a | yes-declared | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/upload/index.css:220` |
| `--ds-upload-dropzone-height` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/upload/index.css:649` |
| `--ds-upload-error-border` | a | yes-declared | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/upload/index.css:118` |
| `--ds-upload-file-bg` | a | yes-declared | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/upload/index.css:133` |
| `--ds-upload-file-color` | a | yes-declared | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/upload/index.css:150` |
| `--ds-upload-file-name-font-size` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/upload/index.css:371` |
| `--ds-upload-file-radius` | a | yes-declared | modern+rustic | `src/foundation/tokens/css/runtime/engines/modern/skin/upload/index.css:234` |
| `--ds-upload-file-remove-color` | a | yes-declared | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/upload/index.css:82` |
| `--ds-upload-overlay-action-color` | a | yes-declared | modern+rustic | `src/foundation/tokens/css/runtime/engines/modern/skin/upload/index.css:473` |
| `--ds-upload-preview-backdrop` | a | yes-declared | modern+rustic | `src/foundation/tokens/css/runtime/engines/modern/skin/upload/index.css:132` |
| `--ds-upload-preview-close-bg` | a | yes-declared | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/upload/index.css:51` |
| `--ds-upload-preview-close-color` | a | yes-declared | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/upload/index.css:52` |
| `--ds-upload-preview-close-font-size` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/upload/index.css:177` |
| `--ds-upload-preview-overlay` | a | yes-declared | modern+rustic | `src/foundation/tokens/css/runtime/engines/modern/skin/upload/index.css:192` |
| `--ds-upload-progress-fill` | a | no-producer | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/upload/index.css:70` |
| `--ds-upload-progress-track` | a | yes-declared | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/upload/index.css:65` |
| `--ds-upload-trigger-font-size` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/upload/index.css:572` |
| `--ds-viewport-block-size` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/alert-dialog/index.css:35` |
| `--ds-viewport-inline-size` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/alert-dialog/index.css:34` |
| `--ds-virtual-keyboard-inset` | a | no-producer | presentation | `src/foundation/tokens/css/presentation/components/skin/action-dock/index.css:186` |
| `--ds-virtual-list-block-size` | b | no-literal-declared | presentation | `src/foundation/tokens/css/presentation/components/skin/virtual-list/index.css:45` |
| `--ds-virtual-list-item-inset-block-start` | b | no-literal-declared | presentation | `src/foundation/tokens/css/presentation/components/skin/virtual-list/index.css:71` |
| `--ds-virtual-list-spacer-block-size` | b | no-literal-declared | presentation | `src/foundation/tokens/css/presentation/components/skin/virtual-list/index.css:64` |
| `--ds-watermark-offset` | a | no-producer | modern+rustic | `src/foundation/tokens/css/runtime/engines/modern/skin/watermark/index.css:72` |
| `--ds-watermark-opacity` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/watermark/index.css:66` |
| `--ds-widget-board-catalog-no-results-min-height` | a | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/widget-board/index.css:35` |
| `--ds-widget-board-catalog-search-max-width` | a | no-literal-derived | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/widget-board/index.css:28` |
| `--ds-widget-board-cell-column` | b | no-literal-declared | presentation | `src/foundation/tokens/css/presentation/components/skin/widget-board/index.css:1554` |
| `--ds-widget-board-cell-height` | b | no-literal-declared | presentation | `src/foundation/tokens/css/presentation/components/skin/widget-board/index.css:1560` |
| `--ds-widget-board-cell-row` | b | no-literal-declared | presentation | `src/foundation/tokens/css/presentation/components/skin/widget-board/index.css:1555` |
| `--ds-widget-board-entry-offset` | a | no-literal-declared | presentation | `src/foundation/tokens/css/presentation/components/skin/widget-board/index.css:427` |
| `--ds-widget-board-entry-scale` | a | no-literal-declared | presentation | `src/foundation/tokens/css/presentation/components/skin/widget-board/index.css:428` |
| `--ds-widget-board-hover-lift` | a | no-literal-declared | presentation | `src/foundation/tokens/css/presentation/components/skin/widget-board/index.css:426` |
| `--ds-widget-board-interaction-scale` | a | no-literal-declared | presentation | `src/foundation/tokens/css/presentation/components/skin/widget-board/index.css:429` |
| `--ds-widget-board-layout-x` | a | no-producer | presentation | `src/foundation/tokens/css/presentation/components/skin/widget-board/index.css:422` |
| `--ds-widget-board-layout-y` | a | no-producer | presentation | `src/foundation/tokens/css/presentation/components/skin/widget-board/index.css:423` |
| `--ds-workbench-header-action-gap` | a | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/workbench-header/index.css:288` |
| `--ds-workbench-header-actions-backdrop` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/workbench-header/index.css:207` |
| `--ds-workbench-header-icon-size` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/workbench-header/index.css:106` |
| `--ds-workbench-header-item-gap` | a | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/workbench-header/index.css:268` |
| `--ds-workbench-header-padding` | a | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/workbench-header/index.css:92` |
| `--ds-workbench-header-section-gap` | a | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/workbench-header/index.css:261` |
| `--ds-workspace-card-grid-line` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/detail-panel/index.css:614` |
| `--ds-workspace-card-hover-transform` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/detail-panel/index.css:638` |
| `--ds-workspace-card-min-height` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/detail-panel/index.css:537` |
| `--ds-workspace-card-overlay` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/detail-panel/index.css:627` |
| `--ds-workspace-card-transition` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/detail-panel/index.css:551` |
| `--ds-workspace-switcher-item-gap` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/workspace-switcher/index.css:315` |
| `--ds-workspace-switcher-list-max-height` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/workspace-switcher/index.css:297` |
| `--ds-workspace-switcher-meta-numeric` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/workspace-switcher/index.css:396` |
| `--ds-workspace-switcher-panel-gap` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/workspace-switcher/index.css:265` |
| `--ds-workspace-switcher-panel-gap-block` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/workspace-switcher/index.css:271` |
| `--ds-workspace-switcher-panel-width` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/workspace-switcher/index.css:256` |
| `--ds-workspace-switcher-trigger-gap` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/workspace-switcher/index.css:156` |
| `--ds-workspace-switcher-trigger-height` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/workspace-switcher/index.css:157` |
| `--ds-workspace-switcher-trigger-name-font-size` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/workspace-switcher/index.css:172` |
| `--ds-workspace-switcher-trigger-padding-inline` | a | no-producer | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/workspace-switcher/index.css:159` |
| `--ds-z-floatbutton` | a | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/float-button/index.css:201` |
| `--ds-z-index-notification` | a | no-literal-declared | presentation | `src/foundation/tokens/css/presentation/components/skin/saved-views-menu/index.css:122` |
| `--ds-z-index-relative-base` | a2 | no-literal-declared | modern+presentation | `src/foundation/tokens/css/presentation/components/skin/card-compounds/index.css:277` |
| `--ds-z-index-relative-top` | a | no-literal-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/float-button/index.css:212` |
| `--ds-z-modal` | a | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/shortcuts-overlay/index.css:35` |
| `--ds-z-overlay` | a | yes-declared | rustic | `src/foundation/tokens/css/runtime/engines/rustic/skin/sheet/index.css:32` |
| `--ds-z-popover` | a | yes-declared | modern | `src/foundation/tokens/css/runtime/engines/modern/skin/color-picker/index.css:116` |
| `--ds-z-sticky` | a | yes-declared | presentation | `src/foundation/tokens/css/presentation/components/skin/chat-surface/index.css:143` |
| `--ds-z-tooltip` | a | yes-declared | presentation | `src/foundation/tokens/css/presentation/components/skin/presence/index.css:177` |

## Appendix B — the audited delta, complete

### B.1 Entries (13)

- `--ds-gallery-view-aspect-ratio`
- `--ds-gallery-view-columns`
- `--ds-kanban-board-column-accent`
- `--ds-kanban-board-column-max-height`
- `--ds-kanban-board-column-min-width`
- `--ds-kanban-board-touch-target`
- `--ds-listing-grid-bottom-bleed`
- `--ds-virtual-list-block-size`
- `--ds-virtual-list-item-inset-block-start`
- `--ds-virtual-list-spacer-block-size`
- `--ds-widget-board-cell-column`
- `--ds-widget-board-cell-height`
- `--ds-widget-board-cell-row`

### B.2 Exits (4) — all four are renames of B.1 entries

- `--ds-kanban-column-accent`
- `--ds-kanban-column-max-height`
- `--ds-kanban-column-min-width`
- `--ds-kanban-touch-target`

### B.3 Denominator entries in the audited delta (20)

- `--ds-calendar-view-entry-accent` — reaches `--ds-color-primary`
- `--ds-collection-card-gap` — reaches `--ds-listing-grid-gap`, `--ds-spacing-4`
- `--ds-column-menu-row-motion-duration` — reaches `--ds-motion-fast`
- `--ds-gallery-view-aspect-ratio` — debt
- `--ds-gallery-view-columns` — debt
- `--ds-gallery-view-gap` — reaches `--ds-spacing-4`
- `--ds-grid-view-columns` — reaches `--ds-listing-grid-min-compact-width`
- `--ds-grid-view-gap` — reaches `--ds-spacing-4`
- `--ds-kanban-board-column-accent` — debt
- `--ds-kanban-board-column-gap` — reaches `--ds-spacing-4`
- `--ds-kanban-board-column-max-height` — debt
- `--ds-kanban-board-column-min-width` — debt
- `--ds-kanban-board-touch-target` — debt
- `--ds-listing-grid-bottom-bleed` — debt
- `--ds-virtual-list-block-size` — debt
- `--ds-virtual-list-item-inset-block-start` — debt
- `--ds-virtual-list-spacer-block-size` — debt
- `--ds-widget-board-cell-column` — debt
- `--ds-widget-board-cell-height` — debt
- `--ds-widget-board-cell-row` — debt

### B.4 Denominator exits in the audited delta (7)

- `--ds-calendar-event-accent`
- `--ds-kanban-column-accent`
- `--ds-kanban-column-gap`
- `--ds-kanban-column-max-height`
- `--ds-kanban-column-min-width`
- `--ds-kanban-touch-target`
- `--ds-listing-grid-gap`

## Appendix C — the 602 debt names with no producer anywhere

Live (modern / presentation), 452 names — repairable under P4:

- `--ds-activity-log-padding`
- `--ds-affix-affixed-backdrop`
- `--ds-affix-affixed-radius`
- `--ds-anchor-focus-ring-offset`
- `--ds-anchor-item-font-size`
- `--ds-anchor-item-font-weight-selected`
- `--ds-anchor-item-line-height`
- `--ds-anchor-list-max-block-size`
- `--ds-approval-action-font-size`
- `--ds-approval-action-height`
- `--ds-approval-action-padding-inline`
- `--ds-approval-actions-gap`
- `--ds-approval-actions-margin-block-start`
- `--ds-approval-approver-font-size`
- `--ds-approval-approver-row-gap`
- `--ds-approval-badge-font-size`
- `--ds-approval-comment-font-size`
- `--ds-approval-comment-margin-block-start`
- `--ds-approval-comment-padding`
- `--ds-approval-connector-min-height`
- `--ds-approval-connector-width`
- `--ds-approval-disabled-opacity`
- `--ds-approval-dot-margin-block-start`
- `--ds-approval-dot-size`
- `--ds-approval-footer-margin-block-start`
- `--ds-approval-footer-padding-block-start`
- `--ds-approval-header-gap`
- `--ds-approval-header-margin-block-end`
- `--ds-approval-metadata-font-size`
- `--ds-approval-metadata-margin-block-start`
- `--ds-approval-skeleton-line-gap`
- `--ds-approval-skeleton-line-height`
- `--ds-approval-skeleton-steps-gap`
- `--ds-approval-skeleton-title-margin-block-end`
- `--ds-approval-skipped-opacity`
- `--ds-approval-step-gap`
- `--ds-approval-step-padding-block-end`
- `--ds-approval-timestamp-font-size`
- `--ds-approval-timestamp-margin-block-start`
- `--ds-approval-timestamp-numeric`
- `--ds-approval-title-font-size`
- `--ds-avatar-badge-dot-size`
- `--ds-backtop-focus-ring-offset`
- `--ds-backtop-hover-transform`
- `--ds-backtop-inset-block-end`
- `--ds-backtop-inset-inline-end`
- `--ds-backtop-pressed-transform`
- `--ds-backtop-size`
- `--ds-bottom-tab-bar-z`
- `--ds-calendar-cell-disabled-opacity`
- `--ds-calendar-compact-width`
- `--ds-calendar-compact-width-coarse`
- `--ds-capability-anatomy-label-tracking`
- `--ds-capability-cell-min-size`
- `--ds-capability-disabled-opacity`
- `--ds-capability-opacity`
- `--ds-carousel-arrow-size`
- `--ds-carousel-arrow-size-coarse`
- `--ds-carousel-controls-z`
- `--ds-carousel-dot-selected-inline-size`
- `--ds-carousel-dot-size`
- `--ds-carousel-dot-touch-size`
- `--ds-carousel-dots-gap`
- `--ds-carousel-item-bg`
- `--ds-carousel-item-bg-image`
- `--ds-carousel-radius`
- `--ds-carousel-slide-transform`
- `--ds-cell-renderers-mono-color`
- `--ds-cell-renderers-score-radius`
- `--ds-chart-tooltip-x`
- `--ds-chart-tooltip-y`
- `--ds-cockpit-header-actions-backdrop`
- `--ds-cockpit-header-icon-size`
- `--ds-cockpit-header-sticky-top`
- `--ds-cockpit-header-sticky-z`
- `--ds-collection-card-depth`
- `--ds-collection-card-glass-bg`
- `--ds-collection-card-hover-transform`
- `--ds-collection-card-min-height`
- `--ds-collection-card-overlay`
- `--ds-collection-card-sheen`
- `--ds-collection-filter-dropdown-width`
- `--ds-collection-header-actions-backdrop`
- `--ds-collection-header-sheen-duration`
- `--ds-collection-header-sheen-opacity`
- `--ds-comment-thread-rail-width`
- `--ds-comment-thread-touch-target-min`
- `--ds-compare-divider-width`
- `--ds-context-menu-divider-margin-block`
- `--ds-context-menu-group-letter-spacing`
- `--ds-context-menu-group-padding`
- `--ds-context-menu-item-padding`
- `--ds-context-menu-max-block-size`
- `--ds-context-menu-touch-target-min`
- `--ds-context-menu-width`
- `--ds-control-height-sm`
- `--ds-control-size-md`
- `--ds-control-size-sm`
- `--ds-dashboard-header-actions-backdrop`
- `--ds-dashboard-header-icon-size`
- `--ds-dashboard-header-sheen-opacity`
- `--ds-dashboard-metric-bg`
- `--ds-dashboard-metric-border`
- `--ds-dashboard-metric-radius`
- `--ds-dashboard-skeleton-line-height`
- `--ds-dashboard-skeleton-stat-height`
- `--ds-dashboard-skeleton-title-height`
- `--ds-dashboard-skeleton-title-width`
- `--ds-decision-comparison-columns`
- `--ds-decision-comparison-subject-index`
- `--ds-density-factor-comfortable`
- `--ds-density-factor-compact`
- `--ds-density-factor-spacious`
- `--ds-detail-header-avatar-initials-size`
- `--ds-detail-header-avatar-size`
- `--ds-detail-header-avatar-size-compact`
- `--ds-detail-header-back-button-padding`
- `--ds-detail-header-context-rail-margin-block-start`
- `--ds-detail-header-eyebrow-tracking`
- `--ds-detail-header-hero-panel-padding-compact`
- `--ds-detail-header-metadata-card-children-margin-block-start`
- `--ds-detail-header-metadata-card-margin-block-start`
- `--ds-detail-header-metadata-card-padding-compact`
- `--ds-detail-header-metadata-chip-label-tracking`
- `--ds-detail-header-root-margin-block-end`
- `--ds-detail-header-subtitle-leading`
- `--ds-detail-header-subtitle-max-inline-size`
- `--ds-detail-header-tab-active-bg`
- `--ds-detail-header-tab-count-padding`
- `--ds-detail-header-tab-padding`
- `--ds-disabled-opacity`
- `--ds-dtc-live`
- `--ds-dtc-radius`
- `--ds-edit-fields-grid-columns`
- `--ds-edit-fields-grid-gap`
- `--ds-edit-header-context-card-filter`
- `--ds-edit-header-status-tone-bd`
- `--ds-edit-header-status-tone-bg`
- `--ds-edit-header-status-tone-fg`
- `--ds-empty-description-width`
- `--ds-empty-state-content-width`
- `--ds-empty-state-lg-min-height`
- `--ds-empty-state-lg-visual-size`
- `--ds-empty-state-loading-height`
- `--ds-empty-state-min-height`
- `--ds-empty-state-sm-min-height`
- `--ds-empty-state-sm-visual-size`
- `--ds-empty-state-visual-size`
- `--ds-environment-toggle-panel-min-width`
- `--ds-envtoggle-accent`
- `--ds-export-button-panel-min-width`
- `--ds-export-button-toast-duration`
- `--ds-feature-workspace-max-width-content`
- `--ds-feature-workspace-max-width-wide`
- `--ds-feature-workspace-navigation-z-index`
- `--ds-feature-workspace-skeleton-card-height`
- `--ds-feature-workspace-skeleton-min-height`
- `--ds-feature-workspace-sticky-offset`
- `--ds-filter-builder-control-min`
- `--ds-filter-builder-dropdown-max-height`
- `--ds-filter-builder-dropdown-min-width`
- `--ds-filter-builder-logic-width`
- `--ds-filter-builder-row-padding-y-compact`
- `--ds-filter-builder-value-min`
- `--ds-floatbutton-badge-font-size`
- `--ds-floatbutton-badge-line-height`
- `--ds-floatbutton-badge-offset-block`
- `--ds-floatbutton-badge-offset-inline`
- `--ds-floatbutton-badge-padding-block`
- `--ds-floatbutton-badge-padding-inline`
- `--ds-floatbutton-dot-offset-block`
- `--ds-floatbutton-dot-offset-inline`
- `--ds-floatbutton-dot-size`
- `--ds-floatbutton-padding-block`
- `--ds-floatbutton-padding-inline`
- `--ds-floatbutton-size`
- `--ds-floatbutton-size-coarse`
- `--ds-font-weight-regular`
- `--ds-form-action-dock-reserved-space`
- `--ds-form-builder-counter-font-size`
- `--ds-form-builder-max-inline-size`
- `--ds-form-builder-section-description-font-size`
- `--ds-form-builder-section-divider-gap`
- `--ds-form-builder-section-header-padding`
- `--ds-form-builder-section-title-font-size`
- `--ds-form-builder-section-title-letter-spacing`
- `--ds-form-builder-title-font-size`
- `--ds-form-builder-title-letter-spacing`
- `--ds-form-builder-title-line-height`
- `--ds-form-builder-wizard-nav-offset`
- `--ds-form-header-context-backdrop`
- `--ds-form-header-root-margin`
- `--ds-header-icon-tone-bd`
- `--ds-header-icon-tone-bg`
- `--ds-header-icon-tone-fg`
- `--ds-image-fallback-icon-size`
- `--ds-image-resolved-radius`
- `--ds-image-zoom-indicator-padding`
- `--ds-input-group-focus-z`
- `--ds-invoice-template-logo-height`
- `--ds-invoice-template-max-width`
- `--ds-invoice-template-totals-width`
- `--ds-kbd-depth-width`
- `--ds-kbd-font-weight`
- `--ds-kbd-lg-font-size`
- `--ds-kbd-lg-min-height`
- `--ds-kbd-lg-min-width`
- `--ds-kbd-lg-padding-block`
- `--ds-kbd-lg-padding-inline`
- `--ds-kbd-md-font-size`
- `--ds-kbd-md-min-height`
- `--ds-kbd-md-min-width`
- `--ds-kbd-md-padding-block`
- `--ds-kbd-md-padding-inline`
- `--ds-kbd-sm-font-size`
- `--ds-kbd-sm-min-height`
- `--ds-kbd-sm-min-width`
- `--ds-kbd-sm-padding-block`
- `--ds-kbd-sm-padding-inline`
- `--ds-kbd-vertical-align`
- `--ds-layout-content-min-basis`
- `--ds-layout-root-min-block-size`
- `--ds-layout-sider-trigger-block-size`
- `--ds-line-height-2xl`
- `--ds-line-height-sm`
- `--ds-link-disabled-decoration`
- `--ds-link-disabled-opacity`
- `--ds-link-external-icon-gap`
- `--ds-link-external-icon-offset`
- `--ds-link-focus-ring-offset`
- `--ds-link-focus-ring-width`
- `--ds-link-underline-offset`
- `--ds-link-underline-offset-hover`
- `--ds-link-underline-thickness`
- `--ds-link-underline-thickness-hover`
- `--ds-listing-grid-bottom-bleed`
- `--ds-live-feed-banner-gap`
- `--ds-live-feed-banner-height`
- `--ds-live-feed-banner-margin-block-end`
- `--ds-live-feed-banner-padding-inline`
- `--ds-live-feed-body-padding`
- `--ds-live-feed-control-font-size`
- `--ds-live-feed-control-height`
- `--ds-live-feed-control-padding-inline`
- `--ds-live-feed-empty-padding-block`
- `--ds-live-feed-footer-margin-block-start`
- `--ds-live-feed-header-margin-block-end`
- `--ds-live-feed-load-more-gap`
- `--ds-live-feed-refresh-size`
- `--ds-live-feed-skeleton-row-gap`
- `--ds-live-feed-skeleton-row-height`
- `--ds-live-feed-skeleton-title-gap`
- `--ds-live-feed-skeleton-title-height`
- `--ds-loading-overlay-scrim-opacity`
- `--ds-loading-skeleton-header-height`
- `--ds-markdown-link-decoration-hover`
- `--ds-markdown-view-measure`
- `--ds-material-overlay-texture`
- `--ds-material-panel-texture`
- `--ds-metric-card-body-color`
- `--ds-metric-card-footer-bg`
- `--ds-metric-card-footer-border`
- `--ds-metric-card-footer-color`
- `--ds-metric-card-hover-transform`
- `--ds-metric-card-overlay`
- `--ds-mobile-header-sticky-backdrop`
- `--ds-mobile-header-sticky-z`
- `--ds-notification-center-panel-width`
- `--ds-notification-center-touch-target`
- `--ds-overlay-backdrop-filter`
- `--ds-page-header-eyebrow-tracking`
- `--ds-page-header-sheen-duration`
- `--ds-page-header-sheen-opacity`
- `--ds-page-header-subtitle-max-width`
- `--ds-page-header-title-max-width`
- `--ds-page-shell-actions-backdrop`
- `--ds-page-shell-max-width`
- `--ds-popconfirm-icon-offset`
- `--ds-popconfirm-max-width`
- `--ds-popconfirm-min-width`
- `--ds-popconfirm-motion-offset`
- `--ds-popconfirm-motion-scale`
- `--ds-presence-badge-ring`
- `--ds-presence-cursor-x`
- `--ds-presence-cursor-y`
- `--ds-pricing-table-features-head-min-inline-size`
- `--ds-pricing-table-highlight-frame-width`
- `--ds-progress-circle-size`
- `--ds-progress-circle-thickness`
- `--ds-progress-circle-value`
- `--ds-qrcode-refresh-button-font-size`
- `--ds-qrcode-refresh-button-padding-x`
- `--ds-qrcode-root-padding`
- `--ds-qrcode-spinner-size`
- `--ds-qrcode-status-icon-size`
- `--ds-rate-star-inactive`
- `--ds-record-fact-span`
- `--ds-record-facts-compact-item-height`
- `--ds-record-facts-compact-item-padding`
- `--ds-record-facts-header-height`
- `--ds-record-facts-header-padding`
- `--ds-record-facts-item-height`
- `--ds-record-facts-item-padding`
- `--ds-record-facts-label-size`
- `--ds-result-code-size`
- `--ds-result-content-width`
- `--ds-result-description-width`
- `--ds-result-icon-well-size`
- `--ds-result-min-height`
- `--ds-scroll-area-focus-ring-offset`
- `--ds-scroll-area-overscroll-behavior`
- `--ds-scroll-area-track-bg`
- `--ds-section-card-eyebrow-tracking`
- `--ds-section-card-header-min-height`
- `--ds-section-card-icon-size`
- `--ds-selection-preview-rail-close-backdrop`
- `--ds-shell-collapse-transition`
- `--ds-shell-content-background`
- `--ds-shell-content-border`
- `--ds-shell-content-padding`
- `--ds-shell-footer-background`
- `--ds-shell-footer-border`
- `--ds-shell-footer-padding`
- `--ds-shell-footer-shadow`
- `--ds-shell-header-inset-block-start`
- `--ds-shell-header-inset-inline`
- `--ds-shell-header-radius`
- `--ds-shell-header-shadow`
- `--ds-shell-inline-start-inset`
- `--ds-shell-main-background`
- `--ds-shell-main-border`
- `--ds-shell-main-shadow`
- `--ds-shell-navigation-header-background`
- `--ds-shell-navigation-logo-padding-collapsed`
- `--ds-shell-navigation-radius`
- `--ds-shell-resolved-drawer-inline-size`
- `--ds-shell-resolved-sidebar-header-block-size`
- `--ds-shell-resolved-sidebar-header-min-block-size`
- `--ds-shell-safe-area-bottom`
- `--ds-shell-top-inset`
- `--ds-size-touch-target`
- `--ds-skeleton-avatar-radius`
- `--ds-skeleton-line-height`
- `--ds-skeleton-shape-radius`
- `--ds-skeleton-title-height`
- `--ds-slider-mark-gap`
- `--ds-slider-single-percent`
- `--ds-slider-thumb-size`
- `--ds-slider-track-size`
- `--ds-spinner-lg-ring-width`
- `--ds-spinner-md-ring-width`
- `--ds-spinner-sm-ring-width`
- `--ds-spinner-spin-easing`
- `--ds-spinner-xl-ring-width`
- `--ds-stack-divider-inset`
- `--ds-statistic-affix-bg`
- `--ds-statistic-affix-height`
- `--ds-statistic-affix-letter-spacing`
- `--ds-statistic-affix-padding-x`
- `--ds-statistic-affix-radius`
- `--ds-statistic-countdown-letter-spacing`
- `--ds-statistic-title-letter-spacing`
- `--ds-statistic-title-transform`
- `--ds-statistic-value-letter-spacing`
- `--ds-stats-grid-icon-size`
- `--ds-stats-header-card-min-height`
- `--ds-stats-header-card-padding`
- `--ds-stats-header-card-padding-compact`
- `--ds-stats-header-columns`
- `--ds-stats-header-ping-duration`
- `--ds-stats-header-value-font-weight`
- `--ds-step-wizard-action-dock-reserved-space`
- `--ds-step-wizard-content-min-height`
- `--ds-step-wizard-error-gap`
- `--ds-step-wizard-progress-height`
- `--ds-step-wizard-rail-offset`
- `--ds-step-wizard-skeleton-content-height`
- `--ds-step-wizard-skeleton-duration`
- `--ds-step-wizard-skeleton-progress-height`
- `--ds-step-wizard-touch-target-min`
- `--ds-step-wizard-vertical-rail-width`
- `--ds-table-cell-line-height`
- `--ds-table-drag-grip-offset`
- `--ds-table-editorial-mobile-title-size`
- `--ds-table-mobile-actions-padding-block`
- `--ds-table-mobile-bulk-padding`
- `--ds-table-mobile-card-hover-lift`
- `--ds-table-mobile-control-size`
- `--ds-table-mobile-pagination-padding`
- `--ds-table-mobile-selected-outline-offset`
- `--ds-table-mobile-state-min-height`
- `--ds-table-mobile-state-padding`
- `--ds-table-mobile-summary-min-height`
- `--ds-table-mobile-summary-padding-block`
- `--ds-table-mobile-summary-padding-inline`
- `--ds-table-resize-bar-height-active`
- `--ds-table-resize-bar-width-active`
- `--ds-table-ruled-mobile-shadow`
- `--ds-tenant-preview-input-max-width`
- `--ds-timeline-badge-font-size`
- `--ds-timeline-badge-padding-inline`
- `--ds-timeline-custom-dot-size`
- `--ds-timeline-date-heading-letter-spacing`
- `--ds-timeline-empty-padding-block`
- `--ds-timeline-label-font-variant-numeric`
- `--ds-timeline-label-letter-spacing`
- `--ds-timeline-loading-padding-block`
- `--ds-timeline-marker-size`
- `--ds-timeline-timestamp-letter-spacing`
- `--ds-toast-stack-transform`
- `--ds-token-inspector-swatch`
- `--ds-toolbar-sheen-opacity`
- `--ds-tree-view-skeleton-row-height`
- `--ds-typography-body-family`
- `--ds-typography-display-tracking`
- `--ds-typography-label-size`
- `--ds-typography-label-tracking`
- `--ds-typography-label-weight`
- `--ds-typography-numeric-family`
- `--ds-typography-section-title-family`
- `--ds-typography-section-title-tracking`
- `--ds-typography-section-title-weight`
- `--ds-typography-supporting-family`
- `--ds-typography-supporting-size`
- `--ds-upload-action-font-size`
- `--ds-upload-card-size`
- `--ds-upload-dropzone-height`
- `--ds-upload-file-name-font-size`
- `--ds-upload-preview-close-font-size`
- `--ds-upload-trigger-font-size`
- `--ds-virtual-keyboard-inset`
- `--ds-watermark-offset`
- `--ds-watermark-opacity`
- `--ds-widget-board-layout-x`
- `--ds-widget-board-layout-y`
- `--ds-workbench-header-actions-backdrop`
- `--ds-workbench-header-icon-size`
- `--ds-workspace-card-grid-line`
- `--ds-workspace-card-hover-transform`
- `--ds-workspace-card-min-height`
- `--ds-workspace-card-overlay`
- `--ds-workspace-card-transition`
- `--ds-workspace-switcher-item-gap`
- `--ds-workspace-switcher-list-max-height`
- `--ds-workspace-switcher-meta-numeric`
- `--ds-workspace-switcher-panel-gap`
- `--ds-workspace-switcher-panel-gap-block`
- `--ds-workspace-switcher-panel-width`
- `--ds-workspace-switcher-trigger-gap`
- `--ds-workspace-switcher-trigger-height`
- `--ds-workspace-switcher-trigger-name-font-size`
- `--ds-workspace-switcher-trigger-padding-inline`

Frozen-only (classic / rustic), 150 names — no authorized repair (P5):

- `--ds-badge-bg`
- `--ds-badge-color`
- `--ds-button-dashed-hover-bg`
- `--ds-button-default-hover-bg`
- `--ds-button-ghost-hover-bg`
- `--ds-button-link-hover-bg`
- `--ds-button-outline-bg`
- `--ds-button-outline-border`
- `--ds-button-outline-color`
- `--ds-button-outline-hover-bg`
- `--ds-button-primary-hover-bg`
- `--ds-button-radius-circle`
- `--ds-button-radius-round`
- `--ds-button-secondary-hover-bg`
- `--ds-button-text-hover-bg`
- `--ds-calendar-nav-radius`
- `--ds-carousel-arrow-bg`
- `--ds-carousel-arrow-border`
- `--ds-carousel-arrow-radius`
- `--ds-carousel-dot-radius`
- `--ds-carousel-dots-transform`
- `--ds-cascader-arrow-color`
- `--ds-cascader-border-error`
- `--ds-cascader-border-warning`
- `--ds-cascader-empty-color`
- `--ds-cascader-item-bg-hover`
- `--ds-cascader-item-bg-selected`
- `--ds-cascader-menu-border`
- `--ds-cascader-placeholder-color`
- `--ds-checkbox-box-radius`
- `--ds-checkbox-fill`
- `--ds-collapse-content-padding-x`
- `--ds-collapse-content-padding-y`
- `--ds-collapse-header-font-size`
- `--ds-collapse-header-padding-x`
- `--ds-collapse-header-padding-y`
- `--ds-collapse-icon-size`
- `--ds-collapse-root-bg`
- `--ds-collapse-root-border-color`
- `--ds-collapse-root-border-radius`
- `--ds-collapse-root-border-width`
- `--ds-collapse-root-shadow`
- `--ds-color-alpha-primary-5`
- `--ds-colorpicker-clear-bg`
- `--ds-colorpicker-clear-border`
- `--ds-colorpicker-clear-radius`
- `--ds-colorpicker-divider-color`
- `--ds-colorpicker-dropdown-bg`
- `--ds-colorpicker-dropdown-radius`
- `--ds-colorpicker-dropdown-shadow`
- `--ds-colorpicker-input-bg`
- `--ds-colorpicker-input-border`
- `--ds-colorpicker-input-radius`
- `--ds-colorpicker-label-color`
- `--ds-colorpicker-preset-border`
- `--ds-colorpicker-preset-color`
- `--ds-colorpicker-preset-radius`
- `--ds-colorpicker-swatch-border`
- `--ds-colorpicker-swatch-color`
- `--ds-colorpicker-swatch-radius`
- `--ds-colorpicker-swatch-shadow`
- `--ds-datepicker-cell-radius`
- `--ds-datepicker-panel-radius`
- `--ds-descriptions-border-color`
- `--ds-descriptions-item-border-color`
- `--ds-envtoggle-accent-soft`
- `--ds-floatbutton-square-radius`
- `--ds-form-info-color`
- `--ds-image-border-color`
- `--ds-image-fallback-bg`
- `--ds-image-fallback-color`
- `--ds-image-loading-bg`
- `--ds-image-placeholder-bg`
- `--ds-image-shadow`
- `--ds-image-zoom-close-bg`
- `--ds-image-zoom-close-color`
- `--ds-image-zoom-indicator-bg`
- `--ds-image-zoom-indicator-color`
- `--ds-image-zoom-overlay-bg`
- `--ds-input-number-radius`
- `--ds-mentions-bg`
- `--ds-mentions-border-error`
- `--ds-mentions-border-warning`
- `--ds-mentions-empty-color`
- `--ds-message-radius`
- `--ds-message-shadow`
- `--ds-modal-btn-radius`
- `--ds-modal-scrim-opacity`
- `--ds-pagination-active-color`
- `--ds-pagination-bg`
- `--ds-password-strength-fill`
- `--ds-pattern-timeline-marker-color`
- `--ds-personality-animation-entrance-duration`
- `--ds-personality-animation-offset-distance`
- `--ds-popconfirm-button-radius`
- `--ds-popconfirm-danger-color`
- `--ds-popconfirm-primary-color`
- `--ds-popover-arrow-shadow`
- `--ds-progress-bar-radius`
- `--ds-qrcode-bg`
- `--ds-qrcode-expired-color`
- `--ds-qrcode-overlay-bg`
- `--ds-qrcode-radius`
- `--ds-qrcode-spinner-track`
- `--ds-radio-dot-fill`
- `--ds-rate-star-active`
- `--ds-segmented-active-bg`
- `--ds-segmented-active-shadow`
- `--ds-sheet-safe-area-bottom`
- `--ds-spinner-ring-color`
- `--ds-table-open-cell-padding-block`
- `--ds-tabs-active-color`
- `--ds-tabs-radius`
- `--ds-timeline-pending-color`
- `--ds-toast-action-radius`
- `--ds-toast-elevation`
- `--ds-toast-radius`
- `--ds-toast-transform`
- `--ds-toggle-track-fill`
- `--ds-tour-bg`
- `--ds-tour-shadow`
- `--ds-transfer-button-bg`
- `--ds-transfer-button-color`
- `--ds-transfer-button-radius`
- `--ds-transfer-count-color`
- `--ds-transfer-empty-color`
- `--ds-transfer-search-input-border`
- `--ds-transfer-search-input-radius`
- `--ds-tree-drop-bg`
- `--ds-tree-highlight-bg`
- `--ds-tree-highlight-color`
- `--ds-tree-node-hover-bg`
- `--ds-treeselect-arrow-color`
- `--ds-treeselect-bg`
- `--ds-treeselect-border`
- `--ds-treeselect-border-error`
- `--ds-treeselect-border-focus`
- `--ds-treeselect-border-warning`
- `--ds-treeselect-clear-color`
- `--ds-treeselect-dropdown-bg`
- `--ds-treeselect-dropdown-radius`
- `--ds-treeselect-empty-color`
- `--ds-treeselect-expand-color`
- `--ds-treeselect-node-bg-hover`
- `--ds-treeselect-node-bg-selected`
- `--ds-treeselect-node-color-selected`
- `--ds-treeselect-node-radius`
- `--ds-treeselect-placeholder-color`
- `--ds-treeselect-radius`
- `--ds-upload-progress-fill`

## Appendix D — denominator movement since the bad pin

### D.1 Entries, `8bcc3852b` → HEAD (460)

- `--ds-alert-error-wash-subtle`
- `--ds-alert-info-wash-subtle`
- `--ds-alert-success-wash-subtle`
- `--ds-alert-warning-wash-subtle`
- `--ds-aspect-ratio-clip`
- `--ds-aspect-ratio-corner`
- `--ds-aspect-ratio-depth`
- `--ds-aspect-ratio-frame`
- `--ds-aspect-ratio-surface`
- `--ds-aspect-ratio-transition-duration`
- `--ds-aspect-ratio-transition-timing`
- `--ds-avatar-badge-dot-size`
- `--ds-avatar-badge-size`
- `--ds-avatar-group-overflow-font-weight`
- `--ds-avatar-group-overlap`
- `--ds-avatar-group-surplus-font-size`
- `--ds-avatar-group-surplus-size`
- `--ds-avatar-ink`
- `--ds-avatar-lg-size`
- `--ds-avatar-sm-size`
- `--ds-avatar-xl-size`
- `--ds-avatar-xs-size`
- `--ds-box-corner-2xl`
- `--ds-box-corner-full`
- `--ds-box-corner-lg`
- `--ds-box-corner-md`
- `--ds-box-corner-sm`
- `--ds-box-corner-xl`
- `--ds-box-corner-xs`
- `--ds-box-depth-2xl`
- `--ds-box-depth-lg`
- `--ds-box-depth-md`
- `--ds-box-depth-sm`
- `--ds-box-depth-xl`
- `--ds-box-depth-xs`
- `--ds-breadcrumb-current-bg`
- `--ds-breadcrumb-current-border`
- `--ds-breadcrumb-current-font-weight`
- `--ds-breadcrumb-current-keyline`
- `--ds-breadcrumb-ellipsis-bg`
- `--ds-breadcrumb-ellipsis-color`
- `--ds-breadcrumb-ellipsis-min-width`
- `--ds-breadcrumb-ellipsis-padding-inline`
- `--ds-breadcrumb-focus-ring`
- `--ds-breadcrumb-focus-ring-width`
- `--ds-breadcrumb-font-family`
- `--ds-breadcrumb-hover-bg`
- `--ds-breadcrumb-hover-border`
- `--ds-breadcrumb-hover-lift`
- `--ds-breadcrumb-hover-shadow`
- `--ds-breadcrumb-icon-bg`
- `--ds-breadcrumb-icon-radius`
- `--ds-breadcrumb-icon-size`
- `--ds-breadcrumb-item-gap`
- `--ds-breadcrumb-link-underline`
- `--ds-breadcrumb-list-gap`
- `--ds-breadcrumb-motion-duration`
- `--ds-breadcrumb-motion-easing`
- `--ds-breadcrumb-separator-opacity`
- `--ds-breadcrumb-separator-size`
- `--ds-calendar-view-entry-accent`
- `--ds-card-cover-min-height`
- `--ds-card-error-title-color`
- `--ds-card-footer-actions-inset`
- `--ds-card-header-color`
- `--ds-card-header-extra-min-height`
- `--ds-card-header-eyebrow-color`
- `--ds-card-header-icon-lift`
- `--ds-card-header-icon-shadow`
- `--ds-card-header-icon-shadow-hover`
- `--ds-card-image-block-size`
- `--ds-card-image-placeholder-fill`
- `--ds-card-image-placeholder-ink`
- `--ds-card-image-radius-lg`
- `--ds-card-image-radius-md`
- `--ds-card-image-radius-sm`
- `--ds-card-info-title-color`
- `--ds-card-loading-min-height`
- `--ds-card-outlined-border-hover`
- `--ds-card-padding-xl`
- `--ds-card-primary-title-color`
- `--ds-card-success-title-color`
- `--ds-card-warning-title-color`
- `--ds-collapse-arrow-motion-duration`
- `--ds-collapse-arrow-motion-easing`
- `--ds-collapse-content-ghost-idle-color`
- `--ds-collapse-content-ghost-idle-padding-x`
- `--ds-collapse-content-ghost-idle-padding-y`
- `--ds-collapse-content-padding-x`
- `--ds-collapse-content-padding-y`
- `--ds-collapse-content-surface`
- `--ds-collapse-header-default-active-bg`
- `--ds-collapse-header-default-expanded-border-color`
- `--ds-collapse-header-default-focus-outline`
- `--ds-collapse-header-default-focus-outline-offset`
- `--ds-collapse-header-default-hover-color`
- `--ds-collapse-header-default-idle-border-color`
- `--ds-collapse-header-expanded-ink`
- `--ds-collapse-header-font-size`
- `--ds-collapse-header-gap`
- `--ds-collapse-header-ghost-hover-bg`
- `--ds-collapse-header-ghost-hover-color`
- `--ds-collapse-header-ghost-idle-color`
- `--ds-collapse-header-padding-x`
- `--ds-collapse-header-padding-y`
- `--ds-collapse-icon-default-disabled-color`
- `--ds-collapse-icon-default-expanded-color`
- `--ds-collapse-icon-default-idle-color`
- `--ds-collapse-icon-default-idle-transition`
- `--ds-collapse-icon-size`
- `--ds-collapse-panel-surface`
- `--ds-collapse-reveal-motion-duration`
- `--ds-collapse-reveal-motion-easing`
- `--ds-collapse-root-bg`
- `--ds-collapse-root-border-color`
- `--ds-collapse-root-border-radius`
- `--ds-collapse-root-border-width`
- `--ds-collapse-root-bordered-idle-bg`
- `--ds-collapse-root-bordered-idle-border-color`
- `--ds-collapse-root-shadow`
- `--ds-collapse-size-large-content-padding-x`
- `--ds-collapse-size-large-content-padding-y`
- `--ds-collapse-size-large-header-font-size`
- `--ds-collapse-size-large-header-padding-x`
- `--ds-collapse-size-large-header-padding-y`
- `--ds-collapse-size-large-icon-size`
- `--ds-collapse-size-small-content-padding-x`
- `--ds-collapse-size-small-content-padding-y`
- `--ds-collapse-size-small-header-font-size`
- `--ds-collapse-size-small-header-padding-x`
- `--ds-collapse-size-small-header-padding-y`
- `--ds-collapse-size-small-icon-size`
- `--ds-collapse-state-motion-duration`
- `--ds-collapse-transition`
- `--ds-collection-card-gap`
- `--ds-column-menu-row-motion-duration`
- `--ds-container-2xl`
- `--ds-container-corner`
- `--ds-container-depth`
- `--ds-container-frame`
- `--ds-container-lg`
- `--ds-container-md`
- `--ds-container-measure`
- `--ds-container-pad`
- `--ds-container-padding-lg`
- `--ds-container-padding-md`
- `--ds-container-padding-none`
- `--ds-container-padding-sm`
- `--ds-container-sm`
- `--ds-container-surface`
- `--ds-container-transition-duration`
- `--ds-container-transition-timing`
- `--ds-container-xl`
- `--ds-data-table-action-cell-padding-comfortable`
- `--ds-data-table-action-cell-padding-compact`
- `--ds-data-table-action-cell-padding-spacious`
- `--ds-data-table-action-shadow`
- `--ds-data-table-actions-col-inline-size`
- `--ds-data-table-bulk-bar-padding`
- `--ds-data-table-caption-font-size`
- `--ds-data-table-col-inline-size`
- `--ds-data-table-col-max-inline-size`
- `--ds-data-table-col-min-inline-size`
- `--ds-data-table-collapsed-min-inline-size`
- `--ds-data-table-control-font-size`
- `--ds-data-table-control-size`
- `--ds-data-table-control-size-compact`
- `--ds-data-table-control-size-spacious`
- `--ds-data-table-drag-grip-bg`
- `--ds-data-table-drag-grip-border`
- `--ds-data-table-drag-grip-opacity`
- `--ds-data-table-drag-handle-font-size`
- `--ds-data-table-drop-indicator-bg`
- `--ds-data-table-drop-indicator-border`
- `--ds-data-table-drop-indicator-inset`
- `--ds-data-table-drop-indicator-shadow`
- `--ds-data-table-editor-checkbox-size`
- `--ds-data-table-editor-error-font-size`
- `--ds-data-table-editor-input-font-size`
- `--ds-data-table-editor-input-line-height`
- `--ds-data-table-editor-input-padding`
- `--ds-data-table-editorial-cell-padding-block`
- `--ds-data-table-editorial-header-bg`
- `--ds-data-table-editorial-header-padding-block`
- `--ds-data-table-editorial-header-transform`
- `--ds-data-table-editorial-row-shadow`
- `--ds-data-table-empty-description-font-size`
- `--ds-data-table-empty-title-font-size`
- `--ds-data-table-expanded-padding`
- `--ds-data-table-group-count-font-size`
- `--ds-data-table-group-disclosure-font-size`
- `--ds-data-table-group-header-font-size`
- `--ds-data-table-header-content-gap`
- `--ds-data-table-header-focus-shadow`
- `--ds-data-table-header-font-family`
- `--ds-data-table-header-pinned-bg`
- `--ds-data-table-leading-cell-padding-comfortable`
- `--ds-data-table-leading-cell-padding-compact`
- `--ds-data-table-leading-cell-padding-spacious`
- `--ds-data-table-min-inline-size`
- `--ds-data-table-minimal-shadow`
- `--ds-data-table-open-cell-padding-block`
- `--ds-data-table-pagination-padding`
- `--ds-data-table-pinned-cell-bg`
- `--ds-data-table-pinned-cell-bg-focus`
- `--ds-data-table-pinned-cell-bg-hover`
- `--ds-data-table-pinned-cell-bg-selected`
- `--ds-data-table-pinned-cell-bg-striped`
- `--ds-data-table-pinned-inset-end`
- `--ds-data-table-pinned-inset-start`
- `--ds-data-table-resize-bar-height`
- `--ds-data-table-resize-bar-width`
- `--ds-data-table-resize-hit-size`
- `--ds-data-table-row-block-size`
- `--ds-data-table-row-selected-shadow`
- `--ds-data-table-rule-strong`
- `--ds-data-table-scroll-max-block-size`
- `--ds-data-table-selection-cell-padding-comfortable`
- `--ds-data-table-selection-cell-padding-compact`
- `--ds-data-table-selection-cell-padding-spacious`
- `--ds-data-table-sort-bg`
- `--ds-data-table-sort-bg-active`
- `--ds-data-table-sort-bg-hover`
- `--ds-data-table-sort-border`
- `--ds-data-table-sort-border-active`
- `--ds-data-table-sort-border-hover`
- `--ds-data-table-sort-color`
- `--ds-data-table-sort-color-active`
- `--ds-data-table-sort-color-hover`
- `--ds-data-table-sort-control-offset`
- `--ds-data-table-sort-control-radius`
- `--ds-data-table-sort-control-size`
- `--ds-data-table-sort-opacity`
- `--ds-data-table-state-copy-max-inline-size`
- `--ds-data-table-toolbar-gap`
- `--ds-data-table-touch-hit-expansion`
- `--ds-data-table-touch-target`
- `--ds-data-table-virtual-spacer-block-size`
- `--ds-divider-edge-basis`
- `--ds-divider-gap`
- `--ds-divider-inset`
- `--ds-divider-inset-lg`
- `--ds-divider-inset-md`
- `--ds-divider-inset-none`
- `--ds-divider-inset-sm`
- `--ds-divider-inset-xl`
- `--ds-divider-inset-xs`
- `--ds-divider-label-case`
- `--ds-divider-label-ink`
- `--ds-divider-label-leading`
- `--ds-divider-label-measure`
- `--ds-divider-label-size`
- `--ds-divider-label-track`
- `--ds-divider-label-weight`
- `--ds-divider-segment-min`
- `--ds-divider-transition-duration`
- `--ds-divider-transition-timing`
- `--ds-divider-vertical-min`
- `--ds-flex-reflow-transition`
- `--ds-font-size-fluid-base`
- `--ds-font-size-fluid-lg`
- `--ds-font-size-fluid-sm`
- `--ds-font-size-fluid-xl`
- `--ds-gallery-view-aspect-ratio`
- `--ds-gallery-view-columns`
- `--ds-gallery-view-gap`
- `--ds-grid-reflow-transition`
- `--ds-grid-view-columns`
- `--ds-grid-view-gap`
- `--ds-kanban-board-column-accent`
- `--ds-kanban-board-column-gap`
- `--ds-kanban-board-column-max-height`
- `--ds-kanban-board-column-min-width`
- `--ds-kanban-board-touch-target`
- `--ds-letter-spacing-tighter`
- `--ds-line-height-loose`
- `--ds-listing-grid-bottom-bleed`
- `--ds-menu-arrow-bg`
- `--ds-menu-arrow-opacity`
- `--ds-menu-arrow-size`
- `--ds-menu-border-color`
- `--ds-menu-collapsed-inline-size`
- `--ds-menu-current-rule-ink`
- `--ds-menu-current-rule-inset`
- `--ds-menu-current-rule-size`
- `--ds-menu-current-tick-ink`
- `--ds-menu-current-tick-size`
- `--ds-menu-danger-bg-hover`
- `--ds-menu-danger-border-hover`
- `--ds-menu-divider`
- `--ds-menu-divider-margin-block`
- `--ds-menu-divider-margin-inline`
- `--ds-menu-focus-ring`
- `--ds-menu-focus-ring-width`
- `--ds-menu-gap`
- `--ds-menu-group-bg`
- `--ds-menu-group-font-family`
- `--ds-menu-group-line-height`
- `--ds-menu-group-margin-block`
- `--ds-menu-group-padding-block`
- `--ds-menu-group-padding-inline`
- `--ds-menu-group-radius`
- `--ds-menu-horizontal-gap`
- `--ds-menu-horizontal-padding-inline`
- `--ds-menu-icon-opacity`
- `--ds-menu-icon-plate-bg`
- `--ds-menu-icon-radius`
- `--ds-menu-icon-scale`
- `--ds-menu-inline-indent`
- `--ds-menu-item-bg-pressed`
- `--ds-menu-item-border-hover`
- `--ds-menu-item-font-family`
- `--ds-menu-item-horizontal-height`
- `--ds-menu-item-keyline`
- `--ds-menu-item-lift`
- `--ds-menu-item-line-height`
- `--ds-menu-level`
- `--ds-menu-nested-thread-ink`
- `--ds-menu-nested-thread-size`
- `--ds-menu-nested-thread-style`
- `--ds-menu-padding-block`
- `--ds-menu-padding-inline`
- `--ds-menu-panel-bg`
- `--ds-menu-panel-layer`
- `--ds-menu-panel-margin-block`
- `--ds-menu-panel-radius`
- `--ds-menu-trigger-open-bg`
- `--ds-menu-trigger-open-border`
- `--ds-menu-trigger-open-color`
- `--ds-motion-rearrange`
- `--ds-page-header-eyebrow-text-transform`
- `--ds-pagination-controls-bleed`
- `--ds-pagination-focus-ring`
- `--ds-pagination-focus-ring-width`
- `--ds-pagination-font-family`
- `--ds-pagination-gap`
- `--ds-pagination-jumper-width`
- `--ds-pagination-motion-duration`
- `--ds-pagination-motion-easing`
- `--ds-pagination-row-gap`
- `--ds-pagination-simple-gap`
- `--ds-pagination-size-arrow-clearance`
- `--ds-pagination-size-arrow-inset`
- `--ds-pagination-size-icon-color`
- `--ds-popover-bordered-title-padding-inline`
- `--ds-popover-comfortable-title-padding-inline`
- `--ds-popover-compact-title-padding-inline`
- `--ds-popover-minimal-title-padding-inline`
- `--ds-popover-rich-title-padding-inline`
- `--ds-popover-spacious-title-padding-inline`
- `--ds-popover-title-padding-inline-current`
- `--ds-saved-views-menu-panel-left`
- `--ds-saved-views-menu-panel-top`
- `--ds-saved-views-menu-panel-width`
- `--ds-sidebar-surface-aside-inline-size`
- `--ds-sidebar-surface-aside-width`
- `--ds-sidebar-surface-collapsed-width`
- `--ds-sidebar-surface-divider`
- `--ds-sidebar-surface-gap`
- `--ds-sidebar-surface-inline-size`
- `--ds-sidebar-surface-main-gap`
- `--ds-sidebar-surface-motion-duration`
- `--ds-sidebar-surface-motion-easing`
- `--ds-sidebar-surface-panel-gap`
- `--ds-sidebar-surface-stacked-gap`
- `--ds-sidebar-surface-width`
- `--ds-skeleton-bar-height`
- `--ds-skeleton-cell-padding`
- `--ds-skeleton-control-size`
- `--ds-space-gap`
- `--ds-space-gap-lg`
- `--ds-space-gap-md`
- `--ds-space-gap-sm`
- `--ds-space-transition-duration`
- `--ds-space-transition-timing`
- `--ds-splitter-gutter-grip-color-locked`
- `--ds-splitter-gutter-grip-thickness`
- `--ds-splitter-gutter-reach`
- `--ds-splitter-panel-grow`
- `--ds-stack-divider-gutter`
- `--ds-stack-divider-ink`
- `--ds-stack-divider-thickness`
- `--ds-stack-divider-veil`
- `--ds-stack-gap-2xl`
- `--ds-stack-gap-3xl`
- `--ds-stack-gap-4xl`
- `--ds-stack-gap-lg`
- `--ds-stack-gap-md`
- `--ds-stack-gap-none`
- `--ds-stack-gap-sm`
- `--ds-stack-gap-xl`
- `--ds-stack-gap-xs`
- `--ds-stack-reflow-transition`
- `--ds-stepper-circles-ring`
- `--ds-stepper-connector-block-gap`
- `--ds-stepper-connector-clearance`
- `--ds-stepper-connector-inset`
- `--ds-stepper-connector-min-length`
- `--ds-stepper-description-line-height`
- `--ds-stepper-dot-size`
- `--ds-stepper-focus-ring-width`
- `--ds-stepper-font-family`
- `--ds-stepper-hover-lift`
- `--ds-stepper-hover-shadow`
- `--ds-stepper-icon-border-width`
- `--ds-stepper-item-radius`
- `--ds-stepper-label-color-process`
- `--ds-stepper-label-color-wait`
- `--ds-stepper-label-line-height`
- `--ds-stepper-motion-duration`
- `--ds-stepper-motion-easing`
- `--ds-stepper-panel-motion-duration`
- `--ds-stepper-panel-motion-easing`
- `--ds-stepper-panel-slide-distance`
- `--ds-stepper-pressed-transform`
- `--ds-stepper-process-ring`
- `--ds-table-cell-ellipsis-max-width`
- `--ds-table-col-min-width`
- `--ds-table-col-width`
- `--ds-table-scroll-x`
- `--ds-table-scroll-y`
- `--ds-table-sticky-top`
- `--ds-table-virtual-spacer`
- `--ds-tabs-badge-keyline`
- `--ds-tabs-focus-ring`
- `--ds-tabs-focus-ring-width`
- `--ds-tabs-indicator-motion-duration`
- `--ds-tabs-indicator-offset`
- `--ds-tabs-indicator-scale`
- `--ds-tabs-item-lift`
- `--ds-tabs-pills-item-radius`
- `--ds-tabs-pills-list-radius`
- `--ds-tabs-touch-target-min`
- `--ds-tabs-underline-list-shadow`
- `--ds-tree-connector-elbow`
- `--ds-tree-connector-inset`
- `--ds-tree-node-opacity`
- `--ds-tree-node-padding-block`
- `--ds-tree-node-padding-inline`
- `--ds-tree-row-indent`
- `--ds-type-scale`
- `--ds-type-tier-2xl-letter-spacing`
- `--ds-type-tier-2xl-line-height`
- `--ds-type-tier-3xl-letter-spacing`
- `--ds-type-tier-3xl-line-height`
- `--ds-type-tier-lg-letter-spacing`
- `--ds-type-tier-lg-line-height`
- `--ds-type-tier-md-letter-spacing`
- `--ds-type-tier-md-line-height`
- `--ds-type-tier-sm-line-height`
- `--ds-type-tier-xl-letter-spacing`
- `--ds-type-tier-xl-line-height`
- `--ds-type-tier-xs-line-height`
- `--ds-virtual-list-block-size`
- `--ds-virtual-list-item-inset-block-start`
- `--ds-virtual-list-spacer-block-size`
- `--ds-widget-board-cell-column`
- `--ds-widget-board-cell-height`
- `--ds-widget-board-cell-row`
- `--ds-z-index-relative-base`

### D.2 Exits, `8bcc3852b` → HEAD (284)

- `--ds-alert-error-accent`
- `--ds-alert-info-accent`
- `--ds-alert-info-control-edge`
- `--ds-alert-info-control-edge-hover`
- `--ds-alert-info-edge`
- `--ds-alert-info-ink`
- `--ds-alert-info-wash`
- `--ds-alert-info-well`
- `--ds-alert-info-well-edge`
- `--ds-alert-success-accent`
- `--ds-alert-warning-accent`
- `--ds-aspect-ratio-background`
- `--ds-aspect-ratio-border`
- `--ds-aspect-ratio-motion-duration`
- `--ds-aspect-ratio-motion-easing`
- `--ds-aspect-ratio-overflow`
- `--ds-aspect-ratio-radius`
- `--ds-aspect-ratio-shadow`
- `--ds-avatar-sm-font-size`
- `--ds-calendar-event-accent`
- `--ds-card-actions-justify`
- `--ds-card-border-accent-hover`
- `--ds-card-cover-height`
- `--ds-card-image-placeholder-bg`
- `--ds-card-image-placeholder-color`
- `--ds-card-image-radius`
- `--ds-card-loading-skeleton-opacity`
- `--ds-card-skeleton-bg`
- `--ds-card-skeleton-duration`
- `--ds-card-skeleton-gap`
- `--ds-card-skeleton-highlight`
- `--ds-card-skeleton-min-height`
- `--ds-card-skeleton-radius`
- `--ds-card-skeleton-stack-gap`
- `--ds-card-skeleton-stack-margin-top`
- `--ds-collapse-root-default-idle-bg`
- `--ds-collapse-transition-duration`
- `--ds-collapse-transition-timing`
- `--ds-color-info-ink`
- `--ds-color-success-ink`
- `--ds-color-warning-ink`
- `--ds-container-background`
- `--ds-container-border`
- `--ds-container-instance-max-width`
- `--ds-container-instance-padding`
- `--ds-container-motion-duration`
- `--ds-container-motion-easing`
- `--ds-container-radius`
- `--ds-container-shadow`
- `--ds-density-card-padding`
- `--ds-density-local-factor`
- `--ds-divider-label-font-size`
- `--ds-divider-label-font-weight`
- `--ds-divider-label-line-height`
- `--ds-divider-label-max-width`
- `--ds-divider-label-tracking`
- `--ds-divider-label-transform`
- `--ds-divider-motion-duration`
- `--ds-divider-motion-easing`
- `--ds-divider-style`
- `--ds-divider-width`
- `--ds-drawer-size-md`
- `--ds-elevation-6`
- `--ds-font-size-3xl`
- `--ds-hover-card-motion-offset`
- `--ds-hover-card-motion-scale`
- `--ds-kanban-column-accent`
- `--ds-kanban-column-gap`
- `--ds-kanban-column-max-height`
- `--ds-kanban-column-min-width`
- `--ds-kanban-touch-target`
- `--ds-list-skeleton-avatar-size`
- `--ds-list-skeleton-line-gap`
- `--ds-list-skeleton-line-height`
- `--ds-list-skeleton-line-height-sm`
- `--ds-list-skeleton-line-radius`
- `--ds-list-skeleton-pulse-duration`
- `--ds-list-skeleton-row-gap`
- `--ds-list-skeleton-row-padding-block`
- `--ds-listing-grid-gap`
- `--ds-menu-border`
- `--ds-menu-divider-margin`
- `--ds-menu-group-title-font-size`
- `--ds-menu-group-title-font-weight`
- `--ds-menu-group-title-padding`
- `--ds-menu-item-padding`
- `--ds-modern-table-skeleton-index`
- `--ds-motion-offset-in`
- `--ds-notifier-error-accent`
- `--ds-notifier-info-accent`
- `--ds-notifier-loading-accent`
- `--ds-notifier-neutral-accent`
- `--ds-notifier-neutral-edge`
- `--ds-notifier-neutral-edge-strong`
- `--ds-notifier-neutral-ink`
- `--ds-notifier-neutral-lifetime`
- `--ds-notifier-neutral-rule`
- `--ds-notifier-neutral-wash`
- `--ds-notifier-neutral-well`
- `--ds-notifier-neutral-well-edge`
- `--ds-notifier-primary-accent`
- `--ds-notifier-secondary-accent`
- `--ds-notifier-success-accent`
- `--ds-notifier-toast-shadow`
- `--ds-notifier-toast-width`
- `--ds-notifier-warning-accent`
- `--ds-pagination-current-font-size`
- `--ds-pagination-current-padding-x`
- `--ds-popover-bordered-background`
- `--ds-popover-bordered-border`
- `--ds-popover-bordered-border-width`
- `--ds-popover-bordered-foreground`
- `--ds-popover-bordered-max-width`
- `--ds-popover-bordered-muted-foreground`
- `--ds-popover-bordered-padding-inline`
- `--ds-popover-bordered-shadow`
- `--ds-popover-padding-inline-current`
- `--ds-select-native-arrow-clearance`
- `--ds-sidebar-group-margin-bottom`
- `--ds-sidebar-group-margin-top`
- `--ds-sidebar-group-padding-top`
- `--ds-sidebar-item-height`
- `--ds-sidebar-item-indent`
- `--ds-space-instance-gap`
- `--ds-space-motion-duration`
- `--ds-space-motion-easing`
- `--ds-spacing-1-5`
- `--ds-stepper-border-radius`
- `--ds-stepper-circles-ring-width`
- `--ds-stepper-current-description-font-size`
- `--ds-stepper-current-item-font-size`
- `--ds-stepper-current-item-size`
- `--ds-stepper-current-label-font-size`
- `--ds-stepper-process-ring-width`
- `--ds-stepper-title-color`
- `--ds-steps-connector-color-active`
- `--ds-steps-connector-finish`
- `--ds-steps-connector-wait`
- `--ds-steps-connector-width`
- `--ds-steps-current-item-font-size`
- `--ds-steps-current-item-size`
- `--ds-steps-current-label-font-size`
- `--ds-steps-description-color`
- `--ds-steps-description-font-size`
- `--ds-steps-disabled-description-color`
- `--ds-steps-disabled-label-color`
- `--ds-steps-disabled-opacity`
- `--ds-steps-dot-size`
- `--ds-steps-error-bg`
- `--ds-steps-error-border`
- `--ds-steps-error-text`
- `--ds-steps-finish-bg`
- `--ds-steps-finish-border`
- `--ds-steps-finish-text`
- `--ds-steps-icon-color`
- `--ds-steps-item-bg`
- `--ds-steps-item-bg-error`
- `--ds-steps-item-bg-finish`
- `--ds-steps-item-bg-process`
- `--ds-steps-item-border`
- `--ds-steps-item-border-error`
- `--ds-steps-item-border-finish`
- `--ds-steps-item-border-process`
- `--ds-steps-item-color`
- `--ds-steps-item-color-error`
- `--ds-steps-item-color-finish`
- `--ds-steps-item-color-process`
- `--ds-steps-item-font-size`
- `--ds-steps-item-font-size-sm`
- `--ds-steps-item-font-weight`
- `--ds-steps-item-size`
- `--ds-steps-item-size-sm`
- `--ds-steps-label-color`
- `--ds-steps-label-color-error`
- `--ds-steps-label-color-hover`
- `--ds-steps-label-color-wait`
- `--ds-steps-label-font-size`
- `--ds-steps-label-font-size-sm`
- `--ds-steps-label-font-weight`
- `--ds-steps-label-font-weight-process`
- `--ds-steps-numeric`
- `--ds-steps-process-bg`
- `--ds-steps-process-border`
- `--ds-steps-process-ring-width`
- `--ds-steps-process-text`
- `--ds-steps-subtitle-color`
- `--ds-steps-subtitle-font-size`
- `--ds-steps-text-gap`
- `--ds-steps-text-margin-block-start`
- `--ds-steps-title-color`
- `--ds-steps-touch-target-min`
- `--ds-steps-vertical-gap`
- `--ds-steps-vertical-item-gap`
- `--ds-steps-wait-bg`
- `--ds-steps-wait-border`
- `--ds-steps-wait-text`
- `--ds-surface-subtle`
- `--ds-table-action-cell-padding-comfortable`
- `--ds-table-action-cell-padding-compact`
- `--ds-table-action-cell-padding-spacious`
- `--ds-table-action-shadow`
- `--ds-table-bulk-bar-padding`
- `--ds-table-caption-font-size`
- `--ds-table-collapsed-min-inline-size`
- `--ds-table-control-font-size`
- `--ds-table-control-size`
- `--ds-table-control-size-compact`
- `--ds-table-control-size-spacious`
- `--ds-table-drag-grip-bg`
- `--ds-table-drag-grip-border`
- `--ds-table-drag-grip-opacity`
- `--ds-table-drag-handle-font-size`
- `--ds-table-drop-indicator-bg`
- `--ds-table-drop-indicator-border`
- `--ds-table-drop-indicator-inset`
- `--ds-table-drop-indicator-shadow`
- `--ds-table-editor-checkbox-size`
- `--ds-table-editor-error-font-size`
- `--ds-table-editor-input-font-size`
- `--ds-table-editor-input-line-height`
- `--ds-table-editor-input-padding`
- `--ds-table-editorial-cell-padding-block`
- `--ds-table-editorial-header-bg`
- `--ds-table-editorial-header-padding-block`
- `--ds-table-editorial-header-transform`
- `--ds-table-editorial-row-shadow`
- `--ds-table-empty-description-font-size`
- `--ds-table-empty-title-font-size`
- `--ds-table-expanded-padding`
- `--ds-table-group-count-font-size`
- `--ds-table-group-disclosure-font-size`
- `--ds-table-group-header-font-size`
- `--ds-table-header-content-gap`
- `--ds-table-header-focus-shadow`
- `--ds-table-header-font-family`
- `--ds-table-header-pinned-bg`
- `--ds-table-leading-cell-padding-comfortable`
- `--ds-table-leading-cell-padding-compact`
- `--ds-table-leading-cell-padding-spacious`
- `--ds-table-min-inline-size`
- `--ds-table-minimal-shadow`
- `--ds-table-pagination-padding`
- `--ds-table-pinned-cell-bg`
- `--ds-table-pinned-cell-bg-focus`
- `--ds-table-pinned-cell-bg-hover`
- `--ds-table-pinned-cell-bg-selected`
- `--ds-table-pinned-cell-bg-striped`
- `--ds-table-resize-bar-height`
- `--ds-table-resize-bar-width`
- `--ds-table-resize-hit-size`
- `--ds-table-row-selected-shadow`
- `--ds-table-rule-strong`
- `--ds-table-selection-cell-padding-comfortable`
- `--ds-table-selection-cell-padding-compact`
- `--ds-table-selection-cell-padding-spacious`
- `--ds-table-skeleton-fill`
- `--ds-table-sort-bg`
- `--ds-table-sort-bg-active`
- `--ds-table-sort-bg-hover`
- `--ds-table-sort-border`
- `--ds-table-sort-border-active`
- `--ds-table-sort-border-hover`
- `--ds-table-sort-color`
- `--ds-table-sort-color-active`
- `--ds-table-sort-color-hover`
- `--ds-table-sort-control-offset`
- `--ds-table-sort-control-radius`
- `--ds-table-sort-control-size`
- `--ds-table-sort-opacity`
- `--ds-table-state-copy-max-inline-size`
- `--ds-table-toolbar-gap`
- `--ds-table-touch-hit-expansion`
- `--ds-table-touch-target`
- `--ds-tooltip-arrow-size`
- `--ds-tooltip-bordered-background`
- `--ds-tooltip-bordered-border`
- `--ds-tooltip-bordered-border-width`
- `--ds-tooltip-bordered-foreground`
- `--ds-tooltip-bordered-max-width`
- `--ds-tooltip-bordered-shadow`
- `--ds-tooltip-type`
- `--ds-type-body-line-height`
- `--ds-type-caption-font-family`
- `--ds-type-label-line-height`

## Appendix E — the WO-FAM-04 lot's real set difference

`25d245167` → `8bcc3852b`, the movement the `debtNote` recorded as "99 exits and 98
entries".

### E.1 Entries — measured 442 (the note enumerated 98)

- `--ds-alert-actions-bg`
- `--ds-alert-actions-gap`
- `--ds-alert-actions-padding`
- `--ds-alert-actions-radius`
- `--ds-alert-border-style`
- `--ds-alert-border-width`
- `--ds-alert-close-bg`
- `--ds-alert-close-color`
- `--ds-alert-close-color-hover`
- `--ds-alert-close-radius`
- `--ds-alert-close-shadow`
- `--ds-alert-close-size`
- `--ds-alert-compact-gap`
- `--ds-alert-compact-padding`
- `--ds-alert-compact-well-radius`
- `--ds-alert-compact-well-size`
- `--ds-alert-control-edge`
- `--ds-alert-control-edge-hover`
- `--ds-alert-copy-gap`
- `--ds-alert-description-measure`
- `--ds-alert-dialog-content-gap`
- `--ds-alert-dialog-enter-curve`
- `--ds-alert-dialog-enter-duration`
- `--ds-alert-dialog-enter-scale`
- `--ds-alert-dialog-enter-y`
- `--ds-alert-dialog-footer-gap`
- `--ds-alert-dialog-footer-offset`
- `--ds-alert-dialog-icon-ring-width`
- `--ds-alert-dialog-inline-size`
- `--ds-alert-dialog-max-inline-size`
- `--ds-alert-dialog-padding`
- `--ds-alert-dialog-title-gap`
- `--ds-alert-dialog-viewport-breathing`
- `--ds-alert-dialog-viewport-gutter`
- `--ds-alert-edge`
- `--ds-alert-enter-curve`
- `--ds-alert-enter-duration`
- `--ds-alert-error-accent`
- `--ds-alert-error-control-edge`
- `--ds-alert-error-control-edge-hover`
- `--ds-alert-error-edge`
- `--ds-alert-error-ink`
- `--ds-alert-error-wash`
- `--ds-alert-error-well`
- `--ds-alert-error-well-edge`
- `--ds-alert-focus-ring`
- `--ds-alert-focus-ring-width`
- `--ds-alert-gap`
- `--ds-alert-hairline-width`
- `--ds-alert-ink`
- `--ds-alert-keyline`
- `--ds-alert-press-scale`
- `--ds-alert-scale-step`
- `--ds-alert-shadow`
- `--ds-alert-success-accent`
- `--ds-alert-success-control-edge`
- `--ds-alert-success-control-edge-hover`
- `--ds-alert-success-edge`
- `--ds-alert-success-ink`
- `--ds-alert-success-wash`
- `--ds-alert-success-well`
- `--ds-alert-success-well-edge`
- `--ds-alert-surface-radius`
- `--ds-alert-texture`
- `--ds-alert-title-color`
- `--ds-alert-title-font-family`
- `--ds-alert-title-font-size`
- `--ds-alert-title-font-weight`
- `--ds-alert-title-letter-spacing`
- `--ds-alert-title-line-height`
- `--ds-alert-title-urgent-font-weight`
- `--ds-alert-touch-target-min`
- `--ds-alert-transition-curve`
- `--ds-alert-transition-duration`
- `--ds-alert-travel`
- `--ds-alert-warning-accent`
- `--ds-alert-warning-control-edge`
- `--ds-alert-warning-control-edge-hover`
- `--ds-alert-warning-edge`
- `--ds-alert-warning-ink`
- `--ds-alert-warning-wash`
- `--ds-alert-warning-well`
- `--ds-alert-warning-well-edge`
- `--ds-alert-wash`
- `--ds-alert-well`
- `--ds-alert-well-edge`
- `--ds-alert-well-keyline`
- `--ds-alert-well-radius`
- `--ds-alert-well-size`
- `--ds-color-alpha-black-40`
- `--ds-confirm-dialog-content-gap`
- `--ds-confirm-dialog-enter-curve`
- `--ds-confirm-dialog-enter-duration`
- `--ds-confirm-dialog-enter-scale`
- `--ds-confirm-dialog-enter-y`
- `--ds-confirm-dialog-footer-gap`
- `--ds-confirm-dialog-footer-offset`
- `--ds-confirm-dialog-icon-ring-width`
- `--ds-confirm-dialog-icon-size`
- `--ds-confirm-dialog-inline-size`
- `--ds-confirm-dialog-max-inline-size`
- `--ds-confirm-dialog-padding`
- `--ds-confirm-dialog-title-gap`
- `--ds-confirm-dialog-viewport-breathing`
- `--ds-confirm-dialog-viewport-gutter`
- `--ds-drawer-body-padding-lg`
- `--ds-drawer-body-padding-md`
- `--ds-drawer-body-padding-none`
- `--ds-drawer-body-padding-sm`
- `--ds-drawer-close-radius`
- `--ds-drawer-close-size`
- `--ds-drawer-enter-curve`
- `--ds-drawer-enter-duration`
- `--ds-drawer-exit-duration`
- `--ds-drawer-footer-gap`
- `--ds-drawer-height`
- `--ds-drawer-icon-radius`
- `--ds-drawer-icon-size`
- `--ds-drawer-press-scale`
- `--ds-drawer-section-gap`
- `--ds-drawer-section-min-height`
- `--ds-drawer-section-padding-block`
- `--ds-drawer-section-padding-inline`
- `--ds-drawer-size-full`
- `--ds-drawer-size-lg`
- `--ds-drawer-size-md`
- `--ds-drawer-size-sm`
- `--ds-drawer-size-xl`
- `--ds-drawer-texture`
- `--ds-drawer-transition-duration`
- `--ds-drawer-transition-timing`
- `--ds-drawer-width`
- `--ds-dropdown-arrow-anchor-offset`
- `--ds-dropdown-arrow-size`
- `--ds-dropdown-divider-margin-x`
- `--ds-dropdown-divider-margin-y`
- `--ds-dropdown-enter-scale`
- `--ds-dropdown-enter-y`
- `--ds-dropdown-exit-scale`
- `--ds-dropdown-exit-y`
- `--ds-dropdown-gap`
- `--ds-dropdown-group-bg`
- `--ds-dropdown-group-margin-end`
- `--ds-dropdown-group-margin-start`
- `--ds-dropdown-group-padding-x`
- `--ds-dropdown-group-padding-y`
- `--ds-dropdown-icon-bg`
- `--ds-dropdown-icon-bg-hover`
- `--ds-dropdown-icon-lift`
- `--ds-dropdown-icon-radius`
- `--ds-dropdown-indicator-size`
- `--ds-dropdown-item-track-gap`
- `--ds-dropdown-menu-max-block-size`
- `--ds-dropdown-position-left`
- `--ds-dropdown-position-top`
- `--ds-dropdown-press-scale`
- `--ds-dropdown-selection-scale`
- `--ds-dropdown-sheen-opacity`
- `--ds-dropdown-submenu-indicator-bg`
- `--ds-dropdown-submenu-indicator-size`
- `--ds-dropdown-submenu-inset`
- `--ds-dropdown-submenu-nudge`
- `--ds-dropdown-submenu-offset`
- `--ds-dropdown-sweep-duration`
- `--ds-dropdown-texture`
- `--ds-dropdown-transition-duration`
- `--ds-dropdown-transition-timing`
- `--ds-dropdown-viewport-gap`
- `--ds-elevation-5`
- `--ds-hover-card-closed-transform`
- `--ds-hover-card-enter-curve`
- `--ds-hover-card-enter-duration`
- `--ds-hover-card-padding`
- `--ds-hover-card-texture`
- `--ds-hover-card-viewport-gutter`
- `--ds-line-height-relaxed`
- `--ds-material-overlay-texture`
- `--ds-modal-action-height`
- `--ds-modal-action-lift`
- `--ds-modal-action-padding-block`
- `--ds-modal-action-padding-inline`
- `--ds-modal-action-radius`
- `--ds-modal-body-padding-lg`
- `--ds-modal-body-padding-md`
- `--ds-modal-body-padding-none`
- `--ds-modal-body-padding-sm`
- `--ds-modal-close-size-lg`
- `--ds-modal-close-size-sm`
- `--ds-modal-divider-width`
- `--ds-modal-enter-curve`
- `--ds-modal-enter-duration`
- `--ds-modal-enter-scale`
- `--ds-modal-enter-y`
- `--ds-modal-exit-duration`
- `--ds-modal-footer-gap`
- `--ds-modal-header-gap`
- `--ds-modal-heading-gap`
- `--ds-modal-overlay-strength`
- `--ds-modal-placement-offset`
- `--ds-modal-section-padding-block`
- `--ds-modal-section-padding-inline`
- `--ds-modal-spinner-duration`
- `--ds-modal-spinner-size`
- `--ds-modal-spinner-stroke`
- `--ds-modal-transition-duration`
- `--ds-modal-transition-timing`
- `--ds-motion-instant`
- `--ds-notifier-border-style`
- `--ds-notifier-border-width`
- `--ds-notifier-clickable-lift`
- `--ds-notifier-clickable-shadow-hover`
- `--ds-notifier-control-bg`
- `--ds-notifier-control-bg-hover`
- `--ds-notifier-control-border`
- `--ds-notifier-control-color`
- `--ds-notifier-control-font-size`
- `--ds-notifier-control-font-weight`
- `--ds-notifier-control-gap`
- `--ds-notifier-control-lift`
- `--ds-notifier-control-padding-inline`
- `--ds-notifier-control-radius`
- `--ds-notifier-control-shadow-hover`
- `--ds-notifier-control-size`
- `--ds-notifier-copy-gap`
- `--ds-notifier-description-color`
- `--ds-notifier-description-font-family`
- `--ds-notifier-description-font-size`
- `--ds-notifier-description-line-height`
- `--ds-notifier-edge`
- `--ds-notifier-edge-strong`
- `--ds-notifier-enter-curve`
- `--ds-notifier-enter-duration`
- `--ds-notifier-error-accent`
- `--ds-notifier-error-edge`
- `--ds-notifier-error-edge-strong`
- `--ds-notifier-error-ink`
- `--ds-notifier-error-lifetime`
- `--ds-notifier-error-rule`
- `--ds-notifier-error-wash`
- `--ds-notifier-error-well`
- `--ds-notifier-error-well-edge`
- `--ds-notifier-exit-curve`
- `--ds-notifier-exit-duration`
- `--ds-notifier-focus-ring`
- `--ds-notifier-focus-ring-width`
- `--ds-notifier-gap`
- `--ds-notifier-gradient-bg`
- `--ds-notifier-gradient-color`
- `--ds-notifier-gradient-edge`
- `--ds-notifier-gradient-well`
- `--ds-notifier-hairline-width`
- `--ds-notifier-info-edge`
- `--ds-notifier-info-edge-strong`
- `--ds-notifier-info-ink`
- `--ds-notifier-info-lifetime`
- `--ds-notifier-info-rule`
- `--ds-notifier-info-wash`
- `--ds-notifier-info-well`
- `--ds-notifier-info-well-edge`
- `--ds-notifier-ink`
- `--ds-notifier-layer`
- `--ds-notifier-lifetime`
- `--ds-notifier-lifetime-ink`
- `--ds-notifier-lifetime-size`
- `--ds-notifier-loading-accent`
- `--ds-notifier-loading-edge`
- `--ds-notifier-loading-edge-strong`
- `--ds-notifier-loading-ink`
- `--ds-notifier-loading-lifetime`
- `--ds-notifier-loading-rule`
- `--ds-notifier-loading-wash`
- `--ds-notifier-loading-well`
- `--ds-notifier-loading-well-edge`
- `--ds-notifier-message-control-size`
- `--ds-notifier-message-font-size`
- `--ds-notifier-message-font-weight`
- `--ds-notifier-message-min-width`
- `--ds-notifier-message-padding-block`
- `--ds-notifier-message-padding-inline`
- `--ds-notifier-message-stack-gap`
- `--ds-notifier-message-urgent-font-weight`
- `--ds-notifier-message-well-size`
- `--ds-notifier-message-width`
- `--ds-notifier-notification-width`
- `--ds-notifier-padding`
- `--ds-notifier-press-scale`
- `--ds-notifier-primary-accent`
- `--ds-notifier-primary-edge`
- `--ds-notifier-primary-edge-strong`
- `--ds-notifier-primary-ink`
- `--ds-notifier-primary-lifetime`
- `--ds-notifier-primary-rule`
- `--ds-notifier-primary-wash`
- `--ds-notifier-primary-well`
- `--ds-notifier-primary-well-edge`
- `--ds-notifier-radius`
- `--ds-notifier-rule`
- `--ds-notifier-scale-step`
- `--ds-notifier-secondary-accent`
- `--ds-notifier-secondary-edge`
- `--ds-notifier-secondary-edge-strong`
- `--ds-notifier-secondary-ink`
- `--ds-notifier-secondary-lifetime`
- `--ds-notifier-secondary-rule`
- `--ds-notifier-secondary-wash`
- `--ds-notifier-secondary-well`
- `--ds-notifier-secondary-well-edge`
- `--ds-notifier-sheen-angle`
- `--ds-notifier-sheen-stop`
- `--ds-notifier-spin-duration`
- `--ds-notifier-spinner-head`
- `--ds-notifier-spinner-size`
- `--ds-notifier-spinner-track`
- `--ds-notifier-spinner-width`
- `--ds-notifier-stack-gap`
- `--ds-notifier-stack-gutter`
- `--ds-notifier-stack-offset`
- `--ds-notifier-stack-recede`
- `--ds-notifier-stack-step`
- `--ds-notifier-stack-width`
- `--ds-notifier-success-accent`
- `--ds-notifier-success-edge`
- `--ds-notifier-success-edge-strong`
- `--ds-notifier-success-ink`
- `--ds-notifier-success-lifetime`
- `--ds-notifier-success-rule`
- `--ds-notifier-success-wash`
- `--ds-notifier-success-well`
- `--ds-notifier-success-well-edge`
- `--ds-notifier-surface-shadow`
- `--ds-notifier-title-font-family`
- `--ds-notifier-title-font-size`
- `--ds-notifier-title-font-weight`
- `--ds-notifier-title-letter-spacing`
- `--ds-notifier-title-line-height`
- `--ds-notifier-title-urgent-font-weight`
- `--ds-notifier-toast-width`
- `--ds-notifier-touch-target-min`
- `--ds-notifier-transition-curve`
- `--ds-notifier-transition-duration`
- `--ds-notifier-travel`
- `--ds-notifier-travel-direction`
- `--ds-notifier-warning-accent`
- `--ds-notifier-warning-edge`
- `--ds-notifier-warning-edge-strong`
- `--ds-notifier-warning-ink`
- `--ds-notifier-warning-lifetime`
- `--ds-notifier-warning-rule`
- `--ds-notifier-warning-wash`
- `--ds-notifier-warning-well`
- `--ds-notifier-warning-well-edge`
- `--ds-notifier-wash`
- `--ds-notifier-well`
- `--ds-notifier-well-edge`
- `--ds-notifier-well-keyline`
- `--ds-notifier-well-radius`
- `--ds-notifier-well-size`
- `--ds-popover-arrow-duration`
- `--ds-popover-body-max-height-current`
- `--ds-popover-bordered-texture`
- `--ds-popover-edge-current`
- `--ds-popover-edge-width-current`
- `--ds-popover-enter-duration`
- `--ds-popover-enter-easing`
- `--ds-popover-exit-duration`
- `--ds-popover-exit-easing`
- `--ds-popover-ink-current`
- `--ds-popover-instance-max-width`
- `--ds-popover-max-width-current`
- `--ds-popover-muted-ink-current`
- `--ds-popover-padding-inline-current`
- `--ds-popover-rich-texture`
- `--ds-popover-shadow-current`
- `--ds-popover-surface-current`
- `--ds-popover-title-color`
- `--ds-popover-title-padding-block`
- `--ds-sheet-close-radius`
- `--ds-sheet-enter-curve`
- `--ds-sheet-enter-duration`
- `--ds-sheet-exit-duration`
- `--ds-sheet-footer-gap`
- `--ds-sheet-footer-padding-block`
- `--ds-sheet-footer-padding-inline`
- `--ds-sheet-header-gap`
- `--ds-sheet-header-padding-block`
- `--ds-sheet-header-padding-inline`
- `--ds-sheet-max-height`
- `--ds-sheet-panel-layer`
- `--ds-sheet-transition-duration`
- `--ds-sheet-transition-timing`
- `--ds-tooltip-arrow-duration`
- `--ds-tooltip-arrow-half-size`
- `--ds-tooltip-arrow-overlap`
- `--ds-tooltip-arrow-size`
- `--ds-tooltip-bordered-texture`
- `--ds-tooltip-content-arrow-offset`
- `--ds-tooltip-content-padding-block`
- `--ds-tooltip-content-padding-inline`
- `--ds-tooltip-edge-current`
- `--ds-tooltip-edge-width-current`
- `--ds-tooltip-enter-duration`
- `--ds-tooltip-enter-easing`
- `--ds-tooltip-exit-duration`
- `--ds-tooltip-exit-easing`
- `--ds-tooltip-ink-current`
- `--ds-tooltip-instance-max-width`
- `--ds-tooltip-inverse-border`
- `--ds-tooltip-max-width-current`
- `--ds-tooltip-rich-texture`
- `--ds-tooltip-shadow-current`
- `--ds-tooltip-shortcut-gap`
- `--ds-tooltip-shortcut-key-radius`
- `--ds-tooltip-surface-current`
- `--ds-tooltip-tone-border`
- `--ds-tooltip-type-current`
- `--ds-tour-action-lift`
- `--ds-tour-action-radius`
- `--ds-tour-close-offset`
- `--ds-tour-cover-gap`
- `--ds-tour-enter-curve`
- `--ds-tour-enter-duration`
- `--ds-tour-focus-ring-offset`
- `--ds-tour-focus-ring-width`
- `--ds-tour-footer-gap`
- `--ds-tour-indicator-current-size`
- `--ds-tour-indicator-gap`
- `--ds-tour-indicator-size`
- `--ds-tour-layer`
- `--ds-tour-primary-border-width`
- `--ds-tour-section-gap`
- `--ds-tour-spotlight-height`
- `--ds-tour-spotlight-left`
- `--ds-tour-spotlight-top`
- `--ds-tour-spotlight-width`
- `--ds-tour-surface-padding`
- `--ds-tour-transition-duration`
- `--ds-tour-transition-timing`
- `--ds-type-caption-letter-spacing`
- `--ds-viewport-block-size`
- `--ds-viewport-inline-size`
- `--ds-z-popover`
- `--ds-z-tooltip`

### E.2 Exits — measured 95 (the note recorded 99)

- `--ds-alert-action-active-transform`
- `--ds-alert-description-width`
- `--ds-alert-dialog-max-width`
- `--ds-alert-dialog-motion-offset`
- `--ds-alert-dialog-motion-scale`
- `--ds-alert-dialog-width`
- `--ds-alert-icon-well-size`
- `--ds-callout-description-width`
- `--ds-callout-icon-well-size`
- `--ds-confirm-dialog-max-width`
- `--ds-confirm-dialog-motion-offset`
- `--ds-confirm-dialog-motion-scale`
- `--ds-drawer-body-color`
- `--ds-drawer-close-touch-target`
- `--ds-drawer-footer-bg`
- `--ds-drawer-footer-divider`
- `--ds-drawer-header-divider`
- `--ds-drawer-shadow`
- `--ds-elevation-surface-3`
- `--ds-elevation-surface-4`
- `--ds-glass-scrim-tint`
- `--ds-gradient-primary`
- `--ds-hover-card-border-width`
- `--ds-hover-card-touch-target`
- `--ds-icon-size-feature`
- `--ds-message-duration`
- `--ds-message-stack-offset`
- `--ds-modal-action-disabled-opacity`
- `--ds-modal-body-bg`
- `--ds-modal-body-color`
- `--ds-modal-body-scrollbar-width`
- `--ds-modal-footer-bg`
- `--ds-modal-footer-divider`
- `--ds-modal-footer-justify`
- `--ds-modal-footer-padding`
- `--ds-modal-header-bg`
- `--ds-modal-header-divider`
- `--ds-modal-section-border`
- `--ds-notification-duration`
- `--ds-notification-stack-offset`
- `--ds-overlay-modal-radius`
- `--ds-popover-body-max-height`
- `--ds-popover-bordered-border-width`
- `--ds-popover-compact-max-height`
- `--ds-popover-edge-width`
- `--ds-popover-minimal-border`
- `--ds-popover-minimal-border-width`
- `--ds-popover-minimal-max-width`
- `--ds-popover-rich-max-width`
- `--ds-popover-surface`
- `--ds-popover-touch-target`
- `--ds-recipe-y`
- `--ds-sheet-body-scrollbar-width`
- `--ds-sheet-header-padding`
- `--ds-sheet-safe-area-top`
- `--ds-toast-action-touch-target`
- `--ds-tooltip-arrow-half-size-current`
- `--ds-tooltip-bordered-border-width`
- `--ds-tooltip-bordered-padding-block`
- `--ds-tooltip-bordered-padding-inline`
- `--ds-tooltip-comfortable-padding-block`
- `--ds-tooltip-comfortable-padding-inline`
- `--ds-tooltip-compact-padding-block`
- `--ds-tooltip-compact-padding-inline`
- `--ds-tooltip-edge`
- `--ds-tooltip-edge-width`
- `--ds-tooltip-error-border`
- `--ds-tooltip-inverse-border-width`
- `--ds-tooltip-inverse-max-width`
- `--ds-tooltip-inverse-padding-block`
- `--ds-tooltip-inverse-padding-inline`
- `--ds-tooltip-minimal-border-width`
- `--ds-tooltip-minimal-max-width`
- `--ds-tooltip-minimal-padding-block`
- `--ds-tooltip-minimal-padding-inline`
- `--ds-tooltip-primary-border`
- `--ds-tooltip-radius`
- `--ds-tooltip-rich-border-width`
- `--ds-tooltip-rich-max-width`
- `--ds-tooltip-rich-padding-block`
- `--ds-tooltip-rich-padding-inline`
- `--ds-tooltip-secondary-border`
- `--ds-tooltip-spacious-padding-block`
- `--ds-tooltip-spacious-padding-inline`
- `--ds-tooltip-success-border`
- `--ds-tooltip-surface`
- `--ds-tooltip-touch-target`
- `--ds-tooltip-warning-border`
- `--ds-tour-action-font-size`
- `--ds-tour-radius`
- `--ds-tour-title-line-height`
- `--ds-tour-touch-target-min`
- `--ds-type-label-letter-spacing`
- `--ds-z-message`
- `--ds-z-notification`

---

## Commands run (all read-only)

```
node scripts/check/engine/cascade-wiring/index.mjs                  # from packages/core, at HEAD and at 9 historical commits
git archive <sha> packages/core | tar -x -C /tmp/r17-07/trees/<sha> # 12 historical trees, no checkout mutated
git log/show/diff -S<name> --format=… -- packages/core/src          # dating and rename evidence
grep -rn -- '<channel>' packages/core/src --include=*.css|*.ts|*.tsx
```

No `pnpm build`, no test suite, no artifact regeneration, no `git add`/`commit`/`mv`,
no baseline write, no product-source edit.
