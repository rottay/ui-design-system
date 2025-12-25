'use client';

/**
 * Hermes InputNumber Engine
 *
 * DaisyUI implementation with unified props interface.
 */

import { forwardRef, useState, useCallback } from 'react';
import type { InputNumberProps } from '../../../../types/components/input-number';

const sizeStyles = {
  small: 'input-sm text-sm',
  middle: 'input-md',
  large: 'input-lg text-lg',
};

const statusStyles = {
  error: 'input-error',
  warning: 'input-warning',
};

/**
 * Hermes InputNumber - DaisyUI implementation
 */
const HermesInputNumber = forwardRef<HTMLInputElement, InputNumberProps>(
  (
    {
      value,
      defaultValue,
      min,
      max,
      step = 1,
      onChange,
      onFocus,
      onBlur,
      disabled,
      readOnly,
      placeholder,
      className = '',
      style,
      id,
      name,
      autoFocus,
      size = 'middle',
      status,
      precision,
      controls = true,
      keyboard = true,
      prefix,
      suffix,
      onPressEnter,
      onStep,
    },
    ref
  ) => {
    // Internal state for uncontrolled mode
    const [internalValue, setInternalValue] = useState<number | null>(
      defaultValue ?? null
    );

    const isControlled = value !== undefined;
    const currentValue = isControlled ? value : internalValue;

    // Format number for display
    const formatValue = useCallback(
      (val: number | null): string => {
        if (val === null || val === undefined) return '';
        if (precision !== undefined) {
          return val.toFixed(precision);
        }
        return val.toString();
      },
      [precision]
    );

    // Clamp value to min/max
    const clampValue = useCallback(
      (val: number | null): number | null => {
        if (val === null) return null;
        let clamped = val;
        if (min !== undefined && clamped < min) clamped = min;
        if (max !== undefined && clamped > max) clamped = max;
        if (precision !== undefined) {
          clamped = parseFloat(clamped.toFixed(precision));
        }
        return clamped;
      },
      [min, max, precision]
    );

    // Handle input change
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const rawValue = e.target.value;
      const parsedValue = rawValue === '' ? null : parseFloat(rawValue);
      const clampedValue = clampValue(parsedValue);

      if (!isControlled) {
        setInternalValue(clampedValue);
      }
      onChange?.(clampedValue);
    };

    // Handle step up/down
    const handleStep = (direction: 'up' | 'down') => {
      if (disabled || readOnly) return;

      const stepValue = typeof step === 'string' ? parseFloat(step) : step;
      const offset = direction === 'up' ? stepValue : -stepValue;
      const current = currentValue ?? 0;
      const newValue = clampValue(current + offset);

      if (newValue === null) return;

      if (!isControlled) {
        setInternalValue(newValue);
      }
      onChange?.(newValue);
      onStep?.(newValue, { offset, type: direction });
    };

    // Handle keyboard events
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        onPressEnter?.(e);
      }
      if (!keyboard) return;
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        handleStep('up');
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        handleStep('down');
      }
    };

    const inputClasses = [
      'input input-bordered w-full',
      sizeStyles[size],
      status ? statusStyles[status] : '',
      disabled ? 'input-disabled' : '',
      controls ? 'pr-10' : '',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    const displayValue = formatValue(currentValue);

    return (
      <div className="relative inline-flex items-center w-full" style={style}>
        {prefix && (
          <span className="absolute left-3 text-base-content/50 pointer-events-none z-10">
            {prefix}
          </span>
        )}
        <input
          ref={ref}
          id={id}
          name={name}
          type="text"
          inputMode="decimal"
          value={displayValue}
          placeholder={placeholder}
          disabled={disabled}
          readOnly={readOnly}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={onFocus}
          onBlur={onBlur}
          autoFocus={autoFocus}
          className={inputClasses}
          style={prefix ? { paddingLeft: '2.5rem' } : undefined}
        />
        {suffix && !controls && (
          <span className="absolute right-3 text-base-content/50 pointer-events-none">
            {suffix}
          </span>
        )}
        {controls && (
          <div className="absolute right-1 top-1/2 -translate-y-1/2 flex flex-col gap-0.5">
            <button
              type="button"
              onClick={() => handleStep('up')}
              disabled={disabled || readOnly || (max !== undefined && currentValue !== null && currentValue >= max)}
              className="btn btn-xs btn-ghost px-1 h-4 min-h-0"
              tabIndex={-1}
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => handleStep('down')}
              disabled={disabled || readOnly || (min !== undefined && currentValue !== null && currentValue <= min)}
              className="btn btn-xs btn-ghost px-1 h-4 min-h-0"
              tabIndex={-1}
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        )}
      </div>
    );
  }
);

HermesInputNumber.displayName = 'HermesInputNumber';

export default HermesInputNumber;
