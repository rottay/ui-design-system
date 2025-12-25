/**
 * Select - Hermes Engine (DaisyUI/Tailwind)
 */

import React from 'react';
import type { SelectProps } from '../types';
import { SELECT_DEFAULTS } from '../types';

const SIZE_MAP = {
  sm: 'select-sm',
  md: 'select-md',
  lg: 'select-lg',
};

const STATUS_MAP = {
  default: '',
  error: 'select-error',
  warning: 'select-warning',
  success: 'select-success',
};

export default function HermesSelect(props: SelectProps): React.ReactElement {
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
    'select',
    variant === 'borderless' ? '' : 'select-bordered',
    SIZE_MAP[size!],
    STATUS_MAP[status!],
    className,
  ]
    .filter(Boolean)
    .join(' ');

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
      style={style}
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
