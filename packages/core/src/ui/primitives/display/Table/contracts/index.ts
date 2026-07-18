/**
 * @fileoverview Table Types - Rottay Design System
 * @description Type definitions for the Table component and its configurations.
 * Part of the Rottay Design System's display primitives collection.
 *
 * @remarks
 * This module provides comprehensive type definitions for the Table component,
 * including column configuration, pagination, row selection, and expandable rows.
 *
 * **Exported Types:**
 * - `TableProps` - Main component properties
 * - `ColumnType` - Column configuration
 * - `TablePaginationConfig` - Pagination settings
 * - `TableRowSelection` - Row selection configuration
 * - `ExpandableConfig` - Expandable row settings
 * - `TableSize` - Size variants
 * - `TableLayout` - Layout modes
 * - `SortOrder` - Sort direction
 * - `FilterMode` - Filter display mode
 *
 * **Exported Constants:**
 * - `TABLE_DEFAULTS` - Default prop values
 *
 * @example Type Usage
 * ```tsx
 * import type { TableProps, ColumnType } from '@rottay/design-system';
 *
 * interface User {
 *   id: number;
 *   name: string;
 *   email: string;
 * }
 *
 * const columns: ColumnType<User>[] = [
 *   { title: 'Name', dataIndex: 'name', sorter: true },
 *   { title: 'Email', dataIndex: 'email' },
 * ];
 *
 * const props: TableProps<User> = {
 *   dataSource: users,
 *   columns,
 *   rowKey: 'id',
 * };
 * ```
 *
 * @see {@link Table} for component implementation
 * @module Table/types
 * @category Display
 * @package @rottay/design-system
 */
import type { ReactNode, CSSProperties, Key } from 'react';
import type { LegacySizeAlias, Size } from '../../../../../foundation/contracts/kernel/common';

/**
 * Table size variant. Controls row height, padding, and font-size of the table.
 * @remarks Canonical values are the {@link Size} subset `'sm' | 'md' | 'lg'`. The legacy Ant
 * Design-style spellings (`'small' | 'middle' | 'large' | 'default'`) are accepted for one
 * release via {@link LegacySizeAlias} and are deprecated; prefer the canonical spelling in new
 * code.
 */
export type TableSize = Extract<Size, 'sm' | 'md' | 'lg'> | LegacySizeAlias;

/**
 * Table layout algorithm.
 * - `'auto'` - Column widths adjust automatically based on content.
 * - `'fixed'` - Column widths are distributed evenly or honor explicit widths;
 *   improves rendering performance for large datasets.
 */
export type TableLayout = 'auto' | 'fixed';

/**
 * Scroll behavior when programmatically scrolling the table viewport.
 * - `'smooth'` - Animated scroll transition.
 * - `'auto'` - Instant jump (browser default).
 */
export type TableScrollBehavior = 'smooth' | 'auto';

/**
 * Sort direction for sortable columns.
 * - `'ascend'` - Ascending order (A-Z, 0-9).
 * - `'descend'` - Descending order (Z-A, 9-0).
 * - `null` - Unsorted / reset to default order.
 */
export type SortOrder = 'ascend' | 'descend' | null;

/**
 * Display mode for column filter dropdowns.
 * - `'menu'` - Flat list of checkable filter options.
 * - `'tree'` - Hierarchical tree of checkable filter options.
 */
export type FilterMode = 'menu' | 'tree';

/**
 * Supported field types for inline cell editing.
 * Determines which input control is rendered in edit mode.
 */
export type TableCellFieldType = 'text' | 'number' | 'select' | 'date' | 'checkbox';

/**
 * Identifies a cell currently being edited by row key and column key.
 */
export interface EditingCell {
  rowKey: string;
  columnKey: string;
}

/**
 * Column definition for the Table component.
 *
 * Each object in the `columns` array describes one column: its header,
 * data binding, width, sorting/filtering behavior, and optional inline
 * editing configuration.
 *
 * @typeParam T - Type of a single row record in the data source.
 *
 * @example
 * ```tsx
 * const columns: ColumnType<User>[] = [
 *   { title: 'Name', dataIndex: 'name', sorter: true, width: 200 },
 *   { title: 'Email', dataIndex: 'email', ellipsis: true },
 *   {
 *     title: 'Role',
 *     dataIndex: 'role',
 *     editable: true,
 *     fieldType: 'select',
 *     selectOptions: [
 *       { label: 'Admin', value: 'admin' },
 *       { label: 'User', value: 'user' },
 *     ],
 *   },
 * ];
 * ```
 */
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
  /**
   * Whether this column supports inline cell editing.
   * - `true`: always editable
   * - `(record, index) => boolean`: conditionally editable per row
   */
  editable?: boolean | ((record: T, index: number) => boolean);
  /**
   * Custom render function for the edit mode input.
   * If not provided, a default input is rendered based on `fieldType`.
   * @param value - Current cell value
   * @param record - Full row record
   * @param save - Callback to save the new value and exit edit mode
   */
  editRender?: (value: unknown, record: T, save: (value: unknown) => void) => ReactNode;
  /**
   * The type of input to render in edit mode when `editRender` is not specified.
   * @default 'text'
   */
  fieldType?: TableCellFieldType;
  /**
   * Options for `fieldType: 'select'`. Each option has a label and value.
   */
  selectOptions?: Array<{ label: ReactNode; value: string | number }>;
}

