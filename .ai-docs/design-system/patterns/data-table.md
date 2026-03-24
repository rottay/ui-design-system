# PatternDataTable

**Source**: `ui-design-system/packages/core/src/components/patterns/data-table/`
**Component**: `PatternDataTable<T>`
**Export**: `import { PatternDataTable } from '@rottay/design-system'`

## Purpose

The DataTable is the most feature-rich Tier 2 pattern. It provides a generic, slot-driven data table that supports server-side and client-side sorting, filtering, pagination, row selection, responsive mobile layouts, column visibility/resize/reorder/pin, expandable rows, bulk actions, and visual density toggles. The parent component owns all state; the table only renders UI and fires callbacks.

## Engine Support

| Engine | Implementation |
|--------|---------------|
| classic (Titan) | `engines/classic.tsx` |
| modern (Hermes) | `engines/modern.tsx` |
| rustic (Apollo) | `engines/rustic.tsx` |

Additionally, the main `PatternDataTable.tsx` wrapper adds responsive behavior using `useBreakpoints()` and `useMediaQuery()` hooks, switching to `DataTableMobileCards` on small viewports when `mobileCard` is provided.

## Props Interface

```typescript
interface DataTablePatternProps<T> extends PatternBaseProps {
  // Data
  data: T[];
  columns: ColumnDef<T>[];
  rowKey?: keyof T | ((row: T) => string);

  // Slots
  toolbar?: ReactNode;
  actions?: (row: T, index: number) => ReactNode;
  bulkActions?: BulkAction<T>[];
  emptyState?: ReactNode;
  renderRow?: (row: T, defaultRender: ReactNode, index: number) => ReactNode;
  expandedRow?: (row: T) => ReactNode;
  header?: ReactNode;
  footer?: ReactNode;

  // Selection
  selectable?: boolean;
  selectedKeys?: string[];
  onSelectionChange?: (selectedKeys: string[], selectedRows: T[]) => void;

  // Interaction
  onRowClick?: (row: T, index: number) => void;
  onRowDoubleClick?: (row: T, index: number) => void;

  // Sorting
  sorting?: SortConfig | null;
  onSortChange?: (sort: SortConfig) => void;

  // Filtering
  filters?: FilterDef[];
  filterValues?: Record<string, unknown>;
  onFilterChange?: (filters: Record<string, unknown>) => void;

  // Pagination
  pagination?: PaginationConfig | false;

  // Responsive
  mobileCard?: (row: T, index: number) => ReactNode;
  mobileBreakpoint?: number; // default: 768

  // Visual
  striped?: boolean;
  bordered?: boolean;
  compact?: boolean;
  stickyHeader?: boolean;
  maxHeight?: number | string;
  hoverable?: boolean;
  zebraColor?: string;

  // Column Visibility
  columnVisibility?: boolean;
  visibleColumns?: string[];
  onVisibleColumnsChange?: (keys: string[]) => void;
  lockedColumns?: string[];

  // Column Resizing
  resizable?: boolean;
  columnWidths?: Record<string, number>;
  onColumnResize?: (key: string, width: number) => void;

  // Column Reordering
  reorderable?: boolean;
  columnOrder?: string[];
  onColumnReorder?: (order: string[]) => void;

  // Column Pinning
  pinnedColumns?: { left: string[]; right: string[] };
  onPinChange?: (pinned: { left: string[]; right: string[] }) => void;

  // Density
  density?: 'compact' | 'comfortable' | 'spacious'; // default: 'comfortable'
}
```

## Companion Types

### ColumnDef<T>

```typescript
interface ColumnDef<T> {
  key: string;
  header: ReactNode;
  accessorKey?: keyof T & string;
  accessorFn?: (row: T) => unknown;
  render?: (value: unknown, row: T, index: number) => ReactNode;
  width?: number | string;
  minWidth?: number;
  maxWidth?: number;
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;
  filterable?: boolean;
  visible?: boolean;
  pin?: 'left' | 'right';
  editable?: boolean;
  responsive?: ColumnResponsiveConfig;
}
```

### Responsive Column Modes

Each column can define per-breakpoint behavior:
- `visible` -- renders normally
- `hidden` -- completely hidden
- `summary` -- appears in mobile card summary area
- `primary` -- becomes card title on mobile

## Exported Utilities

- `resolveAccessor<T>(column, row)` -- extracts cell value using accessorFn -> accessorKey -> key fallback
- `resolveRowKey<T>(row, rowKey, index)` -- resolves unique string key for a row

## Composition Hook

`useDataTable(options)` provides client-side sort, filter, pagination, and selection state management.

## Usage Example

```tsx
import { PatternDataTable } from '@rottay/design-system';

<PatternDataTable<User>
  data={users}
  columns={[
    { key: 'name', header: 'Name', accessorKey: 'name', sortable: true },
    { key: 'email', header: 'Email', accessorKey: 'email',
      responsive: { phone: 'hidden', tablet: 'visible', desktop: 'visible' } },
    { key: 'role', header: 'Role', accessorKey: 'role' },
  ]}
  rowKey="id"
  selectable
  onSelectionChange={(keys, rows) => setSelected(rows)}
  sorting={{ key: 'name', direction: 'asc' }}
  onSortChange={(sort) => refetch({ orderBy: sort.key, order: sort.direction })}
  pagination={{ current: 1, pageSize: 20, total: 100, onChange: handlePage }}
  striped
  hoverable
  mobileCard={(row) => <UserCard user={row} />}
/>
```
