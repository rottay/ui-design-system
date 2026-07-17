/**
 * @fileoverview Type definitions for the DataTable pattern component.
 * Defines the generic `DataTablePatternProps<T>` interface that drives the
 * fully-featured data table with composable slots (toolbar, actions, bulk
 * actions, expandedRow, mobileCard), controlled selection/sorting/filtering/
 * pagination, and visual density toggles (striped, bordered, compact).
 */

import type { ReactNode } from 'react';
import type { DataTableMobileCardContext } from '@/foundation/contracts/runtime/components/patterns/data';
import type {
  PatternBaseProps,
  ColumnDef,
  SortConfig,
  FilterDef,
  PaginationConfig,
  BulkAction,
} from '../../../../../foundation/contracts/runtime/components/patterns/core';

export type {
  DataTableMobileCardContext,
  DataTableMobileCardInteractionEvent,
} from '@/foundation/contracts/runtime/components/patterns/data';

// ---------------------------------------------------------------------------
// Aggregation
// ---------------------------------------------------------------------------

/**
 * An aggregation function: either a built-in named strategy or a custom
 * function that receives all items in a group and returns a display value.
 */
export type AggregationFn<T> =
  | 'count'
  | 'sum'
  | 'average'
  | 'min'
  | 'max'
  | ((items: T[]) => ReactNode);

/**
 * Product behavior supplied to a custom mobile-card renderer.
 *
 * The third callback argument is additive and therefore keeps existing
 * `(row, index) => ReactNode` renderers source-compatible. New renderers can
 * preserve the table's selection, open and row-action mechanics instead of
 * rebuilding them from unrelated app state.
 */
/**
 * Props for the DataTable pattern component.
 *
 * The DataTable is a generic, slot-driven table that supports server-side and
 * client-side sorting, filtering, pagination, row selection, and responsive
 * mobile layouts. The parent component owns all state; the table only renders
 * UI and fires callbacks.
 *
 * @typeParam T - The shape of a single data row. Column accessors and row
 *   actions are typed against this.
 *
 * @example
 * ```tsx
 * <PatternDataTable<User>
 *   data={users}
 *   columns={[
 *     { key: 'name', header: 'Name', accessorKey: 'name', sortable: true },
 *     { key: 'email', header: 'Email', accessorKey: 'email' },
 *   ]}
 *   rowKey="id"
 *   selectable
 *   onSelectionChange={(keys, rows) => setSelected(rows)}
 *   sorting={{ key: 'name', direction: 'asc' }}
 *   onSortChange={(sort) => refetch({ orderBy: sort.key, order: sort.direction })}
 *   pagination={{ current: 1, pageSize: 20, total: 100, onChange: handlePage }}
 *   striped
 *   hoverable
 * />
 * ```
 */
export interface DataTablePatternProps<T> extends PatternBaseProps {
  /**
   * The data array to render. Each item becomes one table row.
   * When empty (and no `emptyState` slot is provided), the table displays a
   * default "no data" message.
   */
  data: T[];

  /**
   * Column definitions that control header labels, cell rendering, widths,
   * alignment, sortability, and pinning for each table column.
   * Order in the array determines visual column order.
   *
   * Declared adaptive layout axis (spec §10): a column with `priority: 'low'`
   * (see `ColumnDef.priority`) is a component-owned CONTAINER-width axis --
   * when this table's `ds-table` named container narrows below the
   * documented collapse width, that column is hidden (not scrolled) on the
   * modern and rustic engines. `priority` is consumer-assigned per column,
   * never a default; classic (antd) does not participate.
   */
  columns: ColumnDef<T>[];

  /**
   * Unique row key accessor used for selection tracking, React reconciliation,
   * and bulk action identification.
   *
   * Can be a property name of T (e.g. `"id"`) or a function that derives a
   * string key from the row. Falls back to the array index when omitted,
   * which is only safe for static, non-selectable tables.
   */
  rowKey?: keyof T | ((row: T) => string);

  // ---------------------------------------------------------------------------
  // Slots
  // ---------------------------------------------------------------------------

  /**
   * Toolbar slot rendered above the table. Typically contains search inputs,
   * filter toggles, and primary action buttons (e.g. "Add new").
   */
  toolbar?: ReactNode;

