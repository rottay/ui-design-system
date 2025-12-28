/**
 * @fileoverview Checkbox Apollo Engine - Rottay Design System
 * @description Pure HTML/CSS implementation of the Checkbox component.
 * Part of the Rottay Design System's input primitives collection.
 *
 * @remarks
 * The Apollo engine provides a headless checkbox implementation using only
 * native HTML elements and inline styles. This offers maximum flexibility
 * for custom styling and ensures full accessibility compliance.
 *
 * **Key Features:**
 * - Zero UI library dependencies
 * - Custom SVG checkmark rendering
 * - Indeterminate state with horizontal line
 * - Focus ring management
 * - Keyboard navigation (Space, Enter)
 * - Full ARIA compliance
 *
 * **Visual Elements:**
 * - CheckmarkIcon: SVG path for checked state
 * - IndeterminateLine: Horizontal line for mixed state
 * - Focus outline with color matching
 *
 * **Accessibility:**
 * - Native input element with proper ARIA attributes
 * - aria-checked with "mixed" for indeterminate
 * - aria-invalid for error state
 * - aria-describedby linking to label
 * - Keyboard accessible via Space/Enter
 *
 * **Group Support:**
 * Includes ApolloCheckboxGroup for fully accessible group management.
 *
 * @example Using Apollo Engine
 * ```tsx
 * import { Checkbox } from '@rottay/design-system';
 *
 * // Explicit Apollo engine
 * <Checkbox
 *   engine="apollo"
 *   label="Accessible Checkbox"
 *   color="primary"
 *   radius="md"
 * />
 *
 * // With full customization
 * <Checkbox
 *   engine="apollo"
 *   size="lg"
 *   color="success"
 *   radius="full"
 *   labelPlacement="start"
 *   indeterminate={hasPartialSelection}
 * />
 * ```
 *
 * @see {@link Checkbox} for the main component
 * @see {@link TitanCheckbox} for Ant Design implementation
 * @see {@link HermesCheckbox} for DaisyUI implementation
 * @module ApolloCheckbox
 * @category Inputs
 * @package @rottay/design-system
 */

'use client';

import React, { useState, useRef, useEffect, useId, useCallback } from 'react';
import type { CheckboxProps, CheckboxGroupProps } from '../../types';
import { CHECKBOX_DEFAULTS, CHECKBOX_GROUP_DEFAULTS, SIZE_MAP, SIZE_MAP_NUMERIC, COLOR_MAP, RADIUS_MAP } from '../../types';

export default function ApolloCheckbox(props: CheckboxProps): React.ReactElement {
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
  const inputId = `checkbox-apollo-${generatedId}`;
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

  const sizeValue = SIZE_MAP[size] || SIZE_MAP.md;
  const sizeNumeric = SIZE_MAP_NUMERIC[size] || SIZE_MAP_NUMERIC.md;
  const colors = COLOR_MAP[color] || COLOR_MAP.primary;
  const radiusValue = RADIUS_MAP[radius] || RADIUS_MAP.sm;

  const containerStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    flexDirection: labelPlacement === 'start' ? 'row-reverse' : 'row',
    fontFamily: 'inherit',
    ...style,
  };

  const checkboxBoxStyle: React.CSSProperties = {
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: sizeValue,
    height: sizeValue,
    borderRadius: radiusValue,
    border: `2px solid ${error ? 'var(--color-error, #ff4d4f)' : (isChecked || indeterminate ? colors.border : '#d9d9d9')}`,
    backgroundColor: isChecked || indeterminate ? colors.bg : 'transparent',
    transition: 'all 0.2s ease-in-out',
    outline: isFocused ? `2px solid ${colors.bg}` : 'none',
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
    fontSize: sizeNumeric * 0.9,
    color: error ? 'var(--color-error, #ff4d4f)' : 'inherit',
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
        stroke={colors.check}
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
        backgroundColor: colors.check,
        borderRadius: 1,
      }}
    />
  );

  return (
    <label
      className={`rottay-checkbox-apollo rottay-checkbox--${size} rottay-checkbox--${color} ${isChecked ? 'rottay-checkbox--checked' : ''} ${indeterminate ? 'rottay-checkbox--indeterminate' : ''} ${disabled ? 'rottay-checkbox--disabled' : ''} ${error ? 'rottay-checkbox--error' : ''} ${className}`}
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
export function ApolloCheckboxGroup(props: CheckboxGroupProps): React.ReactElement {
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

  // Spacing values
  const spacingMap: Record<string, string> = {
    sm: '8px',
    md: '12px',
    lg: '16px',
  };

  const groupStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: direction === 'horizontal' ? 'row' : 'column',
    gap: spacingMap[spacing] || spacingMap.md,
    flexWrap: direction === 'horizontal' ? 'wrap' : 'nowrap',
    ...style,
  };

  const sizeValue = SIZE_MAP[size] || SIZE_MAP.md;
  const sizeNumeric = SIZE_MAP_NUMERIC[size] || SIZE_MAP_NUMERIC.md;
  const colors = COLOR_MAP[color] || COLOR_MAP.primary;

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
            gap: '8px',
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
              width: sizeValue,
              height: sizeValue,
              borderRadius: '2px',
              border: `2px solid ${isChecked ? colors.border : '#d9d9d9'}`,
              backgroundColor: isChecked ? colors.bg : 'transparent',
              transition: 'all 0.2s ease-in-out',
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
                  stroke={colors.check}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </span>
          <span style={{ fontSize: sizeNumeric * 0.9, userSelect: 'none' }}>
            {option.label}
          </span>
        </label>
      );
    });
  };

  return (
    <div
      className={`rottay-checkbox-group-apollo ${className}`}
      style={groupStyle}
      role="group"
      aria-label="Checkbox group"
    >
      {renderOptions()}
    </div>
  );
}

ApolloCheckbox.displayName = 'ApolloCheckbox';
ApolloCheckbox.Group = ApolloCheckboxGroup;
