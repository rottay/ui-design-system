/**
 * Checkbox.Group - Compound Component
 * Manages a group of checkboxes with shared state
 */

'use client';

import React, { createContext, useContext, useState, useCallback, useMemo, useId } from 'react';
import type { CSSProperties } from 'react';
import type { CheckboxGroupProps, CheckboxOption, CheckboxSize, CheckboxVariant } from '../../types';
import { CHECKBOX_GROUP_DEFAULTS, SIZE_MAP, SIZE_MAP_NUMERIC, COLOR_MAP } from '../../types';

// Context for checkbox group
interface CheckboxGroupContextValue {
  value: (string | number)[];
  name?: string;
  disabled?: boolean;
  size?: CheckboxSize;
  color?: CheckboxVariant;
  onChange: (checkedValue: string | number, checked: boolean) => void;
}

const CheckboxGroupContext = createContext<CheckboxGroupContextValue | null>(null);

export const useCheckboxGroup = () => useContext(CheckboxGroupContext);

export interface CheckboxGroupComponentProps extends CheckboxGroupProps {}

export function CheckboxGroup({
  value: controlledValue,
  defaultValue = [],
  options,
  direction = 'vertical',
  spacing = 'md',
  size = CHECKBOX_GROUP_DEFAULTS.size,
  color = CHECKBOX_GROUP_DEFAULTS.color,
  disabled = false,
  name,
  onChange,
  children,
  className = '',
  style,
}: CheckboxGroupComponentProps): React.ReactElement {
  const generatedId = useId();
  const groupName = name || `checkbox-group-${generatedId}`;

  // Internal state for uncontrolled mode
  const [internalValue, setInternalValue] = useState<(string | number)[]>(defaultValue);
  const isControlled = controlledValue !== undefined;
  const currentValue = isControlled ? controlledValue : internalValue;

  const handleChange = useCallback((checkedValue: string | number, checked: boolean) => {
    let newValue: (string | number)[];

    if (checked) {
      newValue = [...currentValue, checkedValue];
    } else {
      newValue = currentValue.filter((v) => v !== checkedValue);
    }

    if (!isControlled) {
      setInternalValue(newValue);
    }

    onChange?.(newValue);
  }, [currentValue, isControlled, onChange]);

  const contextValue = useMemo<CheckboxGroupContextValue>(() => ({
    value: currentValue,
    name: groupName,
    disabled,
    size,
    color,
    onChange: handleChange,
  }), [currentValue, groupName, disabled, size, color, handleChange]);

  // Spacing values
  const spacingMap: Record<string, string> = {
    sm: '8px',
    md: '12px',
    lg: '16px',
  };

  const containerStyle: CSSProperties = {
    display: 'flex',
    flexDirection: direction === 'horizontal' ? 'row' : 'column',
    gap: spacingMap[spacing] || spacingMap.md,
    flexWrap: direction === 'horizontal' ? 'wrap' : 'nowrap',
    ...style,
  };

  const sizeValue = SIZE_MAP[size] || SIZE_MAP.md;
  const sizeNumeric = SIZE_MAP_NUMERIC[size] || SIZE_MAP_NUMERIC.md;
  const colors = COLOR_MAP[color] || COLOR_MAP.primary;

  // Render options if provided
  const renderOptions = () => {
    if (!options || options.length === 0) return null;

    return options.map((option: CheckboxOption) => {
      const isChecked = currentValue.includes(option.value);
      const isDisabled = disabled || option.disabled;

      return (
        <label
          key={String(option.value)}
          data-testid={`checkbox-option-${option.value}`}
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
              name={groupName}
              value={option.value}
              checked={isChecked}
              disabled={isDisabled}
              onChange={(e) => handleChange(option.value, e.target.checked)}
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
    <CheckboxGroupContext.Provider value={contextValue}>
      <div
        data-testid="checkbox-group"
        data-direction={direction}
        data-disabled={disabled || undefined}
        className={`rottay-checkbox-group rottay-checkbox-group--${direction} ${className}`}
        style={containerStyle}
        role="group"
        aria-label="Checkbox group"
      >
        {options ? renderOptions() : children}
      </div>
    </CheckboxGroupContext.Provider>
  );
}

CheckboxGroup.displayName = 'Checkbox.Group';
