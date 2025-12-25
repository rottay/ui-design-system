/**
 * Radio - Core Interface
 * Shared types and defaults for all engine implementations
 */

import type { EngineAwareProps } from '../../../../../types';
import type { ReactNode, ChangeEvent } from 'react';

export type RadioSize = 'sm' | 'md' | 'lg';
export type RadioVariant = 'default' | 'outlined' | 'filled';

export interface RadioOption {
  /** Option value */
  value: string | number;
  /** Option label */
  label: ReactNode;
  /** Disabled state */
  disabled?: boolean;
}

export interface RadioProps extends EngineAwareProps {
  /** Radio size */
  size?: RadioSize;
  /** Visual variant */
  variant?: RadioVariant;
  /** Checked state (controlled) */
  checked?: boolean;
  /** Default checked state (uncontrolled) */
  defaultChecked?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Label text */
  label?: ReactNode;
  /** Error state */
  error?: boolean;
  /** Change handler */
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  /** Additional CSS class */
  className?: string;
  /** Inline styles */
  style?: React.CSSProperties;
  /** Name attribute for forms (required for radio groups) */
  name?: string;
  /** ID attribute */
  id?: string;
  /** Value attribute */
  value?: string | number;
  /** Autofocus attribute */
  autoFocus?: boolean;
}

export interface RadioGroupProps extends EngineAwareProps {
  /** Group size */
  size?: RadioSize;
  /** Visual variant */
  variant?: RadioVariant;
  /** Options array */
  options?: RadioOption[];
  /** Selected value (controlled) */
  value?: string | number;
  /** Default selected value (uncontrolled) */
  defaultValue?: string | number;
  /** Disabled state */
  disabled?: boolean;
  /** Layout direction */
  direction?: 'horizontal' | 'vertical';
  /** Change handler */
  onChange?: (value: string | number) => void;
  /** Additional CSS class */
  className?: string;
  /** Inline styles */
  style?: React.CSSProperties;
  /** Name attribute for forms */
  name?: string;
}

export const RADIO_DEFAULTS: Partial<RadioProps> = {
  size: 'md',
  variant: 'default',
  checked: undefined,
  defaultChecked: false,
  disabled: false,
  error: false,
};

export const RADIO_GROUP_DEFAULTS: Partial<RadioGroupProps> = {
  size: 'md',
  variant: 'default',
  disabled: false,
  direction: 'vertical',
};
