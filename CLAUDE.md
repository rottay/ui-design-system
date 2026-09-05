# Claude Code Rules - Design System

## Bootstrap — read before acting

1. If you are working on the Modern Rescue programme (WO-CRA-23), read
   `AGENTS.md` first, then the canonical authorities it lists. No section in
   this file overrides `packages/core/scripts/check/modern-rescue/README.md`,
   `program/index.json`, `customization-model/index.json` or `orchestration/index.json`.
2. General project rules below apply only where the programme contracts are
   silent.

## Operating model (owner decree; execution amended 2026-08-30)

- **Kimi K3 is the DT/coordinator** (seat held by Kimi K3 from 2026-08-20,
  handed to Codex by owner order of 2026-08-21 on quota exhaustion of Kimi K3,
  and consummated back to Kimi K3 by explicit owner order of 2026-08-23 —
  `docs/history/prompts/architecture-refactor/2026-08/design-lead-session/index.md`). It decomposes work into
  bounded packets, makes every architecture/adjudication decision, and
  verifies every packet with gates and diff review before any commit. It may
  implement shared integration, delicate surgery or a critical unblock under
  an explicit write-set, but may never self-audit that code.
- **Opus is the primary source writer.** Multiple Opus writers run in parallel
  only on conflict-graph-proven disjoint worktrees. Shared compiler, contracts,
  recipes, manifest and generated authorities remain singleton-owned.
- **Sonnet is the scout and exact-mechanical lane.** It searches, maps
  dependencies and hardcodes, prepares write-sets, regenerates with official
  commands and performs closed substitutions. It does not decide APIs,
  semantics, recipes, fallbacks, compiler behaviour or visual direction.
- **Fable 5 is the primary independent auditor** on every integrated lot.
- **Codex is the second independent auditor** at every product-slice or phase
  close and for compiler, manifest, public-control or hard-to-reverse
  architecture changes. Its review does not block disjoint preparation work.
- Cross-model delegation uses real model terminals, each with a bounded brief,
  exact ownership and mechanical acceptance checks. A K3 subagent may not be
  relabelled Opus, Sonnet, Fable or Codex.
- The coordinator decides whether a terminal stays open (context reuse) or
  closes when its packet completes.
- One commit per lot, conventional format, **never push**. Version publishes
  are allowed.
- Default to zero new source comments. A comment is at most two lines and only
  explains non-obvious product behaviour, accessibility, a browser constraint
  or a public API. Never narrate agents, rounds, migrations or programme history.

## Non-Negotiable: No Cross-Module Direct Queries

Apps, verticals, and modules must never query tables owned by another module/schema directly. Cross-module communication must go through the owning module's exported use cases, actions, factories, or repository ports. If a needed capability does not exist, create and export it in the owning module first; do not import foreign Drizzle schemas, create local bridge queries, or duplicate tables across schemas. Infrastructure-only health checks such as `SELECT 1` may test connectivity, but they must not read or mutate module-owned tables.

## AI Documentation

- **Capability Map (read first)**: `/docs-engineering/engineering/design-system/capability-map/README.md` — the full DS surface in two orientations (what a tenant can white-label; what an app can consume, with the app-bithire reference adoption per row). Read it BEFORE building new UI, adding a tenant knob, or hand-rolling anything the DS already ships.
- **Catálogo Central**: `/docs-engineering/README.md`
- **Component Reference**: `/docs-engineering/engineering/design-system/`
- **Architecture (target law)**: [`docs/ARCHITECTURE.md`](docs/architecture/index.md) —
  the normative definition of what this repository must be: doctrine, the full
  target tree with every owner's purpose and relations, and the delta against
  the current tree. Read it before moving, renaming or deleting anything.
- **Diagnostic & plan**: [`docs/history/programs/architecture-refactor/2026-08/diagnosis/index.md`](docs/history/programs/architecture-refactor/2026-08/diagnosis/index.md)
  — the verified diagnosis, the ordered work fronts, and the master removal
  list derived from the target architecture.
- **Repo map**: [`docs/history/inventories/repository-map/2026-08/index.md`](docs/history/inventories/repository-map/2026-08/index.md) — what every
  folder in this repository does, where something is written twice, and which
  folders are empty scaffolding. Independently verified claim by claim.
