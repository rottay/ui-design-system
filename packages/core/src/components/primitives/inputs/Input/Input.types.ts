/**
 * @fileoverview Input Types - Rottay Design System
 * @description Type definitions, interfaces, and constants for the Input component.
 * Part of the Rottay Design System's input primitives collection.
 *
 * @remarks
 * This module provides comprehensive type definitions for the Input component,
 * including all props, variants, sizes, validation states, and configuration objects.
 *
 * **Available Types:**
 * - `InputProps` - Main component props interface
 * - `InputSize` - Size variants (xs, sm, md, lg, xl)
 * - `InputVariant` - Visual style variants (outline, filled, flushed, unstyled)
 * - `InputStatus` - Validation states (default, error, warning, success)
 * - `InputType` - HTML input types (text, password, email, number, tel, url, search)
 * - `InputGroupProps` - Props for Input.Group compound component
 * - `InputAddonProps` - Props for Input.Addon compound component
 * - `InputPasswordProps` - Props for Input.Password compound component
 * - `InputSearchProps` - Props for Input.Search compound component
 * - `InputTextAreaProps` - Props for Input.TextArea compound component
 *
 * **CSS Custom Properties:**
 * The type definitions include mappings to CSS variables for consistent theming:
 * - Size: `--ds-input-{size}-height`, `--ds-input-{size}-padding-x`, `--ds-input-{size}-font-size`
 *
 * @example Using Types
 * ```tsx
 * import type { InputProps, InputSize, InputStatus } from '@rottay/design-system';
 *
 * // Custom input wrapper with typed props
 * const MyInput: React.FC<InputProps> = (props) => {
 *   return <Input {...props} />;
 * };
 *
 * // Typed validation
 * const status: InputStatus = hasError ? 'error' : 'default';
 * ```
 *
 * @example Using Constants
 * ```tsx
 * import { INPUT_DEFAULTS, SIZE_MAP } from '@rottay/design-system';
 *
 * // Access default values
 * console.log(INPUT_DEFAULTS.size);    // 'md'
 * console.log(INPUT_DEFAULTS.variant); // 'outline'
 *
 * // Access CSS variable mappings
 * console.log(SIZE_MAP.lg.height); // 'var(--ds-input-lg-height)'
 * ```
 *
 * @see {@link Input} for the main component
 * @see {@link InputGroup} for grouping inputs
 * @module InputTypes
 * @category Inputs
 * @package @rottay/design-system
 */

'use client';

import type { EngineAwareProps } from '../../../../contracts';
import type { ReactNode, ChangeEvent, FocusEvent, KeyboardEvent } from 'react';
import type { ResponsiveValue } from '../../layout/shared/types';

/**
 * Size variants for the Input component.
 * Maps to CSS custom properties `--ds-input-{size}-height`, `--ds-input-{size}-padding-x`,
 * and `--ds-input-{size}-font-size` via {@link SIZE_MAP}.
 */
export type InputSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

/**
 * Visual style variants for the Input component.
 * - `outline` - Standard bordered input (default)
 * - `filled` - Solid background fill with no visible border
 * - `flushed` - Only a bottom border, no background
 * - `unstyled` - No visual decoration; useful for custom styling
 */
export type InputVariant = 'outline' | 'filled' | 'flushed' | 'unstyled';

/**
 * Validation status indicators for the Input component.
 * Controls border color and optional feedback icon to communicate field state.
 */
export type InputStatus = 'default' | 'error' | 'warning' | 'success';

/**
 * Supported HTML input types.
 * Determines browser behavior for input fields (keyboard, validation, masking).
 */
export type InputType = 'text' | 'password' | 'email' | 'number' | 'tel' | 'url' | 'search';

/**
 * Props for the Input component.
 *
 * Supports controlled and uncontrolled modes, multiple visual variants,
 * validation states, prefix/suffix slots, clearable behavior, and character counting.
 *
 * @example Basic controlled input
 * ```tsx
 * <Input
 *   value={email}
 *   onChange={(val) => setEmail(val)}
 *   placeholder="Enter email"
 *   type="email"
 *   status={hasError ? 'error' : 'default'}
 * />
 * ```
 *
 * @example With prefix, suffix, and clear
 * ```tsx
 * <Input
 *   prefix={<SearchIcon />}
 *   suffix={<InfoIcon />}
 *   clearable
 *   maxLength={100}
 *   showCount
 * />
 * ```
 */
