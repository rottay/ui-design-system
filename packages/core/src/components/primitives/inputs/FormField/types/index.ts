'use client';

/**
 * @fileoverview FormField Types - Rottay Design System
 * @description Type definitions for the FormField component.
 * A convenience wrapper that combines Label + Input + Error + Help into one component.
 *
 * @remarks
 * FormField simplifies form layouts by encapsulating the common pattern of
 * label, input, error message, and help text into a single component.
 * It works across all three engines (Classic, Modern, Rustic).
 *
 * @module FormField/Types
 * @category Inputs
 * @package @rottay/design-system
 */

import type { ReactNode, CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../../contracts';

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
   */
  label: string;

  /**
   * Name attribute, used as `htmlFor` on the label and `id` on the wrapper.
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
   */
  error?: string;

  /**
   * Help text displayed below the input (hidden when error is shown).
   */
  help?: string;

  /**
   * The input element(s) to render inside the field.
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
};
