'use client';

import React from 'react';
import type { FormFieldProps } from '../../contracts';
import { FORMFIELD_DEFAULTS } from '../../contracts';

/** Modern, CSS-first form-field anatomy shared by every tenant skin. */
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

  const fieldId = `formfield-${name}`;
  const errorId = `${fieldId}-error`;
  const helpId = `${fieldId}-help`;
  const describedBy = error ? errorId : help ? helpId : undefined;

  const rootStyle = {
    '--ds-form-field-label-width': labelWidth,
    ...style,
  } as React.CSSProperties;

  return (
    <div
      className={`ds-form-field ds-form-field--modern ${className}`.trim()}
      data-part="root"
      data-layout={layout}
      data-size={size}
      data-required={required ? 'true' : undefined}
      data-has-help={help && !error ? 'true' : undefined}
      data-disabled={disabled ? 'true' : undefined}
      data-invalid={error ? 'true' : undefined}
      style={rootStyle}
      data-testid={testId}
    >
      <div data-part="layout">
        <label htmlFor={fieldId} data-part="label-wrap">
          <span data-part="label">
            {label}
            {required && <span data-part="required-mark" aria-hidden="true">*</span>}
          </span>
        </label>

        <div data-part="body">
          <div data-part="control-slot">
            {React.Children.map(children, (child) => {
              if (!React.isValidElement<{
                id?: string;
                disabled?: boolean;
                required?: boolean;
                'aria-describedby'?: string;
                'aria-invalid'?: boolean | string;
                'aria-required'?: boolean | 'false' | 'true';
              }>(child)) return child;

              if (child.type === React.Fragment) return child;
              if (
                typeof child.type === 'string' &&
                !['input', 'textarea', 'select'].includes(child.type)
              ) return child;

              const childDescription = child.props['aria-describedby'];
              const mergedDescription = [childDescription, describedBy].filter(Boolean).join(' ') || undefined;

              return React.cloneElement(child, {
                id: fieldId,
                disabled: disabled || child.props.disabled,
                required: required || child.props.required,
                'aria-describedby': mergedDescription,
                'aria-invalid': error ? true : child.props['aria-invalid'] ?? false,
                'aria-required': required ? true : child.props['aria-required'],
              });
            })}
          </div>

          {error && (
            <p id={errorId} data-part="error-message" role="alert">
              {error}
            </p>
          )}

          {!error && help && (
            <p id={helpId} data-part="help-text">
              {help}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
