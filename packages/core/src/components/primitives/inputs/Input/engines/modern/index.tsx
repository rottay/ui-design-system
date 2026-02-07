/**
 * @fileoverview Input Modern Engine - Rottay Design System
 * @description DaisyUI/Tailwind CSS implementation of the Input component.
 * Part of the Rottay Design System's input primitives collection.
 *
 * @remarks
 * The Modern engine implements inputs using DaisyUI's utility-first approach
 * with Tailwind CSS classes. This provides a lightweight alternative to Classic
 * with smaller bundle size and easier customization via CSS utilities.
 *
 * **DaisyUI Features Utilized:**
 * - Semantic input classes (input, input-bordered)
 * - Size modifiers (input-xs, input-sm, input-md, input-lg)
 * - Status classes (input-error, input-warning, input-success, input-primary)
 * - Base content color utilities for prefix/suffix
 * - Ghost button for clear functionality
 *
 * **Prop Mapping:**
 * - `variant="outline"` → `input-bordered`
 * - `variant="filled"` → `bg-base-200`
 * - `variant="flushed"` → Custom border-bottom only styling
 * - `variant="unstyled"` → `border-0 bg-transparent`
 * - `status="error"` → `input-error`
 * - `status="warning"` → `input-warning`
 * - `status="success"` → `input-success`
 * - `size="xs"` → `input-xs`
 *
 * **Layout:**
 * When prefix/suffix is provided, uses a DaisyUI label wrapper with
 * flex layout for proper alignment.
 *
 * @example Using Modern Engine
 * ```tsx
 * import { Input } from '@rottay/design-system';
 *
 * // Explicit Modern engine
 * <Input
 *   engine="modern"
 *   placeholder="Tailwind input"
 *   className="custom-class"
 * />
 *
 * // With DaisyUI styling
 * <Input
 *   engine="modern"
 *   variant="filled"
 *   status="success"
 *   prefix={<CheckIcon />}
 * />
 * ```
 *
 * @see {@link Input} for the main component
 * @see {@link ClassicInput} for Ant Design implementation
 * @see {@link RusticInput} for vanilla implementation
 * @module ModernInput
 * @category Inputs
 * @package @rottay/design-system
 */

'use client';

import React, { forwardRef, useState, useCallback, useRef, useEffect } from 'react';
import type { InputProps } from '../../types';
import { INPUT_DEFAULTS, DAISY_SIZE_MAP } from '../../types';

const STATUS_MAP = {
  default: '',
  error: 'input-error',
  warning: 'input-warning',
  success: 'input-success',
};

const ModernInput = forwardRef<HTMLInputElement, InputProps>((props, ref) => {
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

  // Determine status
  const computedStatus = error ? 'error' : status;
  const hasError = error || status === 'error';

  // Build DaisyUI class names
  const variantClass = variant === 'filled'
    ? 'bg-base-200'
    : variant === 'flushed'
      ? 'border-0 border-b rounded-none focus:border-b-2'
      : variant === 'unstyled'
        ? 'border-0 bg-transparent'
        : 'input-bordered';

  const inputClasses = [
    'input',
    DAISY_SIZE_MAP[size],
    variantClass,
    STATUS_MAP[computedStatus],
    isFocused && !hasError && 'input-primary',
    'w-full',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const showClearButton = clearable && currentValue && !disabled && !readOnly;

  // If we have prefix/suffix, wrap in a label component
  if (prefix || suffix || showClearButton) {
    return (
      <div className="w-full" style={style}>
        <label
          className={[
            'input',
            DAISY_SIZE_MAP[size],
            variantClass,
            STATUS_MAP[computedStatus],
            isFocused && !hasError && 'input-primary',
            'flex items-center gap-2 w-full',
          ]
            .filter(Boolean)
            .join(' ')}
          onClick={() => inputRef.current?.focus()}
        >
          {prefix && (
            <span className="text-base-content/50">{prefix}</span>
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
            className="grow bg-transparent border-none outline-none"
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
          />

          {showClearButton && (
            <button
              type="button"
              className="btn btn-ghost btn-xs btn-circle"
              onClick={handleClear}
              aria-label="Clear input"
              tabIndex={-1}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}

          {suffix && (
            <span className="text-base-content/50">{suffix}</span>
          )}
        </label>

        {showCount && maxLength && (
          <div className={`text-xs mt-1 text-right ${hasError ? 'text-error' : 'text-base-content/50'}`}>
            {currentValue.length}/{maxLength}
          </div>
        )}

        {hasError && errorMessage && (
          <span className="text-error text-xs mt-1 block">
            {errorMessage}
          </span>
        )}
      </div>
    );
  }

  // Simple input without prefix/suffix
  return (
    <div className="w-full" style={style}>
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
        className={inputClasses}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
      />

      {showCount && maxLength && (
        <div className={`text-xs mt-1 text-right ${hasError ? 'text-error' : 'text-base-content/50'}`}>
          {currentValue.length}/{maxLength}
        </div>
      )}

      {hasError && errorMessage && (
        <span className="text-error text-xs mt-1 block">
          {errorMessage}
        </span>
      )}
    </div>
  );
});

ModernInput.displayName = 'ModernInput';

export default ModernInput;
