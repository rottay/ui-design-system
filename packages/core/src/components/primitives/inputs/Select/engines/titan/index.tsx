/**
 * Select - Titan Engine (Ant Design)
 */

'use client';

import React from 'react';
import { Select as AntSelect } from 'antd';
import type { SelectProps, SelectOption } from '../../types';
import { SELECT_DEFAULTS, SIZE_MAP } from '../../types';

/**
 * Utility to get label text from option
 */
function getLabelText(label: React.ReactNode): string {
  if (typeof label === 'string') return label;
  if (typeof label === 'number') return String(label);
  return '';
}

// Map our sizes to Ant Design sizes
const ANT_SIZE_MAP = {
  xs: 'small' as const,
  sm: 'small' as const,
  md: 'middle' as const,
  lg: 'large' as const,
  xl: 'large' as const,
};

// Map our variants to Ant Design variants
const ANT_VARIANT_MAP: Record<string, 'outlined' | 'filled' | 'borderless'> = {
  outline: 'outlined',
  filled: 'filled',
  flushed: 'borderless',
  default: 'outlined',
};

// Map our status to Ant Design status
const ANT_STATUS_MAP = {
  default: undefined,
  error: 'error' as const,
  warning: 'warning' as const,
  success: undefined, // Ant doesn't have success status
};

export default function TitanSelect(props: SelectProps): React.ReactElement {
  const {
    value,
    defaultValue,
    options = [],
    placeholder,
    size = SELECT_DEFAULTS.size,
    variant = SELECT_DEFAULTS.variant,
    multiple = SELECT_DEFAULTS.multiple,
    searchable,
    clearable,
    disabled = SELECT_DEFAULTS.disabled,
    loading = SELECT_DEFAULTS.loading,
    error = SELECT_DEFAULTS.error,
    maxTagCount,
    status = SELECT_DEFAULTS.status,
    filterOption,
    onChange,
    onSearch,
    onFocus,
    onBlur,
    onClear,
    className,
    style,
    name,
    id,
    autoFocus,
    // Aliases
    allowClear,
    showSearch,
    ...rest
  } = props;

  // Resolve aliases
  const isClearable = clearable || allowClear;
  const isSearchable = searchable || showSearch;

  // Determine effective status
  const effectiveStatus = error ? 'error' : status;

  // Handle change with proper typing
  const handleChange = (val: any, option: any) => {
    if (onChange) {
      // Convert Ant Design option to our format
      if (Array.isArray(option)) {
        const opts: SelectOption[] = option.map((o: any) => ({
          value: o.value,
          label: getLabelText(o.label),
          disabled: o.disabled,
        }));
        onChange(val, opts);
      } else if (option) {
        const opt: SelectOption = {
          value: option.value,
          label: getLabelText(option.label),
          disabled: option.disabled,
        };
        onChange(val, opt);
      } else {
        onChange(val, undefined);
      }
    }
  };

  // Convert options to Ant Design format
  const antOptions = options.map((opt) => ({
    value: opt.value,
    label: opt.icon ? (
      <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {opt.icon}
        <span>{opt.label}</span>
      </span>
    ) : opt.label,
    disabled: opt.disabled,
  }));

  // Build size-specific styles for xs and xl
  const sizeConfig = SIZE_MAP[size];
  const customStyle: React.CSSProperties = {
    ...style,
    ...(size === 'xs' && {
      fontSize: `${sizeConfig.fontSize}px`,
    }),
    ...(size === 'xl' && {
      fontSize: `${sizeConfig.fontSize}px`,
    }),
  };

  // Build className with size modifiers
  const selectClassName = [
    'rottay-select',
    `rottay-select--${size}`,
    `rottay-select--${variant}`,
    effectiveStatus !== 'default' ? `rottay-select--${effectiveStatus}` : '',
    className,
  ].filter(Boolean).join(' ');

  // Strip out non-Ant props from rest
  const {
    engine: _engine,
    readOnly: _readOnly,
    required: _required,
    prefix: _prefix,
    suffix: _suffix,
    children: _children,
    ...antProps
  } = rest as any;

  return (
    <AntSelect
      value={value}
      defaultValue={defaultValue}
      options={antOptions}
      placeholder={placeholder}
      size={ANT_SIZE_MAP[size]}
      variant={ANT_VARIANT_MAP[variant]}
      status={ANT_STATUS_MAP[effectiveStatus]}
      mode={multiple ? 'multiple' : undefined}
      showSearch={isSearchable}
      allowClear={isClearable}
      disabled={disabled}
      loading={loading}
      maxTagCount={maxTagCount}
      filterOption={filterOption as any}
      onChange={handleChange}
      onSearch={onSearch}
      onFocus={onFocus as any}
      onBlur={onBlur as any}
      onClear={onClear}
      className={selectClassName}
      style={customStyle}
      id={id}
      autoFocus={autoFocus}
      {...antProps}
    />
  );
}

TitanSelect.displayName = 'TitanSelect';
