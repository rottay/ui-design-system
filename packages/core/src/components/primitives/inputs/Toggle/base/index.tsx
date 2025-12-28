/**
 * @fileoverview Toggle Base Component - Rottay Design System
 * @description Core toggle implementation with CSS variables for theming.
 * Part of the Rottay Design System's input primitives collection.
 *
 * @remarks
 * The BaseToggle provides the foundational toggle switch implementation with
 * comprehensive CSS variable support. It serves as a reference for engine
 * implementations and can be used directly for custom styling needs.
 *
 * **Component Structure:**
 * - Container label with configurable flex direction
 * - Track element with sliding dot indicator
 * - Hidden checkbox input with switch role
 * - Optional label, description, and helper text
 *
 * **CSS Variable Integration:**
 * The component exposes CSS custom properties for deep customization:
 * - `--ds-toggle-width` - Track width
 * - `--ds-toggle-height` - Track height
 * - `--ds-toggle-dot-size` - Sliding dot diameter
 * - `--ds-toggle-bg` - Track background (unchecked)
 * - `--ds-toggle-bg-checked` - Track background (checked)
 * - `--ds-toggle-transition` - Animation timing
 *
 * **Accessibility Features:**
 * - Hidden checkbox with role="switch"
 * - aria-checked reflects current state
 * - aria-invalid for error state
 * - aria-busy for loading state
 * - Label association via htmlFor
 *
 * @example Using BaseToggle
 * ```tsx
 * import { BaseToggle } from '@rottay/design-system';
 *
 * <BaseToggle
 *   size="md"
 *   color="primary"
 *   label="Enable feature"
 *   checked={isEnabled}
 *   onChange={handleToggle}
 * />
 * ```
 *
 * @see {@link Toggle} for the engine-routed component
 * @module BaseToggle
 * @category Inputs
 * @package @rottay/design-system
 */

'use client';

import React, { forwardRef, useState, useCallback, useId } from 'react';
import type { ToggleProps } from '../types';
import { TOGGLE_DEFAULTS, SIZE_MAP, SIZE_VALUES, COLOR_MAP } from '../types';

