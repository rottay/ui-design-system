'use client';

/**
 * Segmented - Hermes Engine (DaisyUI/Tailwind)
 */
import React, { useState } from 'react';
import type { SegmentedProps, SegmentedOption } from '../../types';
import { SEGMENTED_DEFAULTS } from '../../types';

const SIZE_CLASSES = {
  small: 'btn-sm',
  middle: 'btn-md',
  large: 'btn-lg',
};

export const Segmented = React.forwardRef<HTMLDivElement, SegmentedProps>(
  (props, ref) => {
    const {
      options,
      value,
      defaultValue,
      onChange,
      block = SEGMENTED_DEFAULTS.block,
      disabled = SEGMENTED_DEFAULTS.disabled,
      size = SEGMENTED_DEFAULTS.size,
      className = '',
      style,
    } = props;

    const [internalValue, setInternalValue] = useState(defaultValue);
    const currentValue = value ?? internalValue;

    const normalizedOptions: SegmentedOption[] = options.map((opt) =>
      typeof opt === 'object' ? opt : { label: opt, value: opt }
    );

    const handleClick = (optValue: string | number) => {
      if (disabled) return;
      if (value === undefined) setInternalValue(optValue);
      onChange?.(optValue);
    };

    const sizeClass = SIZE_CLASSES[size!] || SIZE_CLASSES.middle;

    return (
      <div
        ref={ref}
        className={`join ${block ? 'w-full' : ''} ${className}`}
        style={style}
      >
        {normalizedOptions.map((opt) => {
          const isActive = currentValue === opt.value;
          const isDisabled = disabled || opt.disabled;

          return (
            <button
              key={String(opt.value)}
              type="button"
              className={`join-item btn ${sizeClass} ${isActive ? 'btn-active btn-primary' : ''} ${isDisabled ? 'btn-disabled' : ''} ${opt.className || ''}`}
              onClick={() => handleClick(opt.value)}
              disabled={isDisabled}
            >
              {opt.icon && <span className="mr-1">{opt.icon}</span>}
              {opt.label}
            </button>
          );
        })}
      </div>
    );
  }
);

Segmented.displayName = 'Segmented.Hermes';

export default Segmented;
