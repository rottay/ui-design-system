/**
 * Select - Titan Engine (Ant Design)
 */

import React from 'react';
import { Select as AntSelect } from 'antd';
import type { SelectProps } from '../types';
import { SELECT_DEFAULTS } from '../types';

const SIZE_MAP = {
  sm: 'small' as const,
  md: 'middle' as const,
  lg: 'large' as const,
};

const STATUS_MAP = {
  default: undefined,
  error: 'error' as const,
  warning: 'warning' as const,
  success: undefined,
};

const VARIANT_MAP = {
  outlined: 'outlined' as const,
  filled: 'filled' as const,
  borderless: 'borderless' as const,
};

export default function TitanSelect(props: SelectProps): React.ReactElement {
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
    allowClear,
    showSearch,
    loading,
    filterOption,
    onChange,
    onFocus,
    onBlur,
    onSearch,
    onClear,
    className,
    style,
    name,
    id,
    autoFocus,
    ...rest
  } = props;

  const handleChange = (val: any, option: any) => {
    if (onChange) {
      onChange(val, option);
    }
  };

  // Convert options to Ant Design format
  const antOptions = options.map((opt) => ({
    value: opt.value,
    label: opt.label,
    disabled: opt.disabled,
  }));

  return (
    <AntSelect
      size={SIZE_MAP[size!]}
      variant={VARIANT_MAP[variant!]}
      status={STATUS_MAP[status!]}
      placeholder={placeholder}
      value={value}
      defaultValue={defaultValue}
      options={antOptions}
      disabled={disabled}
      mode={multiple ? 'multiple' : undefined}
      allowClear={allowClear}
      showSearch={showSearch}
      loading={loading}
      filterOption={filterOption as any}
      onChange={handleChange}
      onFocus={onFocus as any}
      onBlur={onBlur as any}
      onSearch={onSearch}
      onClear={onClear}
      className={className}
      style={style}
      id={id}
      autoFocus={autoFocus}
      {...rest}
    />
  );
}
