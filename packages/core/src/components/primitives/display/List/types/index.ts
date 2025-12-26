/**
 * List Types
 */
import type { ReactNode, CSSProperties } from 'react';

export interface ListItemMetaProps {
  /** Avatar element */
  avatar?: ReactNode;
  /** Title content */
  title?: ReactNode;
  /** Description content */
  description?: ReactNode;
  /** Custom class name */
  className?: string;
  /** Custom styles */
  style?: CSSProperties;
}

export interface ListItemProps {
  /** Actions for the list item */
  actions?: ReactNode[];
  /** Extra content */
  extra?: ReactNode;
  /** Item content */
  children?: ReactNode;
  /** Custom class name */
  className?: string;
  /** Custom styles */
  style?: CSSProperties;
}

export interface ListProps<T = unknown> {
  /** Data source array */
  dataSource?: T[];
  /** Render function for each item */
  renderItem?: (item: T, index: number) => ReactNode;
  /** Show border */
  bordered?: boolean;
  /** List header */
  header?: ReactNode;
  /** List footer */
  footer?: ReactNode;
  /** Loading state */
  loading?: boolean;
  /** Size variant */
  size?: 'default' | 'small' | 'large';
  /** Split items with border */
  split?: boolean;
  /** Item layout direction */
  itemLayout?: 'horizontal' | 'vertical';
  /** Grid configuration */
  grid?: {
    gutter?: number;
    column?: number;
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
    xxl?: number;
  };
  /** Pagination config */
  pagination?: {
    current?: number;
    pageSize?: number;
    total?: number;
    onChange?: (page: number, pageSize: number) => void;
  } | false;
  /** Empty content when no data */
  locale?: {
    emptyText?: ReactNode;
  };
  /** List children (alternative to dataSource) */
  children?: ReactNode;
  /** Custom class name */
  className?: string;
  /** Custom styles */
  style?: CSSProperties;
}

export const LIST_DEFAULTS = {
  bordered: false,
  split: true,
  size: 'default' as const,
  itemLayout: 'horizontal' as const,
};
