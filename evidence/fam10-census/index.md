---
title: "WO-FAM-10 census: forms, record surfaces and the headers, measured before any code moves"
date: 2026-09-18
status: census + batching proposal (B0 packet; NO product code written)
work-order: WO-FAM-10
base: b23ac47a952f1937d18d64761dac74f772573b05 (main, /Users/daniel/Developer/Rottay/r4-recon-opus)
still-valid-at: e9e042279f5044ac6708d05740fdabe383207453 (the charts lot landed mid-packet;
  its 9 changed files are `patterns/visualization/charts/**` and two chart scripts --
  zero intersection with this census's read path, verified by `git diff --name-only`)
writer: Opus (claude-admin profile)
auditor: Kimi (DT/coordinator)
write-set: evidence/fam10-census/ ONLY
---

# WO-FAM-10 census

This packet measures the WO-FAM-10 families against the work order's own
acceptance gate and proposes the batching. It writes no product code, moves no
file, touches no roster, no baseline and no `roadmap/`.

## 0. Method and provenance

Every number below is the output of an instrument that already owns the
measurement, never a second count of the same thing:

- `packages/core/scripts/check/family-cut/index.mjs` — `resolveFamily`,
  `measureFamily`, `countExecutableA11yAssertions` (BLOCKING arms, ratchets,
  denominators, anatomy census, skeleton arm, adapt-slot arm).
- `packages/core/scripts/check/engine/read-without-producer/index.mjs` —
  `classifyReadWithoutProducer` (channels read, channels with no producer).
- `packages/core/scripts/libraries/tokens/producers/index.mjs` —
  `collectChannelProducers` (the producer set, computed once and shared).
- `packages/core/scripts/libraries/theme-catalog/index.mjs` — `readThemeCatalog`
  (control fan-out).
- `packages/core/src/foundation/contracts/kernel/adaptation/composition/families/registry/index.ts`
  — `LAYOUT_SENSITIVE_FAMILIES`.

Two of the numbers required a deviation, declared here because it changes how
they must be read. The family-cut gate resolves a family to its owner by walking
`src/components` and skipping any directory below a `compound|engines|contracts|
tests|runtime|foundation|composition|presentation` segment. That walk cannot see
`src/components/surfaces/presentation/pages/**` at all (finding S1), and it
pools colliding basenames (finding S2). So for the four form surfaces and for
the four contaminated header rows the measurement was taken by handing
`measureFamily` a `resolved` object built from the family's real owner directory
and its real skin. That is the same analyzer on an honest input, not a second
instrument. Every such row is marked ISOLATED in the table.

Working tree at measurement time carried another writer's in-flight chart edits
(`patterns/visualization/charts/**`, `contracts/css/hooks/index.json`,
two untracked `scripts/` dirs). None of them is in this cut's read path.

---

## 1. Headline

| Quantity | Measured |
|---|---|
| Families in scope | 23 source owners / 21 skin files |
| Channels read by the cut's skins (union) | **347** |
| Of those, read with no producer (union) | **123** (35.4 %) |
| Families that already have a chrome deriver | **0 of 23** |
| Controls in the typed catalog that declare any of these families in their fan-out | **0 of 29** |
| Shared-kernel adoptions across the whole cut | **1** (`workbench-header` uses `useOptionalDirection`) |
| Families declared layout-sensitive | **0**, against 46 own `@media` breakpoints and 21 own `@container` queries |
| Families stamping `data-posture` | **0** |
| `style={{ }}` paint violations (BLOCKING) | **155** |
| Colour literals in source (BLOCKING) | **8** |
| Colour literals in skins | **0** |
| Hand-written skeleton constructs (BLOCKING) | **105** across 8 families |
| `data-part` values the shared skeleton renderer has no role for (BLOCKING) | **310** (per-family counts; names repeat across families) |
| `data-part` stamped and never painted | **118** |
| State pseudo-classes with no `data-state` twin | **74** |
| Families with no executable a11y assertion (BLOCKING) | **3** as batched (8 if the record blocks are cut individually) |
| Families currently pinned in `baseline/index.json` | **0 of 23** |

The union figures are unions, not sums: summing the 21 files gives 730/129
because shared roots are read by many skins. `347/123` is the honest corpus.

Of the 123 unproduced names, **100** are in a family's own namespace (the cut's
own work) and **23** are foreign-namespace or root reads that no FAM-10 sub-lot
can produce (listed in section 4).

