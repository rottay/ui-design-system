'use client';

/**
 * Rate - Hermes Engine (DaisyUI/Tailwind)
 * Custom implementation using DaisyUI rating classes
 * @module Rate/Engines/Hermes
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import type { RateProps, RateCharacterProps } from '../../types';
import { RATE_DEFAULTS, RATE_SIZE_MAP } from '../../types';

/**
 * Map design system sizes to Tailwind classes
 */
const SIZE_CLASSES: Record<string, string> = {
  xs: 'rating-xs',
  sm: 'rating-sm',
  md: 'rating-md',
  lg: 'rating-lg',
  xl: 'rating-lg', // DaisyUI doesn't have xl, use lg
};

/**
 * Hermes Rate component using DaisyUI/Tailwind
 */
export const Rate = React.forwardRef<HTMLDivElement, RateProps>(
  (props, ref) => {
    const {
      value,
      defaultValue = RATE_DEFAULTS.defaultValue,
      count = RATE_DEFAULTS.count,
      allowHalf = RATE_DEFAULTS.allowHalf,
      allowClear = RATE_DEFAULTS.allowClear,
      disabled = RATE_DEFAULTS.disabled,
      readOnly = RATE_DEFAULTS.readOnly,
      onChange,
      onHoverChange,
      character,
      className = '',
      style,
      tooltips,
      autoFocus,
      keyboard = RATE_DEFAULTS.keyboard,
      size = RATE_DEFAULTS.size,
      activeColor,
      inactiveColor,
      direction = RATE_DEFAULTS.direction,
      // Omit engine prop
      engine: _engine,
      ...restProps
    } = props;

    const isControlled = value !== undefined;
    const [internalValue, setInternalValue] = useState(defaultValue);
    const [hoverValue, setHoverValue] = useState<number | null>(null);
    const [focusIndex, setFocusIndex] = useState<number | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const currentValue = isControlled ? value : internalValue;
    const displayValue = hoverValue !== null ? hoverValue : currentValue;
    const isInteractive = !disabled && !readOnly;

    // Auto focus on mount
    useEffect(() => {
      if (autoFocus && containerRef.current) {
        containerRef.current.focus();
      }
    }, [autoFocus]);

    // Handle click on a star
    const handleClick = useCallback((starValue: number) => {
      if (!isInteractive) return;

      let newValue = starValue;

      // Allow clearing if clicking on current value
      if (allowClear && starValue === currentValue) {
        newValue = 0;
      }

      if (!isControlled) {
        setInternalValue(newValue);
      }
      onChange?.(newValue);
    }, [isInteractive, allowClear, currentValue, isControlled, onChange]);

    // Handle hover
    const handleHover = useCallback((starValue: number | null) => {
      if (!isInteractive) return;
      setHoverValue(starValue);
      if (starValue !== null) {
        onHoverChange?.(starValue);
      } else {
        onHoverChange?.(0);
      }
    }, [isInteractive, onHoverChange]);

    // Handle keyboard navigation
    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
      if (!keyboard || !isInteractive) return;

      let newValue = currentValue || 0;
      const step = allowHalf ? 0.5 : 1;

      switch (e.key) {
        case 'ArrowRight':
        case 'ArrowUp':
          e.preventDefault();
          newValue = Math.min(count, newValue + step);
          break;
        case 'ArrowLeft':
        case 'ArrowDown':
          e.preventDefault();
          newValue = Math.max(0, newValue - step);
          break;
        case 'Home':
          e.preventDefault();
          newValue = 0;
          break;
        case 'End':
          e.preventDefault();
          newValue = count;
          break;
        default:
          return;
      }

      if (!isControlled) {
        setInternalValue(newValue);
      }
      onChange?.(newValue);
    }, [keyboard, isInteractive, currentValue, count, allowHalf, isControlled, onChange]);

    // Render custom or default character
    const renderCharacter = (index: number) => {
      if (typeof character === 'function') {
        return character({ index, value: displayValue || 0 } as RateCharacterProps);
      }
      if (character) {
        return character;
      }
      // Default star SVG
      return (
        <svg
          className="w-full h-full"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      );
    };

    // Get size in pixels for custom sizing
    const sizeValue = RATE_SIZE_MAP[size];

    // Build stars array
    const stars = Array.from({ length: count }, (_, index) => {
      const starIndex = index + 1;
      const isFilled = (displayValue || 0) >= starIndex;
      const isHalfFilled = allowHalf && (displayValue || 0) >= starIndex - 0.5 && (displayValue || 0) < starIndex;
      const isFocused = focusIndex === starIndex;

      return (
        <label
          key={index}
          className={`
            relative inline-flex items-center justify-center
            transition-all duration-200
            ${isFilled || isHalfFilled ? 'text-warning' : 'text-base-300'}
            ${isInteractive ? 'cursor-pointer hover:scale-110' : disabled ? 'cursor-not-allowed opacity-50' : 'cursor-default'}
            ${isFocused ? 'ring-2 ring-warning ring-offset-2' : ''}
          `}
          style={{
            width: `${sizeValue}px`,
            height: `${sizeValue}px`,
            color: isFilled || isHalfFilled
              ? activeColor || undefined
              : inactiveColor || undefined,
          }}
          title={tooltips?.[index]}
          onMouseEnter={() => handleHover(starIndex)}
          onMouseLeave={() => handleHover(null)}
          role="radio"
          aria-checked={isFilled}
          aria-label={tooltips?.[index] || `${starIndex} star${starIndex > 1 ? 's' : ''}`}
        >
          <input
            type="radio"
            name={`rating-${Math.random().toString(36).substr(2, 9)}`}
            className="hidden"
            value={starIndex}
            disabled={!isInteractive}
            onClick={() => handleClick(starIndex)}
            onChange={() => {}}
          />
          {/* Half star click area */}
          {allowHalf && (
            <span
              className="absolute left-0 top-0 w-1/2 h-full z-10"
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
          {/* Half star visual */}
          {isHalfFilled ? (
            <span className="relative inline-flex w-full h-full">
              <span
                className="absolute inset-0"
                style={{ color: inactiveColor || 'inherit' }}
              >
                {renderCharacter(index)}
              </span>
              <span
                className="absolute inset-0 overflow-hidden"
                style={{
                  width: '50%',
                  color: activeColor || 'inherit',
                }}
              >
                {renderCharacter(index)}
              </span>
            </span>
          ) : (
            renderCharacter(index)
          )}
        </label>
      );
    });

    // Combine DaisyUI classes
    const ratingClasses = [
      'rating',
      SIZE_CLASSES[size] || SIZE_CLASSES.md,
      'gap-1',
      className,
    ].filter(Boolean).join(' ');

    return (
      <div
        ref={(node) => {
          if (typeof ref === 'function') {
            ref(node);
          } else if (ref) {
            ref.current = node;
          }
          (containerRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
        }}
        className={ratingClasses}
        style={{
          direction,
          ...style,
        }}
        role="radiogroup"
        aria-label="Rating"
        aria-disabled={disabled}
        aria-readonly={readOnly}
        aria-valuenow={currentValue}
        aria-valuemin={0}
        aria-valuemax={count}
        tabIndex={isInteractive ? 0 : -1}
        onKeyDown={handleKeyDown}
        onFocus={() => setFocusIndex(Math.ceil(currentValue || 0.5))}
        onBlur={() => setFocusIndex(null)}
        data-testid="rate"
        {...restProps}
      >
        {stars}
      </div>
    );
  }
);

Rate.displayName = 'Rate.Hermes';

export default Rate;
