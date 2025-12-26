'use client';

/**
 * Rate - Hermes Engine (DaisyUI/Tailwind)
 */
import React, { useState, useCallback } from 'react';
import type { RateProps } from '../../types';
import { RATE_DEFAULTS } from '../../types';

export const Rate = React.forwardRef<HTMLDivElement, RateProps>(
  (props, ref) => {
    const {
      value,
      defaultValue = RATE_DEFAULTS.defaultValue,
      count = RATE_DEFAULTS.count,
      allowHalf = RATE_DEFAULTS.allowHalf,
      allowClear = RATE_DEFAULTS.allowClear,
      disabled = RATE_DEFAULTS.disabled,
      onChange,
      onHoverChange,
      character,
      className = '',
      style,
      tooltips,
    } = props;

    const isControlled = value !== undefined;
    const [internalValue, setInternalValue] = useState(defaultValue || 0);
    const [hoverValue, setHoverValue] = useState<number | null>(null);
    const currentValue = isControlled ? value : internalValue;

    const handleClick = useCallback((starValue: number) => {
      if (disabled) return;

      let newValue = starValue;

      // Allow clearing if clicking on current value
      if (allowClear && starValue === currentValue) {
        newValue = 0;
      }

      if (!isControlled) {
        setInternalValue(newValue);
      }
      onChange?.(newValue);
    }, [disabled, allowClear, currentValue, isControlled, onChange]);

    const handleHover = useCallback((starValue: number | null) => {
      if (disabled) return;
      setHoverValue(starValue);
      if (starValue !== null) {
        onHoverChange?.(starValue);
      }
    }, [disabled, onHoverChange]);

    const displayValue = hoverValue !== null ? hoverValue : currentValue;

    const renderCharacter = (index: number) => {
      if (typeof character === 'function') {
        return character({ index, value: displayValue || 0 });
      }
      if (character) {
        return character;
      }
      // Default star SVG
      return (
        <svg
          className="w-6 h-6"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      );
    };

    const stars = Array.from({ length: count! }, (_, index) => {
      const starIndex = index + 1;
      const isFilled = displayValue! >= starIndex;
      const isHalfFilled = allowHalf && displayValue! >= starIndex - 0.5 && displayValue! < starIndex;

      return (
        <label
          key={index}
          className={`
            cursor-pointer transition-colors
            ${isFilled || isHalfFilled ? 'text-warning' : 'text-base-300'}
            ${disabled ? 'cursor-not-allowed opacity-50' : 'hover:scale-110'}
          `}
          title={tooltips?.[index]}
          onMouseEnter={() => handleHover(starIndex)}
          onMouseLeave={() => handleHover(null)}
        >
          <input
            type="radio"
            name="rating"
            className="hidden"
            value={starIndex}
            disabled={disabled}
            onClick={() => handleClick(starIndex)}
          />
          {allowHalf && (
            <span
              className="absolute left-0 w-1/2 overflow-hidden"
              onMouseEnter={(e) => {
                e.stopPropagation();
                handleHover(starIndex - 0.5);
              }}
              onClick={(e) => {
                e.stopPropagation();
                handleClick(starIndex - 0.5);
              }}
            />
          )}
          {renderCharacter(index)}
        </label>
      );
    });

    return (
      <div
        ref={ref}
        className={`rating rating-lg ${className}`}
        style={style}
        role="radiogroup"
        aria-label="Rating"
      >
        {stars}
      </div>
    );
  }
);

Rate.displayName = 'Rate.Hermes';

export default Rate;
