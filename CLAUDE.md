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

- Multi-engine design system with four engines:
  - **classic** — Ant Design 5.21 wrapper
  - **modern** — the Rottay-native premium skin. A residual DaisyUI class layer survives in
    sixteen engine files; `daisy.classConsumers` is a decrease-only ratchet that lets it shrink
    and never grow (WO-TOK-03 verdict, 2026-07-10)
  - **rustic** — Vanilla CSS fallback
  - **custom** — Reserved for white-label tenants (pluggable component pack registered at runtime)
- Components in `packages/core/src/components/`
- Each component has `engines/{classic,modern,rustic}/index.tsx` siblings selected at runtime via `createEngineComponent()` and the active engine context
- Follow existing component patterns for new additions
- The canonical engine names are `classic` / `modern` / `rustic` / `custom`. The legacy names `titan` / `hermes` / `apollo` are gone — do not reintroduce them.

## Ownership rules

This package is the **single source of truth** for reusable, domain-agnostic UI capability across all Rottay apps.

- The DS owns: primitives, patterns, generic surfaces, page shells, detail shells, detail-form shells, collection workspace shells, layout shells, reusable widget chrome, runtime tenant contracts, product-profile contracts, engine extension points, motion vocabulary, and reusable lane layouts (ranked-row, signal-lane, feed-lane, action-lane).
- The DS does **not** own: tenant/company/user/role/candidate/interview/event semantics, control-plane narrative, recruiting copy, dashboard storytelling, or any product-specific AI/operator narration.
- Before adding a new component, ask: *"Could another app use this without knowing what a tenant, candidate, role, company, interview, or event is?"* If no, it does not belong here — it belongs in the consuming app.
- See `docs-engineering/engineering/design-system/architecture/README.md` and `docs-engineering/engineering/design-system/catalog/decision-matrix/README.md` for the full ownership contract.

## Component taxonomy (4 tiers)

The design system has 4 single-word tiers under `packages/core/src/components/`:

### primitives/
Engine-switched leaf components (Button, Input, Card, Modal, Tabs, etc).
Each primitive has 4 engine implementations: classic, modern, rustic, custom.
6 categories: display, inputs, feedback, layout, navigation, overlay.

### structures/
Page-structure families that wrap or accompany patterns to form page chrome.
Think: headers, toolbars, command bars, record panels, metric cards, loading overlays.
5 groups: `headers/`, `workspace/`, `record/`, `dashboard/`, `feedback/`.

**Example:** CollectionHeader, SearchCommandBar, TableToolbar, RecordFieldGrid, StatsHeader, LoadingOverlay.

### patterns/
Engine-agnostic, task-level compositions that solve generic UI tasks.
Think: tables, forms, charts, kanban boards, timelines, command palettes.
7 groups: `data/`, `forms/`, `visualization/`, `communication/`, `workflow/`, `navigation/`, `misc/`.
Plus `foundation/` (shared types, hooks, header-actions) and `_internal/` (truly private).

**Example:** PatternDataTable, PatternFormBuilder, PatternKanbanBoard, PatternStatsGrid.

### surfaces/
Page-level config objects that describe a whole screen declaratively.
3 tiers: `foundation/` (types, builders, helpers), `layout/` (page-shell, header, sidebar), `pages/` (6 domain groups).

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

The canonical premium visual source of truth is **BrandTheme** (`contracts/themes/`).
First-party brand sources live in `tokens/ts/brand-themes/`.

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

- `TenantConfig.brandTheme` is the canonical field. Legacy `personality`/`tokenOverrides` fields are deprecated compat.
- Product profile is **not** part of the visual merge when brandTheme is present -- only `surfaceDefaults` survives.
- First-party tenant CSS files (`tokens/css/artifacts/`) are **generated snapshots**, not the source of truth. The `.ts` BrandTheme files are the source.
- Domain-specific tokens (`--ds-ticket-*`, `--ds-event-*`) belong in consuming apps, not DS core.
- The brand compiler (`compilers/brand-theme/`) converts BrandTheme to CSS vars and personality tokens.
- First-party tenant artifacts (`tokens/css/artifacts/{bithire,evnto,rottay}/index.css`) are build products assembled from the BrandTheme `.ts` file plus a declared `_source/extension.css`. Regenerate with `pnpm -C packages/core build:vertical-css`; hand-edits fail `lint:artifacts` (chained into `pretest` and `lint`).

## Icon system (semantic facade + compatibility catalog)

New product code uses the supplier-independent `Icon` facade backed by the
fixed semantic registry. Phosphor is confined to `src/icons/adapters/`; apps
MUST NOT import Phosphor, Lucide, Ant icons, or another functional supplier
directly. The existing Lucide-shaped named catalog remains temporary compat.

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
Add a semantic name to `src/icons/semantic/registry.ts`, map it only inside the
supplier adapter, extend the fixed-corpus tests, and update provenance when the
supplier/version changes. Do not add a new vendor-shaped alias for product use.

Brand and cloud-provider identity is a separate asset class. Product code uses
`BrandMark` or `CloudServiceMark` from `@rottay/design-system/marks`; the
pinpoint `@thesvg/react` imports stay inside `src/marks/adapters/`. Never use a
brand mark for an action/navigation concept, never load a remote mark at
runtime, and never pass supplier types through the public API. A tenant may
provide its own approved company logo through the tenant-brand contract, but
cannot select an arbitrary catalog mark or replace functional glyph meaning.

---

## Chart System (19 types)

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

<!-- GAT07-CLAIM surface-profile-overrides: reserved-experimental; runtime=unconsumed; affirmative-behavior=false; owner=DS-IMP-022 -->

