/**
 * @fileoverview Input Apollo Engine - Rottay Design System
 * @description Pure HTML/CSS implementation of the Input component.
 * Part of the Rottay Design System's input primitives collection.
 *
 * @remarks
 * The Apollo engine provides a headless input implementation using only
 * native HTML elements and inline styles. This offers maximum flexibility
 * for custom styling and ensures accessibility compliance.
 *
 * **Key Features:**
 * - Zero UI library dependencies
 * - Controlled and uncontrolled modes
 * - Focus, hover, and disabled state handling
 * - Clear button with custom SVG icon
 * - Character count display
 * - Error message display
 * - Multiple variants and validation states
 *
 * **Inline Style Approach:**
 * Unlike CSS variable-based styling, Apollo uses computed inline styles
 * for complete control over appearance. This ensures styles work without
 * requiring any external CSS files.
 *
 * **State-Based Styling:**
 * - Border color changes based on focus, error, warning, success states
 * - Box-shadow for focus and error visual feedback
 * - Opacity reduction for disabled state
 *
 * **Accessibility:**
 * - Proper ARIA attributes (aria-invalid, aria-label, aria-describedby)
 * - Focus management for clear button
 * - Required attribute support
 *
 * @example Using Apollo Engine
 * ```tsx
 * import { Input } from '@rottay/design-system';
 *
 * // Explicit Apollo engine
 * <Input
 *   engine="apollo"
 *   placeholder="Vanilla input"
 *   variant="filled"
 * />
 *
 * // With full customization
 * <Input
 *   engine="apollo"
 *   placeholder="Custom styled"
 *   status="success"
 *   prefix={<MailIcon />}
 *   suffix={<CheckIcon />}
 *   clearable
 *   style={{ backgroundColor: '#f0fff4' }}
 * />
 * ```
 *
 * @see {@link Input} for the main component
 * @see {@link TitanInput} for Ant Design implementation
 * @see {@link HermesInput} for DaisyUI implementation
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
    // Trigger onChange with empty value
    const syntheticEvent = {
      target: { value: '' },
    } as React.ChangeEvent<HTMLInputElement>;
    onChange?.('', syntheticEvent);
    inputRef.current?.focus();
  }, [isControlled, onChange, onClear]);

  // Determine if error state
  const hasError = error || status === 'error';

  // Get size values
  const sizeValues = SIZE_MAP[size] || SIZE_MAP.md;

  // Determine colors based on state
  const getBorderColor = () => {
    if (hasError) return '#ff4d4f';
    if (status === 'warning') return '#faad14';
    if (status === 'success') return '#52c41a';
    if (isFocused) return '#1890ff';
    return '#d9d9d9';
  };

  const getBoxShadow = () => {
    if (variant === 'unstyled') return 'none';
    if (hasError) return '0 0 0 2px rgba(255, 77, 79, 0.2)';
    if (isFocused) return '0 0 0 2px rgba(24, 144, 255, 0.2)';
    return 'none';
  };

  // Container styles
  const containerStyle: React.CSSProperties = {
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
    width: '100%',
    height: sizeValues.height,
    backgroundColor: variant === 'filled' ? '#f5f5f5' : 'transparent',
    borderRadius: variant === 'flushed' ? 0 : 6,
    border: variant === 'flushed'
      ? 'none'
      : variant === 'unstyled'
        ? 'none'
        : `1px solid ${getBorderColor()}`,
    borderBottom: variant === 'flushed'
      ? `${isFocused ? 2 : 1}px solid ${getBorderColor()}`
      : undefined,
    transition: 'all 0.2s ease',
    opacity: disabled ? 0.6 : 1,
    cursor: disabled ? 'not-allowed' : 'text',
    boxShadow: getBoxShadow(),
    ...style,
  };

  // Input styles
  const inputStyle: React.CSSProperties = {
    flex: 1,
    width: '100%',
    height: '100%',
    padding: `0 ${sizeValues.paddingX}`,
    paddingLeft: prefix ? 0 : undefined,
    paddingRight: suffix || (clearable && currentValue) ? 0 : undefined,
    fontSize: sizeValues.fontSize,
    fontFamily: 'inherit',
    backgroundColor: 'transparent',
    border: 'none',
    outline: 'none',
    color: disabled ? '#bfbfbf' : '#333333',
    cursor: disabled ? 'not-allowed' : 'text',
  };

  // Affix styles
  const affixStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0 8px',
    color: '#bfbfbf',
    userSelect: 'none',
  };

  // Clear button styles
  const clearButtonStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0 8px',
    color: '#bfbfbf',
    cursor: 'pointer',
    transition: 'color 0.2s',
    background: 'none',
    border: 'none',
  };

  // Character count styles
  const countStyle: React.CSSProperties = {
    position: 'absolute',
    right: 0,
    bottom: '-20px',
    fontSize: 12,
    color: hasError ? '#ff4d4f' : '#bfbfbf',
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
            marginTop: 4,
            fontSize: 12,
            color: '#ff4d4f',
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
