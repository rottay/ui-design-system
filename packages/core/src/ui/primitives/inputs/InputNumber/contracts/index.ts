/**
 * @fileoverview InputNumber Types - Rottay Design System
 * @description Type definitions for the InputNumber component.
 * Part of the Rottay Design System's input primitives collection.
 *
 * @remarks
 * This module defines all TypeScript interfaces, types, and constants
 * for the InputNumber component. These types are shared across all engines.
 *
 * **Exported Types:**
 * - `InputNumberProps` - Main component props interface
 * - `InputNumberSize` - Size variant type ('sm' | 'md' | 'lg', legacy 'small' | 'middle' | 'large' | 'default' accepted for one release)
 * - `InputNumberStatus` - Validation status type (StatusType)
 *
 * **Configuration Constants:**
 * - `INPUT_NUMBER_DEFAULTS` - Default prop values
 *
 * **Key Props:**
 * - `min` / `max` - Value bounds
 * - `step` - Increment/decrement amount
 * - `precision` - Decimal places
 * - `formatter` / `parser` - Custom value display
 * - `stringMode` - High precision mode
 * - `controls` - Show/hide step buttons
 *
 * @example Type Usage
 * ```tsx
 * import type { InputNumberProps } from '@rottay/design-system';
 *
 * interface QuantityInputProps extends Omit<InputNumberProps, 'stringMode'> {
 *   label: string;
 * }
 * ```
 *
 * @see {@link InputNumber} for the main component
 * @module InputNumberTypes
 * @category Inputs
 * @package @rottay/design-system
 */

import type { ReactNode, CSSProperties, KeyboardEvent } from 'react';
import type { LegacySizeAlias, Size, StatusType } from '../../../../../foundation/contracts/kernel/common';

/**
 * Size variants for the InputNumber input.
 * @remarks Canonical values are the {@link Size} subset `'sm' | 'md' | 'lg'`. The legacy Ant
 * Design-style spellings (`'small' | 'middle' | 'large' | 'default'`) are accepted for one
 * release via {@link LegacySizeAlias} and are deprecated; prefer the canonical spelling in new
 * code.
 */
export type InputNumberSize = Extract<Size, 'sm' | 'md' | 'lg'> | LegacySizeAlias;

/**
 * Validation status for the InputNumber input.
 * Inherits from the shared StatusType: 'error' | 'warning'.
 */
export type InputNumberStatus = StatusType;

/**
 * Props for the InputNumber component.
 *
 * Provides a numeric input with optional step controls, precision handling,
 * custom formatting/parsing, and high-precision string mode for financial values.
 *
 * @example Basic usage
 * ```tsx
 * <InputNumber
 *   min={0}
 *   max={100}
 *   defaultValue={50}
 *   onChange={(value) => console.log(value)}
 * />
 * ```
 *
 * @example Currency formatting with precision
 * ```tsx
 * <InputNumber
 *   prefix="$"
 *   precision={2}
 *   min={0}
 *   step={0.01}
 *   formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
 *   parser={(value) => value!.replace(/\$\s?|(,*)/g, '')}
 * />
 * ```
 */
export interface InputNumberProps {
  /** Current value (controlled). Accepts number, string (in stringMode), or null for empty. */
  value?: number | string | null;
  /** Default value for uncontrolled usage */
  defaultValue?: number | string;
  /** Minimum allowed value. Input will not go below this. */
  min?: number;
  /** Maximum allowed value. Input will not exceed this. */
  max?: number;
  /** Step increment/decrement amount when using controls or keyboard arrows. Accepts string in stringMode. */
  step?: number | string;
  /** Number of decimal places to display. Value is rounded to this precision. */
  precision?: number;
  /** Whether the input is disabled */
  disabled?: boolean;
  /** Whether the input is read-only (visible but not editable) */
  readOnly?: boolean;
  /** Size of the input field */
  size?: InputNumberSize;
  /** Validation status indicator (error or warning border) */
  status?: InputNumberStatus;
  /** Element rendered before the input value (e.g., currency symbol) */
  prefix?: ReactNode;
  /** Element rendered after the input value (e.g., unit label) */
  suffix?: ReactNode;
  /** Addon element rendered before the input with a separator border */
  addonBefore?: ReactNode;
  /** Addon element rendered after the input with a separator border */
  addonAfter?: ReactNode;
  /** Placeholder text shown when value is empty */
  placeholder?: string;
  /** Whether to show increment/decrement step controls. Pass an object to customize icons. */
  controls?: boolean | { upIcon?: ReactNode; downIcon?: ReactNode };
  /** Whether to enable keyboard up/down arrow key navigation for stepping */
  keyboard?: boolean;
  /** Enable string mode for high-precision decimal values (e.g., financial calculations). Value and step become strings. */
  stringMode?: boolean;
  /** Custom display formatter. Receives the raw value and typing info, returns formatted string. */
  formatter?: (value: string | number | undefined, info: { userTyping: boolean; input: string }) => string;
  /** Custom parser that converts the formatted display string back to a numeric value */
  parser?: (displayValue: string | undefined) => number | string;
  /** Custom decimal separator character (e.g., ',' for European locales) */
  decimalSeparator?: string;
  /** Callback fired when the value changes */
  onChange?: (value: number | string | null) => void;
  /** Callback fired when the Enter key is pressed */
  onPressEnter?: (e: KeyboardEvent<HTMLInputElement>) => void;
  /** Callback fired when value changes via step controls, receives new value and step direction info */
  onStep?: (value: number, info: { offset: number; type: 'up' | 'down' }) => void;
  /** Additional CSS class name for the root element */
  className?: string;
  /** Additional inline styles for the root element */
  style?: CSSProperties;
  /** Whether to auto-focus the input on mount */
  autoFocus?: boolean;
  /** HTML id attribute for the input element */
  id?: string;
  /** HTML name attribute for form submission */
  name?: string;
  /** Whether to show a border around the input */
  bordered?: boolean;
  /** Visual variant of the input field */
  variant?: 'outlined' | 'borderless' | 'filled';
  /**
   * Accessible name for the input when no surrounding label/FormField
   * provides one. Without it, a standalone InputNumber fails the axe `label`
   * rule (critical).
   */
  'aria-label'?: string;
}

/**
 * Default values for InputNumber props.
 * Used across all engine implementations for consistency.
 */
export const INPUT_NUMBER_DEFAULTS: Partial<InputNumberProps> = {
  /** Default size variant */
  size: 'default',
  /** Default step increment */
  step: 1,
  /** Show step controls by default */
  controls: true,
  /** Keyboard navigation enabled by default */
  keyboard: true,
  /** Show border by default */
  bordered: true,
  /** Default input variant */
  variant: 'outlined',
};
