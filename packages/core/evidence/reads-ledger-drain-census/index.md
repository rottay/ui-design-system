# Reads-adjudication ledger drain census

- Measured: 2026-09-22
- Tree: the drain lot, uncommitted, over `main` @ `732f5239c` (HEAD advanced to
  `587e36960` under other writers while this ran; the hooks contract did not
  move, and the gate was re-run green on the advanced tree)
- Instrument: three passes, no regeneration of anything
  - set-difference of `src/foundation/tokens/data/decisions/reads/index.json`
    against `contracts/css/hooks/index.json`
  - a `var(--ds-*)` read scan of `packages/core/src`, applying the hook
    contract's OWN `EXCLUDED_PATH` rule so "in scope" means what the contract
    means by it
  - `git log -p --unified=0` pickaxe over `a3ba2e479..HEAD`, attributing every
    removed row to the landed commit that moved its read
- Backs: the removal of 1331 rows from the ledger and the digest re-pin
  `5ccad7a0...` -> `da7a471f...`
- Row-level census: `rows.json` in this folder, 1331 rows, one entry each

It is evidence, not a gate. Nothing reads it and nothing fails when it goes
stale; re-measure before quoting it.

## What was wrong

`reads-adjudication` is a blocking pre-build gate. It asserts one invariant:
the ledger's row set is set-equal to `hooks-manifest.unadjudicatedReads`, and
the ledger's `basedOnManifestDigest` is the sha256 of the manifest file it was
merged against. At `732f5239c` it reported **1332 violations** - 1331 rows for
names the manifest no longer fences, 0 missing, plus the stale digest pin.

The ledger has **no producer**. The manifest is written by
`pnpm hooks:generate`; the ledger is a hand-merged projection of it. Drift is
therefore one-directional and silent: every manifest regeneration can only make
the ledger wronger, and nothing in the repo notices except this gate.

Replaying the gate's own `checkLedger()` over historical blobs dates the break
exactly. The replay must read the ledger at its **pre-move path**,
`packages/core/governance/tokens/decisions/reads/index.json`: the file only
reaches its measured home under the token foundation at `8672fb694`, so a
replay pinned to the HEAD path finds no blob at all before that commit. Walking
every manifest-touching commit rather than a sample:

| revision | date | ledger rows | manifest fences | gate |
| --- | --- | ---: | ---: | --- |
| `5bfae6097` | 2026-09-05 | 2605 | 2605 | green (0 violations) |
| `722fd05bf` | 2026-09-05 | 2605 | 2605 | **red (1 violation - stale digest only)** |
| `188b38e75` | 2026-09-05 | 2605 | 2599 | **red (7 - first set mismatch)** |
| `ae0c8cf66` | 2026-09-08 | 2605 | 2579 | red (27 violations) |
| `34790cf43` | 2026-09-08 | 2603 | 2577 | red (27 violations - unchanged) |
| `8672fb694` | 2026-09-19 | 2603 | 1273 | red (1330 violations) |
| `732f5239c` | 2026-09-22 | 2603 | 1272 | red (1332 violations) |

`722fd05bf` (WO-CON-03) is the commit that broke it, in the quietest way the
gate allows: it regenerated `contracts/css/hooks/index.json` by a single line,
moving that file's sha256 `5ccad7a0...` -> `b9b182b6...`, and did not re-pin
`basedOnManifestDigest`. The row sets were still identical, so the gate went
red on the digest alone. The first *set* mismatch is `188b38e75`, where the
fence fell to 2599 against a ledger still at 2605 - 6 extra rows plus the
digest, 7 violations.

`34790cf43` (WO-DER-02) is **not** the breaking commit. It hand-removed 2 rows
against a manifest that had already dropped 26, but its parent `ae0c8cf66` was
already at 27 violations and it left the count at 27: it edited a ledger that
was red before it arrived. `8672fb694` moved the file from
`governance/tokens/decisions/reads/` to its measured home under the token
foundation with a SHA-identical blob - it carried the debt, it did not create
it. Between `34790cf43` and HEAD, **48 commits regenerated the hooks
contract**, walking the fence 2577 -> 1272 while the ledger stood still.

## Disposition of all 1331 extra rows

Every extra row was censused before removal. "Extra" is not "wrong": a row
leaves this ledger when the read it records stops being *unadjudicated*, which
happens three ways.