export const BaseToggle = forwardRef<HTMLLabelElement, ToggleProps>((props, ref) => {
  const {
    size = TOGGLE_DEFAULTS.size,
    color = TOGGLE_DEFAULTS.color,
    labelPlacement = TOGGLE_DEFAULTS.labelPlacement,
    label,
    checkedLabel,
    uncheckedLabel,
    description,
    checked: controlledChecked,
    defaultChecked = false,
    disabled = TOGGLE_DEFAULTS.disabled,
    required = TOGGLE_DEFAULTS.required,
    loading = TOGGLE_DEFAULTS.loading,
    error = TOGGLE_DEFAULTS.error,
    errorMessage,
    helperText,
    onChange,
    children,
    name,
    id: providedId,
    value,
    autoFocus,
    className = '',
    style,
    ...rest
  } = props;

  const generatedId = useId();
  const inputId = providedId || `toggle-${generatedId}`;

  // Internal state for uncontrolled mode
  const [internalChecked, setInternalChecked] = useState(defaultChecked);
  const isControlled = controlledChecked !== undefined;
  const isChecked = isControlled ? controlledChecked : internalChecked;

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isControlled) {
      setInternalChecked(e.target.checked);
    }
    onChange?.(e.target.checked, e);
  }, [isControlled, onChange]);

  const sizeTokens = SIZE_MAP[size] || SIZE_MAP.md;
  const sizeValues = SIZE_VALUES[size] || SIZE_VALUES.md;
  const colors = COLOR_MAP[color] || COLOR_MAP.primary;

  // CSS Variables for theming (using tokens)
  const cssVariables = {
    '--ds-toggle-width': sizeTokens.width,
    '--ds-toggle-height': sizeTokens.height,
    '--ds-toggle-dot-size': sizeTokens.dot,
    '--ds-toggle-bg': colors.bg,
    '--ds-toggle-bg-checked': colors.bgChecked,
    '--ds-toggle-border-color': colors.border,
    '--ds-toggle-dot-color': '#ffffff',
    '--ds-toggle-transition': 'all 0.2s ease-in-out',
  } as React.CSSProperties;

  const containerStyle: React.CSSProperties = {
    ...cssVariables,
    display: 'inline-flex',
    alignItems: 'flex-start',
    gap: '8px',
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    flexDirection: labelPlacement === 'start' ? 'row-reverse' : 'row',
    fontFamily: 'inherit',
    ...style,
  };

  const trackStyle: React.CSSProperties = {
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
    width: sizeTokens.width,
    height: sizeTokens.height,
    borderRadius: 'var(--ds-toggle-track-border-radius, 9999px)',
    backgroundColor: isChecked ? colors.bgChecked : colors.bg,
    transition: 'all 0.2s ease-in-out',
    flexShrink: 0,
    border: error ? '2px solid var(--ds-color-error-500, #ff4d4f)' : 'none',
  };

  const dotStyle: React.CSSProperties = {
    position: 'absolute',
    top: '50%',
    left: isChecked ? `calc(100% - ${sizeTokens.dot} - 2px)` : '2px',
    transform: 'translateY(-50%)',
    width: sizeTokens.dot,
    height: sizeTokens.dot,
    borderRadius: '50%',
    backgroundColor: '#ffffff',
    transition: 'all 0.2s ease-in-out',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const inputStyle: React.CSSProperties = {
    position: 'absolute',
    opacity: 0,
    width: 0,
    height: 0,
    margin: 0,
    padding: 0,
  };

  const displayLabel = label || children;

  return (
    <label
      ref={ref}
      className={`rottay-toggle-base rottay-toggle--${size} rottay-toggle--${color} ${isChecked ? 'rottay-toggle--checked' : ''} ${disabled ? 'rottay-toggle--disabled' : ''} ${loading ? 'rottay-toggle--loading' : ''} ${error ? 'rottay-toggle--error' : ''} ${className}`}
      style={containerStyle}
      {...rest}
    >
      <span className="rottay-toggle__track" style={trackStyle}>
        <input
          id={inputId}
          type="checkbox"
          role="switch"
          name={name}
          value={value}
          checked={isChecked}
          disabled={disabled || loading}
          required={required}
          onChange={handleChange}
          autoFocus={autoFocus}
          style={inputStyle}
          aria-checked={isChecked}
          aria-invalid={error}
          aria-busy={loading}
          aria-describedby={displayLabel ? `${inputId}-label` : undefined}
        />
        <span className="rottay-toggle__dot" style={dotStyle}>
          {loading && (
            <svg
              className="rottay-toggle__spinner"
              width={sizeValues.dot * 0.6}
              height={sizeValues.dot * 0.6}
              viewBox="0 0 16 16"
              fill="none"
              style={{ animation: 'spin 1s linear infinite' }}
            >
              <circle
                cx="8"
                cy="8"
                r="6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeDasharray="30 10"
                fill="none"
              />
            </svg>
          )}
        </span>
        {(checkedLabel || uncheckedLabel) && (
          <span
            className="rottay-toggle__inner-label"
            style={{
              position: 'absolute',
              left: isChecked ? '6px' : 'auto',
              right: isChecked ? 'auto' : '6px',
              fontSize: sizeValues.dot * 0.5,
              color: '#ffffff',
              fontWeight: 500,
              userSelect: 'none',
            }}
          >
            {isChecked ? checkedLabel : uncheckedLabel}
          </span>
        )}
      </span>
      {(displayLabel || description) && (
        <span
          id={`${inputId}-label`}
          className="rottay-toggle__content"
          style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}
        >
          {displayLabel && (
            <span
              className="rottay-toggle__label"
              style={{
                fontSize: sizeValues.height * 0.6,
                color: error ? 'var(--ds-color-error-500, #ff4d4f)' : 'inherit',
                userSelect: 'none',
                lineHeight: 1.4,
              }}
            >
              {displayLabel}
            </span>
          )}
          {description && (
            <span
              className="rottay-toggle__description"
              style={{
                fontSize: sizeValues.height * 0.5,
                color: 'var(--ds-color-text-secondary, #666)',
                userSelect: 'none',
                lineHeight: 1.4,
              }}
            >
              {description}
            </span>
          )}
        </span>
      )}
      {(errorMessage || helperText) && (
        <span
          className="rottay-toggle__helper"
          style={{
            fontSize: sizeValues.height * 0.5,
            color: errorMessage ? 'var(--ds-color-error-500, #ff4d4f)' : 'var(--ds-color-text-secondary, #666)',
            marginTop: '4px',
          }}
        >
          {errorMessage || helperText}
        </span>
      )}
    </label>
  );
});

BaseToggle.displayName = 'BaseToggle';
