# Claude Code Rules - Design System

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
  - **modern** — Tailwind / DaisyUI wrapper
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
- See `docs-engineering/archive/audits/2026-04-07-home-ai-agent-audit-davila/11-system-ownership-boundaries.md` for the full ownership contract.

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
- BrandTheme `.ts` files MUST stay in sync with CSS artifacts. If you edit one, update the other.

## Icon System (109 curated icons)

Icons are centralized in the DS via `createIcon()` factory wrapping lucide-react.
Apps MUST import icons from `@rottay/design-system/icons`, NOT directly from `lucide-react`.

### Import pattern
```tsx
// CORRECT
import { SearchIcon, PlusIcon, CheckIcon } from '@rottay/design-system/icons';

// WRONG - do not import lucide directly
import { Search, Plus, Check } from 'lucide-react';
```

### Categories (10)
navigation, action, status, content, communication, user, data, layout, media, misc

### Token customization
- `--ds-icon-stroke-width: 1.5` (tenant-overridable for heavier/lighter look)
- `--ds-icon-{xs|sm|md|lg|xl|2xl}-size` for sizing
- Color via `currentColor` (inherits from parent text, tenant-aware)

### Adding new icons
Add one line to the appropriate `src/icons/catalog/{category}.ts`:
```tsx
export const NewIcon = createIcon(LucideNew, 'NewIcon');
```

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

- `useSurfaceState` hook (8 lifecycle states, `renderState` helper)
- Feedback components: `SurfaceLoadingSkeleton`, `SurfaceEmptyStateCard`, `SurfaceErrorStateCard`, `SurfaceStaleBanner`, `SurfaceOfflineBanner`
- `useSurfaceProfileDefaultsWithOverrides` hook
- `SurfaceVisualOverrides` type on all 33 surface visual configs
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
