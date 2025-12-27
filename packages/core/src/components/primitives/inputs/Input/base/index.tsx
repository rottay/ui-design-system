/**
 * Input - Base Component
 * Uses CSS variables from design tokens for consistent styling
 */

'use client';

import React, { forwardRef, useState, useCallback, useRef, useEffect } from 'react';
import type { InputProps } from '../types';
import { INPUT_DEFAULTS, SIZE_MAP } from '../types';

/**
 * Base Input component using CSS variables.
 * This is extended by engine-specific implementations.
 */
export const BaseInput = forwardRef<HTMLInputElement, InputProps>(
  (props, ref) => {
    const {
      value: controlledValue,
      defaultValue,
      placeholder,
      type = INPUT_DEFAULTS.type,
      size = INPUT_DEFAULTS.size,
      variant = INPUT_DEFAULTS.variant,
      status = INPUT_DEFAULTS.status,
      disabled = INPUT_DEFAULTS.disabled,
      readOnly = INPUT_DEFAULTS.readOnly,
      required = INPUT_DEFAULTS.required,
      error = INPUT_DEFAULTS.error,
      errorMessage,
      prefix,
      suffix,
      clearable = INPUT_DEFAULTS.clearable,
      maxLength,
      minLength,
      autoComplete,
      autoFocus,
      name,
      showCount = INPUT_DEFAULTS.showCount,
      onChange,
      onFocus,
      onBlur,
      onKeyDown,
      onPressEnter,
      onClear,
      className = '',
      style = {},
      id,
      'data-testid': dataTestId,
      'aria-label': ariaLabel,
      'aria-describedby': ariaDescribedBy,
    } = props;

    // Handle controlled/uncontrolled
    const [internalValue, setInternalValue] = useState(defaultValue ?? '');
    const isControlled = controlledValue !== undefined;
    const currentValue = isControlled ? controlledValue : internalValue;

    const [isFocused, setIsFocused] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    // Merge refs
    useEffect(() => {
      if (ref) {
        if (typeof ref === 'function') {
          ref(inputRef.current);
        } else {
          (ref as React.MutableRefObject<HTMLInputElement | null>).current = inputRef.current;
        }
      }
    }, [ref]);

    // Handle auto focus
    useEffect(() => {
      if (autoFocus && inputRef.current) {
        inputRef.current.focus();
      }
    }, [autoFocus]);

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

    const handleFocus = useCallback(
      (e: React.FocusEvent<HTMLInputElement>) => {
        setIsFocused(true);
        onFocus?.(e);
      },
      [onFocus]
    );

    const handleBlur = useCallback(
      (e: React.FocusEvent<HTMLInputElement>) => {
        setIsFocused(false);
        onBlur?.(e);
      },
      [onBlur]
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

    const handleClear = useCallback(() => {
      if (!isControlled) {
        setInternalValue('');
      }
      onClear?.();
      // Trigger onChange with empty value
      if (inputRef.current) {
        const syntheticEvent = {
          target: { value: '' },
        } as React.ChangeEvent<HTMLInputElement>;
        onChange?.('', syntheticEvent);
      }
      inputRef.current?.focus();
    }, [isControlled, onChange, onClear]);

    // Determine if error state
    const hasError = error || status === 'error';

    // Get size values
    const sizeValues = SIZE_MAP[size] || SIZE_MAP.md;

    // Build CSS variables for the input
    const inputVars: React.CSSProperties = {
      '--input-height': sizeValues.height,
      '--input-padding-x': sizeValues.paddingX,
      '--input-font-size': sizeValues.fontSize,
      '--input-bg': variant === 'filled' ? '#f5f5f5' : 'transparent',
      '--input-border-color': hasError ? '#ff4d4f' : '#d9d9d9',
      '--input-focus-border': hasError ? '#ff4d4f' : '#1890ff',
      '--input-border-radius': '6px',
      '--input-transition': 'all 0.2s ease',
      '--input-placeholder-color': '#bfbfbf',
    } as React.CSSProperties;

    // Container styles
    const containerStyle: React.CSSProperties = {
      ...inputVars,
      position: 'relative',
      display: 'inline-flex',
      alignItems: 'center',
      width: '100%',
      height: 'var(--input-height)',
      backgroundColor: 'var(--input-bg)',
      borderRadius: variant === 'flushed' ? '0' : 'var(--input-border-radius)',
      border: variant === 'flushed'
        ? 'none'
        : variant === 'unstyled'
          ? 'none'
          : isFocused
            ? '1px solid var(--input-focus-border)'
            : '1px solid var(--input-border-color)',
      borderBottom: variant === 'flushed'
        ? isFocused
          ? '2px solid var(--input-focus-border)'
          : '1px solid var(--input-border-color)'
        : undefined,
      transition: 'var(--input-transition)',
      opacity: disabled ? 0.6 : 1,
      cursor: disabled ? 'not-allowed' : 'text',
      boxShadow: isFocused && !hasError && variant !== 'unstyled'
        ? '0 0 0 2px rgba(24, 144, 255, 0.2)'
        : hasError && variant !== 'unstyled'
          ? '0 0 0 2px rgba(255, 77, 79, 0.2)'
          : 'none',
      ...style,
    };

    // Input styles
    const inputStyle: React.CSSProperties = {
      flex: 1,
      width: '100%',
      height: '100%',
      padding: `0 var(--input-padding-x)`,
      paddingLeft: prefix ? '0' : undefined,
      paddingRight: suffix || (clearable && currentValue) ? '0' : undefined,
      fontSize: 'var(--input-font-size)',
      fontFamily: 'inherit',
      backgroundColor: 'transparent',
      border: 'none',
      outline: 'none',
      color: 'inherit',
      cursor: disabled ? 'not-allowed' : 'text',
    };

    // Affix styles
    const affixStyle: React.CSSProperties = {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '0 8px',
      color: 'var(--input-placeholder-color)',
      userSelect: 'none',
    };

    // Clear button styles
    const clearButtonStyle: React.CSSProperties = {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '0 8px',
      color: 'var(--input-placeholder-color)',
      cursor: 'pointer',
      transition: 'color 0.2s',
      background: 'none',
      border: 'none',
    };

    // Character count styles
    const countStyle: React.CSSProperties = {
      position: 'absolute',
      right: '8px',
      bottom: '-20px',
      fontSize: '12px',
      color: hasError ? '#ff4d4f' : 'var(--input-placeholder-color)',
    };

    const showClearButton = clearable && currentValue && !disabled && !readOnly;

    // Build class names
    const containerClasses = [
      'rottay-input',
      `rottay-input--${size}`,
      `rottay-input--${variant}`,
      isFocused && 'rottay-input--focused',
      hasError && 'rottay-input--error',
      disabled && 'rottay-input--disabled',
      readOnly && 'rottay-input--readonly',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div className="rottay-input-wrapper" style={{ position: 'relative', width: '100%' }}>
        <div
          className={containerClasses}
          style={containerStyle}
          onClick={() => inputRef.current?.focus()}
        >
          {prefix && (
            <span className="rottay-input__prefix" style={affixStyle}>
              {prefix}
            </span>
          )}

          <input
            ref={inputRef}
            id={id}
            name={name}
            type={type}
            value={currentValue}
            placeholder={placeholder}
            disabled={disabled}
            readOnly={readOnly}
            required={required}
            maxLength={maxLength}
            minLength={minLength}
            autoComplete={autoComplete}
            autoFocus={autoFocus}
            aria-label={ariaLabel}
            aria-describedby={ariaDescribedBy}
            aria-invalid={hasError}
            data-testid={dataTestId}
            style={inputStyle}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
          />

          {showClearButton && (
            <button
              type="button"
              className="rottay-input__clear"
              style={clearButtonStyle}
              onClick={handleClear}
              aria-label="Clear input"
              tabIndex={-1}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
            </button>
          )}

          {suffix && (
            <span className="rottay-input__suffix" style={affixStyle}>
              {suffix}
            </span>
          )}
        </div>

        {showCount && maxLength && (
          <span className="rottay-input__count" style={countStyle}>
            {currentValue.length}/{maxLength}
          </span>
        )}

        {hasError && errorMessage && (
          <span
            className="rottay-input__error-message"
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
);

BaseInput.displayName = 'BaseInput';
