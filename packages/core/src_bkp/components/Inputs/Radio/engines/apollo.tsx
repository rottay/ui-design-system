/**
 * Apollo Radio Engine
 *
 * Adapter that converts unified RadioProps to native HTML radio.
 * Handles the conversion of onChange signature:
 * - Unified: onChange(value: string | number)
 * - HTML: native input onChange(e: ChangeEvent)
 */

'use client';

import { forwardRef } from 'react';
import type { RadioProps, RadioOption } from '../../../../types/components/radio';

// Utility function for classNames
function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

/**
 * Base radio styles using Tailwind CSS
 */
const baseRadioStyles = `
  h-4 w-4
  border border-gray-300
  text-blue-600
  focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
  disabled:opacity-50 disabled:cursor-not-allowed
  transition-colors duration-200
`;

/**
 * Apollo Radio - Native HTML + Tailwind implementation with unified RadioProps
 */
const ApolloRadio = forwardRef<HTMLDivElement, RadioProps>(
  (
    {
      value,
      onChange,
      disabled,
      className,
      name,
      direction = 'horizontal',
      size = 'medium',
      options,
    },
    ref
  ) => {
    // Map unified size to Tailwind classes
    const sizeStyles = {
      small: 'h-3 w-3',
      medium: 'h-4 w-4',
      large: 'h-5 w-5',
    }[size];

    // Handle change event - convert to unified onChange signature
    const handleChange = (optionValue: string | number) => {
      onChange?.(optionValue);
    };

    // Container classes based on direction
    const containerClasses = cn(
      'flex',
      direction === 'vertical' ? 'flex-col gap-2' : 'flex-row gap-4',
      className
    );

    if (options && options.length > 0) {
      return (
        <div ref={ref} className={containerClasses}>
          {options.map((option: RadioOption) => {
            const isDisabled = disabled || option.disabled;

            return (
              <label
                key={String(option.value)}
                className={cn(
                  'inline-flex items-center gap-2 cursor-pointer select-none',
                  isDisabled && 'opacity-50 cursor-not-allowed',
                  option.className
                )}
              >
                <input
                  type="radio"
                  name={name}
                  value={option.value}
                  checked={value === option.value}
                  disabled={isDisabled}
                  onChange={() => handleChange(option.value)}
                  className={cn(baseRadioStyles, sizeStyles)}
                />
                <span className="text-gray-700">{option.label}</span>
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

ApolloRadio.displayName = 'ApolloRadio';

export default ApolloRadio;
