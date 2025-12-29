'use client';

/**
 * @fileoverview InputNumber Apollo Engine - Rottay Design System
 * @description Pure HTML/CSS implementation of the InputNumber component using CSS variables.
 * Part of the Rottay Design System's input primitives collection.
 *
 * @module ApolloInputNumber
 * @category Inputs
 * @package @rottay/design-system
 */

import React, { useState, useCallback } from 'react';
import type { InputNumberProps } from '../../types';

// Size configuration using CSS variables
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

    const isControlled = value !== undefined;
    const [internalValue, setInternalValue] = useState<number | string | null>(defaultValue ?? null);
    const [isFocused, setIsFocused] = useState(false);
    const currentValue = isControlled ? value : internalValue;

    const parseNumber = (val: string): number | null => {
      if (val === '' || val === '-') return null;
      const parsed = parseFloat(val);
      return isNaN(parsed) ? null : parsed;
    };

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

    // Build class names
    const containerClasses = [
      'rottay-inputnumber',
      'rottay-inputnumber--apollo',
      `rottay-inputnumber--${size}`,
      status && `rottay-inputnumber--${status}`,
      disabled && 'rottay-inputnumber--disabled',
      isFocused && 'rottay-inputnumber--focused',
      className,
    ].filter(Boolean).join(' ');

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
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
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

InputNumber.displayName = 'InputNumber.Apollo';

export default InputNumber;
