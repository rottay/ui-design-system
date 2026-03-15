'use client';

/**
 * @fileoverview FormField Classic Engine - Rottay Design System
 * @description Ant Design implementation of the FormField component.
 * Wraps Ant Design's Form.Item for a simplified, standalone usage.
 *
 * @module FormField/Engines/Classic
 * @category Inputs
 * @package @rottay/design-system
 */

import React from 'react';
import { Form } from 'antd';
import type { FormFieldProps } from '../../types';
import { FORMFIELD_DEFAULTS } from '../../types';

/**
 * Classic Engine implementation of the FormField component.
 * Wraps Ant Design's Form.Item component.
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

  const validateStatus = error ? 'error' : undefined;
  const helpText = error || help;

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
