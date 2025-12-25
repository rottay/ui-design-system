/**
 * Checkbox - Core Interface
 * Shared types and defaults for all engine implementations
 */

import type { EngineAwareProps } from '../../../../../types';
import type { ReactNode, ChangeEvent } from 'react';

export type CheckboxSize = 'sm' | 'md' | 'lg';
export type CheckboxVariant = 'default' | 'outlined' | 'filled';

export interface CheckboxOption {
  /** Option value */
  value: string | number;
  /** Option label */
  label: ReactNode;
  /** Disabled state */
  disabled?: boolean;
}

export interface CheckboxProps extends EngineAwareProps {
  /** Checkbox size */
  size?: CheckboxSize;
  /** Visual variant */
  variant?: CheckboxVariant;
  /** Checked state (controlled) */
  checked?: boolean;
  /** Default checked state (uncontrolled) */
  defaultChecked?: boolean;
  /** Indeterminate state */
  indeterminate?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Label text */
  label?: ReactNode;
  /** Error state */
  error?: boolean;
  /** Change handler */
  onChange?: (checked: boolean, event: ChangeEvent<HTMLInputElement>) => void;
  /** Additional CSS class */
  className?: string;
  /** Inline styles */
  style?: React.CSSProperties;
  /** Name attribute for forms */
  name?: string;
  /** ID attribute */
  id?: string;
  /** Value attribute */
  value?: string | number;
  /** Autofocus attribute */
  autoFocus?: boolean;
}

export interface CheckboxGroupProps extends EngineAwareProps {
  /** Group size */
  size?: CheckboxSize;
  /** Visual variant */
  variant?: CheckboxVariant;
  /** Options array */
  options?: CheckboxOption[];
  /** Selected values (controlled) */
  value?: (string | number)[];
  /** Default selected values (uncontrolled) */
  defaultValue?: (string | number)[];
  /** Disabled state */
  disabled?: boolean;
  /** Change handler */
  onChange?: (values: (string | number)[]) => void;
  /** Additional CSS class */
  className?: string;
  /** Inline styles */
  style?: React.CSSProperties;
  /** Name attribute for forms */
  name?: string;
}

export const CHECKBOX_DEFAULTS: Partial<CheckboxProps> = {
  size: 'md',
  variant: 'default',
  checked: undefined,
  defaultChecked: false,
  indeterminate: false,
  disabled: false,
  error: false,
};

export const CHECKBOX_GROUP_DEFAULTS: Partial<CheckboxGroupProps> = {
  size: 'md',
  variant: 'default',
  disabled: false,
};
