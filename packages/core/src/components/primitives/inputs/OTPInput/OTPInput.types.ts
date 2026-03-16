/**
 * @fileoverview OTPInput Types - Rottay Design System
 * @description Type definitions for the OTPInput (one-time password) component.
 * Part of the Rottay Design System's input primitives collection.
 *
 * @remarks
 * This module defines all TypeScript interfaces, types, and constants
 * for the OTPInput component. These types are shared across all engines.
 *
 * **Exported Types:**
 * - `OTPInputProps` - Main component props interface
 * - `OTPInputType` - Input restriction type (numeric or alphanumeric)
 * - `OTPInputSize` - Size variant type
 *
 * **Configuration Constants:**
 * - `OTPINPUT_DEFAULTS` - Default prop values
 *
 * **Key Features:**
 * - Auto-advance: Focus moves to next field on input
 * - Auto-complete: `onComplete` fires when all fields are filled
 * - Paste support: Pasting a full code distributes digits across fields
 * - Masking: Optional password-dot masking for sensitive codes
 *
 * @example Type Usage
 * ```tsx
 * import type { OTPInputProps, OTPInputType } from '@rottay/design-system';
 *
 * interface VerificationCodeProps extends Omit<OTPInputProps, 'mask'> {
 *   label: string;
 * }
 * ```
 *
 * @see {@link OTPInput} for the main component
 * @module OTPInput/Types
 * @category Inputs
 * @package @rottay/design-system
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../contracts';

/**
 * Input type restriction for OTP fields.
 * - `'numeric'`: Only digits 0-9 are accepted
 * - `'alphanumeric'`: Letters and digits are accepted
 */
export type OTPInputType = 'numeric' | 'alphanumeric';

/**
 * Size variants for the OTPInput component.
 * - `'sm'`: Compact size for tight layouts
 * - `'md'`: Default size for most use cases
 * - `'lg'`: Larger size for prominent verification flows
 */
export type OTPInputSize = 'sm' | 'md' | 'lg';

/**
 * Props for the OTPInput component.
 *
 * Renders a series of individual input fields for entering one-time passwords
 * or verification codes. Supports auto-advance between fields, paste handling,
 * and optional masking.
 *
 * @example Basic verification code
 * ```tsx
 * <OTPInput
 *   length={6}
 *   autoFocus
 *   onComplete={(code) => verifyCode(code)}
 * />
 * ```
 *
 * @example Masked alphanumeric with error state
 * ```tsx
 * <OTPInput
 *   length={4}
 *   type="alphanumeric"
 *   mask
 *   error={isInvalid}
 *   errorMessage="Invalid code. Please try again."
 *   onChange={(value) => setValue(value)}
 * />
 * ```
 */
export interface OTPInputProps extends EngineAwareProps {
  /** Number of OTP input fields to render (default: 6) */
  length?: number;
  /** Current value as a concatenated string of all digits/characters (controlled) */
  value?: string;
  /** Callback fired on each character input, receives the full concatenated value */
  onChange?: (value: string) => void;
  /** Callback fired when all fields are filled, receives the complete code string */
  onComplete?: (value: string) => void;
  /** Whether to auto-focus the first input field on mount */
  autoFocus?: boolean;
  /** Input type restriction: 'numeric' for digits only, 'alphanumeric' for letters and digits */
  type?: OTPInputType;
  /** Size variant controlling the dimensions of each input field */
  size?: OTPInputSize;
  /** Whether all input fields are disabled */
  disabled?: boolean;
  /** Whether to display the error state styling on all fields */
  error?: boolean;
  /** Error message text displayed below the input fields */
  errorMessage?: string;
  /** Whether to mask input values with dots (like a password field) */
  mask?: boolean;
  /** HTML name attribute prefix for form submission (fields are named `{name}-0`, `{name}-1`, etc.) */
  name?: string;
  /** HTML id attribute prefix for the input fields (fields get `{id}-0`, `{id}-1`, etc.) */
  id?: string;
}

/**
 * Default values for OTPInput component props.
 * Used across all engine implementations for consistency.
 */
export const OTPINPUT_DEFAULTS = {
  /** Six-digit code by default */
  length: 6,
  /** Numeric input only by default */
  type: 'numeric' as OTPInputType,
  /** Medium size by default */
  size: 'md' as OTPInputSize,
  /** Not disabled by default */
  disabled: false,
  /** No error state by default */
  error: false,
  /** Input visible (not masked) by default */
  mask: false,
  /** No auto-focus by default */
  autoFocus: false,
};
