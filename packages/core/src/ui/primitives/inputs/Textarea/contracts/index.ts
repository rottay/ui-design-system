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

import type { EngineAwareProps } from '../../../../../foundation/contracts';
import type { ChangeEvent, FocusEvent } from 'react';

/**
 * Size variants for the Textarea component.
 * - `'sm'`: Compact size for dense layouts
 * - `'md'`: Default size for most use cases
 * - `'lg'`: Larger size for prominent text areas
 */
export type TextareaSize = 'sm' | 'md' | 'lg';

/**
 * Visual variant for the Textarea component.
 * - `'outlined'`: Standard bordered textarea (default)
 * - `'filled'`: Filled background with subtle border
 * - `'borderless'`: No visible border, minimal style
 */
export type TextareaVariant = 'outlined' | 'filled' | 'borderless';

/**
 * Validation status for the Textarea component.
 * - `'default'`: Normal state with no validation feedback
 * - `'error'`: Error state with red border and optional message
 * - `'warning'`: Warning state with yellow/orange border
 * - `'success'`: Success state with green border
 */
export type TextareaStatus = 'default' | 'error' | 'warning' | 'success';

/**
 * Props for the Textarea component.
 *
 * A multi-line text input with support for auto-sizing, character count,
 * validation status, and clear functionality. Extends EngineAwareProps
 * for multi-engine rendering.
 *
 * @example Basic usage
 * ```tsx
 * <Textarea
 *   placeholder="Enter your message..."
 *   rows={4}
 *   onChange={(value) => setMessage(value)}
 * />
 * ```
 *
 * @example With auto-size and character count
 * ```tsx
 * <Textarea
 *   value={comment}
 *   maxLength={500}
 *   showCount
 *   autoSize={{ minRows: 2, maxRows: 8 }}
 *   onChange={(value) => setComment(value)}
 * />
 * ```
 */
export interface TextareaProps extends EngineAwareProps {
  /** Size variant controlling height and font size of the textarea */
  size?: TextareaSize;
  /** Visual variant controlling the border and background style */
  variant?: TextareaVariant;
  /** Validation status indicator (affects border color and styling) */
  status?: TextareaStatus;
  /** Placeholder text shown when the textarea is empty */
  placeholder?: string;
  /** Current text value (controlled mode) */
  value?: string;
  /** Default text value (uncontrolled mode) */
  defaultValue?: string;
  /** Whether the textarea is disabled and non-interactive */
  disabled?: boolean;
  /** Whether the textarea is read-only (visible but not editable) */
  readOnly?: boolean;
  /** Whether the field is required for form validation */
  required?: boolean;
  /** Maximum number of characters allowed. When combined with showCount, displays a counter. */
  maxLength?: number;
  /** Whether to show the character count indicator (e.g., "42/500") */
  showCount?: boolean;
  /** Number of visible text rows (sets the initial height) */
  rows?: number;
  /** Auto-resize behavior. Pass true for unlimited resize, or an object with min/max row constraints. */
  autoSize?: boolean | { minRows?: number; maxRows?: number };
  /** Whether to show a clear button when the textarea has content */
  allowClear?: boolean;
  /** Callback fired when the text value changes, receives the value and native event */
  onChange?: (value: string, event: ChangeEvent<HTMLTextAreaElement>) => void;
  /** Callback fired when the textarea receives focus */
  onFocus?: (event: FocusEvent<HTMLTextAreaElement>) => void;
  /** Callback fired when the textarea loses focus */
  onBlur?: (event: FocusEvent<HTMLTextAreaElement>) => void;
  /** Callback fired when the clear button is clicked */
  onClear?: () => void;
  /** Callback fired when the Enter key is pressed */
  onPressEnter?: () => void;
  /** Callback fired when the textarea is resized (via autoSize or user drag), receives new dimensions */
  onResize?: (size: { width: number; height: number }) => void;
  /** Additional CSS class name for the root element */
  className?: string;
  /** Additional inline styles for the root element */
  style?: React.CSSProperties;
  /** HTML name attribute for form submission */
  name?: string;
  /** HTML id attribute for the textarea element */
  id?: string;
  /** HTML autocomplete attribute */
  autoComplete?: string;
  /** Whether to auto-focus the textarea on mount */
  autoFocus?: boolean;
  /** Test identifier for automated testing frameworks (stamped on the field wrapper) */
  'data-testid'?: string;
}

/**
 * Default values for Textarea props.
 * Used across all engine implementations for consistency.
 */
export const TEXTAREA_DEFAULTS: Partial<TextareaProps> = {
  /** Medium size by default */
  size: 'md',
  /** Outlined variant by default */
  variant: 'outlined',
  /** No validation status by default */
  status: 'default',
  /** Not disabled by default */
  disabled: false,
  /** Editable by default */
  readOnly: false,
  /** Not required by default */
  required: false,
  /** Clear button hidden by default */
  allowClear: false,
  /** Character count hidden by default */
  showCount: false,
  /** Auto-sizing disabled by default */
  autoSize: false,
  /** Four visible rows by default */
  rows: 4,
};
