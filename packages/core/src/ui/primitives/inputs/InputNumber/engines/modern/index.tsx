'use client';

/**
 * @fileoverview InputNumber Modern Engine - Rottay Design System
 * @description Token-driven, skin-painted implementation of the InputNumber
 * component. Part of the Rottay Design System's input primitives collection.
 *
 * @remarks
 * The Modern engine implements numeric input with custom step control buttons.
 * All paint lives in the `input-number.css` modern skin, keyed on the public
 * anatomy (`data-part`, `data-size`, `data-status`, `data-disabled`,
 * `data-has-prefix`, `data-has-trailing`); this file owns semantics and
 * behavior only. No DaisyUI classes are consumed.
 *
 * **Custom Implementation:**
 * - Step up/down buttons with localized accessible names (English fallback)
 * - Keyboard navigation (Arrow Up/Down)
 * - Precision formatting
 * - Min/max bounds checking
 * - RTL-correct affix/stepper placement via logical properties
 *
 * @example Using Modern Engine
 * ```tsx
 * <InputNumber
 *   engine="modern"
 *   min={0}
 *   max={100}
 *   step={5}
 *   size="default"
 *   className="w-32"
 * />
 * ```
 *
 * @see {@link InputNumber} for the main component
 * @see {@link ClassicInputNumber} for Ant Design implementation
 * @see {@link RusticInputNumber} for vanilla implementation
 * @module ModernInputNumber
 * @category Inputs
 * @package @rottay/design-system
 */

import React, { useState, useCallback } from 'react';
import type { InputNumberProps } from '../../contracts';
import { toCanonicalSize } from '../../../../../../foundation/contracts/kernel/common';
import { useOptionalTranslation } from '@/infrastructure/runtime/i18n';
import {
  ChevronUpIcon,
  ChevronDownIcon,
} from '../../../../../../graphics/icons';

/**
 * Modern engine InputNumber painted by the `input-number.css` modern skin.
 * Implements controlled/uncontrolled modes, step buttons, keyboard navigation,
 * and precision formatting without relying on a third-party input-number library.
 *
 * @param props - Unified InputNumberProps from the design system contract.
 * @param ref - Forwarded ref attached to the underlying native `<input>` element.
 * @returns A token-skinned numeric input with optional step controls and addons.
 */
