/**
 * Input - Core Interface
 * Shared types and defaults for all engine implementations
 */

import type { EngineAwareProps } from '../../../../../types';
import type { ReactNode, ChangeEvent, FocusEvent } from 'react';

export type InputSize = 'sm' | 'md' | 'lg';
export type InputVariant = 'outlined' | 'filled' | 'borderless';
export type InputStatus = 'default' | 'error' | 'warning' | 'success';

export interface InputProps extends EngineAwareProps {
  /** Input size */
  size?: InputSize;
  /** Visual variant */
  variant?: InputVariant;
  /** Validation status */
  status?: InputStatus;
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
  /** Maximum length */
  maxLength?: number;
  /** Prefix element */
  prefix?: ReactNode;
  /** Suffix element */
  suffix?: ReactNode;
  /** Allow clear button */
  allowClear?: boolean;
  /** Password visibility toggle */
  showPassword?: boolean;
  /** Input type */
  type?: 'text' | 'password' | 'email' | 'number' | 'tel' | 'url';
  /** Change handler */
  onChange?: (value: string, event: ChangeEvent<HTMLInputElement>) => void;
  /** Focus handler */
  onFocus?: (event: FocusEvent<HTMLInputElement>) => void;
  /** Blur handler */
  onBlur?: (event: FocusEvent<HTMLInputElement>) => void;
  /** Clear handler */
  onClear?: () => void;
  /** Press Enter handler */
  onPressEnter?: () => void;
  /** Additional CSS class */
  className?: string;
  /** Inline styles */
  style?: React.CSSProperties;
  /** Name attribute for forms */
  name?: string;
  /** ID attribute */
  id?: string;
  /** Autocomplete attribute */
  autoComplete?: string;
  /** Autofocus attribute */
  autoFocus?: boolean;
}

export const INPUT_DEFAULTS: Partial<InputProps> = {
  size: 'md',
  variant: 'outlined',
  status: 'default',
  type: 'text',
  disabled: false,
  readOnly: false,
  required: false,
  allowClear: false,
  showPassword: false,
};