---

## 2. Three structural findings that gate the whole cut

These are not per-family debt. Each one blocks the work order as written, and
each has to be adjudicated before a writer opens a file.

### S1 — The four form surfaces are invisible to the acceptance gate

`NESTED_OWNER_SEGMENT` in the family-cut gate skips any directory below a
`presentation/` segment. For `primitives/` and `patterns/` that is correct:
`presentation/` there is a sub-owner. For `surfaces/` it is not — the surfaces
tier's declared dependency branches are `foundation/`, `runtime/`,
`composition/layout/` and `presentation/pages/`, so `presentation/` is a
*top-level* branch and every page owner lives below it.

Measured: **256** owner directories exist under `src/components`; exactly **1**
is under `surfaces/` (the tier root itself). **80** directories under
`surfaces/presentation/pages/` are excluded. No family in the current 77-row
roster resolves to a `surfaces/` owner — `sidebar-surface`, the one roster row
whose name says "surface", is a structure at
`structures/shell/navigation/sidebar-surface`. There is no precedent to copy.

Consequence, measured both ways on `guided-draft-form`:

| | as the gate sees it | ISOLATED (real owner dir) |
|---|---|---|
| `sourceFiles` | 0 | 1 |
| `partsStamped` | 0 | 53 |
| `partsConsumedNotStamped` | **31** | **0** |
| `partsStampedNotConsumed` | 0 | **22** |
| `inlineStyleViolations` | 0 | **5** |
| `skeleton.partsWithoutRole` | 0 | **46** |

The gate's reading is not merely incomplete, it is inverted: it reports 31 parts
painted-and-never-stamped that are in fact stamped, and reports zero of the 5
BLOCKING inline paint violations and 46 missing skeleton roles that are really
there. Pinning these four families today would pin fiction.

**Decision owed before sub-lot A opens:** either (a) teach the owner walk that
`presentation/` under `surfaces/` is a branch, not a sub-owner, or (b) pin
`owner:` on each surface row and widen the walk for pinned owners only. This is
an instrument change to a shared acceptance instrument, so it is singleton-owned
and it lands first, alone, with its own planted-red drill.

### S2 — Skins and owners are named differently across this whole cut, and the gate keys on the owner

The gate derives the family id from the owner's basename and then matches skins
by name prefix. In this cut the two disagree systematically, and because of S1
the foreign-skin filter cannot defend itself: `foreignCompoundReason` excludes a
sibling skin only when that sibling *has its own component owner*, and the
surface owners do not exist as far as the walk is concerned.

Measured mis-attributions and collisions:

| Gate family id | Resolves to | Really is |
|---|---|---|
| `form` | 2 owners: `primitives/inputs/form` + `structures/headers/form` | pinned row already carries `owner: primitives/inputs/form`, so **`structures/headers/form` is measured by no family at all** |
| `dashboard` | 2 owners: `structures/dashboard` + `structures/headers/dashboard` | the 183 `style={{ }}` violations it reports are `structures/dashboard/insights/**`, not the header; the header itself has 0 |
| `collection` | `structures/headers/collection` | but swallows `skin/collection-workspace` and `skin/collection-workspace-render-dispatch` — another cut's surface |
| `detail` | `structures/headers/detail` | but swallows `skin/detail` (DetailSurface) and `skin/detail-form-surface` |
| `header-surface` | `structures/headers/header-surface` | its skin is named `layout-header`, so the gate measures it with **0 skins** |
| `surface-lifecycle` | `structures/feedback/surface-lifecycle` | its skin is named `surface-states`, so the gate measures it with **0 skins** |
| `summary-strip`, `field-grid`, `field`, `action-bar`, `panel` | one owner each | all five share `skin/record/index.css`, so each measures **0 skins** and fails `skinReadsAnatomy` BLOCKING |

