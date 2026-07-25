"use client";

/**
 * @fileoverview DataTable pattern - Rottay Design System
 * @description Generic, engine-aware data table with composable slots for
 * toolbars, bulk actions, mobile cards, and row expansion.
 *
 * @remarks
 * This pattern sits above the primitive table: it packages product-facing
 * mechanics such as toolbars and bulk actions while keeping the row/cell
 * rendering API reusable across domains. See `OWNERSHIP.md`: applications use
 * this component for operational collections and reserve the primitive
 * `Table` for embedded tabular documents.
 */

export type {
  DataTablePatternProps,
  DataTableMobileCardContext,
  DataTableMobileCardInteractionEvent,
  AggregationFn,
  DataTableMessages,
  DataTableRecipe,
} from "./contracts";
export { resolveAccessor, resolveRowKey } from "./runtime/row-resolution";
export type {
  ColumnDef,
  ColumnResponsiveConfig,
  ResponsiveColumnMode,
  SortConfig,
  FilterDef,
  PaginationConfig,
  BulkAction,
  EditableConfig,
} from "../../../../foundation/contracts/runtime/components/patterns/core";
export { PatternDataTable } from "./presentation/table";
export { useGroupedData } from "./runtime/grouping";
export type { GroupedSection } from "./runtime/grouping";
export { useInlineEditing } from "./runtime/inline-editing";
export type {
  UseInlineEditingOptions,
  UseInlineEditingReturn,
} from "./runtime/inline-editing";
export { useDataTable } from "./runtime/state";
export type { UseDataTableOptions, UseDataTableReturn } from "./runtime/state";
// `useVirtualScroll` physically moved to the shared patterns virtualization
// runtime; this re-export preserves its historical public API from the
// PatternDataTable barrel.
export { useVirtualScroll } from "../../runtime/virtualization/virtual-scroll";
export type {
  UseVirtualScrollOptions,
  UseVirtualScrollReturn,
} from "../../runtime/virtualization/virtual-scroll";
