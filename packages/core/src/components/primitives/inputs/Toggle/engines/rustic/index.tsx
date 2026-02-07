/**
 * @fileoverview Toggle Rustic Engine - Rottay Design System
 * @description Pure HTML/CSS implementation of the Toggle component.
 * Part of the Rottay Design System's input primitives collection.
 *
 * @remarks
 * The Rustic engine provides a zero-dependency toggle implementation
 * using pure HTML and inline CSS. It offers maximum accessibility
 * and customization through CSS custom properties.
 *
 * **Pure CSS Features:**
 * - Custom sliding dot animation
 * - Focus ring with outline styling
 * - Loading spinner SVG
 * - Inner checked/unchecked labels
 * - Color theming via inline styles
 *
 * **Accessibility Features:**
 * - Native checkbox with role="switch"
 * - Full keyboard support (Space, Enter)
 * - Focus state with visible outline
 * - aria-checked, aria-invalid, aria-busy
 * - Screen reader label association
 *
 * **Keyboard Navigation:**
 * - Space/Enter: Toggle checked state
 * - Tab: Focus navigation
 *
 * **Customization Points:**
 * - All styling via inline CSSProperties
 * - Size tokens from SIZE_MAP
 * - Color tokens from COLOR_MAP
 * - CSS variables for tenant theming
 *
 * @example Using Rustic Engine
 * ```tsx
 * import { Toggle } from '@rottay/design-system';
 *
 * <Toggle
 *   engine="rustic"
 *   size="lg"
 *   color="success"
 *   label="Accessibility mode"
 *   checkedLabel="ON"
 *   uncheckedLabel="OFF"
 * />
 * ```
 *
 * @see {@link Toggle} for the main component
 * @see {@link ClassicToggle} for Ant Design implementation
 * @see {@link ModernToggle} for DaisyUI implementation
 * @module RusticToggle
 * @category Inputs
 * @package @rottay/design-system
 */

'use client';

import React, { useState, useCallback, useId } from 'react';
import type { ToggleProps } from '../../types';
import { TOGGLE_DEFAULTS, SIZE_MAP, SIZE_VALUES, COLOR_MAP } from '../../types';

export default function RusticToggle(props: ToggleProps): React.ReactElement {
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
  const inputId = providedId || `toggle-rustic-${generatedId}`;

  // Internal state for uncontrolled mode
  const [internalChecked, setInternalChecked] = useState(defaultChecked);
  const [isFocused, setIsFocused] = useState(false);
  const isControlled = controlledChecked !== undefined;
  const isChecked = isControlled ? controlledChecked : internalChecked;

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isControlled) {
      setInternalChecked(e.target.checked);
    }
    onChange?.(e.target.checked, e);
  }, [isControlled, onChange]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      if (!disabled && !loading) {
        const newChecked = !isChecked;
        if (!isControlled) {
          setInternalChecked(newChecked);
        }
        const syntheticEvent = {
          target: { checked: newChecked, value },
          currentTarget: { checked: newChecked, value },
        } as React.ChangeEvent<HTMLInputElement>;
        onChange?.(newChecked, syntheticEvent);
      }
    }
  }, [disabled, loading, isChecked, isControlled, value, onChange]);

  const sizeTokens = SIZE_MAP[size] || SIZE_MAP.md;
  const sizeValues = SIZE_VALUES[size] || SIZE_VALUES.md;

  // Size CSS variable mapping
  const SIZE_VAR_MAP: Record<string, { width: string; height: string; dot: string }> = {
    sm: {
      width: 'var(--ds-toggle-sm-width)',
      height: 'var(--ds-toggle-sm-height)',
      dot: 'var(--ds-toggle-sm-dot)',
    },
    md: {
      width: 'var(--ds-toggle-md-width)',
      height: 'var(--ds-toggle-md-height)',
      dot: 'var(--ds-toggle-md-dot)',
    },
    lg: {
      width: 'var(--ds-toggle-lg-width)',
      height: 'var(--ds-toggle-lg-height)',
      dot: 'var(--ds-toggle-lg-dot)',
    },
  };

  const sizeVars = SIZE_VAR_MAP[size] || SIZE_VAR_MAP.md;

  // Get track background color based on state and color
  const getTrackBg = () => {
    if (!isChecked) return 'var(--ds-toggle-track-bg)';
    if (color === 'success') return 'var(--ds-toggle-success-bg)';
    if (color === 'warning') return 'var(--ds-toggle-warning-bg)';
    if (color === 'error') return 'var(--ds-toggle-error-bg)';
    return 'var(--ds-toggle-track-bg-checked)';
  };

  const containerStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'flex-start',
    gap: '8px',
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    flexDirection: labelPlacement === 'start' ? 'row-reverse' : 'row',
    fontFamily: 'var(--ds-font-family-base)',
    ...style,
  };

  const trackStyle: React.CSSProperties = {
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
    width: sizeVars.width,
    height: sizeVars.height,
    borderRadius: 'var(--ds-toggle-track-radius)',
    backgroundColor: getTrackBg(),
    transition: 'var(--ds-toggle-transition)',
    flexShrink: 0,
    border: error ? '2px solid var(--ds-toggle-error-color)' : 'none',
    outline: isFocused ? 'var(--ds-toggle-focus-ring)' : 'none',
    outlineOffset: '2px',
  };

  const dotStyle: React.CSSProperties = {
    position: 'absolute',
    top: '50%',
    left: isChecked ? `calc(100% - ${sizeTokens.dot} - 2px)` : '2px',
    transform: 'translateY(-50%)',
    width: sizeVars.dot,
    height: sizeVars.dot,
    borderRadius: '50%',
    backgroundColor: 'var(--ds-toggle-dot-bg)',
    transition: 'var(--ds-toggle-transition)',
    boxShadow: 'var(--ds-toggle-dot-shadow)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const inputStyle: React.CSSProperties = {
    position: 'absolute',
    opacity: 0,
    width: '100%',
    height: '100%',
    margin: 0,
    padding: 0,
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
  };

  const labelContainerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 'var(--ds-toggle-label-font-size)',
    color: error ? 'var(--ds-toggle-error-color)' : 'var(--ds-toggle-label-color)',
    userSelect: 'none',
    lineHeight: 1.4,
  };

  const descriptionStyle: React.CSSProperties = {
    fontSize: 'var(--ds-toggle-description-font-size)',
    color: 'var(--ds-toggle-description-color)',
    userSelect: 'none',
    lineHeight: 1.4,
  };

  const displayLabel = label || children;

  return (
    <label
      className={`rottay-toggle-rustic rottay-toggle--${size} rottay-toggle--${color} ${isChecked ? 'rottay-toggle--checked' : ''} ${disabled ? 'rottay-toggle--disabled' : ''} ${loading ? 'rottay-toggle--loading' : ''} ${error ? 'rottay-toggle--error' : ''} ${className}`}
      style={containerStyle}
      onKeyDown={handleKeyDown}
      {...rest}
    >
      <span
        className="rottay-toggle__track"
        style={trackStyle}
        role="presentation"
      >
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
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
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
              fontSize: 'var(--ds-toggle-inner-label-font-size)',
              color: 'var(--ds-toggle-inner-label-color)',
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
          style={labelContainerStyle}
        >
          {displayLabel && (
            <span className="rottay-toggle__label" style={labelStyle}>
              {displayLabel}
            </span>
          )}
          {description && (
            <span className="rottay-toggle__description" style={descriptionStyle}>
              {description}
            </span>
          )}
        </span>
      )}
    </label>
  );
}

RusticToggle.displayName = 'RusticToggle';
