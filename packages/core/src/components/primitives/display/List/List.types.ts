/**
 * @fileoverview List Types - Rottay Design System
 * @description Type definitions for the List component and its compound components.
 * Part of the Rottay Design System's display primitives collection.
 *
 * @remarks
 * This module provides type definitions for the List component
 * and its compound components.
 *
 * **Exported Types:**
 * - `ListProps` - Main list component properties
 * - `ListItemProps` - List item container properties
 * - `ListItemMetaProps` - Item metadata properties
 * - `ListSize` - Size variants
 * - `ListItemLayout` - Layout direction
 * - `ListGridConfig` - Grid layout configuration
 * - `ListPaginationConfig` - Pagination settings
 * - `ListLocale` - Localization configuration
 *
 * **Exported Constants:**
 * - `LIST_DEFAULTS` - Default prop values
 * - `LIST_SIZE_MAP` - Size to CSS value mappings
 *
 * @example Type Usage
 * ```tsx
 * import type { ListProps, ListItemProps } from '@rottay/design-system';
 *
 * const listProps: ListProps = {
 *   bordered: true,
 *   size: 'default',
 *   split: true,
 * };
 *
 * const itemProps: ListItemProps = {
 *   actions: [<Button>Edit</Button>],
 * };
 * ```
 *
 * @see {@link List} for component implementation
 * @module List/types
 * @category Display
 * @package @rottay/design-system
 */

import type { ReactNode } from 'react';
import type { BaseComponentProps, LoadableProps, WithChildren, BorderedProps } from '../../../../contracts/common';
import type { EngineAwareProps } from '../../../../contracts/engine';

/**
 * Available size options for List component
 */
export type ListSize = 'default' | 'small' | 'large';

/**
 * Layout direction for list items
 */
export type ListItemLayout = 'horizontal' | 'vertical';

/**
 * Grid configuration for list layout
 */
export interface ListGridConfig {
  /** Spacing between grid items */
  gutter?: number;
  /** Number of columns in the grid */
  column?: number;
  /** Columns for extra small screens */
  xs?: number;
  /** Columns for small screens */
  sm?: number;
  /** Columns for medium screens */
  md?: number;
  /** Columns for large screens */
  lg?: number;
  /** Columns for extra large screens */
  xl?: number;
  /** Columns for extra extra large screens */
  xxl?: number;
}

/**
 * Pagination configuration for the List
 */
export interface ListPaginationConfig {
  /** Current page number */
  current?: number;
  /** Number of items per page */
  pageSize?: number;
  /** Total number of items */
  total?: number;
  /** Callback when page changes */
  onChange?: (page: number, pageSize: number) => void;
}

/**
 * Locale configuration for List
 */
export interface ListLocale {
  /** Content to display when list is empty */
  emptyText?: ReactNode;
}

/**
 * Props for List.Item.Meta component
 * Displays metadata for a list item including avatar, title, and description
 */
export interface ListItemMetaProps extends BaseComponentProps {
  /** Avatar element to display */
  avatar?: ReactNode;
  /** Title content */
  title?: ReactNode;
  /** Description content */
  description?: ReactNode;
}

/**
 * Props for List.Item component
 * Represents a single item within the List
 */
export interface ListItemProps extends BaseComponentProps, WithChildren {
  /** Array of action elements to display */
  actions?: ReactNode[];
  /** Extra content to display on the right side */
  extra?: ReactNode;
}

/**
 * Props for the List component
 * @template T - Type of items in the data source
 */
export interface ListProps<T = unknown> extends BaseComponentProps, EngineAwareProps, LoadableProps, BorderedProps, WithChildren {
  /** Array of data items to render */
  dataSource?: T[];
  /** Function to render each item */
  renderItem?: (item: T, index: number) => ReactNode;
  /** Header content for the list */
  header?: ReactNode;
  /** Footer content for the list */
  footer?: ReactNode;
  /** Size of the list items */
  size?: ListSize;
  /** Whether to show separator between items */
  split?: boolean;
  /** Layout direction of list items */
  itemLayout?: ListItemLayout;
  /** Grid configuration for grid layout */
  grid?: ListGridConfig;
  /** Pagination configuration or false to disable */
  pagination?: ListPaginationConfig | false;
  /** Locale configuration for empty text */
  locale?: ListLocale;
  /** Unique key for each item, can be a property name or function */
  rowKey?: string | ((item: T) => string);
}

/**
 * Default values for List component props
 */
export const LIST_DEFAULTS = {
  bordered: false,
  split: true,
  size: 'default' as const,
  itemLayout: 'horizontal' as const,
  loading: false,
};

/**
 * Size mapping for List styling using CSS variables
 */
export const LIST_SIZE_MAP: Record<ListSize, { padding: string; fontSize: string }> = {
  small: { padding: 'var(--ds-list-sm-padding-vertical) var(--ds-list-sm-padding-horizontal)', fontSize: 'var(--ds-list-sm-font-size)' },
  default: { padding: 'var(--ds-list-default-padding-vertical) var(--ds-list-default-padding-horizontal)', fontSize: 'var(--ds-list-default-font-size)' },
  large: { padding: 'var(--ds-list-lg-padding-vertical) var(--ds-list-lg-padding-horizontal)', fontSize: 'var(--ds-list-lg-font-size)' },
};