| disposition | rows | what it means | what the drain did |
| --- | ---: | --- | --- |
| ADJUDICATED | 962 | the read is alive and now has a declared owner - a tenant channel, a DS root declaration, a component channel or a published hook | row removed: the debt was discharged, not hidden |
| DEAD | 365 | the read does not exist anywhere in `packages/core/src` any more | row removed: nothing left to adjudicate |
| OUT-OF-SCOPE | 4 | the read is alive, but only where the contract deliberately does not look - a compiler emission RHS, a TS token module, a test | row removed: the fence cannot see it by design |
| FENCE-PENDING | **0** | a live in-scope read the manifest failed to fence | nothing owed to the fence ceremony |

By the class the ledger had assigned them:

| ledger class | ADJUDICATED | DEAD | OUT-OF-SCOPE | total |
| --- | ---: | ---: | ---: | ---: |
| MODERN_PRIVATE | 920 | 355 | 4 | 1279 |
| FROZEN_ENGINE_SCOPED | 27 | 10 | 0 | 37 |
| TENANT_FACING_CANDIDATE | 15 | 0 | 0 | 15 |
| FOUNDATION_SHARED | 0 | 0 | 0 | 0 |

Ledger totals: 2603 -> 1272 rows; `MODERN_PRIVATE` 2005 -> 726,
`FROZEN_ENGINE_SCOPED` 518 -> 481, `TENANT_FACING_CANDIDATE` 70 -> 55,
`FOUNDATION_SHARED` 10 -> 10 (untouched).

## ADJUDICATED - 962 rows, 61 commits

These names left `unadjudicatedReads` because an owner arrived. Where the
ownership landed, read from the manifest at HEAD:

| now owned as | rows |
| --- | ---: |
| tenantChannel | 683 |
| foundationTokens | 216 |
| foundationTokens + tenantChannel | 32 |
| componentTokens | 23 |
| componentTokens + tenantChannel | 6 |
| componentTokens + foundationTokens | 1 |
| publicHooks + componentTokens | 1 |

The declaration that granted ownership, by root of the file it landed in:
`infrastructure/compilers/runtime/theme` 679 (the FAM chrome derivers),
`foundation/tokens/css/presentation` 215, `foundation/tokens/css/foundation` 47,
`foundation/tokens/css/runtime` 13, `components/` 5,
`infrastructure/compilers/kernel/foundation` 2, `foundation/tokens/css/facade` 1.

Every one of the 962 still has a live `var()` read inside the contract's scan
roots: they are consumed channels that acquired a producer, which is exactly
what the ledger's own law wants to happen to its rows.

| commit | lot | rows |
| --- | --- | ---: |
| `c6b4a40e1` | feat(select)!: family cut | 63 |
| `9d0458d58` | feat(family-cut): list-toolbar lands with browser parity proven | 56 |
| `7e13ee2e0` | feat(core): FAM-10 sub-lot D2 | 52 |
| `e6a0d08e7` | feat(tree,descriptions): the family cuts with the derivers registered (WO-FAM-06) | 51 |
| `6627914f0` | feat(display): the badge, tag and avatar cuts | 50 |
| `1ddfd6198` | feat(navigation): complete the steps merge, cut sidebar-surface, wire the sidebar roots | 48 |
| `51593e697` | feat(tokens): B7 vocabulary derivers | 44 |
| `0d29e9fe8` | feat(families): three workspace structures cut end to end (WO-FAM-08 B9) | 40 |
| `011910356` | feat(navigation): family cuts for tabs, breadcrumb and pagination (WO-FAM-05 lot 2) | 36 |
| `7a267f705` | feat(theme): materials overlay/raised carry the full facet list (71 -> 103 roots) | 32 |
| `82c900730` | feat(input-number)!: one input-number namespace, family deriver | 25 |
| `eabf62987` | feat(menu): family cut | 24 |
| `b43b9b7e9` | feat(tour)!: family cut | 24 |
| `75d77e375` | feat(modal)!: family cut | 22 |
| `59439fa13` | refactor(design-system): one derivation pipeline with the FamilyDeriver contract | 20 |
| `c6be7d3bd` | feat(dropdown)!: family cut | 20 |
| `35d57712a` | feat(mentions)!: family cut | 19 |
| `e5c3a7334` | feat(core): FAM-10 cohorts D/E | 18 |
| `ae25253e3` | feat(cascader): family cut | 17 |
| `833787068` | feat(form)!: one form runtime for both engines | 16 |
| ... 41 further commits | | 285 |

