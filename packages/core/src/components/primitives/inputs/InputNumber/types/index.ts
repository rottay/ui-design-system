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
 * - `InputNumberSize` - Size variant type (SizeType)
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
import type { SizeType, StatusType } from '../../../../../types/common';

export type InputNumberSize = SizeType;
export type InputNumberStatus = StatusType;

export interface InputNumberProps {
  /** Current value */
  value?: number | string | null;
  /** Default value */
  defaultValue?: number | string;
  /** Min value */
  min?: number;
  /** Max value */
  max?: number;
  /** Step increment */
  step?: number | string;
  /** Decimal precision */
  precision?: number;
  /** Whether the input is disabled */
  disabled?: boolean;
  /** Whether the input is read-only */
  readOnly?: boolean;
  /** Size of the input */
  size?: InputNumberSize;
  /** Status of the input */
  status?: InputNumberStatus;
  /** Prefix element */
  prefix?: ReactNode;
  /** Suffix element */
  suffix?: ReactNode;
  /** Addon before the input */
  addonBefore?: ReactNode;
  /** Addon after the input */
  addonAfter?: ReactNode;
  /** Placeholder text */
  placeholder?: string;
  /** Whether to show controls */
  controls?: boolean | { upIcon?: ReactNode; downIcon?: ReactNode };
  /** Whether to enable keyboard navigation */
  keyboard?: boolean;
  /** String mode for high precision */
  stringMode?: boolean;
  /** Custom formatter */
  formatter?: (value: string | number | undefined, info: { userTyping: boolean; input: string }) => string;
  /** Custom parser */
  parser?: (displayValue: string | undefined) => number | string;
  /** Decimal separator */
  decimalSeparator?: string;
  /** Callback when value changes */
  onChange?: (value: number | string | null) => void;
  /** Callback when pressing Enter */
  onPressEnter?: (e: KeyboardEvent<HTMLInputElement>) => void;
  /** Callback when step changes */
  onStep?: (value: number, info: { offset: number; type: 'up' | 'down' }) => void;
  /** Additional class name */
  className?: string;
  /** Additional styles */
  style?: CSSProperties;
  /** Auto focus on mount */
  autoFocus?: boolean;
  /** ID attribute */
  id?: string;
  /** Name attribute for forms */
  name?: string;
  /** Whether input is bordered */
  bordered?: boolean;
  /** Variant style */
  variant?: 'outlined' | 'borderless' | 'filled';
}

export const INPUT_NUMBER_DEFAULTS: Partial<InputNumberProps> = {
  size: 'default',
  step: 1,
  controls: true,
  keyboard: true,
  bordered: true,
  variant: 'outlined',
};
