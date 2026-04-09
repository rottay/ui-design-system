# Structures Tier

The **structures** tier sits between `patterns` (engine-agnostic task-level
compositions) and `surfaces` (page-level config objects). It hosts
structural families: headers, toolbars, record panels, metric cards,
loading overlays, and similar widgets that wrap or accompany patterns but
are more specific than primitives.

## When to use structures vs pattern vs surface

| If the piece... | It belongs in... |
|---|---|
| is an engine-switched leaf component (Button, Input, Card) | **primitives** |
| is a reusable task-level composition (DataTable, FormBuilder, Charts) | **patterns** |
| is a page-scale structural widget that wraps or accompanies a pattern (header, toolbar, record panel, metric card, loading shell) | **structures** |
| is a page-level config object a consumer passes to render a whole screen (ListSurface, DashboardSurface) | **surfaces** |

## Directory structure

Families are organized into 5 groups under `components/structures/`:

```
structures/
  headers/
    collection/           CollectionHeader
    detail/               DetailHeader
    edit/                 EditHeader
    form/                 FormHeader

  workspace/
    search-command-bar/   SearchCommandBar
    active-filters-bar/   ActiveFiltersBar
    field-filters-panel/  FieldFiltersPanel
    column-menu/          ColumnMenu
    saved-views-menu/     SavedViewsMenu
    selection-preview-rail/ SelectionPreviewRail
    scope-switcher/       ScopeSwitcher
    table-toolbar/        TableToolbar

  record/
    record/               RecordSummaryStrip, RecordFieldGrid, RecordField,
                          RecordActionBar, RecordPanel
    form-sections/        FormSections, FormFactsCard

  dashboard/
    dashboard-insights/   MetricsRows, MetricsCards, MetricsMinimal,
                          MetricsChart, ActivityTimeline, ActivityCompact,
                          ActivityCards, ActivityTicker, useVariant
    stats-header/         StatsHeader
    data-terminal-card/   DataTerminalCard

  feedback/
    loading-overlay/      LoadingOverlay
```

## Collection workspace kit (editorial grouping)

The renamed workspace-family components form a coherent kit for building
collection/list screens. They live under `structures/workspace/` and
`structures/headers/collection/` and are all available from the package
root (`@rottay/design-system`) like every other DS component.

An **editorial barrel** exists at `structures/_kits/collection-workspace/`
inside the source tree. It is a source-local convenience that documents
which 8 pieces belong together -- it is **not** re-exported from the
public API. The canonical consumer import is the package root:

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

The old names (`WorkspaceHeader`, `PremiumFormSections`,
`SurfaceSummaryStrip`, etc.) remain available via compat aliases declared
at the bottom of each structures family file. These aliases are scheduled
for removal once all known consumers have migrated.
