/**
 * @fileoverview Toggle Types - Rottay Design System
 * @description Type definitions for the Toggle component.
 * Part of the Rottay Design System's input primitives collection.
 *
 * @remarks
 * This module defines all TypeScript interfaces, types, and constants for the
 * Toggle component. These types are shared across all engine implementations.
 *
 * **Exported Types:**
 * - `ToggleProps` - Main component props interface
 * - `ToggleSize` - Size variant type ('xs' | 'sm' | 'md' | 'lg' | 'xl')
 * - `ToggleVariant` - Color variant type ('default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error')
 * - `ToggleLabelPlacement` - Label position type ('start' | 'end')
 *
 * **Configuration Constants:**
 * - `TOGGLE_DEFAULTS` - Default prop values
 * - `SIZE_MAP` - CSS variable mappings per size
 * - `SIZE_VALUES` - Numeric values for calculations
 * - `COLOR_MAP` - Color values for each variant
 *
 * @example Type Usage
 * ```tsx
 * import type { ToggleProps, ToggleSize, ToggleVariant } from '@rottay/design-system';
 *
 * interface SettingToggleProps extends Omit<ToggleProps, 'size'> {
 *   setting: string;
 *   size?: ToggleSize;
 * }
 * ```
 *
 * @see {@link Toggle} for the main component
 * @module ToggleTypes
 * @category Inputs
 * @package @rottay/design-system
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
  xs: { width: 'var(--ds-toggle-xs-width)', height: 'var(--ds-toggle-xs-height)', dot: 'var(--ds-toggle-xs-dot)' },
  sm: { width: 'var(--ds-toggle-sm-width)', height: 'var(--ds-toggle-sm-height)', dot: 'var(--ds-toggle-sm-dot)' },
  md: { width: 'var(--ds-toggle-md-width)', height: 'var(--ds-toggle-md-height)', dot: 'var(--ds-toggle-md-dot)' },
  lg: { width: 'var(--ds-toggle-lg-width)', height: 'var(--ds-toggle-lg-height)', dot: 'var(--ds-toggle-lg-dot)' },
  xl: { width: 'var(--ds-toggle-xl-width)', height: 'var(--ds-toggle-xl-height)', dot: 'var(--ds-toggle-xl-dot)' },
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
  default: { bg: 'var(--ds-color-neutral-300, #d9d9d9)', bgChecked: 'var(--ds-color-primary-500, #1890ff)', border: 'var(--ds-color-neutral-300, #d9d9d9)' },
  primary: { bg: 'var(--ds-color-neutral-300, #d9d9d9)', bgChecked: 'var(--ds-color-primary-500, #1890ff)', border: 'var(--ds-color-primary-500, #1890ff)' },
  secondary: { bg: 'var(--ds-color-neutral-300, #d9d9d9)', bgChecked: 'var(--ds-color-secondary-500, #6c757d)', border: 'var(--ds-color-secondary-500, #6c757d)' },
  success: { bg: 'var(--ds-color-neutral-300, #d9d9d9)', bgChecked: 'var(--ds-color-success-500, #52c41a)', border: 'var(--ds-color-success-500, #52c41a)' },
  warning: { bg: 'var(--ds-color-neutral-300, #d9d9d9)', bgChecked: 'var(--ds-color-warning-500, #faad14)', border: 'var(--ds-color-warning-500, #faad14)' },
  error: { bg: 'var(--ds-color-neutral-300, #d9d9d9)', bgChecked: 'var(--ds-color-error-500, #ff4d4f)', border: 'var(--ds-color-error-500, #ff4d4f)' },
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
