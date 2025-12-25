/**
 * Input - Hermes Engine (DaisyUI/Tailwind)
 */

import React from 'react';
import type { InputProps } from '../types';
import { INPUT_DEFAULTS } from '../types';

const SIZE_MAP = {
  sm: 'input-sm',
  md: 'input-md',
  lg: 'input-lg',
};

const STATUS_MAP = {
  default: '',
  error: 'input-error',
  warning: 'input-warning',
  success: 'input-success',
};

export default function HermesInput(props: InputProps): React.ReactElement {
  const {
    size = INPUT_DEFAULTS.size,
    variant = INPUT_DEFAULTS.variant,
    status = INPUT_DEFAULTS.status,
    placeholder,
    value,
    defaultValue,
    disabled,
    readOnly,
    required,
    maxLength,
    type = INPUT_DEFAULTS.type,
    onChange,
    onFocus,
    onBlur,
    onPressEnter,
    className,
    style,
    name,
    id,
    autoComplete,
    autoFocus,
    ...rest
  } = props;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange) {
      onChange(e.target.value, e);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && onPressEnter) {
      onPressEnter();
    }
  };

  const classes = [
    'input',
    variant === 'borderless' ? '' : 'input-bordered',
    SIZE_MAP[size!],
    STATUS_MAP[status!],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  // Extract only valid HTML input attributes from rest
  const {
    prefix: _prefix,
    suffix: _suffix,
    allowClear: _allowClear,
    showPassword: _showPassword,
    onClear: _onClear,
    onPressEnter: _onPressEnter,
    engine: _engine,
    ...htmlProps
  } = rest as any;

  return (
    <input
      type={type}
      className={classes}
      placeholder={placeholder}
      value={value}
      defaultValue={defaultValue}
      disabled={disabled}
      readOnly={readOnly}
      required={required}
      maxLength={maxLength}
      onChange={handleChange}
      onFocus={onFocus}
      onBlur={onBlur}
      onKeyDown={handleKeyDown}
      style={style}
      name={name}
      id={id}
      autoComplete={autoComplete}
      autoFocus={autoFocus}
      {...htmlProps}
    />
  );
}