`skin/detail/index.css` and `skin/dashboard/index.css` self-identify in their
own file headers as "DetailSurface skin" and "DashboardSurface skin". They are
not this cut's files.

**Decision owed:** the cut declares its family ids and pins `owner:` on every
row where the basename is ambiguous. My proposal is in section 5.

### S3 — The cut has no contract to consume yet

- **Derivers:** 71 chrome derivers exist. **None** is for a FAM-10 family. The
  one named `form` belongs to the primitive (WO-FAM-02) and already owns the
  `--ds-form-*` namespace — the header family cannot be called `form`.
- **Catalog fan-out:** across the 29 typed control rows, `minimumFamilies`
  names **no** FAM-10 family. The template's section 1.6 asks the cut to state
  which decisions declare this family; today the answer is "none", so the cut
  must *add* rows to the catalog — a singleton-owned core contract (WO-CAT-02).
- **One live fan-out obligation exists and is unmet:** `surfaces.border-style`
  declares `panel` and `structures/record/panel` reaches **none** of its three
  channels (`--ds-edge-hairline-width`, `--ds-edge-standard-width`,
  `--ds-edge-emphasis-width`). `fanOutUnreached = 1`.
- **`responsive.posture`** declares `families: []`. The control that would carry
  the adapt slot reaches nothing.
