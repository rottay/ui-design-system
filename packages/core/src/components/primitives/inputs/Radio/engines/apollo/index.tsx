/**
 * @fileoverview Radio Apollo Engine - Rottay Design System
 * @description Pure HTML/CSS implementation of the Radio component.
 * Part of the Rottay Design System's input primitives collection.
 *
 * @remarks
 * The Apollo engine provides a headless radio implementation using only
 * native HTML elements and inline styles. This offers maximum flexibility
 * for custom styling and ensures full accessibility compliance.
 *
 * **Key Features:**
 * - Zero UI library dependencies
 * - Circular dot indicator for checked state
 * - Focus ring management
 * - Keyboard navigation (Space, Enter)
 * - Full ARIA compliance
 * - Button style variant support
 * - Option descriptions
 *
 * **Visual Elements:**
 * - Outer circle with border
 * - Inner dot when selected
 * - Focus outline with color matching
 * - Button-style rendering when buttonStyle prop is used
 *
 * **Accessibility:**
 * - Native radio input with proper ARIA attributes
 * - aria-checked for selection state
 * - aria-invalid for error state
 * - role="radiogroup" on group container
 * - Keyboard accessible via Space/Enter
 *
 * @example Using Apollo Engine
 * ```tsx
 * import { Radio } from '@rottay/design-system';
 *
 * // Explicit Apollo engine
 * <Radio
 *   engine="apollo"
 *   name="option"
 *   value="a"
 *   label="Accessible Radio"
 *   description="With description support"
 * />
 *
 * // Button style group
 * <Radio.Group
 *   engine="apollo"
 *   options={options}
 *   buttonStyle="solid"
 *   direction="horizontal"
 * />
 * ```
 *
 * @see {@link Radio} for the main component
 * @see {@link TitanRadio} for Ant Design implementation
 * @see {@link HermesRadio} for DaisyUI implementation
 * @module ApolloRadio
 * @category Inputs
 * @package @rottay/design-system
 */

'use client';

import React, { useState, useId, useCallback } from 'react';
import type { RadioProps, RadioGroupProps } from '../../types';
import { RADIO_DEFAULTS, RADIO_GROUP_DEFAULTS, SIZE_MAP, SIZE_MAP_NUMERIC, COLOR_MAP } from '../../types';

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

  // Internal state for uncontrolled mode
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

  const sizeValue = SIZE_MAP[size] || SIZE_MAP.md;
  const sizeNumeric = SIZE_MAP_NUMERIC[size] || SIZE_MAP_NUMERIC.md;
  const colors = COLOR_MAP[color] || COLOR_MAP.primary;

  const containerStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'flex-start',
    gap: '8px',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    flexDirection: labelPlacement === 'start' ? 'row-reverse' : 'row',
    fontFamily: 'inherit',
    ...style,
  };

  const radioCircleStyle: React.CSSProperties = {
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: sizeValue,
    height: sizeValue,
    borderRadius: '50%',
    border: `2px solid ${error ? 'var(--color-error, #ff4d4f)' : (isChecked ? colors.border : '#d9d9d9')}`,
    backgroundColor: 'transparent',
    transition: 'all 0.2s ease-in-out',
    flexShrink: 0,
    marginTop: description ? '2px' : 0,
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

  const dotStyle: React.CSSProperties = {
    display: isChecked ? 'block' : 'none',
    width: sizeNumeric * 0.5,
    height: sizeNumeric * 0.5,
    borderRadius: '50%',
    backgroundColor: colors.bg,
    transition: 'transform 0.15s ease-in-out',
  };

  const labelContainerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: sizeNumeric * 0.9,
    color: error ? 'var(--color-error, #ff4d4f)' : 'inherit',
    userSelect: 'none',
    lineHeight: 1.4,
  };

  const descriptionStyle: React.CSSProperties = {
    fontSize: sizeNumeric * 0.75,
    color: 'var(--color-text-secondary, #666)',
    userSelect: 'none',
    lineHeight: 1.4,
  };

  const displayLabel = label || children;

  return (
    <label
      className={`rottay-radio-apollo rottay-radio--${size} rottay-radio--${color} ${isChecked ? 'rottay-radio--checked' : ''} ${disabled ? 'rottay-radio--disabled' : ''} ${error ? 'rottay-radio--error' : ''} ${className}`}
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

  // Internal state for uncontrolled mode
  const [internalValue, setInternalValue] = useState<string | number | undefined>(defaultValue);
  const isControlled = controlledValue !== undefined;
  const currentValue = isControlled ? controlledValue : internalValue;

  const handleChange = (newValue: string | number) => {
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

    if (buttonStyle) {
      return options.map((option) => {
        const isChecked = currentValue === option.value;
        const isDisabled = disabled || option.disabled;

        const paddingMap: Record<string, string> = {
          xs: '4px 8px',
          sm: '6px 12px',
          md: '8px 16px',
          lg: '10px 20px',
          xl: '12px 24px',
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
              border: `1px solid ${isChecked ? colors.border : '#d9d9d9'}`,
              borderRadius: '4px',
              backgroundColor: buttonStyle === 'solid' && isChecked ? colors.bg : 'transparent',
              color: buttonStyle === 'solid' && isChecked ? colors.dot : 'inherit',
              transition: 'all 0.2s ease-in-out',
              fontSize: sizeNumeric * 0.85,
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
              borderRadius: '50%',
              border: `2px solid ${isChecked ? colors.border : '#d9d9d9'}`,
              backgroundColor: 'transparent',
              transition: 'all 0.2s ease-in-out',
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
                  backgroundColor: colors.bg,
                }}
              />
            )}
          </span>
          <span style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <span style={{ fontSize: sizeNumeric * 0.9, userSelect: 'none', lineHeight: 1.4 }}>
              {option.label}
            </span>
            {option.description && (
              <span style={{ fontSize: sizeNumeric * 0.75, color: '#666', userSelect: 'none', lineHeight: 1.4 }}>
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
      className={`rottay-radio-group-apollo ${className}`}
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
