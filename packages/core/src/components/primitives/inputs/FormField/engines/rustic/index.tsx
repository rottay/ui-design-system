'use client';

/**
 * @fileoverview FormField Rustic Engine - Rottay Design System
 * @description Vanilla HTML/CSS implementation of the FormField component.
 * Uses inline styles and semantic HTML for zero-dependency rendering.
 *
 * @module FormField/Engines/Rustic
 * @category Inputs
 * @package @rottay/design-system
 */

import React from 'react';
import type { FormFieldProps } from '../../types';
import { FORMFIELD_DEFAULTS } from '../../types';

/**
 * Size style mappings for Rustic engine.
 */
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
 * Rustic Engine implementation of the FormField component.
 * Pure vanilla HTML/CSS implementation with semantic markup.
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
  const fieldId = `formfield-${name}`;
  const errorId = `${fieldId}-error`;
  const helpId = `${fieldId}-help`;
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
    color: 'var(--ds-form-label-color, #374151)',
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
    color: 'var(--ds-form-error-color, #ef4444)',
    margin: 0,
  };

  const helpStyle: React.CSSProperties = {
    ...sizeStyles.help,
    color: 'var(--ds-form-help-color, #6b7280)',
    margin: 0,
  };

  return (
    <div
      className={`rottay-form-field ${className}`}
      style={containerStyle}
      data-testid={testId}
    >
      <label htmlFor={fieldId} style={labelStyle}>
        {label}
        {required && (
          <span
            style={{ color: 'var(--ds-form-required-color, #ef4444)', marginLeft: '2px' }}
            aria-hidden="true"
          >
            *
          </span>
        )}
      </label>

      <div style={contentStyle}>
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
          <p id={errorId} style={errorStyle} role="alert">
            {error}
          </p>
        )}

        {!error && help && (
          <p id={helpId} style={helpStyle}>
            {help}
          </p>
        )}
      </div>
    </div>
  );
}
