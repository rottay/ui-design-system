/**
 * Table Types
 */
import type { ReactNode, CSSProperties, Key } from 'react';
import type { SizeType } from '../../../../../types/common';

export type TableSize = SizeType;
export type TableLayout = 'auto' | 'fixed';
export type TableScrollBehavior = 'smooth' | 'auto';
export type SortOrder = 'ascend' | 'descend' | null;
export type FilterMode = 'menu' | 'tree';

export interface ColumnType<T = unknown> {
  /** Column key */
  key?: Key;
  /** Column title */
  title?: ReactNode;
  /** Data index (field name) */
  dataIndex?: string | string[];
  /** Width of column */
  width?: number | string;
  /** Min width of column */
  minWidth?: number;
  /** Alignment */
  align?: 'left' | 'center' | 'right';
  /** Fixed column */
  fixed?: 'left' | 'right' | boolean;
  /** Whether column is sortable */
  sorter?: boolean | ((a: T, b: T) => number);
  /** Default sort order */
  defaultSortOrder?: SortOrder;
  /** Sort directions */
  sortDirections?: SortOrder[];
  /** Whether to show sorter tooltip */
  showSorterTooltip?: boolean | { title?: ReactNode };
  /** Filters */
  filters?: Array<{ text: ReactNode; value: string | number | boolean; children?: ColumnType<T>['filters'] }>;
  /** Filter mode */
  filterMode?: FilterMode;
  /** Filter search */
  filterSearch?: boolean;
  /** Filter multiple */
  filterMultiple?: boolean;
  /** Default filtered value */
  defaultFilteredValue?: string[];
  /** Column class name */
  className?: string;
  /** Column style */
  style?: CSSProperties;
  /** Whether column is hidden */
  hidden?: boolean;
  /** Render function */
  render?: (value: unknown, record: T, index: number) => ReactNode;
  /** Column group children */
  children?: ColumnType<T>[];
  /** Cell attributes */
  onCell?: (record: T, index?: number) => object;
  /** Header cell attributes */
  onHeaderCell?: (column: ColumnType<T>) => object;
  /** Ellipsis */
  ellipsis?: boolean | { showTitle?: boolean };
  /** Responsive breakpoints */
  responsive?: ('xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl')[];
  /** Column tooltip */
  tooltip?: string;
}

export interface TablePaginationConfig {
  /** Current page */
  current?: number;
  /** Page size */
  pageSize?: number;
  /** Total count */
  total?: number;
  /** Show size changer */
  showSizeChanger?: boolean;
  /** Show quick jumper */
  showQuickJumper?: boolean;
  /** Show total */
  showTotal?: (total: number, range: [number, number]) => ReactNode;
  /** Page size options */
  pageSizeOptions?: (string | number)[];
  /** Position */
  position?: ('topLeft' | 'topCenter' | 'topRight' | 'bottomLeft' | 'bottomCenter' | 'bottomRight')[];
  /** Hide on single page */
  hideOnSinglePage?: boolean;
  /** Disabled */
  disabled?: boolean;
  /** Simple mode */
  simple?: boolean;
  /** Size */
  size?: 'default' | 'small';
  /** Responsive */
  responsive?: boolean;
  /** On change */
  onChange?: (page: number, pageSize: number) => void;
}

export interface TableRowSelection<T = unknown> {
  /** Selected row keys */
  selectedRowKeys?: Key[];
  /** Default selected row keys */
  defaultSelectedRowKeys?: Key[];
  /** Selection type */
  type?: 'checkbox' | 'radio';
  /** On change */
  onChange?: (selectedRowKeys: Key[], selectedRows: T[], info: { type: 'all' | 'none' | 'invert' | 'single' | 'multiple' }) => void;
  /** On select */
  onSelect?: (record: T, selected: boolean, selectedRows: T[], nativeEvent: Event) => void;
  /** On select all */
  onSelectAll?: (selected: boolean, selectedRows: T[], changeRows: T[]) => void;
  /** Get checkbox props */
  getCheckboxProps?: (record: T) => { disabled?: boolean; name?: string };
  /** Fixed */
  fixed?: 'left' | 'right' | boolean;
  /** Column width */
  columnWidth?: number | string;
  /** Column title */
  columnTitle?: ReactNode | ((originalNode: ReactNode) => ReactNode);
  /** Hide select all */
  hideSelectAll?: boolean;
  /** Preserve selected row keys */
  preserveSelectedRowKeys?: boolean;
  /** Render cell */
  renderCell?: (value: boolean, record: T, index: number, originNode: ReactNode) => ReactNode;
  /** Selections */
  selections?: boolean | object[];
}

