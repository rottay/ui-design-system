/**
 * Toggle - Core Interface
 * Shared types and defaults for all engine implementations
 */

import type { EngineAwareProps } from '../../../../../types';
import type { ReactNode, CSSProperties, ChangeEvent } from 'react';

// Size types
export type ToggleSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

// Color/variant types
export type ToggleVariant = 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error';

// Label placement
export type ToggleLabelPlacement = 'start' | 'end';

export interface ToggleProps extends EngineAwareProps {
  /** Toggle size */
  size?: ToggleSize;
  /** Toggle color variant */
  color?: ToggleVariant;
  /** Checked state (controlled) */
  checked?: boolean;
  /** Default checked state (uncontrolled) */
  defaultChecked?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Required field */
  required?: boolean;
  /** Loading state */
  loading?: boolean;
  /** Label text */
  label?: ReactNode;
  /** Checked label (when toggle is on) */
  checkedLabel?: ReactNode;
  /** Unchecked label (when toggle is off) */
  uncheckedLabel?: ReactNode;
  /** Description text below label */
  description?: ReactNode;
  /** Helper text below toggle */
  helperText?: string;
  /** Error state */
  error?: boolean;
  /** Error message */
  errorMessage?: string;
  /** Label placement relative to toggle */
  labelPlacement?: ToggleLabelPlacement;
  /** Change handler */
  onChange?: (checked: boolean, event: ChangeEvent<HTMLInputElement>) => void;
  /** Additional CSS class */
  className?: string;
  /** Inline styles */
  style?: CSSProperties;
  /** Name attribute for forms */
  name?: string;
  /** ID attribute */
  id?: string;
  /** Value attribute */
  value?: string | number;
  /** Autofocus attribute */
  autoFocus?: boolean;
  /** Children content (alternative to label) */
  children?: ReactNode;
}

// Size mappings (using CSS variables from tokens)
export const SIZE_MAP: Record<ToggleSize, { width: string; height: string; dot: string }> = {
  xs: { width: 'var(--toggle-xs-width)', height: 'var(--toggle-xs-height)', dot: 'var(--toggle-xs-dot)' },
  sm: { width: 'var(--toggle-sm-width)', height: 'var(--toggle-sm-height)', dot: 'var(--toggle-sm-dot)' },
  md: { width: 'var(--toggle-md-width)', height: 'var(--toggle-md-height)', dot: 'var(--toggle-md-dot)' },
  lg: { width: 'var(--toggle-lg-width)', height: 'var(--toggle-lg-height)', dot: 'var(--toggle-lg-dot)' },
  xl: { width: 'var(--toggle-xl-width)', height: 'var(--toggle-xl-height)', dot: 'var(--toggle-xl-dot)' },
};

// Numeric size values for calculations (internal use)
export const SIZE_VALUES: Record<ToggleSize, { width: number; height: number; dot: number }> = {
  xs: { width: 28, height: 16, dot: 12 },
  sm: { width: 36, height: 20, dot: 16 },
  md: { width: 44, height: 24, dot: 20 },
  lg: { width: 52, height: 28, dot: 24 },
  xl: { width: 60, height: 32, dot: 28 },
};

// Color mappings
export const COLOR_MAP: Record<ToggleVariant, { bg: string; bgChecked: string; border: string }> = {
  default: { bg: '#d9d9d9', bgChecked: '#1890ff', border: '#d9d9d9' },
  primary: { bg: '#d9d9d9', bgChecked: '#1890ff', border: '#1890ff' },
  secondary: { bg: '#d9d9d9', bgChecked: '#6c757d', border: '#6c757d' },
  success: { bg: '#d9d9d9', bgChecked: '#52c41a', border: '#52c41a' },
  warning: { bg: '#d9d9d9', bgChecked: '#faad14', border: '#faad14' },
  error: { bg: '#d9d9d9', bgChecked: '#ff4d4f', border: '#ff4d4f' },
};

export const TOGGLE_DEFAULTS = {
  size: 'md' as ToggleSize,
  color: 'primary' as ToggleVariant,
  disabled: false,
  required: false,
  loading: false,
  error: false,
  labelPlacement: 'end' as ToggleLabelPlacement,
};
