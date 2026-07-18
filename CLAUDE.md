# Claude Code Rules - Design System

## Non-Negotiable: No Cross-Module Direct Queries

Apps, verticals, and modules must never query tables owned by another module/schema directly. Cross-module communication must go through the owning module's exported use cases, actions, factories, or repository ports. If a needed capability does not exist, create and export it in the owning module first; do not import foreign Drizzle schemas, create local bridge queries, or duplicate tables across schemas. Infrastructure-only health checks such as `SELECT 1` may test connectivity, but they must not read or mutate module-owned tables.

## AI Documentation

- **Catálogo Central**: `/docs-engineering/README.md`
- **Component Reference**: `/docs-engineering/engineering/design-system/`

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
  - **modern** — the Rottay-native premium skin. A residual DaisyUI class layer survives in
    sixteen engine files; `daisy.classConsumers` is a decrease-only ratchet that lets it shrink
    and never grow (WO-TOK-03 verdict, 2026-07-10)
  - **rustic** — Vanilla CSS fallback
  - **custom** — White-label component packs registered at runtime; not a fourth physical
    implementation copied into every component owner
- Components in `packages/core/src/ui/`
- Engine-backed components may have `engines/{classic,modern,rustic}/index.tsx`
  siblings selected at runtime via `createEngineComponent()` and the active
  engine context; do not create fake forwarding engines when one is absent
- Follow existing component patterns for new additions
- The canonical engine names are `classic` / `modern` / `rustic` / `custom`. The legacy names `titan` / `hermes` / `apollo` are gone — do not reintroduce them.

## Core source-tree hierarchy (NON-NEGOTIABLE)

`packages/core/src` is an ownership and dependency tree, not a flat file
catalog. Its physical hierarchy must make architectural importance and
dependency direction visible.

The five canonical physical roots are `foundation/`, `infrastructure/`,
`graphics/`, `ui/`, and `tooling/`. `entrypoints/` is a classified
package-boundary support root, not a sixth architectural tier. Every public
subpath boundary lives below it as `folder/index.ts`; `src/index.ts` is the only
file allowed directly at the source root. A top-level `composition/` owner is
forbidden.

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

## Component taxonomy (4 tiers)

The design system has 4 single-word tiers under `packages/core/src/ui/`:

### primitives/
Engine-switched leaf components (Button, Input, Card, Modal, Tabs, etc).
Each engine-switched primitive has three physical implementations: classic, modern, and rustic.
`custom` resolves a registered component pack and falls back through the engine registry.
6 categories: display, inputs, feedback, layout, navigation, overlay.

### patterns/
Task-level compositions that solve generic UI tasks. A pattern may be
engine-backed when rendering genuinely differs by engine.
Think: tables, forms, charts, kanban boards, timelines, command palettes.
Product groups are `commerce/`, `commercial/`, `communication/`,
`customization/`, `data/`, `feedback/`, `forms/`, `identity/`, `navigation/`,
`shell/`, `visualization/`, and `workflow/`. `foundation/`, `runtime/`, and
`tooling/` are explicit support owners; generic `misc/`, `_internal/`, `hooks/`
and `shared/` owners are forbidden.

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

## Premium white-label model (BrandTheme)

The canonical premium visual source of truth for a code-owned vertical is
**BrandTheme** under `foundation/contracts/composition/tenants/themes/`.
First-party brand sources live in `foundation/tokens/ts/presentation/brand-themes/`.

Visual merge chain: `DS base -> vertical baseline -> BrandTheme -> generated artifacts`

### BrandTheme scope (~140 CSS variables)

- `palette` -- primary, secondary, accent, semantic colors (light + dark variants)
- `typography` -- 4 font families, weight bias, letter spacing per-context (display/heading/body/mono), line height per-context
- `surfaces` -- density scale, border radius (sm/md/lg/xl), shadows, glass, gradients, overlays
- `motion` -- entrance type, spring physics, hover lift/scale, skeleton style, stagger
- `charts` -- animation, line style, dots, gradient fill, tooltip style
- `chrome.controls` -- 10 button variants (primary/secondary/default/ghost/text/link/success/warning/error/info), each with bg/bgHover/bgActive/color/border/shadow + full input chrome (bg/border/focus/disabled/filled/addon/validation) + disabled state + focus ring
- `chrome.table` -- bg, border, header (bg/color/fontWeight/fontSize), row (bg/hover/striped/selected/border), cell (padding/fontSize/color), loading overlay
- `chrome.cardComponent` -- bg, border, shadow (rest/hover/elevated), header/body/footer sections
- `chrome.modal` -- bg, overlay (bg/backdrop), header/body/footer, close button
- `chrome.tabs` -- border, color states (default/hover/active), active indicator
- `chrome.sidebar` -- 17 fields (bg, border, text, item sizing, group headers, footer)
- `chrome.layout` -- header, sider bg/border/backdrop

### Key rules

- `TenantConfig.brandTheme` remains the code-owned/compat field. New customer
  writes publish a bounded `TenantThemeDocument` to the canonical tenancy DB;
  legacy `branding`, `personality`, `appearance`, and `tokenOverrides` fields
  are compatibility inputs only.
- Product profile is **not** part of the visual merge when brandTheme is present -- only `surfaceDefaults` survives.
- First-party tenant CSS files (`foundation/tokens/css/facade/artifacts/`) are **generated snapshots**, not the source of truth. The `.ts` BrandTheme files are the source.
- Production customer styling is compiled on the server and embedded for SSR.
  The client hydrates the exact artifact with
  `visualAuthority="compiled-artifact"`; browser components do not query the
  DB and the provider must not emit a competing visual layer.