  /**
   * Row-level actions column renderer. The returned ReactNode is placed in a
   * trailing "Actions" column for each row.
   *
   * @param row   - The data object for this row.
   * @param index - Zero-based row index within `data`.
   */
  actions?: (row: T, index: number) => ReactNode;

  /**
   * Optional width override for the trailing actions column.
   * Useful when a workspace intentionally exposes only one or two compact
   * icon actions and wants to reclaim horizontal space.
   */
  actionsColumnWidth?: number | string;

  /**
   * Bulk action definitions shown when one or more rows are selected.
   * Each action receives the full array of selected row objects when executed.
   */
  bulkActions?: BulkAction<T>[];

  /**
   * Custom empty state element rendered when `data` is an empty array.
   * Overrides the default "No data" placeholder.
   */
  emptyState?: ReactNode;

  /**
   * Custom row renderer that wraps (or replaces) the default row output.
   * Useful for adding row-level styling, animations, or wrapper elements.
   *
   * @param row           - The data object for this row.
   * @param defaultRender - The default rendered row ReactNode.
   * @param index         - Zero-based row index.
   */
  renderRow?: (row: T, defaultRender: ReactNode, index: number) => ReactNode;

  /**
   * Expanded row content renderer. When provided, rows become expandable and
   * clicking the expand toggle reveals this content below the row.
   *
   * @param row - The data object for the expanded row.
   */
  expandedRow?: (row: T) => ReactNode;

  /** Header slot rendered above the toolbar, typically for a page title or breadcrumbs. */
  header?: ReactNode;

  /** Footer slot rendered below the table, typically for summary rows or aggregation info. */
  footer?: ReactNode;

  // ---------------------------------------------------------------------------
  // Selection
  // ---------------------------------------------------------------------------

  /**
   * Enables row selection checkboxes. When true, a leading checkbox column is
   * added and the header gains a "select all" toggle.
   * @default false
   */
  selectable?: boolean;

  /**
   * Controlled list of selected row keys. Must correspond to values produced
   * by the `rowKey` accessor. Pass this to make selection fully controlled.
   */
  selectedKeys?: string[];

  /**
   * Called when the selection changes (row checkbox toggled or "select all").
   *
   * @param selectedKeys - Updated array of selected key strings.
   * @param selectedRows - The full row objects that are currently selected.
   */
  onSelectionChange?: (selectedKeys: string[], selectedRows: T[]) => void;

  // ---------------------------------------------------------------------------
  // Interaction
  // ---------------------------------------------------------------------------

  /**
   * Row click handler. Fires on single click/tap on any cell except the
   * actions column and selection checkbox.
   */
  onRowClick?: (row: T, index: number) => void;

  /** Row double-click handler. Typically used to open a detail view or inline editing. */
  onRowDoubleClick?: (row: T, index: number) => void;

  // ---------------------------------------------------------------------------
  // Sorting
  // ---------------------------------------------------------------------------

  /**
   * Current sort configuration. Pass `null` to indicate no active sort.
   * The table displays a sort indicator on the matching column header but does
   * NOT sort the data itself -- the parent is responsible for providing
   * pre-sorted `data`.
   */
  sorting?: SortConfig | null;

  /**
   * Called when a sortable column header is clicked. The parent should update
   * `sorting` and re-fetch or re-sort `data` accordingly.
   */
  onSortChange?: (sort: SortConfig) => void;

  // ---------------------------------------------------------------------------
  // Filtering
  // ---------------------------------------------------------------------------

  /**
   * Filter definitions that drive the filter panel UI. Each entry creates one
   * filter control (text input, select dropdown, date picker, etc.).
   */
  filters?: FilterDef[];

  /**
   * Current active filter values keyed by `FilterDef.key`. The table does NOT
   * filter data internally -- pass already-filtered `data` from the parent.
   */
  filterValues?: Record<string, unknown>;

  /**
   * Called when any filter value changes. The parent should update
   * `filterValues` and re-fetch or re-filter `data`.
   */
  onFilterChange?: (filters: Record<string, unknown>) => void;

  // ---------------------------------------------------------------------------
  // Pagination
  // ---------------------------------------------------------------------------

  /**
   * Pagination configuration. Pass `false` to disable pagination entirely
   * (renders all rows). When provided, a pagination bar appears below the table.
   * The parent owns page state and must update `data` when the page changes.
   */
  pagination?: PaginationConfig | false;

