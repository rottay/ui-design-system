/**
 * @fileoverview Rate Rustic Engine - Rottay Design System
 * @description Pure HTML/CSS implementation of the Rate component.
 * Zero-dependency engine with maximum accessibility and customization.
 *
 * @remarks
 * **Engine Overview:**
 * Rustic is the vanilla engine in the Rottay Design System, built with
 * pure HTML and CSS. It provides:
 * - Zero external dependencies
 * - Maximum accessibility compliance
 * - Full customization via inline styles
 * - Smallest possible bundle footprint
 * - Works in any React environment
 *
 * **When to Use Rustic:**
 * - When minimizing bundle size is critical
 * - Projects without Ant Design or Tailwind
 * - When you need maximum styling control
 * - Accessibility-focused applications
 * - Server-side rendering optimization
 *
 * **Multi-Tenant Theming:**
 * Rustic rates use inline styles that can be customized via:
 * - Direct prop values (activeColor, inactiveColor)
 * - CSS variables defined in tenant themes
 * - Style prop for complete override
 *
 * **Accessibility Features:**
 * - Full ARIA radiogroup semantics
 * - Keyboard navigation (Arrow keys, Home, End, Enter, Space)
 * - Focus management with visible indicators
 * - Screen reader announcements
 *
 * @example Basic Usage
 * ```tsx
 * import { Rate } from '@rottay/design-system';
 *
 * <Rate engine="rustic" defaultValue={3} />
 * ```
 *
 * @example Custom Styling
 * ```tsx
 * <Rate
 *   engine="rustic"
 *   defaultValue={3}
 *   activeColor="#ff6b6b"
 *   inactiveColor="#e0e0e0"
 *   size="lg"
 * />
 * ```
 *
 * @example Accessible Usage
 * ```tsx
 * <Rate
 *   engine="rustic"
 *   defaultValue={3}
 *   tooltips={['Poor', 'Fair', 'Good', 'Very Good', 'Excellent']}
 *   aria-labelledby="rating-label"
 * />
 * ```
 *
 * @see {@link RateProps} - Component props interface
 * @see {@link ClassicRate} - Ant Design alternative
 * @see {@link ModernRate} - DaisyUI alternative
 * @module Rate/Engines/Rustic
 * @category Feedback
 * @package @rottay/design-system
 */

'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import type { RateProps, RateCharacterProps } from '../Rate.types';
import { RATE_DEFAULTS, RATE_SIZE_MAP } from '../Rate.types';

// ============================================================================
// Styles Factory
// ============================================================================

/**
 * Create inline styles for the Rustic Rate component.
 * All styles are computed at render time for maximum flexibility.
 *
 * @internal
 * @param size - The size preset to use
 * @param activeColor - Color for filled stars
 * @param inactiveColor - Color for empty stars
 * @returns Object containing all style definitions
 */
const createStyles = (
  size: keyof typeof RATE_SIZE_MAP,
  activeColor?: string,
  inactiveColor?: string
) => {
  const sizeValue = RATE_SIZE_MAP[size];

  return {
    /** Container styles */
    container: {
      display: 'inline-flex',
      gap: 'var(--ds-rate-gap, 0.25rem)',
      alignItems: 'center',
    } as React.CSSProperties,

    /** Star element styles */
    star: {
      /** Base star styles */
      base: {
        cursor: 'pointer',
        transition: 'transform 0.15s ease, color 0.15s ease',
        position: 'relative' as const,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: sizeValue,
        height: sizeValue,
        lineHeight: 1,
        userSelect: 'none' as const,
        borderRadius: '2px',
      },
      /** Active (filled) star color */
      active: {
        color: activeColor || 'var(--ds-rate-active-color, #facc15)',
      },
      /** Inactive (empty) star color */
      inactive: {
        color: inactiveColor || 'var(--ds-rate-inactive-color, #d1d5db)',
      },
      /** Disabled state styles */
      disabled: {
        cursor: 'not-allowed',
        opacity: 0.5,
      },
      /** Read-only state styles */
      readOnly: {
        cursor: 'default',
      },
      /** Hover state transform */
      hover: {
        transform: 'scale(1.1)',
      },
      /** Focus indicator styles */
      focus: {
        outline: `2px solid ${activeColor || 'var(--ds-rate-active-color, #facc15)'}`,
        outlineOffset: '2px',
      },
    },

    /** Half star overlay styles */
    halfStar: {
      position: 'absolute' as const,
      left: 0,
      top: 0,
      width: '50%',
      height: '100%',
      overflow: 'hidden',
    },

    /** Half star click area styles */
    halfClickArea: {
      position: 'absolute' as const,
      left: 0,
      top: 0,
      width: '50%',
      height: '100%',
      zIndex: 1,
    },

    /** Hidden input styles */
    input: {
      position: 'absolute' as const,
      opacity: 0,
      width: 0,
      height: 0,
      pointerEvents: 'none' as const,
    },
  };
};

