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
  /** Allow hiding this column */
  hideable?: boolean;
  /** Default visibility */
  defaultVisible?: boolean;
}

export type DensitySize = 'compact' | 'default' | 'comfortable';

export interface BulkAction<T = any> {
  key: string;
  label: string;
  icon?: ReactNode;
  onClick: (selectedRowKeys: React.Key[], selectedRows: T[]) => void;
  danger?: boolean;
  disabled?: (selectedRowKeys: React.Key[], selectedRows: T[]) => boolean;
}

export interface DataTableState {
  /** Hidden column keys */
  hiddenColumns: string[];
  /** Density mode */
  density: DensitySize;
  /** Page size */
  pageSize: number;
  /** Current page */
  currentPage: number;
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

  // ========== NEW FEATURES ==========

  /** Enable CSV export */
  enableCSVExport?: boolean;

  /** Enable Excel export */
  enableExcelExport?: boolean;

  /** Filename for exports (without extension) */
  exportFilename?: string;

  /** Show/hide columns control */
  showColumnToggle?: boolean;

  /** Bulk actions for selected rows */
  bulkActions?: BulkAction<T>[];

  /** Expandable row render function */
  expandable?: {
    expandedRowRender: (record: T) => ReactNode;
    rowExpandable?: (record: T) => boolean;
  };

  /** Enable density mode toggle (compact/default/comfortable) */
  showDensityToggle?: boolean;

  /** Default density */
  defaultDensity?: DensitySize;

  /** Enable sticky header */
  stickyHeader?: boolean;

  /** Sticky header offset from top */
  stickyOffset?: number;

  /** Save table state to localStorage */
  saveState?: boolean;

  /** Unique key for saving state (required if saveState is true) */
  stateKey?: string;

  /** Show refresh button */
  showRefresh?: boolean;

  /** Callback when refresh is clicked */
  onRefresh?: () => void;

  /** Enable responsive mode (cards on mobile) */
  responsive?: boolean;

  /** Breakpoint for responsive mode (default: 768px) */
  responsiveBreakpoint?: number;

  /** Render function for responsive card */
  renderCard?: (record: T, index: number) => ReactNode;
}
