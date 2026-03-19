/**
 * @fileoverview Input Rustic Engine - Rottay Design System
 * @description Pure HTML/CSS implementation of the Input component using CSS variables.
 * Part of the Rottay Design System's input primitives collection.
 *
 * @remarks
 * The Rustic engine provides a headless input implementation using only
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
 * @module RusticInput
 * @category Inputs
 * @package @rottay/design-system
 */

'use client';

import React, { forwardRef, useState, useCallback, useRef, useEffect, useId } from 'react';
import type { InputProps, InputSize } from '../Input.types';
import { INPUT_DEFAULTS, SIZE_MAP } from '../Input.types';
import { isResponsiveValue, generateResponsiveCSS, type ResponsivePropEntry } from '../../../layout/shared/responsive-props';
import type { ResponsiveValue } from '../../../layout/shared/types';

function scalarOrUndefined<T>(value: ResponsiveValue<T> | undefined): T | undefined {
  if (value === undefined || value === null) return undefined;
  if (isResponsiveValue(value)) return undefined;
  return value as T;
}

/**
 * Rustic (vanilla HTML/CSS) engine for the Input component.
 *
 * Uses only native HTML elements styled through CSS variables (`--ds-input-*`)
 * for full multi-tenant theming without any UI library dependency. All visual
 * states (focus ring, validation colors, disabled opacity) are computed inline
 * from the CSS variable palette.
 *
 * @param props - Standardized InputProps from the design system contract.
 * @param ref   - Forwarded ref merged with an internal ref for imperative focus.
 * @returns The rendered vanilla input with optional prefix, suffix, and clear button.
 */
const RusticInput = forwardRef<HTMLInputElement, InputProps>((props, ref) => {
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
      resolve: (v: InputSize) => (SIZE_MAP[v as keyof typeof SIZE_MAP] || SIZE_MAP.md).height,
    } as ResponsivePropEntry<any>);
    responsiveEntries.push({
      cssProperty: 'font-size',
      value: sizeProp,
      resolve: (v: InputSize) => (SIZE_MAP[v as keyof typeof SIZE_MAP] || SIZE_MAP.md).fontSize,
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

  // Native autoFocus only fires on initial mount and can be unreliable in
  // client-rendered React trees, so we trigger focus imperatively.
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

  // Clear creates a synthetic ChangeEvent so consumers can treat it the same
  // as a normal onChange. We re-focus the input after clearing so the user
  // can immediately start typing without an extra click.
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

  // Border color priority: error > warning > success > focused > default.
  // Validation status always wins over focus state to ensure errors are visible.
  const getBorderColor = () => {
    if (hasError) return 'var(--ds-input-error-border)';
    if (hasWarning) return 'var(--ds-input-warning-border)';
    if (hasSuccess) return 'var(--ds-input-success-border)';
    if (isFocused) return 'var(--ds-input-border-focus)';
    return 'var(--ds-input-border)';
  };

  // Focus ring uses a status-colored glow (3px spread + 8px ambient) to reinforce
  // the validation state. Unstyled variant disables the ring entirely.
  const getBoxShadow = () => {
    if (variant === 'unstyled') return 'none';
    if (hasError && isFocused) return 'var(--ds-input-error-shadow-focus, 0 0 0 3px rgba(239, 68, 68, 0.15)), 0 0 8px rgba(239, 68, 68, 0.1)';
    if (hasWarning && isFocused) return 'var(--ds-input-warning-shadow-focus, 0 0 0 3px rgba(245, 158, 11, 0.15)), 0 0 8px rgba(245, 158, 11, 0.1)';
    if (hasSuccess && isFocused) return 'var(--ds-input-success-shadow-focus, 0 0 0 3px rgba(34, 197, 94, 0.15)), 0 0 8px rgba(34, 197, 94, 0.1)';
    if (isFocused) return 'var(--ds-input-shadow-focus, 0 0 0 3px var(--ds-color-primary-100, rgba(59, 130, 246, 0.15))), 0 0 8px rgba(59, 130, 246, 0.08)';
    return 'none';
  };

  // Background varies by variant and interaction state. The "filled" variant
  // swaps to a lighter background on focus to give the user a visual cue.
  const getBackground = () => {
    if (disabled) return 'var(--ds-input-bg-disabled)';
    if (variant === 'filled') {
      if (isFocused) return 'var(--ds-input-filled-bg-focus)';
      return 'var(--ds-input-filled-bg)';
    }
    return 'var(--ds-input-bg)';
  };

  // Flushed variant shows only a bottom border (Material Design-style).
  // Unstyled removes all borders. All other variants use a full border.
  const isBorderless = variant === 'flushed' || variant === 'unstyled';
  const outlineBorder = `1px solid ${getBorderColor()}`;
  const sideBorder = isBorderless ? 'none' : outlineBorder;
  const containerStyle: React.CSSProperties = {
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
    width: '100%',
    height: sizeValues.height,
    backgroundColor: getBackground(),
    borderRadius: variant === 'flushed' ? 0 : 'var(--ds-input-radius)',
    borderTop: sideBorder,
    borderRight: sideBorder,
    borderLeft: sideBorder,
    borderBottom: variant === 'flushed'
      ? `${isFocused ? 2 : 1}px solid ${getBorderColor()}`
      : sideBorder,
    transition: 'border-color 0.15s, box-shadow 0.2s, background-color 0.1s',
    opacity: disabled ? 0.6 : 1,
    cursor: disabled ? 'not-allowed' : 'text',
    boxShadow: getBoxShadow(),
    ...style,
  };

  // The inner <input> is borderless and transparent so the container div
  // controls all visual chrome (border, radius, shadow). Padding is removed
  // on the side where a prefix or suffix is present to avoid double-spacing.
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
    transition: 'color 0.15s, transform 0.15s cubic-bezier(0.16, 1, 0.3, 1)',
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
    'rottay-input--rustic',
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
      {responsive && responsive.css && (
        <style dangerouslySetInnerHTML={{ __html: responsive.css }} />
      )}
      <div
        className={containerClasses}
        style={containerStyle}
        {...(responsive ? responsive.attrs : {})}
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
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.1)';
              e.currentTarget.style.color = 'var(--ds-input-color, currentColor)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.color = 'var(--ds-input-clear-color)';
            }}
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

RusticInput.displayName = 'RusticInput';

export default RusticInput;