- **Third-reader audit**: [`docs/history/audits/architecture-refactor/2026-08/coordination/index.md`](docs/history/audits/architecture-refactor/2026-08/coordination/index.md) —
  an independent audit that overturned four proposed removals (`Sheet`,
  `Popover`, `Statistic`, `Tree` all have in-DS production consumers) and
  re-blocked LOTE 9. Read it before executing any removal lot.
- **Keep/delete decisions**: [`docs/history/programs/architecture-refactor/2026-08/retention/index.md`](docs/history/programs/architecture-refactor/2026-08/retention/index.md)
  — which duplicate is canonical, which owners are removed, and which owners
  only look dead. Read it before proposing that anything is redundant.

### Documentation Update Rule (CRITICAL)

When modifying any of the following in this package, **ALWAYS** update the corresponding doc in `docs-engineering/engineering/design-system/`:

| Change Type | Update Location |
|-------------|-----------------|
| Add/remove/rename primitive | `components/primitives/{category}/README.md` |
| Add/remove/rename pattern | `components/patterns/{group}/README.md` |
| Add/remove/rename structure | `components/structures/{group}/README.md` |
| Add/remove/rename surface | `components/surfaces/pages/README.md` |
| Add/remove/rename hook | `foundations/hooks/README.md` |
| Add/remove motion primitive/effect | `foundations/motion/README.md` |
| Change token structure | `foundations/tokens/README.md` |
| Change engine behavior | `runtime/engines/README.md` |
| Change tenant/branding model | `runtime/tenancy/README.md` |
| Change contract types | `foundations/contracts/README.md` |

Update the hub `README.md` inventory counts when component totals change.

**If you change code that affects the component catalog, the docs MUST be updated in the same session.**

---

## GitHub Configuration

- **Author**: davila23 <daniel.avila@rottay.com>

## Git Rules

- **NEVER include Co-Authored-By** in commit messages
- **NEVER include "Generated with Claude Code"** in commit messages
- Use conventional commit format: `type(scope): description`

## Project Context

- Multi-engine design system with three built-in physical engines plus a custom registry:
  - **classic** — Ant Design 5.21 wrapper
  - **modern** — the Rottay-native premium skin. The residual DaisyUI class layer is
    fully drained (`daisy.classConsumers: 0`, WO-TOK-03); the ratchet stays
    decrease-only so it never comes back
  - **rustic** — Vanilla CSS fallback
  - **custom** — White-label component packs registered at runtime; not a fourth physical
    implementation copied into every component owner
- Components in `packages/core/src/components/`
- Engine-backed components may have `engines/{classic,modern,rustic}/index.tsx`
  siblings selected at runtime via `createEngineComponent()` and the active
  engine context; do not create fake forwarding engines when one is absent
- Follow existing component patterns for new additions
- The canonical engine names are `classic` / `modern` / `rustic` / `custom`. The legacy names `titan` / `hermes` / `apollo` are gone — do not reintroduce them.

## Core source-tree hierarchy (NON-NEGOTIABLE)

`packages/core/` has seven source-controlled authority roots: `src/`,
`scripts/`, `tests/`, `contracts/`, `governance/`, `artifacts/`, and `docs/`.
`dist/` is disposable build output, not an authority root.

`packages/core/src` is an ownership and dependency tree, not a flat file
catalog. Its physical hierarchy must make architectural importance and
dependency direction visible.

The five canonical physical roots are `foundation/`, `infrastructure/`,
`graphics/`, `components/`, and `entrypoints/`. `components/` owns the four UI
tiers; `entrypoints/` owns classified package boundaries. Every public subpath
boundary lives below it as `folder/index.ts`; `src/index.ts` is the only file
allowed directly at the source root. A top-level `composition/` owner is
forbidden.

`packages/core/scripts/` has exactly six intent roots: `build/`, `check/`,
`generate/`, `libraries/`, `maintain/`, and `package/`. Source-layout names are
not valid script roots.

The local dependency order is
`foundation|kernel|contracts|policy|quality|spec|validation` → `runtime` →
`composition|react` → `presentation` → `facade|public`. At the macro
level, `foundation` is lower than the owners that consume it,
`infrastructure/compilers` is lower than `infrastructure/runtime`, and the UI
stack is `primitives → patterns → structures → surfaces`.

- Every authored production unit uses `folder/index.ts` or
  `folder/index.tsx`; free-standing leaf modules are forbidden.
- A barrel may aggregate child owners, but it must not share its level with
  authored production peers. The implementations belong in their own folders.
