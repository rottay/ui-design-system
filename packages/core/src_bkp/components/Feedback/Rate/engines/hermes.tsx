/**
 * Hermes Rate Engine
 *
 * DaisyUI rating implementation with adapter for unified props.
 * Uses DaisyUI's rating component with custom styling and interactions.
 */

'use client';

import { useState, useEffect, useRef, forwardRef } from 'react';
import type { RateProps } from '../../../../types/components/rate';
import { normalizeRating, getTooltipText } from '../../../../types/components/rate';

// Utility function for classNames
function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

/**
 * Map unified size to DaisyUI rating size class
 */
function getSizeClass(size?: 'xs' | 'sm' | 'md' | 'lg'): string {
  switch (size) {
    case 'xs':
      return 'rating-xs';
    case 'sm':
      return 'rating-sm';
    case 'lg':
      return 'rating-lg';
    case 'md':
    default:
      return 'rating-md';
  }
}

/**
 * Map unified color to DaisyUI color class
 */
function getColorClass(
  color?: 'primary' | 'secondary' | 'accent' | 'warning' | 'info' | 'success' | 'error'
): string {
  if (!color) return 'text-warning'; // Default to warning (yellow/gold)

  // Map to DaisyUI color classes
  const colorMap = {
    primary: 'text-primary',
    secondary: 'text-secondary',
    accent: 'text-accent',
    warning: 'text-warning',
    info: 'text-info',
    success: 'text-success',
    error: 'text-error',
  };

  return colorMap[color] ?? 'text-warning';
}

/**
 * Hermes Rate - DaisyUI implementation with unified RateProps
 */
const HermesRate = forwardRef<HTMLDivElement, RateProps>(
  (
    {
      value,
      defaultValue = 0,
      onChange,
      count = 5,
      disabled = false,
      allowHalf = false,
      allowClear = true,
      character,
      tooltips,
      onHoverChange,
      autoFocus,
      tabIndex,
      id,
      className,
      style,
      size = 'md',
      color,
    },
    forwardedRef
  ) => {
    // Internal state for uncontrolled mode
    const [internalValue, setInternalValue] = useState(defaultValue);
    const [hoverValue, setHoverValue] = useState<number | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const ref = (forwardedRef ?? containerRef) as React.RefObject<HTMLDivElement>;

    // Use controlled value if provided, otherwise use internal state
    const currentValue = value !== undefined ? value : internalValue;
    const displayValue = hoverValue ?? currentValue;

    // Handle auto focus
    useEffect(() => {
      if (autoFocus && ref.current) {
        ref.current.focus();
      }
    }, [autoFocus, ref]);

    // Handle rating change
    const handleRatingChange = (newValue: number) => {
      if (disabled) return;

      const normalizedValue = normalizeRating(newValue, count, allowHalf);

      // Allow clearing if clicking same value and allowClear is true
      const finalValue = allowClear && normalizedValue === currentValue ? 0 : normalizedValue;

      // Update internal state for uncontrolled mode
      if (value === undefined) {
        setInternalValue(finalValue);
      }

      // Call onChange handler
      onChange?.(finalValue);
    };

    // Handle star click
    const handleStarClick = (starIndex: number) => {
      handleRatingChange(starIndex);
    };

    // Handle half-star click
    const handleHalfStarClick = (starIndex: number) => {
      handleRatingChange(starIndex - 0.5);
    };

    // Handle hover
    const handleStarHover = (starValue: number) => {
      if (disabled) return;
      setHoverValue(starValue);
      onHoverChange?.(starValue);
    };

    // Handle mouse leave
    const handleMouseLeave = () => {
      if (disabled) return;
      setHoverValue(null);
      onHoverChange?.(0);
    };

    // Handle keyboard navigation
    const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (disabled) return;

      let newValue = currentValue;

      switch (event.key) {
        case 'ArrowRight':
        case 'ArrowUp':
          event.preventDefault();
          newValue = Math.min(currentValue + (allowHalf ? 0.5 : 1), count);
          break;
        case 'ArrowLeft':
        case 'ArrowDown':
          event.preventDefault();
          newValue = Math.max(currentValue - (allowHalf ? 0.5 : 1), 0);
          break;
        case 'Home':
          event.preventDefault();
          newValue = allowHalf ? 0.5 : 1;
          break;
        case 'End':
          event.preventDefault();
          newValue = count;
          break;
        default:
          return;
      }

      if (value === undefined) {
        setInternalValue(newValue);
      }
      onChange?.(newValue);
    };

    const sizeClass = getSizeClass(size);
    const colorClass = getColorClass(color);

    // Use custom character if provided (string/emoji only for hermes)
    const displayChar = typeof character === 'string' ? character : '★';

    // Build rating inputs
    const ratingInputs = [];

    // Add hidden input for 0 rating (clear option)
    if (allowClear) {
      ratingInputs.push(
        <input
          key="clear"
          type="radio"
          name={`rating-${id}`}
          className="rating-hidden"
          checked={displayValue === 0}
          onChange={() => handleRatingChange(0)}
          disabled={disabled}
          aria-label="Clear rating"
        />
      );
    }

    // Generate star inputs
    for (let i = 1; i <= count; i++) {
      const tooltip = getTooltipText(tooltips, i);

      if (allowHalf) {
        // Half star (left side)
        const isHalfSelected = displayValue === i - 0.5;
        ratingInputs.push(
          <input
            key={`${i}-half`}
            type="radio"
            name={`rating-${id}`}
            className={cn('mask mask-star-2 mask-half-1 bg-current', colorClass)}
            checked={isHalfSelected}
            onChange={() => handleHalfStarClick(i)}
            onMouseEnter={() => handleStarHover(i - 0.5)}
            disabled={disabled}
            title={tooltip}
            aria-label={`${i - 0.5} stars`}
          />
        );

        // Full star (right side)
        const isFullSelected = displayValue >= i;
        ratingInputs.push(
          <input
            key={`${i}-full`}
            type="radio"
            name={`rating-${id}`}
            className={cn('mask mask-star-2 mask-half-2 bg-current', colorClass)}
            checked={isFullSelected}
            onChange={() => handleStarClick(i)}
            onMouseEnter={() => handleStarHover(i)}
            disabled={disabled}
            title={tooltip}
            aria-label={`${i} stars`}
          />
        );
      } else {
        // Full star only
        const isSelected = displayValue >= i;
        ratingInputs.push(
          <input
            key={i}
            type="radio"
            name={`rating-${id}`}
            className={cn('mask mask-star-2 bg-current', colorClass)}
            checked={isSelected}
            onChange={() => handleStarClick(i)}
            onMouseEnter={() => handleStarHover(i)}
            disabled={disabled}
            title={tooltip}
            aria-label={`${i} star${i > 1 ? 's' : ''}`}
          />
        );
      }
    }

    return (
      <div
        ref={ref}
        id={id}
        className={cn('rating gap-1', sizeClass, disabled && 'opacity-50 cursor-not-allowed', className)}
        style={style}
        onMouseLeave={handleMouseLeave}
        onKeyDown={handleKeyDown}
        tabIndex={disabled ? undefined : (tabIndex ?? 0)}
        role="radiogroup"
        aria-label="Rating"
        aria-disabled={disabled}
      >
        {ratingInputs}
      </div>
    );
  }
);

HermesRate.displayName = 'HermesRate';

export default HermesRate;