  // ---------------------------------------------------------------------------
  // Responsive
  // ---------------------------------------------------------------------------

  /**
   * Card renderer for the mobile breakpoint. When the viewport width is below
   * `mobileBreakpoint`, the table switches from a traditional row layout to a
   * card-based layout using this renderer.
   *
   * @param row     - The data object for this card.
   * @param index   - Zero-based index in `data`.
   * @param context - Canonical selection, open, and row-action behavior.
   */
  mobileCard?: (
    row: T,
    index: number,
    context: DataTableMobileCardContext<T>,
  ) => ReactNode;

  /**
   * Viewport width (in pixels) at which the table switches to mobile card
   * layout. Only effective when `mobileCard` is provided.
   * @default 768
   */
  mobileBreakpoint?: number;

  // ---------------------------------------------------------------------------
  // Visual
  // ---------------------------------------------------------------------------

  /**
   * Alternates row background colors for improved readability.
   * @default false
   */
  striped?: boolean;

  /**
   * Adds visible borders around each cell.
   * @default false
   */
  bordered?: boolean;

  /**
   * Reduces row padding for higher information density.
   * @default false
   */
  compact?: boolean;

  /**
   * Keeps the header row fixed at the top while the table body scrolls.
   * Works best when `maxHeight` is also set.
   * @default false
   */
  stickyHeader?: boolean;

  /**
   * Maximum height of the table body. When content exceeds this value, a
   * vertical scrollbar appears. Accepts a CSS value (e.g. `400`, `"60vh"`).
   */
  maxHeight?: number | string;

  /**
   * Highlights the row under the cursor on hover.
   * @default false
   */
  hoverable?: boolean;

  /**
   * Custom CSS color for the zebra stripe. Only takes effect when `striped`
   * is true. Should reference a design-system CSS variable for theme
   * compatibility (e.g. `"var(--ds-color-surface-secondary)"`).
   */
  zebraColor?: string;

  // ---------------------------------------------------------------------------
  // Column Visibility
  // ---------------------------------------------------------------------------

  /**
   * Enables column visibility management. When true, the table respects
   * `visibleColumns` to show/hide columns dynamically.
   * @default false
   */
  columnVisibility?: boolean;

  /**
   * Array of column keys that should be visible. Only effective when
   * `columnVisibility` is true. Columns not in this array are hidden.
   * When omitted, all columns are visible.
   */
  visibleColumns?: string[];

  /**
   * Called when the visible columns set changes (e.g., from an external
   * column settings panel).
   */
  onVisibleColumnsChange?: (keys: string[]) => void;

  /**
   * Column keys that cannot be hidden by the user. These columns are
   * always visible regardless of `visibleColumns`.
   */
  lockedColumns?: string[];

  // ---------------------------------------------------------------------------
  // Column Resizing
  // ---------------------------------------------------------------------------

  /**
   * Enables column resizing via drag handles on column borders.
   * @default false
   */
  resizable?: boolean;

  /**
   * Controlled column widths keyed by column key. Takes precedence over
   * the column definition's `width` property.
   */
  columnWidths?: Record<string, number>;

  /**
   * Called when a column is resized by dragging.
   */
  onColumnResize?: (key: string, width: number) => void;

  // ---------------------------------------------------------------------------
  // Column Reordering
  // ---------------------------------------------------------------------------

  /**
   * Enables column reordering via drag & drop on column headers.
   * @default false
   */
  reorderable?: boolean;

  /**
   * Controlled column order as an array of column keys. Columns are
   * rendered in this order. Missing keys are appended at the end.
   */
  columnOrder?: string[];

  /**
   * Called when columns are reordered via drag & drop.
   */
  onColumnReorder?: (order: string[]) => void;

  // ---------------------------------------------------------------------------
  // Column Pinning
  // ---------------------------------------------------------------------------

  /**
   * Controlled pinned columns configuration. Overrides the `pin` property
   * on individual column definitions.
   */
  pinnedColumns?: { left: string[]; right: string[] };

  /**
   * Called when a column's pin state changes.
   */
  onPinChange?: (pinned: { left: string[]; right: string[] }) => void;

  // ---------------------------------------------------------------------------
  // Density
  // ---------------------------------------------------------------------------