- **Layout sensitivity:** `LAYOUT_SENSITIVE_FAMILIES` has 10 rows and none names
  WO-FAM-10. Meanwhile the cut's skins carry **46** hand-written `@media`
  breakpoints and **21** `@container` queries and stamp `data-posture` zero
  times. The R4 amendment clause 1 ("a layout-sensitive family of this cut that
  does not expose `adapt` and stamp `data-posture` is not done") therefore first
  requires a *declaration* decision, in a shared registry the adapt-slot gate
  reads with the TypeScript AST.

---

## 3. Per-family census

Legend. `RWP` = channels read with no producer / channels read. `inline` =
BLOCKING `style={{ }}` violations. `lits` = BLOCKING colour literals in source
(skins are 0 everywhere). `SNC` / `CNS` = `data-part` stamped-not-consumed /
consumed-not-stamped. `pseudo` = unpaired state pseudo-selectors. `skel` =
hand-written skeleton constructs / `data-part` values with no renderer role.
`a11y` = executable a11y assertions. ISOLATED rows were measured against the
real owner directory per section 0.

### 3.1 The four form surfaces (all ISOLATED; gate-blind today)

| Family | Owner | Skin | RWP | inline | lits | SNC / CNS | pseudo | kernels | adapt | skel | a11y |
|---|---|---|---|---|---|---|---|---|---|---|---|
| `form-surface` | `surfaces/presentation/pages/forms/form` | `skin/form-surface` | 1/3 | 0 | 0 | 4 / 0 | 0 | none | not declared | 0 / 1 | 3 |
| `wizard-surface` | `.../forms/wizard` | `skin/wizard-surface` | 0/2 | 0 | 0 | 3 / 0 | 0 | none | not declared | 0 / 1 | 12 |
| `detail-form-surface` | `.../forms/detail-form` | `skin/detail-form-surface` | 0/2 | 0 | 0 | 2 / 0 | 0 | none | not declared | 0 / 1 | 2 |
| `guided-draft-form` | `.../forms/guided-draft-form` | `skin/guided-draft-form` | 0/29 | **5** | 0 | **22** / 0 | 0 | none | not declared | **8 / 46** | **0** |

Three of the four skins (`form-surface`, `wizard-surface`,
`detail-form-surface`) select classes and never `[data-part]`:
`skinReadsAnatomy = false`, BLOCKING. Their skins read 3, 2 and 2 channels
respectively — these are near-empty shells, and the anatomy contract has to be
built, not drained. `guided-draft-form` is the opposite: 53 stamped parts, 29
channels, 5 inline `fontWeight` paints and 8 hand-written skeleton constructs.

### 3.2 The record blocks

| Family | Owner | Skin | RWP | inline | lits | SNC / CNS | pseudo | kernels | adapt | skel | a11y |
|---|---|---|---|---|---|---|---|---|---|---|---|
| `record` (umbrella) | `structures/record` (8 src files) | `skin/record` | 1/32 | 11 | 0 | **65** / 0 | 7 | none | not declared | **20 / 77** | 23 |
| ` - summary-strip` | `structures/record/summary-strip` | *(shares `skin/record`)* | 0/0 | 0 | 0 | 8 / 0 | 0 | none | not declared | 4 / 6 | **0** |
| ` - field-grid` | `structures/record/field-grid` | *(shares)* | 0/0 | 1 | 0 | 1 / 0 | 0 | none | not declared | 0 / 1 | **0** |
| ` - field` | `structures/record/field` | *(shares)* | 0/0 | 1 | 0 | 13 / 0 | 0 | none | not declared | 4 / 9 | **0** |
| ` - action-bar` | `structures/record/action-bar` | *(shares)* | 0/0 | 0 | 0 | 5 / 0 | 0 | none | not declared | 0 / 5 | **0** |
| ` - panel` | `structures/record/panel` | *(shares)* | 0/0 | 0 | 0 | 1 / 0 | 0 | none | not declared | 0 / 0 | **0** |
| `form-sections` | `structures/record/form-sections` | `skin/form-sections` | 1/43 | 1 | 0 | 0 / 0 | 3 | none | not declared | 8 / 30 | 3 |
| `edit-fields` | `structures/record/edit-fields` | `skin/edit-fields` | 2/27 | 8 | 0 | 2 / 0 | 0 | none | not declared | 0 / 34 | 20 |

`panel` carries the cut's only live `fanOutUnreached = 1`
(`surfaces.border-style`).

The five indented blocks cannot be cut as independent families without splitting
`skin/record/index.css` five ways: each measures 0 skins today and fails
`skinReadsAnatomy` BLOCKING for that reason alone. The barrel's own doctrine
already says the opposite of a split — every block root stamps
`data-structure='record'` and "all static geometry lives in
`presentation/components/skin/record/index.css`". Cut `record` as one family.

### 3.3 The 12 headers

The work order says "the 12 headers". Measured, the header roster is **10
component owners plus 2 shared paint files = 12 skin owners**. That is the
reading I use; if the DT intends a different 12, this is the row to correct.

| Family | Owner | Skin | RWP | inline | lits | SNC / CNS | pseudo | kernels | adapt | skel | a11y |
|---|---|---|---|---|---|---|---|---|---|---|---|
| `collection-header` (ISOLATED) | `structures/headers/collection` | `skin/collection-header` | **22**/78 | **104** | 0 | 3 / 0 | 4 | none | not declared | 10 / 12 | 2 |
| `dashboard-header` (ISOLATED) | `structures/headers/dashboard` | `skin/dashboard-header` | 16/73 | 0 | 0 | 0 / 0 | 2 | none | not declared | 0 / 13 | 5 |
| `detail-header` (ISOLATED) | `structures/headers/detail` | `skin/detail-header` | **31**/79 | 4 | 0 | 0 / 0 | 7 | none | not declared | 0 / 21 | 4 |
| `edit-header` (ISOLATED) | `structures/headers/edit` | `skin/edit-header` | 6/47 | 0 | **1** | 2 / 0 | 1 | none | not declared | 0 / 22 | 3 |
| `form-header` (ISOLATED) | `structures/headers/form` | `skin/form-header` | 6/47 | 0 | **1** | 3 / 0 | 0 | none | not declared | 0 / 15 | 1 |
| `header-surface` (ISOLATED) | `structures/headers/header-surface` | `skin/layout-header` | 0/0 | 0 | 0 | 1 / 0 | 0 | none | not declared | 0 / 0 | 18 |
| `mobile-header` | `structures/headers/mobile-header` | `skin/mobile-header` | 3/17 | 1 | 0 | 1 / 0 | 4 | none | not declared | 0 / 4 | 3 |
| `stats-header` | `structures/dashboard/stats-header` | `skin/stats-header` (+ `-keyframes`) | 9/28 | 1 | 0 | 0 / 1 | 12 | none | not declared | 6 / 14 | **0** |
| `cockpit-header` | `patterns/shell/cockpit-header` | `engines/modern/skin/cockpit-header` | 11/89 | 0 | 0 | 0 / 0 | 10 | none | not declared | **19** / 8 | 12 |
| `workbench-header` | `patterns/shell/workbench-header` | `engines/modern/skin/workbench-header` | 9/90 | 0 | 0 | 0 / 0 | **20** | **`useOptionalDirection`** | not declared | **25** / 6 | 9 |
| `header-hero-shared` | *(no component owner; painted by `form-header` + `edit-header`)* | `skin/header-hero-shared` | 4/15 | n/a | n/a | n/a | **4** | n/a | n/a | n/a | n/a |
| `stats-header-keyframes` | *(support of `stats-header`)* | `skin/stats-header-keyframes` | 0/0 | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a |

`mobile-header` and `section-frame` each carry 1 `legacyNamespaceClasses` — the
only non-`ds-` classes in the cut. Every family has exactly one class vocabulary
where it has any; no `rottay-*` growth risk here.

`stats-header`'s 12 and `workbench-header`'s 20 unpaired state pseudo-selectors
are the cut's largest F-37 debt.

### 3.4 section-frame and surface-lifecycle

| Family | Owner | Skin | RWP | inline | lits | SNC / CNS | pseudo | kernels | adapt | skel | a11y |
|---|---|---|---|---|---|---|---|---|---|---|---|
| `section-frame` | `structures/headers/section-frame` | `skin/section-frame` | **0**/12 | 0 | 0 | 8 / 0 | 0 | none | not declared | 0 / 4 | **0** |
| `surface-lifecycle` (ISOLATED) | `structures/feedback/surface-lifecycle` | `skin/surface-states` | 7/17 | **20** | **6** | 2 / 5 | 0 | none | not declared | 9 / 1 | 7 |

`section-frame` is the cleanest family in the cut: every channel it reads has a
producer. Its only debt is 8 unpainted parts, 4 missing skeleton roles and no
a11y assertion at all (0 test files).

`surface-lifecycle` is the densest per line: all 20 inline paints and all 6
colour literals live in one file,
`surface-lifecycle/error-boundary/index.tsx`. An error boundary paints itself
inline so it still renders when everything else has failed — that is a real
product constraint the cut has to answer deliberately (a static fallback rule in
the skin, not a deletion), not sweep.

---

## 4. The 23 reads no FAM-10 sub-lot can produce

These are read by the cut's skins and produced by nobody, but they are not in a
FAM-10 namespace. They must be routed to their owner, not invented locally —
inventing a local producer is exactly the "second authority" the cascade rule
forbids.

| Group | Names | Route to |
|---|---|---|
| material arms (2) | `--ds-material-inset-highlight`, `--ds-material-raised-shadow-selected` | the material/derivation lane — the cut is required to *consume* material states, so this is an upstream gap |
| `kbd` (7) | `--ds-kbd-depth`, `-depth-width`, `-font-family`, `-font-weight`, `-frame`, `-ink`, `-radius`, `-surface` | the `kbd` owner; read by `collection-header`'s search hint |
| `capability` (4) | `--ds-capability-anatomy-label-tracking`, `--ds-capability-cell-min-size`, `--ds-capability-disabled-opacity`, `--ds-capability-opacity` | `structures/feedback/capability-anatomy` (a separate family, not lifecycle) |
| `workspace-card` (4) | `--ds-workspace-card-gap`, `-icon-bg`, `-icon-border`, `-icon-color` | the workspace/collection-workspace cut |
| `stale-banner` (2) | `--ds-stale-banner-padding-block`, `-padding-inline` | in scope — `surface-lifecycle` owns `SurfaceStaleBanner`; rename into the family namespace |
| roots (4) | `--ds-control-height-sm`, `--ds-size-touch-target`, `--ds-loading-skeleton-header-height` | the token/root lane |

Only the 2 `stale-banner` names are this cut's to fix by renaming. The other 21
are cross-lot and must be named in the WO's progress trail as routed, with the
residual read count stated rather than hidden.

---

## 5. Proposed batching

Six sub-lots. The ordering is forced by one rule: **every shared contract lands
before any family that consumes it**, and no two sub-lots ever open the same
file.

### Singleton-owned files (exactly one sub-lot may touch each)

| File | Owner sub-lot | Why it is a singleton |
|---|---|---|
| `scripts/check/family-cut/index.mjs` (owner walk) + `index.test.mjs` | **A** | shared acceptance instrument; S1's fix |
| `scripts/check/family-cut/baseline/index.json` | **A** opens it, then each sub-lot appends its own rows in its own commit, serialized by the DT | one file, decrease-only law, re-pins must be the gate's own output |
| `src/contracts/theme/runtime/catalog` | **A** | WO-CAT-02 core contract; the control catalog is the single listing |
| `foundation/contracts/kernel/adaptation/.../families/registry/index.ts` | **A** | AST-read array literal; the adapt-slot gate's roster |
| `.../lowering/runtime/derivation/index.ts` (deriver registration) | **A** creates the block; each sub-lot adds its own line, serialized | rank collisions are the failure mode |
| `primitives/feedback/skeleton/runtime/anatomy-renderer` (`SKELETON_PART_ROLES`) | **B** | 310 role gaps across the cut all land in one vocabulary |
| **the header contract** — `getVariantTone` + the hero tone shape | **C** | see below |

**The header contract is singleton-owned by sub-lot C, and its home is
`src/components/structures/foundation/chrome/`.** Measured: `getVariantTone` has
exactly **two** implementations, `structures/headers/form/index.tsx:132` and
`structures/headers/edit/index.tsx:145`, and their bodies are byte-identical —
they differ only in the parameter's union type (`edit` admits `'error'`,
`form` does not). Each copy carries one of the cut's two source colour literals
(the `color-mix(...)` secondary arm), so extracting once removes both BLOCKING
literals in one move. The CSS half of this contract is already shared and already
says so: `skin/header-hero-shared/index.css`'s own header records that
`buildPatternStyle` and `getVariantTone` are "proven byte-identical between the
two". `structures/foundation/chrome/` is the existing structures-tier foundation
owner (it already holds `contracts`, `runtime/access`, `runtime/errors`,
`runtime/i18n`, `runtime/profile-defaults`); a header contract placed anywhere
inside `structures/headers/<family>/` would make one header family a dependency
of its peers, which `structure:check` refuses as a sibling-owner dependency.

