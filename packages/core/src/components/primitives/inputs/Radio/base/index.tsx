/**
 * @fileoverview Radio Base Component - Rottay Design System
 * @description Core radio implementation using CSS custom properties for styling.
 * Part of the Rottay Design System's input primitives collection.
 *
 * @remarks
 * The BaseRadio component provides a foundational radio implementation that
 * relies on CSS custom properties for theming. It supports controlled/uncontrolled
 * modes and full accessibility compliance.
 *
 * **Key Features:**
 * - Pure CSS variable-based theming
 * - Controlled and uncontrolled modes
 * - Circular dot indicator for checked state
 * - Label and description support
 * - Label placement options (start/end)
 * - Error state indication
 * - Size and color variants
 *
 * **CSS Custom Properties Used:**
 * - `--ds-radio-size` - Radio dimensions
 * - `--ds-radio-bg` - Dot background color when checked
 * - `--ds-radio-border` - Border color
 * - `--ds-radio-dot-color` - Dot color
 *
 * **Accessibility:**
 * - Native radio input for form compatibility
 * - aria-checked for selection state
 * - aria-invalid for error state
 * - Proper label association via htmlFor
 *
 * @example Basic Usage
 * ```tsx
 * import { BaseRadio } from './base';
 *
 * <BaseRadio
 *   name="option"
 *   value="a"
 *   label="Option A"
 *   onChange={(e) => console.log(e.target.value)}
 * />
 * ```
 *
 * @example With Description
 * ```tsx
 * import { BaseRadio } from './base';
 *
 * <BaseRadio
 *   name="plan"
 *   value="pro"
 *   size="lg"
 *   color="primary"
 *   label="Pro Plan"
 *   description="Includes all premium features"
 *   checked={plan === 'pro'}
 *   onChange={() => setPlan('pro')}
 * />
 * ```
 *
 * @see {@link Radio} for the engine-aware wrapper
 * @see {@link TitanRadio} for Ant Design implementation
 * @see {@link HermesRadio} for DaisyUI implementation
 * @see {@link ApolloRadio} for vanilla implementation
 * @module BaseRadio
 * @category Inputs
 * @package @rottay/design-system
 */

'use client';

import React, { forwardRef, useState, useId } from 'react';
import type { RadioProps } from '../types';
import { RADIO_DEFAULTS, SIZE_MAP, SIZE_MAP_NUMERIC, COLOR_MAP } from '../types';

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
    const sizeNumeric = SIZE_MAP_NUMERIC[size] || SIZE_MAP_NUMERIC.md;
    const colors = COLOR_MAP[color] || COLOR_MAP.primary;

    // Build CSS variables for the radio
    const radioVars: React.CSSProperties = {
      '--ds-radio-size': sizeValue,
      '--ds-radio-bg': isChecked ? colors.bg : 'transparent',
      '--ds-radio-border': error ? 'var(--ds-color-error-500, #ff4d4f)' : (isChecked ? colors.border : 'var(--ds-color-border, #d9d9d9)'),
      '--ds-radio-dot-color': colors.dot,
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
      width: 'var(--ds-radio-size)',
      height: 'var(--ds-radio-size)',
      borderRadius: '50%',
      border: '2px solid var(--ds-radio-border)',
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
      width: sizeNumeric * 0.5,
      height: sizeNumeric * 0.5,
      borderRadius: '50%',
      backgroundColor: 'var(--ds-radio-bg)',
    };

    const labelContainerStyle: React.CSSProperties = {
      display: 'flex',
      flexDirection: 'column',
      gap: '2px',
    };

    const labelStyle: React.CSSProperties = {
      fontSize: sizeNumeric * 0.9,
      color: error ? 'var(--ds-color-error-500, #ff4d4f)' : 'inherit',
      userSelect: 'none',
      lineHeight: 1.4,
    };

    const descriptionStyle: React.CSSProperties = {
      fontSize: sizeNumeric * 0.75,
      color: 'var(--ds-color-text-secondary, #666)',
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
