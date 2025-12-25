import React from 'react';

/**
 * Base props for Table components
 * These props are supported by ALL engines (titan/AntD, hermes/DaisyUI, apollo/HTML+Tailwind)
 */
export interface TableBaseProps<T = any> {
  /** Table data source */
  data?: T[];

  /** Column definitions */
  columns?: TableColumn<T>[];

  /** Additional CSS class name */
  className?: string;

  /** Loading state */
  loading?: boolean;

  /** Row key field name or function to extract unique key */
  rowKey?: string | ((record: T, index: number) => string | number);
}

/**
 * Extended props for Table components
 * Includes engine-specific props that may not be supported by all implementations
 */
export interface TableProps<T = any> extends TableBaseProps<T> {
  /** Whether the table has borders */
  bordered?: boolean;

  /** Whether the table is striped (zebra pattern) */
  striped?: boolean;

  /** Whether to show table header */
  showHeader?: boolean;

  /** Size variant */
  size?: 'small' | 'medium' | 'large';

  /** Pagination configuration */
  pagination?: TablePaginationConfig | false;

  /** Row selection configuration */
  rowSelection?: TableRowSelection<T>;

  /** Callback when row is clicked */
  onRowClick?: (record: T, index: number) => void;

  /** Custom row class name */
  rowClassName?: string | ((record: T, index: number) => string);

  /** Whether rows are hoverable */
  hoverable?: boolean;

  /** Whether the table has sticky header */
  stickyHeader?: boolean;

  /** Scroll configuration */
  scroll?: {
    x?: string | number | true;
    y?: string | number;
  };

  /** Empty state content when no data */
  emptyText?: React.ReactNode;

  /** Table caption */
  caption?: React.ReactNode;

  /** Whether the table is in a compact layout */
  compact?: boolean;

  /** Custom table layout algorithm */
  tableLayout?: 'auto' | 'fixed';

  /** Callback when table state changes (sort, filter, pagination) */
  onChange?: (
    pagination: TablePaginationConfig,
    filters: Record<string, any>,
    sorter: TableSorterInfo<T>
  ) => void;
}

/**
 * Column definition for table
 */
export interface TableColumn<T = any> {
  /** Column title */
  title?: React.ReactNode;

  /** Data field key */
  key?: string;

  /** Data field path (supports nested: 'user.name') */
  dataIndex?: string | string[];

  /** Custom render function */
  render?: (value: any, record: T, index: number) => React.ReactNode;

  /** Column width (CSS value or number in px) */
  width?: string | number;

  /** Column alignment */
  align?: 'left' | 'center' | 'right';

  /** Whether the column is sortable */
  sortable?: boolean;

  /** Custom sort function */
  sorter?: boolean | ((a: T, b: T) => number);

  /** Default sort order */
  defaultSortOrder?: 'ascend' | 'descend';

  /** Whether the column is filterable */
  filterable?: boolean;

  /** Filter options */
  filters?: TableFilter[];

  /** Callback when filter is changed */
  onFilter?: (value: any, record: T) => boolean;

  /** Whether the column is fixed */
  fixed?: 'left' | 'right';

  /** Whether the column is hidden */
  hidden?: boolean;

  /** Ellipsis configuration */
  ellipsis?: boolean | { showTitle?: boolean };

  /** Additional CSS class for column */
  className?: string;

  /** Additional CSS class for column header */
  headerClassName?: string;

  /** Custom header render */
  renderHeader?: () => React.ReactNode;

  /** Whether to allow column resizing (engine-specific) */
  resizable?: boolean;
}

/**
 * Filter option for table column
 */
export interface TableFilter {
  /** Filter label */
  label: React.ReactNode;

  /** Filter value */
  value: any;
}

/**
 * Pagination configuration for table
 */
export interface TablePaginationConfig {
  /** Current page number (1-indexed) */
  current?: number;

  /** Number of items per page */
  pageSize?: number;

  /** Total number of items */
  total?: number;

  /** Callback when page changes */
  onChange?: (page: number, pageSize: number) => void;

  /** Available page size options */
  pageSizeOptions?: number[];

  /** Whether to show page size selector */
  showSizeChanger?: boolean;

  /** Whether to show total count */
  showTotal?: boolean | ((total: number, range: [number, number]) => React.ReactNode);

  /** Position of pagination */
  position?: 'top' | 'bottom' | 'both';

  /** Whether pagination is disabled */
  disabled?: boolean;

  /** Whether to hide pagination when only one page */
  hideOnSinglePage?: boolean;
}

/**
 * Row selection configuration for table
 */
export interface TableRowSelection<T = any> {
  /** Type of selection */
  type?: 'checkbox' | 'radio';

  /** Selected row keys */
  selectedRowKeys?: (string | number)[];

  /** Callback when selection changes */
  onChange?: (selectedRowKeys: (string | number)[], selectedRows: T[]) => void;

  /** Function to determine if a row is selectable */
  getCheckboxProps?: (record: T) => {
    disabled?: boolean;
    name?: string;
  };

  /** Custom selection column configuration */
  columnWidth?: string | number;

  /** Whether the selection column is fixed */
  fixed?: boolean;

  /** Whether to preserve selection when data changes (engine-specific) */
  preserveSelectedRowKeys?: boolean;
}

/**
 * Sorter information
 */
export interface TableSorterInfo<T = any> {
  /** Column that is being sorted */
  column?: TableColumn<T>;

  /** Sort order */
  order?: 'ascend' | 'descend';

  /** Field being sorted */
  field?: string;

  /** Column key */
  columnKey?: string;
}
