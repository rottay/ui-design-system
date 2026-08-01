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
 * **Composition law (Phase B):** standard (dot) mode composes the real
 * `Radio` facade per option — one anatomy, one a11y contract, one skin —
 * instead of re-implementing a private indicator. `buttonStyle` mode keeps
 * its own segment anatomy (no dot) but every visual decision lives in the
 * engine-agnostic presentation skin
 * (`presentation/components/skin/radio-group.css`) keyed on
 * `data-part='root'`, `data-direction`, `data-spacing`, `data-size`,
 * `rottay-radio-group--button` and `data-button-style`; this module carries
 * zero inline paint. Keyboard: every mode shares the group `name` across
 * inputs, so the browser supplies the APG radiogroup arrow-key roving
 * behavior natively under `role='radiogroup'`.
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

import React, { useState, useCallback, useMemo, useId } from 'react';
import type { CSSProperties } from 'react';
import type { RadioGroupProps, RadioOption } from '../../contracts';
import { RADIO_GROUP_DEFAULTS, COLOR_MAP } from '../../contracts';
import {
  RadioGroupContext,
  useRadioGroup,
  type RadioGroupContextValue,
} from '../../runtime/group-context';
import { useOptionalTranslation } from '@/infrastructure/runtime/i18n';
import { Radio } from '../..';

export { useRadioGroup };

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
  engine,
  onChange,
  children,
  className = '',
  style,
}: RadioGroupComponentProps): React.ReactElement {
  const generatedId = useId();
  const name = providedName || `radio-group-${generatedId}`;
  const translation = useOptionalTranslation('components');

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

  // Segmented mode paints its checked state from the per-group color variant,
  // carried once on the root via the established uncounted runtime channels
  // (`--ds-rg-color-*` is configuration, not inline paint). Standard mode
  // needs no channels: each option facade paints its own `data-color`.
  const rootStyle: CSSProperties | undefined = buttonStyle
    ? ({
        '--ds-rg-color-border': (COLOR_MAP[color] || COLOR_MAP.primary).border,
        '--ds-rg-color-bg': (COLOR_MAP[color] || COLOR_MAP.primary).bg,
        '--ds-rg-color-dot': (COLOR_MAP[color] || COLOR_MAP.primary).dot,
        ...style,
      } as CSSProperties)
    : style;

  // Render options if provided
  const renderOptions = () => {
    if (!options || options.length === 0) return null;

    // Segmented (buttonStyle) mode: no dot anatomy -- a segment is a label
    // wrapping the native input (clipped by the skin, focusable, sharing the
    // group name for native APG arrow-key roving) plus its text. All paint,
    // density and state grammar lives in radio-group.css.
    if (buttonStyle) {
      return options.map((option: RadioOption) => {
        const isChecked = currentValue === option.value;
        const isDisabled = disabled || option.disabled;

        return (
          <label
            key={String(option.value)}
            data-testid={`radio-option-${option.value}`}
            data-part="option"
            data-checked={isChecked ? 'true' : 'false'}
            data-disabled={isDisabled ? 'true' : 'false'}
          >
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={isChecked}
              disabled={isDisabled}
              onChange={() => handleChange(option.value)}
            />
            <span data-part="option-label">{option.label}</span>
          </label>
        );
      });
    }

    // Standard mode composes the real Radio facade: the option slot keeps
    // the pinned public hooks (data-testid/data-part/data-*) while the
    // control itself renders one anatomy, one skin and one a11y contract.
    return options.map((option: RadioOption) => {
      const isChecked = currentValue === option.value;
      const isDisabled = disabled || option.disabled;

      return (
        <div
          key={String(option.value)}
          data-testid={`radio-option-${option.value}`}
          data-part="option"
          data-checked={isChecked ? 'true' : 'false'}
          data-disabled={isDisabled ? 'true' : 'false'}
        >
          <Radio
            engine={engine}
            value={option.value}
            name={name}
            label={option.label}
            description={option.description}
            checked={isChecked}
            disabled={isDisabled}
            size={size}
            color={color}
            onChange={() => handleChange(option.value)}
          />
        </div>
      );
    });
  };

  return (
    <RadioGroupContext.Provider value={contextValue}>
      <div
        data-testid="radio-group"
        data-part="root"
        data-direction={direction}
        data-spacing={spacing}
        data-size={size}
        data-disabled={disabled || undefined}
        data-button-style={buttonStyle}
        className={`rottay-radio-group rottay-radio-group--${direction} ${buttonStyle ? 'rottay-radio-group--button' : ''} ${className}`}
        style={rootStyle}
        role="radiogroup"
        aria-label={translation?.t('radio.group') ?? 'Radio group'}
      >
        {options ? renderOptions() : children}
      </div>
    </RadioGroupContext.Provider>
  );
}

RadioGroup.displayName = 'Radio.Group';
