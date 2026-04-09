# Chrome Tier

The **chrome** tier sits between `patterns` (engine-agnostic task-level
compositions) and `surfaces` (page-level config objects). It hosts
page-chrome families: headers, toolbars, record panels, metric cards,
loading overlays, and similar structural widgets that wrap or accompany
patterns but are more specific than primitives.

## When to use chrome vs pattern vs surface

| If the piece... | It belongs in... |
|---|---|
| is an engine-switched leaf component (Button, Input, Card) | **primitives** |
| is a reusable task-level composition (DataTable, FormBuilder, Charts) | **patterns** |
| is a page-scale structural widget that wraps or accompanies a pattern (header, toolbar, record panel, metric card, loading shell) | **chrome** |
| is a page-level config object a consumer passes to render a whole screen (ListSurface, DashboardSurface) | **surfaces** |

## Chrome families (as of the 2026-04-08 audit)

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

### Record chrome

- **FormSections** (`form-sections/`) -- accordion form section container with tone variants
- **FormFactsCard** (`form-sections/`) -- label/value facts card (companion to FormSections)
- **RecordSummaryStrip** (`record-chrome/`) -- horizontal summary card
- **RecordFieldGrid** (`record-chrome/`) -- CSS-grid wrapper for read-field layout
- **RecordField** (`record-chrome/`) -- single read-only field card
- **RecordActionBar** (`record-chrome/`) -- sticky action rail
- **RecordPanel** (`record-chrome/`) -- generic card container

### Metric cards and overlays

- **StatsHeader** (`stats-header/`) -- operational stat card strip with animations
- **DataTerminalCard** (`data-terminal-card/`) -- 4-variant dashboard metric card
- **LoadingOverlay** (`loading-overlay/`) -- semi-transparent loading shell

### Dashboard insight variants

- **MetricsRows / MetricsCards / MetricsMinimal / MetricsChart** (`dashboard-insight-variants/metrics/`)
- **ActivityTimeline / ActivityCompact / ActivityCards / ActivityTicker** (`dashboard-insight-variants/activity/`)
- **useVariant** (`dashboard-insight-variants/use-variant/`) -- random variant picker hook

## Collection workspace kit

The renamed workspace-family components form a coherent kit for
building collection/list screens. They are re-exported together from
`chrome/_kits/collection-workspace/` for consumers who want the
complete set in one import:

```ts
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

Checkpoint D introduced canonical new names for all chrome families.
The old names (`WorkspaceHeader`, `PremiumFormSections`,
`SurfaceSummaryStrip`, etc.) remain available via compat aliases declared
at the bottom of each chrome family file. These aliases are scheduled for
removal once all known consumers have migrated (tracked in Checkpoint F).
