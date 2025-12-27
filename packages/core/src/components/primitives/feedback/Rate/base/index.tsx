'use client';

/**
 * Rate - Base Component
 * Uses CSS variables from design tokens for consistent styling
 * @module Rate/Base
 */

import React, { forwardRef, useState, useCallback, useRef, useEffect } from 'react';
import type { RateProps, RateCharacterProps } from '../types';
import { RATE_DEFAULTS, RATE_SIZE_MAP } from '../types';

/**
 * Default star icon SVG component
 */
const StarIcon: React.FC<{ filled?: boolean; half?: boolean }> = ({ filled, half }) => (
  <svg
    viewBox="0 0 24 24"
    fill={filled || half ? 'currentColor' : 'none'}
    stroke="currentColor"
    strokeWidth="1.5"
    style={{ width: '100%', height: '100%' }}
  >
    {half ? (
      <>
        <defs>
          <clipPath id="halfClip">
            <rect x="0" y="0" width="12" height="24" />
          </clipPath>
        </defs>
        <path
          d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
          fill="none"
          stroke="currentColor"
        />
        <path
          d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
          fill="currentColor"
          clipPath="url(#halfClip)"
        />
      </>
    ) : (
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    )}
  </svg>
);

/**
 * Base Rate component using CSS variables.
 * This is extended by engine-specific implementations.
 */
export const BaseRate = forwardRef<HTMLDivElement, RateProps>(
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
      style = {},
      tooltips,
      autoFocus,
      keyboard = RATE_DEFAULTS.keyboard,
      size = RATE_DEFAULTS.size,
      direction = RATE_DEFAULTS.direction,
      activeColor,
      inactiveColor,
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

    // Handle mouse enter on a star
    const handleMouseEnter = useCallback((starValue: number) => {
      if (!isInteractive) return;
      setHoverValue(starValue);
      onHoverChange?.(starValue);
    }, [isInteractive, onHoverChange]);

    // Handle mouse leave from container
    const handleMouseLeave = useCallback(() => {
      if (!isInteractive) return;
      setHoverValue(null);
      onHoverChange?.(0);
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
        case ' ':
        case 'Enter':
          e.preventDefault();
          if (focusIndex !== null) {
            handleClick(focusIndex);
            return;
          }
          break;
        default:
          return;
      }

      if (!isControlled) {
        setInternalValue(newValue);
      }
      onChange?.(newValue);
    }, [keyboard, isInteractive, currentValue, count, allowHalf, isControlled, onChange, focusIndex, handleClick]);

    // Render custom or default character
    const renderCharacter = useCallback((index: number, filled: boolean, half: boolean) => {
      if (typeof character === 'function') {
        return character({ index, value: displayValue || 0 } as RateCharacterProps);
      }
      if (character) {
        return character;
      }
      return <StarIcon filled={filled} half={half} />;
    }, [character, displayValue]);

    // Build CSS variables
    const starSize = RATE_SIZE_MAP[size];
    const rateVars: React.CSSProperties = {
      '--rate-size': starSize,
      '--rate-gap': 'var(--rate-gap, 0.25rem)',
      '--rate-active-color': activeColor || 'var(--rate-star-active-color, #facc15)',
      '--rate-inactive-color': inactiveColor || 'var(--rate-star-inactive-color, #d1d5db)',
      '--rate-transition': 'var(--rate-transition-duration, 0.2s)',
    } as React.CSSProperties;

    // Container styles
    const containerStyle: React.CSSProperties = {
      ...rateVars,
      display: 'inline-flex',
      alignItems: 'center',
      gap: 'var(--rate-gap)',
      direction: direction,
      ...style,
    };

    // Star container styles
    const getStarStyle = (isActive: boolean, isHovered: boolean): React.CSSProperties => ({
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: 'var(--rate-size)',
      height: 'var(--rate-size)',
      color: isActive ? 'var(--rate-active-color)' : 'var(--rate-inactive-color)',
      cursor: isInteractive ? 'pointer' : disabled ? 'not-allowed' : 'default',
      opacity: disabled ? 0.5 : 1,
      transition: 'transform var(--rate-transition), color var(--rate-transition)',
      transform: isHovered && isInteractive ? 'scale(1.1)' : 'scale(1)',
      position: 'relative',
    });

    // Render stars
    const stars = Array.from({ length: count }, (_, index) => {
      const starIndex = index + 1;
      const isFilled = (displayValue || 0) >= starIndex;
      const isHalfFilled = allowHalf && (displayValue || 0) >= starIndex - 0.5 && (displayValue || 0) < starIndex;
      const isHovered = hoverValue === starIndex || (allowHalf && hoverValue === starIndex - 0.5);
      const isFocused = focusIndex === starIndex;

      const starContent = (
        <span
          key={index}
          className={`rottay-rate__star ${isFilled ? 'rottay-rate__star--filled' : ''} ${isHalfFilled ? 'rottay-rate__star--half' : ''}`}
          style={{
            ...getStarStyle(isFilled || isHalfFilled, isHovered),
            outline: isFocused ? '2px solid var(--rate-active-color)' : 'none',
            outlineOffset: '2px',
            borderRadius: '2px',
          }}
          title={tooltips?.[index]}
          onMouseEnter={() => handleMouseEnter(starIndex)}
          onClick={() => handleClick(starIndex)}
          role="radio"
          aria-checked={isFilled}
          aria-label={tooltips?.[index] || `${starIndex} star${starIndex > 1 ? 's' : ''}`}
          aria-posinset={starIndex}
          aria-setsize={count}
          data-index={index}
        >
          {/* Half star overlay for allowHalf */}
          {allowHalf && (
            <span
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                width: '50%',
                height: '100%',
                zIndex: 1,
              }}
              onMouseEnter={(e) => {
                e.stopPropagation();
                handleMouseEnter(starIndex - 0.5);
              }}
              onClick={(e) => {
                e.stopPropagation();
                handleClick(starIndex - 0.5);
              }}
            />
          )}
          {renderCharacter(index, isFilled, isHalfFilled)}
        </span>
      );

      return starContent;
    });

    return (
      <div
        ref={(node) => {
          // Handle both refs
          if (typeof ref === 'function') {
            ref(node);
          } else if (ref) {
            ref.current = node;
          }
          (containerRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
        }}
        className={`rottay-rate rottay-rate--${size} ${disabled ? 'rottay-rate--disabled' : ''} ${readOnly ? 'rottay-rate--readonly' : ''} ${className}`}
        style={containerStyle}
        role="radiogroup"
        aria-label="Rating"
        aria-disabled={disabled}
        aria-readonly={readOnly}
        aria-valuenow={currentValue}
        aria-valuemin={0}
        aria-valuemax={count}
        tabIndex={isInteractive ? 0 : -1}
        onKeyDown={handleKeyDown}
        onMouseLeave={handleMouseLeave}
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

BaseRate.displayName = 'BaseRate';

export default BaseRate;
