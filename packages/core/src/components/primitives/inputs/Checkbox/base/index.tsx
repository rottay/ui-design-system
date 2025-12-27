/**
 * Checkbox - Base Component
 * Uses CSS variables from design tokens for consistent styling
 */

'use client';

import React, { forwardRef, useState, useEffect, useRef, useId } from 'react';
import type { CheckboxProps } from '../types';
import { CHECKBOX_DEFAULTS, SIZE_MAP, SIZE_MAP_NUMERIC, COLOR_MAP, RADIUS_MAP } from '../types';

/**
 * Base Checkbox component using CSS variables.
 * This is extended by engine-specific implementations.
 */
export const BaseCheckbox = forwardRef<HTMLInputElement, CheckboxProps>(
  (props, ref) => {
    const {
      size = CHECKBOX_DEFAULTS.size,
      color = CHECKBOX_DEFAULTS.color,
      radius = CHECKBOX_DEFAULTS.radius,
      labelPlacement = CHECKBOX_DEFAULTS.labelPlacement,
      label,
      checked: controlledChecked,
      defaultChecked = CHECKBOX_DEFAULTS.defaultChecked,
      indeterminate = CHECKBOX_DEFAULTS.indeterminate,
      disabled = CHECKBOX_DEFAULTS.disabled,
      required = CHECKBOX_DEFAULTS.required,
      error = CHECKBOX_DEFAULTS.error,
      onChange,
      children,
      name,
      value,
      className = '',
      style = {},
    } = props;

    const generatedId = useId();
    const inputId = `checkbox-${generatedId}`;
    const inputRef = useRef<HTMLInputElement>(null);

    // Internal state for uncontrolled mode
    const [internalChecked, setInternalChecked] = useState(defaultChecked);
    const isControlled = controlledChecked !== undefined;
    const isChecked = isControlled ? controlledChecked : internalChecked;

    // Sync ref
    useEffect(() => {
      if (ref) {
        if (typeof ref === 'function') {
          ref(inputRef.current);
        } else {
          (ref as React.MutableRefObject<HTMLInputElement | null>).current = inputRef.current;
        }
      }
    }, [ref]);

    // Handle indeterminate state
    useEffect(() => {
      if (inputRef.current) {
        inputRef.current.indeterminate = indeterminate;
      }
    }, [indeterminate]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newChecked = e.target.checked;

      if (!isControlled) {
        setInternalChecked(newChecked);
      }

      onChange?.(newChecked, e);
    };

    const sizeValue = SIZE_MAP[size] || SIZE_MAP.md;
    const sizeNumeric = SIZE_MAP_NUMERIC[size] || SIZE_MAP_NUMERIC.md;
    const colors = COLOR_MAP[color] || COLOR_MAP.primary;
    const radiusValue = RADIUS_MAP[radius] || RADIUS_MAP.sm;

    // Build CSS variables for the checkbox
    const checkboxVars: React.CSSProperties = {
      '--checkbox-size': sizeValue,
      '--checkbox-bg': isChecked || indeterminate ? colors.bg : 'transparent',
      '--checkbox-border': error ? 'var(--color-error, #ff4d4f)' : (isChecked || indeterminate ? colors.border : 'var(--color-border, #d9d9d9)'),
      '--checkbox-check-color': colors.check,
      '--checkbox-border-radius': radiusValue,
    } as React.CSSProperties;

    const containerStyle: React.CSSProperties = {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.5 : 1,
      flexDirection: labelPlacement === 'start' ? 'row-reverse' : 'row',
      ...style,
    };

    const checkboxWrapperStyle: React.CSSProperties = {
      ...checkboxVars,
      position: 'relative',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: 'var(--checkbox-size)',
      height: 'var(--checkbox-size)',
      borderRadius: 'var(--checkbox-border-radius)',
      border: '2px solid var(--checkbox-border)',
      backgroundColor: 'var(--checkbox-bg)',
      transition: 'all 0.2s ease-in-out',
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

    const checkmarkStyle: React.CSSProperties = {
      display: isChecked && !indeterminate ? 'block' : 'none',
      width: sizeNumeric * 0.5,
      height: sizeNumeric * 0.3,
      borderLeft: '2px solid var(--checkbox-check-color)',
      borderBottom: '2px solid var(--checkbox-check-color)',
      transform: 'rotate(-45deg) translateY(-1px)',
    };

    const indeterminateStyle: React.CSSProperties = {
      display: indeterminate ? 'block' : 'none',
      width: sizeNumeric * 0.6,
      height: '2px',
      backgroundColor: 'var(--checkbox-check-color)',
    };

    const labelStyle: React.CSSProperties = {
      fontSize: sizeNumeric * 0.9,
      color: error ? 'var(--color-error, #ff4d4f)' : 'inherit',
      userSelect: 'none',
    };

    const displayLabel = label || children;

    return (
      <label
        className={`rottay-checkbox rottay-checkbox--${size} rottay-checkbox--${color} ${isChecked ? 'rottay-checkbox--checked' : ''} ${indeterminate ? 'rottay-checkbox--indeterminate' : ''} ${disabled ? 'rottay-checkbox--disabled' : ''} ${error ? 'rottay-checkbox--error' : ''} ${className}`}
        style={containerStyle}
      >
        <span className="rottay-checkbox__box" style={checkboxWrapperStyle}>
          <input
            ref={inputRef}
            id={inputId}
            type="checkbox"
            name={name}
            value={value}
            checked={isChecked}
            disabled={disabled}
            required={required}
            onChange={handleChange}
            style={inputStyle}
            aria-checked={indeterminate ? 'mixed' : isChecked}
            aria-invalid={error}
          />
          <span className="rottay-checkbox__checkmark" style={checkmarkStyle} />
          <span className="rottay-checkbox__indeterminate" style={indeterminateStyle} />
        </span>
        {displayLabel && (
          <span className="rottay-checkbox__label" style={labelStyle}>
            {displayLabel}
          </span>
        )}
      </label>
    );
  }
);

BaseCheckbox.displayName = 'BaseCheckbox';
