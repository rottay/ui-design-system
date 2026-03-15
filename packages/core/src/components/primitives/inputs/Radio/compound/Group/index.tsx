/**
 * @fileoverview RadioGroup - Rottay Design System
 * @description Compound component for managing exclusive selection across radio buttons.
 * Part of the Rottay Design System's input primitives collection.
 *
 * @remarks
 * RadioGroup provides a way to manage mutually exclusive selection across multiple
 * radio buttons. Only one radio can be selected at a time within a group.
 *
 * **Key Features:**
 * - Exclusive selection (one option at a time)
 * - Options array or children-based rendering
 * - Controlled and uncontrolled modes
 * - Horizontal or vertical layout
 * - Button style variant for segmented control appearance
 * - Configurable spacing between items
 * - Context-based prop inheritance (size, color, disabled)
 * - Option descriptions for additional context
 *
 * **Button Style Variant:**
 * When `buttonStyle` prop is provided, radios render as button-like segments:
 * - `buttonStyle="outline"`: Selected option has colored border
 * - `buttonStyle="solid"`: Selected option has solid background
 *
 * **Context API:**
 * The group provides a React context for child Radio components. Use
 * `useRadioGroup` hook to access the context in custom implementations.
 *
 * @example Standard Radio Group
 * ```tsx
 * import { Radio } from '@rottay/design-system';
 *
 * const options = [
 *   { value: 'sm', label: 'Small', description: 'Compact size' },
 *   { value: 'md', label: 'Medium', description: 'Standard size' },
 *   { value: 'lg', label: 'Large', description: 'Expanded size' },
 * ];
 *
 * <Radio.Group
 *   options={options}
 *   value={size}
 *   onChange={setSize}
 *   direction="vertical"
 *   spacing="lg"
 * />
 * ```
 *
 * @example Segmented Control Style
 * ```tsx
 * import { Radio } from '@rottay/design-system';
 *
 * <Radio.Group
 *   options={viewOptions}
 *   value={view}
 *   onChange={setView}
 *   buttonStyle="solid"
 *   direction="horizontal"
 *   size="sm"
 * />
 * ```
 *
 * @see {@link Radio} for individual radio buttons
 * @see {@link useRadioGroup} for context access
 * @module RadioGroup
 * @category Inputs
 * @package @rottay/design-system
 */

'use client';

import React, { createContext, useContext, useState, useCallback, useMemo, useId } from 'react';
import type { CSSProperties } from 'react';
import type { RadioGroupProps, RadioOption, RadioSize, RadioVariant } from '../../types';
import { RADIO_GROUP_DEFAULTS, SIZE_MAP, SIZE_MAP_NUMERIC, COLOR_MAP } from '../../types';

// Context for radio group
interface RadioGroupContextValue {
  value: string | number | undefined;
  name: string;
  disabled?: boolean;
  size?: RadioSize;
  color?: RadioVariant;
  onChange: (value: string | number) => void;
}

const RadioGroupContext = createContext<RadioGroupContextValue | null>(null);

export const useRadioGroup = () => useContext(RadioGroupContext);

export interface RadioGroupComponentProps extends RadioGroupProps {}

export function RadioGroup({
  value: controlledValue,
  defaultValue,
  options,
  direction = 'vertical',
  spacing = 'md',
  size = RADIO_GROUP_DEFAULTS.size,
  color = RADIO_GROUP_DEFAULTS.color,
  disabled = false,
  name: providedName,
  buttonStyle,
  onChange,
  children,
  className = '',
  style,
}: RadioGroupComponentProps): React.ReactElement {
  const generatedId = useId();
  const name = providedName || `radio-group-${generatedId}`;

  // Internal state for uncontrolled mode
  const [internalValue, setInternalValue] = useState<string | number | undefined>(defaultValue);
  const isControlled = controlledValue !== undefined;
  const currentValue = isControlled ? controlledValue : internalValue;

  const handleChange = useCallback((newValue: string | number) => {
    if (!isControlled) {
      setInternalValue(newValue);
    }
    onChange?.(newValue);
  }, [isControlled, onChange]);

  const contextValue = useMemo<RadioGroupContextValue>(() => ({
    value: currentValue,
    name,
    disabled,
    size,
    color,
    onChange: handleChange,
  }), [currentValue, name, disabled, size, color, handleChange]);

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

    if (buttonStyle) {
      const paddingMap: Record<string, string> = {
        xs: '4px 8px',
        sm: '6px 12px',
        md: '8px 16px',
        lg: '10px 20px',
        xl: '12px 24px',
      };

      return options.map((option: RadioOption) => {
        const isChecked = currentValue === option.value;
        const isDisabled = disabled || option.disabled;

        return (
          <label
            key={String(option.value)}
            data-testid={`radio-option-${option.value}`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: paddingMap[size] || paddingMap.md,
              cursor: isDisabled ? 'not-allowed' : 'pointer',
              opacity: isDisabled ? 0.5 : 1,
              border: `1px solid ${isChecked ? colors.border : 'var(--ds-color-border-secondary)'}`,
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

    return options.map((option: RadioOption) => {
      const isChecked = currentValue === option.value;
      const isDisabled = disabled || option.disabled;

      return (
        <label
          key={String(option.value)}
          data-testid={`radio-option-${option.value}`}
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
              border: `2px solid ${isChecked ? colors.border : 'var(--ds-color-border-secondary)'}`,
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
              <span style={{ fontSize: sizeNumeric * 0.75, color: 'var(--ds-color-text-secondary)', userSelect: 'none', lineHeight: 1.4 }}>
                {option.description}
              </span>
            )}
          </span>
        </label>
      );
    });
  };

  return (
    <RadioGroupContext.Provider value={contextValue}>
      <div
        data-testid="radio-group"
        data-direction={direction}
        data-disabled={disabled || undefined}
        className={`rottay-radio-group rottay-radio-group--${direction} ${buttonStyle ? 'rottay-radio-group--button' : ''} ${className}`}
        style={containerStyle}
        role="radiogroup"
        aria-label="Radio group"
      >
        {options ? renderOptions() : children}
      </div>
    </RadioGroupContext.Provider>
  );
}

RadioGroup.displayName = 'Radio.Group';