  /**
   * Row density mode controlling cell padding and font size.
   *
   * The two canonical modes resolve token-backed presets from the shared
   * density spec (design-language §3): `comfortable` → `0.875rem 1rem` cells,
   * `compact` → `0.5rem 0.75rem` cells. `PatternDataTable` emits
   * `--ds-density-cell-padding` per mode (with a literal fallback) so the
   * engines and any app CSS resolve cell padding from the token cascade —
   * route-grade listings render `comfortable`, embedded / beside-chat render
   * `compact`.
   *
   * - `compact`: Dense cell padding (`0.5rem 0.75rem`), smaller text
   * - `comfortable`: Balanced cell padding (`0.875rem 1rem`) — the default
   * - `spacious`: Legacy extra-padding mode retained for back-compat (larger
   *   touch targets); not part of the canonical two-mode density set
   * @default 'comfortable'
   */
  density?: 'compact' | 'comfortable' | 'spacious';

  // ---------------------------------------------------------------------------
  // Row Grouping
  // ---------------------------------------------------------------------------

  /**
   * Column key to group rows by. Rows with the same value in this column are
   * collected under a collapsible group header. When omitted, no grouping is
   * applied and all rows render flat.
   */
  groupBy?: string;

  /**
   * Aggregation functions for group header display, keyed by column key.
   * Built-in strategies: `'count'`, `'sum'`, `'average'`, `'min'`, `'max'`.
   * Pass a custom function `(items: T[]) => ReactNode` for full control.
   *
   * @example
   * ```tsx
   * aggregations={{ salary: 'average', id: 'count' }}
   * ```
   */
  aggregations?: Record<string, AggregationFn<T>>;

  /**
   * Whether group sections are expanded when the table first renders.
   * @default true
   */
  defaultGroupExpanded?: boolean;

  /**
   * Custom group header renderer. When provided, replaces the default group
   * header row content entirely. The default header shows the group value,
   * item count, aggregate summaries, and an expand/collapse chevron.
   *
   * @param groupValue - The value shared by all rows in the group.
   * @param items      - The data rows belonging to this group.
   * @param isExpanded - Whether the group is currently expanded.
   */
  renderGroupHeader?: (
    groupValue: string,
    items: T[],
    isExpanded: boolean,
  ) => ReactNode;

  // ---------------------------------------------------------------------------
  // Inline Cell Editing
  // ---------------------------------------------------------------------------

  /**
   * Called when a cell value is saved via inline editing.
   * Receives the full row, the column key, and both old and new values.
   * Supports async operations (e.g., server mutations).
   */
  onCellEdit?: (row: T, columnKey: string, newValue: unknown, oldValue: unknown) => void | Promise<void>;

  /**
   * Called when inline editing starts on a cell.
   */
  onCellEditStart?: (row: T, columnKey: string) => void;

  /**
   * Called when inline editing is cancelled on a cell.
   */
  onCellEditCancel?: (row: T, columnKey: string) => void;

  /**
   * Controlled editing cell state. When provided, the table uses this to
   * determine which cell is in edit mode. Set to `null` to exit edit mode.
   * When omitted, the table manages edit state internally.
   */
  editingCell?: { rowKey: string; columnKey: string } | null;

  /**
   * How the user triggers cell editing.
   * - `'doubleClick'` (default): double-click a cell to enter edit mode
   * - `'click'`: single click enters edit mode
   * @default 'doubleClick'
   */
  editTrigger?: 'click' | 'doubleClick';

  /**
   * Enable Tab key navigation between editable cells in the same row.
   * When the user presses Tab in an active editor, focus moves to the next
   * editable cell. Shift+Tab moves to the previous editable cell.
   * @default true
   */
  tabNavigation?: boolean;

  // ---------------------------------------------------------------------------
  // Virtual Scrolling
  // ---------------------------------------------------------------------------

  /**
   * Enable virtual scrolling for large datasets. When true, only the visible
   * rows (plus an overscan buffer) are rendered to the DOM. Requires `maxHeight`
   * to be set so the container has a fixed scrollable height.
   *
   * Uses fixed row heights only (no variable-height rows) for zero-dependency,
   * lightweight performance.
   * @default false
   */
  virtualized?: boolean;

  /**
   * Fixed row height in pixels used for virtual scroll calculations.
   * Only effective when `virtualized` is true.
   * @default 48
   */
  virtualRowHeight?: number;
}
