'use client';

/**
 * @fileoverview Modern engine for FormField, built with DaisyUI's `form-control` and Tailwind.
 * Injects `id`, `aria-describedby`, and `aria-invalid` into children via `React.cloneElement`
 * to ensure accessibility without requiring consumers to wire those attributes manually.
 *
 * @example
 * ```tsx
 * <FormField engine="modern" label="Username" name="username" error="Already taken">
 *   <Input />
 * </FormField>
 * ```
 *
 * @module FormField/Engines/Modern
 * @category Inputs
 * @package @rottay/design-system
 */

import React from 'react';
import type { FormFieldProps } from '../FormField.types';
import { FORMFIELD_DEFAULTS } from '../FormField.types';

/** Tailwind text size and gap classes keyed by DS size token. */
const SIZE_CLASSES = {
  sm: { label: 'text-xs', help: 'text-xs', gap: 'gap-1' },
  md: { label: 'text-sm', help: 'text-xs', gap: 'gap-1.5' },
  lg: { label: 'text-base', help: 'text-sm', gap: 'gap-2' },
} as const;

/**
 * Modern (DaisyUI) implementation of FormField.
 *
 * Renders a semantic `<label>` + content wrapper, cloning accessibility attributes
 * (`id`, `aria-describedby`, `aria-invalid`) onto child input elements. Supports
 * vertical (default) and horizontal layouts, with error text shown as a `role="alert"`
 * paragraph that screen readers announce immediately.
 *
 * @param props - Standard FormFieldProps shared across all engines.
 * @returns A DaisyUI form-control wrapper with label, children, and error/help text.
 */
export default function ModernFormField(props: FormFieldProps): React.ReactElement {
  const {
    label,
    name,
    required = FORMFIELD_DEFAULTS.required,
    error,
    help,
    children,
    layout = FORMFIELD_DEFAULTS.layout,
    labelWidth = FORMFIELD_DEFAULTS.labelWidth,
    size = FORMFIELD_DEFAULTS.size,
    disabled = FORMFIELD_DEFAULTS.disabled,
    className = '',
    style,
    'data-testid': testId,
  } = props;

  const sizeClasses = SIZE_CLASSES[size];
  const isHorizontal = layout === 'horizontal';

  // Deterministic IDs derived from `name` for label-input association and aria-describedby
  const fieldId = `formfield-${name}`;
  const errorId = `${fieldId}-error`;
  const helpId = `${fieldId}-help`;
  // Error takes priority: screen readers should announce the error, not the help text
  const describedBy = error ? errorId : help ? helpId : undefined;

  return (
    <div
      className={`form-control w-full ${isHorizontal ? 'flex flex-row items-start' : `flex flex-col ${sizeClasses.gap}`} ${disabled ? 'opacity-50 pointer-events-none' : ''} ${className}`}
      style={style}
      data-testid={testId}
    >
      <label
        className={`label ${isHorizontal ? 'flex-shrink-0' : ''} ${sizeClasses.label} font-medium`}
        htmlFor={fieldId}
        style={isHorizontal ? { width: labelWidth, paddingRight: '12px' } : undefined}
      >
        <span className="label-text">
          {label}
          {required && (
            <span className="text-error ml-1" aria-hidden="true">*</span>
          )}
        </span>
      </label>

      <div className={`flex-1 flex flex-col ${sizeClasses.gap}`}>
        {/* Clone accessibility props onto children so consumers don't have to wire them */}
        {React.Children.map(children, (child) => {
          if (React.isValidElement<{ id?: string; 'aria-describedby'?: string; 'aria-invalid'?: boolean }>(child)) {
            return React.cloneElement(child, {
              id: fieldId,
              'aria-describedby': describedBy,
              'aria-invalid': !!error,
            });
          }
          return child;
        })}

        {error && (
          <p id={errorId} className={`${sizeClasses.help} text-error`} role="alert">
            {error}
          </p>
        )}

        {!error && help && (
          <p id={helpId} className={`${sizeClasses.help} text-base-content/60`}>
            {help}
          </p>
        )}
      </div>
    </div>
  );
}
