/**
 * Pagination - Core Interface
 */

import type { CSSProperties, ReactNode } from 'react';
import type { EngineAwareProps } from '../../../../../types';

export type PaginationSize = 'sm' | 'md' | 'lg';

export interface PaginationProps extends EngineAwareProps {
  current: number;
  total: number;
  pageSize?: number;
  size?: PaginationSize;
  showSizeChanger?: boolean;
  showTotal?: boolean;
  disabled?: boolean;
  onChange?: (page: number, pageSize: number) => void;
  /** Optional CSS class name */
  className?: string;
  /** Optional inline styles */
  style?: CSSProperties;
  /** Optional children for base component */
  children?: ReactNode;
}

export const PAGINATION_DEFAULTS: Partial<PaginationProps> = {
  pageSize: 10,
  size: 'md',
  showSizeChanger: false,
  showTotal: false,
};
