/**
 * InputNumber - Base Component
 * Uses CSS variables from design tokens for consistent styling
 */

'use client';

import React, { forwardRef, useState, useRef, useMemo, useCallback } from 'react';
import type { InputNumberProps } from '../types';
import { INPUT_NUMBER_DEFAULTS } from '../types';

/**
 * Size configurations
 */
const SIZE_CONFIG = {
  small: { height: 24, fontSize: 12, padding: '0 7px' },
  default: { height: 32, fontSize: 14, padding: '0 11px' },
  large: { height: 40, fontSize: 16, padding: '0 11px' },
};

/**
 * Up/Down arrow icons
 */
const UpIcon = () => (
  <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor">
    <path d="M7 14l5-5 5 5z" />
  </svg>
);

const DownIcon = () => (
  <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor">
    <path d="M7 10l5 5 5-5z" />
  </svg>
);

/**
 * Base InputNumber component using CSS variables.
 * This is extended by engine-specific implementations.
 */
export const BaseInputNumber = forwardRef<HTMLInputElement, InputNumberProps>(
  (props, ref) => {
    const {
      value: controlledValue,
      defaultValue,
      min,
      max,
      step = INPUT_NUMBER_DEFAULTS.step,
      precision,
      disabled = false,
      readOnly = false,
      size = INPUT_NUMBER_DEFAULTS.size,
      status,
      prefix,
      suffix,
      addonBefore,
      addonAfter,
      placeholder,
      controls = INPUT_NUMBER_DEFAULTS.controls,
      keyboard = INPUT_NUMBER_DEFAULTS.keyboard,
      stringMode = false,
      formatter,
      parser,
      onChange,
      onPressEnter,
      onStep,
      className = '',
      style = {},
      autoFocus,
      id,
      name,
      bordered = INPUT_NUMBER_DEFAULTS.bordered,
      variant = INPUT_NUMBER_DEFAULTS.variant,
    } = props;

    const [internalValue, setInternalValue] = useState<number | string | null>(
      defaultValue !== undefined ? defaultValue : null
    );
    const inputRef = useRef<HTMLInputElement>(null);

    const currentValue = controlledValue !== undefined ? controlledValue : internalValue;

    // Size config
    const sizeKey = size === 'small' ? 'small' : size === 'large' ? 'large' : 'default';
    const config = SIZE_CONFIG[sizeKey];

    // Parse value to number
    const parseValue = useCallback((val: string): number | null => {
      if (parser) {
        const parsed = parser(val);
        return typeof parsed === 'number' ? parsed : parseFloat(String(parsed));
      }
      const num = parseFloat(val);
      return isNaN(num) ? null : num;
    }, [parser]);

    // Format value for display
    const formatValue = useCallback((val: number | string | null): string => {
      if (val === null || val === undefined) return '';
      if (formatter) {
        return formatter(val, { userTyping: false, input: String(val) });
      }
      if (precision !== undefined && typeof val === 'number') {
        return val.toFixed(precision);
      }
      return String(val);
    }, [formatter, precision]);

    // Clamp value within bounds
    const clampValue = useCallback((val: number): number => {
      let result = val;
      if (min !== undefined && result < min) result = min;
      if (max !== undefined && result > max) result = max;
      if (precision !== undefined) {
        result = parseFloat(result.toFixed(precision));
      }
      return result;
    }, [min, max, precision]);

    // Step value
    const stepValue = useCallback((direction: 'up' | 'down') => {
      if (disabled || readOnly) return;

      const numStep = typeof step === 'number' ? step : parseFloat(step || '1');
      const numValue = typeof currentValue === 'number' ? currentValue : parseFloat(String(currentValue)) || 0;
      const offset = direction === 'up' ? numStep : -numStep;
      const newValue = clampValue(numValue + offset);

      if (controlledValue === undefined) {
        setInternalValue(stringMode ? String(newValue) : newValue);
      }
      onChange?.(stringMode ? String(newValue) : newValue);
      onStep?.(newValue, { offset, type: direction });
    }, [currentValue, step, disabled, readOnly, clampValue, controlledValue, stringMode, onChange, onStep]);

    // Handle input change
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const rawValue = e.target.value;
      if (rawValue === '' || rawValue === '-') {
        if (controlledValue === undefined) {
          setInternalValue(rawValue === '-' ? rawValue : null);
        }
        onChange?.(null);
        return;
      }

      const parsed = parseValue(rawValue);
      if (parsed !== null) {
        const clamped = clampValue(parsed);
        if (controlledValue === undefined) {
          setInternalValue(stringMode ? String(clamped) : clamped);
        }
        onChange?.(stringMode ? String(clamped) : clamped);
      }
    };

    // Handle keyboard
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        onPressEnter?.(e);
      }
      if (keyboard) {
        if (e.key === 'ArrowUp') {
          e.preventDefault();
          stepValue('up');
        } else if (e.key === 'ArrowDown') {
          e.preventDefault();
          stepValue('down');
        }
      }
    };

    // CSS variables
    const inputVars = useMemo<React.CSSProperties>(() => ({
      '--input-number-height': `${config.height}px`,
      '--input-number-font-size': `${config.fontSize}px`,
      '--input-number-padding': config.padding,
      '--input-number-border-color': status === 'error' ? 'var(--color-error, #ff4d4f)' : status === 'warning' ? 'var(--color-warning, #faad14)' : 'var(--color-border, #d9d9d9)',
      '--input-number-bg': variant === 'filled' ? 'var(--color-bg-secondary, #f5f5f5)' : 'var(--color-bg-elevated, #fff)',
      '--input-number-focus-border': 'var(--color-primary, #1677ff)',
      '--input-number-focus-shadow': '0 0 0 2px rgba(22, 119, 255, 0.1)',
    } as React.CSSProperties), [config, status, variant]);

    const wrapperStyle: React.CSSProperties = {
      ...inputVars,
      display: 'inline-flex',
      alignItems: 'center',
      width: '100%',
      ...style,
    };

    const inputWrapperStyle: React.CSSProperties = {
      position: 'relative',
      display: 'inline-flex',
      alignItems: 'center',
      flex: 1,
      height: 'var(--input-number-height)',
      backgroundColor: 'var(--input-number-bg)',
      border: bordered && variant !== 'borderless' ? '1px solid var(--input-number-border-color)' : 'none',
      borderRadius: 'var(--radius-md, 6px)',
      transition: 'all 0.2s',
    };

    const inputStyle: React.CSSProperties = {
      width: '100%',
      height: '100%',
      padding: 'var(--input-number-padding)',
      paddingRight: controls ? '32px' : undefined,
      fontSize: 'var(--input-number-font-size)',
      border: 'none',
      outline: 'none',
      backgroundColor: 'transparent',
      textAlign: 'left',
    };

    const controlsStyle: React.CSSProperties = {
      position: 'absolute',
      right: 0,
      top: 0,
      bottom: 0,
      display: 'flex',
      flexDirection: 'column',
      width: '22px',
      borderLeft: '1px solid var(--input-number-border-color)',
    };

    const controlBtnStyle: React.CSSProperties = {
      flex: 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: disabled ? 'not-allowed' : 'pointer',
      color: 'var(--color-text-secondary)',
      transition: 'color 0.2s',
    };

    const showControls = controls && !disabled && !readOnly;

    return (
      <div className={`rottay-input-number ${className}`} style={wrapperStyle}>
        {addonBefore && <span className="rottay-input-number__addon-before">{addonBefore}</span>}
        <div className="rottay-input-number__wrapper" style={inputWrapperStyle}>
          {prefix && <span className="rottay-input-number__prefix" style={{ paddingLeft: 8 }}>{prefix}</span>}
          <input
            ref={ref || inputRef}
            type="text"
            inputMode="decimal"
            id={id}
            name={name}
            value={formatValue(currentValue)}
            placeholder={placeholder}
            disabled={disabled}
            readOnly={readOnly}
            autoFocus={autoFocus}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            className="rottay-input-number__input"
            style={inputStyle}
            aria-valuemin={min}
            aria-valuemax={max}
            aria-valuenow={typeof currentValue === 'number' ? currentValue : undefined}
          />
          {suffix && <span className="rottay-input-number__suffix" style={{ paddingRight: 8 }}>{suffix}</span>}
          {showControls && (
            <div className="rottay-input-number__controls" style={controlsStyle}>
              <span
                className="rottay-input-number__control-up"
                style={{ ...controlBtnStyle, borderBottom: '1px solid var(--input-number-border-color)' }}
                onClick={() => stepValue('up')}
              >
                {typeof controls === 'object' && controls.upIcon ? controls.upIcon : <UpIcon />}
              </span>
              <span
                className="rottay-input-number__control-down"
                style={controlBtnStyle}
                onClick={() => stepValue('down')}
              >
                {typeof controls === 'object' && controls.downIcon ? controls.downIcon : <DownIcon />}
              </span>
            </div>
          )}
        </div>
        {addonAfter && <span className="rottay-input-number__addon-after">{addonAfter}</span>}
      </div>
    );
  }
);

BaseInputNumber.displayName = 'BaseInputNumber';
