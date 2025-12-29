/**
 * @fileoverview Input Apollo Engine - Rottay Design System
 * @description Pure HTML/CSS implementation of the Input component using CSS variables.
 * Part of the Rottay Design System's input primitives collection.
 *
 * @remarks
 * The Apollo engine provides a headless input implementation using only
 * native HTML elements and CSS variables for theming. This ensures
 * multi-tenant support through the CSS cascade.
 *
 * **Key Features:**
 * - Zero UI library dependencies
 * - Full CSS variable theming (var(--ds-input-*))
 * - Controlled and uncontrolled modes
 * - Focus, hover, and disabled state handling
 * - Clear button with custom SVG icon
 * - Character count display
 * - Error message display
 * - Multiple variants and validation states
 *
 * @module ApolloInput
 * @category Inputs
 * @package @rottay/design-system
 */

'use client';

import React, { forwardRef, useState, useCallback, useRef, useEffect } from 'react';
import type { InputProps } from '../../types';
import { INPUT_DEFAULTS, SIZE_MAP } from '../../types';

const ApolloInput = forwardRef<HTMLInputElement, InputProps>((props, ref) => {
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
    minLength,
    prefix,
    suffix,
    clearable = INPUT_DEFAULTS.clearable,
    showCount = INPUT_DEFAULTS.showCount,
    onChange,
    onFocus,
    onBlur,
    onKeyDown,
    onPressEnter,
    onClear,
    className = '',
    style = {},
    name,
    id,
    autoComplete,
    autoFocus,
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
    const syntheticEvent = {
      target: { value: '' },
    } as React.ChangeEvent<HTMLInputElement>;
    onChange?.('', syntheticEvent);
    inputRef.current?.focus();
  }, [isControlled, onChange, onClear]);

  // Determine if error state
  const hasError = error || status === 'error';
  const hasWarning = status === 'warning';
  const hasSuccess = status === 'success';

  // Get size values from CSS variables
  const sizeValues = SIZE_MAP[size] || SIZE_MAP.md;

  // Determine border color based on state using CSS variables
  const getBorderColor = () => {
    if (hasError) return 'var(--ds-input-error-border)';
    if (hasWarning) return 'var(--ds-input-warning-border)';
    if (hasSuccess) return 'var(--ds-input-success-border)';
    if (isFocused) return 'var(--ds-input-border-focus)';
    return 'var(--ds-input-border)';
  };

  // Determine box shadow based on state
  const getBoxShadow = () => {
    if (variant === 'unstyled') return 'none';
    if (hasError && isFocused) return 'var(--ds-input-error-shadow-focus)';
    if (hasWarning && isFocused) return 'var(--ds-input-warning-shadow-focus)';
    if (hasSuccess && isFocused) return 'var(--ds-input-success-shadow-focus)';
    if (isFocused) return 'var(--ds-input-shadow-focus)';
    return 'none';
  };

  // Determine background based on variant
  const getBackground = () => {
    if (disabled) return 'var(--ds-input-bg-disabled)';
    if (variant === 'filled') {
      if (isFocused) return 'var(--ds-input-filled-bg-focus)';
      return 'var(--ds-input-filled-bg)';
    }
    return 'var(--ds-input-bg)';
  };

  // Container styles using CSS variables
  const containerStyle: React.CSSProperties = {
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
    width: '100%',
    height: sizeValues.height,
    backgroundColor: getBackground(),
    borderRadius: variant === 'flushed' ? 0 : 'var(--ds-input-radius)',
    border: variant === 'flushed'
      ? 'none'
      : variant === 'unstyled'
        ? 'none'
        : `1px solid ${getBorderColor()}`,
    borderBottom: variant === 'flushed'
      ? `${isFocused ? 2 : 1}px solid ${getBorderColor()}`
      : undefined,
    transition: 'var(--ds-input-transition)',
    opacity: disabled ? 0.6 : 1,
    cursor: disabled ? 'not-allowed' : 'text',
    boxShadow: getBoxShadow(),
    ...style,
  };

  // Input styles using CSS variables
  const inputStyle: React.CSSProperties = {
    flex: 1,
    width: '100%',
    height: '100%',
    padding: `0 ${sizeValues.paddingX}`,
    paddingLeft: prefix ? 0 : undefined,
    paddingRight: suffix || (clearable && currentValue) ? 0 : undefined,
    fontSize: sizeValues.fontSize,
    fontFamily: 'var(--ds-font-family-base)',
    backgroundColor: 'transparent',
    border: 'none',
    outline: 'none',
    color: disabled ? 'var(--ds-input-color-disabled)' : 'var(--ds-input-color)',
    cursor: disabled ? 'not-allowed' : 'text',
  };

  // Affix styles using CSS variables
  const affixStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0 0.5rem',
    color: 'var(--ds-input-addon-color)',
    userSelect: 'none',
  };

  // Clear button styles using CSS variables
  const clearButtonStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0 0.5rem',
    color: 'var(--ds-input-clear-color)',
    cursor: 'pointer',
    transition: 'var(--ds-input-transition)',
    background: 'none',
    border: 'none',
  };

  // Character count styles using CSS variables
  const countStyle: React.CSSProperties = {
    position: 'absolute',
    right: 0,
    bottom: '-1.25rem',
    fontSize: 'var(--ds-input-helper-font-size)',
    color: hasError ? 'var(--ds-input-error-color)' : 'var(--ds-input-addon-color)',
  };

  const showClearButton = clearable && currentValue && !disabled && !readOnly;

  // Build class names
  const containerClasses = [
    'rottay-input',
    'rottay-input--apollo',
    `rottay-input--${size}`,
    `rottay-input--${variant}`,
    isFocused && 'rottay-input--focused',
    hasError && 'rottay-input--error',
    hasWarning && 'rottay-input--warning',
    hasSuccess && 'rottay-input--success',
    disabled && 'rottay-input--disabled',
    readOnly && 'rottay-input--readonly',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <div
        className={containerClasses}
        style={containerStyle}
        onClick={() => inputRef.current?.focus()}
      >
        {prefix && (
          <span style={affixStyle}>
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
          <span style={affixStyle}>
            {suffix}
          </span>
        )}
      </div>

      {showCount && maxLength && (
        <span style={countStyle}>
          {currentValue.length}/{maxLength}
        </span>
      )}

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

ApolloInput.displayName = 'ApolloInput';

export default ApolloInput;
