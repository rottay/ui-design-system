'use client';

/**
 * Rate - Apollo Engine (Vanilla HTML/CSS)
 */
import React, { useState, useCallback, useRef, useEffect } from 'react';
import type { RateProps } from '../../types';
import { RATE_DEFAULTS } from '../../types';

const styles = {
  container: {
    display: 'inline-flex',
    gap: '4px',
    alignItems: 'center',
  } as React.CSSProperties,
  star: {
    base: {
      cursor: 'pointer',
      transition: 'transform 0.1s, color 0.2s',
      position: 'relative' as const,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '24px',
      lineHeight: 1,
      userSelect: 'none' as const,
    },
    active: {
      color: '#fadb14',
    },
    inactive: {
      color: '#e8e8e8',
    },
    disabled: {
      cursor: 'not-allowed',
      opacity: 0.5,
    },
    hover: {
      transform: 'scale(1.1)',
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
  input: {
    position: 'absolute' as const,
    opacity: 0,
    width: 0,
    height: 0,
    pointerEvents: 'none' as const,
  },
};

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
      autoFocus,
      keyboard = RATE_DEFAULTS.keyboard,
    } = props;

    const isControlled = value !== undefined;
    const [internalValue, setInternalValue] = useState(defaultValue || 0);
    const [hoverValue, setHoverValue] = useState<number | null>(null);
    const [_focusIndex, setFocusIndex] = useState<number | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const currentValue = isControlled ? value : internalValue;
    const displayValue = hoverValue !== null ? hoverValue : currentValue;

    useEffect(() => {
      if (autoFocus && containerRef.current) {
        containerRef.current.focus();
      }
    }, [autoFocus]);

    const handleClick = useCallback((starValue: number) => {
      if (disabled) return;

      let newValue = starValue;

      if (allowClear && starValue === currentValue) {
        newValue = 0;
      }

      if (!isControlled) {
        setInternalValue(newValue);
      }
      onChange?.(newValue);
    }, [disabled, allowClear, currentValue, isControlled, onChange]);

    const handleMouseEnter = useCallback((starValue: number) => {
      if (disabled) return;
      setHoverValue(starValue);
      onHoverChange?.(starValue);
    }, [disabled, onHoverChange]);

    const handleMouseLeave = useCallback(() => {
      if (disabled) return;
      setHoverValue(null);
    }, [disabled]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
      if (!keyboard || disabled) return;

      let newValue = currentValue || 0;

      switch (e.key) {
        case 'ArrowRight':
        case 'ArrowUp':
          e.preventDefault();
          newValue = Math.min(count!, newValue + (allowHalf ? 0.5 : 1));
          break;
        case 'ArrowLeft':
        case 'ArrowDown':
          e.preventDefault();
          newValue = Math.max(0, newValue - (allowHalf ? 0.5 : 1));
          break;
        case 'Home':
          e.preventDefault();
          newValue = 0;
          break;
        case 'End':
          e.preventDefault();
          newValue = count!;
          break;
        default:
          return;
      }

      if (!isControlled) {
        setInternalValue(newValue);
      }
      onChange?.(newValue);
    }, [keyboard, disabled, currentValue, count, allowHalf, isControlled, onChange]);

    const renderCharacter = (index: number) => {
      if (typeof character === 'function') {
        return character({ index, value: displayValue || 0 });
      }
      if (character) {
        return character;
      }
      return '★';
    };

    const stars = Array.from({ length: count! }, (_, index) => {
      const starIndex = index + 1;
      const isFilled = displayValue! >= starIndex;
      const isHalfFilled = allowHalf && displayValue! >= starIndex - 0.5 && displayValue! < starIndex;
      const isHovered = hoverValue === starIndex || (allowHalf && hoverValue === starIndex - 0.5);

      const starStyle: React.CSSProperties = {
        ...styles.star.base,
        ...(isFilled || isHalfFilled ? styles.star.active : styles.star.inactive),
        ...(disabled ? styles.star.disabled : {}),
        ...(isHovered && !disabled ? styles.star.hover : {}),
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
          aria-label={`${starIndex} star${starIndex > 1 ? 's' : ''}`}
        >
          {allowHalf && (
            <span
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                width: '50%',
                height: '100%',
                overflow: 'hidden',
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
          {isHalfFilled ? (
            <span style={{ position: 'relative', display: 'inline-block' }}>
              <span style={{ color: '#e8e8e8' }}>{renderCharacter(index)}</span>
              <span style={{ ...styles.halfStar, color: '#fadb14' }}>{renderCharacter(index)}</span>
            </span>
          ) : (
            <span style={{ color: isFilled ? '#fadb14' : '#e8e8e8' }}>
              {renderCharacter(index)}
            </span>
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
        className={className}
        style={{ ...styles.container, ...style }}
        role="radiogroup"
        aria-label="Rating"
        tabIndex={disabled ? -1 : 0}
        onKeyDown={handleKeyDown}
        onFocus={() => setFocusIndex(Math.ceil(currentValue || 0.5))}
        onBlur={() => setFocusIndex(null)}
      >
        {stars}
      </div>
    );
  }
);

Rate.displayName = 'Rate.Apollo';

export default Rate;