export interface InputProps extends EngineAwareProps {
  /**
   * Input size. Accepts a plain value or a responsive breakpoint object.
   * @default 'md'
   * @example
   * ```tsx
   * <Input size="lg" />
   * <Input size={{ base: 'sm', md: 'md', xl: 'lg' }} />
   * ```
   */
  size?: ResponsiveValue<InputSize>;
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

/**
 * Props for the Input.Group compound component.
 * Groups multiple inputs and addons into a visually connected row.
 *
 * @example
 * ```tsx
 * <Input.Group compact>
 *   <Input.Addon position="before">https://</Input.Addon>
 *   <Input placeholder="domain.com" />
 * </Input.Group>
 * ```
 */
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

/**
 * Props for the Input.Addon compound component.
 * Renders a decorative or informational element attached to one side of an Input.
 *
 * @example
 * ```tsx
 * <Input.Addon position="before">$</Input.Addon>
 * <Input.Addon position="after" variant="transparent">.00</Input.Addon>
 * ```
 */
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

/**
 * Default values for Input component props.
 * Applied when no explicit value is provided by the consumer.
 *
 * @constant
 * @property {string} size - Default size variant ('md')
 * @property {string} variant - Default visual style ('outline')
 * @property {string} status - Default validation status ('default')
 * @property {string} type - Default HTML input type ('text')
 * @property {boolean} disabled - Default disabled state (false)
 * @property {boolean} readOnly - Default read-only state (false)
 * @property {boolean} required - Default required state (false)
 * @property {boolean} error - Default error state (false)
 * @property {boolean} clearable - Default clearable behavior (false)
 * @property {boolean} showCount - Default character count display (false)
 */
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

/**
 * Size configuration mapping to CSS custom properties.
 * Each size variant maps to height, horizontal padding, and font-size CSS variables
 * defined in the tenant's theme (see `tokens/css/themes/default.css`).
 *
 * @constant
 * @example
 * ```ts
 * const { height, paddingX, fontSize } = SIZE_MAP['lg'];
 * // height   = 'var(--ds-input-lg-height)'
 * // paddingX = 'var(--ds-input-lg-padding-x)'
 * // fontSize = 'var(--ds-input-lg-font-size)'
 * ```
 */
export const SIZE_MAP = {
  xs: { height: 'var(--ds-input-xs-height)', paddingX: 'var(--ds-input-xs-padding-x)', fontSize: 'var(--ds-input-xs-font-size)' },
  sm: { height: 'var(--ds-input-sm-height)', paddingX: 'var(--ds-input-sm-padding-x)', fontSize: 'var(--ds-input-sm-font-size)' },
  md: { height: 'var(--ds-input-md-height)', paddingX: 'var(--ds-input-md-padding-x)', fontSize: 'var(--ds-input-md-font-size)' },
  lg: { height: 'var(--ds-input-lg-height)', paddingX: 'var(--ds-input-lg-padding-x)', fontSize: 'var(--ds-input-lg-font-size)' },
  xl: { height: 'var(--ds-input-xl-height)', paddingX: 'var(--ds-input-xl-padding-x)', fontSize: 'var(--ds-input-xl-font-size)' },
};

/**
 * Ant Design (Titan engine) size mapping.
 * Translates design system size tokens to Ant Design's size prop values.
 * Note: `xs` and `xl` are collapsed to `small` and `large` respectively,
 * since Ant Design only supports three size values.
 *
 * @constant
 */
export const ANT_SIZE_MAP = {
  xs: 'small' as const,
  sm: 'small' as const,
  md: 'middle' as const,
  lg: 'large' as const,
  xl: 'large' as const,
};

/**
 * DaisyUI (Hermes engine) size mapping.
 * Translates design system size tokens to DaisyUI CSS class names.
 * Note: `xl` falls back to `input-lg` since DaisyUI has no xl size class.
 *
 * @constant
 */
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
