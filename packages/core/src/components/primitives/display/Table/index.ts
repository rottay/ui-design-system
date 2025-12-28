/**
 * @fileoverview Table - Rottay Design System
 * @description Data table component for displaying tabular data with advanced features.
 * Part of the Rottay Design System's display primitives collection.
 *
 * @remarks
 * **Multi-Engine Architecture:**
 * - **Titan**: Ant Design Table with full feature support
 * - **Hermes**: DaisyUI/Tailwind table with responsive design
 * - **Apollo**: Pure CSS table with maximum accessibility
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
import { createEngineComponent } from '../../../../system/engines/factory';
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
  titan: () => import('./engines/titan') as Promise<{ default: React.ComponentType<TableProps> }>,
  hermes: () => import('./engines/hermes') as Promise<{ default: React.ComponentType<TableProps> }>,
  apollo: () => import('./engines/apollo') as Promise<{ default: React.ComponentType<TableProps> }>,
});
