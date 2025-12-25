/**
 * Toggle - Core Interface
 * Shared types and defaults for all engine implementations
 */

import type { EngineAwareProps } from '../../../../../types';
import type { ReactNode } from 'react';

export type ToggleSize = 'sm' | 'md' | 'lg';

export interface ToggleProps extends EngineAwareProps {
  /** Toggle size */
  size?: ToggleSize;
  /** Checked state (controlled) */
  checked?: boolean;
  /** Default checked state (uncontrolled) */
  defaultChecked?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Required field */
  required?: boolean;
  /** Loading state */
  loading?: boolean;
  /** Label text */
  label?: ReactNode;
  /** Checked label (when toggle is on) */
  checkedLabel?: ReactNode;
  /** Unchecked label (when toggle is off) */
  uncheckedLabel?: ReactNode;
  /** Helper text below toggle */
  helperText?: string;
  /** Error state */
  error?: boolean;
  /** Error message */
  errorMessage?: string;
  /** Change handler */
  onChange?: (checked: boolean, event: React.ChangeEvent<HTMLInputElement>) => void;
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

export const TOGGLE_DEFAULTS: Partial<ToggleProps> = {
  size: 'md',
  checked: false,
  disabled: false,
  required: false,
  loading: false,
  error: false,
};
