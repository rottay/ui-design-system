'use client';

/**
 * DataTable<T> - Pattern Component
 *
 * Generic, engine-aware data table with composable slots.
 * Supports toolbar, actions, bulk actions, row expansion,
 * pagination, sorting, filtering, and mobile card view.
 */

import { createEngineComponent } from '../../../core/engines/factory';
import type { DataTablePatternProps } from './types';

export type { DataTablePatternProps } from './types';
export { resolveAccessor, resolveRowKey } from './types';
export type {
  ColumnDef,
  SortConfig,
  FilterDef,
  PaginationConfig,
  BulkAction,
} from '../types';

export const PatternDataTable = createEngineComponent<DataTablePatternProps<any>>(
  'PatternDataTable',
  {
    classic: () => import('./engines/classic'),
    modern: () => import('./engines/modern'),
    rustic: () => import('./engines/rustic'),
  }
);