- Two or more related units form a named family and therefore require another
  grouping level in the tree.
- Once an owner declares named layers, every capability—including manifests
  and generated outputs—must live inside its owning layer; layer folders and
  unlayered capability folders never coexist as peers.
- Foundations must be physically above the runtimes and presentations that
  depend on them. A dependent owner must not sit beside its dependency as an
  architectural peer.
- Unit tests live under the owning unit's `tests/` folder. Cross-unit contract
  tests live under an explicitly named `integration/tests/` or
  `architecture/tests/` owner; tests never sit beside production modules.
- Public package entrypoints, generated sources, declarations, fixtures,
  examples, and stories are explicit classified exceptions. They are not a
  precedent for authored product code.
- Physical moves preserve the package's public subpaths and exported API;
  internal compatibility files must not be left behind merely to keep old
  private paths alive.

Run `pnpm --filter @rottay/design-system structure:check` for every core tree
change. The identity baseline is decrease-only: update it only after reviewing
that all differences are resolved debt caused by an intentional hierarchy
wave. Never baseline a new finding.

When a physical move changes path-keyed paint counters, first dry-run
`pnpm --filter @rottay/design-system engine-audit:relocate-paths`; pass explicit
`--old-root`/`--new-root` for a root migration and add `--write` only after
reviewing the Git rename inventory. This relocates keys without changing a
single ceiling. `--adopt-new-zero` may add only newly discovered zero-valued
path counters and refuses every positive counter; neither mode is permission to
regenerate paint counts.

## Ownership rules

This package is the **single source of truth** for reusable, domain-agnostic UI capability across all Rottay apps.

- The DS owns: primitives, patterns, generic surfaces, page shells, detail shells, detail-form shells, collection workspace shells, layout shells, reusable widget chrome, runtime tenant contracts, product-profile contracts, engine extension points, motion vocabulary, and reusable lane layouts (ranked-row, signal-lane, feed-lane, action-lane).
- The DS does **not** own: tenant/company/user/role/candidate/interview/event semantics, control-plane narrative, recruiting copy, dashboard storytelling, or any product-specific AI/operator narration.
- Before adding a new component, ask: *"Could another app use this without knowing what a tenant, candidate, role, company, interview, or event is?"* If no, it does not belong here — it belongs in the consuming app.
- See `docs-engineering/engineering/design-system/architecture/README.md` and `docs-engineering/engineering/design-system/catalog/decision-matrix/README.md` for the full ownership contract.

## Component taxonomy (4 physical tiers, 5 manifest layers)

The design system has 4 single-word tiers under `packages/core/src/components/`:

### primitives/
Engine-switched leaf components (Button, Input, Card, Modal, Tabs, etc).
Each engine-switched primitive has three physical implementations: classic, modern, and rustic.
A `custom` realm requires a registered theme adapter and a registered component
entry per component; an unregistered name is refused by name. There is no
fallback engine. The typography compounds (`Text`, `Heading`, `Paragraph`,
`Link`) are outside this model: they resolve a static three-engine map instead
of the component factory, so they have no custom pack entry at all and refuse
`custom` by name. Registering a pack entry called `Text` does nothing.
6 categories: display, inputs, feedback, layout, navigation, overlay.

### patterns/
Task-level compositions that solve generic UI tasks. A pattern may be
engine-backed when rendering genuinely differs by engine.
Think: tables, forms, charts, kanban boards, timelines, command palettes.
Product groups are `commerce/`, `communication/`,
`customization/`, `data/`, `feedback/`, `forms/`, `identity/`, `navigation/`,
`shell/`, `visualization/`, and `workflow/`. `foundation/`, `runtime/`, and
`tooling/` are explicit support owners; generic `misc/`, `_internal/`, `hooks/`
and `shared/` owners are forbidden. A `patterns/commercial/` group must not be
reintroduced: it was migration debt, its owners were already reclassified by
reusable task/role, and as of 2026-08-18 no directory matching `*commercial*`
exists anywhere under `packages/core/src`.

**Example:** PatternDataTable, PatternFormBuilder, PatternKanbanBoard, PatternStatsGrid.

### structures/
Page-structure families that wrap or accompany patterns to form page chrome.
Think: headers, toolbars, command bars, record panels, metric cards, loading overlays.
6 groups: `headers/`, `workspace/`, `record/`, `dashboard/`, `feedback/`, `shell/`.

