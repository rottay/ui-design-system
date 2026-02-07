/**
 * @fileoverview Checkbox Modern Engine - Rottay Design System
 * @description DaisyUI/Tailwind CSS implementation of the Checkbox component.
 * Part of the Rottay Design System's input primitives collection.
 *
 * @remarks
 * The Modern engine implements checkboxes using DaisyUI's utility-first approach
 * with Tailwind CSS classes. It provides a lightweight alternative to Classic
 * with smaller bundle size.
 *
 * **DaisyUI Features Utilized:**
 * - Checkbox component classes
 * - Size modifiers (checkbox-xs, checkbox-sm, checkbox-lg)
 * - Color modifiers (checkbox-primary, checkbox-secondary, etc.)
 * - Form control wrapper for label alignment
 * - Label text styling
 *
 * **Prop Mapping:**
 * - `size="xs"` → `checkbox-xs`
 * - `size="sm"` → `checkbox-sm`
 * - `size="lg"` → `checkbox-lg`
 * - `color="primary"` → `checkbox-primary`
 * - `color="success"` → `checkbox-success`
 * - `color="warning"` → `checkbox-warning`
 * - `color="error"` → `checkbox-error`
 *
 * **Group Support:**
 * Includes ModernCheckboxGroup with DaisyUI styling for groups.
 *
 * @example Using Modern Engine
 * ```tsx
 * import { Checkbox } from '@rottay/design-system';
 *
 * // Explicit Modern engine
 * <Checkbox
 *   engine="modern"
 *   label="DaisyUI Checkbox"
 *   color="success"
 *   size="lg"
 * />
 * ```
 *
 * @see {@link Checkbox} for the main component
 * @see {@link ClassicCheckbox} for Ant Design implementation
 * @see {@link RusticCheckbox} for vanilla implementation
 * @module ModernCheckbox
 * @category Inputs
 * @package @rottay/design-system
 */

'use client';

import React, { useState, useRef, useEffect, useId } from 'react';
import type { CheckboxProps, CheckboxGroupProps } from '../../types';
import { CHECKBOX_DEFAULTS, CHECKBOX_GROUP_DEFAULTS } from '../../types';

export default function ModernCheckbox(props: CheckboxProps): React.ReactElement {
  const {
    size = CHECKBOX_DEFAULTS.size,
    color = CHECKBOX_DEFAULTS.color,
    label,
    checked: controlledChecked,
    defaultChecked = CHECKBOX_DEFAULTS.defaultChecked,
    indeterminate = CHECKBOX_DEFAULTS.indeterminate,
    disabled = CHECKBOX_DEFAULTS.disabled,
    onChange,
    children,
    name,
    value,
    className = '',
    style,
  } = props;

  const generatedId = useId();
  const inputId = `checkbox-modern-${generatedId}`;
  const inputRef = useRef<HTMLInputElement>(null);

  // Internal state for uncontrolled mode
  const [internalChecked, setInternalChecked] = useState(defaultChecked);
  const isControlled = controlledChecked !== undefined;
  const isChecked = isControlled ? controlledChecked : internalChecked;

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

  // DaisyUI size classes
  const sizeClass = {
    xs: 'checkbox-xs',
    sm: 'checkbox-sm',
    md: '',
    lg: 'checkbox-lg',
    xl: 'checkbox-lg',
  }[size] || '';

  // DaisyUI color classes
  const colorClass = {
    default: '',
    primary: 'checkbox-primary',
    secondary: 'checkbox-secondary',
    success: 'checkbox-success',
    warning: 'checkbox-warning',
    error: 'checkbox-error',
  }[color] || 'checkbox-primary';

  const displayLabel = label || children;

  return (
    <div className={`form-control ${className}`} style={style}>
      <label className="label cursor-pointer gap-2 justify-start">
        <input
          ref={inputRef}
          id={inputId}
          type="checkbox"
          name={name}
          value={value}
          checked={isChecked}
          disabled={disabled}
          onChange={handleChange}
          className={`checkbox ${sizeClass} ${colorClass}`}
          aria-checked={indeterminate ? 'mixed' : isChecked}
        />
        {displayLabel && (
          <span className="label-text">{displayLabel}</span>
        )}
      </label>
    </div>
  );
}

// Checkbox Group component
export function ModernCheckboxGroup(props: CheckboxGroupProps): React.ReactElement {
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

  // DaisyUI size classes
  const sizeClass = {
    xs: 'checkbox-xs',
    sm: 'checkbox-sm',
    md: '',
    lg: 'checkbox-lg',
    xl: 'checkbox-lg',
  }[size] || '';

  // DaisyUI color classes
  const colorClass = {
    default: '',
    primary: 'checkbox-primary',
    secondary: 'checkbox-secondary',
    success: 'checkbox-success',
    warning: 'checkbox-warning',
    error: 'checkbox-error',
  }[color] || 'checkbox-primary';

  const renderOptions = () => {
    if (options.length === 0) return children;

    return options.map((option) => {
      const isChecked = currentValue.includes(option.value);
      const isDisabled = disabled || option.disabled;

      return (
        <label
          key={String(option.value)}
          className="label cursor-pointer gap-2 justify-start"
        >
          <input
            type="checkbox"
            name={name || `checkbox-group-${generatedId}`}
            value={option.value}
            checked={isChecked}
            disabled={isDisabled}
            onChange={(e) => handleItemChange(option.value, e.target.checked)}
            className={`checkbox ${sizeClass} ${colorClass}`}
          />
          <span className="label-text">{option.label}</span>
        </label>
      );
    });
  };

  return (
    <div
      className={`rottay-checkbox-group-modern ${className}`}
      style={groupStyle}
      role="group"
    >
      {renderOptions()}
    </div>
  );
}

ModernCheckbox.displayName = 'ModernCheckbox';
ModernCheckbox.Group = ModernCheckboxGroup;
