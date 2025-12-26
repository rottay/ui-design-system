/**
 * Transfer Types
 */
import type { ReactNode, CSSProperties } from 'react';

export interface TransferItem {
  key: string;
  title: string;
  description?: string;
  disabled?: boolean;
  [key: string]: unknown;
}

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
}

export const TRANSFER_DEFAULTS: Partial<TransferProps> = {
  titles: ['Source', 'Target'],
  operations: ['>', '<'],
  showSearch: false,
  disabled: false,
  showSelectAll: true,
  oneWay: false,
  locale: {
    itemUnit: 'item',
    itemsUnit: 'items',
    notFoundContent: 'No data',
    searchPlaceholder: 'Search',
  },
};
