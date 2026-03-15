/**
 * @fileoverview PasswordInput Classic Engine - Rottay Design System
 * @description Ant Design implementation of the PasswordInput component.
 *
 * @module ClassicPasswordInput
 * @category Inputs
 * @package @rottay/design-system
 */

'use client';

import React, { useState, useCallback, useId } from 'react';
import { Input as AntInput } from 'antd';
import type { PasswordInputProps } from '../../types';
import { PASSWORD_INPUT_DEFAULTS, STRENGTH_COLORS, STRENGTH_WIDTHS } from '../../types';

const ANT_SIZE_MAP = {
  xs: 'small' as const,
  sm: 'small' as const,
  md: 'middle' as const,
  lg: 'large' as const,
  xl: 'large' as const,
};

export default function ClassicPasswordInput(props: PasswordInputProps): React.ReactElement {
  const {
    size = PASSWORD_INPUT_DEFAULTS.size,
    variant = PASSWORD_INPUT_DEFAULTS.variant,
    placeholder,
    value,
    defaultValue,
    disabled = PASSWORD_INPUT_DEFAULTS.disabled,
    readOnly = PASSWORD_INPUT_DEFAULTS.readOnly,
    required = PASSWORD_INPUT_DEFAULTS.required,
    error = PASSWORD_INPUT_DEFAULTS.error,
    errorMessage,
    maxLength,
    showToggle = PASSWORD_INPUT_DEFAULTS.showToggle,
    strengthIndicator = PASSWORD_INPUT_DEFAULTS.strengthIndicator,
    strengthLevel,
    onChange,
    onFocus,
    onBlur,
    onKeyDown,
    onPressEnter,
    className = '',
    style,
    name,
    id: providedId,
    autoComplete = PASSWORD_INPUT_DEFAULTS.autoComplete,
    autoFocus,
    'aria-label': ariaLabel,
    'data-testid': dataTestId,
  } = props;

  const generatedId = useId();
  const inputId = providedId || `password-classic-${generatedId}`;

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(e.target.value, e);
  }, [onChange]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    onKeyDown?.(e);
    if (e.key === 'Enter') {
      onPressEnter?.(e);
    }
  }, [onKeyDown, onPressEnter]);

  return (
    <div
      className={`rottay-password-input-classic ${className}`}
      style={{ display: 'inline-flex', flexDirection: 'column', width: '100%', ...style }}
      data-testid={dataTestId}
    >
      <AntInput.Password
        id={inputId}
        size={ANT_SIZE_MAP[size]}
        placeholder={placeholder}
        value={value}
        defaultValue={defaultValue}
        disabled={disabled}
        readOnly={readOnly}
        required={required}
        maxLength={maxLength}
        visibilityToggle={showToggle}
        onChange={handleChange}
        onFocus={onFocus}
        onBlur={onBlur}
        onKeyDown={handleKeyDown}
        name={name}
        autoComplete={autoComplete}
        autoFocus={autoFocus}
        aria-label={ariaLabel}
        status={error ? 'error' : undefined}
        variant={variant === 'filled' ? 'filled' : variant === 'unstyled' ? 'borderless' : undefined}
      />
      {strengthIndicator && strengthLevel && (
        <div
          className="rottay-password-strength"
          style={{
            marginTop: '4px',
            height: '4px',
            borderRadius: '2px',
            backgroundColor: 'var(--ds-color-neutral-200, #e8e8e8)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              width: STRENGTH_WIDTHS[strengthLevel],
              backgroundColor: STRENGTH_COLORS[strengthLevel],
              borderRadius: '2px',
              transition: 'width 0.3s ease, background-color 0.3s ease',
            }}
          />
        </div>
      )}
      {error && errorMessage && (
        <span
          style={{
            marginTop: '4px',
            fontSize: '12px',
            color: 'var(--ds-color-error-500, #ff4d4f)',
          }}
        >
          {errorMessage}
        </span>
      )}
    </div>
  );
}

ClassicPasswordInput.displayName = 'ClassicPasswordInput';
