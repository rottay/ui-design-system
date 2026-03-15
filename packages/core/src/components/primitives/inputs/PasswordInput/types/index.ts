/**
 * @fileoverview PasswordInput Types - Rottay Design System
 * @description Type definitions for the PasswordInput component.
 * Part of the Rottay Design System's input primitives collection.
 *
 * @remarks
 * This module defines all TypeScript interfaces, types, and constants for the
 * PasswordInput component. These types are shared across all engine implementations.
 *
 * @module PasswordInputTypes
 * @category Inputs
 * @package @rottay/design-system
 */

import type { EngineAwareProps } from '../../../../../types';
import type { ReactNode, CSSProperties, ChangeEvent, FocusEvent, KeyboardEvent } from 'react';

export type PasswordInputSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export type PasswordInputVariant = 'outline' | 'filled' | 'flushed' | 'unstyled';

export type PasswordStrengthLevel = 'weak' | 'fair' | 'good' | 'strong';

export interface PasswordInputProps extends EngineAwareProps {
  /** Input size */
  size?: PasswordInputSize;
  /** Visual variant */
  variant?: PasswordInputVariant;
  /** Placeholder text */
  placeholder?: string;
  /** Current value (controlled) */
  value?: string;
  /** Default value (uncontrolled) */
  defaultValue?: string;
  /** Disabled state */
  disabled?: boolean;
  /** Read-only state */
  readOnly?: boolean;
  /** Required field */
  required?: boolean;
  /** Error state */
  error?: boolean;
  /** Error message to display */
  errorMessage?: string;
  /** Maximum length */
  maxLength?: number;
  /** Whether to show the visibility toggle button */
  showToggle?: boolean;
  /** Whether to show the strength indicator bar */
  strengthIndicator?: boolean;
  /** Current password strength level */
  strengthLevel?: PasswordStrengthLevel;
  /** Custom icon when password is visible */
  visibleIcon?: ReactNode;
  /** Custom icon when password is hidden */
  hiddenIcon?: ReactNode;
  /** Change handler */
  onChange?: (value: string, event: ChangeEvent<HTMLInputElement>) => void;
  /** Focus handler */
  onFocus?: (event: FocusEvent<HTMLInputElement>) => void;
  /** Blur handler */
  onBlur?: (event: FocusEvent<HTMLInputElement>) => void;
  /** KeyDown handler */
  onKeyDown?: (event: KeyboardEvent<HTMLInputElement>) => void;
  /** Press Enter handler */
  onPressEnter?: (event: KeyboardEvent<HTMLInputElement>) => void;
  /** Additional CSS class */
  className?: string;
  /** Inline styles */
  style?: CSSProperties;
  /** Name attribute for forms */
  name?: string;
  /** ID attribute */
  id?: string;
  /** Autocomplete attribute */
  autoComplete?: string;
  /** Autofocus attribute */
  autoFocus?: boolean;
  /** ARIA label */
  'aria-label'?: string;
  /** Data test id */
  'data-testid'?: string;
}

export const STRENGTH_COLORS: Record<PasswordStrengthLevel, string> = {
  weak: 'var(--ds-color-error-500, #ff4d4f)',
  fair: 'var(--ds-color-warning-500, #faad14)',
  good: 'var(--ds-color-primary-500, #1890ff)',
  strong: 'var(--ds-color-success-500, #52c41a)',
};

export const STRENGTH_WIDTHS: Record<PasswordStrengthLevel, string> = {
  weak: '25%',
  fair: '50%',
  good: '75%',
  strong: '100%',
};

export const PASSWORD_INPUT_DEFAULTS = {
  size: 'md' as PasswordInputSize,
  variant: 'outline' as PasswordInputVariant,
  disabled: false,
  readOnly: false,
  required: false,
  error: false,
  showToggle: true,
  strengthIndicator: false,
  autoComplete: 'current-password',
};
