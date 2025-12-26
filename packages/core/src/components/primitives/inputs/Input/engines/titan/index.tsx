/**
 * Input - Titan Engine (Ant Design)
 */

'use client';

import React, { forwardRef, useState, useCallback } from 'react';
import { Input as AntInput, InputNumber } from 'antd';
import type { InputProps } from '../../types';
import { INPUT_DEFAULTS, ANT_SIZE_MAP } from '../../types';

const STATUS_MAP = {
  default: undefined,
  error: 'error' as const,
  warning: 'warning' as const,
  success: undefined,
};

const VARIANT_MAP = {
  outline: undefined,
  filled: 'filled' as const,
  flushed: 'borderless' as const,
  unstyled: 'borderless' as const,
};

const TitanInput = forwardRef<HTMLInputElement, InputProps>((props, ref) => {
  const {
    size = INPUT_DEFAULTS.size,
    variant = INPUT_DEFAULTS.variant,
    status = INPUT_DEFAULTS.status,
    type = INPUT_DEFAULTS.type,
    placeholder,
    value: controlledValue,
    defaultValue,
    disabled = INPUT_DEFAULTS.disabled,
    readOnly = INPUT_DEFAULTS.readOnly,
    required = INPUT_DEFAULTS.required,
    error = INPUT_DEFAULTS.error,
    errorMessage,
    maxLength,
    prefix,
    suffix,
    clearable = INPUT_DEFAULTS.clearable,
    showCount = INPUT_DEFAULTS.showCount,
    onChange,
    onFocus,
    onBlur,
    onKeyDown,
    onPressEnter,
    // onClear is handled internally by Ant Design's allowClear
    onClear: _onClear,
    className = '',
    style = {},
    name,
    id,
    autoComplete,
    autoFocus,
    'aria-label': ariaLabel,
    'aria-describedby': ariaDescribedBy,
  } = props;

  // Handle controlled/uncontrolled for number type
  const [internalValue, setInternalValue] = useState(defaultValue ?? '');
  const isControlled = controlledValue !== undefined;
  const currentValue = isControlled ? controlledValue : internalValue;

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      if (!isControlled) {
        setInternalValue(newValue);
      }
      onChange?.(newValue, e);
    },
    [isControlled, onChange]
  );

  const handleNumberChange = useCallback(
    (newValue: number | string | null) => {
      const stringValue = newValue?.toString() ?? '';
      if (!isControlled) {
        setInternalValue(stringValue);
      }
      // Create synthetic event for number input
      const syntheticEvent = {
        target: { value: stringValue },
      } as React.ChangeEvent<HTMLInputElement>;
      onChange?.(stringValue, syntheticEvent);
    },
    [isControlled, onChange]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        onPressEnter?.(e);
      }
      onKeyDown?.(e);
    },
    [onKeyDown, onPressEnter]
  );

  // Determine status
  const computedStatus = error ? 'error' : status;
  const hasError = error || status === 'error';

  // Flushed variant custom styles
  const flushedStyles: React.CSSProperties = variant === 'flushed' ? {
    borderRadius: 0,
    borderTop: 'none',
    borderLeft: 'none',
    borderRight: 'none',
    borderBottom: '1px solid #d9d9d9',
  } : {};

  // Common props
  const commonProps = {
    id,
    name,
    placeholder,
    disabled,
    readOnly,
    autoComplete,
    autoFocus,
    size: ANT_SIZE_MAP[size],
    status: STATUS_MAP[computedStatus],
    allowClear: clearable ? { clearIcon: undefined } : false,
    prefix,
    suffix,
    maxLength,
    showCount,
    variant: VARIANT_MAP[variant],
    onFocus,
    onBlur,
    onKeyDown: handleKeyDown,
    onPressEnter: onPressEnter as () => void,
    className: `rottay-input rottay-input--titan ${className}`,
    style: {
      ...flushedStyles,
      ...style,
    },
    'aria-label': ariaLabel,
    'aria-describedby': ariaDescribedBy,
    'aria-required': required,
  };

  // Handle number type with InputNumber
  if (type === 'number') {
    return (
      <div style={{ width: '100%' }}>
        <InputNumber
          {...commonProps}
          ref={ref as any}
          value={currentValue ? parseFloat(currentValue) : undefined}
          defaultValue={defaultValue ? parseFloat(defaultValue) : undefined}
          onChange={handleNumberChange}
          style={{ width: '100%', ...commonProps.style }}
          controls={false}
        />
        {hasError && errorMessage && (
          <span
            style={{
              display: 'block',
              marginTop: '4px',
              fontSize: '12px',
              color: '#ff4d4f',
            }}
          >
            {errorMessage}
          </span>
        )}
      </div>
    );
  }

  // Handle password type
  if (type === 'password') {
    return (
      <div style={{ width: '100%' }}>
        <AntInput.Password
          {...commonProps}
          ref={ref as any}
          value={currentValue}
          defaultValue={defaultValue}
          onChange={handleChange}
        />
        {hasError && errorMessage && (
          <span
            style={{
              display: 'block',
              marginTop: '4px',
              fontSize: '12px',
              color: '#ff4d4f',
            }}
          >
            {errorMessage}
          </span>
        )}
      </div>
    );
  }

  // Handle search type
  if (type === 'search') {
    return (
      <div style={{ width: '100%' }}>
        <AntInput.Search
          {...commonProps}
          ref={ref as any}
          value={currentValue}
          defaultValue={defaultValue}
          onChange={handleChange}
          onSearch={(value) => {
            const syntheticEvent = {
              target: { value },
            } as React.ChangeEvent<HTMLInputElement>;
            onChange?.(value, syntheticEvent);
          }}
        />
        {hasError && errorMessage && (
          <span
            style={{
              display: 'block',
              marginTop: '4px',
              fontSize: '12px',
              color: '#ff4d4f',
            }}
          >
            {errorMessage}
          </span>
        )}
      </div>
    );
  }

  // Default text input (also handles email, tel, url)
  return (
    <div style={{ width: '100%' }}>
      <AntInput
        {...commonProps}
        ref={ref as any}
        type={type}
        value={currentValue}
        defaultValue={defaultValue}
        onChange={handleChange}
      />
      {hasError && errorMessage && (
        <span
          style={{
            display: 'block',
            marginTop: '4px',
            fontSize: '12px',
            color: '#ff4d4f',
          }}
        >
          {errorMessage}
        </span>
      )}
    </div>
  );
});

TitanInput.displayName = 'TitanInput';

export default TitanInput;
