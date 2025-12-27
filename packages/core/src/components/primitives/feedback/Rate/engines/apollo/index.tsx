'use client';

/**
 * Rate - Apollo Engine (Vanilla HTML/CSS)
 * Pure HTML/CSS implementation with maximum accessibility
 * @module Rate/Engines/Apollo
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import type { RateProps, RateCharacterProps } from '../../types';
import { RATE_DEFAULTS, RATE_SIZE_MAP } from '../../types';

/**
 * Inline styles for the Apollo Rate component
 */
const createStyles = (
  size: keyof typeof RATE_SIZE_MAP,
  activeColor?: string,
  inactiveColor?: string
) => {
  const sizeValue = RATE_SIZE_MAP[size];
  const gap = Math.max(4, sizeValue / 6);

  return {
    container: {
      display: 'inline-flex',
      gap: `${gap}px`,
      alignItems: 'center',
    } as React.CSSProperties,
    star: {
      base: {
        cursor: 'pointer',
        transition: 'transform 0.15s ease, color 0.15s ease',
        position: 'relative' as const,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: `${sizeValue}px`,
        height: `${sizeValue}px`,
        lineHeight: 1,
        userSelect: 'none' as const,
        borderRadius: '2px',
      },
      active: {
        color: activeColor || '#facc15',
      },
      inactive: {
        color: inactiveColor || '#d1d5db',
      },
      disabled: {
        cursor: 'not-allowed',
        opacity: 0.5,
      },
      readOnly: {
        cursor: 'default',
      },
      hover: {
        transform: 'scale(1.1)',
      },
      focus: {
        outline: `2px solid ${activeColor || '#facc15'}`,
        outlineOffset: '2px',
      },
    },
    halfStar: {
      position: 'absolute' as const,
      left: 0,
      top: 0,
      width: '50%',
      height: '100%',
      overflow: 'hidden',
    },
    halfClickArea: {
      position: 'absolute' as const,
      left: 0,
      top: 0,
      width: '50%',
      height: '100%',
      zIndex: 1,
    },
    input: {
      position: 'absolute' as const,
      opacity: 0,
      width: 0,
      height: 0,
      pointerEvents: 'none' as const,
    },
  };
};

/**
 * Apollo Rate component using vanilla HTML/CSS
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

    const styles = createStyles(size, activeColor, inactiveColor);

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
    const renderCharacter = (index: number) => {
      if (typeof character === 'function') {
        return character({ index, value: displayValue || 0 } as RateCharacterProps);
      }
      if (character) {
        return character;
      }
      // Default star character
      return (
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          style={{ width: '100%', height: '100%' }}
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      );
    };

    // Build stars array
    const stars = Array.from({ length: count }, (_, index) => {
      const starIndex = index + 1;
      const isFilled = (displayValue || 0) >= starIndex;
      const isHalfFilled = allowHalf && (displayValue || 0) >= starIndex - 0.5 && (displayValue || 0) < starIndex;
      const isHovered = hoverValue === starIndex || (allowHalf && hoverValue === starIndex - 0.5);
      const isFocused = focusIndex === starIndex;

      // Compute star style
      const starStyle: React.CSSProperties = {
        ...styles.star.base,
        ...(isFilled || isHalfFilled ? styles.star.active : styles.star.inactive),
        ...(disabled ? styles.star.disabled : {}),
        ...(readOnly ? styles.star.readOnly : {}),
        ...(isHovered && isInteractive ? styles.star.hover : {}),
        ...(isFocused ? styles.star.focus : {}),
      };

      return (
        <span
          key={index}
          style={starStyle}
          title={tooltips?.[index]}
          onMouseEnter={() => handleMouseEnter(starIndex)}
          onMouseLeave={handleMouseLeave}
          onClick={() => handleClick(starIndex)}
          role="radio"
          aria-checked={isFilled}
          aria-label={tooltips?.[index] || `${starIndex} star${starIndex > 1 ? 's' : ''}`}
          aria-posinset={starIndex}
          aria-setsize={count}
          data-index={index}
          data-filled={isFilled}
          data-half={isHalfFilled}
        >
          {/* Half star click area */}
          {allowHalf && (
            <span
              style={styles.halfClickArea}
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
          {/* Render star with half support */}
          {isHalfFilled ? (
            <span style={{ position: 'relative', display: 'inline-flex', width: '100%', height: '100%' }}>
              {/* Background (inactive) star */}
              <span style={{ position: 'absolute', inset: 0, ...styles.star.inactive }}>
                {renderCharacter(index)}
              </span>
              {/* Foreground (active) half star */}
              <span style={{ ...styles.halfStar, ...styles.star.active }}>
                {renderCharacter(index)}
              </span>
            </span>
          ) : (
            renderCharacter(index)
          )}
        </span>
      );
    });

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
        className={`rottay-rate rottay-rate--${size} ${disabled ? 'rottay-rate--disabled' : ''} ${readOnly ? 'rottay-rate--readonly' : ''} ${className}`}
        style={{ ...styles.container, direction, ...style }}
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

Rate.displayName = 'Rate.Apollo';

export default Rate;
