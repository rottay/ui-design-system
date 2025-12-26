/**
 * Divider - Core Interface
 */

import type { EngineAwareProps } from '../../../../../types';
import type { ReactNode, CSSProperties } from 'react';

export type DividerOrientation = 'horizontal' | 'vertical';
export type DividerType = 'solid' | 'dashed' | 'dotted';

export interface DividerProps extends EngineAwareProps {
  orientation?: DividerOrientation;
  type?: DividerType;
  children?: ReactNode;  // Text in the middle of divider
  margin?: 'none' | 'sm' | 'md' | 'lg';
  className?: string;
  style?: CSSProperties;
}

export const DIVIDER_DEFAULTS: Partial<DividerProps> = {
  orientation: 'horizontal',
  type: 'solid',
  margin: 'md',
};

export const MARGIN_MAP = {
  none: '0',
  sm: '0.5rem',
  md: '1rem',
  lg: '1.5rem',
};
