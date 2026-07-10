'use client';

/**
 * @fileoverview InputNumber Rustic Engine - Rottay Design System.
 * Pure HTML/CSS implementation using CSS custom properties (--ds-inputnumber-*)
 * so theming is driven entirely by tenant-level token overrides, with zero
 * dependency on Ant Design or Tailwind at runtime.
 *
 * @example
 * ```tsx
 * <InputNumber engine="rustic" min={0} max={100} step={5} precision={2} />
 * ```
 *
 * @module RusticInputNumber
 * @category Inputs
 * @package @rottay/design-system
 */

import React, { useState, useCallback } from 'react';

import { useInteractionState } from '../../../../../behavior';
import type { InputNumberProps } from '../InputNumber.types';

/**
 * Size configuration referencing CSS variables for each size tier.
 * Tenants override the underlying --ds-inputnumber-* tokens to control sizing.
 */
const SIZE_CONFIG: Record<string, { padding: string; fontSize: string; width: string }> = {
  small: {
    padding: 'var(--ds-inputnumber-sm-padding)',
    fontSize: 'var(--ds-inputnumber-sm-font-size)',
    width: 'var(--ds-inputnumber-sm-width)',
  },
  default: {
    padding: 'var(--ds-inputnumber-md-padding)',
    fontSize: 'var(--ds-inputnumber-md-font-size)',
    width: 'var(--ds-inputnumber-md-width)',
  },
  large: {
    padding: 'var(--ds-inputnumber-lg-padding)',
    fontSize: 'var(--ds-inputnumber-lg-font-size)',
    width: 'var(--ds-inputnumber-lg-width)',
  },
};

