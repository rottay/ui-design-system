/**
 * @fileoverview OTPInput Types - Rottay Design System
 * @description Type definitions for the OTPInput component.
 * Part of the Rottay Design System's input primitives collection.
 *
 * @module OTPInput/Types
 * @category Inputs
 * @package @rottay/design-system
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../../types';

/** Input type for OTP digits */
export type OTPInputType = 'numeric' | 'alphanumeric';

/** Size variants for OTPInput */
export type OTPInputSize = 'sm' | 'md' | 'lg';

/**
 * Props for the OTPInput component.
 * A one-time password / verification code input.
 */
export interface OTPInputProps extends EngineAwareProps {
  /** Number of OTP digits (default: 6) */
  length?: number;
  /** Current value */
  value?: string;
  /** Callback when value changes */
  onChange?: (value: string) => void;
  /** Callback when all digits are filled */
  onComplete?: (value: string) => void;
  /** Whether to auto-focus the first input on mount */
  autoFocus?: boolean;
  /** Input type restriction */
  type?: OTPInputType;
  /** Size variant */
  size?: OTPInputSize;
  /** Whether the input is disabled */
  disabled?: boolean;
  /** Error state */
  error?: boolean;
  /** Error message */
  errorMessage?: string;
  /** Mask the input (like password dots) */
  mask?: boolean;
  /** Name attribute for forms */
  name?: string;
  /** ID attribute prefix */
  id?: string;
}

/**
 * Default values for OTPInput component props.
 */
export const OTPINPUT_DEFAULTS = {
  length: 6,
  type: 'numeric' as OTPInputType,
  size: 'md' as OTPInputSize,
  disabled: false,
  error: false,
  mask: false,
  autoFocus: false,
};
