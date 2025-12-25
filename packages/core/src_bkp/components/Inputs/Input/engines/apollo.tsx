/**
 * Apollo Input (Native HTML + Tailwind)
 *
 * Native HTML + Tailwind CSS input implementation.
 * Zero external dependencies, minimal bundle size.
 */

import { forwardRef, useState } from 'react';
import { cn } from '../../../../utils/cn';
import type { InputProps } from '../types';

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
 * Apollo Input - Native HTML + Tailwind implementation
 */
export const ApolloInput = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      value,
      defaultValue,
      placeholder,
      disabled,
      readOnly,
      maxLength,
      size = 'middle',
      status,
      prefix,
      suffix,
      allowClear,
      onChange,
      onPressEnter,
      onFocus,
      onBlur,
      className,
      style,
      type = 'text',
      id,
      name,
      autoFocus,
      autoComplete,
    },
    ref
  ) => {
    const [internalValue, setInternalValue] = useState(defaultValue || '');
    const isControlled = value !== undefined;
    const currentValue = isControlled ? value : internalValue;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!isControlled) {
        setInternalValue(e.target.value);
      }
      onChange?.(e);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        onPressEnter?.(e);
      }
    };

    const handleClear = () => {
      const syntheticEvent = {
        target: { value: '' },
      } as React.ChangeEvent<HTMLInputElement>;
      handleChange(syntheticEvent);
    };

    const inputClasses = cn(
      'w-full border rounded-md transition-colors duration-200',
      'focus:outline-none focus:ring-2 focus:ring-offset-0',
      'disabled:bg-gray-100 disabled:cursor-not-allowed',
      'border-gray-300 focus:ring-blue-500 focus:border-blue-500',
      sizeStyles[size],
      status ? statusStyles[status] : undefined,
      (prefix || suffix || allowClear) ? 'pl-10' : undefined,
      className
    );

    const hasAddons = prefix || suffix || (allowClear && currentValue);

    if (hasAddons) {
      return (
        <div className="relative flex items-center" style={style}>
          {prefix && (
            <span className="absolute left-3 text-gray-400">{prefix}</span>
          )}
          <input
            ref={ref}
            id={id}
            name={name}
            type={type}
            value={currentValue}
            placeholder={placeholder}
            disabled={disabled}
            readOnly={readOnly}
            maxLength={maxLength}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onFocus={onFocus}
            onBlur={onBlur}
            autoFocus={autoFocus}
            autoComplete={autoComplete}
            className={inputClasses}
          />
          {allowClear && currentValue && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-3 text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          )}
          {suffix && !allowClear && (
            <span className="absolute right-3 text-gray-400">{suffix}</span>
          )}
        </div>
      );
    }

    return (
      <input
        ref={ref}
        id={id}
        name={name}
        type={type}
        value={currentValue}
        placeholder={placeholder}
        disabled={disabled}
        readOnly={readOnly}
        maxLength={maxLength}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onFocus={onFocus}
        onBlur={onBlur}
        autoFocus={autoFocus}
        autoComplete={autoComplete}
        className={inputClasses}
        style={style}
      />
    );
  }
);

ApolloInput.displayName = 'ApolloInput';
export default ApolloInput;
