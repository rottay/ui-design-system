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

// Size mapping to pixel values (matches CSS tokens)
export const SIZE_MAP = {
  xs: { height: 24, paddingX: 8, fontSize: 12 },
  sm: { height: 32, paddingX: 10, fontSize: 13 },
  md: { height: 40, paddingX: 12, fontSize: 14 },
  lg: { height: 48, paddingX: 14, fontSize: 16 },
  xl: { height: 56, paddingX: 16, fontSize: 18 },
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
