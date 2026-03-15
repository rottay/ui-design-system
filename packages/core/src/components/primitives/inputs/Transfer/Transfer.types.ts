/**
 * @fileoverview Transfer Component Types - Rottay Design System
 * @description Type definitions for the Transfer component including data items,
 * target keys, search filtering, and customization options.
 *
 * @remarks
 * The Transfer types provide comprehensive configuration for:
 * - Data items: Key, title, description, disabled state
 * - Target management: Keys of items in the right panel
 * - Search filtering: Built-in or custom filter functions
 * - Customization: Titles, operations, locale, rendering
 *
 * @example Type Usage
 * ```tsx
 * import type {
 *   TransferProps,
 *   TransferItem,
 * } from '@rottay/design-system';
 *
 * const items: TransferItem[] = [
 *   { key: '1', title: 'Item 1', description: 'Description 1' },
 *   { key: '2', title: 'Item 2', disabled: true },
 * ];
 *
 * const config: TransferProps = {
 *   dataSource: items,
 *   targetKeys: ['1'],
 *   showSearch: true,
 * };
 * ```
 *
 * @module Transfer/Types
 * @category Inputs
 * @package @rottay/design-system
 */
import type { ReactNode, CSSProperties } from 'react';

/**
 * Structure for a transfer list item.
 *
 * @example
 * ```tsx
 * const items: TransferItem[] = [
 *   { key: 'user-1', title: 'John Doe', description: 'Admin' },
 *   { key: 'user-2', title: 'Jane Smith', disabled: true },
 * ];
 * ```
 */
export interface TransferItem {
  /** Unique identifier for the item */
  key: string;
  /** Display title for the item */
  title: string;
  /** Optional description text */
  description?: string;
  /** Whether this item is disabled */
  disabled?: boolean;
  /** Additional custom properties */
  [key: string]: unknown;
}

/**
 * Props for the Transfer component.
 *
 * @example Basic usage
 * ```tsx
 * <Transfer
 *   dataSource={items}
 *   targetKeys={selectedKeys}
 *   onChange={(keys) => setSelectedKeys(keys)}
 * />
 * ```
 *
 * @example With search and custom rendering
 * ```tsx
 * <Transfer
 *   dataSource={items}
 *   targetKeys={keys}
 *   showSearch
 *   render={(item) => <span>{item.title} - {item.description}</span>}
 * />
 * ```
 */
export interface TransferProps {
  /** Data source */
  dataSource: TransferItem[];
  /** Keys of items in target list */
  targetKeys?: string[];
  /** Default target keys */
  defaultTargetKeys?: string[];
  /** Callback when target keys change */
  onChange?: (targetKeys: string[], direction: 'left' | 'right', moveKeys: string[]) => void;
  /** Callback when selected keys change */
  onSelectChange?: (sourceSelectedKeys: string[], targetSelectedKeys: string[]) => void;
  /** Callback when search changes */
  onSearch?: (direction: 'left' | 'right', value: string) => void;
  /** Titles for left and right panels */
  titles?: [ReactNode, ReactNode];
  /** Operation buttons text */
  operations?: [string, string];
  /** Show search input */
  showSearch?: boolean;
  /** Custom filter function */
  filterOption?: (inputValue: string, item: TransferItem) => boolean;
  /** Custom render function for items */
  render?: (item: TransferItem) => ReactNode;
  /** Whether disabled */
  disabled?: boolean;
  /** List style */
  listStyle?: CSSProperties;
  /** Locale text */
  locale?: {
    itemUnit?: string;
    itemsUnit?: string;
    notFoundContent?: ReactNode;
    searchPlaceholder?: string;
  };
  /** Show select all checkbox */
  showSelectAll?: boolean;
  /** One way transfer (only left to right) */
  oneWay?: boolean;
  /** Pagination config */
  pagination?: boolean | { pageSize?: number };
  /** Additional class name */
  className?: string;
  /** Additional styles */
  style?: CSSProperties;
  /** Rendering engine override */
  engine?: 'classic' | 'modern' | 'rustic';
}

/**
 * Default values for Transfer props.
 * Used across all engine implementations for consistency.
 */
export const TRANSFER_DEFAULTS: Partial<TransferProps> = {
  /** Default panel titles */
  titles: ['Source', 'Target'],
  /** Default operation button text */
  operations: ['>', '<'],
  /** Search hidden by default */
  showSearch: false,
  /** Not disabled by default */
  disabled: false,
  /** Show select all checkbox */
  showSelectAll: true,
  /** Bidirectional transfer by default */
  oneWay: false,
  /** Default locale strings */
  locale: {
    itemUnit: 'item',
    itemsUnit: 'items',
    notFoundContent: 'No data',
    searchPlaceholder: 'Search',
  },
};
