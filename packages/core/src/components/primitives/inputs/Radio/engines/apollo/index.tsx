/**
 * @fileoverview Radio Apollo Engine - Rottay Design System
 * @description Pure HTML/CSS implementation of the Radio component using CSS variables.
 * Part of the Rottay Design System's input primitives collection.
 *
 * @module ApolloRadio
 * @category Inputs
 * @package @rottay/design-system
 */

'use client';

import React, { useState, useId, useCallback } from 'react';
import type { RadioProps, RadioGroupProps } from '../../types';
import { RADIO_DEFAULTS, RADIO_GROUP_DEFAULTS } from '../../types';

// Size mapping using CSS variables
const SIZE_VAR_MAP: Record<string, string> = {
  xs: 'var(--ds-radio-size-sm)',
  sm: 'var(--ds-radio-size-sm)',
  md: 'var(--ds-radio-size-md)',
  lg: 'var(--ds-radio-size-lg)',
  xl: 'var(--ds-radio-size-xl)',
};

// Numeric sizes for dot scaling
const SIZE_NUMERIC_MAP: Record<string, number> = {
  xs: 14,
  sm: 14,
  md: 16,
  lg: 20,
  xl: 24,
};

export default function ApolloRadio(props: RadioProps): React.ReactElement {
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
    style,
  } = props;

  const generatedId = useId();
  const inputId = `radio-apollo-${generatedId}`;

  const [internalChecked, setInternalChecked] = useState(defaultChecked);
  const [isFocused, setIsFocused] = useState(false);
  const isControlled = controlledChecked !== undefined;
  const isChecked = isControlled ? controlledChecked : internalChecked;

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isControlled) {
      setInternalChecked(e.target.checked);
    }
    onChange?.(e);
  }, [isControlled, onChange]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      if (!disabled) {
        const event = {
          target: { checked: true, value },
          currentTarget: { checked: true, value },
        } as React.ChangeEvent<HTMLInputElement>;
        handleChange(event);
      }
    }
  }, [disabled, value, handleChange]);

  const sizeVar = SIZE_VAR_MAP[size] || SIZE_VAR_MAP.md;
  const sizeNumeric = SIZE_NUMERIC_MAP[size] || SIZE_NUMERIC_MAP.md;

  // Get checked dot color based on color prop
  const getCheckedDot = () => {
    if (color === 'primary') return 'var(--ds-radio-checked-dot)';
    if (color === 'success') return 'var(--ds-color-success-500)';
    if (color === 'warning') return 'var(--ds-color-warning-500)';
    if (color === 'error') return 'var(--ds-color-error-500)';
    if (color === 'secondary') return 'var(--ds-color-secondary-500)';
    return 'var(--ds-radio-checked-dot)';
  };

  const containerStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'flex-start',
    gap: 'var(--ds-radio-label-gap)',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    flexDirection: labelPlacement === 'start' ? 'row-reverse' : 'row',
    fontFamily: 'var(--ds-font-family-base)',
    ...style,
  };

  const radioCircleStyle: React.CSSProperties = {
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: sizeVar,
    height: sizeVar,
    borderRadius: '50%',
    border: `2px solid ${error
      ? 'var(--ds-radio-error-border)'
      : isChecked
        ? getCheckedDot()
        : 'var(--ds-radio-border)'}`,
    backgroundColor: disabled
      ? 'var(--ds-radio-bg-disabled)'
      : 'var(--ds-radio-bg)',
    transition: 'var(--ds-radio-transition)',
    flexShrink: 0,
    marginTop: description ? '2px' : 0,
    outline: isFocused ? 'var(--ds-radio-focus-ring)' : 'none',
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

  const dotStyle: React.CSSProperties = {
    display: isChecked ? 'block' : 'none',
    width: sizeNumeric * 0.5,
    height: sizeNumeric * 0.5,
    borderRadius: '50%',
    backgroundColor: getCheckedDot(),
    transition: 'var(--ds-radio-transition)',
  };

  const labelContainerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: `${sizeNumeric * 0.9}px`,
    color: error
      ? 'var(--ds-radio-error-color)'
      : disabled
        ? 'var(--ds-radio-label-color-disabled)'
        : 'var(--ds-radio-label-color)',
    userSelect: 'none',
    lineHeight: 1.4,
  };

  const descriptionStyle: React.CSSProperties = {
    fontSize: `${sizeNumeric * 0.75}px`,
    color: 'var(--ds-radio-description-color)',
    userSelect: 'none',
    lineHeight: 1.4,
  };

  const displayLabel = label || children;

  // Build class names
  const containerClasses = [
    'rottay-radio',
    'rottay-radio--apollo',
    `rottay-radio--${size}`,
    `rottay-radio--${color}`,
    isChecked && 'rottay-radio--checked',
    disabled && 'rottay-radio--disabled',
    error && 'rottay-radio--error',
    className,
  ].filter(Boolean).join(' ');

  return (
    <label
      className={containerClasses}
      style={containerStyle}
      onKeyDown={handleKeyDown}
    >
      <span
        className="rottay-radio__circle"
        style={radioCircleStyle}
        role="presentation"
      >
        <input
          id={inputId}
          type="radio"
          name={name}
          value={value}
          checked={isChecked}
          disabled={disabled}
          required={required}
          onChange={handleChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          style={inputStyle}
          aria-checked={isChecked}
          aria-invalid={error}
          aria-describedby={displayLabel ? `${inputId}-label` : undefined}
        />
        <span className="rottay-radio__dot" style={dotStyle} />
      </span>
      {(displayLabel || description) && (
        <span
          id={`${inputId}-label`}
          className="rottay-radio__content"
          style={labelContainerStyle}
        >
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

// Radio Group component
export function ApolloRadioGroup(props: RadioGroupProps): React.ReactElement {
  const {
    size = RADIO_GROUP_DEFAULTS.size,
    color = RADIO_GROUP_DEFAULTS.color,
    options = [],
    value: controlledValue,
    defaultValue,
    disabled = RADIO_GROUP_DEFAULTS.disabled,
    direction = RADIO_GROUP_DEFAULTS.direction,
    spacing = RADIO_GROUP_DEFAULTS.spacing,
    buttonStyle,
    onChange,
    children,
    className = '',
    style,
    name: providedName,
  } = props;

  const generatedId = useId();
  const name = providedName || `radio-group-${generatedId}`;

  const [internalValue, setInternalValue] = useState<string | number | undefined>(defaultValue);
  const isControlled = controlledValue !== undefined;
  const currentValue = isControlled ? controlledValue : internalValue;

  const handleChange = (newValue: string | number) => {
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

  // Get checked dot color based on color prop
  const getCheckedDot = () => {
    if (color === 'primary') return 'var(--ds-radio-checked-dot)';
    if (color === 'success') return 'var(--ds-color-success-500)';
    if (color === 'warning') return 'var(--ds-color-warning-500)';
    if (color === 'error') return 'var(--ds-color-error-500)';
    if (color === 'secondary') return 'var(--ds-color-secondary-500)';
    return 'var(--ds-radio-checked-dot)';
  };

  const renderOptions = () => {
    if (options.length === 0) return children;

    if (buttonStyle) {
      return options.map((option) => {
        const isChecked = currentValue === option.value;
        const isDisabled = disabled || option.disabled;

        const paddingMap: Record<string, string> = {
          xs: '0.25rem 0.5rem',
          sm: '0.375rem 0.75rem',
          md: '0.5rem 1rem',
          lg: '0.625rem 1.25rem',
          xl: '0.75rem 1.5rem',
        };

        return (
          <label
            key={String(option.value)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: paddingMap[size] || paddingMap.md,
              cursor: isDisabled ? 'not-allowed' : 'pointer',
              opacity: isDisabled ? 0.5 : 1,
              border: `1px solid ${isChecked ? getCheckedDot() : 'var(--ds-radio-button-border)'}`,
              borderRadius: 'var(--ds-radio-button-radius)',
              backgroundColor: buttonStyle === 'solid' && isChecked
                ? 'var(--ds-radio-button-bg-checked)'
                : 'var(--ds-radio-button-bg)',
              color: buttonStyle === 'solid' && isChecked
                ? 'var(--ds-radio-button-color-checked)'
                : 'var(--ds-radio-label-color)',
              transition: 'var(--ds-radio-transition)',
              fontSize: `${sizeNumeric * 0.85}px`,
              fontWeight: 500,
              userSelect: 'none',
            }}
          >
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={isChecked}
              disabled={isDisabled}
              onChange={() => handleChange(option.value)}
              style={{
                position: 'absolute',
                opacity: 0,
                width: 0,
                height: 0,
              }}
            />
            {option.label}
          </label>
        );
      });
    }

    return options.map((option) => {
      const isChecked = currentValue === option.value;
      const isDisabled = disabled || option.disabled;

      return (
        <label
          key={String(option.value)}
          style={{
            display: 'inline-flex',
            alignItems: 'flex-start',
            gap: 'var(--ds-radio-label-gap)',
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
              borderRadius: '50%',
              border: `2px solid ${isChecked ? getCheckedDot() : 'var(--ds-radio-border)'}`,
              backgroundColor: isDisabled
                ? 'var(--ds-radio-bg-disabled)'
                : 'var(--ds-radio-bg)',
              transition: 'var(--ds-radio-transition)',
              flexShrink: 0,
              marginTop: option.description ? '2px' : 0,
            }}
          >
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={isChecked}
              disabled={isDisabled}
              onChange={() => handleChange(option.value)}
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
              <span
                style={{
                  width: sizeNumeric * 0.5,
                  height: sizeNumeric * 0.5,
                  borderRadius: '50%',
                  backgroundColor: getCheckedDot(),
                }}
              />
            )}
          </span>
          <span style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <span
              style={{
                fontSize: `${sizeNumeric * 0.9}px`,
                userSelect: 'none',
                lineHeight: 1.4,
                color: isDisabled
                  ? 'var(--ds-radio-label-color-disabled)'
                  : 'var(--ds-radio-label-color)',
              }}
            >
              {option.label}
            </span>
            {option.description && (
              <span
                style={{
                  fontSize: `${sizeNumeric * 0.75}px`,
                  color: 'var(--ds-radio-description-color)',
                  userSelect: 'none',
                  lineHeight: 1.4,
                }}
              >
                {option.description}
              </span>
            )}
          </span>
        </label>
      );
    });
  };

  return (
    <div
      className={`rottay-radio-group rottay-radio-group--apollo ${className}`}
      style={groupStyle}
      role="radiogroup"
      aria-label="Radio group"
    >
      {renderOptions()}
    </div>
  );
}

ApolloRadio.displayName = 'ApolloRadio';
ApolloRadio.Group = ApolloRadioGroup;
