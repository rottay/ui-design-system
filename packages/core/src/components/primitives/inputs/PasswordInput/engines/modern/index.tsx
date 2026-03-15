/**
 * @fileoverview PasswordInput Modern Engine - Rottay Design System
 * @description DaisyUI/Tailwind CSS implementation of the PasswordInput component.
 *
 * @module ModernPasswordInput
 * @category Inputs
 * @package @rottay/design-system
 */

'use client';

import React, { useState, useCallback, useId } from 'react';
import type { PasswordInputProps } from '../../PasswordInput.types';
import { PASSWORD_INPUT_DEFAULTS, STRENGTH_COLORS, STRENGTH_WIDTHS } from '../../PasswordInput.types';

const DAISY_SIZE_MAP = {
  xs: 'input-xs',
  sm: 'input-sm',
  md: 'input-md',
  lg: 'input-lg',
  xl: 'input-lg',
};

export default function ModernPasswordInput(props: PasswordInputProps): React.ReactElement {
  const {
    size = PASSWORD_INPUT_DEFAULTS.size,
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
  const inputId = providedId || `password-modern-${generatedId}`;
  const [visible, setVisible] = useState(false);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(e.target.value, e);
  }, [onChange]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    onKeyDown?.(e);
    if (e.key === 'Enter') {
      onPressEnter?.(e);
    }
  }, [onKeyDown, onPressEnter]);

  const inputClasses = [
    'input',
    'input-bordered',
    DAISY_SIZE_MAP[size],
    error && 'input-error',
    'w-full',
    'pr-10',
  ].filter(Boolean).join(' ');

  return (
    <div
      className={`form-control w-full ${className}`}
      style={style}
      data-testid={dataTestId}
    >
      <div className="relative">
        <input
          id={inputId}
          type={visible ? 'text' : 'password'}
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
          autoComplete={autoComplete}
          autoFocus={autoFocus}
          aria-label={ariaLabel}
          aria-invalid={error}
          className={inputClasses}
        />
        {showToggle && (
          <button
            type="button"
            className="btn btn-ghost btn-xs absolute right-2 top-1/2 -translate-y-1/2"
            onClick={() => setVisible(!visible)}
            tabIndex={-1}
            aria-label={visible ? 'Hide password' : 'Show password'}
          >
            {visible ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                <line x1="1" y1="1" x2="23" y2="23" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </button>
        )}
      </div>
      {strengthIndicator && strengthLevel && (
        <div className="w-full h-1 rounded-full bg-base-300 mt-1 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: STRENGTH_WIDTHS[strengthLevel],
              backgroundColor: STRENGTH_COLORS[strengthLevel],
            }}
          />
        </div>
      )}
      {error && errorMessage && (
        <label className="label">
          <span className="label-text-alt text-error">{errorMessage}</span>
        </label>
      )}
    </div>
  );
}

ModernPasswordInput.displayName = 'ModernPasswordInput';