// ============================================================================
// Component
// ============================================================================

/**
 * Rustic Engine implementation of the Rate component.
 *
 * @description
 * Pure HTML/CSS implementation providing a zero-dependency rating component.
 * Maximum accessibility and customization with minimal bundle impact.
 *
 * @remarks
 * **Key Features:**
 * - No external CSS or component libraries
 * - All styles computed inline
 * - Full keyboard navigation support
 * - ARIA radiogroup semantics
 * - Half-star support via overlay technique
 *
 * **Implementation Notes:**
 * - Uses span elements for stars (semantic role="radio")
 * - Custom SVG for star icon
 * - Focus management with visible outline
 * - Data attributes for testing and styling hooks
 *
 * **Data Attributes:**
 * - `data-testid="rate"`: Container test ID
 * - `data-index`: Star index (0-based)
 * - `data-filled`: Whether star is filled
 * - `data-half`: Whether star is half-filled
 *
 * @param props - {@link RateProps}
 * @param ref - Forwarded ref to the container div
 * @returns The rendered vanilla HTML/CSS Rate component
 *
 * @example
 * ```tsx
 * <RusticRate
 *   defaultValue={3}
 *   allowHalf
 *   count={5}
 *   activeColor="#facc15"
 *   inactiveColor="#d1d5db"
 *   onChange={(value) => console.log('Selected:', value)}
 * />
 * ```
 */
export const Rate = React.forwardRef<HTMLDivElement, RateProps>(
  (props, ref) => {
    // -------------------------------------------------------------------------
    // Props Destructuring
    // -------------------------------------------------------------------------

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

    // -------------------------------------------------------------------------
    // Styles
    // -------------------------------------------------------------------------

    const styles = createStyles(size, activeColor, inactiveColor);

    // -------------------------------------------------------------------------
    // State Management
    // -------------------------------------------------------------------------

    // Controlled vs uncontrolled pattern: the parent decides ownership
    // by passing (or omitting) the `value` prop
    const isControlled = value !== undefined;
    const [internalValue, setInternalValue] = useState(defaultValue);
    const [hoverValue, setHoverValue] = useState<number | null>(null);
    const [focusIndex, setFocusIndex] = useState<number | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // displayValue prefers hoverValue so the visual feedback updates
    // immediately on mouseover before the user commits a selection
    const currentValue = isControlled ? value : internalValue;
    const displayValue = hoverValue !== null ? hoverValue : currentValue;
    const isInteractive = !disabled && !readOnly;

    // -------------------------------------------------------------------------
    // Effects
    // -------------------------------------------------------------------------

    /**
     * Auto focus on mount if requested.
     */
    useEffect(() => {
      if (autoFocus && containerRef.current) {
        containerRef.current.focus();
      }
    }, [autoFocus]);

    // -------------------------------------------------------------------------
    // Event Handlers
    // -------------------------------------------------------------------------

    /**
     * Handle click on a star.
     */
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

    /**
     * Handle mouse enter on a star.
     */
    const handleMouseEnter = useCallback((starValue: number) => {
      if (!isInteractive) return;
      setHoverValue(starValue);
      onHoverChange?.(starValue);
    }, [isInteractive, onHoverChange]);

    /**
     * Handle mouse leave from container.
     */
    const handleMouseLeave = useCallback(() => {
      if (!isInteractive) return;
      setHoverValue(null);
      onHoverChange?.(0);
    }, [isInteractive, onHoverChange]);

    /**
     * Handle keyboard navigation.
     */
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

    // -------------------------------------------------------------------------
    // Render Helpers
    // -------------------------------------------------------------------------

    /**
     * Render custom or default character.
     */
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
          viewBox="0 0 24 24"
          fill="currentColor"
          style={{ width: '100%', height: '100%' }}
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      );
    };

    // -------------------------------------------------------------------------
    // Render Stars
    // -------------------------------------------------------------------------

    const stars = Array.from({ length: count }, (_, index) => {
      const starIndex = index + 1;
      const isFilled = (displayValue || 0) >= starIndex;
      const isHalfFilled = allowHalf && (displayValue || 0) >= starIndex - 0.5 && (displayValue || 0) < starIndex;
      const isHovered = hoverValue === starIndex || (allowHalf && hoverValue === starIndex - 0.5);
      const isFocused = focusIndex === starIndex;

      // Style merging follows a specificity cascade: base -> color -> state.
      // Later spreads override earlier ones, so hover/focus take priority.
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
          // posinset/setsize inform screen readers of the star's position
          // within the group, enabling "star 3 of 5" announcements
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

    // -------------------------------------------------------------------------
    // Render
    // -------------------------------------------------------------------------

    return (
      <div
        // Merge forwarded ref with internal ref so autoFocus and keyboard
        // navigation logic can access the container DOM node
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

// Set display name for React DevTools debugging
Rate.displayName = 'Rate.Rustic';

export default Rate;
