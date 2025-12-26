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
  sm: 16,
  md: 24,
  lg: 32,
  xl: 48,
};