/**
 * Configuration for table pagination.
 *
 * Controls page size, navigation UI, and positioning of the pagination bar.
 * Pass `false` to `TableProps.pagination` to disable pagination entirely.
 *
 * @example
 * ```tsx
 * const pagination: TablePaginationConfig = {
 *   current: 1,
 *   pageSize: 20,
 *   total: 500,
 *   showSizeChanger: true,
 *   showTotal: (total, range) => `${range[0]}-${range[1]} of ${total}`,
 * };
 * ```
 */
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

/**
 * Row selection configuration for the Table component.
 *
 * Enables checkbox or radio selection of rows. Supports controlled
 * and uncontrolled modes, custom selection logic, and bulk actions.
 *
 * @typeParam T - Type of a single row record in the data source.
 *
 * @example
 * ```tsx
 * const rowSelection: TableRowSelection<User> = {
 *   type: 'checkbox',
 *   selectedRowKeys,
 *   onChange: (keys, rows) => setSelectedRowKeys(keys),
 *   getCheckboxProps: (record) => ({
 *     disabled: record.status === 'archived',
 *   }),
 * };
 * ```
 */
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

/**
 * Configuration for expandable table rows.
 *
 * Allows each row to expand and reveal additional detail content.
 * Supports controlled/uncontrolled expansion, custom icons, and
 * nested indentation.
 *
 * @typeParam T - Type of a single row record in the data source.
 *
 * @example
 * ```tsx
 * const expandable: ExpandableConfig<Order> = {
 *   expandedRowRender: (record) => <OrderDetails order={record} />,
 *   rowExpandable: (record) => record.items.length > 0,
 *   expandRowByClick: true,
 * };
 * ```
 */
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

/**
 * Props for the Table component.
 *
 * Table renders tabular data with support for sorting, filtering,
 * pagination, row selection, expandable rows, virtual scrolling,
 * sticky headers, and inline cell editing.
 *
 * @typeParam T - Type of a single row record in the data source.
 *
 * @example
 * ```tsx
 * <Table<User>
 *   dataSource={users}
 *   columns={columns}
 *   rowKey="id"
 *   pagination={{ pageSize: 20 }}
 *   rowSelection={{ type: 'checkbox', onChange: handleSelect }}
 *   onChange={handleTableChange}
 * />
 * ```
 */
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
  /** Bordered -- full outer border plus per-cell borders. Always implies `headerBordered`. */
  bordered?: boolean;
  /**
   * Header/body separator hairline, independent of `bordered`. Set to `false`
   * for a fully borderless table when `bordered` is also left at its default.
   * Only the modern engine reads this flag; classic and rustic derive their
   * header separator from their own default styling.
   * @default true
   */
  headerBordered?: boolean;
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
  /**
   * Callback fired when a cell value is saved via inline editing.
   * @param key - Row key of the edited record
   * @param dataIndex - Column dataIndex (field name) that was edited
   * @param value - New value
   * @param record - Full row record before the edit
   */
  onCellEdit?: (key: string, dataIndex: string, value: unknown, record: T) => void;
  /**
   * Controlled editing cell state. Set to `null` to clear.
   * When provided, the component operates in controlled mode for editing.
   */
  editingCell?: EditingCell | null;
}

/**
 * Default values for Table component props.
 * Applied when no explicit value is provided by the consumer.
 *
 * @constant
 */
export const TABLE_DEFAULTS: Partial<TableProps> = {
  /** Compact/default/large row density. */
  size: 'default',
  /** No outer border by default. */
  bordered: false,
  /** Header/body separator hairline is shown by default. */
  headerBordered: true,
  /** Column headers are visible by default. */
  showHeader: true,
  /** Row highlight on mouse-over is enabled by default. */
  rowHoverable: true,
  /** Column widths auto-size based on content by default. */
  tableLayout: 'auto',
};
