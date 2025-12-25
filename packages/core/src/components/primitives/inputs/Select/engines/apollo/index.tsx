/**
 * Select - Apollo Engine (Vanilla HTML/CSS)
 */

import React from 'react';
import type { SelectProps } from '../types';
import { SELECT_DEFAULTS } from '../types';

const SIZE_MAP = {
  sm: 'rottay-select--sm',
  md: 'rottay-select--md',
  lg: 'rottay-select--lg',
};

const VARIANT_MAP = {
  outlined: 'rottay-select--outlined',
  filled: 'rottay-select--filled',
  borderless: 'rottay-select--borderless',
};

const STATUS_MAP = {
  default: '',
  error: 'rottay-select--error',
  warning: 'rottay-select--warning',
  success: 'rottay-select--success',
};

export default function ApolloSelect(props: SelectProps): React.ReactElement {
  const {
    size = SELECT_DEFAULTS.size,
    variant = SELECT_DEFAULTS.variant,
    status = SELECT_DEFAULTS.status,
    placeholder,
    value,
    defaultValue,
    options = [],
    disabled,
    required,
    multiple,
    onChange,
    onFocus,
    onBlur,
    className,
    style,
    name,
    id,
    autoFocus,
    ...rest
  } = props;

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (onChange) {
      if (multiple) {
        const selectedOptions = Array.from(e.target.selectedOptions).map((opt) => opt.value);
        const selectedObjs = options.filter((o) => selectedOptions.includes(String(o.value)));
        onChange(selectedOptions, selectedObjs);
      } else {
        const selectedOption = options.find((o) => String(o.value) === e.target.value);
        onChange(e.target.value, selectedOption!);
      }
    }
  };

  const classes = [
    'rottay-select',
    SIZE_MAP[size!],
    VARIANT_MAP[variant!],
    STATUS_MAP[status!],
    disabled && 'rottay-select--disabled',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const cssVars = {
    '--select-height': `var(--select-${size}-height)`,
    '--select-padding': `var(--select-${size}-padding)`,
    '--select-font-size': `var(--select-${size}-font-size)`,
    '--select-border-color': `var(--select-${status}-border-color)`,
  } as React.CSSProperties;

  // Extract only valid HTML select attributes from rest
  const {
    readOnly: _readOnly,
    allowClear: _allowClear,
    showSearch: _showSearch,
    loading: _loading,
    filterOption: _filterOption,
    onSearch: _onSearch,
    onClear: _onClear,
    prefix: _prefix,
    suffix: _suffix,
    engine: _engine,
    ...htmlProps
  } = rest as any;

  return (
    <select
      className={classes}
      value={value as any}
      defaultValue={defaultValue as any}
      disabled={disabled}
      required={required}
      multiple={multiple}
      onChange={handleChange}
      onFocus={onFocus}
      onBlur={onBlur}
      style={{ ...cssVars, ...style }}
      name={name}
      id={id}
      autoFocus={autoFocus}
      {...htmlProps}
    >
      {placeholder && !value && !defaultValue && (
        <option value="" disabled>
          {placeholder}
        </option>
      )}
      {options.map((option) => (
        <option key={String(option.value)} value={option.value} disabled={option.disabled}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
