import type { ReactNode, ChangeEvent, FocusEvent, KeyboardEvent } from 'react';
import type { BaseComponentProps, DisableableProps, ErrorableProps, ClearableProps } from '../../../common';
import type { EngineAwareProps } from '../../../engine';

/**
 * Input sizes available in the system.
 */
export type InputSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

/**
 * Input visual variants.
 */
export type InputVariant = 'outline' | 'filled' | 'flushed' | 'unstyled';

/**
 * Input HTML types supported.
 */
export type InputType = 'text' | 'password' | 'email' | 'number' | 'tel' | 'url' | 'search';

/**
 * Input validation status.
 */
export type InputStatus = 'default' | 'error' | 'warning' | 'success';

/**
 * Base Input component props.
 */
export interface InputProps extends BaseComponentProps, EngineAwareProps, DisableableProps, ErrorableProps, ClearableProps {
  /**
   * Input size.
   * @default 'md'
   */
  size?: InputSize;

  /**
   * Visual variant.
   * @default 'outline'
   */
  variant?: InputVariant;

  /**
   * Validation status.
   * @default 'default'
   */
  status?: InputStatus;

  /**
   * Input HTML type.
   * @default 'text'
   */
  type?: InputType;

  /**
   * Current value (controlled).
   */
  value?: string;

  /**
   * Default value (uncontrolled).
   */
  defaultValue?: string;

  /**
   * Placeholder text.
   */
  placeholder?: string;

  /**
   * Whether the input is read-only.
   */
  readOnly?: boolean;

  /**
   * Whether the input is required.
   */
  required?: boolean;

  /**
   * Content to display before the input.
   */
  prefix?: ReactNode;

  /**
   * Content to display after the input.
   */
  suffix?: ReactNode;

  /**
   * Maximum character length.
   */
  maxLength?: number;

  /**
   * Minimum character length.
   */
  minLength?: number;

  /**
   * Auto-complete attribute.
   */
  autoComplete?: string;

  /**
   * Whether to auto-focus the input.
   */
  autoFocus?: boolean;

  /**
   * Input name attribute.
   */
  name?: string;

  /**
   * Whether to show character count.
   */
  showCount?: boolean;

  /**
   * Callback when value changes.
   */
  onChange?: (value: string, event: ChangeEvent<HTMLInputElement>) => void;

  /**
   * Callback when input receives focus.
   */
  onFocus?: (event: FocusEvent<HTMLInputElement>) => void;

  /**
   * Callback when input loses focus.
   */
  onBlur?: (event: FocusEvent<HTMLInputElement>) => void;

  /**
   * Callback when a key is pressed.
   */
  onKeyDown?: (event: KeyboardEvent<HTMLInputElement>) => void;

  /**
   * Callback when Enter is pressed.
   */
  onPressEnter?: (event: KeyboardEvent<HTMLInputElement>) => void;

  /**
   * ARIA label for accessibility.
   */
  'aria-label'?: string;

  /**
   * ARIA described by for accessibility.
   */
  'aria-describedby'?: string;

  /**
   * Data test id.
   */
  'data-testid'?: string;
}

/**
 * Input.Group component props.
 */
export interface InputGroupProps extends BaseComponentProps {
  /**
   * Group children (Input + addons).
   */
  children: ReactNode;

  /**
   * Size applied to all children.
   */
  size?: InputSize;

  /**
   * Whether the group is compact (no gaps).
   * @default true
   */
  compact?: boolean;
}

/**
 * Input.Addon component props.
 */
export interface InputAddonProps extends BaseComponentProps {
  /**
   * Addon content.
   */
  children: ReactNode;

  /**
   * Position of the addon.
   * @default 'before'
   */
  position?: 'before' | 'after';

  /**
   * Size of the addon.
   */
  size?: InputSize;

  /**
   * Background style.
   * @default 'default'
   */
  variant?: 'default' | 'transparent';
}

/**
 * Input.Password component props.
 */
export interface InputPasswordProps extends Omit<InputProps, 'type'> {
  /**
   * Whether to show visibility toggle button.
   * @default true
   */
  visibilityToggle?: boolean;

  /**
   * Custom icon to show password.
   */
  visibleIcon?: ReactNode;

  /**
   * Custom icon to hide password.
   */
  hiddenIcon?: ReactNode;
}

/**
 * Input.TextArea component props.
 */
export interface InputTextAreaProps extends Omit<InputProps, 'type' | 'prefix' | 'suffix'> {
  /**
   * Number of textarea rows.
   * @default 4
   */
  rows?: number;

  /**
   * Whether the textarea can auto-resize.
   */
  autoSize?: boolean | { minRows?: number; maxRows?: number };

  /**
   * Whether to allow manual textarea resize.
   * @default true
   */
  resize?: boolean;
}

/**
 * Input.Search component props.
 */
export interface InputSearchProps extends InputProps {
  /**
   * Search button text.
   */
  searchButtonText?: string;

  /**
   * Whether to show search button.
   * @default true
   */
  showSearchButton?: boolean;

  /**
   * Callback when search is triggered.
   */
  onSearch?: (value: string) => void;

  /**
   * Whether the search button is loading.
   */
  loading?: boolean;
}

/**
 * Input validation state.
 */
export interface InputValidationState {
  /** Whether the input is valid */
  valid: boolean;
  /** Error or validation message */
  message?: string;
  /** Validation type */
  type?: 'error' | 'warning' | 'success';
}
