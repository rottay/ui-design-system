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

import { createEngineComponent } from '../../../engines/factory';
import type { DataTablePatternProps } from './DataTable.types';

export type { DataTablePatternProps } from './DataTable.types';
export { resolveAccessor, resolveRowKey } from './DataTable.types';
export type {
  ColumnDef,
  SortConfig,
  FilterDef,
  PaginationConfig,
  BulkAction,
} from '../types';

/** Public data-table pattern entry point resolved through the engine factory. */
export const PatternDataTable = createEngineComponent<DataTablePatternProps<any>>(
  'PatternDataTable',
  {
    classic: () => import('./engines/classic'),
    modern: () => import('./engines/modern'),
    rustic: () => import('./engines/rustic'),
  }
);
