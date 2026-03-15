/**
 * DataTable<T> - Pattern Component Types
 *
 * Generic, composable data table with slots for toolbar, actions,
 * bulk actions, row expansion, and mobile card view.
 */

import type { ReactNode } from 'react';
import type {
  PatternBaseProps,
  ColumnDef,
  SortConfig,
  FilterDef,
  PaginationConfig,
  BulkAction,
} from '../types';

export interface DataTablePatternProps<T> extends PatternBaseProps {
  /** Data source */
  data: T[];
  /** Column definitions */
  columns: ColumnDef<T>[];
  /** Unique row key accessor */
  rowKey?: keyof T | ((row: T) => string);

  // --- Slots ---
  /** Toolbar slot (search, filters, add button, etc.) */
  toolbar?: ReactNode;
  /** Row actions column renderer */
  actions?: (row: T, index: number) => ReactNode;
  /** Bulk action definitions */
  bulkActions?: BulkAction<T>[];
  /** Custom empty state */
  emptyState?: ReactNode;
  /** Custom row renderer wrapping default */
  renderRow?: (row: T, defaultRender: ReactNode, index: number) => ReactNode;
  /** Expanded row content */
  expandedRow?: (row: T) => ReactNode;
  /** Header slot above table */
  header?: ReactNode;
  /** Footer slot below table */
  footer?: ReactNode;

  // --- Selection ---
  /** Enable row selection */
  selectable?: boolean;
  /** Controlled selected items */
  selectedKeys?: string[];
  /** Selection change handler */
  onSelectionChange?: (selectedKeys: string[], selectedRows: T[]) => void;

  // --- Interaction ---
  /** Row click handler */
  onRowClick?: (row: T, index: number) => void;
  /** Row double-click handler */
  onRowDoubleClick?: (row: T, index: number) => void;

  // --- Sorting ---
  /** Sort configuration */
  sorting?: SortConfig | null;
  /** Sort change handler */
  onSortChange?: (sort: SortConfig) => void;

  // --- Filtering ---
  /** Filter definitions for filter panel */
  filters?: FilterDef[];
  /** Active filter values */
  filterValues?: Record<string, unknown>;
  /** Filter change handler */
  onFilterChange?: (filters: Record<string, unknown>) => void;

  // --- Pagination ---
  /** Pagination config (false to disable) */
  pagination?: PaginationConfig | false;

  // --- Responsive ---
  /** Card renderer for mobile breakpoint */
  mobileCard?: (row: T, index: number) => ReactNode;
  /** Breakpoint for mobile switch */
  mobileBreakpoint?: number;

  // --- Visual ---
  /** Striped rows */
  striped?: boolean;
  /** Bordered cells */
  bordered?: boolean;
  /** Compact density */
  compact?: boolean;
  /** Sticky header */
  stickyHeader?: boolean;
  /** Max height for scroll */
  maxHeight?: number | string;
  /** Row hover highlight */
  hoverable?: boolean;
  /** Zebra stripe color */
  zebraColor?: string;
}

/** Resolved accessor for a column */
export function resolveAccessor<T>(column: ColumnDef<T>, row: T): unknown {
  if (column.accessorFn) return column.accessorFn(row);
  if (column.accessorKey) return (row as Record<string, unknown>)[column.accessorKey];
  return (row as Record<string, unknown>)[column.key];
}

/** Resolve row key */
export function resolveRowKey<T>(row: T, rowKey: DataTablePatternProps<T>['rowKey'], index: number): string {
  if (!rowKey) return String(index);
  if (typeof rowKey === 'function') return rowKey(row);
  return String((row as Record<string, unknown>)[rowKey as string]);
}
