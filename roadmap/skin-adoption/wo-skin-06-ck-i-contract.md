# WO-SKIN-06 CK-I (surfaces long tail) — migration contract

## ORCHESTRATOR ADJUDICATION (settled — migration agents treat these as final; ONE draft claim is CORRECTED below)

Drafted by a peer, adjudicated by the orchestrator. Load-bearing claims DRILLED against source:

**ACCEPTED (verified):**
- **DRAFTER NOTE 1 — `surfaces/pages/forms/**` is already migrated under CK-D; EXCLUDE it. This is the
  most important finding in the contract and it is CONFIRMED FOUR WAYS**: `guided-draft-form.css`'s
  header reads "WO-SKIN-06 / CK-D/R"; all four forms files (`guided-draft-form`, `form`, `wizard`,
  `detail-form`) count `0` today; `wo-skin-06-ck-d-contract.md:31` lists "guided-draft-form 66, form 3,
  wizard 2, detail-form 1" in its R unit; `guided-draft-form/index.tsx` already carries 58 `data-part`
  stamps + a `ds-surface` root. The CK-I inventory re-swept a subtree CK-D finished — **re-migrating
  these would silently clobber committed work.** RULING: ACCEPTED. CK-I scope = 43 files / ~397 sites.
  (The ~3-site residual vs the 394 prediction is acceptable; the pre-step establishes exact counts.)
- **`ds-header`/`ds-sidebar` bare classes collide** (`ds-header` in `structures/headers/{form,edit}`;
  `ds-sidebar` across tenant artifacts/appearance compiler) → use the two-class `ds-surface ds-header`
  / `ds-surface ds-sidebar`. RULING: ACCEPTED.
- **Two-anatomy-model law (§0)** — component model for Population 2 (`stats-grid` et al. render their
  own DOM), P-79 surface model for Populations 1/3/4 (read directly from the shipped
  `guided-draft-form.css`/`detail-form-surface.css`/`wizard-surface.css`). RULING: ACCEPTED.
- **`SurfaceErrorBoundary` crash-safe exemption (Trap 3)** — inline hex must survive a CSS-loading
  crash; an external skin can't. RULING: ACCEPTED IN PRINCIPLE. Implementation note: registering a NEW
  exemption category `SKIN-EXEMPT-CRASH-SAFE-FALLBACK` means the gate (`engine-token-audit.mjs` /
  `skin-exemptions.json`) must actually RECOGNIZE it — the migration wires the category into the gate,
  not just names it, or the exemption is decorative. Drill that when I-1 lands.

**CORRECTED (drilled — the draft is WRONG here):**
- **Trap 2's `.ds-collection-preview-rail__resize` selectors are NOT dead.** The draft claims the class
  "does not exist anywhere in the codebase" — but it grepped `selection-preview-rail/index.tsx` (the
  wrong file). The class IS applied at **`collection-workspace/index.tsx:1079`** (`className=
  "ds-collection-preview-rail__resize"`, an absolutely-positioned resize handle), and
  `.ds-collection-enhanced` IS put on the root at :1659/:2170 when `enhanced`. So the ENHANCED_CSS rule
  at :439 (`…__resize:focus-visible { outline… }`) is LIVE, and the `:hover > *`/`:focus-visible > *`
  rules at :433-434 target the handle's children. **RULING: PRESERVE these selectors byte-exact — do
  NOT drop them as dead** (dropping the focus-visible outline is a real behavior change, not byte-exact).
  The genuine, surviving Trap 2 point: the `.ds-resize-handle`/`.ds-resize-handle__bar` rules (:428-431)
  DO overlap with `data-table/engines/modern.tsx:900-905`'s own resize-handle CSS — keep THAT as the
  STOP-AND-VERIFY (report the cross-component overlap, let the team decide ownership), but the trap is
  "preserve + report," never "drop dead selectors." Migration agents: transcribe ALL of ENHANCED_CSS
  verbatim into the skin; the only open decision is the `.ds-resize-handle` ownership flag, not deletion.
- **`operations/kanban/index.tsx`'s `color: col.color` is NOT paint and is NOT a C hatch.** The value is
  copied into a `KanbanColumnDef` and passed to `PatternKanbanBoard`; no DOM `style` prop is written in
  this surface. The child pattern owns the eventual per-column paint and its own runtime-value floors.
  **RULING: leave this TypeScript value byte-identical and register a floor of 1 under
  `SKIN-EXEMPT-NOT-PAINT`.** CK-I therefore owns **7**, not 8, real C hatch sites. Its final scoped
  residual is 16: 8 crash-safe fallback sites + 7 story/test-helper sites + this 1 NOT-PAINT site.

**Judgment calls:** 5-unit population split — ACCEPTED. `surface-states` 5 exports in one skin file —
ACCEPTED (organizational). Thin-tail consolidation (one shared skin vs per-file) — DEFERRED to the
migration: land per-file by default for consistency; a single shared `surface-page-chrome.css` is
allowed ONLY if the sites are proven byte-identical across files first. render-dispatch own skin file —
ACCEPTED (1-TSX-to-1-skin convention).

**OPEN QUESTION (not resolved by this contract, flag to owner):** DRAFTER NOTE 8 found ~8
`surfaces/pages/**` subfolders (`admin/file-browser`, `data/detail`, `experience/{empty-state,
oauth-transition,onboarding}`, `operations/{operational,scheduler}`) that appear in NEITHER the
inventory's 47 NOR the counter's output at all. This may be a program-wide tracked-scope gap. Do NOT
expand CK-I to cover them — it needs a separate scope audit against the full WO-06 file census.

---

## DRAFTER NOTES FOR THE ORCHESTRATOR

Read `wo-skin-06-ck-i-inventory.md` in full, the CK-C/CK-H2 contracts (templates), `migration-kit.md`
+ `migration-kit-addendum.md`, then independently re-ran the counter for the inventory's own stated
scope grep and spot-verified the structural claims by reading source, before writing. This checkpoint
broke the established methodology in one significant, load-bearing way — surfaced loudly per your
instruction, not smoothed over.

