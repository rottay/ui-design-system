/**
 * Textarea - Hermes Engine (DaisyUI/Tailwind)
 */

import React from 'react';
import type { TextareaProps } from '../core';
import { TEXTAREA_DEFAULTS } from '../core';

const SIZE_MAP = {
  sm: 'textarea-sm',
  md: 'textarea-md',
  lg: 'textarea-lg',
};

const STATUS_MAP = {
  default: '',
  error: 'textarea-error',
  warning: 'textarea-warning',
  success: 'textarea-success',
};

const VARIANT_MAP = {
  outlined: 'textarea-bordered',
  filled: '',
  borderless: '',
};

export default function HermesTextarea(props: TextareaProps): React.ReactElement {
  const {
    size = TEXTAREA_DEFAULTS.size,
    variant = TEXTAREA_DEFAULTS.variant,
    status = TEXTAREA_DEFAULTS.status,
    placeholder,
    value,
    defaultValue,
    disabled,
    readOnly,
    required,
    maxLength,
    rows = TEXTAREA_DEFAULTS.rows,
    onChange,
    onFocus,
    onBlur,
    className,
    style,
    name,
    id,
    autoComplete,
    autoFocus,
    ...rest
  } = props;

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (onChange) {
      onChange(e.target.value, e);
    }
  };

  const classes = [
    'textarea',
    SIZE_MAP[size!],
    VARIANT_MAP[variant!],
    STATUS_MAP[status!],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <textarea
      className={classes}
      placeholder={placeholder}
      value={value}
      defaultValue={defaultValue}
      disabled={disabled}
      readOnly={readOnly}
      required={required}
      maxLength={maxLength}
      rows={rows}
      onChange={handleChange}
      onFocus={onFocus}
      onBlur={onBlur}
      style={style}
      name={name}
      id={id}
      autoComplete={autoComplete}
      autoFocus={autoFocus}
      {...rest}
    />
  );
}