export interface ExpandableConfig<T = unknown> {
  /** Expandable row keys */
  expandedRowKeys?: Key[];
  /** Default expanded row keys */
  defaultExpandedRowKeys?: Key[];
  /** Expand all rows */
  defaultExpandAllRows?: boolean;
  /** Expanded row render */
  expandedRowRender?: (record: T, index: number, indent: number, expanded: boolean) => ReactNode;
  /** Row expandable */
  rowExpandable?: (record: T) => boolean;
  /** On expand */
  onExpand?: (expanded: boolean, record: T) => void;
  /** On expanded rows change */
  onExpandedRowsChange?: (expandedKeys: Key[]) => void;
  /** Column width */
  columnWidth?: number | string;
  /** Column title */
  columnTitle?: ReactNode;
  /** Expand icon */
  expandIcon?: (props: { expanded: boolean; onExpand: (record: T, e: React.MouseEvent) => void; record: T }) => ReactNode;
  /** Fixed */
  fixed?: 'left' | 'right' | boolean;
  /** Indent size */
  indentSize?: number;
  /** Expand row by click */
  expandRowByClick?: boolean;
  /** Show expand column */
  showExpandColumn?: boolean;
}

export interface TableProps<T = unknown> {
  /** Data source */
  dataSource?: T[];
  /** Columns */
  columns?: ColumnType<T>[];
  /** Row key */
  rowKey?: string | ((record: T) => Key);
  /** Loading state */
  loading?: boolean | { spinning?: boolean; delay?: number };
  /** Size */
  size?: TableSize;
  /** Bordered */
  bordered?: boolean;
  /** Pagination */
  pagination?: false | TablePaginationConfig;
  /** Row selection */
  rowSelection?: TableRowSelection<T>;
  /** Expandable config */
  expandable?: ExpandableConfig<T>;
  /** Scroll config */
  scroll?: { x?: number | string | true; y?: number | string; scrollToFirstRowOnChange?: boolean };
  /** Table layout */
  tableLayout?: TableLayout;
  /** Show header */
  showHeader?: boolean;
  /** Title */
  title?: (currentPageData: T[]) => ReactNode;
  /** Footer */
  footer?: (currentPageData: T[]) => ReactNode;
  /** Empty text */
  locale?: { emptyText?: ReactNode; filterConfirm?: ReactNode; filterReset?: ReactNode };
  /** Row class name */
  rowClassName?: string | ((record: T, index: number) => string);
  /** Row hover */
  rowHoverable?: boolean;
  /** On row */
  onRow?: (record: T, index?: number) => object;
  /** On header row */
  onHeaderRow?: (columns: ColumnType<T>[], index?: number) => object;
  /** On change */
  onChange?: (pagination: TablePaginationConfig, filters: Record<string, (Key | boolean)[] | null>, sorter: { column?: ColumnType<T>; order?: SortOrder; field?: string | string[]; columnKey?: Key } | Array<{ column?: ColumnType<T>; order?: SortOrder; field?: string | string[]; columnKey?: Key }>, extra: { currentDataSource: T[]; action: 'paginate' | 'sort' | 'filter' }) => void;
  /** Summary */
  summary?: (currentData: T[]) => ReactNode;
  /** Sticky header */
  sticky?: boolean | { offsetHeader?: number; offsetScroll?: number; getContainer?: () => HTMLElement };
  /** Virtual scroll */
  virtual?: boolean;
  /** Show sorter tooltip */
  showSorterTooltip?: boolean | { title?: ReactNode };
  /** Sort directions */
  sortDirections?: SortOrder[];
  /** Get popup container */
  getPopupContainer?: (triggerNode: HTMLElement) => HTMLElement;
  /** Additional class name */
  className?: string;
  /** Additional styles */
  style?: CSSProperties;
  /** ID */
  id?: string;
}

export const TABLE_DEFAULTS: Partial<TableProps> = {
  size: 'default',
  bordered: false,
  showHeader: true,
  rowHoverable: true,
  tableLayout: 'auto',
};