- Domain-specific tokens (`--ds-ticket-*`, `--ds-event-*`) belong in consuming apps, not DS core.
- The brand compiler (`packages/core/src/infrastructure/compilers/kernel/runtime/brand-theme/`)
  converts BrandTheme to CSS vars and personality tokens.
- First-party tenant artifacts (`foundation/tokens/css/facade/artifacts/{bithire,evnto,rottay}/index.css`) are build products assembled from the BrandTheme `.ts` file plus a declared `_source/extension.css`. Regenerate with `pnpm -C packages/core build:vertical-css`; hand-edits fail `lint:artifacts` (chained into `pretest` and `lint`).

## Icon system (semantic facade + compatibility catalog)

New product code uses supplier-independent semantic roles. The stable default
`Icon` facade currently accepts the governed 50-role compatibility corpus;
generated pack entrypoints expose the broader 263-role corpus. Do not conflate
those two contracts. Phosphor is the pinned default supplier and is confined to
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
`packages/core/src/graphics/icons/foundation/semantic/corpus/manifest.json`, map it in the pinned
adapter manifest, and run `pnpm -C packages/core icons:generate`. Extend the
corpus tests and update provenance when the supplier/version changes. Do not
add a new vendor-shaped alias for product use.

Brand and cloud-provider identity is a separate asset class. Product code uses
`BrandMark` or `CloudServiceMark` from `@rottay/design-system/marks`; the
pinpoint `@thesvg/react` imports stay inside
`packages/core/src/graphics/brand-marks/runtime/adapters/`. Never use a
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

<!-- GAT07-CLAIM surface-profile-overrides: active; runtime=fleet-wired-33-of-33; affirmative-behavior=true; owner=DS-IMP-022 -->

GAT07-CONTRACT surface-profile-overrides: symbols=[SurfaceVisualOverrides, useSurfaceProfileDefaultsWithOverrides, visual.profileOverrides]; disposition=active; runtime-status=fleet-wired-33-of-33; affirmative-behavior=true; production-consumers=33; executable-assertions=2; owner=design-system-program/DS-IMP-022; target-phase=2A.

- `useSurfaceState` hook (8 lifecycle states, `renderState` helper)
- Feedback components: `SurfaceLoadingSkeleton`, `SurfaceEmptyStateCard`, `SurfaceErrorStateCard`, `SurfaceStaleBanner`, `SurfaceOfflineBanner`
- The generated GAT07 contract above certifies exact declaration-to-consumer
  parity for the active surface-override family.
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
  /icons                   Stable 50-role facade plus generated 263-role packs
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

### Component CSS variable pattern (2026-04-17)

Modern engine components read **component-specific CSS variables** with fallback to generic tokens:

```tsx
// Pattern: var(--ds-{component}-{property}, var(--ds-{generic-fallback}))
background: 'var(--ds-button-primary-bg, var(--ds-color-primary))'
border: 'var(--ds-input-border, var(--ds-color-border))'
color: 'var(--ds-card-title-color, var(--ds-color-text-primary))'
```

This enables per-component customization through the governed visual compiler
without breaking existing code. When the component-specific variable is not
set, the generic token is used.

Representative migrated families include Button, Input, Card, Table,
PatternDataTable, Modal, Tabs, Radio and Checkbox.

### TenantAppearanceAdvanced (normalized compatibility shape)

`TenantAppearanceAdvanced` is the normalized compiler/compat shape, not the DB
write contract. `TenantThemeDocument` exposes bounded advanced fields that can
compile into these chrome sections:
- `chrome.controls` -- all 10 button variants + full input chrome + disabled + focus
- `chrome.table` -- header, row, cell, loading overlay
- `chrome.cardComponent` -- bg, border, shadow, header/body/footer
- `chrome.modal` -- bg, overlay, header/body/footer, close
- `chrome.tabs` -- border, color states
- `chrome.sidebar` -- full 17 fields
- `chrome.layout` -- full 6 fields
- `chrome.shell` -- grid overlay
- `tokenOverrides` -- raw `--ds-*` vars (max 200)

The appearance compiler
(`packages/core/src/infrastructure/compilers/kernel/runtime/appearance/`)
converts these to bounded CSS variables. Production DB themes are server
compiled; provider-side emission is the compatibility/preview path.

---

## Modern Engine Premium Uplift — Spec + Operative Backlog

The `modern` engine is being taken from "hand-made, mid-tier (near-indistinguishable from `rustic`)"
to the **Quiet Premium** target. Two artifacts govern this:

- **Normative law (the spec)**: `../docs-engineering/engineering/design-system/runtime/engines/modern/README.md`
  — the canonical Quiet Premium specification (motion contract, dark-aware elevation, interaction-state
  contract, gradient/glass/glow roles, color purity, scale hygiene, theme.css drain, content integrity,
  cross-engine layout, premium signature, and the section 12 metrics ratchet). Read it FULLY before
  touching the modern engine, tokens, or the `packages/core/src/foundation/tokens/css/runtime/engines/modern/` tree.
- **Operative backlog (the work)**: `roadmap/` holds one lane, `roadmap/engine-modern.md` (11 delegable
  work orders WO-ENG-01..11, each with file-level steps, a blocking acceptance gate, and a ready-to-paste
  delegation prompt). State lives in `roadmap/registry.json`; check status with `pnpm roadmap:status`
  and validate registry/lane agreement with `pnpm roadmap:check`. Read `roadmap/README.md` (start order,
  handoff protocol, bootstrap prompt, sighted-check law) before picking work. The lane's mechanical gate
  is `scripts/engine-token-audit.mjs` (created by WO-ENG-01). Statuses change ONLY via
  `scripts/roadmap-status.mjs`; never hand-edit `registry.json` or `STATUS.md`.