/**
 * Rustic engine InputNumber built with pure HTML/CSS and design-system CSS variables.
 * Implements controlled/uncontrolled state, step buttons, keyboard navigation,
 * precision formatting, and addon slots -- all framework-agnostic.
 *
 * @param props - Unified InputNumberProps from the design system contract.
 * @param ref - Forwarded ref attached to the underlying native `<input>` element.
 * @returns A theme-aware numeric input rendered without any UI framework dependency.
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

    // Controlled vs uncontrolled: parent-supplied `value` takes precedence
    const isControlled = value !== undefined;
    const [internalValue, setInternalValue] = useState<number | string | null>(defaultValue ?? null);
    // The triad is decided once, in the behavior core. `focused` is any focus --
    // a field's focus border must appear when a pointer lands in it. A ring is
    // `focusVisible`, and this part does not draw one.
    const { state: interaction, handlers: interactionHandlers } = useInteractionState();
    const isFocused = interaction.focused;
    const currentValue = isControlled ? value : internalValue;

    /** Parse raw string input, returning null for empty/NaN to represent "no value". */
    const parseNumber = (val: string): number | null => {
      if (val === '' || val === '-') return null;
      const parsed = parseFloat(val);
      return isNaN(parsed) ? null : parsed;
    };

    /** Convert numeric value to display string, honoring precision if set. */
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
     * Step the value up or down, clamping within min/max and reapplying
     * precision to prevent floating-point arithmetic drift.
     */
    const handleStep = useCallback((direction: 'up' | 'down') => {
      const current = typeof currentValue === 'string' ? parseFloat(currentValue) : (currentValue ?? 0);
      const stepNum = typeof step === 'string' ? parseFloat(step) : step;
      const offset = direction === 'up' ? stepNum : -stepNum;
      let newValue = current + offset;

      if (min !== undefined && newValue < min) newValue = min;
      if (max !== undefined && newValue > max) newValue = max;
      if (precision !== undefined) {
        newValue = parseFloat(newValue.toFixed(precision));
      }

      if (!isControlled) {
        setInternalValue(newValue);
      }
      onChange?.(newValue);
      onStep?.(newValue, { offset: stepNum, type: direction });
    }, [currentValue, step, min, max, precision, isControlled, onChange, onStep]);

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

    const sizeConfig = SIZE_CONFIG[size] || SIZE_CONFIG.default;

    // Build BEM class names; falsy entries are filtered out before joining
    const containerClasses = [
      'rottay-inputnumber',
      'rottay-inputnumber--rustic',
      `rottay-inputnumber--${size}`,
      status && `rottay-inputnumber--${status}`,
      disabled && 'rottay-inputnumber--disabled',
      isFocused && 'rottay-inputnumber--focused',
      className,
    ].filter(Boolean).join(' ');

    /** Resolve border color from CSS variables based on status/focus priority. */
    const getBorderColor = () => {
      if (status === 'error') return 'var(--ds-inputnumber-error-border)';
      if (status === 'warning') return 'var(--ds-inputnumber-warning-border)';
      if (isFocused) return 'var(--ds-inputnumber-border-focus)';
      return 'var(--ds-inputnumber-border)';
    };

    const wrapperStyle: React.CSSProperties = {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px',
      fontFamily: 'var(--ds-font-family-base)',
      ...style,
    };

    const inputWrapperStyle: React.CSSProperties = {
      position: 'relative',
      display: 'inline-flex',
      alignItems: 'center',
    };

    // Adjust border-radius depending on addon presence so edges merge seamlessly
    const inputStyle: React.CSSProperties = {
      padding: sizeConfig.padding,
      paddingLeft: prefix ? '28px' : undefined,
      paddingRight: suffix || controls ? (controls ? '36px' : '28px') : undefined,
      fontSize: sizeConfig.fontSize,
      border: `1px solid ${getBorderColor()}`,
      borderRadius: addonBefore && addonAfter ? '0' : addonBefore ? '0 var(--ds-inputnumber-radius) var(--ds-inputnumber-radius) 0' : addonAfter ? 'var(--ds-inputnumber-radius) 0 0 var(--ds-inputnumber-radius)' : 'var(--ds-inputnumber-radius)',
      outline: 'none',
      transition: 'var(--ds-inputnumber-transition)',
      width: sizeConfig.width,
      backgroundColor: disabled ? 'var(--ds-inputnumber-bg-disabled)' : 'var(--ds-inputnumber-bg)',
      color: 'var(--ds-inputnumber-color)',
      cursor: disabled ? 'not-allowed' : 'text',
      opacity: disabled ? 0.6 : 1,
      boxShadow: isFocused ? 'var(--ds-inputnumber-shadow-focus)' : 'none',
    };

    const prefixStyle: React.CSSProperties = {
      position: 'absolute',
      left: '8px',
      color: 'var(--ds-inputnumber-affix-color)',
      pointerEvents: 'none',
    };

    const suffixStyle: React.CSSProperties = {
      position: 'absolute',
      right: controls ? '32px' : '8px',
      color: 'var(--ds-inputnumber-affix-color)',
      pointerEvents: 'none',
    };

    const controlsStyle: React.CSSProperties = {
      display: 'flex',
      flexDirection: 'column',
      position: 'absolute',
      right: '4px',
      gap: '1px',
    };

    const controlButtonStyle: React.CSSProperties = {
      width: '20px',
      height: '12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      border: 'none',
      background: 'var(--ds-inputnumber-control-bg)',
      cursor: 'pointer',
      fontSize: '8px',
      color: 'var(--ds-inputnumber-control-color)',
      padding: 0,
      transition: 'color 0.2s',
    };

    const addonStyle: React.CSSProperties = {
      padding: sizeConfig.padding,
      backgroundColor: 'var(--ds-inputnumber-addon-bg)',
      border: `1px solid var(--ds-inputnumber-addon-border)`,
      fontSize: sizeConfig.fontSize,
      color: 'var(--ds-inputnumber-addon-color)',
    };

    const addonBeforeStyle: React.CSSProperties = {
      ...addonStyle,
      borderRight: 'none',
      borderRadius: 'var(--ds-inputnumber-radius) 0 0 var(--ds-inputnumber-radius)',
    };

    const addonAfterStyle: React.CSSProperties = {
      ...addonStyle,
      borderLeft: 'none',
      borderRadius: '0 var(--ds-inputnumber-radius) var(--ds-inputnumber-radius) 0',
    };

    return (
      <div className={containerClasses} style={wrapperStyle}>
        {addonBefore && (
          <span className="rottay-inputnumber__addon-before" style={addonBeforeStyle}>
            {addonBefore}
          </span>
        )}
        <div style={inputWrapperStyle}>
          {prefix && (
            <span className="rottay-inputnumber__prefix" style={prefixStyle}>
              {prefix}
            </span>
          )}
          <input
            ref={ref}
            type="number"
            className="rottay-inputnumber__input"
            style={inputStyle}
            value={formatValue(currentValue)}
            min={min}
            max={max}
            step={step}
            disabled={disabled}
            readOnly={readOnly}
            placeholder={placeholder}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            {...interactionHandlers}
            autoFocus={autoFocus}
            id={id}
            name={name}
            aria-valuemin={min}
            aria-valuemax={max}
            aria-valuenow={typeof currentValue === 'number' ? currentValue : undefined}
          />
          {suffix && (
            <span className="rottay-inputnumber__suffix" style={suffixStyle}>
              {suffix}
            </span>
          )}
          {controls && !disabled && !readOnly && (
            <div className="rottay-inputnumber__controls" style={controlsStyle}>
              <button
                type="button"
                style={controlButtonStyle}
                onClick={() => handleStep('up')}
                tabIndex={-1}
                aria-label="Increase"
              >
                ▲
              </button>
              <button
                type="button"
                style={controlButtonStyle}
                onClick={() => handleStep('down')}
                tabIndex={-1}
                aria-label="Decrease"
              >
                ▼
              </button>
            </div>
          )}
        </div>
        {addonAfter && (
          <span className="rottay-inputnumber__addon-after" style={addonAfterStyle}>
            {addonAfter}
          </span>
        )}
      </div>
    );
  }
);

InputNumber.displayName = 'InputNumber.Rustic';

export default InputNumber;
