/**
 * @fileoverview PasswordInput Types - Rottay Design System
 * @description Type definitions for the PasswordInput component including size variants,
 * visual variants, password strength indicators, and visibility toggle configuration.
 *
 * @remarks
 * This module defines all TypeScript interfaces, types, and constants for the
 * PasswordInput component. These types are shared across all engine implementations.
 *
 * **Exported Types:**
 * - `PasswordInputProps` - Main component props interface
 * - `PasswordInputSize` - Size variant type (xs through xl)
 * - `PasswordInputVariant` - Visual variant type (outline, filled, flushed, unstyled)
 * - `PasswordStrengthLevel` - Strength indicator levels (weak, fair, good, strong)
 *
 * **Configuration Constants:**
 * - `PASSWORD_INPUT_DEFAULTS` - Default prop values
 * - `STRENGTH_COLORS` - Design-token-based colors for each strength level
 * - `STRENGTH_WIDTHS` - Progress bar widths for each strength level
 *
 * @example Type Usage
 * ```tsx
 * import type {
 *   PasswordInputProps,
 *   PasswordStrengthLevel,
 * } from '@rottay/design-system';
 *
 * function computeStrength(password: string): PasswordStrengthLevel {
 *   if (password.length >= 12) return 'strong';
 *   if (password.length >= 8) return 'good';
 *   if (password.length >= 4) return 'fair';
 *   return 'weak';
 * }
 * ```
 *
 * @see {@link PasswordInput} for the main component
 * @module PasswordInputTypes
 * @category Inputs
 * @package @rottay/design-system
 */

import type { EngineAwareProps } from '../../../../../foundation/contracts';
import type { ReactNode, CSSProperties, ChangeEvent, FocusEvent, KeyboardEvent } from 'react';

/**
 * Size variants for the PasswordInput component.
 * - `'xs'`: Extra-small for compact forms
 * - `'sm'`: Small for dense layouts
 * - `'md'`: Medium, the default size
 * - `'lg'`: Large for prominent inputs
 * - `'xl'`: Extra-large for hero-style forms
 */
export type PasswordInputSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

/**
 * Visual variant for the PasswordInput component.
 * - `'outline'`: Standard bordered input (default)
 * - `'filled'`: Filled background with no visible border
 * - `'flushed'`: Bottom border only, minimal style
 * - `'unstyled'`: No visual styling, fully custom
 */
export type PasswordInputVariant = 'outline' | 'filled' | 'flushed' | 'unstyled';

/**
 * Password strength levels for the strength indicator bar.
 * Each level maps to a specific color and progress width via
 * `STRENGTH_COLORS` and `STRENGTH_WIDTHS`.
 * - `'weak'`: 25% progress, error color
 * - `'fair'`: 50% progress, warning color
 * - `'good'`: 75% progress, primary color
 * - `'strong'`: 100% progress, success color
 */
export type PasswordStrengthLevel = 'weak' | 'fair' | 'good' | 'strong';

/**
 * Props for the PasswordInput component.
 *
 * A secure text input with built-in visibility toggle, optional strength indicator,
 * and customizable icons. Extends EngineAwareProps for multi-engine rendering.
 *
 * @example Basic usage
 * ```tsx
 * <PasswordInput
 *   placeholder="Enter password"
 *   onChange={(value) => setPassword(value)}
 * />
 * ```
 *
 * @example With strength indicator
 * ```tsx
 * <PasswordInput
 *   value={password}
 *   strengthIndicator
 *   strengthLevel={computeStrength(password)}
 *   onChange={(value) => setPassword(value)}
 * />
 * ```
 */
