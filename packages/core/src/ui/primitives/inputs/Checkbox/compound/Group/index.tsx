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
 * **Composition law (Phase B):** options mode composes the real `Checkbox`
 * facade per option (one anatomy, one a11y contract, one skin) instead of
 * re-implementing a private indicator. Every visual decision — direction,
 * spacing rhythm, option slots — lives in the engine-agnostic presentation
 * skin (`presentation/components/skin/checkbox-group.css`) keyed on
 * `data-part='root'`, `data-direction` and `data-spacing`; this module carries
 * zero inline paint. Children mode provides the group context that the Modern
 * engine consumes through `useCheckboxGroup()`.
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

import React, { useState, useCallback, useMemo, useId } from 'react';
import type { CheckboxGroupProps, CheckboxOption } from '../../contracts';
import { CHECKBOX_GROUP_DEFAULTS } from '../../contracts';
import {
  CheckboxGroupContext,
  useCheckboxGroup,
  type CheckboxGroupContextValue,
} from '../../runtime/group-context';
import { useOptionalTranslation } from '@/infrastructure/runtime/i18n';
import { Checkbox } from '../..';

export { useCheckboxGroup };

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
  engine,
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

  // Options mode composes the real Checkbox facade: the option slot keeps the
  // pinned public hooks (data-testid/data-part/data-*) while the control
  // itself renders one anatomy, one skin and one a11y contract per engine.
  const renderOptions = () => {
    if (!options || options.length === 0) return null;

    return options.map((option: CheckboxOption) => {
      const isChecked = currentValue.includes(option.value);
      const isDisabled = disabled || option.disabled;

      return (
        <div
          key={String(option.value)}
          data-testid={`checkbox-option-${option.value}`}
          data-part="option"
          data-checked={isChecked ? 'true' : 'false'}
          data-disabled={isDisabled ? 'true' : 'false'}
        >
          <Checkbox
            engine={engine}
            value={option.value}
            name={groupName}
            label={option.label}
            checked={isChecked}
            disabled={isDisabled}
            size={size}
            color={color}
            onChange={(checked) => handleChange(option.value, checked)}
          />
        </div>
      );
    });
  };

  return (
    <CheckboxGroupContext.Provider value={contextValue}>
      <div
        data-testid="checkbox-group"
        data-part="root"
        data-direction={direction}
        data-spacing={spacing}
        data-disabled={disabled || undefined}
        className={`rottay-checkbox-group rottay-checkbox-group--${direction} ${className}`}
        style={style}
        role="group"
        aria-label={translation?.t('checkbox.group') ?? 'Checkbox group'}
      >
        {options ? renderOptions() : children}
      </div>
    </CheckboxGroupContext.Provider>
  );
}

CheckboxGroup.displayName = 'Checkbox.Group';
