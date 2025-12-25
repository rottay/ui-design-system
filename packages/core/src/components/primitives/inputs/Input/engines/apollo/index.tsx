/**
 * Input - Apollo Engine (Vanilla HTML/CSS)
 */

import React from 'react';
import type { InputProps } from '../types';
import { INPUT_DEFAULTS } from '../types';

const SIZE_MAP = {
  sm: 'rottay-input--sm',
  md: 'rottay-input--md',
  lg: 'rottay-input--lg',
};

const VARIANT_MAP = {
  outlined: 'rottay-input--outlined',
  filled: 'rottay-input--filled',
  borderless: 'rottay-input--borderless',
};

const STATUS_MAP = {
  default: '',
  error: 'rottay-input--error',
  warning: 'rottay-input--warning',
  success: 'rottay-input--success',
};

export default function ApolloInput(props: InputProps): React.ReactElement {
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
    prefix,
    suffix,
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
    'rottay-input',
    SIZE_MAP[size!],
    VARIANT_MAP[variant!],
    STATUS_MAP[status!],
    disabled && 'rottay-input--disabled',
    readOnly && 'rottay-input--readonly',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const cssVars = {
    '--input-height': `var(--input-${size}-height)`,
    '--input-padding': `var(--input-${size}-padding)`,
    '--input-font-size': `var(--input-${size}-font-size)`,
    '--input-border-color': `var(--input-${status}-border-color)`,
  } as React.CSSProperties;

  if (prefix || suffix) {
    return (
      <div className="rottay-input-wrapper" style={{ ...cssVars, ...style }}>
        {prefix && <span className="rottay-input-prefix">{prefix}</span>}
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
          name={name}
          id={id}
          autoComplete={autoComplete}
          autoFocus={autoFocus}
          {...rest}
        />
        {suffix && <span className="rottay-input-suffix">{suffix}</span>}
      </div>
    );
  }

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
      style={{ ...cssVars, ...style }}
      name={name}
      id={id}
      autoComplete={autoComplete}
      autoFocus={autoFocus}
      {...rest}
    />
  );
}
