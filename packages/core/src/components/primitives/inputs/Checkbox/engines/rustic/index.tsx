/**
 * @fileoverview Checkbox Rustic Engine - Rottay Design System
 * @description Pure HTML/CSS implementation of the Checkbox component using CSS variables.
 * Part of the Rottay Design System's input primitives collection.
 *
 * @module RusticCheckbox
 * @category Inputs
 * @package @rottay/design-system
 */

'use client';

import React, { useState, useRef, useEffect, useId, useCallback } from 'react';
import type { CheckboxProps, CheckboxGroupProps } from '../../types';
import { CHECKBOX_DEFAULTS, CHECKBOX_GROUP_DEFAULTS } from '../../types';

// Size mapping using CSS variables
const SIZE_VAR_MAP: Record<string, string> = {
  xs: 'var(--ds-checkbox-size-sm)',
  sm: 'var(--ds-checkbox-size-sm)',
  md: 'var(--ds-checkbox-size-md)',
  lg: 'var(--ds-checkbox-size-lg)',
  xl: 'var(--ds-checkbox-size-xl)',
};

// Numeric sizes for SVG scaling
const SIZE_NUMERIC_MAP: Record<string, number> = {
  xs: 14,
  sm: 14,
  md: 16,
  lg: 20,
  xl: 24,
};

