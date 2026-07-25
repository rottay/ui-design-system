/**
 * @fileoverview CheckboxGroup - Rottay Design System
 * @description Compound component for managing multiple checkboxes with shared state.
 * Part of the Rottay Design System's input primitives collection.
 *
 * @remarks
 * CheckboxGroup provides a way to manage multiple checkbox selections with a
 * unified API. It supports both options-based and children-based rendering,
 * with controlled and uncontrolled state management.
 *
 * **Key Features:**
 * - Shared state management across checkboxes
 * - Options array or children-based rendering
 * - Controlled and uncontrolled modes
 * - Horizontal or vertical layout
 * - Configurable spacing between items
 * - Context-based prop inheritance (size, color, disabled)
 * - Form integration with name attribute
 *
 * **Context API:**
 * The group provides a React context that child Checkbox components can use
 * to inherit group settings and register their values. Use `useCheckboxGroup`
 * hook to access the context in custom implementations.
 *
 * @example Options-Based Group
 * ```tsx
 * import { Checkbox } from '@rottay/design-system';
 *
 * const options = [
 *   { value: 'email', label: 'Email notifications' },
 *   { value: 'sms', label: 'SMS notifications' },
 *   { value: 'push', label: 'Push notifications', disabled: true },
 * ];
 *
 * <Checkbox.Group
 *   options={options}
 *   value={notifications}
 *   onChange={setNotifications}
 *   direction="vertical"
 *   size="md"
 *   color="primary"
 * />
 * ```
 *
 * @example Children-Based Group
 * ```tsx
 * import { Checkbox } from '@rottay/design-system';
 *
 * <Checkbox.Group
 *   value={selected}
 *   onChange={setSelected}
 *   direction="horizontal"
 *   spacing="lg"
 * >
 *   <Checkbox value="1">First</Checkbox>
 *   <Checkbox value="2">Second</Checkbox>
 *   <Checkbox value="3">Third</Checkbox>
 * </Checkbox.Group>
 * ```
 *
 * @see {@link Checkbox} for individual checkboxes
 * @see {@link useCheckboxGroup} for context access
 * @module CheckboxGroup
 * @category Inputs
 * @package @rottay/design-system
 */

'use client';

import React, { createContext, useContext, useState, useCallback, useMemo, useId } from 'react';
import type { CSSProperties } from 'react';
import type { CheckboxGroupProps, CheckboxOption, CheckboxSize, CheckboxVariant } from '../../contracts';
import { CHECKBOX_GROUP_DEFAULTS, SIZE_MAP, SIZE_MAP_NUMERIC, COLOR_MAP } from '../../contracts';
import { useOptionalTranslation } from '@/infrastructure/runtime/i18n';

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
  const translation = useOptionalTranslation('components');

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

  const sizeValue = SIZE_MAP[size] || SIZE_MAP.md;
  const sizeNumeric = SIZE_MAP_NUMERIC[size] || SIZE_MAP_NUMERIC.md;
  const colors = COLOR_MAP[color] || COLOR_MAP.primary;

  const containerStyle: CSSProperties = {
    display: 'flex',
    flexDirection: direction === 'horizontal' ? 'row' : 'column',
    gap: spacingMap[spacing] || spacingMap.md,
    flexWrap: direction === 'horizontal' ? 'wrap' : 'nowrap',
    ...({
      '--ds-cbg-color-border': colors.border,
      '--ds-cbg-color-bg': colors.bg,
    } as CSSProperties),
    ...style,
  };

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
          data-part="option"
          data-checked={isChecked ? 'true' : 'false'}
          data-disabled={isDisabled ? 'true' : 'false'}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            cursor: isDisabled ? 'not-allowed' : 'pointer',
            opacity: isDisabled ? 0.5 : 1,
          }}
        >
          <span
            data-part="option-box"
            style={{
              position: 'relative',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: sizeValue,
              height: sizeValue,
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
        data-part="root"
        data-direction={direction}
        data-disabled={disabled || undefined}
        className={`rottay-checkbox-group rottay-checkbox-group--${direction} ${className}`}
        style={containerStyle}
        role="group"
        aria-label={translation?.t('checkbox.group') ?? 'Checkbox group'}
      >
        {options ? renderOptions() : children}
      </div>
    </CheckboxGroupContext.Provider>
  );
}

CheckboxGroup.displayName = 'Checkbox.Group';
