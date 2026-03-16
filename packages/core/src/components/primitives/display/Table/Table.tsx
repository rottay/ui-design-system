'use client';

/**
 * @fileoverview Table - Data table with sorting, filtering, pagination, and selection.
 * Supports row selection (checkbox/radio), expandable rows, virtual scrolling,
 * fixed columns, and custom cell renderers. No compound sub-components.
 *
 * @example
 * ```tsx
 * import { Table } from '@rottay/design-system';
 *
 * const columns = [
 *   { title: 'Name', dataIndex: 'name', sorter: true },
 *   { title: 'Email', dataIndex: 'email' },
 * ];
 *
 * <Table dataSource={users} columns={columns} rowKey="id" pagination={{ pageSize: 10 }} />
 * ```
 *
 * @module Table
 * @category Display
 */

import React from 'react';
import { createEngineComponent } from '../../../../engines/factory';
import type { TableProps } from './Table.types';

export type {
  TableProps,
  ColumnType,
  TablePaginationConfig,
  TableRowSelection,
  ExpandableConfig,
  TableSize,
  TableLayout,
  SortOrder,
  FilterMode,
  TableCellFieldType,
  EditingCell,
} from './Table.types';

export { TABLE_DEFAULTS } from './Table.types';

/**
 * Engine-aware Table.
 *
 * The cast to `ComponentType<TableProps>` bridges the dynamic import boundary
 * because `createEngineComponent` works with non-generic signatures internally.
 * Generic type safety is preserved at the public prop level for consumers.
 */
export const Table = createEngineComponent<TableProps>('Table', {
  classic: () => import('./engines/classic') as Promise<{ default: React.ComponentType<TableProps> }>,
  modern: () => import('./engines/modern') as Promise<{ default: React.ComponentType<TableProps> }>,
  rustic: () => import('./engines/rustic') as Promise<{ default: React.ComponentType<TableProps> }>,
});
