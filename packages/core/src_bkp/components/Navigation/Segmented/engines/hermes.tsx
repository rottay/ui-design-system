'use client';

/**
 * Hermes Segmented Engine
 *
 * DaisyUI implementation with button group.
 */

import { useState, useCallback } from 'react';
import type { SegmentedProps, SegmentedValue, SegmentedOption } from '../../../../types/components/segmented';
import { normalizeOptions, getSizeClasses } from '../../../../types/components/segmented';

/**
 * Hermes Segmented - DaisyUI implementation
 */
function HermesSegmented<T extends SegmentedValue = SegmentedValue>({
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
  const sizeClasses = getSizeClasses(size, 'hermes');

  const handleSelect = useCallback(
    (optValue: T) => {
      if (disabled) return;
      setInternalValue(optValue);
      onChange?.(optValue);
    },
    [disabled, onChange]
  );

  return (
    <div
      className={`join ${block ? 'w-full' : 'inline-flex'} ${className}`}
      style={style}
      role="group"
    >
      {normalizedOptions.map((option: SegmentedOption<T>) => {
        const isActive = currentValue === option.value;
        const isDisabled = disabled || option.disabled;

        const btnClasses = [
          'join-item btn',
          sizeClasses,
          isActive && 'btn-active',
          isDisabled && 'btn-disabled',
          block && 'flex-1',
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
            {option.icon && <span className="mr-1">{option.icon}</span>}
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

HermesSegmented.displayName = 'HermesSegmented';

export default HermesSegmented;
