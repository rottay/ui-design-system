/**
 * Pagination - Core Interface
 */

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
}

export const PAGINATION_DEFAULTS: Partial<PaginationProps> = {
  pageSize: 10,
  size: 'md',
  showSizeChanger: false,
  showTotal: false,
};
