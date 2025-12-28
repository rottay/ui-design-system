/**
 * @fileoverview Radio Hermes Engine - Rottay Design System
 * @description DaisyUI/Tailwind CSS implementation of the Radio component.
 * Part of the Rottay Design System's input primitives collection.
 *
 * @remarks
 * The Hermes engine implements radios using DaisyUI's utility-first approach
 * with Tailwind CSS classes. It provides a lightweight alternative with
 * smaller bundle size.
 *
 * **DaisyUI Features Utilized:**
 * - Radio component classes
 * - Size modifiers (radio-xs, radio-sm, radio-lg)
 * - Color modifiers (radio-primary, radio-secondary, etc.)
 * - Form control wrapper for label alignment
 * - Label text and alt-text for descriptions
 *
 * **Prop Mapping:**
 * - `size="xs"` → `radio-xs`
 * - `size="sm"` → `radio-sm`
 * - `size="lg"` → `radio-lg`
 * - `color="primary"` → `radio-primary`
 * - `color="success"` → `radio-success`
 *
 * **Description Support:**
 * Uses DaisyUI's `label-text-alt` class for option descriptions.
 *
 * @example Using Hermes Engine
 * ```tsx
 * import { Radio } from '@rottay/design-system';
 *
 * // Explicit Hermes engine
 * <Radio
 *   engine="hermes"
 *   name="option"
 *   value="a"
 *   label="DaisyUI Radio"
 *   description="Additional info"
 *   color="success"
 * />
 * ```
 *
 * @see {@link Radio} for the main component
 * @see {@link TitanRadio} for Ant Design implementation
 * @see {@link ApolloRadio} for vanilla implementation
 * @module HermesRadio
 * @category Inputs
 * @package @rottay/design-system
 */

'use client';

import React, { useState, useId } from 'react';
import type { RadioProps, RadioGroupProps } from '../../types';
import { RADIO_DEFAULTS, RADIO_GROUP_DEFAULTS } from '../../types';

export default function HermesRadio(props: RadioProps): React.ReactElement {
  const {
    size = RADIO_DEFAULTS.size,
    color = RADIO_DEFAULTS.color,
    label,
    value,
    checked: controlledChecked,
    defaultChecked = false,
    disabled = RADIO_DEFAULTS.disabled,
    onChange,
    children,
    name,
    description,
    className = '',
    style,
  } = props;

  const generatedId = useId();
  const inputId = `radio-hermes-${generatedId}`;

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

  // DaisyUI size classes
  const sizeClass = {
    xs: 'radio-xs',
    sm: 'radio-sm',
    md: '',
    lg: 'radio-lg',
    xl: 'radio-lg',
  }[size] || '';

  // DaisyUI color classes
  const colorClass = {
    default: '',
    primary: 'radio-primary',
    secondary: 'radio-secondary',
    success: 'radio-success',
    warning: 'radio-warning',
    error: 'radio-error',
  }[color] || 'radio-primary';

  const displayLabel = label || children;

  return (
    <div className={`form-control ${className}`} style={style}>
      <label className="label cursor-pointer gap-2 justify-start">
        <input
          id={inputId}
          type="radio"
          name={name}
          value={value}
          checked={isChecked}
          disabled={disabled}
          onChange={handleChange}
          className={`radio ${sizeClass} ${colorClass}`}
          aria-checked={isChecked}
        />
        {(displayLabel || description) && (
          <div className="flex flex-col">
            {displayLabel && (
              <span className="label-text">{displayLabel}</span>
            )}
            {description && (
              <span className="label-text-alt text-gray-500">{description}</span>
            )}
          </div>
        )}
      </label>
    </div>
  );
}

// Radio Group component
export function HermesRadioGroup(props: RadioGroupProps): React.ReactElement {
  const {
    size = RADIO_GROUP_DEFAULTS.size,
    color = RADIO_GROUP_DEFAULTS.color,
    options = [],
    value: controlledValue,
    defaultValue,
    disabled = RADIO_GROUP_DEFAULTS.disabled,
    direction = RADIO_GROUP_DEFAULTS.direction,
    spacing = RADIO_GROUP_DEFAULTS.spacing,
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

  // DaisyUI size classes
  const sizeClass = {
    xs: 'radio-xs',
    sm: 'radio-sm',
    md: '',
    lg: 'radio-lg',
    xl: 'radio-lg',
  }[size] || '';

  // DaisyUI color classes
  const colorClass = {
    default: '',
    primary: 'radio-primary',
    secondary: 'radio-secondary',
    success: 'radio-success',
    warning: 'radio-warning',
    error: 'radio-error',
  }[color] || 'radio-primary';

  const renderOptions = () => {
    if (options.length === 0) return children;

    return options.map((option) => {
      const isChecked = currentValue === option.value;
      const isDisabled = disabled || option.disabled;

      return (
        <label
          key={String(option.value)}
          className="label cursor-pointer gap-2 justify-start"
        >
          <input
            type="radio"
            name={name}
            value={option.value}
            checked={isChecked}
            disabled={isDisabled}
            onChange={() => handleChange(option.value)}
            className={`radio ${sizeClass} ${colorClass}`}
          />
          <div className="flex flex-col">
            <span className="label-text">{option.label}</span>
            {option.description && (
              <span className="label-text-alt text-gray-500">{option.description}</span>
            )}
          </div>
        </label>
      );
    });
  };

  return (
    <div
      className={`rottay-radio-group-hermes ${className}`}
      style={groupStyle}
      role="radiogroup"
    >
      {renderOptions()}
    </div>
  );
}

HermesRadio.displayName = 'HermesRadio';
HermesRadio.Group = HermesRadioGroup;