### The sub-lots

**Sub-lot A — instrument and shared contracts. No family.**
Write set: `scripts/check/family-cut/index.mjs`, `.../index.test.mjs`,
`.../baseline/index.json`, `src/contracts/theme/runtime/catalog/**`,
`foundation/contracts/kernel/adaptation/composition/families/registry/index.ts`,
`.../lowering/runtime/derivation/index.ts`.
Delivers: the S1 owner-walk decision with a planted-red drill proving a
`surfaces/presentation/pages/**` owner is now resolved and a forbidden one still
fails; the family-id and `owner:` pin decisions from S2; the catalog rows that
declare this cut's families; the `LAYOUT_SENSITIVE_FAMILIES` rows. Lands alone,
audited independently, before anything else opens.
Blocks: everything. This is the only sub-lot that may not run in parallel.

**Sub-lot B — the skeleton role vocabulary. No family paint.**
Write set: `primitives/feedback/skeleton/runtime/anatomy-renderer/**` and its
tests. Delivers roles for the cut's 310 part-role gaps. Must land before any
family commits its anatomy, because the `anatomy-derived-skeleton` arm is
BLOCKING and a family that stamps a roleless part fails on its own commit.
Runs immediately after A; disjoint from C/D/E/F.

**Sub-lot C — the header contract plus the two families that prove it.**
Families: `form-header`, `edit-header`.
Write set: `structures/foundation/chrome/**` (new contract owner),
`structures/headers/form/**`, `structures/headers/edit/**`,
`skin/form-header/**`, `skin/edit-header/**`, `skin/header-hero-shared/**`,
`derivation/chrome/form-header/**`, `derivation/chrome/edit-header/**`.
Why first among the families: it is the smallest pair (47 channels and 6 RWP
each, plus the shared `header-hero-shared` at 15/4 and its 4 unpaired
pseudo-selectors; 0 inline paint) and it is the only pair that shares a contract, so it
proves the extraction with two consumers before ten more families depend on it.
Also clears both source colour literals.

