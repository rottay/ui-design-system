/**
 * Stack - Core Interface
 */

import type { EngineAwareProps, WithChildrenProps } from '../../../../../types';

export type StackDirection = 'vertical' | 'horizontal';
export type StackAlign = 'start' | 'center' | 'end' | 'stretch';
export type StackJustify = 'start' | 'center' | 'end' | 'between' | 'around';
export type StackSpacing = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface StackProps extends EngineAwareProps, WithChildrenProps {
  direction?: StackDirection;
  align?: StackAlign;
  justify?: StackJustify;
  spacing?: StackSpacing;
  wrap?: boolean;
  divider?: boolean;
}

export const STACK_DEFAULTS: Partial<StackProps> = {
  direction: 'vertical',
  align: 'stretch',
  justify: 'start',
  spacing: 'md',
  wrap: false,
};

export const SPACING_MAP = {
  none: '0',
  xs: '0.25rem',
  sm: '0.5rem',
  md: '1rem',
  lg: '1.5rem',
  xl: '2rem',
};

export const ALIGN_MAP = {
  start: 'flex-start',
  center: 'center',
  end: 'flex-end',
  stretch: 'stretch',
};

export const JUSTIFY_MAP = {
  start: 'flex-start',
  center: 'center',
  end: 'flex-end',
  between: 'space-between',
  around: 'space-around',
};
