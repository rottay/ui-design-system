/**
 * InputNumber Component Types
 *
 * Unified type definitions for InputNumber component across all engines.
 * These types are implemented by titan (AntD), hermes (DaisyUI), and apollo (HTML+Tailwind).
 */

import type { CSSProperties, FocusEvent, KeyboardEvent, ReactNode } from 'react';

/**
 * Base InputNumber Props
 *
 * Common properties supported by ALL engines.
 * All engines MUST implement these props.
 */
export interface InputNumberBaseProps {
  /** Input value (controlled) */
  value?: number | null;

  /** Default value (uncontrolled) */
  defaultValue?: number | null;

  /** Minimum value */
  min?: number;

  /** Maximum value */
  max?: number;

  /** Step increment/decrement value */
  step?: number | string;

  /** Change handler - receives numeric value or null */
  onChange?: (value: number | null) => void;

  /** Focus handler */
  onFocus?: (e: FocusEvent<HTMLInputElement>) => void;

  /** Blur handler */
  onBlur?: (e: FocusEvent<HTMLInputElement>) => void;

  /** Disabled state */
  disabled?: boolean;

  /** Read-only state */
  readOnly?: boolean;

  /** Placeholder text */
  placeholder?: string;

  /** Custom CSS classes */
  className?: string;

  /** Inline styles */
  style?: CSSProperties;

  /** Input ID */
  id?: string;

  /** Input name */
  name?: string;

  /** Auto focus on mount */
  autoFocus?: boolean;
}

/**
 * InputNumber Props
 *
 * Extended properties with engine-specific features.
 * Some props may be ignored by certain engines.
 */
export interface InputNumberProps extends InputNumberBaseProps {
  /**
   * Input size
   * - titan: large, middle, small
   * - hermes: xs, sm, md, lg (mapped)
   * - apollo: small, middle, large
   */
  size?: 'small' | 'middle' | 'large';

  /**
   * Validation status
   * - titan: full support with styling
   * - hermes: maps to color variants
   * - apollo: full support with border colors
   */
  status?: 'error' | 'warning';

  /**
   * Number precision (decimal places)
   * - titan: full support
   * - hermes: limited support
   * - apollo: full support
   */
  precision?: number;

  /**
   * Decimal separator character
   * - titan: full support
   * - hermes: not supported
   * - apollo: full support
   * @default "."
   */
  decimalSeparator?: string;

  /**
   * Format display value
   * - titan: full support
   * - hermes: not supported
   * - apollo: full support
   * @engine-specific May not work in all engines
   */
  formatter?: (value: number | string | undefined) => string;

  /**
   * Parse formatted value back to number
   * - titan: full support
   * - hermes: not supported
   * - apollo: full support
   * @engine-specific May not work in all engines
   */
  parser?: (value: string | undefined) => number | string;

  /**
   * Show step control buttons
   * - titan: full support
   * - hermes: custom implementation
   * - apollo: full support
   * @default true
   */
  controls?: boolean | { upIcon?: ReactNode; downIcon?: ReactNode };

  /**
   * Enable keyboard navigation
   * - titan: full support
   * - hermes: native behavior
   * - apollo: full support
   * @default true
   */
  keyboard?: boolean;

  /**
   * Prefix icon/element
   * - titan: full support
   * - hermes: limited support
   * - apollo: full support
   * @engine-specific May have different positioning in some engines
   */
  prefix?: ReactNode;

  /**
   * Suffix icon/element
   * - titan: full support
   * - hermes: limited support
   * - apollo: full support
   * @engine-specific May have different positioning in some engines
   */
  suffix?: ReactNode;

  /**
   * Addon before input
   * - titan: full support
   * - hermes: not supported
   * - apollo: full support
   * @engine-specific Only in titan and apollo
   */
  addonBefore?: ReactNode;

  /**
   * Addon after input
   * - titan: full support
   * - hermes: not supported
   * - apollo: full support
   * @engine-specific Only in titan and apollo
   */
  addonAfter?: ReactNode;

  /**
   * Enter key press handler
   * Supported by all engines
   */
  onPressEnter?: (e: KeyboardEvent<HTMLInputElement>) => void;

  /**
   * Step handler - fires when step buttons clicked
   * - titan: full support
   * - hermes: custom implementation
   * - apollo: full support
   */
  onStep?: (value: number, info: { offset: number; type: 'up' | 'down' }) => void;

  /**
   * String mode for large numbers
   * - titan: full support
   * - hermes: not supported
   * - apollo: partial support
   * @default false
   */
  stringMode?: boolean;

  /**
   * Controls position
   * - titan: not supported (always right)
   * - hermes: not applicable
   * - apollo: not supported
   * @engine-specific titan specific but not applicable
   */
  controls_position?: 'top' | 'bottom';
}
