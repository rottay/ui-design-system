/**
 * DataTable - Core Interface
 * Table component for displaying data with various features
 */

import type { ReactNode } from 'react';
import type { EngineAwareProps } from '../../../../types';

export type DataTablePreset = 'simple' | 'searchable' | 'selectable' | 'full';

export interface DataTableColumn<T = unknown> {
  key: string;
  title: ReactNode;
  dataIndex?: keyof T | string;
  width?: number | string;
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;
  render?: (value: unknown, record: T, index: number) => ReactNode;
}

export interface DataTableProps<T = Record<string, unknown>> extends EngineAwareProps {
  /** Preset to use */
  preset?: DataTablePreset;
  /** Column definitions */
  columns: DataTableColumn<T>[];
  /** Data source */
  data: T[];
  /** Row key field */
  rowKey?: keyof T | ((record: T) => string);
  /** Loading state */
  loading?: boolean;
  /** Enable search */
  searchable?: boolean;
  /** Search placeholder */
  searchPlaceholder?: string;
  /** Search handler */
  onSearch?: (query: string) => void;
  /** Enable row selection */
  selectable?: boolean;
  /** Selected row keys */
  selectedRowKeys?: string[];
  /** Selection change handler */
  onSelectionChange?: (keys: string[], records: T[]) => void;
  /** Enable sorting */
  sortable?: boolean;
  /** Current sort state */
  sortState?: { key: string; direction: 'asc' | 'desc' } | null;
  /** Sort change handler */
  onSortChange?: (key: string, direction: 'asc' | 'desc') => void;
  /** Enable pagination */
  pagination?: boolean | {
    current: number;
    pageSize: number;
    total: number;
    onChange: (page: number, pageSize: number) => void;
  };
  /** Empty state message */
  emptyText?: ReactNode;
  /** Row click handler */
  onRowClick?: (record: T, index: number) => void;
  /** Striped rows */
  striped?: boolean;
  /** Bordered */
  bordered?: boolean;
  /** Compact size */
  compact?: boolean;
}

export const DATA_TABLE_DEFAULTS: Partial<DataTableProps> = {
  preset: 'simple',
  searchPlaceholder: 'Search...',
  emptyText: 'No data',
  striped: false,
  bordered: false,
  compact: false,
};