export default function RusticCheckbox(props: CheckboxProps): React.ReactElement {
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
    style,
  } = props;

  const generatedId = useId();
  const inputId = `checkbox-rustic-${generatedId}`;
  const inputRef = useRef<HTMLInputElement>(null);

  // Internal state for uncontrolled mode
  const [internalChecked, setInternalChecked] = useState(defaultChecked);
  const [isFocused, setIsFocused] = useState(false);
  const isControlled = controlledChecked !== undefined;
  const isChecked = isControlled ? controlledChecked : internalChecked;

  // Handle indeterminate state
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.indeterminate = indeterminate;
    }
  }, [indeterminate]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newChecked = e.target.checked;

    if (!isControlled) {
      setInternalChecked(newChecked);
    }

    onChange?.(newChecked, e);
  }, [isControlled, onChange]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      if (!disabled && inputRef.current) {
        inputRef.current.click();
      }
    }
  }, [disabled]);

  // Get size values
  const sizeVar = SIZE_VAR_MAP[size] || SIZE_VAR_MAP.md;
  const sizeNumeric = SIZE_NUMERIC_MAP[size] || SIZE_NUMERIC_MAP.md;

  // Determine radius based on prop
  const getRadius = () => {
    if (radius === 'full') return '50%';
    if (radius === 'none') return '0';
    if (radius === 'sm') return 'var(--ds-radius-sm)';
    if (radius === 'md') return 'var(--ds-radius-md)';
    if (radius === 'lg') return 'var(--ds-radius-lg)';
    return 'var(--ds-checkbox-radius)';
  };

  // Get colors based on color prop (for theming flexibility)
  const getCheckedBg = () => {
    if (color === 'primary') return 'var(--ds-checkbox-checked-bg)';
    if (color === 'success') return 'var(--ds-color-success-500)';
    if (color === 'warning') return 'var(--ds-color-warning-500)';
    if (color === 'error') return 'var(--ds-color-error-500)';
    if (color === 'secondary') return 'var(--ds-color-secondary-500)';
    return 'var(--ds-checkbox-checked-bg)';
  };

  const containerStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 'var(--ds-checkbox-label-gap)',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    flexDirection: labelPlacement === 'start' ? 'row-reverse' : 'row',
    fontFamily: 'var(--ds-font-family-base)',
    ...style,
  };

  const checkboxBoxStyle: React.CSSProperties = {
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: sizeVar,
    height: sizeVar,
    borderRadius: getRadius(),
    border: `2px solid ${error
      ? 'var(--ds-checkbox-error-border)'
      : (isChecked || indeterminate
          ? getCheckedBg()
          : 'var(--ds-checkbox-border)')}`,
    backgroundColor: isChecked || indeterminate
      ? getCheckedBg()
      : disabled
        ? 'var(--ds-checkbox-bg-disabled)'
        : 'var(--ds-checkbox-bg)',
    transition: 'var(--ds-checkbox-transition)',
    outline: isFocused ? 'var(--ds-checkbox-focus-ring)' : 'none',
    outlineOffset: '2px',
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

  const labelStyle: React.CSSProperties = {
    fontSize: `${sizeNumeric * 0.9}px`,
    color: error
      ? 'var(--ds-checkbox-error-color)'
      : disabled
        ? 'var(--ds-checkbox-label-color-disabled)'
        : 'var(--ds-checkbox-label-color)',
    userSelect: 'none',
  };

  const displayLabel = label || children;

  // Checkmark SVG for checked state
  const CheckmarkIcon = () => (
    <svg
      width={sizeNumeric * 0.6}
      height={sizeNumeric * 0.6}
      viewBox="0 0 12 12"
      fill="none"
      style={{ display: isChecked && !indeterminate ? 'block' : 'none' }}
    >
      <path
        d="M2 6L5 9L10 3"
        stroke="var(--ds-checkbox-checked-color)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  // Indeterminate line
  const IndeterminateLine = () => (
    <div
      style={{
        display: indeterminate ? 'block' : 'none',
        width: sizeNumeric * 0.6,
        height: 2,
        backgroundColor: 'var(--ds-checkbox-checked-color)',
        borderRadius: 1,
      }}
    />
  );

  // Build class names
  const containerClasses = [
    'rottay-checkbox',
    'rottay-checkbox--rustic',
    `rottay-checkbox--${size}`,
    `rottay-checkbox--${color}`,
    isChecked && 'rottay-checkbox--checked',
    indeterminate && 'rottay-checkbox--indeterminate',
    disabled && 'rottay-checkbox--disabled',
    error && 'rottay-checkbox--error',
    className,
  ].filter(Boolean).join(' ');

  return (
    <label
      className={containerClasses}
      style={containerStyle}
      onKeyDown={handleKeyDown}
    >
      <span
        className="rottay-checkbox__box"
        style={checkboxBoxStyle}
        role="presentation"
      >
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
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          style={inputStyle}
          aria-checked={indeterminate ? 'mixed' : isChecked}
          aria-invalid={error}
          aria-describedby={displayLabel ? `${inputId}-label` : undefined}
        />
        <CheckmarkIcon />
        <IndeterminateLine />
      </span>
      {displayLabel && (
        <span
          id={`${inputId}-label`}
          className="rottay-checkbox__label"
          style={labelStyle}
        >
          {displayLabel}
        </span>
      )}
    </label>
  );
}

// Checkbox Group component
export function RusticCheckboxGroup(props: CheckboxGroupProps): React.ReactElement {
  const {
    size = CHECKBOX_GROUP_DEFAULTS.size,
    color = CHECKBOX_GROUP_DEFAULTS.color,
    options = [],
    value: controlledValue,
    defaultValue = [],
    disabled = CHECKBOX_GROUP_DEFAULTS.disabled,
    direction = CHECKBOX_GROUP_DEFAULTS.direction,
    spacing = CHECKBOX_GROUP_DEFAULTS.spacing,
    onChange,
    children,
    className = '',
    style,
    name,
  } = props;

  const generatedId = useId();

  // Internal state for uncontrolled mode
  const [internalValue, setInternalValue] = useState<(string | number)[]>(defaultValue);
  const isControlled = controlledValue !== undefined;
  const currentValue = isControlled ? controlledValue : internalValue;

  const handleItemChange = (itemValue: string | number, checked: boolean) => {
    let newValue: (string | number)[];

    if (checked) {
      newValue = [...currentValue, itemValue];
    } else {
      newValue = currentValue.filter((v) => v !== itemValue);
    }

    if (!isControlled) {
      setInternalValue(newValue);
    }

    onChange?.(newValue);
  };

  // Spacing values using CSS variables
  const spacingMap: Record<string, string> = {
    sm: 'var(--ds-spacing-2)',
    md: 'var(--ds-spacing-3)',
    lg: 'var(--ds-spacing-4)',
  };

  const groupStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: direction === 'horizontal' ? 'row' : 'column',
    gap: spacingMap[spacing] || spacingMap.md,
    flexWrap: direction === 'horizontal' ? 'wrap' : 'nowrap',
    ...style,
  };

  const sizeVar = SIZE_VAR_MAP[size] || SIZE_VAR_MAP.md;
  const sizeNumeric = SIZE_NUMERIC_MAP[size] || SIZE_NUMERIC_MAP.md;

  // Get colors based on color prop
  const getCheckedBg = () => {
    if (color === 'primary') return 'var(--ds-checkbox-checked-bg)';
    if (color === 'success') return 'var(--ds-color-success-500)';
    if (color === 'warning') return 'var(--ds-color-warning-500)';
    if (color === 'error') return 'var(--ds-color-error-500)';
    if (color === 'secondary') return 'var(--ds-color-secondary-500)';
    return 'var(--ds-checkbox-checked-bg)';
  };

  const renderOptions = () => {
    if (options.length === 0) return children;

    return options.map((option) => {
      const isChecked = currentValue.includes(option.value);
      const isDisabled = disabled || option.disabled;

      return (
        <label
          key={String(option.value)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 'var(--ds-checkbox-label-gap)',
            cursor: isDisabled ? 'not-allowed' : 'pointer',
            opacity: isDisabled ? 0.5 : 1,
          }}
        >
          <span
            style={{
              position: 'relative',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: sizeVar,
              height: sizeVar,
              borderRadius: 'var(--ds-checkbox-radius)',
              border: `2px solid ${isChecked ? getCheckedBg() : 'var(--ds-checkbox-border)'}`,
              backgroundColor: isChecked
                ? getCheckedBg()
                : isDisabled
                  ? 'var(--ds-checkbox-bg-disabled)'
                  : 'var(--ds-checkbox-bg)',
              transition: 'var(--ds-checkbox-transition)',
            }}
          >
            <input
              type="checkbox"
              name={name || `checkbox-group-${generatedId}`}
              value={option.value}
              checked={isChecked}
              disabled={isDisabled}
              onChange={(e) => handleItemChange(option.value, e.target.checked)}
              style={{
                position: 'absolute',
                opacity: 0,
                width: '100%',
                height: '100%',
                margin: 0,
                padding: 0,
                cursor: isDisabled ? 'not-allowed' : 'pointer',
              }}
            />
            {isChecked && (
              <svg
                width={sizeNumeric * 0.6}
                height={sizeNumeric * 0.6}
                viewBox="0 0 12 12"
                fill="none"
              >
                <path
                  d="M2 6L5 9L10 3"
                  stroke="var(--ds-checkbox-checked-color)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </span>
          <span
            style={{
              fontSize: `${sizeNumeric * 0.9}px`,
              userSelect: 'none',
              color: isDisabled
                ? 'var(--ds-checkbox-label-color-disabled)'
                : 'var(--ds-checkbox-label-color)',
            }}
          >
            {option.label}
          </span>
        </label>
      );
    });
  };

  return (
    <div
      className={`rottay-checkbox-group rottay-checkbox-group--rustic ${className}`}
      style={groupStyle}
      role="group"
      aria-label="Checkbox group"
    >
      {renderOptions()}
    </div>
  );
}

RusticCheckbox.displayName = 'RusticCheckbox';
RusticCheckbox.Group = RusticCheckboxGroup;