GAT07-CONTRACT surface-profile-overrides: symbols=[SurfaceVisualOverrides, useSurfaceProfileDefaultsWithOverrides, visual.profileOverrides]; disposition=reserved-experimental; runtime-status=isolated-helper-unconsumed-by-surfaces; affirmative-behavior=false; production-consumers=0; executable-assertions=0; owner=design-system-program/DS-IMP-022; target-phase=2A.

- `useSurfaceState` hook (8 lifecycle states, `renderState` helper)
- Feedback components: `SurfaceLoadingSkeleton`, `SurfaceEmptyStateCard`, `SurfaceErrorStateCard`, `SurfaceStaleBanner`, `SurfaceOfflineBanner`
- The generated GAT07 contract above is the only authority for the reserved
  surface-override family.
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
pnpm dev          # http://localhost:7001 (Turbopack)
pnpm build        # Production build (~10s, 265 pages)
pnpm typecheck    # TypeScript check
```

### Architecture
- **Location**: `ui-design-system/packages/showroom/`
- **Framework**: Next.js 16 + React 19 + TypeScript + Tailwind (marketing only)
- **DS dependency**: `workspace:*` (hot-reload, no publish needed)
- **Bundler**: Turbopack (no --webpack flag needed)
- **Port**: 3002 (avoids collision with app-platform on 3000)
- **Deploy target**: showroom.rottay.com (Vercel, separate project)

### Route Tree (265 pages)
```
/                          Commercial landing page (Tailwind, marketing exception)
/foundations/              Tokens, themes, engines, icons
  /tokens/{colors,spacing,typography,radius,shadows,motion}
  /icons                   109 searchable icons with copy-to-clipboard
  /engines                 Side-by-side engine comparison
  /themes                  3 brand themes with live preview
/primitives/[category]/[component]   97 primitive pages with live rendering
/patterns/[group]/[pattern]          47 pattern pages with previews
  /visualization/charts/[type]       18 chart pages with real D3 rendering
/structures/[group]/[structure]      21 structure pages
/surfaces/[group]/[surface]          36 surface pages with composition
/verticals/                          Platform, BitHire, Evnto
  /platform/[category]              Dashboard, user list, tenant form demos
  /bithire/[category]               Pipeline kanban, recruiter dashboard, scorecard
  /evnto/[category]                 Event dashboard, ticket builder, venue layout
/playground                          Interactive sandbox + theme builder
/developers/                         Getting started + architecture deep-dive
```

### Key Components
- `src/components/layout/` -- Shell, sidebar, header (with engine/theme switcher), footer, search (Cmd+K)
- `src/components/playground/` -- Engine switcher, theme switcher, code block, prop table, component preview, engine comparison
- `src/components/demos/` -- Vertical demo screens (platform/, bithire/, evnto/)
- `src/components/showroom-context/` -- Global engine/theme state context
- `src/data/registry/` -- Component registries (primitives, patterns, structures, surfaces, charts, icons)
- `src/data/navigation.ts` -- Sidebar navigation tree

### Rules
- Marketing landing page (src/app/page.tsx) uses Tailwind + lucide-react (marketing exception)
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

This enables per-component customization via BrandTheme or TenantAppearanceAdvanced without breaking existing code. When the component-specific var is not set, the generic token is used.

**Components migrated**: Button (13 variants), Input (15 props), Card (12), Table+PatternDataTable (12+12), Modal (11x2 files), Tabs (7), Radio (4), Checkbox (7).

### TenantAppearanceAdvanced (~140 fields)

DB-driven tenants can customize all chrome sections via `TenantAppearanceAdvanced`:
- `chrome.controls` -- all 10 button variants + full input chrome + disabled + focus
- `chrome.table` -- header, row, cell, loading overlay
- `chrome.cardComponent` -- bg, border, shadow, header/body/footer
- `chrome.modal` -- bg, overlay, header/body/footer, close
- `chrome.tabs` -- border, color states
- `chrome.sidebar` -- full 17 fields
- `chrome.layout` -- full 6 fields
- `chrome.shell` -- grid overlay
- `tokenOverrides` -- raw `--ds-*` vars (max 200)

The appearance compiler (`compilers/appearance/`) converts these to CSS vars injected by ThemeProvider.

---

## Modern Engine Premium Uplift — Spec + Operative Backlog

The `modern` engine is being taken from "hand-made, mid-tier (near-indistinguishable from `rustic`)"
to the **Quiet Premium** target. Two artifacts govern this:

- **Normative law (the spec)**: `../docs-engineering/engineering/design-system/runtime/engines/modern/README.md`
  — the canonical Quiet Premium specification (motion contract, dark-aware elevation, interaction-state
  contract, gradient/glass/glow roles, color purity, scale hygiene, theme.css drain, content integrity,
  cross-engine layout, premium signature, and the section 12 metrics ratchet). Read it FULLY before
  touching the modern engine, tokens, or the `packages/core/src/tokens/css/engines/modern/` tree.
- **Operative backlog (the work)**: `roadmap/` holds one lane, `roadmap/engine-modern.md` (11 delegable
  work orders WO-ENG-01..11, each with file-level steps, a blocking acceptance gate, and a ready-to-paste
  delegation prompt). State lives in `roadmap/registry.json`; check status with `pnpm roadmap:status`
  and validate registry/lane agreement with `pnpm roadmap:check`. Read `roadmap/README.md` (start order,
  handoff protocol, bootstrap prompt, sighted-check law) before picking work. The lane's mechanical gate
  is `scripts/engine-token-audit.mjs` (created by WO-ENG-01). Statuses change ONLY via
  `scripts/roadmap-status.mjs`; never hand-edit `registry.json` or `STATUS.md`.
