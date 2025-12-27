/**
 * Input - Core Interface
 * Shared types and defaults for all engine implementations
 */

'use client';

import type { EngineAwareProps } from '../../../../../types';
import type { ReactNode, ChangeEvent, FocusEvent, KeyboardEvent } from 'react';

export type InputSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type InputVariant = 'outline' | 'filled' | 'flushed' | 'unstyled';
export type InputStatus = 'default' | 'error' | 'warning' | 'success';
export type InputType = 'text' | 'password' | 'email' | 'number' | 'tel' | 'url' | 'search';

export interface InputProps extends EngineAwareProps {
  /** Input size */
  size?: InputSize;
  /** Visual variant */
  variant?: InputVariant;
  /** Validation status */
  status?: InputStatus;
  /** Input HTML type */
  type?: InputType;
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
  /** Minimum length */
  minLength?: number;
  /** Prefix element */
  prefix?: ReactNode;
  /** Suffix element */
  suffix?: ReactNode;
  /** Allow clear button */
  clearable?: boolean;
  /** Show character count (requires maxLength) */
  showCount?: boolean;
  /** Change handler */
  onChange?: (value: string, event: ChangeEvent<HTMLInputElement>) => void;
  /** Focus handler */
  onFocus?: (event: FocusEvent<HTMLInputElement>) => void;
  /** Blur handler */
  onBlur?: (event: FocusEvent<HTMLInputElement>) => void;
  /** KeyDown handler */
  onKeyDown?: (event: KeyboardEvent<HTMLInputElement>) => void;
  /** Clear handler */
  onClear?: () => void;
  /** Press Enter handler */
  onPressEnter?: (event: KeyboardEvent<HTMLInputElement>) => void;
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
  /** ARIA label */
  'aria-label'?: string;
  /** ARIA described by */
  'aria-describedby'?: string;
  /** Data test id */
  'data-testid'?: string;
}

export interface InputGroupProps {
  /** Group children (Input + addons) */
  children: ReactNode;
  /** Size applied to all children */
  size?: InputSize;
  /** Whether the group is compact (no gaps) */
  compact?: boolean;
  /** Additional CSS class */
  className?: string;
  /** Inline styles */
  style?: React.CSSProperties;
}

export interface InputAddonProps {
  /** Addon content */
  children: ReactNode;
  /** Position of the addon */
  position?: 'before' | 'after';
  /** Size of the addon */
  size?: InputSize;
  /** Background style */
  variant?: 'default' | 'transparent';
  /** Additional CSS class */
  className?: string;
  /** Inline styles */
  style?: React.CSSProperties;
}

export const INPUT_DEFAULTS = {
  size: 'md' as const,
  variant: 'outline' as const,
  status: 'default' as const,
  type: 'text' as const,
  disabled: false,
  readOnly: false,
  required: false,
  error: false,
  clearable: false,
  showCount: false,
};

// Size mapping to CSS variables (references tokens from tokens/css/components/input.css)
export const SIZE_MAP = {
  xs: { height: 'var(--input-xs-height)', paddingX: 'var(--input-xs-padding-x)', fontSize: 'var(--input-xs-font-size)' },
  sm: { height: 'var(--input-sm-height)', paddingX: 'var(--input-sm-padding-x)', fontSize: 'var(--input-sm-font-size)' },
  md: { height: 'var(--input-md-height)', paddingX: 'var(--input-md-padding-x)', fontSize: 'var(--input-md-font-size)' },
  lg: { height: 'var(--input-lg-height)', paddingX: 'var(--input-lg-padding-x)', fontSize: 'var(--input-lg-font-size)' },
  xl: { height: 'var(--input-xl-height)', paddingX: 'var(--input-xl-padding-x)', fontSize: 'var(--input-xl-font-size)' },
};

// Ant Design size mapping
export const ANT_SIZE_MAP = {
  xs: 'small' as const,
  sm: 'small' as const,
  md: 'middle' as const,
  lg: 'large' as const,
  xl: 'large' as const,
};

// DaisyUI size mapping
export const DAISY_SIZE_MAP = {
  xs: 'input-xs',
  sm: 'input-sm',
  md: 'input-md',
  lg: 'input-lg',
  xl: 'input-lg', // DaisyUI doesn't have xl
};

/**
 * Input.Password props
 */
export interface InputPasswordProps extends InputProps {
  /** Whether to show the visibility toggle button */
  visibilityToggle?: boolean;
  /** Custom icon when password is visible */
  visibleIcon?: React.ReactNode;
  /** Custom icon when password is hidden */
  hiddenIcon?: React.ReactNode;
}

/**
 * Input.Search props
 */
export interface InputSearchProps extends InputProps {
  /** Search handler */
  onSearch?: (value: string) => void;
  /** Loading state */
  loading?: boolean;
  /** Whether to show the search button */
  showSearchButton?: boolean;
  /** Custom search button text */
  searchButtonText?: React.ReactNode;
}

/**
 * Input.TextArea props
 */
export interface InputTextAreaProps extends Omit<InputProps, 'type' | 'prefix' | 'suffix' | 'clearable'> {
  /** Number of rows */
  rows?: number;
  /** Whether the textarea is resizable */
  resize?: boolean;
}
