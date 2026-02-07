'use client';

/**
 * @fileoverview Table - Rottay Design System
 * @description Data table component for displaying tabular data with advanced features.
 * Part of the Rottay Design System's display primitives collection.
 *
 * @remarks
 * **Multi-Engine Architecture:**
 * - **Classic**: Ant Design Table with full feature support
 * - **Modern**: DaisyUI/Tailwind table with responsive design
 * - **Rustic**: Pure CSS table with maximum accessibility
 *
 * **Key Features:**
 * - Column sorting (single and multiple)
 * - Row filtering with search
 * - Pagination (client and server-side)
 * - Row selection (checkbox and radio)
 * - Expandable rows
 * - Fixed headers and columns
 * - Custom cell rendering
 * - Virtual scrolling for large datasets
 * - Sticky headers
 * - Column resizing
 *
 * **Data Handling:**
 * - Generic type support for data records
 * - Nested data index support
 * - Custom row keys
 * - Loading states
 * - Empty state customization
 *
 * @example Basic Usage
 * ```tsx
 * import { Table } from '@rottay/design-system';
 *
 * const columns = [
 *   { title: 'Name', dataIndex: 'name', sorter: true },
 *   { title: 'Age', dataIndex: 'age' },
 *   { title: 'Email', dataIndex: 'email' },
 * ];
 *
 * <Table
 *   dataSource={users}
 *   columns={columns}
 *   rowKey="id"
 *   pagination={{ pageSize: 10 }}
 * />
 * ```
 *
 * @example With Row Selection
 * ```tsx
 * <Table
 *   dataSource={data}
 *   columns={columns}
 *   rowSelection={{
 *     type: 'checkbox',
 *     onChange: (keys, rows) => console.log(keys, rows),
 *   }}
 * />
 * ```
 *
 * @example With Expandable Rows
 * ```tsx
 * <Table
 *   dataSource={data}
 *   columns={columns}
 *   expandable={{
 *     expandedRowRender: (record) => <p>{record.description}</p>,
 *     rowExpandable: (record) => record.hasDetails,
 *   }}
 * />
 * ```
 *
 * @see {@link TableProps} for available props
 * @see {@link ColumnType} for column configuration
 * @module Table
 * @category Display
 * @package @rottay/design-system
 */

import React from 'react';
import { createEngineComponent } from '../../../../core/engines/factory';
import type { TableProps } from './types';

// Export types
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
} from './types';

export { TABLE_DEFAULTS } from './types';

// Create engine-aware Table component
// Note: Type assertions needed due to generic Table<T> component signature
export const Table = createEngineComponent<TableProps>('Table', {
  classic: () => import('./engines/classic') as Promise<{ default: React.ComponentType<TableProps> }>,
  modern: () => import('./engines/modern') as Promise<{ default: React.ComponentType<TableProps> }>,
  rustic: () => import('./engines/rustic') as Promise<{ default: React.ComponentType<TableProps> }>,
});
