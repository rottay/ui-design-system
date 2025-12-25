import React from 'react';

/**
 * Grid configuration for List component
 */
export interface ListGridConfig {
  /** Grid gutter spacing (px) */
  gutter?: number;
  /** Number of columns */
  column?: number;
  /** Column width for each breakpoint */
  xs?: number;
  sm?: number;
  md?: number;
  lg?: number;
  xl?: number;
  xxl?: number;
}

/**
 * Pagination configuration for List
 */
export interface ListPaginationConfig {
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
 * Loading configuration for List
 * Can be a boolean or detailed spinner configuration
 */
export interface ListSpinConfig {
  /** Whether the spinner is spinning */
  spinning?: boolean;
  /** Size of the spinner */
  size?: 'small' | 'default' | 'large';
  /** Tip text */
  tip?: React.ReactNode;
  /** Delay showing spinner (ms) */
  delay?: number;
}

/**
 * Base props for List components
 * These props are supported by ALL engines (titan/AntD, hermes/DaisyUI, apollo/HTML+Tailwind)
 */
export interface ListBaseProps<T = any> {
  /** Data source for the list */
  dataSource?: T[];

  /** Render function for each item */
  renderItem?: (item: T, index: number) => React.ReactNode;

  /** Additional CSS class name */
  className?: string;

  /** Loading state - boolean or spinner configuration */
  loading?: boolean | ListSpinConfig;

  /** Size variant */
  size?: 'small' | 'default' | 'large';
}

/**
 * Extended props for List components
 * Includes engine-specific props that may not be supported by all implementations
 */
export interface ListProps<T = any> extends ListBaseProps<T> {
  /** Whether the list has borders */
  bordered?: boolean;

  /** Whether to split list items */
  split?: boolean;

  /** List header content */
  header?: React.ReactNode;

  /** List footer content */
  footer?: React.ReactNode;

  /** Item layout orientation */
  itemLayout?: 'horizontal' | 'vertical';

  /** Grid configuration for grid layout */
  grid?: ListGridConfig;

  /** Pagination configuration */
  pagination?: ListPaginationConfig | false;

  /** Empty state content when no data */
  locale?: {
    emptyText?: React.ReactNode;
  };

  /** Custom row key field name or function */
  rowKey?: string | ((item: T) => string | number);

  /** Load more content/button */
  loadMore?: React.ReactNode;

  /** Additional inline styles */
  style?: React.CSSProperties;

  /** HTML id attribute */
  id?: string;

  /** Custom render for empty state */
  renderEmpty?: () => React.ReactNode;
}

/**
 * List.Item props
 */
export interface ListItemProps {
  /** Item content */
  children?: React.ReactNode;
  /** Additional CSS class name */
  className?: string;
  /** Additional inline styles */
  style?: React.CSSProperties;
  /** Item actions (buttons, links, etc.) */
  actions?: React.ReactNode[];
  /** Additional content (usually on the right side) */
  extra?: React.ReactNode;
}

/**
 * List.Item.Meta props
 */
export interface ListItemMetaProps {
  /** Avatar element */
  avatar?: React.ReactNode;
  /** Title of the item */
  title?: React.ReactNode;
  /** Description of the item */
  description?: React.ReactNode;
  /** Additional CSS class name */
  className?: string;
  /** Additional inline styles */
  style?: React.CSSProperties;
}
