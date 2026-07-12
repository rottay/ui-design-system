/**
 * @fileoverview PasswordInput Modern Engine - Rottay Design System.
 * DS token inline-styled implementation with a custom visibility toggle button,
 * inline SVG eye icons, and an optional strength indicator bar.
 *
 * @example
 * ```tsx
 * <PasswordInput engine="modern" showToggle strengthIndicator strengthLevel="medium" />
 * ```
 *
 * @module ModernPasswordInput
 * @category Inputs
 * @package @rottay/design-system
 */

'use client';

import React, { useState, useCallback, useId } from 'react';
import type { PasswordInputProps } from '../PasswordInput.types';
import { PASSWORD_INPUT_DEFAULTS, STRENGTH_COLORS, STRENGTH_WIDTHS } from '../PasswordInput.types';

/**
 * Maps DS 5-tier size tokens to inline CSSProperties.
 * xl collapses to the lg tier dimensions.
 */
const SIZE_STYLES: Record<string, React.CSSProperties> = {
  xs: { height: 24, fontSize: 12, padding: '4px 8px' },
  sm: { height: 32, fontSize: 13, padding: '4px 10px' },
  md: { height: 36, fontSize: 14, padding: '6px 12px' },
  lg: { height: 40, fontSize: 16, padding: '8px 14px' },
  xl: { height: 40, fontSize: 16, padding: '8px 14px' },
};

/**
 * Modern engine PasswordInput built with DS token inline styles.
 * Manages its own visibility toggle state and renders inline SVG eye icons
 * rather than importing an icon library, keeping the bundle lightweight.
 *
 * @param props - Unified PasswordInputProps from the design system contract.
 * @returns A DS token-styled password input with toggle, strength bar, and error label.
 */
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
  // Local toggle state for password visibility (not exposed to parent)
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

  // Merge DS size styles with conditional disabled overrides; border/background
  // (error, disabled) live in the modern skin, keyed on the `data-error`/
  // `data-disabled` attributes stamped on root below
  const inputStyle: React.CSSProperties = {
    width: '100%',
    paddingRight: 40,
    boxSizing: 'border-box',
    opacity: disabled ? 0.6 : 1,
    cursor: disabled ? 'not-allowed' : undefined,
    ...(SIZE_STYLES[size] || SIZE_STYLES.md),
  };

  return (
    <div
      className={className || undefined}
      style={{ display: 'flex', flexDirection: 'column', width: '100%', ...style }}
      data-testid={dataTestId}
    >
      <div style={{ position: 'relative' }}>
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
          className="ds-password-input ds-password-input--modern"
          data-part="root"
          data-error={error ? 'true' : 'false'}
          data-disabled={disabled ? 'true' : 'false'}
          style={inputStyle}
        />
        {showToggle && (
          <button
            type="button"
            data-part="visibility-toggle"
            style={{ position: 'absolute', right: 8, top: '50%', height: 24, padding: '0 8px', fontSize: 12, cursor: 'pointer' }}
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
      {/* Strength indicator bar: width and color driven by STRENGTH_WIDTHS/STRENGTH_COLORS constants */}
      {strengthIndicator && strengthLevel && (
        <div data-part="strength-track" style={{ width: '100%', height: 4, marginTop: 4, overflow: 'hidden' }}>
          <div
            data-part="strength-fill"
            style={{
              height: '100%',
              transition: 'all var(--ds-motion-slow)',
              width: STRENGTH_WIDTHS[strengthLevel],
              ...({ '--ds-password-strength-fill': STRENGTH_COLORS[strengthLevel] } as React.CSSProperties),
            }}
          />
        </div>
      )}
      {error && errorMessage && (
        <div style={{ paddingTop: 4 }}>
          <span data-part="error-message" style={{ fontSize: 12 }}>{errorMessage}</span>
        </div>
      )}
    </div>
  );
}

ModernPasswordInput.displayName = 'ModernPasswordInput';
