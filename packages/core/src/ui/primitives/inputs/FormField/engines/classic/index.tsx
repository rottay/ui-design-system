'use client';

/**
 * @fileoverview Classic engine for FormField, wrapping Ant Design's `Form.Item`.
 * Provides label, error/help text, required marker, and horizontal/vertical layout
 * by delegating to Ant's built-in form machinery while keeping a thin DS interface.
 *
 * @example
 * ```tsx
 * <FormField engine="classic" label="Email" name="email" required error="Invalid email">
 *   <Input />
 * </FormField>
 * ```
 *
 * @module FormField/Engines/Classic
 * @category Inputs
 * @package @rottay/design-system
 */

import React from 'react';
import { Form } from 'antd';
import type { FormFieldProps } from '../../contracts';
import { FORMFIELD_DEFAULTS } from '../../contracts';

/**
 * Classic (Ant Design) implementation of FormField.
 *
 * Wraps children inside `Form.Item`, mapping the DS error prop to Ant's `validateStatus`
 * and merging error/help into a single help slot. Horizontal layout uses `labelCol`/`wrapperCol`
 * flex sizing driven by the `labelWidth` prop.
 *
 * @param props - Standard FormFieldProps shared across all engines.
 * @returns A wrapper div containing an Ant Form.Item with the provided children.
 */
export default function ClassicFormField(props: FormFieldProps): React.ReactElement {
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

  // Ant Form.Item shows red styling when validateStatus is 'error'
  const validateStatus = error ? 'error' : undefined;
  // Error takes priority over help text in the single Ant help slot
  const helpText = error || help;

  // In horizontal layout, labelCol/wrapperCol control the flex split
  const labelCol = layout === 'horizontal'
    ? { flex: `0 0 ${labelWidth}` }
    : undefined;

  const wrapperCol = layout === 'horizontal'
    ? { flex: '1' }
    : undefined;

  return (
    <div
      className={`rottay-form-field rottay-form-field--classic rottay-form-field--${size} ${className}`}
      style={{ opacity: disabled ? 0.5 : 1, pointerEvents: disabled ? 'none' : undefined, ...style }}
      data-testid={testId}
    >
      <Form.Item
        label={label}
        name={name}
        required={required}
        validateStatus={validateStatus}
        help={helpText}
        labelCol={labelCol}
        wrapperCol={wrapperCol}
        layout={layout}
      >
        {children}
      </Form.Item>
    </div>
  );
}
