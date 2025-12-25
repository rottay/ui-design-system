/**
 * Textarea - Titan Engine (Ant Design)
 */

import React from 'react';
import { Input } from 'antd';
import type { TextareaProps } from '../types';
import { TEXTAREA_DEFAULTS } from '../types';

const { TextArea: AntTextArea } = Input;

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

export default function TitanTextarea(props: TextareaProps): React.ReactElement {
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
    showCount,
    rows = TEXTAREA_DEFAULTS.rows,
    autoSize,
    allowClear,
    onChange,
    onFocus,
    onBlur,
    onPressEnter,
    onResize,
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

  const handlePressEnter = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (onPressEnter) {
      onPressEnter();
    }
  };

  return (
    <AntTextArea
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
      showCount={showCount}
      rows={rows}
      autoSize={autoSize}
      allowClear={allowClear}
      onChange={handleChange}
      onFocus={onFocus}
      onBlur={onBlur}
      onPressEnter={handlePressEnter}
      onResize={onResize}
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
