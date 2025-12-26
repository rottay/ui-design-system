/**
 * Toggle - Apollo Engine (Pure HTML/CSS with a11y)
 */

'use client';

import React, { useState, useCallback, useId } from 'react';
import type { ToggleProps } from '../../types';
import { TOGGLE_DEFAULTS, SIZE_MAP, COLOR_MAP } from '../../types';

export default function ApolloToggle(props: ToggleProps): React.ReactElement {
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
  const inputId = providedId || `toggle-apollo-${generatedId}`;

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

  const sizeValues = SIZE_MAP[size] || SIZE_MAP.md;
  const colors = COLOR_MAP[color] || COLOR_MAP.primary;

  const containerStyle: React.CSSProperties = {
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
    width: sizeValues.width,
    height: sizeValues.height,
    borderRadius: sizeValues.height / 2,
    backgroundColor: isChecked ? colors.bgChecked : colors.bg,
    transition: 'all 0.2s ease-in-out',
    flexShrink: 0,
    border: error ? '2px solid var(--color-error, #ff4d4f)' : 'none',
    outline: isFocused ? `2px solid ${colors.bgChecked}` : 'none',
    outlineOffset: '2px',
  };

  const dotStyle: React.CSSProperties = {
    position: 'absolute',
    top: '50%',
    left: isChecked ? `calc(100% - ${sizeValues.dot}px - 2px)` : '2px',
    transform: 'translateY(-50%)',
    width: sizeValues.dot,
    height: sizeValues.dot,
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
    fontSize: sizeValues.height * 0.6,
    color: error ? 'var(--color-error, #ff4d4f)' : 'inherit',
    userSelect: 'none',
    lineHeight: 1.4,
  };

  const descriptionStyle: React.CSSProperties = {
    fontSize: sizeValues.height * 0.5,
    color: 'var(--color-text-secondary, #666)',
    userSelect: 'none',
    lineHeight: 1.4,
  };

  const displayLabel = label || children;

  return (
    <label
      className={`rottay-toggle-apollo rottay-toggle--${size} rottay-toggle--${color} ${isChecked ? 'rottay-toggle--checked' : ''} ${disabled ? 'rottay-toggle--disabled' : ''} ${loading ? 'rottay-toggle--loading' : ''} ${error ? 'rottay-toggle--error' : ''} ${className}`}
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

ApolloToggle.displayName = 'ApolloToggle';