Two cohorts are worth naming, because they are the ones a bulk deletion could
have destroyed:

- **All 15 `TENANT_FACING_CANDIDATE` rows were executed, none dropped.** The
  eleven `--ds-chart-category-*` / `--ds-chart-series-1` rows became real tenant
  channels at `59439fa13`; the four `--ds-material-{overlay,raised}-{border,shadow}`
  rows at `7a267f705`. The ledger's own `densitySpacingSeam` decision - that an
  authoring hook populated by a tenant is not dead merely because nothing emits
  it yet - was vindicated: emitters arrived.
- **One row left by promotion to public API.** `--ds-skeleton-bar-height` is in
  `publicHooks` at HEAD (`0b7c698ec`, the renderer's bone-geometry channels).
  It is the only row in the whole set that crossed from undeclared debt to
  published contract.

## DEAD - 365 rows, 46 commits

The `var()` read the row recorded is gone from the tree (the ledger's own
evidence strings excluded, since they quote the reads they record). 349 names
have vanished entirely; **14** survive only as prose - a docblock explaining
the retirement, a test assertion string, or a row in another census JSON -
which is a mention, not a read; the remaining 2 are the recipe pair called out
below. 355 were `MODERN_PRIVATE`, 10 `FROZEN_ENGINE_SCOPED`. The FAM family-cut wave is the cause of nearly all of
them - a cut renames a family's private channels into its own namespace and the
old spellings stop existing.

**Two of the 365 are DEAD as a contract disposition but not as a channel.**
`--ds-recipe-exit` and `--ds-recipe-y` lost their `var()` reads at `37063a7ed`
(sheet) and `75d77e375` (modal), which is what took them out of
`unadjudicatedReads` and is why DEAD is the right row disposition: the manifest
fences `var()` reads, and neither name has one any more. But both are still
supplied in production by the motion recipe
(`infrastructure/runtime/foundation/motion/composition/react/preference/recipe/index.ts:78,82`)
and consumed by modal, drawer and sheet through JS key access on
`overlayMotion.variables`, never through the cascade. So "no declaration
anywhere" is **false** for these two: the declarations are live and load-bearing
for three overlays. Read their DEAD rows as "outside the fence", not as
"deletable".

| commit | lot | rows |
| --- | --- | ---: |
| `1f171b2db` | feat(families): the data-table family cut lands its deriver, skins and runtime (WO-FAM-08 B4) | 74 |
| `1ddfd6198` | feat(navigation): complete the steps merge, cut sidebar-surface, wire the sidebar roots | 49 |
| `4f9e7bf55` | chore(core): the serialized DT window over the landed wave | 37 |
| `85cc1085b` | fix(core): data-table's unproduced reads get their producers | 21 |
| `0866afe18` | feat(alert)!: family cut with Callout folded in | 18 |
| `e31c1174e` | feat(toggle)!: one binary switch family | 16 |
| `eda2a2937` | feat(otp-input)!: family cut | 15 |
| `11a88f5d5` | feat(password-input)!: family cut | 12 |
| `89976e4c7` | feat(layout): the container, aspect-ratio, space, splitter and divider cuts (WO-FAM-07) | 9 |
| `625bbe0b9` | feat(date-picker)!: family cut | 8 |
| `f32287e2c` | feat(core): the app-shell/action-dock class hooks open their migration window (WO-FAM-11) | 8 |
| `179da599a` | feat(tooltip)!: family cut | 8 |
| `a9e48ebc1` | feat(dialogs)!: family cut | 7 |
| `4e405dd0d` | feat(auto-complete)!: family cut | 7 |
| `bb29b085b` | feat(core): FAM-10 sub-lot G - surface-lifecycle cut | 7 |
| `75d77e375` | feat(modal)!: family cut | 7 |
| `3aea57452` | feat(card): family cut with the title-color terminal painted | 6 |
| `e0706a04f` | feat(time-picker)!: family cut | 6 |
| `37063a7ed` | feat(sheet)!: family cut | 5 |
| `93a483107` | feat(color-picker)!: family cut | 4 |
| `7e13ee2e0` | feat(core): FAM-10 sub-lot D2 | 4 |
| `35d57712a` | feat(mentions)!: family cut | 3 |
| `c43433737` | fix(data-table): the family's typography reads name the produced --ds-type-* channels | 3 |
| `596791197` `32b2da644` `a4a8b6f2e` `c6b4a40e1` `0d154c0d4` `cea31faca` `011910356` `3f0841553` | tree-select, kanban-board, notifier, select, popover, skeleton, tabs/breadcrumb/pagination, transfer | 2 each |
| `ae25253e3` `89e4920a5` `b43b9b7e9` `b1134dded` `0c2111e87` `9d64c294f` `dc770e967` `85e8dc70b` `4df42e483` `eabf62987` `9d924e9f2` `414e37eb8` `83a4a0810` `65512d14d` `eb390ee9e` | cascader, checkbox, tour, overlay kernel + z-index scale, dead-writer retirement, phantom disabled-opacity, drawer, radio, selection-family root, menu, controls, textarea, R17 DT regeneration, message layer-door, alert z-index | 1 each |

Two deaths were announced in their own commit message and simply never reached
this ledger:

- `--ds-z-message` / `--ds-z-notification` - `b1134dded` retired both aliases
  when the one z-index scale landed; the surviving mentions are the z-index
  header's own prose explaining the retirement.
- `--ds-density-card-padding-spacious` - `0c2111e87` states "the manifest rows
  retire together". They did. The ledger's did not, because nothing makes them.

## OUT-OF-SCOPE - 4 rows

The contract's `EXCLUDED_PATH` deliberately refuses `facade/artifacts`,
`tests`, `fixtures` and `stories` ("Generated snapshots, fixtures and tests
never speak for DS ownership"), and it scans only
`src/foundation/tokens/css/**.css` plus `src/components/**.{ts,tsx}`. These four
names are still read somewhere - just never anywhere the fence looks. The
table names each read's **origin**, not the artifact or test where a scan
happens to trip over it first:

| name | surviving read (origin) | attributed to |
| --- | --- | --- |
| `--ds-steps-label-color-wait` | the stepper chrome deriver, `infrastructure/compilers/runtime/theme/runtime/lowering/runtime/derivation/chrome/stepper/index.ts:161`, which emits `var(--ds-steps-label-color-wait, var(--ds-color-text-secondary))` as the right-hand side of `--ds-stepper-label-color-wait`. The three `facade/artifacts/*` bundles carry the same text because they are that deriver's compiled output - they are the shadow, not the read | `1ddfd6198` (steps merge), artifacts at `9a6aed854` |
| `--ds-density-card-padding-comfortable` | `foundation/tokens/ts/foundation/base/density/index.ts:96`, the comfortable preset's `cardPadding` | `0c2111e87` |
| `--ds-density-card-padding-compact` | `foundation/tokens/ts/foundation/base/density/index.ts:104`, the compact preset's `cardPadding` | `0c2111e87` |
| `--ds-table-cell-line-height` | one data-table lowering integration test; the deriver names it only in its docblock. This one has no production origin | `cefa1becc` |

Three of the four are **real production reads**, not residue. The stepper
deriver's read reaches every tenant through compiler emission; the two density
preset reads reach the screen through `densityPreset.cardPadding`, which metric
cards apply as an inline `padding`
(`components/structures/dashboard/insights/presentation/metrics/cards/index.tsx:154`)
and the collection-workspace surface publishes as `--ds-density-card-padding`.
The contract cannot see either shape by design: one is the right-hand side of a
compiler emission, the other is a string in a TS token module, and the fence
scans CSS files and component sources.

This is the one place the drain is a judgement rather than an arithmetic fact,
so it is stated plainly: **the fence's scope is the contract's, not this
ledger's.** A read the hook contract will never classify cannot have an
"unadjudicated read" row, because the gate's set-equality would reject it the
moment it were written back.

## Why FENCE-PENDING is zero, and how that was proved

The dangerous failure mode of a drain like this is deleting a row whose read is
alive and in scope - that would silently un-govern a real read. Two independent
measurements say it did not happen:

- **Forward:** of the 1331 extra rows, exactly 0 have a `var()` read in an
  in-scope file. 962 have in-scope reads but are owned (so they are adjudicated,
  not unadjudicated); 365 have no read at all; 4 read only out of scope.
- **Reverse:** all 1272 surviving rows have a live in-scope `var()` read -
  1272/1272, measured with the contract's own exclusion rule. No survivor is a
  ghost, and no name in the fence is unrepresented (`missing = 0`).

`--ds-steps-label-color-wait` is the single row that looked like a fence
omission: it originates in the stepper chrome deriver
(`.../derivation/chrome/stepper/index.ts:161`) and therefore appears by name in
all three compiled tenant bundles. It is not an omission - the deriver is not a
scan root, and `facade/artifacts` is excluded by the contract on purpose, with
the comment "a name-only test would silently admit every generated artifact -
exactly the circularity this module exists to prevent". Feeding a compiled
artifact back into the ownership derivation would let the compiler's own output
vouch for the compiler.

## What this lot did NOT touch

- `contracts/css/hooks/index.json` - not edited. No fence-side additions were
  owed, and the manifest is a produced artifact anyway.
- `scripts/check/tokens/cascade/reads/index.mjs` - not edited. The gate went
  green by the ledger becoming true, not by the assertion becoming weaker; all
  three drills (`missing`, `invalid-class`, `stale-digest`) still fire one
  violation each.
- No skin, engine, deriver or component source. No row demanded a source fix.

## Gate

```
$ node packages/core/scripts/check/tokens/cascade/reads/index.mjs --check
reads-adjudication OK - 1272 reads owned, 0 without owner
  (MODERN_PRIVATE=726 FROZEN_ENGINE_SCOPED=481 TENANT_FACING_CANDIDATE=55 FOUNDATION_SHARED=10)
```

## Residuals - routed, not touched

1. **`claim-exactness` pin owed.** The exactness-live artifacts
   (`artifacts/quality/certification/claims/exactness-live/{provenance,evidence}/index.json`)
   pin this ledger as an audit input at 1,470,103 bytes /
   `23ea54ea...`; it is now 745,283 bytes / `24c90cec...` (figure corrected at the
   reseal ceremony's Fable confirmation). They are generated
   files and were not hand-edited. Verified by A/B that this is not a new red:
   with the ledger restored to its HEAD bytes, `claim-exactness:check` already
   throws on the WO-GAT-07 documentation seal (`a922085d` past the sealed
   `7a48d931c`) and never reaches the file pins. The re-pin rides with the
   reseal ceremony.
2. **109 surviving rows cite evidence that has moved.** Of the 719 kept rows
   whose `evidence` carries a file path, 91 name a file that no longer exists
   (58 of them `presentation/components/semantic-surface.css`) and 18 name a
   file that no longer contains the property. All 109 still have a live in-scope
   read, so this is citation drift, not phantom rows, and the gate does not
   test it (it requires evidence to be non-empty, not current). Repairing them
   is a re-adjudication - each row's class was decided against a site that no
   longer exists - and belongs to the owner's classification authority, not to a
   drain. Routed as its own packet.
3. **The ledger still has no producer.** This drain is a one-shot repair; the
   next `hooks:generate` starts the same drift again. A `reads:merge --write`
   that re-derives rows from the manifest and carries forward every existing
   classification by name would make the gate's staleness self-healing. Routed
   as its own work order. One pre-existing prose defect rides with it, noted
   here and deliberately not fixed in this lot: the ledger's
   `leadDecisions.bareReadsWithoutFallback` still says "25 rows flagged
   has-bare-read-without-fallback", and at HEAD **0** rows carry that flag while
   164 carry `_audit.bare > 0`. It predates this drain and its repair is a
   re-derivation, not a row move.
4. **Always-fallback names in a compiler/TS read.**
   `--ds-density-card-padding-{comfortable,compact}` and
   `--ds-steps-label-color-wait` are each read with a fallback - the first two
   by `density/index.ts`, the third by the stepper chrome deriver - and nothing
   declares any of them. They were **never declared**. What `0c2111e87` retired
   in the data-table-mobile skin were three declarations of a different name,
   the measured dead writer `--ds-density-card-padding`, whose right-hand side
   happened to *read* the `-{compact,comfortable,spacious}` spellings. The
   preset's and the deriver's own fallbacks have governed the painted value
   throughout, so **no pixel moved and there is no regression** - the reads are
   simply decorative. The fix is a deriver/preset cleanup outside this lot's
   write set, and both cases route together as one "always-fallback name in a
   compiler/TS read" packet.
