/**
 * Transfer Component Types
 *
 * Unified type definitions for the Transfer component.
 * Works with titan (AntD), hermes (DaisyUI), and apollo (HTML+Tailwind).
 */

import type { ReactNode, CSSProperties } from 'react';

/**
 * Transfer item
 */
export interface TransferItem {
  /** Unique key for the item */
  key: string;
  /** Display title */
  title: ReactNode;
  /** Description (optional) */
  description?: ReactNode;
  /** Whether this item is disabled */
  disabled?: boolean;
  /** Additional data */
  [key: string]: unknown;
}

/**
 * Direction for transfer
 */
export type TransferDirection = 'left' | 'right';

/**
 * Locale configuration
 */
export interface TransferLocale {
  /** Title for items unit (singular) */
  itemUnit?: string;
  /** Title for items unit (plural) */
  itemsUnit?: string;
  /** Title for not found content */
  notFoundContent?: ReactNode;
  /** Search placeholder */
  searchPlaceholder?: string;
  /** Select all label */
  selectAll?: string;
  /** Select current page label */
  selectCurrent?: string;
  /** Select invert label */
  selectInvert?: string;
  /** Remove current label */
  removeCurrent?: string;
  /** Remove all label */
  removeAll?: string;
}

/**
 * List style configuration
 */
export interface TransferListStyle {
  width?: number | string;
  height?: number | string;
}

/**
 * Render result for custom item render
 */
export interface TransferRenderResult {
  label: ReactNode;
  value: string;
}

/**
 * One-way mode for Transfer
 */
export type TransferOneWay = boolean;

/**
 * Pagination configuration
 */
export interface TransferPagination {
  pageSize?: number;
  simple?: boolean;
  showSizeChanger?: boolean;
  showLessItems?: boolean;
}

/**
 * Select info passed to callbacks
 */
export interface TransferSelectInfo {
  type: 'all' | 'none' | 'invert' | 'current';
}

/**
 * Base props shared by all Transfer implementations
 */
export interface TransferBaseProps<T extends TransferItem = TransferItem> {
  // ─────────────────────────────────────────────────────────────────────────────
  // Core Props
  // ─────────────────────────────────────────────────────────────────────────────

  /** Data source items */
  dataSource: T[];

  /** Keys of selected items on the right side (target) */
  targetKeys?: string[];

  /** Keys of selected items (controlled) */
  selectedKeys?: string[];

  /** Whether the transfer is disabled */
  disabled?: boolean;

  // ─────────────────────────────────────────────────────────────────────────────
  // Appearance
  // ─────────────────────────────────────────────────────────────────────────────

  /** Show search input */
  showSearch?: boolean;

  /** Show select all checkbox */
  showSelectAll?: boolean;

  /** One way mode (items can only be transferred to the right) */
  oneWay?: TransferOneWay;

  /** Pagination configuration */
  pagination?: TransferPagination | boolean;

  /** List style */
  listStyle?: TransferListStyle | ((info: { direction: TransferDirection }) => TransferListStyle);

  /** Titles for the two lists */
  titles?: [ReactNode, ReactNode];

  /** Operations texts */
  operations?: [string?, string?];

  /** Footer render for each list */
  footer?: (
    props: {
      direction: TransferDirection;
    },
    info?: { page: number }
  ) => ReactNode;

  // ─────────────────────────────────────────────────────────────────────────────
  // Filtering & Searching
  // ─────────────────────────────────────────────────────────────────────────────

  /** Filter option function */
  filterOption?: (inputValue: string, item: T, direction: TransferDirection) => boolean;

  /** Locale configuration */
  locale?: TransferLocale;

  // ─────────────────────────────────────────────────────────────────────────────
  // Rendering
  // ─────────────────────────────────────────────────────────────────────────────

  /** Custom item render */
  render?: (item: T) => TransferRenderResult | ReactNode;

  /** Status of selected items count */
  selectAllLabels?: [
    ((info: { selectedCount: number; totalCount: number }) => ReactNode)?,
    ((info: { selectedCount: number; totalCount: number }) => ReactNode)?
  ];

  // ─────────────────────────────────────────────────────────────────────────────
  // Events
  // ─────────────────────────────────────────────────────────────────────────────

  /** Callback when items are transferred */
  onChange?: (
    targetKeys: string[],
    direction: TransferDirection,
    moveKeys: string[]
  ) => void;

  /** Callback when selection changes */
  onSelectChange?: (
    sourceSelectedKeys: string[],
    targetSelectedKeys: string[]
  ) => void;

  /** Callback when search value changes */
  onSearch?: (direction: TransferDirection, value: string) => void;

  /** Callback on scroll */
  onScroll?: (
    direction: TransferDirection,
    e: React.UIEvent<HTMLUListElement>
  ) => void;

  // ─────────────────────────────────────────────────────────────────────────────
  // Styling
  // ─────────────────────────────────────────────────────────────────────────────

  /** Additional CSS class */
  className?: string;

  /** Inline styles */
  style?: CSSProperties;

  /** Root class name */
  rootClassName?: string;

  /** ID for the input */
  id?: string;
}

/**
 * Full Transfer props
 */
export interface TransferProps<T extends TransferItem = TransferItem>
  extends TransferBaseProps<T> {
  /** Custom dropdown render for operations */
  operationStyle?: CSSProperties;

  /** Status indicator */
  status?: 'error' | 'warning';
}

// ─────────────────────────────────────────────────────────────────────────────
// Utilities
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Default filter function for transfer search
 */
export function defaultTransferFilter<T extends TransferItem>(
  inputValue: string,
  item: T
): boolean {
  const title = typeof item.title === 'string' ? item.title : '';
  const description = typeof item.description === 'string' ? item.description : '';
  return (
    title.toLowerCase().includes(inputValue.toLowerCase()) ||
    description.toLowerCase().includes(inputValue.toLowerCase())
  );
}

/**
 * Split data source into left and right lists
 */
export function splitDataSource<T extends TransferItem>(
  dataSource: T[],
  targetKeys: string[]
): { leftDataSource: T[]; rightDataSource: T[] } {
  const targetKeySet = new Set(targetKeys);
  const leftDataSource: T[] = [];
  const rightDataSource: T[] = [];

  for (const item of dataSource) {
    if (targetKeySet.has(item.key)) {
      rightDataSource.push(item);
    } else {
      leftDataSource.push(item);
    }
  }

  return { leftDataSource, rightDataSource };
}

/**
 * Get selected items from data source
 */
export function getSelectedItems<T extends TransferItem>(
  dataSource: T[],
  selectedKeys: string[]
): T[] {
  const selectedKeySet = new Set(selectedKeys);
  return dataSource.filter((item) => selectedKeySet.has(item.key));
}

/**
 * Get enabled items count
 */
export function getEnabledItemsCount<T extends TransferItem>(items: T[]): number {
  return items.filter((item) => !item.disabled).length;
}
