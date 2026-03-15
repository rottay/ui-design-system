/**
 * @fileoverview Radio Types - Rottay Design System
 * @description Type definitions, interfaces, and constants for the Radio component.
 * Part of the Rottay Design System's input primitives collection.
 *
 * @remarks
 * This module provides comprehensive type definitions for the Radio component,
 * including all props, sizes, color variants, and group configuration.
 *
 * **Available Types:**
 * - `RadioProps` - Main component props interface
 * - `RadioSize` - Size variants (xs, sm, md, lg, xl)
 * - `RadioVariant` - Color variants (default, primary, secondary, success, warning, error)
 * - `RadioLabelPlacement` - Label position (start, end)
 * - `RadioGroupProps` - Props for Radio.Group compound component
 * - `RadioOption` - Option structure for group mode (includes description)
 *
 * **CSS Custom Properties:**
 * - Size: `--ds-radio-{size}-size` for radio dimensions
 * - Colors are mapped via COLOR_MAP to CSS variables
 *
 * **Key Differences from Checkbox Types:**
 * - RadioGroupProps uses single `value` instead of array
 * - RadioOption includes optional `description` field
 * - No indeterminate state (radios are always checked or unchecked)
 *
 * @example Using Types
 * ```tsx
 * import type { RadioProps, RadioSize, RadioOption } from '@rottay/design-system';
 *
 * // Typed options with descriptions
 * const options: RadioOption[] = [
 *   { value: 'free', label: 'Free Plan', description: 'Limited features' },
 *   { value: 'pro', label: 'Pro Plan', description: 'All features' },
 * ];
 *
 * // Custom radio wrapper
 * const MyRadio: React.FC<RadioProps> = (props) => {
 *   return <Radio {...props} />;
 * };
 * ```
 *
 * @example Using Constants
 * ```tsx
 * import { RADIO_DEFAULTS, SIZE_MAP, COLOR_MAP } from '@rottay/design-system';
 *
 * console.log(RADIO_DEFAULTS.size);  // 'md'
 * console.log(RADIO_DEFAULTS.color); // 'primary'
 * console.log(COLOR_MAP.success.bg); // 'var(--ds-color-success, #52c41a)'
 * ```
 *
 * @see {@link Radio} for the main component
 * @see {@link RadioGroup} for grouping radios
 * @module RadioTypes
 * @category Inputs
 * @package @rottay/design-system
 */

import type { EngineAwareProps } from '../../../../types';
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
  xs: 'var(--ds-radio-xs-size)',
  sm: 'var(--ds-radio-sm-size)',
  md: 'var(--ds-radio-md-size)',
  lg: 'var(--ds-radio-lg-size)',
  xl: 'var(--ds-radio-xl-size)',
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
    bg: 'var(--ds-color-neutral-600, #4b5563)',
    border: 'var(--ds-color-neutral-600, #4b5563)',
    dot: '#ffffff',
  },
  primary: {
    bg: 'var(--ds-color-primary-500, #1890ff)',
    border: 'var(--ds-color-primary-500, #1890ff)',
    dot: '#ffffff',
  },
  secondary: {
    bg: 'var(--ds-color-secondary-500, #6b7280)',
    border: 'var(--ds-color-secondary-500, #6b7280)',
    dot: '#ffffff',
  },
  success: {
    bg: 'var(--ds-color-success-500, #52c41a)',
    border: 'var(--ds-color-success-500, #52c41a)',
    dot: '#ffffff',
  },
  warning: {
    bg: 'var(--ds-color-warning-500, #faad14)',
    border: 'var(--ds-color-warning-500, #faad14)',
    dot: '#ffffff',
  },
  error: {
    bg: 'var(--ds-color-error-500, #ff4d4f)',
    border: 'var(--ds-color-error-500, #ff4d4f)',
    dot: '#ffffff',
  },
};
