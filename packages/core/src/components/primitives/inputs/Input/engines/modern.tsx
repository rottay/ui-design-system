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

import React, { forwardRef, useState, useCallback, useRef, useEffect, useId } from 'react';
import type { InputProps, InputSize } from '../Input.types';
import { INPUT_DEFAULTS, DAISY_SIZE_MAP, SIZE_MAP as INPUT_SIZE_MAP } from '../Input.types';
import { isResponsiveValue, generateResponsiveCSS, type ResponsivePropEntry } from '../../../layout/shared/responsive-props';
import type { ResponsiveValue } from '../../../layout/shared/types';

function scalarOrUndefined<T>(value: ResponsiveValue<T> | undefined): T | undefined {
  if (value === undefined || value === null) return undefined;
  if (isResponsiveValue(value)) return undefined;
  return value as T;
}

// DaisyUI input status classes change the border/ring color to semantic colors.
// Unlike antd, DaisyUI does support a success state natively via input-success.
const STATUS_MAP = {
  default: '',
  error: 'input-error',
  warning: 'input-warning',
  success: 'input-success',
};

/**
 * Modern (DaisyUI/Tailwind) engine for the Input component.
 *
 * Renders a native `<input>` styled with DaisyUI utility classes. When prefix,
 * suffix, or clearable content is present, wraps the input in a `<label>` for
 * correct flex alignment. Otherwise renders a standalone input for minimal DOM.
 *
 * @param props - Standardized InputProps from the design system contract.
 * @param ref   - Forwarded ref merged with an internal ref for imperative focus.
 * @returns The rendered DaisyUI-styled input.
 */
const ModernInput = forwardRef<HTMLInputElement, InputProps>((props, ref) => {
  const {
    size: sizeProp = INPUT_DEFAULTS.size,
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

  // Responsive size handling
  const reactId = useId();
  const responsiveEntries: ResponsivePropEntry<any>[] = [];
  const sizeIsResponsive = isResponsiveValue(sizeProp);

  if (sizeIsResponsive) {
    responsiveEntries.push({
      cssProperty: 'height',
      value: sizeProp,
      resolve: (v: InputSize) => (INPUT_SIZE_MAP[v as keyof typeof INPUT_SIZE_MAP] || INPUT_SIZE_MAP.md).height,
    } as ResponsivePropEntry<any>);
    responsiveEntries.push({
      cssProperty: 'font-size',
      value: sizeProp,
      resolve: (v: InputSize) => (INPUT_SIZE_MAP[v as keyof typeof INPUT_SIZE_MAP] || INPUT_SIZE_MAP.md).fontSize,
    } as ResponsivePropEntry<any>);
  }

  const needsResponsiveCSS = responsiveEntries.length > 0;
  const elementId = needsResponsiveCSS ? `input-${reactId.replace(/:/g, '')}` : '';
  const responsive = needsResponsiveCSS
    ? generateResponsiveCSS(elementId, responsiveEntries)
    : null;

  const size = scalarOrUndefined(sizeProp) ?? INPUT_DEFAULTS.size;

  // Handle controlled/uncontrolled
  const [internalValue, setInternalValue] = useState(defaultValue ?? '');
  const isControlled = controlledValue !== undefined;
  const currentValue = isControlled ? controlledValue : internalValue;

  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Merge the consumer's forwarded ref with our internal ref so we can
  // imperatively focus the input (e.g., after clear) while still exposing
  // the DOM node to parent components.
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

  // Map DS variant names to DaisyUI utility classes. The "flushed" variant
  // (Material Design-style bottom border) requires custom border overrides
  // since DaisyUI does not ship a native equivalent.
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

  // When addons are present, the input is wrapped in a DaisyUI <label> so
  // prefix, suffix, and clear button sit in a single flex row. The inner
  // <input> strips its own border/bg to avoid double-styling the container.
  const responsiveStyleTag = responsive && responsive.css ? (
    <style dangerouslySetInnerHTML={{ __html: responsive.css }} />
  ) : null;
  const responsiveAttrs = responsive ? responsive.attrs : {};

  if (prefix || suffix || showClearButton) {
    return (
      <div className="w-full" style={style}>
        {responsiveStyleTag}
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
      {responsiveStyleTag}
      <input
        ref={inputRef}
        {...responsiveAttrs}
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
