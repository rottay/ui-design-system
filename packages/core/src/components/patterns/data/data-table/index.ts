'use client';

/**
 * @fileoverview DataTable pattern - Rottay Design System
 * @description Generic, engine-aware data table with composable slots for
 * toolbars, bulk actions, mobile cards, and row expansion.
 *
 * @remarks
 * This pattern sits above the primitive table: it packages product-facing
 * mechanics such as toolbars and bulk actions while keeping the row/cell
 * rendering API reusable across domains.
 */

export type {
  DataTablePatternProps,
  DataTableMobileCardContext,
  DataTableMobileCardInteractionEvent,
  AggregationFn,
} from './DataTable.types';
export { resolveAccessor, resolveRowKey } from './DataTable.types';
export type {
  ColumnDef,
  ColumnResponsiveConfig,
  ResponsiveColumnMode,
  SortConfig,
  FilterDef,
  PaginationConfig,
  BulkAction,
  EditableConfig,
} from '../../foundation/types';
export { PatternDataTable } from './PatternDataTable';
export { useVirtualScroll } from './useVirtualScroll';
export type { UseVirtualScrollOptions, UseVirtualScrollReturn } from './useVirtualScroll';
export { useGroupedData } from './useGroupedData';
export type { GroupedSection } from './useGroupedData';
