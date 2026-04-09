# Structures Tier

The **structures** tier sits between `patterns` (engine-agnostic task-level
compositions) and `surfaces` (page-level config objects). It hosts
structures families: headers, toolbars, record panels, metric cards,
loading overlays, and similar structural widgets that wrap or accompany
patterns but are more specific than primitives.

## When to use structures vs pattern vs surface

| If the piece... | It belongs in... |
|---|---|
| is an engine-switched leaf component (Button, Input, Card) | **primitives** |
| is a reusable task-level composition (DataTable, FormBuilder, Charts) | **patterns** |
| is a page-scale structural widget that wraps or accompanies a pattern (header, toolbar, record panel, metric card, loading shell) | **structures** |
| is a page-level config object a consumer passes to render a whole screen (ListSurface, DashboardSurface) | **surfaces** |

## Structures families (as of the 2026-04-08 audit)

### Headers

- **CollectionHeader** (`collection-header/`) -- hero header for collection/list pages
- **DetailHeader** (`detail-header/`) -- header for entity detail pages
- **EditHeader** (`edit-header/`) -- header for entity edit pages
- **FormHeader** (`form-header/`) -- header for create-form pages

### Toolbars and controls

- **TableToolbar** (`table-toolbar/`) -- one-row slot-driven toolbar for tables/lists
- **SearchCommandBar** (`search-command-bar/`) -- command/search bar with voice + suggestions
- **ActiveFiltersBar** (`active-filters-bar/`) -- horizontal active-filter chip strip
- **FieldFiltersPanel** (`field-filters-panel/`) -- filter card grid with presets
- **ColumnMenu** (`column-menu/`) -- column visibility/order panel
- **SavedViewsMenu** (`saved-views-menu/`) -- saved-views dropdown
- **ScopeSwitcher** (`scope-switcher/`) -- horizontal scope pill strip
- **SelectionPreviewRail** (`selection-preview-rail/`) -- sticky preview rail for selected items

### Record

- **FormSections** (`form-sections/`) -- accordion form section container with tone variants
- **FormFactsCard** (`form-sections/`) -- label/value facts card (companion to FormSections)
- **RecordSummaryStrip** (`record/`) -- horizontal summary card
- **RecordFieldGrid** (`record/`) -- CSS-grid wrapper for read-field layout
- **RecordField** (`record/`) -- single read-only field card
- **RecordActionBar** (`record/`) -- sticky action rail
- **RecordPanel** (`record/`) -- generic card container

### Metric cards and overlays

- **StatsHeader** (`stats-header/`) -- operational stat card strip with animations
- **DataTerminalCard** (`data-terminal-card/`) -- 4-variant dashboard metric card
- **LoadingOverlay** (`loading-overlay/`) -- semi-transparent loading shell

### Dashboard insights

- **MetricsRows / MetricsCards / MetricsMinimal / MetricsChart** (`dashboard-insights/metrics/`)
- **ActivityTimeline / ActivityCompact / ActivityCards / ActivityTicker** (`dashboard-insights/activity/`)
- **useVariant** (`dashboard-insights/use-variant/`) -- random variant picker hook

## Collection workspace kit (editorial grouping)

The renamed workspace-family components form a coherent kit for
building collection/list screens. They live in individual structures/
folders and are all available from the package root
(`@rottay/design-system`) like every other structures family.

An **editorial barrel** exists at `structures/_kits/collection-workspace/`
inside the source tree. It is a source-local convenience that documents
which 8 pieces belong together — it is **not** re-exported from the
public API and consumers should not import from it. The canonical
consumer import is the package root:

```ts
// All 8 collection workspace pieces come from the root, alongside
// every other DS component.
import {
  CollectionHeader,
  SearchCommandBar,
  ActiveFiltersBar,
  FieldFiltersPanel,
  ColumnMenu,
  SavedViewsMenu,
  SelectionPreviewRail,
  ScopeSwitcher,
} from '@rottay/design-system';
```

## Compatibility aliases

Checkpoint D introduced canonical new names for all structures families.
The old names (`WorkspaceHeader`, `PremiumFormSections`,
`SurfaceSummaryStrip`, etc.) remain available via compat aliases declared
at the bottom of each structures family file. These aliases are scheduled for
removal once all known consumers have migrated (tracked in Checkpoint F).