**1. HEADLINE FINDING — the inventory's own scope is stale by 4 files / 72 sites: `surfaces/pages/
forms/**` was already migrated under CK-D and must be excluded from CK-I entirely.** The inventory
devotes its longest single write-up (§7) to `guided-draft-form/index.tsx` as "the single largest
surfaces/pages file" (66 sites, 1093 lines, `DraftStatusBadge`/`SectionNav`/validation-severity
coloring) and groups `form`/`wizard` into its "thin tail" (§8) as `personality-helpers` importers. **I
re-ran the counter on the inventory's own scope grep and all four `surfaces/pages/forms/**` files
(`guided-draft-form`, `form`, `wizard`, `detail-form`) show exactly `0` sites.** I did not stop at the
number — I confirmed why: `tokens/css/components/skin/{guided-draft-form,detail-form-surface,
wizard-surface}.css` already exist, `guided-draft-form.css`'s own header comment reads **"WO-SKIN-06 /
CK-D/R"**, `guided-draft-form/index.tsx` already carries 58 `data-part=` stamps and a
`ds-surface ds-guided-draft-form` root class, and — most conclusively — `wo-skin-06-ck-d-contract.md`
itself lists, verbatim, in its "R — record + workflow + surfaces" unit: **"guided-draft-form 66, form 3,
wizard 2, detail-form 1"** — the exact site counts the CK-I inventory re-describes as if they were
still pending. `wo-skin-06-plan.md` confirms the scope was always CK-D's: "Split D1 = patterns/forms,
D2 = record + workflow + surfaces/pages/forms." The CK-I inventory's scope grep (`surfaces/pages`,
unqualified) mechanically re-swept a subtree CK-D had already claimed and finished, and its author
described pre-migration content that no longer exists in the current source. **This contract excludes
`surfaces/pages/forms/**` entirely.** CK-I's real scope is **43 files, 397 sites** (my fresh count).
466 (inventory) minus 72 (CK-D's own claimed forms total) predicts 394, close to but not exactly my
397 — a ~3-site gap I did not fully chase given the time budget, most likely explained by lexer
changes landing between the inventory's writing and now (the inventory itself documents at least two
such changes mid-task: commit `de431091` and the historical comment-adjacency report adjudicated in
item 2). The
magnitude is small enough not to change this contract's shape; flagging the residual rather than
presenting the 397 figure as reconciled to the last site. Every section below uses the corrected
43/397 figures. If the orchestrator has independent reason to believe any of the forms files still
need attention, that's a different, much smaller task than what the inventory describes — the 66-site
`guided-draft-form` narrative is not live work.

**2. Re-adjudicated against the current counter:** the historical comment-adjacency defect is fixed.
`scripts/lib/inline-paint-counter.mjs` now tracks `prevMeaningful`, so comments no longer hide a live
paint declaration that follows them. A fresh measurement reports both sites in
`personality-helpers.tsx` (2, not the stale 1 from the inventory). Zero remains necessary but is never
the only certification evidence: the AST invariant, direct source review and visual diff still guard
against a future lexer blind spot.

**3. A real, substantial finding the inventory never mentions: `collection-workspace/index.tsx` injects
a THIRD `<style>` block, `ENHANCED_CSS`, that cross-targets another component's classes.** The
inventory's §7 only names `PAGE_SIZE_CONTROL_CSS` (6 selectors). Reading the file directly found a
second, separate injection at `index.tsx:397-441` (rendered conditionally when `enhanced =
presentation?.enhancedInteractions ?? false`) with ~13 live row hover/selection/focus-visible rules.
Its `.ds-collection-preview-rail__resize:hover`/`:focus-visible` selectors target the resize handle
rendered by this same file and must be preserved byte-exact. The remaining rules target
`.ds-resize-handle`/
`.ds-resize-handle__bar` (`:432-436`), which **are real and are ALSO independently styled by
`patterns/data/data-table/engines/modern.tsx:900-905`** with a near-identical `:hover`/`:focus-visible`
rule set for the same classes. When `collection-workspace` renders an internal `PatternDataTable` with
`enhanced=true`, both injected stylesheets paint the same elements — a real cascade-collision risk
(whichever `<style>` tag lands later in the DOM wins) that exists TODAY, independent of this migration,
and that migrating `ENHANCED_CSS` into a skin file without checking this could either fix or worsen it
depending on unlayered-vs-unlayered load order. Flagged as Trap 2 below; this needs a STOP-AND-VERIFY
the inventory never budgeted for.

**4. The P-79 anatomy law for `surfaces/` is not something I derived — it is already shipped, and I
read it directly in the one place it's documented.** `guided-draft-form.css`'s header comment (visible
BECAUSE this file is technically excluded from migration but not from reading) states it verbatim: **"A
SURFACE OWNS NO DOM (P-79). IT OWNS COMPOSITION."** — `Grid`/`Card`/(in modern) `Button` never forward a
consumer-supplied `data-part` (no rest-spread, or a later internal spread rewrites it), so a surface's
own `data-part` stamps only reach the raw `Box`/`Flex`/`Text` nodes it renders directly; composed
primitives are addressed by a BEM-ish `className` the surface passes down instead (e.g.
`.ds-detail-form__error-card[data-part='root'][data-variant]` in `detail-form-surface.css` — the
surface's own class combined with the primitive's own `data-part` where the primitive happens to
expose one). This directly answers the team-lead's Q1 structural question and governs §2 below — I
did not need to invent an anatomy model for surfaces, I needed to read the one that already shipped
and confirm it's the load-bearing law here too, which I did (three shipped surface skins all follow it
identically: `guided-draft-form.css`, `detail-form-surface.css`, `wizard-surface.css`).

**5. Scope-class collisions found and avoided.** `ds-header` and `ds-sidebar` (bare, single-class) are
**not free** — `ds-header` is already used by `structures/headers/{form,edit}/index.tsx` and their
shipped skins; `ds-sidebar` has 18+ hits across `theme.css`, tenant artifacts (`rottay`/`bithire`/
`evnto`), and the appearance compiler — it is almost certainly the `--ds-sidebar-*`
`BrandTheme.chrome.sidebar` token surface (17 fields, per this repo's own CLAUDE.md), not a coincidence.
Minting `ds-header`/`ds-sidebar` as bare scope classes for `surfaces/layout/{header,sidebar}` would
collide. The two-class combination `ds-surface ds-header` / `ds-surface ds-sidebar` is grep-confirmed
free (nothing else uses the `ds-surface` prefix), and is the correct form anyway per item 4's law — so
the fix is free, not a workaround. All other proposed names checked in §2.1 are free as bare strings
too, this pair was the only near-miss.

**6. Independently checked all 43 files for imperative writes / portals / keyframes / `<style>`
injections beyond what the inventory's targeted reads covered — confirms the inventory's claim that
`stats-grid`, `gallery-view`, and `collection-workspace` are the ONLY three files carrying these
mechanisms** (plus the newly-found `ENHANCED_CSS`, item 3, still inside `collection-workspace`). Spot-
checked 4 of the 9 files the inventory names as sharing `stats-grid` rustic's bare `@keyframes pulse`
name — confirmed 2 real hits (`patterns/visualization/tree-view/engines/rustic.tsx`,
`patterns/communication/live-feed/engines/rustic.tsx`); did not chase all 9, the collision shape is
established.

**7. Judgment calls the orchestrator should bless or override:**
- **5 units, not fewer.** Given 43 files across four structurally distinct populations (shared
  foundation infrastructure; genuine components mis-scoped under a "surfaces"-adjacent grep; two
  large bespoke page shells with real CSS mechanisms; a uniform thin tail), I split by population
  rather than by raw site count, and split the thin tail itself in two for parallelism (it's the one
  population large enough — 22 files — to benefit from a second agent without any real risk of the
  two agents stepping on each other, since every file in it is independent and uniform).
- **`surfaces/foundation/**` gets per-EXPORT scope classes, not one class per file** — `shared.tsx`
  exports `SurfaceActionBar`/`SurfaceTabbedLabel` (zero paint, skip) and `SurfaceSectionCard` (the
  file's one site); `states/surface-states.tsx` exports 5 components. Mirrors CK-F's `assistant`/
  `presence` per-export-island precedent, not a new invention, but I chose to still land all 5
  `surface-states.tsx` exports in ONE skin file (they're small, co-located, and conceptually one
  lifecycle kit) rather than 5 files — a organizational call, not a technical requirement; the
  orchestrator may prefer 5 separate files for consistency with the per-export-class pattern.
- **`render-dispatch.tsx` gets its own skin file**, not folded into `collection-workspace.css`, even
  though it's "internal-only" and conceptually part of the same surface — kept to the program's
  standing 1-TSX-file-to-1-skin-file convention rather than special-casing it.
- I did **not** verify every one of the ~22 thin-tail files' exact `data-part` needs individually (the
  inventory itself only fully read 10 of them; I did not re-read the remaining ~12 myself either,
  given the extreme, inventory-confirmed uniformity of the pattern) — §2.2's thin-tail vocabulary is a
  strong default (`root`, `muted-text`, `divider`), not a file-by-file audit. Flagging this explicitly
  rather than presenting it as verified to the same depth as the foundation/component clusters.
- **8 `surfaces/pages/**` subfolders with real `index.tsx` files never appear in the counter's output
  at all** (not even at `0`) — `admin/file-browser`, `data/detail`, `data/tests` (a test file, not a
  page), `experience/{empty-state,oauth-transition,onboarding}`, `operations/{operational,scheduler}`.
  These are not part of the inventory's 47 and not part of my corrected 43 — I did not read their
  content and am not assigning them here. Flagging as a possible gap in the whole WO-06 program's
  tracked scope, worth a team question, not something this contract resolves or should expand to
  cover.

---

Reads on top of `wo-skin-06-ck-i-inventory.md` (the site-by-site truth, corrected per DRAFTER NOTE 1)
and `migration-kit.md` + `migration-kit-addendum.md` (the mechanics). The inventory is normative for
*what* paint exists; this contract is normative for *how* it moves — except where DRAFTER NOTE 1
supersedes the inventory's scope outright.

**Scope: 43 files, 397 sites (corrected — see DRAFTER NOTE 1), across four structurally distinct
populations:**

1. `surfaces/foundation/**` (7 files, 26 counted sites total — but only ~12 across 3 files actually
   migrate; `SurfaceErrorBoundary` (8) is permanently exempt and `story-helpers`/`test-utils` (7) are
   dev/test-only, not user-facing) — shared infrastructure, some genuinely fleet-wide.
2. `patterns/data/{stats-grid,cell-renderers,gallery-view,grid-view,bulk-select-toggle}` (6 files,
   ~137 sites) — genuine components (imperative writes, real injected CSS, engine splits in one case)
   that happen to fall inside the brief's `surfaces`-adjacent scope grep; NOT surfaces, follow the
   standard component anatomy model, not P-79.
3. `surfaces/pages/workspace/**` (5 files, 141 sites) + `surfaces/layout/**` (3 files, 10 sites) — the
   large, bespoke page shells and layout chrome; real interaction mechanisms hiding in "surface"
   files, per Q1.
4. `surfaces/pages/{admin,data,experience,operations}/**` (~22 files, ~82 sites) — the thin,
   uniform tail; near-free to migrate.

**`surfaces/pages/forms/**` (`guided-draft-form`, `form`, `wizard`, `detail-form`) is OUT OF SCOPE —
already migrated under WO-SKIN-06 CK-D's "R" unit (DRAFTER NOTE 1). Do not touch these 4 files.**

---

## 0. The one law that governs this checkpoint: two anatomy models, not one, and the split follows population, not folder name

**Q1 answered**: surfaces do not uniformly "carry real paint" or "behave as thin recipes" — the split
is sharp, and it does not track the `surfaces/` vs `patterns/` folder boundary either. It tracks
**whether the file renders its own raw DOM or composes already-anatomy-bearing primitives**:

- **Population 2** (`stats-grid`, `cell-renderers`, `gallery-view`, `grid-view`, `bulk-select-toggle`)
  renders its own elements directly (`<div style={{...}}>`, raw `React.createElement`) the same way
  every `structures/workspace`/`patterns/communication` component in CK-C/CK-F did. **These get the
  standard component anatomy model**: `ds-pattern-<comp>` (+`ds-engine-<engine>` where split) root,
  `data-part` on every element the file itself renders. Nothing about P-79 applies to them — they are
  not surfaces in the P-79 sense even though the brief's scope grep happens to sweep them in.
- **Populations 1, 3, 4** (`surfaces/foundation`, `surfaces/pages/**`, `surfaces/layout/**`) are true
  surfaces: **P-79 governs them** — "a surface owns no DOM, it owns composition." Their own root gets
  `ds-surface ds-<comp>`; `data-part` lands only on the `Box`/`Flex`/`Text` nodes the surface itself
  renders; composed primitives (`Card`, `Grid`, `Button`, `PatternFilterPanel`, etc.) are addressed by
  a `className` the surface passes down (BEM-shaped: `ds-<comp>__<part>`), combined with that
  primitive's own `data-part` where one exists. This is not a new law invented for this contract — it
  is read directly from the three already-shipped surface skins (`guided-draft-form.css`,
  `detail-form-surface.css`, `wizard-surface.css`), all of which apply it identically (DRAFTER NOTE 4).
  `ActivitySurface` is the explicit sibling-island exception: the `PatternActivityLog` and the
  pagination `Flex` each carry `ds-surface ds-activity` because there is no common owned wrapper.
  Pagination rules therefore anchor on the same node
  (`.ds-surface.ds-activity[data-part="pagination"]` or `.ds-activity__pagination`), never on the false
  descendant shape `.ds-surface.ds-activity [data-part="pagination"]`.

**Q2 answered**: `surfaces/foundation/**` is the first genuinely-shared vocabulary confirmed in this
whole program (unlike CK-C/CK-D/CK-G's false starts) — verified by real import-path grep, not
location inference. `shared.tsx` (21 real importers) and `personality-helpers.tsx` (8 real importers)
are real, high-leverage, production infrastructure. `SurfaceErrorBoundary.tsx` is a **new, principled,
permanent exemption**: its 8 hardcoded-hex sites exist so the fallback UI survives a crash in the
theming system itself — an external unlayered skin is still a stylesheet dependency and might not
apply if the crash IS a CSS-loading failure. Recommend a named exemption,
`SKIN-EXEMPT-CRASH-SAFE-FALLBACK`, distinct from both the B (runtime-value) and C (custom-property
hatch) categories already in use. `story-helpers.tsx`/`test-utils.tsx` are real but dev/test-only —
their paint never ships to a production bundle; out of scope for a user-facing skin (not exempted,
just not applicable — nothing to migrate for user-facing purposes).

**Q3 answered**: `cell-renderers` is per-column-type (A), not per-datum (B) — confirmed. The inventory's
own two corrections to the triage's C-hatch table (`barColor`, `DraftStatusBadge`'s color — the latter
now moot per DRAFTER NOTE 1, since `guided-draft-form` is out of scope, but the underlying LESSON is
not moot) both trace a `background: <bareIdentifier>` to a bounded lookup table, not an open caller
value. **The law this checkpoint adds to the program**: `background: <bareIdentifier>` shape alone is
never sufficient evidence of a hatch — trace the identifier to its source before classifying. The
checkpoint's real hatch sites (`stat.color`, `mono`'s `options?.color`, `score`'s `height`, and the
accent-bar magnitude) are genuinely open-ended caller values; `operations/kanban`'s `col.color` is
domain-data forwarding rather than DOM paint, while `cell-renderers`' `barColor` and (formerly)
`guided-draft-form`'s status color are not.

---

## 1. Migration units — five parallel agents, split by population

- **Unit I-1 — `surfaces/foundation/**`** (7 files read, but only 3 files / ~12 sites actually
  migrate — `SurfaceErrorBoundary` is read-and-exempted, `story-helpers`/`test-utils` are read-and-
  skipped as dev/test-only; touches 21+ downstream consumers through `shared.tsx` alone — highest-
  leverage, most-careful unit despite its small migrated-site count). Skins:
  `components/skin/surface-accent-bar.css` (`personality-helpers.tsx` — `SurfaceAccentBar`),
  `components/skin/surface-section-card.css` (`shared.tsx` — `SurfaceSectionCard`; `SurfaceActionBar`/
  `SurfaceTabbedLabel` carry zero paint, skip),
  `components/skin/surface-states.css` (`states/index.tsx` + `states/surface-states.tsx` — the 5-part
  lifecycle kit). `SurfaceErrorBoundary.tsx` is **read, not migrated** — file its exemption, do not
  write a skin for it. `story-helpers.tsx`/`test-utils.tsx` are **not migrated** — dev/test-only, no
  user-facing skin applies. Owns Trap 1 (the comment-adjacent background in
  `personality-helpers.tsx`, now correctly counted) and Trap 3 (the crash-safe exemption).
- **Unit I-2 — `stats-grid` + `gallery-view` + `grid-view` + `cell-renderers` + `bulk-select-toggle`**
  (6 files, ~137 sites). Skins: `engines/modern/skin/stats-grid.css`, `engines/rustic/skin/
  stats-grid.css` (stats-grid is engine-split), `components/skin/gallery-view.css`,
  `components/skin/grid-view.css`, `components/skin/cell-renderers.css`,
  `components/skin/bulk-select-toggle.css` (6 files). Owns Trap 4 (stats-grid's 6 rustic imperative
  writes + real `stat.color` C-hatch + the `--ds-stats-grid-*` vocabulary split — rustic honors it,
  modern doesn't, preserve both) and Trap 5 (gallery-view's real `GALLERY_HOVER_STYLES` + the bare
  `pulse`/`wave` keyframe collision risk in stats-grid rustic — rename on migration, per the kit's
  standing keyframe law, given these bare names are NOT safe to leave as-is unlike CK-H2's already-
  namespaced cases). `cell-renderers` gets the Q3 hatch-tracing treatment; `grid-view` is the
  checkpoint's thinnest file (9 sites, `renderCard` is a required caller prop — most of what LOOKS
  like this component's paint is the caller's).
- **Unit I-3 — `surfaces/pages/workspace/**` + `surfaces/layout/**`** (8 files, 151 sites). Skins:
  `components/skin/collection-workspace.css`, `components/skin/collection-workspace-render-dispatch.css`,
  `components/skin/record-workbench.css`, `components/skin/command-center.css`,
  `components/skin/decision-inbox.css`, `components/skin/collection-shell.css`,
  `components/skin/layout-header.css`, `components/skin/layout-sidebar.css` (8 files). **The highest-
  complexity unit** — owns Trap 2 (the newly-found `ENHANCED_CSS` cross-component collision risk with
  `data-table`'s own resize-handle CSS, plus the live `.ds-collection-preview-rail__resize`
  selectors that must be preserved), the `PAGE_SIZE_CONTROL_CSS` real hover/focus-within mechanism, `render-dispatch`'s
  hand-rolled pagination footer (flag the DS `Pagination` primitive duplication to the team, do not
  fix it here), and `command-center`'s `Record<string, {...}>` mapped-type false-positive (a new
  variant of the interface-member blind spot — 9 real sites, not 10). Give it the most careful agent.
- **Unit I-4 — thin tail A: `surfaces/pages/{admin,data}/**`** (13 files, ~63 sites). Skins: one
  `components/skin/<kebab-page-name>.css` per file (13 files) — or, given the extreme uniformity
  (DRAFTER NOTE 7), the orchestrator may prefer a single shared `components/skin/surface-page-chrome.css`
  keyed per-page by each page's own `ds-surface ds-<comp>` root, IF the near-identical `<Text
  style={{color: 'var(--ds-color-text-muted)'}}>` and `borderBottom` divider sites turn out to be
  byte-identical across files (they are STRING-identical per the inventory's own read — worth
  consolidating into one shared rule set rather than 13 near-duplicate ones, a genuine, low-risk
  dedup opportunity this checkpoint's uniformity makes safe). Recommend the orchestrator decide this
  once, not per-file.
- **Unit I-5 — thin tail B: `surfaces/pages/{experience,operations}/**`** (9 files, ~19 sites). Same
  shape and same one-shared-rule-set option as Unit I-4. Its `operations/kanban/index.tsx:42`
  `color: col.color` occurrence is a NOT-PAINT counter false positive: preserve it as domain-data
  forwarding and protect its floor; do not manufacture a CSS hatch in this surface.

Agents run in parallel; each stages ONLY its own files by explicit path (never `git add -A` — shared
tree). **Entrypoint wiring is reserved for the orchestrator** — agents create skin files but do NOT
edit `foundation/base.css` or `entrypoints/styles.css`.

---

## 2. Anatomy pre-step (inert, runs BEFORE any migration; orchestrator-owned)

**Zero `data-part` anywhere across all 43 files (grep-confirmed on every file this contract touches).
Zero existing scope classes on any of them either** — this checkpoint is fully greenfield, the same
shape as CK-C, not CK-H2's partial head start.

### 2.1 Scope-class convention (two models — see §0)

| Population | Tier | Scope class shape | Precedent |
|---|---|---|---|
| `stats-grid` (modern/rustic) | patterns/data, engine-split | `ds-pattern-stats-grid ds-engine-<engine>` | standard, (0,2,0) |
| `gallery-view`, `grid-view`, `cell-renderers`, `bulk-select-toggle` | patterns/data, engine-agnostic single root | `ds-pattern-<comp>` | (0,1,0), CK-C's `status-filter-pills` precedent |
| `surfaces/foundation/**` exports | surfaces, per-export islands | `ds-surface ds-<export-kebab>` (e.g. `ds-surface ds-accent-bar`, `ds-surface ds-section-card`) | (0,2,0), P-79 |
| `surfaces/pages/**`, `surfaces/layout/**` | surfaces, one root per page | `ds-surface ds-<comp>` | (0,2,0), **already shipped** — `guided-draft-form.css`/`detail-form-surface.css`/`wizard-surface.css` |

All names grep-verified free (DRAFTER NOTE 7) **except** `ds-header`/`ds-sidebar` as bare single
classes, which collide with existing infrastructure — use the two-class `ds-surface ds-header`/
`ds-surface ds-sidebar` combination, confirmed free (DRAFTER NOTE 5). Composed primitives inside any
surface get a passed-down `className="ds-<comp>__<part>"` (BEM child, not a new root scope) where the
primitive itself doesn't expose a `data-part` — per P-79, do not expect `data-part` to reach through
`Card`/`Grid`/`Button`.

### 2.2 `data-part` / classname vocabulary

- **`stats-grid`**: `card`, `icon`, `value`, `label`, `description`, `trend`, `skeleton`,
  `skeleton-bar` (the dead BEM `__item`/`__bar` classes on the loading skeleton get folded into real
  `data-part` stamps, replacing the unreferenced hooks, not left dangling).
- **`gallery-view`**: `card` (the classes `ds-gallery-card`/`ds-gallery-checkbox` already exist and
  are REAL, referenced by `GALLERY_HOVER_STYLES` — do not rename them, add `data-part` alongside),
  `checkbox`, `image`, `empty-state`.
- **`grid-view`**: `card-shell`, `checkbox-overlay`, `empty-state`. Most of what a consumer sees is
  the CALLER's `renderCard` content — this pattern's own anatomy only covers its wrapper chrome.
- **`cell-renderers`**: no single root (it's a function library, not a component) — each function's
  returned element gets its own `data-part` matching the function name (`avatar-name`, `status-badge`,
  `mono`, `score-bar`, `boolean-icon`, `icon-text`, …), scoped under `ds-pattern-cell-renderers`.
- **`surfaces/foundation`**: `SurfaceAccentBar` → `bar` (`data-style` mirroring `barStyle`);
  `SurfaceSectionCard` → `description`; the 5 `surface-states` components → `icon`, `title`,
  `description` (empty/error cards), `banner` (stale/offline banners, which own most of the combined
  9 sites).
- **`surfaces/pages/workspace` + `surfaces/layout`**: `root`, `title`, `muted-text`, plus
  component-specific: collection-workspace's `page-size-control` + 4 children (already real BEM
  classes, keep them, add `data-part` alongside), `utility-icon-toggle` (`data-active`);
  render-dispatch's `pagination-prev`/`pagination-next` (`data-disabled`); command-center's
  `insight-tile` (`data-tone` mirroring `INSIGHT_TOKENS`' 4-way key); record-workbench's `status-badge`
  (`data-variant`), `tab` (`data-active`); decision-inbox's `selection-bar`, `divider`.
- **`surfaces/pages/{admin,data,experience,operations}` thin tail**: `root`, `muted-text` (the single
  most repeated site in the whole checkpoint), `divider` (the `borderBottom` row separator), plus
  the handful of named STATE-SELECTED sites per file (`experience/chat`'s active row, `experience/
  media`'s selected border, `experience/notification`'s unread `borderLeft`, `data/search`'s
  selected background/border — this last one ALSO sets a real `'--ds-card-bg-hover'` custom property
  inline, a working hatch-adjacent pattern already in use; preserve it, don't "fix" it into something
  else).

Never a bare `[data-part]` — always anchor to the scope class.

### 2.3 The two invariants (inert until proven — kit + README law)

The pre-step must prove BOTH before any paint moves: (a) the counter is byte-identical to HEAD for all
43 files in scope, with a direct source review as an independent guard against lexer blind spots;
(b) the element tree is unchanged, proven by a
TS-compiler AST diff with attributes stripped, DRILLED. Record visual baselines for all files in scope
(both engines for `stats-grid`) after stamping, and stability-pass them before any unit starts writing
CSS.

### 2.4 Pre-step evidence (certified 2026-07-14)

- Exact scope: **43 files / 397 counter sites**. Of those, **40 production renderables / 382 sites**
  are migratable; the permanent excluded tail is 15 sites (`SurfaceErrorBoundary` 8 crash-safe,
  story/test helpers 7). Paint counters are byte-identical before/after anatomy: **397 → 397** overall
  and **382 → 382** across the migratable sources.
- The stripped-AST drill preserves the rendered element/behavior tree for all 40 sources: 38 are
  mechanically identical after removing `className`/`data-*`; `personality-helpers` differs only by
  inert parentheses and `cell-renderers` by the reviewed internal split needed to give two existing
  createElement branches distinct anatomy. No paint moved.
- `operations/kanban` keeps `color: col.color` byte-identical as domain-data forwarding and carries
  the exact `SKIN-EXEMPT-NOT-PAINT` floor of 1. CK-I has 7 real bounded C hatches. The three excluded
  files are untouched.
- Focused contracts: **12/12** green across both test files. They render all 39 conceptual public
  renderables, both stats engines, the premium/enhanced collection branch, the resizable preview
  rail, and Activity's two sibling scope islands.
- Visual evidence: **32 committed baselines** (8 families × rottay dark/bithire light ×
  modern/rustic), recorded in 4/4 passing cases and then passed **two independent 4/4 no-update
  stability runs** at `maxDiffPixelRatio: 0.0005`. The clock and particle RNG are fixed.
- Core/showroom typechecks, the core production build, the showroom production build and
  `engine-token-audit --check` are green; skin parse/unwired/exemption/dead-part gates remain exact 0.

---

## 3. The five traps — each is a STOP-AND-VERIFY, not a footnote

**Trap 1 — preserve the comment-adjacent paint even though the counter now sees it.**
`surfaces/foundation/personality-helpers.tsx` reports the correct 2 sites, including
`SurfaceAccentBar`'s comment-adjacent `background`. Unit I-1 must migrate both and still perform a
direct read: a zero counter is necessary, not sufficient, even after the lexer fix.

**Trap 2 — `collection-workspace/index.tsx` injects a THIRD stylesheet, `ENHANCED_CSS`, with a real
cross-component collision risk; STOP-AND-VERIFY before migrating it.** Confirmed at
`index.tsx:397-441`, gated on `enhanced = presentation?.enhancedInteractions ?? false`. Its
`.ds-collection-preview-rail__resize:hover`/`:focus-visible` rules target the live resize handle and
its child bar in this same file: preserve every one byte-exact. The remaining rules target
`.ds-resize-handle`/`.ds-resize-handle__bar`
(`:432-436`), which **are also independently styled by `patterns/data/data-table/engines/
modern.tsx:900-905`** with near-identical `:hover`/`:focus-visible` rules for the same classes — a
live, pre-existing cascade-collision risk (whichever injected `<style>` tag lands later in the DOM
wins) that exists in production TODAY, before this migration touches anything. Migrating `ENHANCED_CSS`
into an unlayered skin file does not obviously fix or worsen this — both the skin and data-table's own
injected `<style>` are unlayered, so load order still decides. Do not silently resolve this collision
as a side effect of migration; report it, let the team decide whether `collection-workspace` should
still own these rules at all (they arguably belong to `data-table`'s own skin, not a consuming
surface's).

**Trap 3 — `SurfaceErrorBoundary.tsx`'s 8 hardcoded-hex sites must never be migrated; this is a new,
permanent exemption class, not a B or C site.** Its own doc comment: "The fallback uses inline styles
so it renders correctly even when the theming provider or CSS variables are unavailable." An external
unlayered skin file is still a stylesheet dependency — if the crash IS a CSS-loading or `ThemeProvider`
failure, the skin might not apply while a literal inline `style={{}}` always does. Recommend the
orchestrator register `SKIN-EXEMPT-CRASH-SAFE-FALLBACK` as a named, permanent exemption (distinct from
runtime-value B and custom-property-hatch C) and gate on it. Do not write a skin file for this
component under any circumstances.

**Trap 4 — `stats-grid` carries two independent risks: 6 LIVE rustic imperative writes with nothing to
contest them, and a real cross-repo `@keyframes pulse`/`wave` bare-name collision.** The 6 imperative
writes (`onFocus`/`onBlur` → `boxShadow` double-ring; `onMouseEnter`/`onMouseLeave` → `boxShadow`+
`transform` hover-lift) are LIVE because `StatCard`'s root carries no className in either engine —
nothing races them, same shape as CK-G's command-palette. **Migration correction:** the draft's
instruction to replace these with `:hover`/`:focus-visible` was rejected by adversarial review:
`onFocus` historically rings mouse focus too, and the handlers are explicitly last-event-wins, while
pseudo-classes compose by fixed cascade order. Preserve those event semantics with paint-free
behavioral `data-shadow-state`/`data-transform-state` writes and let the skin select those states;
do not substitute pseudo-classes. Separately: rustic's
`@keyframes pulse`/`@keyframes wave` are bare, unprefixed, and grep-confirmed collide with at least 2
other files' identically-named keyframes (`tree-view/rustic`, `live-feed/rustic`; inventory claims 9
total, not independently exhausted here) — **unlike CK-H2's already-namespaced keyframes, these are
NOT safe to leave as-is.** Rename to `ds-stats-grid-pulse`/`ds-stats-grid-wave` per the kit's standard
keyframe-rename law, carrying the exact keyframe body verbatim. Also preserve the `--ds-stats-grid-*`
vocabulary split exactly as found: rustic honors all 14 declared namespace tokens throughout; modern
uses zero of them, reading generic `--ds-surface-card`/`--ds-elevation-1`/`--ds-color-*` instead. Do
not consolidate — a tenant overriding `--ds-stats-grid-card-bg` today has zero effect on modern by
design (or by pre-existing bug; either way, not this migration's call to fix).

**Trap 5 — `gallery-view`'s hover/selection stylesheet is real, working, and must migrate as a
mechanism, not just as counted paint keys.** `GALLERY_HOVER_STYLES` (5 selectors: card `:hover`
box-shadow+transform, `:hover img` zoom, checkbox-reveal-on-hover via `:has(input:checked)`,
`:focus-visible` outline) is injected at two render points (`:547`, `:618`) and is the component's
ACTUAL interactivity — not dead, not orphaned, invisible to the site counter entirely (no paint-key
match, it's a raw template string). Unit I-2 must move this into `components/skin/gallery-view.css`
as real CSS rules anchored to the already-real `ds-gallery-card`/`ds-gallery-checkbox` classes (keep
those names — they're referenced elsewhere, do not rename), not just migrate the 18 counted
object-literal sites and consider the file done. A migration that trusts the counter alone will leave
this mechanism behind entirely.

---

## 4. Runtime, exemptions, specificity

**Zero category-B (runtime-value) sites confirmed anywhere in CK-I** (inventory §9, matches CK-G's
finding — B is concentrated in the brand-preview trio and chart leaves, neither in this checkpoint).
**7 real category-C hatch sites**, all genuinely open-ended caller values (not the `background:
<bareIdentifier>`-shaped false positives Q3 corrects): `cell-renderers`' `mono`'s `options?.color` +
`score`'s `height/2` (×2) = 3 sites; `stats-grid`'s `stat.color` (×3, modern icon+value, rustic value)
= 3 sites; `surfaces/foundation/personality-helpers.tsx`'s `SurfaceAccentBar` `borderRadius`
(thickness-driven magnitude) = 1 site. `operations/kanban`'s `col.color` is separately protected as
one `SKIN-EXEMPT-NOT-PAINT` site because it builds a `KanbanColumnDef`, not a DOM style. Use the standard
quoted-custom-property hatch (`'--ds-<comp>-<field>': value`) for each — name `stats-grid`'s
`--ds-stats-grid-accent` (grep-confirmed free, matches the inventory's own naming suggestion).
**Plus the one new permanent exemption**, `SurfaceErrorBoundary`'s 8 sites under
`SKIN-EXEMPT-CRASH-SAFE-FALLBACK` (Trap 3) — register this alongside, not instead of, the existing
B/C categories in `skin-exemptions.json`.

**Specificity (P-48).**
- `stats-grid`'s engine-split root and the other `patterns/data` engine-agnostic roots follow the
  standard component law: two-class (0,2,0) for stats-grid, single-class (0,1,0) + data-part ×3 for
  borders for `gallery-view`/`grid-view`/`cell-renderers`/`bulk-select-toggle`.
- All `surfaces/` roots (`ds-surface ds-<comp>`) are two-class, (0,2,0) — border-color rules need
  `data-part` REPEATED ×2 to reach (0,4,0); non-border wins at (0,3,0) with one `data-part`. This
  matches the shipped `guided-draft-form.css`/`detail-form-surface.css` precedent exactly. **EXCEPTION:
  `color` on a composed `<Text>`/`Typography.Text` needs (0,5,0)** — the Typography engine skin paints
  every `<Text>` at (0,4,0) via `[data-color]`; a (0,3,0) color rule loses once the inline color is
  stripped. On these two-class surface roots → data-part ×3; on the single-class `patterns/data`
  roots (`gallery-view` etc.) → data-part ×4; raw-element/icon color stays lower. This is especially
  live in the thin tail, whose single most-repeated site is `<Text style={{color:'…muted'}}>`
  (`muted-text`) — those MUST reach (0,5,0), not the (0,3,0) the thin-tail vocabulary implies. See the
  migration-kit specificity law; check `<Text>` vs raw at every color site.
- Composed-primitive rules (the P-79 `className="ds-<comp>__<part>"` shape) inherit the SAME (0,4,0)
  border floor requirement — a rule like `.ds-surface.ds-detail-form .ds-detail-form__error-card[data-
  part='root'][data-variant]` (the shipped precedent's actual selector) buys its specificity from the
  two root classes + the primitive's own repeated attributes, not from the BEM child class alone
  (classes only add 1 each to the b-column regardless of how many are chained).

**All skins are UNLAYERED** (P-76/P-47). **Never write `*/` inside a skin comment.**

---

## 5. Keyframes disposition

| File | Keyframe(s) | Action |
|---|---|---|
| `stats-grid/engines/modern.tsx` | `ds-stats-shimmer` (per-mount `<style>` injection) | Already `ds`-prefixed, low collision risk, but still unnamespaced-per-INSTANCE (re-declared every mount, no dedup guard — harmless only because byte-identical). Move to skin, drop the `<style>` tag; no rename needed for the name itself. |
| `stats-grid/engines/rustic.tsx` | `pulse`, `wave` (per-mount `<style>` injection) | **Trap 4 — bare names, real collision with ≥2 other files.** Rename to `ds-stats-grid-pulse`/`ds-stats-grid-wave`, move to skin, drop the `<style>` tag. |
| `surfaces/foundation/personality-helpers.tsx` | `ds-accent-bar-shimmer` (referenced by name in `animation:`, `barStyle==='animated'`) | **Referenced but never defined anywhere in the repo** (grep-confirmed) — the component's own comment says it "must be defined in the global DS stylesheet" and never was. Any of the 8 consuming surfaces passing `accentBarStyle: 'animated'` renders a static gradient today with no shimmer. This is not this migration's bug to fix silently — carry the `animation:` reference verbatim (byte-exact preserves the current, non-shimmering behavior) and flag the missing keyframe definition as a team decision (define it for real, or remove the dead reference — either is a deliberate visual-behavior change, out of scope here). |

`gallery-view`'s `GALLERY_HOVER_STYLES` and `collection-workspace`'s `PAGE_SIZE_CONTROL_CSS`/
`ENHANCED_CSS` are real CSS rule injections, not `@keyframes` — covered under Traps 2 and 5, not this
table.

---

## 6. Certification

### 6.1 Migration evidence (certified 2026-07-14)

- Migration commit: **`84f3cd70`**. The 40 production renderables now use **38 deliberately
  unlayered skins**, imported by both public CSS entrypoints and regenerated into all five tracked
  vertical bundles.
- Counter reconciliation: the 382 counter-visible sites in the migratable scope fell to **1**. That
  survivor is `operations/kanban`'s adjudicated `SKIN-EXEMPT-NOT-PAINT` domain forwarding; therefore
  all **381 true DOM-paint sites moved**. The 15 permanent foundation exclusions remain untouched and
  byte-identical.
- Adversarial review caught and closed three parity defects before certification: Rustic StatsGrid
  now preserves historical last-event-wins focus/hover behavior with paint-free data states;
  StatsGrid paint selectors use owned BEM hooks so `renderStat` consumer DOM cannot inherit default
  card paint; and Report's selected template border outranks the distinct modern and rustic Card
  interaction contracts.
- Contracts: **12/12** long-tail anatomy tests and **7/7** StatsGrid advanced engine tests green. The
  StatsGrid suite pins both consumer-owned DOM isolation and the exact rustic event sequence.
- Production evidence: core and showroom production builds green. The same 32 committed baselines
  passed **two independent 4/4 no-update runs** after migration at `maxDiffPixelRatio: 0.0005`; no
  snapshot was changed.
- Gate evidence: skin parse, unwired, exemption and dead-part counters remain exact zero. The
  hardened exemption/runtime-SVG machinery is committed separately so its proof surface is not
  conflated with the component migration.

Per unit, in order: (1) **byte-exact** = the component's/surface's visual spec passes against the
committed pre-step baselines, 0 pixels over `maxDiffPixelRatio: 0.0005`, stability-re-run; (2)
**counter delta reconciled by hand, with an independent direct read** — no unit may certify solely on
"counter shows 0"; each unit's report must
state it re-read every migrated function's source once, independent of the counter, specifically
checking for a paint key sitting immediately after a comment; (3) **no cross-component bleed** = every
rule scope-anchored (zero bare `[data-part]`), Unit I-3 additionally confirms its `ENHANCED_CSS`
migration decision (Trap 2) is explicit and reported, not silently resolved; (4) **no core regression**
= the relevant vitest suites green (`patterns/data/{stats-grid,cell-renderers,gallery-view,grid-view,
bulk-select-toggle}`, `surfaces/foundation`, `surfaces/pages/{workspace,admin,data,experience,
operations}`, `surfaces/layout`). The full visual + full core suites are the belt-and-suspenders pass
when the environment has headroom; if resource pressure kills them, certify byte-exact via the
per-component spec + no-bleed-by-construction and record the owed confirmatory pass. Unit I-1
additionally confirms `SurfaceErrorBoundary` was NOT touched and the exemption was registered, not
just skipped silently. Only after a unit certifies does the orchestrator append its `@import` lines to
`foundation/base.css` and commit that unit — units may certify and land in any order.

---

## 7. What this checkpoint does NOT do

- Does not touch `surfaces/pages/forms/{guided-draft-form,form,wizard,detail-form}` — already
  migrated under CK-D's "R" unit (DRAFTER NOTE 1). This is the most important exclusion in this
  contract; re-migrating these would be redundant at best and a silent clobber of committed work at
  worst.
- Does not migrate `SurfaceErrorBoundary.tsx` — permanent `SKIN-EXEMPT-CRASH-SAFE-FALLBACK` exemption
  (Trap 3), not a future-work item.
- Does not migrate `story-helpers.tsx`/`test-utils.tsx` — dev/test-only, no production skin applies.
- Does not change the already-fixed comment-adjacency lexer behavior (Trap 1); mandatory direct-read
  verification remains independent defense in depth.
- Does not resolve the `ENHANCED_CSS`/`data-table` cascade-collision risk (Trap 2) as a side effect of
  migration — reports it, lets the team decide ownership.
- Does not define the missing `ds-accent-bar-shimmer` keyframe (§5) — carries the current,
  non-shimmering behavior byte-exact and flags the gap.
- Does not consolidate `stats-grid`'s modern/rustic `--ds-stats-grid-*` vocabulary split — preserve
  both (Trap 4).
- Does not fix `render-dispatch.tsx`'s hand-rolled pagination duplicating the DS `Pagination`
  primitive — flags it to the team, does not refactor it here.
- Does not let agents wire entrypoints (`foundation/base.css`/`entrypoints/styles.css` —
  orchestrator-owned).