**Example:** CollectionHeader, SearchCommandBar, TableToolbar, RecordFieldGrid, StatsHeader, LoadingOverlay.

### surfaces/
Page-level config objects that describe a whole screen declaratively.
Dependency branches: `foundation/` (contracts/support), `runtime/`
(builders/state/adaptive behavior), `composition/layout/` (shells), and
`presentation/pages/` (complete page recipes).

**Example:** ListSurface, DashboardSurface, FormSurface, CollectionWorkspaceSurface.

### Decision rules

| If the piece... | It belongs in... |
|---|---|
| Is a leaf component with an engine switch | **primitives** |
| Solves a generic reusable task (table, form, chart) | **patterns** |
| Wraps or accompanies a pattern as page chrome (header, toolbar, record panel, metric card) | **structures** |
| Describes a whole page as a config object | **surfaces** |
| Depends on specific business domain, route, API, or copy | **the consuming app** |

### Canonical family-manifest taxonomy (NON-NEGOTIABLE)

The physical UI tree above has four tiers. The Modern Rescue family manifest
has exactly five logical layer values:

`primitive | pattern | structure | surface | chart`

`chart` is a dedicated inventory/review cohort because chart behavior and
evidence are specialized; its production owner still lives physically below
`components/patterns/visualization/charts/`. No sixth family layer may be introduced.

- `commercial` is a marketing adjective, not an architectural role. It may
  never be a manifest layer, family kind, or duplicated path such as
  `commercial/commercial/*`.
- `composition` is a dependency role inside an owner, not a component tier or
  family layer. `surface-composition` and paths such as
  `surface-composition/composition/*` are forbidden.
- A public page-chrome or layout-shell component belongs to
  `structure/shell/*`; a complete declarative page recipe belongs to
  `surface/<group>/*`; implementation-only composition support has no
  independent family row.
- A commercial/marketing showcase component is admitted to the DS only when
  it is domain-agnostic and reusable. It must then be classified by what it
  does (for example framing, content, visualization or feedback), never by
  where it is sold. Otherwise it belongs in the Showroom or consuming app.
- Support folders such as `foundation`, `runtime`, `composition`,
  `presentation`, `facade`, `tests`, fixtures and generated artifacts never
  create family rows by themselves.
- Every public component has exactly one canonical family ID and one source
  owner. Aliases, compatibility paths and multiple exports must resolve to the
  same row; they cannot inflate the family denominator.
- The current denominator is an inventory observation, not a reason to retain
  ghost or duplicate families. A removal, merge or reclassification must be
  source-bound, owner-reviewed and applied atomically to inventory, manifests,
  reverse projections, gates and evidence. Never preserve a bogus row merely
  to keep the denominator unchanged. The denominator is an output, not an
  input: it is derived from `family-inventory/index.json` only after the reverse
  public projection reports zero unowned components, and it is stated in
  exactly one place, `program/index.json` -> `denominators.visibleFamilies`. This
  rule previously quoted a literal count, which made the rule against pinning
  a number depend on a pinned number; if you need today's value, read it from
  `program/index.json` rather than from prose.

Before the Modern Rescue point-zero freeze, recursively audit every folder and
subfolder below `packages/core/src` and the Showroom registries. The audit is a
blocking architecture gate and must prove:

1. every authored production owner has one stated purpose and a live consumer;
2. every reusable UI owner maps to exactly one allowed tier/layer and family;
3. every support-only owner is excluded from the component denominator;
4. no legacy, duplicate, empty, domain-specific or compatibility-only owner
   survives merely because an older document or test references it;
5. public exports, source ownership, manifest identity and Showroom navigation
   agree exactly; and
6. a planted forbidden layer/duplicate/unowned folder makes the gate fail.

The debt this paragraph used to name -- the 11 owners formerly grouped as
`components/patterns/commercial/` and the four components inventoried as
`surface-composition` -- is settled: neither directory exists any more
(`find packages/core/src -type d -name "*commercial*"` and `-name
"*surface-composition*"` both return nothing, verified 2026-08-18).

