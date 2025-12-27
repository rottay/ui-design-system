/**
 * Radio - Core Interface
 * Shared types and defaults for all engine implementations
 */

import type { EngineAwareProps } from '../../../../../types';
import type { ReactNode, ChangeEvent, CSSProperties } from 'react';

export type RadioSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type RadioVariant = 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error';
export type RadioLabelPlacement = 'start' | 'end';

export interface RadioOption {
  /** Option value */
  value: string | number;
  /** Option label */
  label: ReactNode;
  /** Disabled state */
  disabled?: boolean;
  /** Description text */
  description?: ReactNode;
}

export interface RadioProps extends EngineAwareProps {
  /** Radio size */
  size?: RadioSize;
  /** Color variant when checked */
  color?: RadioVariant;
  /** Label placement relative to radio */
  labelPlacement?: RadioLabelPlacement;
  /** Checked state (controlled) */
  checked?: boolean;
  /** Default checked state (uncontrolled) */
  defaultChecked?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Required field */
  required?: boolean;
  /** Error state */
  error?: boolean;
  /** Label text */
  label?: ReactNode;
  /** Description text */
  description?: ReactNode;
  /** Children (alternative to label) */
  children?: ReactNode;
  /** Change handler */
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  /** Additional CSS class */
  className?: string;
  /** Inline styles */
  style?: CSSProperties;
  /** Name attribute for forms (required for radio groups) */
  name?: string;
  /** ID attribute */
  id?: string;
  /** Value attribute */
  value?: string | number;
  /** Autofocus attribute */
  autoFocus?: boolean;
}

export interface RadioGroupProps extends EngineAwareProps {
  /** Group size */
  size?: RadioSize;
  /** Color variant */
  color?: RadioVariant;
  /** Options array */
  options?: RadioOption[];
  /** Selected value (controlled) */
  value?: string | number;
  /** Default selected value (uncontrolled) */
  defaultValue?: string | number;
  /** Disabled state */
  disabled?: boolean;
  /** Layout direction */
  direction?: 'horizontal' | 'vertical';
  /** Spacing between items */
  spacing?: 'sm' | 'md' | 'lg';
  /** Change handler */
  onChange?: (value: string | number) => void;
  /** Children (Radio components) */
  children?: ReactNode;
  /** Additional CSS class */
  className?: string;
  /** Inline styles */
  style?: CSSProperties;
  /** Name attribute for forms */
  name?: string;
  /** Button style variant */
  buttonStyle?: 'outline' | 'solid';
}

export const RADIO_DEFAULTS = {
  size: 'md' as RadioSize,
  color: 'primary' as RadioVariant,
  labelPlacement: 'end' as RadioLabelPlacement,
  defaultChecked: false,
  disabled: false,
  required: false,
  error: false,
};

export const RADIO_GROUP_DEFAULTS = {
  size: 'md' as RadioSize,
  color: 'primary' as RadioVariant,
  direction: 'vertical' as const,
  spacing: 'md' as const,
  disabled: false,
};

// Size mapping to CSS variables
export const SIZE_MAP: Record<RadioSize, string> = {
  xs: 'var(--radio-xs-size)',
  sm: 'var(--radio-sm-size)',
  md: 'var(--radio-md-size)',
  lg: 'var(--radio-lg-size)',
  xl: 'var(--radio-xl-size)',
};

// Numeric size values for calculations (e.g., dot sizing)
export const SIZE_MAP_NUMERIC: Record<RadioSize, number> = {
  xs: 14,
  sm: 16,
  md: 18,
  lg: 20,
  xl: 24,
};

// Color mapping
export const COLOR_MAP: Record<RadioVariant, { bg: string; border: string; dot: string }> = {
  default: {
    bg: 'var(--color-neutral-600, #4b5563)',
    border: 'var(--color-neutral-600, #4b5563)',
    dot: '#ffffff',
  },
  primary: {
    bg: 'var(--color-primary, #1890ff)',
    border: 'var(--color-primary, #1890ff)',
    dot: '#ffffff',
  },
  secondary: {
    bg: 'var(--color-secondary, #6b7280)',
    border: 'var(--color-secondary, #6b7280)',
    dot: '#ffffff',
  },
  success: {
    bg: 'var(--color-success, #52c41a)',
    border: 'var(--color-success, #52c41a)',
    dot: '#ffffff',
  },
  warning: {
    bg: 'var(--color-warning, #faad14)',
    border: 'var(--color-warning, #faad14)',
    dot: '#ffffff',
  },
  error: {
    bg: 'var(--color-error, #ff4d4f)',
    border: 'var(--color-error, #ff4d4f)',
    dot: '#ffffff',
  },
};
