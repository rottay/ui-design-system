/**
 * Input - Titan Engine (Ant Design)
 */

import React from 'react';
import { Input as AntInput } from 'antd';
import type { InputProps } from '../types';
import { INPUT_DEFAULTS } from '../types';

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
  outlined: undefined,
  filled: 'filled' as const,
  borderless: 'borderless' as const,
};

export default function TitanInput(props: InputProps): React.ReactElement {
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
    allowClear,
    showPassword,
    type = INPUT_DEFAULTS.type,
    onChange,
    onFocus,
    onBlur,
    onClear,
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

  const handlePressEnter = () => {
    if (onPressEnter) {
      onPressEnter();
    }
  };

  if (type === 'password' && showPassword) {
    return (
      <AntInput.Password
        size={SIZE_MAP[size!]}
        variant={VARIANT_MAP[variant!]}
        status={STATUS_MAP[status!]}
        placeholder={placeholder}
        value={value}
        defaultValue={defaultValue}
        disabled={disabled}
        readOnly={readOnly}
        required={required}
        maxLength={maxLength}
        prefix={prefix}
        suffix={suffix}
        allowClear={allowClear}
        onChange={handleChange}
        onFocus={onFocus}
        onBlur={onBlur}
        onPressEnter={handlePressEnter}
        className={className}
        style={style}
        name={name}
        id={id}
        autoComplete={autoComplete}
        autoFocus={autoFocus}
        {...rest}
      />
    );
  }

  return (
    <AntInput
      size={SIZE_MAP[size!]}
      variant={VARIANT_MAP[variant!]}
      status={STATUS_MAP[status!]}
      type={type}
      placeholder={placeholder}
      value={value}
      defaultValue={defaultValue}
      disabled={disabled}
      readOnly={readOnly}
      required={required}
      maxLength={maxLength}
      prefix={prefix}
      suffix={suffix}
      allowClear={allowClear}
      onChange={handleChange}
      onFocus={onFocus}
      onBlur={onBlur}
      onPressEnter={handlePressEnter}
      className={className}
      style={style}
      name={name}
      id={id}
      autoComplete={autoComplete}
      autoFocus={autoFocus}
      {...rest}
    />
  );
}
