/**
 * Box - Core Interface
 * Generic container component
 */

import type { EngineAwareProps, WithChildrenProps, BaseComponentProps } from '../../../../../types';
import type { CSSProperties } from 'react';

export interface BoxProps extends EngineAwareProps, WithChildrenProps, BaseComponentProps {
  as?: keyof JSX.IntrinsicElements;
  padding?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  margin?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  display?: CSSProperties['display'];
  position?: CSSProperties['position'];
  width?: CSSProperties['width'];
  height?: CSSProperties['height'];
  background?: CSSProperties['background'];
  borderRadius?: 'none' | 'sm' | 'md' | 'lg' | 'full';
}

export const BOX_DEFAULTS: Partial<BoxProps> = {
  as: 'div',
  padding: 'none',
  margin: 'none',
};

export const SPACING_MAP = {
  none: '0',
  xs: '0.25rem',
  sm: '0.5rem',
  md: '1rem',
  lg: '1.5rem',
  xl: '2rem',
};

export const RADIUS_MAP = {
  none: '0',
  sm: '0.25rem',
  md: '0.375rem',
  lg: '0.5rem',
  full: '9999px',
};
