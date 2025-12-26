'use client';

/**
 * InputNumber - Hermes Engine (DaisyUI/Tailwind)
 */
import React, { useState, useCallback } from 'react';
import type { InputNumberProps } from '../../types';

const sizeClasses = {
  small: 'input-sm',
  default: 'input-md',
  large: 'input-lg',
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

    const sizeClass = sizeClasses[size === 'large' ? 'large' : size === 'small' ? 'small' : 'default'];
    const statusClass = status === 'error' ? 'input-error' : status === 'warning' ? 'input-warning' : '';

    return (
      <div className="flex items-center gap-1" style={style}>
        {addonBefore && <span className="px-2 py-1 bg-base-200 rounded-l">{addonBefore}</span>}
        <div className="relative flex items-center">
          {prefix && <span className="absolute left-2 text-base-content/60">{prefix}</span>}
          <input
            ref={ref}
            type="number"
            className={`input input-bordered ${sizeClass} ${statusClass} ${prefix ? 'pl-8' : ''} ${suffix || controls ? 'pr-16' : ''} ${className}`}
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
            {suffix && <span className="text-base-content/60">{suffix}</span>}
            {controls && !disabled && !readOnly && (
              <div className="flex flex-col">
                <button
                  type="button"
                  className="btn btn-xs btn-ghost px-1 py-0 h-4 min-h-0"
                  onClick={() => handleStep('up')}
                  tabIndex={-1}
                >
                  ▲
                </button>
                <button
                  type="button"
                  className="btn btn-xs btn-ghost px-1 py-0 h-4 min-h-0"
                  onClick={() => handleStep('down')}
                  tabIndex={-1}
                >
                  ▼
                </button>
              </div>
            )}
          </div>
        </div>
        {addonAfter && <span className="px-2 py-1 bg-base-200 rounded-r">{addonAfter}</span>}
      </div>
    );
  }
);

InputNumber.displayName = 'InputNumber.Hermes';

export default InputNumber;
