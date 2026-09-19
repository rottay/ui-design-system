---
title: "WO-FAM-11 census: the shells, the workspace chrome and the keyboard owner, measured before any code moves"
date: 2026-09-19
status: census + batching proposal (B0 packet; NO product code written)
work-order: WO-FAM-11
base: fdde863b31e402ed06036f400bf2fd9f25c722b9 (main, /Users/daniel/Developer/Rottay/r4-recon-opus)
still-valid-at: f23864c907a36ec9f4e527331841a4b1e1fb2845 (the DT's own claim commit landed
  mid-packet; `git diff --name-only fdde863b3 f23864c90` is exactly `roadmap/STATUS.md`
  and `roadmap/registry.json` -- zero intersection with this census's read path)
writer: Opus (claude-admin profile)
auditor: Kimi (DT/coordinator)
write-set: evidence/fam11-census/ ONLY
precedent: evidence/fam10-census/index.md
---

# WO-FAM-11 census

This packet measures the WO-FAM-11 families against the work order's own
acceptance gate and proposes the batching. It writes no product code, moves no
file, touches no roster, no baseline and no `roadmap/`.

It is the second census in this shape. Where FAM-10's findings have since been
fixed in the instrument, this file says so and does not re-litigate them; where
the same class of defect reappears in a new form, it is stated as a new finding
with its own measurement.

## 0. Method and provenance

Every number below is the output of an instrument that already owns the
measurement, never a second count of the same thing:

- `packages/core/scripts/check/family-cut/index.mjs` — `resolveFamily`,
  `measureFamily`, `analyzeSkin`, `readSkeletonPartRoles`,
  `declaredFanOutFamilies` (BLOCKING arms, ratchets, denominators, anatomy
  census, skeleton arm, adapt-slot arm).
- `packages/core/scripts/check/engine/read-without-producer/index.mjs` —
  `classifyReadWithoutProducer` (channels read, channels with no producer).
- `packages/core/scripts/libraries/tokens/producers/index.mjs` —
  `collectChannelProducers` (the producer set and its `compiledByKind`
  attribution: `derived` / `kernel` / `lowering-foundation`).
- `packages/core/scripts/libraries/theme-catalog/index.mjs` — `readThemeCatalog`
  (control fan-out).
- `packages/core/scripts/check/family-cut/adapt-slot/index.mjs` —
  `readLayoutSensitiveFamilies`, `readPostureVocabulary`.
- `scripts/maintain/roadmap/status/index.mjs show <WO>` — dependency states.

### Deviation, declared because it changes how two rows must be read

Two families are measured ISOLATED: `resolveFamily` returns them with **zero
skins**, because their paint lives in a skin folder named for a different
family. For those two the `resolved` object was rebuilt with the real skin and
handed to the same `measureFamily`. That is the same analyzer on an honest
input, not a second instrument. Both rows are marked ISOLATED, and both readings
(gate-as-it-sees / ISOLATED) are printed, because the difference is the finding.

This is FAM-10's S2 recurring, not FAM-10's S1: the owner walk was fixed and now
resolves `surfaces/presentation/pages/**` correctly (verified — `search` and
`command-center` resolve to real surface owners), and the baseline now accepts
`owner:` and `skins:` pins, with `header-surface → skin/layout-header` and
`surface-lifecycle → skin/surface-states` as the landed precedent.

### What FAM-10 owed and this cut inherits as settled

| Dependency | State | Consequence for this cut |
|---|---|---|
| `WO-FAM-00` (gate + template) | done | the gate is the acceptance authority |
| `WO-CAT-02` (typed control catalog) | done | `minimumFamilies` is now a discriminated union; 9 rows `declared-ratio`, 13 `owner-pending`, 7 `declared-fan-out` |
| `WO-INV-07` (adapt contract + gate) | done | the R4 amendment clause 1 is **live debt**, not owed |
| `WO-FAM-14` (shared skeleton renderer) | done | the R4 amendment clause 2 is **live debt**, not owed; `SKELETON_PART_ROLES` carries 793 roles |
| `WO-DER-02/03/04` | done | the derivation registry is open for this cut's rows |
| `WO-INV-03` (axe per family) | todo | `axe-per-family` stays OWED and printed |
| `WO-INV-08` (layout animation kernel) | todo | `layout-animation-kernel` stays OWED and printed |

`audit/30-findings` and `audit/50-matrices` — cited by the work order's own
delegation prompt — **do not exist in this repository**: `git ls-files | grep -c
'^audit/'` returns 0 and there is no `audit/` directory. F-56, F-40 and F-105
therefore have no fiche an executor can read here. That is stated as a fact, not
adjudicated.

---

## 1. Headline

| Quantity | Measured |
|---|---|
| Families in scope | **12** source owners / **10** skin files (2 of them ISOLATED) |
| Families with **no skin anywhere** | **2** (`page-shell-surface`, `connected-command-palette`) |
| Channels read by the cut's skins (union) | **276** |
| Of those, read with no producer (union) | **97** (35.1 %) |
| Of the produced reads, produced by a `derivation/chrome/*` deriver | **66** of 179 |
| Families that already have a chrome deriver | **0 of 12** (90 derivers exist; none is this cut's) |
| Families the typed catalog declares in a fan-out | **0 of 12** (18 ids are declared; none is a FAM-11 family) |
| Families present in the family-cut roster today | **0 of 12** — the gate runs green on 96 rows and sees none of this cut |
| Shared-kernel adoptions across the whole cut | **2** (`useOptionalDirection` in `app-shell` and `page-shell`) |
| `partAttributes` (the anatomy kernel) adoptions | **0 of 12** (18 owners elsewhere in the package use it) |
| Families declared layout-sensitive | **1 of 12** (`app-shell`), against **24** own `@media` breakpoints and **4** `@container` queries |
| Families stamping `data-posture` through the kernel | **0** (`app-shell` stamps it from a private `ShellPosture` type) |
| `style={{ }}` paint violations (BLOCKING) | **26** |
| Colour/visual literals in source (BLOCKING) | **2** |
| Colour literals in skins | **0** |
| Hand-written skeleton constructs (BLOCKING) | **43** across 2 families |
| `data-part` values the shared renderer has no role for (BLOCKING) | **61** (60 distinct) |
| `data-part` stamped and never painted | **17** |
| State pseudo-classes with no `data-state` twin | **15** |
| Families with no executable a11y assertion (BLOCKING) | **3** (`search-command-bar`, `scope-switcher`, `view-mode-switcher`) |
| Families emitting a `rottay-*` class vocabulary | **2** (`app-shell`, `action-dock`) — the acceptance gate forbids this by name |
| Families whose class root names a different family | **2** (`workspace-shell → ds-collection-shell`, `surface-chrome → ds-section-card`) |
| Loose global `keydown` listeners inside the cut | **3** of 11 in components; **8** are outside it |
| Families currently pinned in `baseline/index.json` | **0 of 12** |

The union figures are unions: 276 channels read and 97 unproduced across 10
files. Per-family sums of the unproduced arm happen to equal the union here
(62 + 14 + 13 + 3 + 3 + 2 = 97) because no unproduced name is read by two of
this cut's skins. That is an observation, not a rule.

Of the 97 unproduced names, **92** are in a family's own namespace (the cut's
own work) and **5** are foreign-namespace or root reads that no FAM-11 sub-lot
can produce (section 4).

---

## 2. Three structural findings that gate the whole cut

These are not per-family debt. Each one blocks the work order as written, and
each has to be adjudicated before a writer opens a file.

### S1 — The gate is green and cannot see one line of this cut

`node packages/core/scripts/check/family-cut/index.mjs` exits 0 today:
`95 family cut(s) hold their contract; 1 admitted with declared opening debt
(96 rows)`. **Zero** of those 96 rows is a FAM-11 family. The roster in
`baseline/index.json` carries 96 pinned families; none of the twelve owners this
work order names is among them.

So the cut's 97 unproduced channels, 26 BLOCKING inline paints, 43 hand-made
skeleton constructs, 61 roleless parts and 2 `rottay-*` vocabularies are
currently outside the instrument's scope entirely, and the instrument says OK.

This is a different defect from FAM-10's S1. FAM-10's S1 was an owner walk that
could not resolve a whole tier; that is fixed — `resolveFamily('search')` now
returns `src/components/surfaces/presentation/pages/data/search`, and the
`owner:`/`skins:` pin machinery is in the baseline and in use. FAM-11's S1 is
purely that **the cut has not been admitted**. The roster's own law is explicit
about how that happens: "a family enters this file when its cut work order opens
and leaves the debt columns at 0 when the cut closes; `cut` names the owning
work order. A row admitted before its cut lands carries `openCut`."

**Decision owed before any family sub-lot opens:** the twelve rows (with the two
`skins:` pins of S2) are admitted to `baseline/index.json` under
`cut: 'WO-FAM-11'` with `openCut` and their measured debt, in one commit, by one
owner. Until they are, no sub-lot can prove anything: the acceptance gate for
every family in this cut is a command that currently cannot fail.

### S2 — Two families paint under another family's name, and the vocabulary arms report 0 for it

The gate derives the family id from the owner's basename, matches skins by name
prefix, and — critically — filters class tokens to those whose remainder *is*
the family id or starts with it (`ownClassTokens` in `measureFamily`). When the
class root names a different family, the arms do not report a foreign vocabulary;
they report **no vocabulary at all**.

| Owner | Class root it emits | Skin folder that paints it | Gate's reading |
|---|---|---|---|
| `structures/shell/workspace-shell` | `ds-collection-shell` (+ `ds-surface`) | `skin/collection-shell` | 0 skins, `classVocabularies=0`, `legacyNamespaceClasses=0` |
| `structures/shell/surface-chrome` | `ds-section-card` (+ `ds-surface`) | `skin/surface-section-card` | 0 skins, `classVocabularies=0`, `legacyNamespaceClasses=0` |

Measured both ways:

| | as the gate sees it | ISOLATED (real skin) |
|---|---|---|
| **`workspace-shell`** | | |
| `skinFiles` | 0 | 1 |
| `channelsRead` | 0 | 17 |
| `partsStamped` / `partsConsumed` | 4 / 0 | 4 / 4 |
| `skinReadsAnatomy` (BLOCKING) | **false** | true |
| `variantContract` (BLOCKING) | **false** | true |
| `partsStampedNotConsumed` | 4 | 0 |
| `readWithoutProducer` | 0 | 0 |
| **`surface-chrome`** | | |
| `skinFiles` | 0 | 1 |
| `channelsRead` | 0 | 39 |
| `partsStamped` / `partsConsumed` | 7 / 0 | 7 / 9 |
| `skinReadsAnatomy` (BLOCKING) | **false** | true |
| `partsStampedNotConsumed` / `ConsumedNotStamped` | 7 / 0 | 0 / **2** |
| `readWithoutProducer` | 0 | **6** |

The gate's reading is inverted in the same way FAM-10's S1 was: it reports two
BLOCKING failures (`skinReadsAnatomy`, `variantContract`) that are artifacts of
the name, and reports **0 unproduced channels** where `surface-chrome` really
reads 6 with no producer. Admitting either family today without a `skins:` pin
would pin fiction.

Two more naming facts, both measured, neither an artifact:

- **`skin/surface-accent-bar` is not an orphan to adopt.** Its entire content is
  one rule, `.ds-surface.ds-accent-bar[data-part='bar'] { display: none; }`, and
  `structures/foundation/chrome/runtime/profile-defaults/personality/tests/no-decorative-accent-rails.test.tsx`
  asserts both that the class never renders and that the rule reads exactly that.
  No owner in `src/components` emits `ds-accent-bar`. It is a governed
  suppression, and it must **not** be pinned to `surface-chrome`.
- **`skin/collection-shell` is the only skin for `workspace-shell`, and it is
  not the whole paint.** `workspace-shell`'s `--ds-workspace-shell-*` channels
  (4 produced: `-overlay`, `-bg`, `-border`, `-shadow`) are written in the
  3695-line monolith `presentation/components/patterns/index.css` and consumed
  from `presentation/components/patterns-paint/index.css` as well as from
  `skin/collection-shell`. The cut has to decide whether draining the monolith
  is in scope; this census measures only the skin.

**Decision owed:** `workspace-shell` pins `skins: ['collection-shell']` and
`surface-chrome` pins `skins: ['surface-section-card']`, exactly as
`header-surface` and `surface-lifecycle` already do. Whether the class roots
then get renamed to `ds-workspace-shell` / `ds-surface-chrome` is a separate
owner call, because `ds-collection-shell` is also selected by the
`collection-workspace` surface's paint.

### S3 — The contract this cut is told to consume does not exist, and the half that does exist is in the wrong authority

Four measurements, all zero or wrong-authority:

- **Derivers: 0 of 12.** `derivation/chrome/` holds **90** derivers. None of
  them is `app-shell`, `shell`, `page-shell`, `page-shell-surface`,
  `workspace-shell`, `surface-chrome`, `search-command-bar`, `command-palette`,
  `connected-command-palette`, `shortcuts-overlay`, `action-dock`,
  `scope-switcher` or `view-mode-switcher`. The work order's outcome sentence
  ("the chrome deriver `derivation/chrome/<family>` emits every component
  channel from decisions") starts from nothing for every family.
- **Catalog fan-out: 0 of 12.** `declaredFanOutFamilies()` returns 18 ids
  (`blur button card cardComponent checkbox glass glow input layout panel radio
  section-card select sidebar table tabs tag toggle`). Not one FAM-11 family is
  declared. `fanOutUnreached = 0` for all twelve — which is a vacuous zero, not
  a pass. The cut must *add* rows to a singleton-owned core contract.
  - Two of the 18 are near-misses that touch this cut and are already registered
    as routed to WO-CAT-02: `sidebar` (one word off `sidebar-surface`) and
    `layout` (a chrome section name; `skin/layout` is layout chrome, and it
    reads `--ds-shell-inline-start-inset` from this cut's namespace).
- **The producers that do exist are the legacy kernel, not derivers.** Of the
  276 channels the cut reads, 179 have a producer. Attributed by
  `compiledByKind`:

  | family | read | `derived` | `kernel` | `lowering-foundation` | CSS declaration only | no producer |
  |---|---|---|---|---|---|---|
  | `app-shell` | 103 | 8 | 9 | 3 | 21 | **62** |
  | `page-shell` | 121 | 34 | 11 | 5 | 54 | **17** |
  | `search-command-bar` | 22 | 10 | 1 | 2 | 9 | 0 |
  | `command-palette` | 25 | 5 | 1 | 2 | 17 | 0 |
  | `shortcuts-overlay` | 24 | 3 | 0 | 2 | 19 | 0 |
  | `action-dock` | 31 | 3 | 0 | 0 | 13 | **15** |
  | `scope-switcher` | 12 | 3 | 0 | 1 | 8 | 0 |

  Every `derived` hit is another family's deriver (button, card, menu, …) reached
  through a root token. The cut's **own** namespaces are produced, where they are
  produced at all, by `infrastructure/compilers/kernel/foundation/css/chrome-variables`:
  `--ds-shell-sidebar-width`, `--ds-workspace-shell-bg`, `--ds-command-palette-bg`
  are all emitted there. That file is the legacy `appearance/` chrome mapping,
  not `derivation/chrome/<family>`.
- **A producer with no reader is the mirror defect, and it is here.**
  `--ds-command-palette-*` has **8** producers and the `command-palette` skin
  reads **0** of them (its 25 reads are all root tokens). `--ds-workspace-shell-*`
  has **4** producers and no family skin reads any. Meanwhile
  `--ds-search-command-bar-*`, `--ds-scope-switcher-*`, `--ds-view-mode-*`,
  `--ds-surface-chrome-*` and `--ds-app-shell-*` have **0** producers and **0**
  readers: those namespaces do not exist at all.
- **Layout sensitivity: 1 declared, 0 wired.** `LAYOUT_SENSITIVE_FAMILIES` has
  10 rows; exactly one is this cut's — `app-shell`, already tagged
  `cut: 'WO-FAM-11'`. Its `adaptSlot` arm fails both halves today:

  ```
  app-shell (WO-FAM-11): accepts-adapt -- no props member `adapt: Adapt<...>`
  app-shell (WO-FAM-11): stamps-posture -- stamps `data-posture` but never
      resolves it through useAdaptation/postureAttribute
  ```

  `app-shell` stamps `data-posture={posture}` from a **private second posture
  vocabulary**: `ShellPosture = 'phone' | 'tablet' | 'desktop'` declared in
  `structures/shell/contracts`, computed in the component from
  `infrastructure/runtime/responsive`'s `isTablet`/`isMobile`. It coincides by
  value with the kernel's `readPostureVocabulary().viewport` — and that
  coincidence is precisely why nothing has caught it. The reference
  implementation is one directory away: `structures/shell/navigation/sidebar-surface`
  (cut WO-FAM-05, done) resolves `postureAttribute` through `useAdaptation`.
  Eight owners in the package already do.

  The other eleven families are **not** declared, against 24 `@media` breakpoints,
  4 `@container` queries and 7 TSX responsive calls of their own.

**Decision owed before sub-lot A opens:** which of the twelve are layout-sensitive
(a `LAYOUT_SENSITIVE_FAMILIES` edit, AST-read, singleton-owned); which catalog
rows declare this cut; and whether the shell namespace's existing
`chrome-variables` emissions are migrated into per-family derivers or left as a
compatibility producer. The third is the largest architecture question in the
cut and it is not a writer's call.

---

## 3. Per-family census

Legend. `RWP` = channels read with no producer / channels read. `inline` =
BLOCKING `style={{ }}` violations. `lits` = BLOCKING visual literals in source.
`SNC` / `CNS` = `data-part` stamped-not-consumed / consumed-not-stamped.
`pseudo` = unpaired state pseudo-selectors. `skel` = hand-written skeleton
constructs / `data-part` values with no renderer role. `a11y` = executable a11y
assertions. ISOLATED rows are per section 0.

### 3.1 The shells

| Family | Owner | Skin | RWP | inline | lits | SNC / CNS | pseudo | kernels | adapt | skel | a11y | vocab |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `app-shell` | `structures/shell/app-shell` | `skin/app-shell` | **62**/103 | 0 | 0 | 13 / 1 | 4 | `useOptionalDirection` | **declared, both arms fail** | 0 / 12 | 13 | **`rottay-app-shell`** |
| `page-shell` | `patterns/shell/page-shell` | `engines/modern/skin/page-shell` | 17/121 | 0 | 0 | 0 / 0 | **9** | `useOptionalDirection` | not declared | **29** / 2 | 30 | none (anatomy-only) |
| `page-shell-surface` | `structures/shell/page-shell-surface` | **none anywhere** | 0/0 | 1 | 0 | 0 / 0 | 0 | none | not declared | 0 / 0 | 11 | none |
| `workspace-shell` (ISOLATED) | `structures/shell/workspace-shell` | `skin/collection-shell` | 0/17 | **21** | **2** | 0 / 0 | 0 | none | not declared | 0 / 1 | 5 | **`ds-collection-shell`** |
| `surface-chrome` (ISOLATED) | `structures/shell/surface-chrome` | `skin/surface-section-card` | **6**/39 | 3 | 0 | 0 / 2 | 0 | none | not declared | 0 / 1 | 2 | **`ds-section-card`** |

`app-shell` is the cut's centre of gravity: 62 of the cut's 97 unproduced
channels, the only declared layout-sensitive row, the only family with a
`rottay-*` vocabulary of 19 distinct BEM tokens (21 occurrences in source, 70 in
its skin), and the owner of the shared `--ds-shell-*` namespace (section 5).

`page-shell` is the cut's cleanest large family — 121 channels, anatomy-only
(27 parts stamped, 27 consumed, zero classes), 30 a11y assertions — and carries
**29** of the cut's 43 hand-made skeleton constructs, all of them
`[data-part='skeleton-*']` selectors in its own skin. Its 11 unproduced
`--ds-page-header-*` names are a sub-namespace that is not derived from its
folder name; the work order's "one namespace derived from the folder name" makes
that a rename inside the family, not a cross-lot route.

`workspace-shell` holds the cut's only BLOCKING visual literals — two
`color-mix()` particle colours passed inline at `index.tsx:214` and `:240` — and
21 of its 26 inline paints, which are the particle-field overlays
(`position`/`inset`/`pointerEvents`/`zIndex`/`maskImage`, four `zIndex: 0|1`
magic numbers among them). It also carries the work order's named
`data-cra-14-static-fallback` attribute (1 occurrence in source, 1 in its
quarantine test) — the only `data-cra-*` left in the package.

`page-shell-surface` and `connected-command-palette` have no paint anywhere:
they are composition-only structures. Their single BLOCKING items are one
`style={{ viewTransitionName }}` and nothing, respectively.

### 3.2 The workspace chrome

| Family | Owner | Skin | RWP | inline | lits | SNC / CNS | pseudo | kernels | adapt | skel | a11y | vocab |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `search-command-bar` | `structures/workspace/search-command-bar` | `skin/search-command-bar` | 0/22 | 0 | 0 | 1 / 0 | 1 | none | not declared | 0 / **27** | **0** | `ds` |
| `command-palette` | `patterns/navigation/command-palette` | `engines/modern/skin/command-palette` | 0/25 | 1 | 0 | 1 / 1 | 1 | none | not declared | **14** / 11 | 22 | none |
| `connected-command-palette` | `structures/workspace/connected-command-palette` | **none anywhere** | 0/0 | 0 | 0 | 0 / 0 | 0 | none | not declared | 0 / 0 | 5 | none |
| `shortcuts-overlay` | `patterns/navigation/shortcuts-overlay` | `engines/modern/skin/shortcuts-overlay` | 0/24 | 0 | 0 | 0 / 0 | 0 | none | not declared | 0 / 5 | 3 | none |
| `action-dock` | `structures/workspace/action-dock` | `skin/action-dock` | **15**/31 | 0 | 0 | 0 / 0 | 0 | none | not declared | 0 / 0 | 16 | **`rottay-action-dock`** |
| `scope-switcher` | `structures/workspace/scope-switcher` | `skin/scope-switcher` | 0/12 | 0 | 0 | 1 / 0 | 0 | none | not declared | 0 / 1 | **0** | `ds` |
| `view-mode-switcher` | `structures/workspace/view-mode-switcher` | `skin/view-mode-switcher` | **0/0** | 0 | 0 | 1 / 0 | 0 | none | not declared | 0 / 1 | **0** | `ds` |

**`RWP = 0` is a false green for four of these seven.** `search-command-bar`,
`scope-switcher` and `view-mode-switcher` read **no channel in their own
namespace at all** — their skins read root tokens directly
(`--ds-color-*`, `--ds-spacing-*`, `--ds-surface-*`). There is nothing for a
deriver to produce because the namespace does not exist yet; it has to be
created and the skin rewired, which is more work than draining a namespace that
is merely unproduced. `view-mode-switcher` is the extreme case: an 80-line skin
that reads **zero** `--ds-*` channels.

`command-palette` is the inverse: 8 `--ds-command-palette-*` channels are
produced by `chrome-variables` and its Modern skin reads **none** of them. Its
25 reads are root tokens. So this family has a live tenant-facing cascade that
lands nowhere.

`action-dock`'s 13 unproduced `--ds-action-dock-*` names are the one place in
the cut where a family already owns a correct, folder-derived namespace and just
has no producer for it. Its two *produced* names
(`--ds-action-dock-reserved-block-*`) are self-declared inside its own skin as a
reservation contract other surfaces consume. It is also the second `rottay-*`
vocabulary (5 distinct tokens; 21 occurrences in its skin, the class applied from
`runtime/rendering/index.tsx`, not from the engine file).

The three `a11y = 0` families are exactly the three thin structures with no test
directory at all: `search-command-bar`, `scope-switcher`, `view-mode-switcher`
have **zero** `*.test.tsx` files. That is a BLOCKING arm with no partial credit.

`search-command-bar` also carries the cut's largest single role gap: **27** of
the 61 roleless parts, all from its voice-input sub-anatomy
(`voice-badge`, `voice-help-*`, `suggestion-chip`, `top-rail`, …).

### 3.3 The keyboard owner

The work order's step 4 — "`ShortcutProvider` mounted by `DesignSystemProvider`
as the single keyboard owner (8 loose `keydown` removed; `/` and `mod+k`
registered)" — was measured directly. Non-test, non-frozen global listeners
(`document|window.addEventListener('keydown', …)`): **14**.

| Class | Count | Owners |
|---|---|---|
| Sanctioned platform owners | 2 | `infrastructure/runtime/application/interaction/shortcuts` (the `ShortcutProvider` registry), `components/primitives/runtime/overlay/layer-stack` |
| A second platform keyboard owner | 1 | `infrastructure/runtime/application/commands/runtime/registry` |
| **Inside this cut** | **3** | `patterns/navigation/shortcuts-overlay/engines/modern`, `structures/workspace/search-command-bar`, `structures/workspace/connected-command-palette` |
| **Outside this cut** | **8** | `patterns/customization/token-inspector`, `patterns/navigation/environment-toggle/engines/modern`, `patterns/communication/notification-center/engines/modern`, `patterns/data/widget-board/engines/foundation`, `patterns/visualization/charts/runtime/chart-engine/runtime/interaction/controller`, `structures/workspace/saved-views-menu`, `structures/workspace/export-button`, `surfaces/presentation/pages/workspace/collection-workspace/filter-dropdown` |

The work order's "8 loose `keydown`" matches the count of listeners **outside**
this cut exactly. Seven of those eight belong to families already cut by other
work orders (`widget-board`, `saved-views`, `column-settings` neighbourhood →
WO-FAM-08; `notification-center` → WO-FAM-04 neighbourhood; `charts` →
WO-FAM-09) and the eighth is a surface nobody has claimed. Removing them is not
this cut's write set, and the family-cut law ("do not split deriver/skin/runtime
of the same family across different WOs") forbids reaching into them.

`DesignSystemProvider` lives at
`infrastructure/runtime/bootstrap/facade/react/provider/index.tsx:733` and does
**not** mount `ShortcutProvider` today (no reference to it in that file). That
mount is a one-line change in a singleton-owned provider — it is in scope, it is
the cut's real keyboard-owner deliverable, and it is disjoint from every family.

**Decision owed:** whether step 4's "8 loose `keydown` removed" is (a) the 3
inside this cut plus a provider mount, with the other 8 routed to their owning
cuts, or (b) an explicit cross-cut licence. My measurement supports (a); the
sentence as written reads like (b) and would break the one-family-one-lot law.

---

## 4. The 5 reads no FAM-11 sub-lot can produce

These are read by the cut's skins, produced by nobody, and not in a FAM-11
namespace. Routing them is correct; inventing a local producer is the "second
authority" the cascade rule forbids.

| Group | Names | Route to |
|---|---|---|
| `workspace-card` (3) | `--ds-workspace-card-icon-bg`, `-icon-border`, `-icon-color` | the workspace/collection-workspace owner. **FAM-10 routed the same namespace** (4 names, read by `page-shell` and `surface-chrome` here). It is now read by two cuts and owned by none |
| roots (2) | `--ds-size-touch-target`, `--ds-virtual-keyboard-inset` | the token/root lane. `--ds-size-touch-target` is the **same root FAM-10 routed**; it is still unproduced |

The other 92 unproduced names are this cut's own:
`--ds-shell-*` 62, `--ds-page-header-*` 11, `--ds-page-shell-*` 3,
`--ds-action-dock-*` 13, `--ds-section-card-*` 3.

---

## 5. The cut's shared-contract seams, measured

The work order assumes the shell families share something. They do — four
things, and only one of them is a real contract today.

### 5.1 `--ds-shell-*` is a cross-family layout contract, not app-shell's private namespace

`app-shell` reads 62 unproduced `--ds-shell-*` names. But the namespace is read
by **7 non-frozen files**, and the foreign reads are a small, coherent set:

| Foreign reader | Names it reads |
|---|---|
| `skin/action-dock` (this cut) | `--ds-shell-bottom-inset` |
| `engines/modern/skin/layout` (the layout chrome) | `--ds-shell-inline-start-inset` |
| `engines/modern/skin/page-shell` (this cut) | `--ds-shell-grid-line`, `--ds-shell-grid-size` |
| `skin/chat-surface` | `--ds-shell-bottom-inset` |
| `skin/metrics-rows` | `--ds-shell-shimmer-faint` |
| `skin/visual-excellence-preview` | `--ds-shell-bg` |

Plus two TypeScript readers: `structures/shell/contracts` and
`structures/dashboard/insights/foundation/tokens`.

20 `--ds-shell-*` names have a producer; 62 do not. The produced ones include
exactly the inset/geometry names the foreign readers consume
(`--ds-shell-bottom-inset`, `--ds-shell-sidebar-width`, `--ds-shell-topbar-height`,
`--ds-shell-safe-area-*`), emitted by `chrome-variables`.

**This is the seam.** `--ds-shell-*` is a published shell-geometry contract with
4 external consumers, and renaming it to `--ds-app-shell-*` — which "one
namespace derived from the folder name" literally requires — breaks all of them.
The honest split is: a small **published** inset/geometry contract that keeps the
`--ds-shell-*` name and gets a real producer, and a large **private**
`--ds-app-shell-*` chrome namespace for the other ~56 names. That split is an
architecture decision, it is singleton-owned, and it must land before any writer
renames a variable.

### 5.2 `structures/shell/contracts` is the shells' shared type owner — and it carries 5 hardcoded visual values

129 lines, exporting `ShellPosture`, `ShellInset`, `ShellInsetByPosture`,
`ShellSidebarSlots`, `ShellHeaderSlots`, `ShellGeometry`, `AppShellProps` and
`SHELL_DEFAULTS`. Measured importers: **one** — `app-shell/index.tsx`. Everything
else reaches it through the `structures/shell` and `structures` barrels as a
public type re-export.

`SHELL_DEFAULTS` holds `sidebarWidth: 296`, `sidebarCollapsedWidth: 96`,
`headerHeight: 64`, `sidebarHeaderHeight: 104`,
`collapseTransition: '220ms cubic-bezier(0.16, 1, 0.3, 1)'`. They are injected
as `var()` fallbacks (`var(--ds-shell-sidebar-width, ${sidebarWidth}px)`), which
is why `inlineStyleViolations` does not flag them — but they are five visual
decisions authored in TSX, against the outcome sentence "TSX carries no visual
values", and they are a second authority for five channels the deriver is
supposed to own.

`ShellPosture` is the second posture vocabulary of S3.

### 5.3 The command chain is a three-level composition inside the cut

Measured from the import graph:

```
search-command-bar ──> connected-command-palette ──> command-palette (pattern)
                                                 └─> shortcuts-overlay (pattern)
```

`connected-command-palette` imports both patterns plus
`infrastructure/runtime/application/commands` and
`.../interaction/shortcuts`. `search-command-bar` imports
`connected-command-palette` and the voice runtime. These four families cannot be
written by four different writers: they are one dependency chain and one lot.

`scope-switcher` and `view-mode-switcher` are the other pair: both are thin
wrappers over `primitives/navigation/segmented/engines/modern`, both ~120/170
source lines, both with zero tests. They share a primitive, not a contract.

### 5.4 `structures/foundation/chrome/contracts` is a cross-cut seam with FAM-10

`page-shell-surface` and `surface-chrome` both import
`structures/foundation/chrome/contracts`; `surface-chrome` also imports
`.../runtime/access` and the recipe engine. That owner is exactly where FAM-10's
census placed its singleton header contract, and it already holds `contracts`,
`runtime/access`, `runtime/errors`, `runtime/header-tone`, `runtime/i18n`,
`runtime/profile-defaults`. WO-FAM-10 is still `in-progress`. **Any FAM-11
sub-lot that needs to edit `structures/foundation/chrome/**` collides with an
open work order** and must be serialized by the DT.

### 5.5 What the cut does *not* share

- `partAttributes` (the anatomy kernel, `foundation/behavior/kernel/anatomy`):
  **0 of 12** adopt it; 18 owners elsewhere do. Every FAM-11 family stamps
  `data-part` by hand.
- `useInteractionState`, `useFieldOverlay`, the listbox and calendar kernels,
  `resolveSubmitIntent`, `useLayerStack`: **0 adoptions**, despite
  `command-palette` being a filtered option list and `shortcuts-overlay`,
  `command-palette` being overlays.
- `useOptionalDirection`: 2 adoptions (`app-shell`, `page-shell`). The other ten
  are not RTL-aware.
- `runtime/i18n`: 9 of 12. The three without it are the three paint-less
  structures, which carry no copy.

---

## 6. Proposed batching

Five sub-lots. Ordering is forced by one rule: **every shared contract lands
before any family that consumes it**, and no two sub-lots ever open the same
file.

### Singleton-owned files (exactly one sub-lot may touch each)

| File | Owner sub-lot | Why it is a singleton |
|---|---|---|
| `scripts/check/family-cut/baseline/index.json` | **A** admits all 12 rows; each later sub-lot lowers its own pins in its own commit, serialized by the DT | one file, decrease-only law; re-pins must be the gate's own output |
| `src/contracts/theme/runtime/catalog/**` | **A** | WO-CAT-02 core contract; the control catalog is the single listing |
| `foundation/contracts/kernel/adaptation/composition/families/registry/index.ts` | **A** | AST-read array literal; the adapt-slot gate's roster |
| `.../lowering/runtime/derivation/index.ts` (deriver registration) | **A** creates the block; each sub-lot adds its own line, serialized | **the DT's line.** Rank collisions are the failure mode |
| `infrastructure/compilers/kernel/foundation/css/chrome-variables/index.ts` | **A** | the current producer of `--ds-shell-*`, `--ds-workspace-shell-*`, `--ds-command-palette-*`; migrating or freezing it is one decision, not five |
| `components/structures/shell/contracts/index.ts` (the `--ds-shell-*` split + `SHELL_DEFAULTS` + `ShellPosture`) | **B** | the published-vs-private namespace split of §5.1, with `app-shell` as its first and only consumer |
| `infrastructure/runtime/bootstrap/facade/react/provider/index.tsx` (`ShortcutProvider` mount) | **D** | the provider is the package's single bootstrap; the keyboard owner is D's deliverable |
| `components/structures/foundation/chrome/**` | **none — collides with WO-FAM-10, which is still `in-progress`** | serialize through the DT or declare it out of scope |

### The sub-lots

**Sub-lot A — admission and shared contracts. No family paint.**
Write set: `scripts/check/family-cut/baseline/index.json`,
`src/contracts/theme/runtime/catalog/**`,
`foundation/contracts/kernel/adaptation/composition/families/registry/index.ts`,
`.../lowering/runtime/derivation/index.ts`,
`infrastructure/compilers/kernel/foundation/css/chrome-variables/index.ts`.
Delivers: the twelve roster rows at their measured debt under
`cut: 'WO-FAM-11'` with `openCut`, including the two `skins:` pins of S2
(`workspace-shell → collection-shell`, `surface-chrome → surface-section-card`),
on the `header-surface` / `surface-lifecycle` precedent; the catalog rows that
declare this cut's families; the `LAYOUT_SENSITIVE_FAMILIES` rows the owner
rules in; the ruling on whether `chrome-variables` keeps producing the shell
namespaces. Needs a planted-red drill proving a wrong `skins:` pin fails.
Lands alone, audited independently, before anything else opens.
Blocks: everything. The only sub-lot that may not run in parallel.

**Sub-lot B — `app-shell` and the `--ds-shell-*` split.**
Families: `app-shell`.
Write set: `components/structures/shell/app-shell/**`,
`components/structures/shell/contracts/**`, `skin/app-shell/**`,
`derivation/chrome/app-shell/**`.
Carries: 62 of the cut's 97 unproduced channels; the published/private namespace
split of §5.1; the `rottay-app-shell` → `ds-app-shell` rename (19 distinct BEM
tokens, 91 occurrences); the adapt-slot adoption against the `sidebar-surface`
reference; the retirement of `ShellPosture` and of `SHELL_DEFAULTS`' five
hardcoded values; 12 roleless parts; 13 unpainted parts; 4 unpaired pseudos.
Second among the sub-lots because §5.1's split is a contract the others read.
Alone: it is the biggest single-family debt in the cut.

**Sub-lot C — `page-shell` + the two paintless shells.**
Families: `page-shell`, `page-shell-surface`, `workspace-shell`, `surface-chrome`.
Write set: `patterns/shell/page-shell/**` (Modern only),
`structures/shell/{page-shell-surface,workspace-shell,surface-chrome}/**`,
`engines/modern/skin/page-shell/**`, `skin/collection-shell/**`,
`skin/surface-section-card/**`, `derivation/chrome/{page-shell,workspace-shell,surface-chrome}/**`.
Carries: 29 of the cut's 43 hand-made skeleton constructs (all `page-shell`);
25 of its 26 inline paints and both visual literals (`workspace-shell`'s
particle field); the `data-cra-14-static-fallback` removal; the
`--ds-page-header-*` → folder-derived rename; `surface-chrome`'s 6 unproduced
`--ds-section-card-*`/`--ds-workspace-card-*` reads; the two class-root
decisions of S2.
Grouped deliberately: these four are one page-composition doctrine, they are the
only four owners under `structures/shell` + `patterns/shell` left after B, and
splitting `workspace-shell` from `surface-chrome` would let two writers disagree
about `ds-surface`, which both emit.
Depends on B (the `--ds-shell-*` split; `page-shell` reads `--ds-shell-grid-*`).
May run in parallel with D and E.

**Sub-lot D — the command chain and the keyboard owner.**
Families: `command-palette`, `connected-command-palette`, `shortcuts-overlay`,
`search-command-bar`.
Write set: `patterns/navigation/{command-palette,shortcuts-overlay}/**`
(Modern only), `structures/workspace/{connected-command-palette,search-command-bar}/**`,
`engines/modern/skin/{command-palette,shortcuts-overlay}/**`,
`skin/search-command-bar/**`, `derivation/chrome/{command-palette,shortcuts-overlay,search-command-bar}/**`,
`infrastructure/runtime/bootstrap/facade/react/provider/index.tsx`.
Carries: the three loose `keydown` listeners inside the cut and the
`ShortcutProvider` mount; the 8 dead `--ds-command-palette-*` producers; 14
hand-made skeleton constructs; 43 of the cut's 61 roleless parts (27 of them
`search-command-bar`'s voice anatomy); `search-command-bar`'s **zero** a11y
assertions and zero test files; the `--ds-search-command-bar-*` namespace that
must be created from nothing.
One lot because §5.3 proves they are one import chain.
Depends on A only. Parallel with B, C, E.

**Sub-lot E — the dock and the two switchers.**
Families: `action-dock`, `scope-switcher`, `view-mode-switcher`.
Write set: `structures/workspace/{action-dock,scope-switcher,view-mode-switcher}/**`,
`skin/{action-dock,scope-switcher,view-mode-switcher}/**`,
`derivation/chrome/{action-dock,scope-switcher,view-mode-switcher}/**`.
Carries: 13 unproduced `--ds-action-dock-*`; the `rottay-action-dock` →
`ds-action-dock` rename (5 distinct tokens, 46 occurrences); the two switchers'
non-existent namespaces and their **zero** a11y assertions and zero test files;
`action-dock`'s `--ds-shell-bottom-inset` read, which is a consumer of B's
published contract.
Smallest sub-lot, and the only one where all three families share a single
upstream primitive (`segmented`) rather than a contract.
Depends on A; soft-depends on B for the `--ds-shell-bottom-inset` name.
Parallel with C and D.

### Order

```
A  (alone, blocking: admission + catalog + adapt roster + chrome-variables ruling)
|
+-- B  (app-shell + the --ds-shell-* split)
|     |
|     +-- C  (page-shell + the 3 paintless shells)   -- parallel with D, E
|     +-- E  (dock + switchers)                      -- parallel with C, D
|
+-- D  (command chain + keyboard owner)              -- parallel with B, C, E
```

Three writers can run concurrently after A; four after B. Every baseline re-pin
and every `derivation/index.ts` registration line is serialized through the DT,
one commit per sub-lot, per the operating model.

---

## 7. What this census does not answer

Stated so nobody reads silence as a green.

- **The cut's exact roster.** I measured the twelve owners the brief names. Four
  neighbours are named in **no family-cut work order at all** and the word
  "workspace" in this work order's title is the nearest claim any of them has.
  Measured, in case the DT pulls them in:

  | Candidate | Owner | skins | chan | RWP | inline | a11y | skel hand / noRole | vocab |
  |---|---|---|---|---|---|---|---|---|
  | `bottom-tab-bar` | `structures/shell/bottom-tab-bar` | 1 | 25 | 3 | 0 | 7 | 0 / 3 | **`rottay`** |
  | `feature-workspace-frame` | `patterns/shell/feature-workspace-frame` | 1 | 30 | **16** | 0 | 3 | 9 / 2 | `ds` |
  | `command-center` | `surfaces/presentation/pages/workspace/command-center` | 1 | 9 | 0 | 0 | **0** | **32** / 7 | `ds` |
  | `search` (surface) | `surfaces/presentation/pages/data/search` | 1 | 26 | 0 | 0 | **0** | 12 / 4 | `ds` |
  | `workspace-switcher` | `patterns/navigation/workspace-switcher` | 1 | 45 | **15** | 0 | 1 | 6 / 18 | none |
  | `locale-switcher` | `patterns/navigation/locale-switcher` | 1 | 24 | 0 | 0 | 14 | 0 / 1 | none |
  | `collection-workspace` | `surfaces/.../workspace/collection-workspace` | 1 | 61 | 3 | **30** | 154 | 3 / **61** | `ds` |

  Pulling in `command-center` and `search` alone would add **44** hand-made
  skeleton constructs — more than the cut's current total — and two more
  zero-a11y families. `bottom-tab-bar` would add a third `rottay-*` vocabulary
  and it sits inside `structures/shell/` with the families this cut does claim.
  These are sizing facts, not a recommendation.
- **Whether `--ds-shell-*` splits or renames.** §5.1 measures 4 external
  consumers and 20 produced names against 62 unproduced. The split I propose is
  the only reading that satisfies both "one namespace derived from the folder
  name" and "do not break a consumer"; choosing differently is the owner's call.
- **Whether `chrome-variables` keeps producing this cut's namespaces.** It is
  today the sole producer of `--ds-shell-sidebar-width`,
  `--ds-workspace-shell-bg` and `--ds-command-palette-bg`. `docs/architecture/index.md`
  owns the direction of that retirement; this census records only that the
  producer is there and that no FAM-11 deriver exists.
- **Whether step 4's "8 loose `keydown`" licences cross-cut edits.** §3.3
  measures 3 inside and 8 outside. I read it as 3 + a provider mount; the
  sentence reads like 11.
- **`audit/30-findings` and `audit/50-matrices` do not exist here.** F-56, F-40
  and F-105 cannot be read, so their closure criteria are unmeasured and this
  census does not claim to cover them.
- **No browser evidence.** Every number here is static. Causality probes, axe
  runs and first-paint claims need a rendered DOM and are each sub-lot's own
  acceptance work.
- **No file was moved, renamed, staged or committed.** The working tree carries
  this file and nothing else.

---

## 8. Appendix — the totals row, and how to re-derive it

One row per cut family (12 rows; `workspace-shell` and `surface-chrome` ISOLATED
per section 0). Frozen `engines/classic` and `engines/rustic` files are excluded,
as the gate's own `isFamilySource` excludes them.

| | inline | src literals | hand-made skeletons | parts w/o role | SNC | CNS | unpaired pseudo | legacy `rottay-*` families | skin colour literals | families with 0 a11y | families with 0 test files |
|---|---|---|---|---|---|---|---|---|---|---|---|
| **cut total** | **26** | **2** | **43** | **61** (60 distinct) | **17** | **4** | **15** | **2** | **0** | **3** | **3** |

Union cascade: **276** channels read across 10 skin files, **97** with no
producer (35.1 %); **66** of the 179 produced reads come from a
`derivation/chrome/*` deriver and **none** of those derivers belongs to this cut.

Reproduce:

```bash
cd packages/core

# the gate as it stands (green; zero FAM-11 rows)
node scripts/check/family-cut/index.mjs

# per-family measurement, the gate's own exports
node --input-type=module -e "
import { resolveFamily, measureFamily } from './scripts/check/family-cut/index.mjs';
import { collectChannelProducers } from './scripts/libraries/tokens/producers/index.mjs';
const producers = collectChannelProducers().producers;
for (const id of ['app-shell','page-shell','page-shell-surface','workspace-shell','surface-chrome','search-command-bar','command-palette','connected-command-palette','shortcuts-overlay','action-dock','scope-switcher','view-mode-switcher'])
  console.log(id, JSON.stringify(measureFamily(resolveFamily(id), { producers })));
"

# the two ISOLATED rows: same analyzer, real skin
node --input-type=module -e "
import { resolveFamily, measureFamily } from './scripts/check/family-cut/index.mjs';
import { collectChannelProducers } from './scripts/libraries/tokens/producers/index.mjs';
const producers = collectChannelProducers().producers;
const S = n => process.cwd() + '/src/foundation/tokens/css/presentation/components/skin/' + n + '/index.css';
console.log(measureFamily({ ...resolveFamily('workspace-shell'), skins: [S('collection-shell')] }, { producers }));
console.log(measureFamily({ ...resolveFamily('surface-chrome'),  skins: [S('surface-section-card')] }, { producers }));
"

# the union cascade over the cut's 10 skin files
node --input-type=module -e "
import { classifyReadWithoutProducer } from './scripts/check/engine/read-without-producer/index.mjs';
import { collectChannelProducers } from './scripts/libraries/tokens/producers/index.mjs';
/* files = the 8 resolved skins + skin/collection-shell + skin/surface-section-card */
"

# producer attribution by authority
node --input-type=module -e "
import { collectChannelProducers } from './scripts/libraries/tokens/producers/index.mjs';
const p = collectChannelProducers();
console.log(Object.fromEntries(Object.entries(p.compiledByKind).map(([k,v])=>[k,v.size])));
"

# derivers, catalog fan-out, adapt roster
ls src/infrastructure/compilers/runtime/theme/runtime/lowering/runtime/derivation/chrome | wc -l
node --input-type=module -e "import('./scripts/check/family-cut/index.mjs').then(m=>console.log([...m.declaredFanOutFamilies().keys()].sort().join(' ')))"
sed -n '23,80p' src/foundation/contracts/kernel/adaptation/composition/families/registry/index.ts

# the keyboard census
grep -rn "\(document\|window\)\.addEventListener(['\"]keydown" src --include=*.ts --include=*.tsx \
  | grep -v "/tests/" | grep -v "/engines/classic/\|/engines/rustic/"

# the --ds-shell-* seam
grep -rl -- "--ds-shell-" src/foundation/tokens/css src/components
```
