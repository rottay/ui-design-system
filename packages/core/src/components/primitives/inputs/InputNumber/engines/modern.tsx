'use client';

/**
 * @fileoverview InputNumber Modern Engine - Rottay Design System
 * @description DaisyUI/Tailwind CSS implementation of the InputNumber component.
 * Part of the Rottay Design System's input primitives collection.
 *
 * @remarks
 * The Modern engine implements numeric input using DaisyUI's input classes
 * with custom step control buttons. It provides a lightweight alternative
 * with utility-first styling.
 *
 * **Styling:**
 * - DS token inline styles for border, radius, size, and status
 * - Custom step control buttons with inline styles
 *
 * **Custom Implementation:**
 * - Step up/down buttons with ▲/▼ arrows
 * - Keyboard navigation (Arrow Up/Down)
 * - Precision formatting
 * - Min/max bounds checking
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
import type { InputNumberProps } from '../InputNumber.types';

/** Maps DS size tokens to inline style dimensions. */
const sizeStyles: Record<string, React.CSSProperties> = {
  small: { height: 32, fontSize: 13, padding: '4px 10px' },
  default: { height: 36, fontSize: 14, padding: '6px 12px' },
  large: { height: 40, fontSize: 16, padding: '8px 14px' },
};

/**
 * Modern engine InputNumber built with DaisyUI / Tailwind CSS.
 * Implements controlled/uncontrolled modes, step buttons, keyboard navigation,
 * and precision formatting without relying on a third-party input-number library.
 *
 * @param props - Unified InputNumberProps from the design system contract.
 * @param ref - Forwarded ref attached to the underlying native `<input>` element.
 * @returns A DaisyUI-styled numeric input with optional step controls and addons.
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
    } = props;

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

    // Resolve size and status to inline style values
    const sizeKey = size === 'large' ? 'large' : size === 'small' ? 'small' : 'default';
    const sizeStyle = sizeStyles[sizeKey];
    const statusStyle: React.CSSProperties = status === 'error'
      ? { borderColor: 'var(--ds-color-error)' }
      : status === 'warning'
        ? { borderColor: 'var(--ds-color-warning)' }
        : {};

    return (
      <div className="flex items-center gap-1" style={style}>
        {addonBefore && <span className="px-2 py-1 rounded-l" style={{ background: 'var(--ds-surface-inset)' }}>{addonBefore}</span>}
        <div className="relative flex items-center">
          {prefix && <span className="absolute left-2" style={{ color: 'var(--ds-color-text-secondary)' }}>{prefix}</span>}
          <input
            ref={ref}
            type="number"
            className={`${prefix ? 'pl-8' : ''} ${suffix || controls ? 'pr-16' : ''} ${className}`}
            style={{
              borderWidth: '1px',
              borderStyle: 'solid',
              borderColor: 'var(--ds-color-border)',
              borderRadius: 'var(--ds-radius-md)',
              background: 'var(--ds-color-bg-input, var(--ds-surface-control))',
              color: 'var(--ds-color-text-primary)',
              outline: 'none',
              boxSizing: 'border-box',
              width: '100%',
              ...sizeStyle,
              ...statusStyle,
            }}
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
          />
          <div className="absolute right-2 flex items-center gap-1">
            {suffix && <span style={{ color: 'var(--ds-color-text-secondary)' }}>{suffix}</span>}
            {controls && !disabled && !readOnly && (
              <div className="flex flex-col">
                <button
                  type="button"
                  style={{ background: 'transparent', color: 'var(--ds-color-text-primary)', height: 16, padding: '0 4px', fontSize: 12, borderRadius: 'var(--ds-radius-sm, 4px)', border: 'none', cursor: 'pointer', lineHeight: 1, minHeight: 0 }}
                  onClick={() => handleStep('up')}
                  tabIndex={-1}
                >
                  ▲
                </button>
                <button
                  type="button"
                  style={{ background: 'transparent', color: 'var(--ds-color-text-primary)', height: 16, padding: '0 4px', fontSize: 12, borderRadius: 'var(--ds-radius-sm, 4px)', border: 'none', cursor: 'pointer', lineHeight: 1, minHeight: 0 }}
                  onClick={() => handleStep('down')}
                  tabIndex={-1}
                >
                  ▼
                </button>
              </div>
            )}
          </div>
        </div>
        {addonAfter && <span className="px-2 py-1 rounded-r" style={{ background: 'var(--ds-surface-inset)' }}>{addonAfter}</span>}
      </div>
    );
  }
);

InputNumber.displayName = 'InputNumber.Modern';

export default InputNumber;
