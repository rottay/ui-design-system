/**
 * Apollo InputNumber (Native HTML + Tailwind)
 *
 * Native HTML input type="number" + Tailwind CSS implementation.
 * Zero external dependencies, minimal bundle size.
 * Includes custom step control buttons.
 */

'use client';

import { forwardRef, useState, useCallback } from 'react';
import { cn } from '../../../../utils/cn';
import type { InputNumberProps } from '../../../../types/components/input-number';

const sizeStyles = {
  small: 'px-2 py-1 text-sm',
  middle: 'px-3 py-2 text-base',
  large: 'px-4 py-3 text-lg',
};

const statusStyles = {
  error: 'border-red-500 focus:ring-red-500 focus:border-red-500',
  warning: 'border-yellow-500 focus:ring-yellow-500 focus:border-yellow-500',
};

/**
 * Apollo InputNumber - Native HTML + Tailwind implementation
 */
const ApolloInputNumber = forwardRef<HTMLInputElement, InputNumberProps>(
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
      className,
      style,
      id,
      name,
      autoFocus,
      size = 'middle',
      status,
      precision,
      decimalSeparator = '.',
      formatter,
      parser,
      controls = true,
      keyboard = true,
      prefix,
      suffix,
      addonBefore,
      addonAfter,
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

        let formatted = val.toString();

        // Apply precision
        if (precision !== undefined) {
          formatted = val.toFixed(precision);
        }

        // Apply decimal separator
        if (decimalSeparator !== '.') {
          formatted = formatted.replace('.', decimalSeparator);
        }

        // Apply custom formatter
        if (formatter) {
          formatted = formatter(val);
        }

        return formatted;
      },
      [precision, decimalSeparator, formatter]
    );

    // Parse string to number
    const parseValue = useCallback(
      (str: string): number | null => {
        if (!str) return null;

        let parsed = str;

        // Apply custom parser
        if (parser) {
          const result = parser(str);
          parsed = typeof result === 'number' ? result.toString() : result;
        }

        // Replace decimal separator
        if (decimalSeparator !== '.') {
          parsed = parsed.replace(decimalSeparator, '.');
        }

        const num = parseFloat(parsed);

        if (isNaN(num)) return null;

        return num;
      },
      [parser, decimalSeparator]
    );

    // Clamp value to min/max
    const clampValue = useCallback(
      (val: number | null): number | null => {
        if (val === null) return null;

        let clamped = val;

        if (min !== undefined && clamped < min) {
          clamped = min;
        }

        if (max !== undefined && clamped > max) {
          clamped = max;
        }

        // Apply precision
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
      const parsedValue = parseValue(rawValue);
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

    // Build input classes
    const inputClasses = cn(
      'w-full border rounded-md transition-colors duration-200',
      'focus:outline-none focus:ring-2 focus:ring-offset-0',
      'disabled:bg-gray-100 disabled:cursor-not-allowed',
      'border-gray-300 focus:ring-blue-500 focus:border-blue-500',
      sizeStyles[size],
      status ? statusStyles[status] : undefined,
      controls ? 'pr-8' : undefined,
      prefix ? 'pl-10' : undefined,
      className
    );

    const displayValue = formatValue(currentValue);

    // Render with controls
    if (controls) {
      return (
        <div className="relative inline-flex items-center" style={style}>
          {addonBefore && (
            <span className="inline-flex items-center px-3 border border-r-0 border-gray-300 rounded-l-md bg-gray-50 text-gray-500 text-sm">
              {addonBefore}
            </span>
          )}
          {prefix && (
            <span className="absolute left-3 text-gray-400 pointer-events-none">
              {prefix}
            </span>
          )}
          <div className="relative flex-1">
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
            />
            <div className="absolute right-0 top-0 bottom-0 flex flex-col border-l border-gray-300">
              <button
                type="button"
                onClick={() => handleStep('up')}
                disabled={disabled || readOnly || (max !== undefined && currentValue !== null && currentValue >= max)}
                className="flex-1 px-2 text-gray-500 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed border-b border-gray-300 rounded-tr-md"
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
                className="flex-1 px-2 text-gray-500 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed rounded-br-md"
                tabIndex={-1}
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
          </div>
          {suffix && (
            <span className="absolute right-10 text-gray-400 pointer-events-none">
              {suffix}
            </span>
          )}
          {addonAfter && (
            <span className="inline-flex items-center px-3 border border-l-0 border-gray-300 rounded-r-md bg-gray-50 text-gray-500 text-sm">
              {addonAfter}
            </span>
          )}
        </div>
      );
    }

    // Render without controls
    return (
      <div className="relative inline-flex items-center" style={style}>
        {addonBefore && (
          <span className="inline-flex items-center px-3 border border-r-0 border-gray-300 rounded-l-md bg-gray-50 text-gray-500 text-sm">
            {addonBefore}
          </span>
        )}
        {prefix && (
          <span className="absolute left-3 text-gray-400 pointer-events-none">
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
        />
        {suffix && (
          <span className="absolute right-3 text-gray-400 pointer-events-none">
            {suffix}
          </span>
        )}
        {addonAfter && (
          <span className="inline-flex items-center px-3 border border-l-0 border-gray-300 rounded-r-md bg-gray-50 text-gray-500 text-sm">
            {addonAfter}
          </span>
        )}
      </div>
    );
  }
);

ApolloInputNumber.displayName = 'ApolloInputNumber';

export default ApolloInputNumber;