export interface PasswordInputProps extends EngineAwareProps {
  /** Size variant controlling height and font size of the input */
  size?: PasswordInputSize;
  /** Visual variant controlling the border and background style */
  variant?: PasswordInputVariant;
  /** Placeholder text shown when the input is empty */
  placeholder?: string;
  /** Current password value (controlled mode) */
  value?: string;
  /** Default password value (uncontrolled mode) */
  defaultValue?: string;
  /** Whether the input is disabled and non-interactive */
  disabled?: boolean;
  /** Whether the input is read-only (visible but not editable) */
  readOnly?: boolean;
  /** Whether the field is required for form validation */
  required?: boolean;
  /** Whether to display error state styling (red border) */
  error?: boolean;
  /** Error message text displayed below the input */
  errorMessage?: string;
  /** Maximum number of characters allowed */
  maxLength?: number;
  /** Whether to show the eye icon toggle for password visibility */
  showToggle?: boolean;
  /** Whether to render the strength indicator bar below the input */
  strengthIndicator?: boolean;
  /** Current strength level, controls the color and width of the strength bar */
  strengthLevel?: PasswordStrengthLevel;
  /**
   * Whether to announce an active Caps Lock key while the input is focused.
   * When a Caps Lock press is detected, a `role="status"` hint renders in the
   * field's message zone using the `passwordinput.caps_lock_on` catalog
   * entry; the hint is suppressed whenever `error` is set (the error state
   * always wins) and clears on blur.
   *
   * @default true
   * @remarks Implemented by the modern engine only; classic and rustic do
   * not detect Caps Lock yet (the axis is typed for all three, but only
   * modern renders the hint).
   */
  capsLockHint?: boolean;
  /** Custom icon rendered when the password is visible (eye-open state) */
  visibleIcon?: ReactNode;
  /** Custom icon rendered when the password is hidden (eye-closed state) */
  hiddenIcon?: ReactNode;
  /** Callback fired when the input value changes, receives value and native event */
  onChange?: (value: string, event: ChangeEvent<HTMLInputElement>) => void;
  /** Callback fired when the input receives focus */
  onFocus?: (event: FocusEvent<HTMLInputElement>) => void;
  /** Callback fired when the input loses focus */
  onBlur?: (event: FocusEvent<HTMLInputElement>) => void;
  /** Callback fired on any key press within the input */
  onKeyDown?: (event: KeyboardEvent<HTMLInputElement>) => void;
  /** Callback fired specifically when the Enter key is pressed */
  onPressEnter?: (event: KeyboardEvent<HTMLInputElement>) => void;
  /** Additional CSS class name for the root element */
  className?: string;
  /** Additional inline styles for the root element */
  style?: CSSProperties;
  /** HTML name attribute for form submission */
  name?: string;
  /** HTML id attribute for the input element */
  id?: string;
  /** HTML autocomplete attribute (e.g., 'current-password', 'new-password') */
  autoComplete?: string;
  /** Whether to auto-focus the input on mount */
  autoFocus?: boolean;
  /** ARIA label for accessibility when no visible label is present */
  'aria-label'?: string;
  /** Test identifier for automated testing frameworks */
  'data-testid'?: string;
}

/**
 * Design-token-based colors mapped to each password strength level.
 * Uses CSS custom properties with fallback hex values.
 */
export const STRENGTH_COLORS: Record<PasswordStrengthLevel, string> = {
  /** Error color for weak passwords */
  weak: 'var(--ds-color-error-500, #ff4d4f)',
  /** Warning color for fair passwords */
  fair: 'var(--ds-color-warning-500, #faad14)',
  /** Primary color for good passwords */
  good: 'var(--ds-color-primary-500, #1890ff)',
  /** Success color for strong passwords */
  strong: 'var(--ds-color-success-500, #52c41a)',
};

/**
 * Progress bar widths mapped to each password strength level.
 * Represents the visual fill percentage of the strength indicator bar.
 */
export const STRENGTH_WIDTHS: Record<PasswordStrengthLevel, string> = {
  /** 25% fill for weak */
  weak: '25%',
  /** 50% fill for fair */
  fair: '50%',
  /** 75% fill for good */
  good: '75%',
  /** 100% fill for strong */
  strong: '100%',
};

/**
 * Default values for PasswordInput props.
 * Used across all engine implementations for consistency.
 */
export const PASSWORD_INPUT_DEFAULTS = {
  /** Medium size by default */
  size: 'md' as PasswordInputSize,
  /** Outlined variant by default */
  variant: 'outline' as PasswordInputVariant,
  /** Not disabled by default */
  disabled: false,
  /** Editable by default */
  readOnly: false,
  /** Not required by default */
  required: false,
  /** No error state by default */
  error: false,
  /** Visibility toggle shown by default */
  showToggle: true,
  /** Strength indicator hidden by default */
  strengthIndicator: false,
  /** Default autocomplete hint for password managers */
  autoComplete: 'current-password',
  /** Caps Lock hint shown by default */
  capsLockHint: true,
};
