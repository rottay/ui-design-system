/**
 * Checkbox - Core Interface
 * Shared types and defaults for all engine implementations
 */

import type { EngineAwareProps } from '../../../../../types';
import type { ReactNode, ChangeEvent, CSSProperties } from 'react';

export type CheckboxSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type CheckboxVariant = 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error';
export type CheckboxRadius = 'none' | 'sm' | 'md' | 'lg' | 'full';
export type CheckboxLabelPlacement = 'start' | 'end';

export interface CheckboxOption {
  /** Option value */
  value: string | number;
  /** Option label */
  label: ReactNode;
  /** Disabled state */
  disabled?: boolean;
}

export interface CheckboxProps extends EngineAwareProps {
  /** Checkbox size */
  size?: CheckboxSize;
  /** Color variant when checked */
  color?: CheckboxVariant;
  /** Border radius */
  radius?: CheckboxRadius;
  /** Label placement relative to checkbox */
  labelPlacement?: CheckboxLabelPlacement;
  /** Checked state (controlled) */
  checked?: boolean;
  /** Default checked state (uncontrolled) */
  defaultChecked?: boolean;
  /** Indeterminate state */
  indeterminate?: boolean;
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
}

export interface CheckboxGroupProps extends EngineAwareProps {
  /** Group size */
  size?: CheckboxSize;
  /** Color variant */
  color?: CheckboxVariant;
  /** Options array */
  options?: CheckboxOption[];
  /** Selected values (controlled) */
  value?: (string | number)[];
  /** Default selected values (uncontrolled) */
  defaultValue?: (string | number)[];
  /** Disabled state */
  disabled?: boolean;
  /** Layout direction */
  direction?: 'horizontal' | 'vertical';
  /** Spacing between items */
  spacing?: 'sm' | 'md' | 'lg';
  /** Change handler */
  onChange?: (values: (string | number)[]) => void;
  /** Children (Checkbox components) */
  children?: ReactNode;
  /** Additional CSS class */
  className?: string;
  /** Inline styles */
  style?: CSSProperties;
  /** Name attribute for forms */
  name?: string;
}

export const CHECKBOX_DEFAULTS = {
  size: 'md' as CheckboxSize,
  color: 'primary' as CheckboxVariant,
  radius: 'sm' as CheckboxRadius,
  labelPlacement: 'end' as CheckboxLabelPlacement,
  defaultChecked: false,
  indeterminate: false,
  disabled: false,
  required: false,
  error: false,
};

export const CHECKBOX_GROUP_DEFAULTS = {
  size: 'md' as CheckboxSize,
  color: 'primary' as CheckboxVariant,
  direction: 'vertical' as const,
  spacing: 'md' as const,
  disabled: false,
};

// Size mapping to CSS variables
export const SIZE_MAP: Record<CheckboxSize, string> = {
  xs: 'var(--checkbox-xs-size)',
  sm: 'var(--checkbox-sm-size)',
  md: 'var(--checkbox-md-size)',
  lg: 'var(--checkbox-lg-size)',
  xl: 'var(--checkbox-xl-size)',
};

// Numeric size values for calculations (e.g., checkmark sizing)
export const SIZE_MAP_NUMERIC: Record<CheckboxSize, number> = {
  xs: 14,
  sm: 16,
  md: 18,
  lg: 20,
  xl: 24,
};

// Color mapping
export const COLOR_MAP: Record<CheckboxVariant, { bg: string; border: string; check: string }> = {
  default: {
    bg: 'var(--color-neutral-600, #4b5563)',
    border: 'var(--color-neutral-600, #4b5563)',
    check: '#ffffff',
  },
  primary: {
    bg: 'var(--color-primary, #1890ff)',
    border: 'var(--color-primary, #1890ff)',
    check: '#ffffff',
  },
  secondary: {
    bg: 'var(--color-secondary, #6b7280)',
    border: 'var(--color-secondary, #6b7280)',
    check: '#ffffff',
  },
  success: {
    bg: 'var(--color-success, #52c41a)',
    border: 'var(--color-success, #52c41a)',
    check: '#ffffff',
  },
  warning: {
    bg: 'var(--color-warning, #faad14)',
    border: 'var(--color-warning, #faad14)',
    check: '#ffffff',
  },
  error: {
    bg: 'var(--color-error, #ff4d4f)',
    border: 'var(--color-error, #ff4d4f)',
    check: '#ffffff',
  },
};

// Radius mapping to CSS variables
export const RADIUS_MAP: Record<CheckboxRadius, string> = {
  none: 'var(--checkbox-radius-none)',
  sm: 'var(--checkbox-radius-sm)',
  md: 'var(--checkbox-radius-md)',
  lg: 'var(--checkbox-radius-lg)',
  full: 'var(--checkbox-radius-full)',
};
