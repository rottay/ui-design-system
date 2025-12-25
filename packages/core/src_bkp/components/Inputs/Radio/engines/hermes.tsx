/**
 * Hermes Radio Engine
 *
 * Adapter that converts unified RadioProps to DaisyUI Radio.
 * Handles the conversion of onChange signature:
 * - Unified: onChange(value: string | number)
 * - DaisyUI: native input onChange(e: ChangeEvent)
 */

'use client';

import { forwardRef } from 'react';
import type { RadioProps, RadioOption } from '../../../../types/components/radio';

/**
 * Hermes Radio - DaisyUI implementation with unified RadioProps
 */
const HermesRadio = forwardRef<HTMLDivElement, RadioProps>(
  (
    {
      value,
      onChange,
      disabled,
      className = '',
      name,
      direction = 'horizontal',
      size = 'medium',
      options,
    },
    ref
  ) => {
    // Map unified size to DaisyUI size
    const sizeClass = {
      small: 'radio-sm',
      medium: '',
      large: 'radio-lg',
    }[size];

    // Handle change event - convert to unified onChange signature
    const handleChange = (optionValue: string | number) => {
      onChange?.(optionValue);
    };

    // Container classes based on direction
    const containerClasses = [
      'flex',
      direction === 'vertical' ? 'flex-col gap-2' : 'flex-row gap-4',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    if (options && options.length > 0) {
      return (
        <div ref={ref} className={containerClasses}>
          {options.map((option: RadioOption) => {
            const radioClasses = ['radio', sizeClass].filter(Boolean).join(' ');

            return (
              <label
                key={String(option.value)}
                className={[
                  'label cursor-pointer inline-flex items-center gap-2',
                  (disabled || option.disabled) && 'opacity-50 cursor-not-allowed',
                  option.className,
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                <input
                  type="radio"
                  name={name}
                  value={option.value}
                  checked={value === option.value}
                  disabled={disabled || option.disabled}
                  onChange={() => handleChange(option.value)}
                  className={radioClasses}
                />
                <span className="label-text">{option.label}</span>
              </label>
            );
          })}
        </div>
      );
    }

    // Empty group when no options
    return <div ref={ref} className={containerClasses} />;
  }
);

HermesRadio.displayName = 'HermesRadio';

export default HermesRadio;
