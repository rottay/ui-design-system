'use client';

/**
 * @fileoverview Rustic (zero-dependency) engine for FormField, using inline CSS and DS variables.
 * Like Modern, it clones accessibility attributes onto children, but does so with pure
 * inline styles instead of Tailwind classes, making it framework-agnostic.
 *
 * @example
 * ```tsx
 * <FormField engine="rustic" label="Password" name="password" required help="Min 8 chars">
 *   <Input type="password" />
 * </FormField>
 * ```
 *
 * @module FormField/Engines/Rustic
 * @category Inputs
 * @package @rottay/design-system
 */

import React from 'react';
import type { FormFieldProps } from '../../contracts';
import { FORMFIELD_DEFAULTS } from '../../contracts';

/** Inline style tokens per size -- font sizes and gap spacing. */
const SIZE_STYLES = {
  sm: {
    label: { fontSize: '12px' },
    help: { fontSize: '11px' },
    gap: '4px',
  },
  md: {
    label: { fontSize: '14px' },
    help: { fontSize: '12px' },
    gap: '6px',
  },
  lg: {
    label: { fontSize: '16px' },
    help: { fontSize: '14px' },
    gap: '8px',
  },
} as const;

/**
 * Rustic (vanilla HTML/CSS) implementation of FormField.
 *
 * Builds the label + content + error/help layout entirely from inline CSSProperties
 * and DS CSS custom properties. Accessibility attributes (`id`, `aria-describedby`,
 * `aria-invalid`) are cloned onto child elements via `React.cloneElement`.
 *
 * @param props - Standard FormFieldProps shared across all engines.
 * @returns A flex container with label, children, and contextual error/help text.
 */
export default function RusticFormField(props: FormFieldProps): React.ReactElement {
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

  const sizeStyles = SIZE_STYLES[size];
  const isHorizontal = layout === 'horizontal';

  // Deterministic IDs derived from `name` for label-input association and aria-describedby
  const fieldId = `formfield-${name}`;
  const errorId = `${fieldId}-error`;
  const helpId = `${fieldId}-help`;
  // Error takes priority over help for the describedby association
  const describedBy = error ? errorId : help ? helpId : undefined;

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: isHorizontal ? 'row' : 'column',
    alignItems: isHorizontal ? 'flex-start' : 'stretch',
    gap: sizeStyles.gap,
    opacity: disabled ? 0.5 : 1,
    pointerEvents: disabled ? 'none' : undefined,
    ...style,
  };

  const labelStyle: React.CSSProperties = {
    ...sizeStyles.label,
    fontWeight: 500,
    ...(isHorizontal ? {
      width: labelWidth,
      flexShrink: 0,
      paddingRight: '12px',
      paddingTop: '8px',
    } : {}),
  };

  const contentStyle: React.CSSProperties = {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: sizeStyles.gap,
  };

  const errorStyle: React.CSSProperties = {
    ...sizeStyles.help,
    margin: 0,
  };

  const helpStyle: React.CSSProperties = {
    ...sizeStyles.help,
    margin: 0,
  };

  return (
    <div
      className={`rottay-form-field ds-form-field ds-form-field--rustic ${className}`}
      data-part="root"
      style={containerStyle}
      data-testid={testId}
    >
      <label htmlFor={fieldId} data-part="label" style={labelStyle}>
        {label}
        {required && (
          <span
            data-part="required-mark"
            style={{ marginLeft: '2px' }}
            aria-hidden="true"
          >
            *
          </span>
        )}
      </label>

      <div style={contentStyle}>
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
          <p id={errorId} data-part="error-message" style={errorStyle} role="alert">
            {error}
          </p>
        )}

        {!error && help && (
          <p id={helpId} data-part="help-text" style={helpStyle}>
            {help}
          </p>
        )}
      </div>
    </div>
  );
}
