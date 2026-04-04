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

/** Inline typography and gap styles keyed by DS size token. */
const SIZE_STYLES = {
  sm: { label: { fontSize: 12 }, help: { fontSize: 12 }, gap: 4 },
  md: { label: { fontSize: 14 }, help: { fontSize: 12 }, gap: 6 },
  lg: { label: { fontSize: 16 }, help: { fontSize: 14 }, gap: 8 },
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

  const sizeStyle = SIZE_STYLES[size];
  const isHorizontal = layout === 'horizontal';

  // Deterministic IDs derived from `name` for label-input association and aria-describedby
  const fieldId = `formfield-${name}`;
  const errorId = `${fieldId}-error`;
  const helpId = `${fieldId}-help`;
  // Error takes priority: screen readers should announce the error, not the help text
  const describedBy = error ? errorId : help ? helpId : undefined;

  return (
    <div
      className={className}
      style={{
        display: 'flex',
        width: '100%',
        ...(isHorizontal
          ? { flexDirection: 'row', alignItems: 'flex-start' }
          : { flexDirection: 'column', gap: sizeStyle.gap }),
        ...(disabled ? { opacity: 0.5, pointerEvents: 'none' as const } : {}),
        ...style,
      }}
      data-testid={testId}
    >
      <label
        htmlFor={fieldId}
        style={{
          display: 'block',
          ...sizeStyle.label,
          fontWeight: 500,
          ...(isHorizontal ? { flexShrink: 0, width: labelWidth, paddingRight: 12 } : {}),
        }}
      >
        <span style={{ fontSize: sizeStyle.label.fontSize, fontWeight: 500, color: 'var(--ds-color-text-primary)' }}>
          {label}
          {required && (
            <span aria-hidden="true" style={{ marginLeft: 4, color: 'var(--ds-color-error)' }}>*</span>
          )}
        </span>
      </label>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: sizeStyle.gap }}>
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
          <p id={errorId} role="alert" style={{ ...sizeStyle.help, color: 'var(--ds-color-error)' }}>
            {error}
          </p>
        )}

        {!error && help && (
          <p id={helpId} style={{ ...sizeStyle.help, color: 'var(--ds-color-text-secondary)' }}>
            {help}
          </p>
        )}
      </div>
    </div>
  );
}
