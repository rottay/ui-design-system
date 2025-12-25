'use client';

/**
 * Apollo Segmented Engine
 *
 * Native HTML + Tailwind CSS implementation.
 */

import { useState, useCallback } from 'react';
import type { SegmentedProps, SegmentedValue, SegmentedOption } from '../../../../types/components/segmented';
import { normalizeOptions, getSizeClasses } from '../../../../types/components/segmented';

/**
 * Apollo Segmented - Native HTML + Tailwind implementation
 */
function ApolloSegmented<T extends SegmentedValue = SegmentedValue>({
  options,
  value: controlledValue,
  defaultValue,
  onChange,
  className = '',
  style,
  disabled,
  size = 'middle',
  block,
}: SegmentedProps<T>) {
  const [internalValue, setInternalValue] = useState<T | undefined>(defaultValue);
  const currentValue = controlledValue ?? internalValue;
  const normalizedOptions = normalizeOptions(options);
  const sizeClasses = getSizeClasses(size, 'apollo');

  const handleSelect = useCallback(
    (optValue: T) => {
      if (disabled) return;
      setInternalValue(optValue);
      onChange?.(optValue);
    },
    [disabled, onChange]
  );

  const containerClasses = [
    'inline-flex items-center bg-gray-100 rounded-lg p-1 gap-1',
    block && 'w-full',
    disabled && 'opacity-50 cursor-not-allowed',
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={containerClasses} style={style} role="group">
      {normalizedOptions.map((option: SegmentedOption<T>) => {
        const isActive = currentValue === option.value;
        const isDisabled = disabled || option.disabled;

        const btnClasses = [
          'relative rounded-md font-medium transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1',
          sizeClasses,
          block && 'flex-1 text-center',
          isActive
            ? 'bg-white text-blue-600 shadow-sm'
            : 'text-gray-700 hover:text-gray-900',
          isDisabled
            ? 'cursor-not-allowed opacity-50'
            : 'cursor-pointer hover:bg-white/50',
          option.className,
        ].filter(Boolean).join(' ');

        return (
          <button
            key={String(option.value)}
            type="button"
            className={btnClasses}
            onClick={() => handleSelect(option.value)}
            disabled={isDisabled}
            aria-pressed={isActive}
          >
            {option.icon && <span className="mr-1.5 inline-flex items-center">{option.icon}</span>}
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

ApolloSegmented.displayName = 'ApolloSegmented';

export default ApolloSegmented;
