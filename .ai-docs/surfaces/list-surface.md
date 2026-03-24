# ListSurface

> Source: `ui-design-system/packages/core/src/components/surfaces/list/index.tsx`

## Purpose

Reusable list-page surface with filters, table/card views, row actions, and standard empty/loading handling. The most commonly used surface in the design system -- powers all entity listing pages (users, orders, invoices, etc.).

## Config Structure

### ListSurfaceConfig\<TView\>

```typescript
interface ListSurfaceConfig<TView> {
  visual: ListSurfaceVisualConfig;
  presentation: ListSurfacePresentationConfig<TView>;
  behavior: ListSurfaceBehaviorConfig<TView>;
  permissions?: SurfacePermissionsConfig;
}
```

### Visual (ListSurfaceVisualConfig)

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `defaultView` | `'table' \| 'cards'` | Profile's `listView` | Initial view mode |
| `mobileDefaultView` | `'table' \| 'cards'` | `'cards'` | View mode on mobile |
| `allowViewSwitch` | `boolean` | `true` | Show table/cards toggle |
| `hideViewSwitchOnMobile` | `boolean` | `true` (builder) | Hide toggle on mobile |
| `cardMinWidth` | `number` | Profile-driven (240-320) | Min card width in card view |
| `compact` | `boolean` | Profile density | Force compact density |
| `stickyHeader` | `boolean` | -- | Pin table header on scroll |
| `maxHeight` | `number \| string` | -- | Constrain list height |
| `mobileFiltersLayout` | `'inline' \| 'stacked' \| 'sidebar'` | `'stacked'` (builder) | Filter layout on mobile |

### Presentation (ListSurfacePresentationConfig\<TView\>)

| Property | Type | Description |
|----------|------|-------------|
| `chrome` | `SurfacePageChrome` | Page title, breadcrumbs, back button |
| `emptyState` | `ReactNode` | Custom empty state (falls back to `SurfaceEmptyState`) |
| `toolbarStart` | `ReactNode` | Extra toolbar content (leading side) |
| `toolbarEnd` | `ReactNode` | Extra toolbar content (trailing side) |
| `renderCard` | `(item, index) => ReactNode` | Custom card renderer for card view |
| `renderCell` | `Record<string, (value, item, index) => ReactNode>` | Per-column cell overrides by fieldId |

### Behavior (ListSurfaceBehaviorConfig\<TView\>)

| Property | Type | Description |
|----------|------|-------------|
| `columns` | `SurfaceColumn<TView>[]` | Column definitions (order = display order) |
| `filters` | `FilterDef[]` | Filter bar definitions |
| `filterValues` | `Record<string, unknown>` | Current filter values (controlled) |
| `onFilterChange` | `(values) => void` | Filter change callback |
| `onFilterReset` | `() => void` | Reset all filters |
| `onFilterApply` | `(values) => void` | Explicit apply |
| `pagination` | `PaginationConfig \| false` | Pagination config or disable |
| `rowKey` | `keyof TView \| ((row) => string)` | Stable row key derivation |
| `sorting` | `SortConfig \| null` | Current sort state |
| `onSortChange` | `(sort) => void` | Sort change callback |
| `primaryAction` | `SurfaceAction<void>` | Page-level CTA ("Create New") |
| `rowActions` | `SurfaceAction<TView>[]` | Per-row contextual actions |
| `onRowClick` | `(item, index) => void` | Row click handler |

## Props Interface

```typescript
interface ListSurfaceProps<TRaw, TView extends object> {
  data: TRaw[];
  adapter: EntityAdapter<TRaw, TView>;
  config: ListSurfaceConfig<TView>;
  loading?: boolean;
  error?: unknown;
  onRetry?: () => void | Promise<void>;
}
```

## Builder Function

```typescript
function createListSurfaceConfig<TView>(
  config: ListSurfaceConfig<TView>
): ListSurfaceConfig<TView>
```

Mobile-first defaults injected:
- `mobileDefaultView: 'cards'`
- `hideViewSwitchOnMobile: true`
- `mobileFiltersLayout: 'stacked'`

## Internal Composition

### Patterns Used
- **PatternDataTable**: Table view rendering with sorting, pagination, sticky header
- **PatternFilterPanel**: Filter bar with active count badge

### Primitives Used
- `Box`, `Button`, `Card`, `Flex`, `Grid`, `Stack`, `Text`

### Surface Infrastructure
- **PageShellSurface**: Page chrome wrapper
- **SurfaceEmptyState / SurfaceErrorState**: Standard empty/error states
- **FadeIn / StaggerChildren**: Entrance animations (personality-driven)
- **SurfaceAccentBarWrapper**: Accent bar (personality-driven)

### Key Internal Logic

1. **Adapter mapping**: `mapSurfaceData(data, adapter)` transforms raw API data into view models
2. **Permission filtering**: `filterSurfaceColumns()`, `filterSurfaceActions()`, `resolveSurfaceAction()` run before render
3. **Cell renderer resolution chain** (most specific wins):
   - `presentation.renderCell[fieldId]`
   - `presentation.renderCell[columnKey]`
   - Column's own `render` function
   - `stringifySurfaceValue()` fallback
4. **View mode**: Responsive -- uses `mobileDefaultView` on mobile, `activeView` on desktop
5. **Profile defaults**: Card variant, compact density, card min width, section spacing, animation all from `useSurfaceProfileDefaults()`

## Usage Example

```typescript
const config = createListSurfaceConfig<UserView>({
  visual: { defaultView: 'table', allowViewSwitch: true },
  presentation: {
    chrome: { title: 'Users', breadcrumbs: [{ label: 'Admin' }] },
  },
  behavior: {
    columns: [
      { key: 'name', fieldId: 'user.name', header: 'Name' },
      { key: 'email', fieldId: 'user.email', header: 'Email' },
    ],
    primaryAction: { id: 'create', label: 'Add User', variant: 'primary' },
    rowActions: [
      { id: 'edit', label: 'Edit', onClick: (user) => router.push(`/users/${user.id}`) },
    ],
  },
  permissions: { granted: ['users.read', 'users.create'] },
});

<ListSurface data={rawUsers} adapter={userAdapter} config={config} loading={isLoading} />
```
