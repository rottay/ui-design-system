/**
 * @fileoverview Input Classic Engine - Rottay Design System
 * @description Ant Design implementation of the Input component.
 * Part of the Rottay Design System's input primitives collection.
 *
 * @remarks
 * The Classic engine wraps Ant Design's Input component, providing enterprise-grade
 * features including rich validation states, character counting, and various
 * input types. It maps Rottay's standardized props to Ant Design's API.
 *
 * **Ant Design Features Utilized:**
 * - Native validation states (error, warning)
 * - Built-in clear button with allowClear
 * - Character count display with showCount
 * - Password input with visibility toggle
 * - Search input with search callback
 * - Size variants (small, middle, large)
 * - Variant options (outlined, filled, borderless)
 *
 * **Prop Mapping:**
 * - `variant="filled"` → `variant="filled"`
 * - `variant="flushed"` → `variant="borderless"` + custom border-bottom
 * - `status="error"` → `status="error"`
 * - `status="warning"` → `status="warning"`
 * - `size="sm"` → `size="small"`
 * - `size="lg"` → `size="large"`
 * - `clearable` → `allowClear`
 *
 * **Special Type Handling:**
 * - `type="number"` → Uses Ant Design's InputNumber component
 * - `type="password"` → Uses Ant Design's Input.Password component
 * - `type="search"` → Uses Ant Design's Input.Search component
 *
 * @example Using Classic Engine
 * ```tsx
 * import { Input } from '@rottay/design-system';
 *
 * // Explicit Classic engine (default)
 * <Input
 *   engine="classic"
 *   placeholder="Enterprise input"
 *   status="warning"
 *   showCount
 *   maxLength={100}
 * />
 *
 * // Password with Ant Design features
 * <Input
 *   engine="classic"
 *   type="password"
 *   placeholder="Enter password"
 * />
 * ```
 *
 * @see {@link Input} for the main component
 * @see {@link ModernInput} for DaisyUI implementation
 * @see {@link RusticInput} for vanilla implementation
 * @module ClassicInput
 * @category Inputs
 * @package @rottay/design-system
 */

'use client';

import React, { forwardRef, useState, useCallback } from 'react';
import { Input as AntInput, InputNumber } from 'antd';
import type { InputProps } from '../Input.types';
import { INPUT_DEFAULTS, ANT_SIZE_MAP } from '../Input.types';

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

const ClassicInput = forwardRef<HTMLInputElement, InputProps>((props, ref) => {
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

  // Flushed variant custom styles using CSS variables
  const flushedStyles: React.CSSProperties = variant === 'flushed' ? {
    borderRadius: 0,
    borderTop: 'none',
    borderLeft: 'none',
    borderRight: 'none',
    borderBottom: '1px solid var(--ds-input-border)',
  } : {};

  // Props shared by Ant Input variants. InputNumber receives a narrower set to
  // avoid leaking unsupported props like `allowClear` and `showCount` to the DOM.
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
    className: `rottay-input rottay-input--classic ${className}`,
    style: {
      ...flushedStyles,
      ...style,
    },
    'aria-label': ariaLabel,
    'aria-describedby': ariaDescribedBy,
    'aria-required': required,
  };

  const numberProps = {
    id,
    name,
    placeholder,
    disabled,
    readOnly,
    autoComplete,
    autoFocus,
    size: ANT_SIZE_MAP[size],
    status: STATUS_MAP[computedStatus],
    prefix,
    maxLength,
    variant: VARIANT_MAP[variant],
    onFocus,
    onBlur,
    onKeyDown: handleKeyDown,
    className: `rottay-input rottay-input--classic ${className}`,
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
          {...numberProps}
          ref={ref as any}
          value={currentValue ? parseFloat(currentValue) : undefined}
          defaultValue={defaultValue ? parseFloat(defaultValue) : undefined}
          onChange={handleNumberChange}
          style={{ width: '100%', ...numberProps.style }}
          controls={false}
        />
        {hasError && errorMessage && (
          <span
            style={{
              display: 'block',
              marginTop: '0.25rem',
              fontSize: 'var(--ds-input-helper-font-size)',
              color: 'var(--ds-input-error-color)',
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
              marginTop: '0.25rem',
              fontSize: 'var(--ds-input-helper-font-size)',
              color: 'var(--ds-input-error-color)',
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
              marginTop: '0.25rem',
              fontSize: 'var(--ds-input-helper-font-size)',
              color: 'var(--ds-input-error-color)',
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
            marginTop: '0.25rem',
            fontSize: 'var(--ds-input-helper-font-size)',
            color: 'var(--ds-input-error-color)',
          }}
        >
          {errorMessage}
        </span>
      )}
    </div>
  );
});

ClassicInput.displayName = 'ClassicInput';

export default ClassicInput;