export const InputNumber = React.forwardRef<HTMLInputElement, InputNumberProps>(
  (props, ref) => {
    const {
      value,
      defaultValue,
      min,
      max,
      step = 1,
      precision,
      disabled = false,
      readOnly = false,
      size = 'default',
      status,
      prefix,
      suffix,
      addonBefore,
      addonAfter,
      placeholder,
      controls = true,
      onChange,
      onPressEnter,
      onStep,
      className = '',
      style,
      autoFocus,
      id,
      name,
      'aria-label': ariaLabel,
    } = props;

    const i18n = useOptionalTranslation('components');
    /**
     * Localized label with an English floor: when the catalogue entry has not
     * landed yet the provider echoes the full key, which must never reach an
     * aria-label.
     */
    const tOr = (key: string, fallback: string): string => {
      const resolved = i18n?.t(key);
      if (!resolved || resolved === key || resolved === `components.${key}`) return fallback;
      return resolved;
    };

    // Controlled vs uncontrolled: if `value` is provided, the parent owns state
    const isControlled = value !== undefined;
    const [internalValue, setInternalValue] = useState<number | string | null>(defaultValue ?? null);
    const currentValue = isControlled ? value : internalValue;

    /** Parse raw input string into a number, returning null for empty/invalid values. */
    const parseNumber = (val: string): number | null => {
      if (val === '' || val === '-') return null;
      const parsed = parseFloat(val);
      return isNaN(parsed) ? null : parsed;
    };

    /** Format a numeric value to string, applying precision if configured. */
    const formatValue = (val: number | string | null | undefined): string => {
      if (val === null || val === undefined) return '';
      const num = typeof val === 'string' ? parseFloat(val) : val;
      if (isNaN(num)) return '';
      if (precision !== undefined) {
        return num.toFixed(precision);
      }
      return String(num);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = parseNumber(e.target.value);
      if (!isControlled) {
        setInternalValue(newValue);
      }
      onChange?.(newValue);
    };

    /**
     * Increment or decrement the current value by the configured step amount.
     * Clamps result to min/max bounds and re-applies precision to avoid
     * floating-point drift (e.g., 0.1 + 0.2 !== 0.3).
     */
    const handleStep = useCallback((direction: 'up' | 'down') => {
      const current = typeof currentValue === 'string' ? parseFloat(currentValue) : (currentValue ?? 0);
      const stepNum = typeof step === 'string' ? parseFloat(step) : step;
      const offset = direction === 'up' ? stepNum : -stepNum;
      let newValue = current + offset;

      // Clamp to configured bounds
      if (min !== undefined && newValue < min) newValue = min;
      if (max !== undefined && newValue > max) newValue = max;
      // Re-apply precision to counteract floating-point arithmetic drift
      if (precision !== undefined) {
        newValue = parseFloat(newValue.toFixed(precision));
      }

      if (!isControlled) {
        setInternalValue(newValue);
      }
      onChange?.(newValue);
      onStep?.(newValue, { offset: stepNum, type: direction });
    }, [currentValue, step, min, max, precision, isControlled, onChange, onStep]);

    /** Arrow keys trigger step; Enter fires onPressEnter. preventDefault avoids native scroll. */
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        onPressEnter?.(e);
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        handleStep('up');
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        handleStep('down');
      }
    };

    // Size enters the skin through `data-size`; the skin owns every dimension
    // (density-scaled `--ds-input-number-{size}-*` channels). Affix presence
    // stamps `data-has-prefix` / `data-has-trailing` so the skin can reserve
    // logical padding that flips correctly under RTL (the old inline padding
    // shorthand silently beat the pl-8/pr-16 utilities and overlapped affixes).
    const sizeKey = toCanonicalSize(size) ?? 'md';
    const hasTrailing = Boolean(suffix) || (controls && !disabled && !readOnly);

    // Stepper bounds: the buttons report exhaustion at min/max (the keyboard
    // path keeps clamping silently, per spinbutton convention).
    const numericValue =
      typeof currentValue === 'number' && !Number.isNaN(currentValue)
        ? currentValue
        : null;
    const atMin = min !== undefined && numericValue !== null && numericValue <= min;
    const atMax = max !== undefined && numericValue !== null && numericValue >= max;

    return (
      <div data-part="group" style={style}>
        {addonBefore && <span data-part="addon-before">{addonBefore}</span>}
        <div data-part="field">
          {prefix && <span data-part="prefix">{prefix}</span>}
          <input
            ref={ref}
            type="number"
            className={`ds-input-number ds-input-number--modern ${className}`}
            data-part="root"
            data-size={sizeKey}
            data-status={status ?? 'default'}
            data-disabled={disabled ? 'true' : 'false'}
            data-readonly={readOnly ? 'true' : undefined}
            data-has-prefix={prefix ? 'true' : undefined}
            data-has-trailing={hasTrailing ? 'true' : undefined}
            value={formatValue(currentValue)}
            min={min}
            max={max}
            step={step}
            disabled={disabled}
            readOnly={readOnly}
            placeholder={placeholder}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            autoFocus={autoFocus}
            id={id}
            name={name}
            aria-label={ariaLabel}
            aria-valuemin={min}
            aria-valuemax={max}
            aria-valuenow={typeof currentValue === 'number' && !Number.isNaN(currentValue) ? currentValue : undefined}
          />
          <div data-part="trailing">
            {suffix && <span data-part="suffix">{suffix}</span>}
            {controls && !disabled && !readOnly && (
              <div data-part="steppers">
                <button
                  type="button"
                  data-part="stepper-button"
                  data-direction="up"
                  onClick={() => handleStep('up')}
                  disabled={atMax || undefined}
                  tabIndex={-1}
                  aria-label={tOr('input_number.increase', 'Increase')}
                >
                  <ChevronUpIcon size={12} aria-hidden />
                  {/* Test-pinned legacy glyph: real-engines.test.tsx queries
                      getByText('▲') until it is migrated to role queries
                      (debt: swap to getByRole('button', { name })). Hidden by
                      the skin; the visible affordance is the chevron icon. */}
                  <span data-part="stepper-legacy-glyph" aria-hidden="true">▲</span>
                </button>
                <button
                  type="button"
                  data-part="stepper-button"
                  data-direction="down"
                  onClick={() => handleStep('down')}
                  disabled={atMin || undefined}
                  tabIndex={-1}
                  aria-label={tOr('input_number.decrease', 'Decrease')}
                >
                  <ChevronDownIcon size={12} aria-hidden />
                  <span data-part="stepper-legacy-glyph" aria-hidden="true">▼</span>
                </button>
              </div>
            )}
          </div>
        </div>
        {addonAfter && <span data-part="addon-after">{addonAfter}</span>}
      </div>
    );
  }
);

InputNumber.displayName = 'InputNumber.Modern';

export default InputNumber;
