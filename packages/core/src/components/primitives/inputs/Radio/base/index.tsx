/**
 * Radio - Base Component
 * Uses CSS variables from design tokens for consistent styling
 */

'use client';

import React, { forwardRef, useState, useId } from 'react';
import type { RadioProps } from '../types';
import { RADIO_DEFAULTS, SIZE_MAP, COLOR_MAP } from '../types';

/**
 * Base Radio component using CSS variables.
 * This is extended by engine-specific implementations.
 */
export const BaseRadio = forwardRef<HTMLInputElement, RadioProps>(
  (props, ref) => {
    const {
      size = RADIO_DEFAULTS.size,
      color = RADIO_DEFAULTS.color,
      labelPlacement = RADIO_DEFAULTS.labelPlacement,
      label,
      value,
      checked: controlledChecked,
      defaultChecked = false,
      disabled = RADIO_DEFAULTS.disabled,
      required = RADIO_DEFAULTS.required,
      error = RADIO_DEFAULTS.error,
      onChange,
      children,
      name,
      description,
      className = '',
      style = {},
    } = props;

    const generatedId = useId();
    const inputId = `radio-${generatedId}`;

    // Internal state for uncontrolled mode
    const [internalChecked, setInternalChecked] = useState(defaultChecked);
    const isControlled = controlledChecked !== undefined;
    const isChecked = isControlled ? controlledChecked : internalChecked;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!isControlled) {
        setInternalChecked(e.target.checked);
      }
      onChange?.(e);
    };

    const sizeValue = SIZE_MAP[size] || SIZE_MAP.md;
    const colors = COLOR_MAP[color] || COLOR_MAP.primary;

    // Build CSS variables for the radio
    const radioVars: React.CSSProperties = {
      '--radio-size': `${sizeValue}px`,
      '--radio-bg': isChecked ? colors.bg : 'transparent',
      '--radio-border': error ? 'var(--color-error, #ff4d4f)' : (isChecked ? colors.border : 'var(--color-border, #d9d9d9)'),
      '--radio-dot-color': colors.dot,
    } as React.CSSProperties;

    const containerStyle: React.CSSProperties = {
      display: 'inline-flex',
      alignItems: 'flex-start',
      gap: '8px',
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.5 : 1,
      flexDirection: labelPlacement === 'start' ? 'row-reverse' : 'row',
      ...style,
    };

    const radioWrapperStyle: React.CSSProperties = {
      ...radioVars,
      position: 'relative',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: 'var(--radio-size)',
      height: 'var(--radio-size)',
      borderRadius: '50%',
      border: '2px solid var(--radio-border)',
      backgroundColor: 'transparent',
      transition: 'all 0.2s ease-in-out',
      flexShrink: 0,
      marginTop: description ? '2px' : 0,
    };

    const inputStyle: React.CSSProperties = {
      position: 'absolute',
      opacity: 0,
      width: '100%',
      height: '100%',
      margin: 0,
      padding: 0,
      cursor: disabled ? 'not-allowed' : 'pointer',
    };

    const dotStyle: React.CSSProperties = {
      display: isChecked ? 'block' : 'none',
      width: sizeValue * 0.5,
      height: sizeValue * 0.5,
      borderRadius: '50%',
      backgroundColor: 'var(--radio-bg)',
    };

    const labelContainerStyle: React.CSSProperties = {
      display: 'flex',
      flexDirection: 'column',
      gap: '2px',
    };

    const labelStyle: React.CSSProperties = {
      fontSize: sizeValue * 0.9,
      color: error ? 'var(--color-error, #ff4d4f)' : 'inherit',
      userSelect: 'none',
      lineHeight: 1.4,
    };

    const descriptionStyle: React.CSSProperties = {
      fontSize: sizeValue * 0.75,
      color: 'var(--color-text-secondary, #666)',
      userSelect: 'none',
      lineHeight: 1.4,
    };

    const displayLabel = label || children;

    return (
      <label
        className={`rottay-radio rottay-radio--${size} rottay-radio--${color} ${isChecked ? 'rottay-radio--checked' : ''} ${disabled ? 'rottay-radio--disabled' : ''} ${error ? 'rottay-radio--error' : ''} ${className}`}
        style={containerStyle}
      >
        <span className="rottay-radio__circle" style={radioWrapperStyle}>
          <input
            ref={ref}
            id={inputId}
            type="radio"
            name={name}
            value={value}
            checked={isChecked}
            disabled={disabled}
            required={required}
            onChange={handleChange}
            style={inputStyle}
            aria-checked={isChecked}
            aria-invalid={error}
          />
          <span className="rottay-radio__dot" style={dotStyle} />
        </span>
        {(displayLabel || description) && (
          <span className="rottay-radio__content" style={labelContainerStyle}>
            {displayLabel && (
              <span className="rottay-radio__label" style={labelStyle}>
                {displayLabel}
              </span>
            )}
            {description && (
              <span className="rottay-radio__description" style={descriptionStyle}>
                {description}
              </span>
            )}
          </span>
        )}
      </label>
    );
  }
);

BaseRadio.displayName = 'BaseRadio';
