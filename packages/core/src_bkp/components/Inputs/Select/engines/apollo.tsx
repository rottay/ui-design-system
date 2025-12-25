/**
 * Apollo Select (HTML + Tailwind)
 *
 * Native HTML select with Tailwind CSS styling.
 */

'use client';

import { useState, useRef, useEffect } from 'react';
import type { SelectProps } from '../types';

// Utility function for classNames (inline to avoid external dependencies)
function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

const sizeStyles = {
  small: 'px-2 py-1 text-sm',
  middle: 'px-3 py-2 text-base',
  large: 'px-4 py-3 text-lg',
};

const statusStyles = {
  error: 'border-red-500 focus:ring-red-500',
  warning: 'border-yellow-500 focus:ring-yellow-500',
};

/**
 * Apollo Select - Native HTML + Tailwind implementation
 */
export function ApolloSelect({
  value,
  defaultValue,
  options = [],
  placeholder = 'Select...',
  disabled,
  loading,
  allowClear,
  size = 'middle',
  status,
  onChange,
  onFocus,
  onBlur,
  className,
  style,
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [internalValue, setInternalValue] = useState(defaultValue);
  const containerRef = useRef<HTMLDivElement>(null);

  const isControlled = value !== undefined;
  const currentValue = isControlled ? value : internalValue;

  const selectedOption = options.find((opt) => opt.value === currentValue);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (optionValue: string | number) => {
    const selectedOpt = options.find((opt) => opt.value === optionValue);
    if (!isControlled) {
      setInternalValue(optionValue);
    }
    onChange?.(optionValue, selectedOpt);
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isControlled) {
      setInternalValue(undefined);
    }
    onChange?.(undefined);
  };

  const selectClasses = cn(
    'relative w-full border rounded-md cursor-pointer transition-colors',
    'focus:outline-none focus:ring-2 focus:ring-offset-0',
    'bg-white border-gray-300 focus:ring-blue-500 focus:border-blue-500',
    disabled && 'bg-gray-100 cursor-not-allowed opacity-60',
    sizeStyles[size],
    status && statusStyles[status],
    className
  );

  return (
    <div ref={containerRef} className="relative" style={style}>
      <div
        className={selectClasses}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onFocus={onFocus}
        onBlur={onBlur}
        tabIndex={disabled ? -1 : 0}
      >
        <div className="flex items-center justify-between">
          <span className={!selectedOption ? 'text-gray-400' : ''}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <div className="flex items-center gap-1">
            {loading && (
              <svg className="animate-spin h-4 w-4 text-gray-400" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            )}
            {allowClear && selectedOption && (
              <button
                type="button"
                onClick={handleClear}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            )}
            <svg
              className={cn('h-4 w-4 text-gray-400 transition-transform', isOpen && 'rotate-180')}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
          {options.length === 0 ? (
            <div className="px-3 py-2 text-gray-400 text-sm">No options</div>
          ) : (
            options.map((option) => (
              <div
                key={option.value}
                onClick={() => !option.disabled && handleSelect(option.value)}
                className={cn(
                  'px-3 py-2 cursor-pointer transition-colors',
                  option.value === currentValue
                    ? 'bg-blue-50 text-blue-600'
                    : 'hover:bg-gray-50',
                  option.disabled && 'opacity-50 cursor-not-allowed'
                )}
              >
                {option.label}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

ApolloSelect.displayName = 'ApolloSelect';

export default ApolloSelect;
