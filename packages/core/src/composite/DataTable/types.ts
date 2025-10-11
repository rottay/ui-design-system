import type { TableProps } from 'antd';
import type { ReactNode } from 'react';

export interface DataTableColumn<T = any> {
  key: string;
  title: string;
  dataIndex?: string;
  render?: (value: any, record: T, index: number) => ReactNode;
  sorter?: boolean | ((a: T, b: T) => number);
  width?: number | string;
  align?: 'left' | 'center' | 'right';
}

export interface DataTableProps<T = any> extends Omit<TableProps<T>, 'columns'> {
  /** Table columns */
  columns: DataTableColumn<T>[];

  /** Table data */
  data: T[];

  /** Show search input */
  showSearch?: boolean;

  /** Search placeholder */
  searchPlaceholder?: string;

  /** Callback when search changes */
  onSearch?: (value: string) => void;

  /** Show export button */
  showExport?: boolean;

  /** Export button text */
  exportButtonText?: string;

  /** Callback when export is clicked */
  onExport?: () => void;

  /** Show row selection */
  showSelection?: boolean;

  /** Callback when selection changes */
  onSelectionChange?: (selectedRowKeys: React.Key[], selectedRows: T[]) => void;

  /** Loading state */
  loading?: boolean;
}
