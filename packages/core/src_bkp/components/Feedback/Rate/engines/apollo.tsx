/**
 * Apollo Rate Engine
 *
 * Native HTML + Tailwind CSS star rating implementation.
 * Implements unified RateProps interface with custom star rendering.
 */

'use client';

import { useState, useEffect, useRef, forwardRef } from 'react';
import type { RateProps } from '../../../../types/components/rate';
import { normalizeRating, calculateRatingFromPosition, getTooltipText } from '../../../../types/components/rate';

// Utility function for classNames
function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

/**
 * Base star container styles
 */
const starContainerStyles = `
  inline-flex items-center gap-1
  select-none
`;

/**
 * Individual star styles
 */
const starStyles = `
  cursor-pointer
  transition-colors duration-200
  relative
  inline-block
`;

/**
 * Disabled star styles
 */
const disabledStyles = `
  cursor-not-allowed
  opacity-50
`;

/**
 * Size mapping for stars
 */
const sizeMap = {
  xs: 'text-base',
  sm: 'text-lg',
  md: 'text-2xl',
  lg: 'text-3xl',
};

/**
 * Star icon component with half-star support
 */
interface StarIconProps {
  filled: number; // 0 = empty, 0.5 = half, 1 = full
  character?: React.ReactNode;
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
}

function StarIcon({ filled, character, className, size = 'md' }: StarIconProps) {
  const sizeClass = sizeMap[size];

  // Use custom character if provided (string/emoji only for apollo)
  const displayChar = typeof character === 'string' ? character : '★';

  if (filled === 0) {
    // Empty star
    return (
      <span className={cn(sizeClass, 'text-gray-300', className)}>
        {displayChar}
      </span>
    );
  }

  if (filled === 0.5) {
    // Half star - use gradient
    return (
      <span className={cn(sizeClass, 'relative', className)} style={{ color: 'transparent' }}>
        <span className="absolute inset-0 text-gray-300">{displayChar}</span>
        <span
          className="absolute inset-0 text-yellow-400 overflow-hidden"
          style={{ width: '50%' }}
        >
          {displayChar}
        </span>
      </span>
    );
  }

  // Full star
  return (
    <span className={cn(sizeClass, 'text-yellow-400', className)}>
      {displayChar}
    </span>
  );
}

/**
 * Apollo Rate - Native HTML + Tailwind implementation
 */
const ApolloRate = forwardRef<HTMLDivElement, RateProps>(
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

    // Handle star click
    const handleClick = (starIndex: number, event: React.MouseEvent<HTMLSpanElement>) => {
      if (disabled) return;

      const rect = event.currentTarget.getBoundingClientRect();
      const newValue = calculateRatingFromPosition(rect, event.clientX, starIndex, allowHalf);
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

    // Handle star hover
    const handleMouseEnter = (starIndex: number, event: React.MouseEvent<HTMLSpanElement>) => {
      if (disabled) return;

      const rect = event.currentTarget.getBoundingClientRect();
      const newValue = calculateRatingFromPosition(rect, event.clientX, starIndex, allowHalf);
      const normalizedValue = normalizeRating(newValue, count, allowHalf);

      setHoverValue(normalizedValue);
      onHoverChange?.(normalizedValue);
    };

    // Handle mouse move within star (for half-star hover updates)
    const handleMouseMove = (starIndex: number, event: React.MouseEvent<HTMLSpanElement>) => {
      if (disabled || !allowHalf) return;

      const rect = event.currentTarget.getBoundingClientRect();
      const newValue = calculateRatingFromPosition(rect, event.clientX, starIndex, allowHalf);
      const normalizedValue = normalizeRating(newValue, count, allowHalf);

      if (normalizedValue !== hoverValue) {
        setHoverValue(normalizedValue);
        onHoverChange?.(normalizedValue);
      }
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

    // Render stars
    const stars = Array.from({ length: count }, (_, index) => {
      const starIndex = index + 1;
      let filled = 0;

      if (displayValue >= starIndex) {
        filled = 1;
      } else if (displayValue > index && displayValue < starIndex) {
        filled = 0.5;
      }

      const tooltip = getTooltipText(tooltips, starIndex);

      return (
        <span
          key={index}
          className={cn(starStyles, disabled && disabledStyles)}
          onClick={(e) => handleClick(starIndex, e)}
          onMouseEnter={(e) => handleMouseEnter(starIndex, e)}
          onMouseMove={(e) => handleMouseMove(starIndex, e)}
          title={tooltip}
          role="radio"
          aria-checked={currentValue === starIndex}
          aria-label={tooltip ?? `${starIndex} star${starIndex > 1 ? 's' : ''}`}
        >
          <StarIcon filled={filled} character={character} size={size} />
        </span>
      );
    });

    return (
      <div
        ref={ref}
        id={id}
        className={cn(starContainerStyles, disabled && disabledStyles, className)}
        style={style}
        onMouseLeave={handleMouseLeave}
        onKeyDown={handleKeyDown}
        tabIndex={disabled ? undefined : (tabIndex ?? 0)}
        role="radiogroup"
        aria-label="Rating"
        aria-disabled={disabled}
      >
        {stars}
      </div>
    );
  }
);

ApolloRate.displayName = 'ApolloRate';

export default ApolloRate;
