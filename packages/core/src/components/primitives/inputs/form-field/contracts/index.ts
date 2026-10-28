'use client';

/**
 * @fileoverview FormField Types - Rottay Design System
 * @description Type definitions for the FormField component.
 * A convenience wrapper that combines Label + Input + Error + Help into one component.
 *
 * @remarks
 * FormField simplifies form layouts by encapsulating the common pattern of
 * label, input, error message, and help text into a single component.
 * Modern binds direct controls to instance-specific IDs, the visible label and
 * the active error/help message. These binding guarantees apply to Modern only.
 *
 * @module FormField/Types
 * @category Inputs
 * @package @rottay/design-system
 */

import type { ReactNode, CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../../foundation/contracts';

/**
 * Layout options for the FormField component.
 */
export type FormFieldLayout = 'vertical' | 'horizontal';

/**
 * Size options for the FormField component.
 */
export type FormFieldSize = 'sm' | 'md' | 'lg';

/**
 * Props for the FormField component.
 *
 * @interface FormFieldProps
 * @extends {EngineAwareProps}
 *
 * @example
 * ```tsx
 * <FormField
 *   label="Email"
 *   name="email"
 *   required
 *   error={errors.email}
 *   help="We'll never share your email"
 * >
 *   <Input value={email} onChange={setEmail} />
 * </FormField>
 * ```
 */
export interface FormFieldProps extends EngineAwareProps {
  /**
   * Label text displayed above (vertical) or beside (horizontal) the input.
   * Modern labels the first direct control unless it supplies aria-labelledby
   * or a nonempty aria-label; an empty label preserves standalone naming.
   */
  label: string;

  /**
   * Modern generated-ID prefix: `formfield-${name}-${React.useId()}`.
   * Caller control IDs are preserved; id-less controls use the instance ID,
   * then `-2`, `-3`, etc. Caller IDs do not advance that sequence. The label
   * targets the first direct control's ID. No name or ID is set on the wrapper.
   */
  name: string;

  /**
   * Whether the field is required. Adds a visual indicator to the label.
   * @default false
   */
  required?: boolean;

  /**
   * Error message to display below the input.
   * When provided, the field enters an error visual state.
   * Modern appends its description reference after each control's own context
   * and sets aria-invalid=true; otherwise the control's invalid state survives.
   */
  error?: string;

  /**
   * Help text displayed below the input (hidden when error is shown).
   * Modern appends its description reference after each control's own context
   * when no error is active; message IDs are instance-specific.
   */
  help?: string;

  /**
   * Reserves space for the error/help message region so the control below
   * does not shift when a message appears or disappears. `true` reserves one
   * line; a number reserves that many lines. The reserved region always
   * mounts (`data-part="message-region"` wrapping the existing error/help
   * swap), stamping the per-instance geometry variable
   * `--_ds-form-field-message-lines` that the skin reads.
   *
   * @default false
   * @remarks Implemented by the modern engine only; classic and rustic keep
   * their current conditional mount (the axis is typed for all three, but
   * only modern reserves the space).
   */
  reserveMessageSpace?: boolean | number;

  /**
   * The input element(s) to render inside the field.
   * Modern binds direct input/textarea/select elements and component children;
   * it does not descend into fragments or host wrappers. Components must forward
   * id and aria-* to their control; composite ID prefixes/groups keep their own
   * targeting semantics (OTPInput slots, Slider range group, Upload file input).
   */
  children: ReactNode;

  /**
   * Layout direction for the label and input.
   * @default 'vertical'
   */
  layout?: FormFieldLayout;

  /**
   * Width of the label in horizontal layout.
   * @default '120px'
   */
  labelWidth?: string;

  /**
   * Size variant affecting font sizes and spacing.
   * @default 'md'
   */
  size?: FormFieldSize;

  /**
   * Whether the field is disabled. Applies reduced opacity.
   * @default false
   */
  disabled?: boolean;

  /**
   * Additional CSS class name for custom styling.
   */
  className?: string;

  /**
   * Inline styles applied to the field container.
   */
  style?: CSSProperties;

  /**
   * Data test id for testing.
   */
  'data-testid'?: string;
}

/**
 * Default configuration values for the FormField component.
 */
export const FORMFIELD_DEFAULTS = {
  layout: 'vertical' as const,
  labelWidth: '120px',
  size: 'md' as const,
  required: false,
  disabled: false,
  reserveMessageSpace: false as boolean | number,
};
