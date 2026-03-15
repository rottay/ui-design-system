/**
 * @fileoverview Textarea Types - Rottay Design System
 * @description Type definitions for the Textarea component.
 * Part of the Rottay Design System's input primitives collection.
 *
 * @remarks
 * This module defines all TypeScript interfaces, types, and constants
 * for the Textarea component. These types are shared across all engines.
 *
 * **Exported Types:**
 * - `TextareaProps` - Main component props interface
 * - `TextareaSize` - Size variant type ('sm' | 'md' | 'lg')
 * - `TextareaVariant` - Visual variant type ('outlined' | 'filled' | 'borderless')
 * - `TextareaStatus` - Validation status type ('default' | 'error' | 'warning' | 'success')
 *
 * **Configuration Constants:**
 * - `TEXTAREA_DEFAULTS` - Default prop values
 *
 * **AutoSize Configuration:**
 * The `autoSize` prop accepts either a boolean or an object:
 * - `true` - Auto-resize without limits
 * - `{ minRows: number, maxRows: number }` - Constrained auto-resize
 *
 * @example Type Usage
 * ```tsx
 * import type { TextareaProps, TextareaSize } from '@rottay/design-system';
 *
 * interface CommentInputProps extends Omit<TextareaProps, 'showCount'> {
 *   label: string;
 * }
 * ```
 *
 * @see {@link Textarea} for the main component
 * @module TextareaTypes
 * @category Inputs
 * @package @rottay/design-system
 */

import type { EngineAwareProps } from '../../../../contracts';
import type { ChangeEvent, FocusEvent } from 'react';

export type TextareaSize = 'sm' | 'md' | 'lg';
export type TextareaVariant = 'outlined' | 'filled' | 'borderless';
export type TextareaStatus = 'default' | 'error' | 'warning' | 'success';

export interface TextareaProps extends EngineAwareProps {
  /** Textarea size */
  size?: TextareaSize;
  /** Visual variant */
  variant?: TextareaVariant;
  /** Validation status */
  status?: TextareaStatus;
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
  /** Show character count */
  showCount?: boolean;
  /** Number of rows */
  rows?: number;
  /** Auto resize */
  autoSize?: boolean | { minRows?: number; maxRows?: number };
  /** Allow clear button */
  allowClear?: boolean;
  /** Change handler */
  onChange?: (value: string, event: ChangeEvent<HTMLTextAreaElement>) => void;
  /** Focus handler */
  onFocus?: (event: FocusEvent<HTMLTextAreaElement>) => void;
  /** Blur handler */
  onBlur?: (event: FocusEvent<HTMLTextAreaElement>) => void;
  /** Clear handler */
  onClear?: () => void;
  /** Press Enter handler */
  onPressEnter?: () => void;
  /** Resize handler */
  onResize?: (size: { width: number; height: number }) => void;
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

export const TEXTAREA_DEFAULTS: Partial<TextareaProps> = {
  size: 'md',
  variant: 'outlined',
  status: 'default',
  disabled: false,
  readOnly: false,
  required: false,
  allowClear: false,
  showCount: false,
  autoSize: false,
  rows: 4,
};
