/**
 * Spinner - Core Interface
 */

import type { CSSProperties, ReactNode } from 'react';
import type { EngineAwareProps } from '../../../../../types';

export type SpinnerSize = 'sm' | 'md' | 'lg' | 'xl';

export interface SpinnerProps extends EngineAwareProps {
  size?: SpinnerSize;
  color?: string;
  label?: string;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}

export const SPINNER_DEFAULTS: Partial<SpinnerProps> = {
  size: 'md',
};

export const SIZE_MAP = {
  sm: 'var(--spinner-sm-size)',
  md: 'var(--spinner-md-size)',
  lg: 'var(--spinner-lg-size)',
  xl: 'var(--spinner-xl-size)',
};
