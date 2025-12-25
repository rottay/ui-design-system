/**
 * Grid - Core Interface
 */

import type { EngineAwareProps, WithChildrenProps } from '../../../../../types';

export type GridColumns = 1 | 2 | 3 | 4 | 5 | 6 | 12;
export type GridGap = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface GridProps extends EngineAwareProps, WithChildrenProps {
  columns?: GridColumns;
  gap?: GridGap;
  rowGap?: GridGap;
  columnGap?: GridGap;
}

export const GRID_DEFAULTS: Partial<GridProps> = {
  columns: 12,
  gap: 'md',
};

export const GAP_MAP = {
  none: '0',
  xs: '0.25rem',
  sm: '0.5rem',
  md: '1rem',
  lg: '1.5rem',
  xl: '2rem',
};
