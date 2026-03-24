# KanbanSurface

> Source: `ui-design-system/packages/core/src/components/surfaces/kanban/index.tsx`

## Purpose

Full-page kanban board with filters. Wraps `PatternKanbanBoard` inside `PageShellSurface`. The surface owns page chrome, filter panel, and action bar; the pattern owns column/card rendering and drag-and-drop mechanics. Used for project management, recruitment pipelines, support ticket boards, and any workflow with stage-based progression.

## Config Structure

### KanbanSurfaceConfig

```typescript
interface KanbanSurfaceConfig {
  visual: KanbanSurfaceVisualConfig;
  presentation: KanbanSurfacePresentationConfig;
  behavior: KanbanSurfaceBehaviorConfig;
  permissions?: SurfacePermissionsConfig;
}
```

### Visual (KanbanSurfaceVisualConfig)

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `maxWidth` | `number \| string` | -- | Constrain board width |
| `columnMinWidth` | `number \| string` | -- | Minimum width per column |
| `columnGap` | `number \| string` | -- | Gap between columns |
| `mobileColumnsLimit` | `number` | `1` (builder) | Max visible columns on mobile |
| `stackColumnsOnMobile` | `boolean` | `true` (builder) | Stack columns vertically on mobile |

### Presentation (KanbanSurfacePresentationConfig)

| Property | Type | Description |
|----------|------|-------------|
| `chrome` | `SurfacePageChrome` | Page title, breadcrumbs |
| `emptyState` | `ReactNode` | Shown when all columns are empty |
| `renderCard` | `(card, columnId) => ReactNode` | Custom card renderer |
| `renderColumnHeader` | `(column, itemCount) => ReactNode` | Custom column header with WIP count |

### Behavior (KanbanSurfaceBehaviorConfig)

| Property | Type | Description |
|----------|------|-------------|
| `columns` | `KanbanSurfaceColumn[]` | **Required** -- ordered kanban columns with cards |
| `onCardMove` | `(cardId, fromColumn, toColumn, position) => void` | Drag-and-drop handler |
| `onCardCreate` | `(columnId) => void` | New card creation handler |
| `onCardClick` | `(card, columnId) => void` | Card click handler (open detail) |
| `filters` | `FilterDef[]` | Filter definitions |
| `filterValues` | `Record<string, unknown>` | Current filter state |
| `onFilterChange` | `(values) => void` | Filter change callback |
| `actions` | `SurfaceAction<void>[]` | Page-level actions |

### Supporting Types

```typescript
interface KanbanSurfaceCard {
  id: string;
  title: ReactNode;
  description?: ReactNode;
  meta?: ReactNode;
  tags?: ReactNode;
  assignee?: ReactNode;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  data?: unknown;               // Opaque domain data
}

interface KanbanSurfaceColumn {
  id: string;
  title: ReactNode;
  items: KanbanSurfaceCard[];   // Cards ordered by position
  limit?: number;               // WIP limit (exceeding shows warning)
  color?: string;               // Column accent color
}
```

## Props Interface

```typescript
interface KanbanSurfaceProps {
  config: KanbanSurfaceConfig;
  loading?: boolean;
}
```

## Builder Function

```typescript
function createKanbanSurfaceConfig(
  config: KanbanSurfaceConfig
): KanbanSurfaceConfig
```

Mobile-first defaults:
- `mobileColumnsLimit: 1`
- `stackColumnsOnMobile: true`

## Internal Composition

### Patterns Used
- **PatternKanbanBoard**: Column/card rendering, drag-and-drop mechanics
- **PatternFilterPanel**: Filter bar with active count badge

### Primitives Used
- `Card`, `Stack`

### Surface Infrastructure
- **PageShellSurface**: Page chrome wrapper
- **SurfaceActionBar**: Permission-aware page actions
- **SurfaceEmptyState**: Empty board state

### Key Internal Logic

1. **Actions placement**: Actions render outside the board so they remain accessible even when the board is empty (matches ListSurface pattern)
2. **Active filter count**: `countActiveFilters()` drives the filter panel badge
3. **Column stripping**: Internal-only surface fields are stripped before passing to the pattern; the pattern expects a leaner column shape
4. **Empty state detection**: Checks if ANY column has items; "no items" only shows when not loading to avoid flashing
5. **Card fallback**: Falls back to just `card.title` when no custom `renderCard` is provided
6. **WIP limits**: `KanbanSurfaceColumn.limit` triggers a visual warning in the column header when item count exceeds the limit

## Usage Example

```typescript
const config = createKanbanSurfaceConfig({
  visual: { columnMinWidth: 300 },
  presentation: {
    chrome: { title: 'Pipeline', breadcrumbs: [{ label: 'Recruiting' }] },
    renderCard: (card, columnId) => <CandidateCard candidate={card.data} />,
    renderColumnHeader: (col, count) => (
      <Flex justify="between">
        <Text>{col.title}</Text>
        <Badge>{count}{col.limit ? `/${col.limit}` : ''}</Badge>
      </Flex>
    ),
  },
  behavior: {
    columns: [
      { id: 'applied', title: 'Applied', items: appliedCandidates, color: '#3B82F6' },
      { id: 'screening', title: 'Screening', items: screeningCandidates, limit: 5 },
      { id: 'interview', title: 'Interview', items: interviewCandidates, limit: 3 },
      { id: 'offer', title: 'Offer', items: offerCandidates },
    ],
    onCardMove: (cardId, from, to, pos) => moveCandidateStage(cardId, to, pos),
    onCardClick: (card) => router.push(`/candidates/${card.id}`),
    onCardCreate: (columnId) => openNewCandidateDialog(columnId),
    filters: [
      { key: 'role', label: 'Role', type: 'select', options: roleOptions },
    ],
    actions: [
      { id: 'create', label: 'Add Candidate', variant: 'primary' },
    ],
  },
});

<KanbanSurface config={config} loading={isLoading} />
```
