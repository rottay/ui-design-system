/**
 * @fileoverview PasswordInput Rustic Engine - Rottay Design System.
 * Pure HTML/CSS implementation using CSS custom properties (--ds-color-*,
 * --ds-radius-*, --ds-font-family-base) so theming is driven entirely by
 * tenant-level token overrides, with zero dependency on Ant Design or Tailwind.
 *
 * @example
 * ```tsx
 * <PasswordInput engine="rustic" variant="flushed" showToggle strengthIndicator strengthLevel="weak" />
 * ```
 *
 * @module RusticPasswordInput
 * @category Inputs
 * @package @rottay/design-system
 */

'use client';

import React, { useState, useCallback, useId } from 'react';
import type { PasswordInputProps } from '../PasswordInput.types';
import { PASSWORD_INPUT_DEFAULTS, STRENGTH_COLORS, STRENGTH_WIDTHS } from '../PasswordInput.types';

/** Fixed pixel dimensions for each size tier (xs through xl). */
const SIZE_STYLES: Record<string, React.CSSProperties> = {
  xs: { height: '24px', fontSize: '12px', padding: '0 8px' },
  sm: { height: '28px', fontSize: '13px', padding: '0 10px' },
  md: { height: '36px', fontSize: '14px', padding: '0 12px' },
  lg: { height: '42px', fontSize: '16px', padding: '0 14px' },
  xl: { height: '48px', fontSize: '18px', padding: '0 16px' },
};

/**
 * Rustic engine PasswordInput built with pure HTML/CSS and design-system CSS variables.
 * Supports four variant modes (outlined, filled, flushed, unstyled), a custom
 * visibility toggle with inline SVG icons, a strength indicator bar, and focus
 * ring via JS-managed state for cross-browser consistency.
 *
 * @param props - Unified PasswordInputProps from the design system contract.
 * @returns A theme-aware password input rendered without any UI framework dependency.
 */
export default function RusticPasswordInput(props: PasswordInputProps): React.ReactElement {
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
  const inputId = providedId || `password-rustic-${generatedId}`;
  // Local toggle state for password visibility (not exposed to parent)
  const [visible, setVisible] = useState(false);
  // Track focus to apply ring shadow via inline styles (cross-browser safe)
  const [isFocused, setIsFocused] = useState(false);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(e.target.value, e);
  }, [onChange]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    onKeyDown?.(e);
    if (e.key === 'Enter') {
      onPressEnter?.(e);
    }
  }, [onKeyDown, onPressEnter]);

  const handleFocus = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    onFocus?.(e);
  }, [onFocus]);

  const handleBlur = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    onBlur?.(e);
  }, [onBlur]);

  const sizeStyle = SIZE_STYLES[size] || SIZE_STYLES.md;

  /** Resolve border color from CSS variables based on error/focus priority. */
  const getBorderColor = () => {
    if (error) return 'var(--ds-color-error-500, #ff4d4f)';
    if (isFocused) return 'var(--ds-color-primary-500, #1890ff)';
    return 'var(--ds-color-neutral-300, #d9d9d9)';
  };

  const containerStyle: React.CSSProperties = {
    display: 'inline-flex',
    flexDirection: 'column',
    width: '100%',
    fontFamily: 'var(--ds-font-family-base)',
    ...style,
  };

  const wrapperStyle: React.CSSProperties = {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  };

  // Variant-aware border and border-radius: flushed shows only a bottom border,
  // unstyled removes all borders, filled adds a background tint
  const inputStyle: React.CSSProperties = {
    ...sizeStyle,
    width: '100%',
    paddingRight: showToggle ? '36px' : sizeStyle.padding,
    border: variant === 'unstyled' ? 'none' : variant === 'flushed'
      ? 'none'
      : `1px solid ${getBorderColor()}`,
    borderBottom: variant === 'flushed' ? `2px solid ${getBorderColor()}` : undefined,
    borderRadius: variant === 'flushed' || variant === 'unstyled' ? '0' : 'var(--ds-radius-md, 8px)',
    backgroundColor: variant === 'filled'
      ? 'var(--ds-color-neutral-100, #f5f5f5)'
      : 'transparent',
    color: 'var(--ds-color-text-primary, #1a1a1a)',
    outline: 'none',
    opacity: disabled ? 0.5 : 1,
    cursor: disabled ? 'not-allowed' : 'text',
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
    boxShadow: isFocused && !error
      ? '0 0 0 2px var(--ds-color-primary-100, rgba(24, 144, 255, 0.2))'
      : 'none',
  };

  const toggleButtonStyle: React.CSSProperties = {
    position: 'absolute',
    right: '8px',
    top: '50%',
    transform: 'translateY(-50%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '24px',
    height: '24px',
    border: 'none',
    background: 'none',
    cursor: 'pointer',
    color: 'var(--ds-color-text-secondary, #666)',
    padding: 0,
    borderRadius: 'var(--ds-radius-sm, 6px)',
  };

  return (
    <div
      className={`rottay-password-input-rustic ${className}`}
      style={containerStyle}
      data-testid={dataTestId}
    >
      <div style={wrapperStyle}>
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
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          name={name}
          autoComplete={autoComplete}
          autoFocus={autoFocus}
          aria-label={ariaLabel}
          aria-invalid={error}
          className="ds-password-input ds-password-input--rustic"
          data-part="root"
          data-error={error ? 'true' : 'false'}
          data-disabled={disabled ? 'true' : 'false'}
          style={inputStyle}
        />
        {showToggle && (
          <button
            type="button"
            data-part="visibility-toggle"
            style={toggleButtonStyle}
            onClick={() => setVisible(!visible)}
            tabIndex={-1}
            aria-label={visible ? 'Hide password' : 'Show password'}
          >
            {visible ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                <line x1="1" y1="1" x2="23" y2="23" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </button>
        )}
      </div>
      {strengthIndicator && strengthLevel && (
        <div
          data-part="strength-track"
          style={{
            marginTop: '4px',
            height: '4px',
            borderRadius: '2px',
            backgroundColor: 'var(--ds-color-neutral-200, #e8e8e8)',
            overflow: 'hidden',
          }}
        >
          <div
            data-part="strength-fill"
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
          data-part="error-message"
          style={{
            marginTop: '4px',
            fontSize: '12px',
            color: 'var(--ds-color-error-500, #ff4d4f)',
            lineHeight: 1.4,
          }}
        >
          {errorMessage}
        </span>
      )}
    </div>
  );
}

RusticPasswordInput.displayName = 'RusticPasswordInput';