The current known debt is enumerated instead in
[`docs/history/inventories/repository-map/2026-08/index.md`](docs/history/inventories/repository-map/2026-08/index.md) (what every folder does, where
something is written twice, which folders are empty scaffolding) and adjudicated
in [`docs/history/programs/architecture-refactor/2026-08/retention/index.md`](docs/history/programs/architecture-refactor/2026-08/retention/index.md)
(eleven removal lots, nine unifications with a proposed canonical owner, and the
list of owners that only look dead). Read both before proposing that any folder
is redundant; the second one records eight components that a liveness-only reading
wrongly marked as orphans.

### What does NOT go in the DS

- `CandidatePipelineHealthCard` — domain-specific, stays in app-bithire
- `CompanyBillingEscalationPanel` — domain-specific, stays in app-platform
- `EvntoVenueSettlementWidget` — domain-specific, stays in app-evnto
- Anything that requires knowing what a tenant, candidate, role, company, interview, or event IS

### Where duplications happen (avoid these)

- Putting page chrome inside patterns (creates structures-tier confusion)
- Putting full screen recipes inside the app (should be a surface config)
- Promoting domain-specific components to the DS too early
- Patterns knowing about page layout (patterns should not know what screen they're in)
- Structures knowing about business domain (structures should only know about layout roles)

## Premium white-label model (BrandTheme / Theme-ISO)

> **Authority remit:** the Modern Rescue programme owns the operational control
> model, namespace lifecycle and acceptance law. For WO-CRA-23 read
> `packages/core/scripts/check/modern-rescue/README.md`,
> `customization-model/index.json`, `program/index.json` and `orchestration/index.json`.
> This section only restates project-wide invariants.

The canonical visual source of truth is the total nested **Theme** under
`foundation/contracts/composition/tenants/themes/`. `BrandTheme` may survive
only as a deprecated compatibility alias of the complete Theme, never as a
patch or a second authority.

Visual merge chain: `DS base -> vertical baseline -> Theme -> compileTheme -> artifacts`

### Key rules

- Both static `BrandTheme` and DB `TenantThemeDocument` transports resolve to
  the same complete Theme and enter the single `compileTheme` lowering. No
  second compiler, no subset parity fixture, no neutral default vertical.
- `ThemePatch` exists only at ingestion; it never reaches the compiler.
- First-party tenant CSS files (`foundation/tokens/css/facade/artifacts/`) are
  **generated snapshots**, not source of truth. The `.ts` Theme/BrandTheme
  sources are the source.
- `_source/extension.css` is temporary drain debt, not an authority. Do not
  regenerate, hand-edit or rely on it for new work.
- Production customer styling is compiled on the server and embedded for SSR.
  The client hydrates the exact artifact with
  `visualAuthority="compiled-artifact"`; browser components do not query the
  DB and the provider must not emit a competing visual layer.
- Domain-specific tokens (`--ds-ticket-*`, `--ds-event-*`, `--rt-*`, or any
  product/vertical-derived name) belong in consuming apps, not DS core.
- The brand compiler (`packages/core/src/infrastructure/compilers/kernel/runtime/brand-theme/`)
  is the single lowering from Theme to CSS variables and personality tokens.

## Icon system (semantic facade + compatibility catalog)

New product code uses supplier-independent semantic names and roles. The
current `IconName` facade and generated pack entrypoints expose the governed
282-name corpus; `IconRole` is the smaller semantic behavior vocabulary and
must not be confused with the name count. Phosphor is the pinned default supplier and is confined to
the icon adapter/generator boundary under `packages/core/src/graphics/icons/`; apps
MUST NOT import Phosphor, Lucide, Ant icons, or another functional supplier
directly. Lucide is not the default supplier; the existing Lucide-shaped named
catalog is compatibility-only.

### Import pattern
```tsx
// CORRECT for new product code
import { Icon } from '@rottay/design-system/icons';

<Icon name="action.search" decorative />
<Icon name="status.warning" label="Requires attention" />

// WRONG - suppliers never cross the adapter boundary
import { Search, Plus, Check } from 'lucide-react';
import { MagnifyingGlassIcon } from '@phosphor-icons/react';
```

`IconProps` requires either a non-empty `label` or `decorative={true}`. Tenant
configuration may change semantic tone only; it cannot select the supplier,
glyph, role mapping, weight family, or motion recipe.

### Token customization
- `--ds-icon-{xs|sm|md|lg|xl|2xl}-size` for sizing
- Color via `currentColor` (inherits from parent text, tenant-aware)

### Adding new icons
Add a governed role to
`packages/core/src/graphics/icons/semantic/sources/corpus/manifest.json`, map it in the pinned
adapter manifest, and run `pnpm -C packages/core icons:generate`. Extend the
corpus tests and update provenance when the supplier/version changes. Do not
add a new vendor-shaped alias for product use.

Brand and cloud-provider identity is a separate asset class. Product code uses
`BrandMark` or `CloudServiceMark` from `@rottay/design-system/marks`; the
pinpoint `@thesvg/react` imports stay inside
`packages/core/src/graphics/marks/runtime/adapters/`. Never use a
brand mark for an action/navigation concept, never load a remote mark at
runtime, and never pass supplier types through the public API. A tenant may
provide its own approved company logo through the tenant-brand contract, but
cannot select an arbitrary catalog mark or replace functional glyph meaning.

---

## Chart System (18 types)

All charts are D3-backed, engine-agnostic, token-aware, personality-driven, and accessible.

### Families:
- Basic: BarChart (simple/grouped/stacked), LineChart, AreaChart, PieChart (donut mode), ScatterChart (bubble, trend line)
- Statistical: RadarChart, GaugeChart (arc, segments, needle), Histogram (d3.bin, density, cumulative)
- Flow: FunnelChart, WaterfallChart (increase/decrease/total), SankeyChart (custom layout)
- Temporal: GanttChart, Sparkline (inline SVG, area fill, end dot), CalendarHeatMap (daily activity grid)
- Spatial: HeatMap
- Hierarchical: TreeMap
- Relational: NetworkGraph
- KPI: BulletChart (target vs actual, range bands)

### Hooks:
- useChartTheme: resolves DS CSS vars to hex for D3 color math
- useChartPersonality: personality tokens (animation, lineStyle, colorScheme)
- useChartDimensions: responsive container measurement
- useChartCompact: compact mode for mobile

### Theming:
- Charts use var(--ds-color-*) CSS variables natively in SVG fill/stroke
- useChartTheme resolves to hex when needed (Canvas, interpolation)
- BrandTheme.charts controls personality (animateOnMount, lineStyle, showDots, etc.)
- 5 color palettes: default, pastel, vibrant, monochrome, accessible (Wong 2011)

---

## Waves 2-6 Feature Inventory (2026-04-17)

Features implemented across Waves 2 through 6 of the DS execution plan.

### Wave 2 -- Multi-View Collections

- `CollectionViewMode` type: `table | cards | grid | kanban | gallery | calendar`
- Per-mode config interfaces: `CollectionKanbanConfig`, `CollectionCalendarConfig`, etc.
- `ViewModeSwitcher` structure (segmented icon control)
- `PatternGridView` pattern (CSS grid, selection, pagination)
- `PatternGalleryView` pattern (image grid, aspect ratio, captions)
- `CollectionRenderDispatch` (internal, routes to correct pattern per mode)
- `CollectionWorkspaceSurface` accepts `viewModes` prop

### Wave 3 -- Advanced Data Interactions

- `ExportButton` structure (CSV/JSON/Clipboard export, zero external deps)
- `ColumnMenu` extended: `pinnedColumns`, `columnWidths`, `groups`
- `FilterBuilder` extended: `customOperators`, `showAddFilter`, `CustomOperatorDefinition`
- Inline Cell Editing: `EditableConfig<T>`, `InlineCellEditor`, `useInlineEditing` hook
- Row Grouping: `groupBy`, aggregations (`count | sum | average | min | max`), collapsible headers
- Virtual Scrolling: `useVirtualScroll` hook, `virtualized` prop on PatternDataTable, `scrollToRow` API

### Wave 4 -- Mobile and Internationalization

- `PatternLocaleSwitcher` pattern (3 engines, 5 locales, flag emoji, keyboard nav)
- `mobileNavigation` config on `WorkspacePreviewRailConfig`
- `FormBuilder` `autoAdaptive` prop (auto-stack on mobile)
- `Modal` primitive `adaptiveFullscreen` prop (100vw/100dvh on mobile, default true)

### Wave 5 -- Surface Lifecycle and Permissions

<!-- GAT07-CLAIM surface-profile-overrides: active; runtime=declared-32-applied-31; affirmative-behavior=true; owner=DS-IMP-022 -->

GAT07-CONTRACT surface-profile-overrides: symbols=[SurfaceVisualOverrides, useSurfaceProfileDefaultsWithOverrides, visual.profileOverrides]; disposition=active; runtime-status=declared-32-applied-31; affirmative-behavior=true; production-consumers=31; executable-assertions=2; owner=design-system-program/DS-IMP-022; target-phase=2A.

Census, checker-measured from source and deliberately NOT a parity claim: **32**
governed field declarations across **2** definition owners
(`structures/foundation/chrome/contracts`, `surfaces/foundation/contracts`);
**31** of them applied by a direct call to the governed hook, giving **31**
production consumers; **0** showroom references; **0** unsupported governed
references. The single declared-but-never-applied field belongs to
`SidebarSurfaceVisualConfig`.

- `useSurfaceState` hook (8 lifecycle states, `renderState` helper)
- Feedback components: `SurfaceLoadingSkeleton`, `SurfaceEmptyState`, `SurfaceErrorState`, `SurfaceStaleBanner`, `SurfaceOfflineBanner`, `SurfaceErrorBoundary` -- one family, `structure/feedback/surface-lifecycle`, owned by `packages/core/src/components/structures/feedback/surface-lifecycle`. The duplicate `SurfaceLoadingState` / `SurfaceEmptyStateCard` / `SurfaceErrorStateCard` trio was retired on 2026-08-12 with no alias and no compatibility subpath (owner ruling: clean break). `SurfaceCapabilityAnatomy` is a separate family, `structure/feedback/capability-anatomy`, not a lifecycle state.
- The generated GAT07 contract above certifies the exact declaration and
  applied-consumer census for the active surface-override family.
- Enhanced permissions: `isRowAllowed`, `cascadeRules`, `resolveFieldAccess`

### Wave 6 -- Branding Validation, Collaboration, and Lint Rules

- `validateBrandingContrast()` from `@rottay/design-system/server`
- `useCrossTabSync()` hook (BroadcastChannel + localStorage fallback)
- Collaboration primitives: `PresenceBar`, `PresenceTypingIndicator`, `LiveCursor`
- ESLint rules (from `@rottay/design-system/eslint`):
  - `@rottay/no-raw-html`
  - `@rottay/no-hardcoded-colors`
  - `@rottay/no-db-in-components`

---

## Showroom Package (packages/showroom/)

A standalone Next.js 16 app that serves as the commercial showcase for the design system. Lives alongside packages/core/ in the same pnpm workspace.

### Quick Start
```bash
cd packages/showroom
pnpm install
pnpm dev          # http://localhost:7001 (Webpack)
pnpm dev:turbopack # Optional Turbopack dev server on the same port
pnpm build        # Production Webpack build
pnpm typecheck    # TypeScript check
```

### Architecture
- **Location**: `ui-design-system/packages/showroom/`
- **Framework**: Next.js 16 + React 19 + TypeScript + Tailwind (marketing only)
- **DS dependency**: `workspace:*` (hot-reload, no publish needed)
- **Bundler**: Webpack by default; `dev:turbopack` is the opt-in development path
- **Port**: 7001
- **Deploy target**: showroom.rottay.com (Vercel, separate project)

### Route Tree
```
/                          Commercial landing page (Tailwind, marketing exception)
/foundations/              Tokens, themes, engines, icons
  /tokens/{colors,spacing,typography,radius,shadows,motion}
  /icons                   Governed 282-name facade and generated vertical packs
  /engines                 Side-by-side engine comparison
  /themes                  3 brand themes with live preview
/primitives/[category]/[component]   Generated primitive reference pages
/patterns/[group]/[pattern]          Generated pattern reference pages
  /visualization/charts/[type]       18 chart pages with real D3 rendering
/structures/[group]/[structure]      Generated structure reference pages
/surfaces/[group]/[surface]          Generated surface reference pages
/verticals/                          Platform, BitHire, Evnto
  /platform/[category]              Dashboard, user list, tenant form demos
  /bithire/[category]               Pipeline kanban, recruiter dashboard, scorecard
  /evnto/[category]                 Event dashboard, ticket builder, venue layout
/playground                          Interactive sandbox + theme builder
/developers/                         Getting started + architecture deep-dive
```

### Key Components
- `packages/showroom/src/components/layout/` -- Shell, sidebar, header (with engine/theme switcher), footer, search (Cmd+K)
- `packages/showroom/src/components/playground/` -- Engine switcher, theme switcher, code block, prop table, component preview, engine comparison
- `packages/showroom/src/components/demos/` -- Vertical demo screens (platform/, bithire/, evnto/)
- `packages/showroom/src/components/showroom-context/` -- Global engine/theme state context
- `packages/showroom/src/data/registry/` -- Component registries (primitives, patterns, structures, surfaces, charts, icons)
- `packages/showroom/src/data/navigation.ts` -- Sidebar navigation tree

### Rules
- Marketing landing page (`packages/showroom/src/app/page.tsx`) uses Tailwind +
  lucide-react as a showroom-only marketing exception
- ALL other pages use DS components (Box, Flex, Stack, Text, Card, Badge, Button)
- Icons from @rottay/design-system/icons (not lucide-react)
- folder/index.tsx pattern for all components
- Data registries must stay in sync with packages/core/ components

---

### Component paint pattern (skin-first; supersedes the 2026-04-17 inline pattern)

Modern engine components are painted by their **skin file**
(`foundation/tokens/css/runtime/engines/modern/skin/<component>.css`), keyed on
the `data-part` / `data-state` / `data-variant` anatomy the TSX stamps. The TSX
owns structure and interaction state only — no visual values. The skin reads
component channels with a chained fallback to the cascade roots:

```css
/* Pattern: var(--ds-{component}-{property}, var(--ds-{root})) */
background: var(--ds-button-primary-bg, var(--ds-color-primary));
```

Per-component customization flows through the governed visual compiler into the
skin's channels. Nobody restyles a primitive's internals, and nobody edits an
engine TSX to change how a component looks. Inline `var(--ds-*)` reads left in
engine files are migration debt tracked by the paint censuses (decrease-only),
not the pattern to copy. Reference implementation: `Button`.

### TenantAppearanceAdvanced (normalized compatibility shape)

`TenantAppearanceAdvanced` is the normalized compiler/compat shape, not the DB
write contract. `TenantThemeDocument` exposes bounded advanced fields that can
compile into these chrome sections:
- `chrome.controls` -- the full button variant domain + full input chrome + disabled + focus
- `chrome.table` -- header, row, cell, loading overlay
- `chrome.cardComponent` -- bg, border, shadow, header/body/footer
- `chrome.modal` -- bg, overlay, header/body/footer, close
- `chrome.tabs` -- border, color states
- `chrome.sidebar` -- full 17 fields
- `chrome.layout` -- full 6 fields
- `chrome.shell` -- grid overlay
- `tokenOverrides` -- raw `--ds-*` vars (max 200)

These fields compile through the single Theme→CSS lowering
(`packages/core/src/infrastructure/compilers/kernel/runtime/brand-theme/`); the
legacy `appearance/` compiler is being absorbed into it. Production DB themes
are server compiled; provider-side emission is the compatibility/preview path.

---

## Modern Engine Premium Uplift — Spec + Operative Backlog

The `modern` engine is being taken from "hand-made, mid-tier (near-indistinguishable from `rustic`)"
to the **Quiet Premium** target. Two artifacts govern this:

- **Normative law (the spec)**: `../docs-engineering/engineering/design-system/runtime/engines/modern/README.md`
  — the canonical Quiet Premium specification (motion contract, dark-aware elevation, interaction-state
  contract, gradient/glass/glow roles, color purity, scale hygiene, theme.css drain, content integrity,
  cross-engine layout, premium signature, and the section 12 metrics ratchet). Read it FULLY before
  touching the modern engine, tokens, or the `packages/core/src/foundation/tokens/css/runtime/engines/modern/` tree.
- **Operative backlog (the work)**: `roadmap/` holds six lanes totalling 100 work orders —
  `engine-modern.md` (25, WO-ENG-01..25), `craft.md` (23), `architecture.md` (21), `gates.md` (12),
  `tokens.md` (11), `skin-adoption.md` (8) — each WO with file-level steps, a blocking acceptance
  gate, and a ready-to-paste delegation prompt. State lives in `roadmap/registry.json`; check status with `pnpm roadmap:status`
  and validate registry/lane agreement with `pnpm roadmap:check`. Read `roadmap/README.md` (start order,
  handoff protocol, bootstrap prompt, sighted-check law) before picking work. The lane's mechanical gate
  is `scripts/check/engine/tokens/audit/index.mjs` (created by WO-ENG-01). Statuses change ONLY via
  `scripts/maintain/roadmap/status/index.mjs`; never hand-edit `registry.json` or `STATUS.md`.
