/**
 * Input Component Types
 *
 * Unified type definitions for Input component across all engines.
 * These types are implemented by titan (AntD), hermes (DaisyUI), and apollo (HTML+Tailwind).
 */

import type { CSSProperties, ChangeEvent, FocusEvent, KeyboardEvent, ReactNode } from 'react';

/**
 * Base Input Props
 *
 * Common properties supported by ALL engines.
 * All engines MUST implement these props.
 */
export interface InputBaseProps {
  /** Input value (controlled) */
  value?: string;

  /** Default value (uncontrolled) */
  defaultValue?: string;

  /** Placeholder text */
  placeholder?: string;

  /** Disabled state */
  disabled?: boolean;

  /** Read-only state */
  readOnly?: boolean;

  /** Input type */
  type?: 'text' | 'password' | 'email' | 'number' | 'tel' | 'url' | 'search';

  /** Change handler */
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;

  /** Focus handler */
  onFocus?: (e: FocusEvent<HTMLInputElement>) => void;

  /** Blur handler */
  onBlur?: (e: FocusEvent<HTMLInputElement>) => void;

  /** Custom CSS classes */
  className?: string;

  /** Inline styles */
  style?: CSSProperties;

  /** Input ID */
  id?: string;

  /** Input name */
  name?: string;

  /** Auto focus on mount */
  autoFocus?: boolean;
}

/**
 * Input Props
 *
 * Extended properties with engine-specific features.
 * Some props may be ignored by certain engines.
 */
export interface InputProps extends InputBaseProps {
  /**
   * Input size
   * - titan: large, middle, small
   * - hermes: xs, sm, md, lg (mapped)
   * - apollo: small, middle, large
   */
  size?: 'small' | 'middle' | 'large';

  /**
   * Validation status
   * - titan: full support with styling
   * - hermes: maps to color variants
   * - apollo: full support with border colors
   */
  status?: 'error' | 'warning';

  /**
   * Maximum length
   * Native HTML attribute, supported by all engines
   */
  maxLength?: number;

  /**
   * Prefix icon/element
   * - titan: full support
   * - hermes: limited support
   * - apollo: full support
   * @engine-specific May have different positioning in some engines
   */
  prefix?: ReactNode;

  /**
   * Suffix icon/element
   * - titan: full support
   * - hermes: limited support
   * - apollo: full support
   * @engine-specific May have different positioning in some engines
   */
  suffix?: ReactNode;

  /**
   * Show clear button when input has value
   * - titan: full support
   * - hermes: custom implementation
   * - apollo: full support
   */
  allowClear?: boolean;

  /**
   * Enter key press handler
   * Supported by all engines
   */
  onPressEnter?: (e: KeyboardEvent<HTMLInputElement>) => void;

  /**
   * Auto complete attribute
   * Native HTML attribute, supported by all engines
   */
  autoComplete?: string;

  /**
   * Variant style (hermes-specific)
   * - titan: ignored
   * - hermes: bordered, ghost, primary, secondary, accent, info, success, warning, error
   * - apollo: maps to status if applicable
   * @engine-specific Primarily for hermes engine
   */
  variant?: 'bordered' | 'ghost' | 'primary' | 'secondary' | 'accent' | 'info' | 'success' | 'warning' | 'error';
}

/**
 * Input.TextArea Props
 *
 * Properties for textarea variant of Input component.
 */
export interface TextAreaProps {
  /** Textarea value (controlled) */
  value?: string;

  /** Default value (uncontrolled) */
  defaultValue?: string;

  /** Placeholder text */
  placeholder?: string;

  /** Disabled state */
  disabled?: boolean;

  /** Read-only state */
  readOnly?: boolean;

  /** Number of rows */
  rows?: number;

  /** Minimum number of rows (auto-resize) */
  minRows?: number;

  /** Maximum number of rows (auto-resize) */
  maxRows?: number;

  /** Auto resize textarea */
  autoSize?: boolean | { minRows?: number; maxRows?: number };

  /** Show character count */
  showCount?: boolean;

  /** Maximum length */
  maxLength?: number;

  /** Resize behavior */
  resize?: 'none' | 'both' | 'horizontal' | 'vertical';

  /** Change handler for textarea */
  onChange?: (e: ChangeEvent<HTMLTextAreaElement>) => void;

  /** Focus handler for textarea */
  onFocus?: (e: FocusEvent<HTMLTextAreaElement>) => void;

  /** Blur handler for textarea */
  onBlur?: (e: FocusEvent<HTMLTextAreaElement>) => void;

  /** Custom CSS classes */
  className?: string;

  /** Inline styles */
  style?: CSSProperties;

  /** Textarea ID */
  id?: string;

  /** Textarea name */
  name?: string;

  /** Auto focus on mount */
  autoFocus?: boolean;
}

/**
 * Input.Password Props
 *
 * Properties for password variant of Input component.
 */
export interface PasswordProps extends InputProps {
  /** Show visibility toggle */
  visibilityToggle?: boolean;

  /** Custom visibility icon */
  iconRender?: (visible: boolean) => ReactNode;
}