**Sub-lot D — the remaining headers.**
Families: `collection-header`, `dashboard-header`, `detail-header`,
`mobile-header`, `header-surface`, `stats-header`, `section-frame`.
Write set: `structures/headers/{collection,dashboard,detail,mobile-header,header-surface,section-frame}/**`,
`structures/dashboard/stats-header/**`, the seven matching skins (note
`header-surface`'s skin is `layout-header` and `stats-header` also owns
`stats-header-keyframes`), and `derivation/chrome/<family>/**` for each.
Largest sub-lot by debt: 81 RWP, 110 inline paints (104 of them in
`collection-header` alone), 29 unpaired pseudo-selectors. If the DT wants it
split, the clean seam is `collection-header` alone (its 104 inline paints are
half the cut's total) against the other six; the write sets stay disjoint.
Depends on C for the header contract.

**Sub-lot E — the shell headers.**
Families: `cockpit-header`, `workbench-header`.
Write set: `patterns/shell/cockpit-header/**`, `patterns/shell/workbench-header/**`,
`engines/modern/skin/{cockpit,workbench}-header/**`, their derivers.
Separated from D because these two are the only cut families whose skins live in
`engines/modern/skin/` rather than `presentation/components/skin/`, and they
carry 44 of the cut's 105 hand-written skeleton constructs and 30 of its 74
unpaired pseudo-selectors. Fully disjoint from C and D; may run in parallel with
D once C has landed.

**Sub-lot F — record and the form surfaces (the ledger doctrine).**
Families: `record` (one family, five blocks), `form-sections`, `edit-fields`,
`form-surface`, `wizard-surface`, `detail-form-surface`, `guided-draft-form`.
Write set: `structures/record/**`, `surfaces/presentation/pages/forms/**`,
`skin/{record,form-sections,edit-fields,form-surface,wizard-surface,detail-form-surface,guided-draft-form}/**`,
their derivers.
Kept as one sub-lot deliberately: the work order's step 4 is "forms stop being
card stacks", and the record blocks, the section containers and the four form
surfaces are the same doctrine applied to one page. Splitting record from the
surfaces would let the two halves disagree about the same page rhythm, which is
the failure the family-cut template exists to prevent. Depends on A (it is
unmeasurable without S1) and on B.
Carries: the `panel` fan-out obligation, the 2 `stale-banner` renames, the
`error-boundary` inline-paint question, and the 3 a11y-assertion gaps that are
truly missing (`guided-draft-form`, plus `section-frame` in D and `stats-header`
in D).

**Sub-lot G — `surface-lifecycle`.**
Write set: `structures/feedback/surface-lifecycle/**`, `skin/surface-states/**`,
`derivation/chrome/surface-lifecycle/**`.
Split out from F because its one real question — whether an error boundary may
paint inline so it renders when the stylesheet is the thing that failed — is a
product decision the DT should rule on separately, and because its skin name
(`surface-states`) is one of the S2 renames. Disjoint from everything; may run
in parallel with D/E/F.

### Order

```
A  (alone, blocking)
|
+-- B  (alone, blocking for anatomy)
      |
      +-- C  (header contract + 2 families)
      |     |
      |     +-- D  (7 headers)          -- parallel with E, F, G
      |     +-- E  (2 shell headers)    -- parallel with D, F, G
      |
      +-- F  (record + 4 form surfaces) -- parallel with D, E, G
      +-- G  (surface-lifecycle)        -- parallel with D, E, F
```

Four writers can run concurrently after C. Every baseline re-pin and every
`derivation/index.ts` registration line is serialized through the DT, one commit
per sub-lot, per the operating model.

---

## 6. What this census does not answer

Stated so nobody reads silence as a green.

- **The "12 headers" roster.** I measured 10 component owners + 2 shared paint
  files. If the work order's 12 means something else, section 3.3 is the row to
  correct and sub-lots D/E change size.
- **Whether `record` should be one family or five.** I recommend one, on the
  evidence of one shared skin, one `data-structure='record'` specificity hook
  and the barrel's own stated doctrine. It contradicts that same barrel's "five
  families, one folder each" sentence. This is a DT ruling, not a measurement.
- **Which families are layout-sensitive.** 46 breakpoints and 21 container
  queries prove the families *behave* responsively; which of them must declare
  `adapt` is an owner decision that belongs in sub-lot A.
- **No browser evidence.** Every number here is static. Causality probes, axe
  runs and first-paint claims need a rendered DOM and are each sub-lot's own
  acceptance work.
- **No file was moved, renamed, staged or committed.** The working tree is
  unchanged apart from this file.

---

## 7. Appendix — the totals row, and how to re-derive it

One row per cut family (19 rows: `record` as one umbrella; `header-hero-shared`
and `stats-header-keyframes` are support skins with no component owner and are
counted once, in section 3.3, not here). Frozen `engines/classic` and
`engines/rustic` files are excluded, as the gate's own `isFamilySource` excludes
them — including them inflates `cockpit-header` to 48 inline paints and
`workbench-header` to 30, all of them in files this cut may not touch.

| | inline | src literals | hand-made skeletons | parts w/o role | SNC | CNS | states CNS | unpaired pseudo | legacy classes | skin colour literals | families with 0 a11y |
|---|---|---|---|---|---|---|---|---|---|---|---|
| **cut total** | **155** | **8** | **105** | **310** | **118** | **6** | **5** | **70** | **2** | **0** | **3** |

`header-hero-shared` adds **4** more unpaired state pseudo-selectors when it is
attributed to a family, bringing the cut's pseudo total to **74**.

Reproduce:

```bash
cd packages/core

# owner resolution and per-family measurement (the gate's own exports)
node -e "import('./scripts/check/family-cut/index.mjs').then(m=>console.log(m.resolveFamily('collection').ownerCandidates))"
node scripts/check/family-cut/index.mjs --family=<family> --json

# channels read / channels with no producer, per skin file or per union
node -e "Promise.all([import('./scripts/check/engine/read-without-producer/index.mjs'),import('./scripts/libraries/tokens/producers/index.mjs')]).then(([r,p])=>console.log(r.classifyReadWithoutProducer([<skin files>],p.collectChannelProducers().producers)))"

# catalog fan-out
node -e "import('./scripts/libraries/theme-catalog/index.mjs').then(c=>{for(const r of c.readThemeCatalog())console.log(r.id,JSON.stringify(r.minimumFamilies))})"

# layout-sensitive roster
sed -n '23,90p' src/foundation/contracts/kernel/adaptation/composition/families/registry/index.ts

# own breakpoints per skin
grep -c "@media\|@container" src/foundation/tokens/css/presentation/components/skin/<family>/index.css
```

For the four form surfaces and the contaminated header rows, `resolveFamily`
must be bypassed until S1 is ruled on: build the `resolved` object from the real
owner directory (frozen engines filtered) and its real skin, then call
`measureFamily`. That is the deviation declared in section 0 and it is the
reason sub-lot A exists.
