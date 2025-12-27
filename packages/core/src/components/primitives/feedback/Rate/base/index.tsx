/**
 * @fileoverview Rate Base Component - Rottay Design System
 * @description Base implementation for the Rate component using CSS variables.
 * Provides core rating functionality used by all engine implementations.
 *
 * @remarks
 * The BaseRate serves as the foundational implementation that:
 * - Provides core rating logic and state management
 * - Uses CSS variables for theming compatibility
 * - Implements full keyboard accessibility
 * - Can be used directly or extended by engine implementations
 *
 * **Important:** This is the base implementation. For full feature set,
 * use the Rate component with an engine:
 * - **Titan**: Full-featured with Ant Design styling
 * - **Hermes**: Utility-first with Tailwind/DaisyUI
 * - **Apollo**: Zero-dependency vanilla implementation
 *
 * **Multi-Tenant Integration:**
 * The base component fully respects tenant-specific CSS variables for:
 * - Star sizes (--rate-xs-size through --rate-xl-size)
 * - Active/inactive colors (--rate-star-active-color, --rate-star-inactive-color)
 * - Transitions and spacing
 *
 * @example Direct Usage
 * ```tsx
 * import { BaseRate } from '@rottay/design-system';
 *
 * <BaseRate
 *   defaultValue={3}
 *   count={5}
 *   allowHalf
 *   onChange={(value) => console.log('Rating:', value)}
 * />
 * ```
 *
 * @example Recommended Usage
 * ```tsx
 * import { Rate } from '@rottay/design-system';
 *
 * // Always prefer the main Rate export for engine support
 * <Rate defaultValue={3} allowHalf />
 * ```
 *
 * @see {@link RateProps} - Component props interface
 * @see {@link TitanRate} - Ant Design implementation
 * @see {@link HermesRate} - DaisyUI implementation
 * @see {@link ApolloRate} - Vanilla implementation
 * @module Rate/Base
 * @category Feedback
 * @package @rottay/design-system
 */

'use client';

import React, { forwardRef, useState, useCallback, useRef, useEffect } from 'react';
import type { RateProps, RateCharacterProps } from '../types';
import { RATE_DEFAULTS, RATE_SIZE_MAP } from '../types';

// ============================================================================
// Internal Components
// ============================================================================

/**
 * Default star icon SVG component.
 * Renders a five-pointed star with optional half-fill support.
 *
 * @internal
 * @param props - Star rendering options
 * @param props.filled - Whether the star is fully filled
 * @param props.half - Whether the star is half-filled
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

// ============================================================================
// Component
// ============================================================================

/**
 * Base Rate component using CSS variables.
 * This is extended by engine-specific implementations.
 *
 * @description
 * Provides a fully functional star rating component with:
 * - Controlled and uncontrolled state management
 * - Half-star rating support
 * - Keyboard navigation (Arrow keys, Home, End, Enter, Space)
 * - ARIA radiogroup accessibility semantics
 * - Custom character/icon support
 * - Hover state management with callbacks
 *
 * @remarks
 * **State Management:**
 * - Uses internal state for uncontrolled mode
 * - Respects `value` prop for controlled mode
 * - Hover value is always internal, exposed via `onHoverChange`
 *
 * **Accessibility:**
 * - Role: radiogroup
 * - Each star has role: radio
 * - Full keyboard support with focus management
 * - ARIA attributes for current value and bounds
 *
 * **CSS Classes:**
 * - `rottay-rate`: Base container class
 * - `rottay-rate--{size}`: Size modifier
 * - `rottay-rate--disabled`: Disabled state
 * - `rottay-rate--readonly`: Read-only state
 * - `rottay-rate__star`: Individual star element
 * - `rottay-rate__star--filled`: Filled star state
 * - `rottay-rate__star--half`: Half-filled star state
 *
 * @param props - {@link RateProps}
 * @param ref - Forwarded ref to the container div
 * @returns A star rating component with full interactivity
 */
export const BaseRate = forwardRef<HTMLDivElement, RateProps>(
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

    // -------------------------------------------------------------------------
    // State Management
    // -------------------------------------------------------------------------

    const isControlled = value !== undefined;
    const [internalValue, setInternalValue] = useState(defaultValue);
    const [hoverValue, setHoverValue] = useState<number | null>(null);
    const [focusIndex, setFocusIndex] = useState<number | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Derived values
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
     * Updates the rating value and triggers onChange callback.
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
     * Updates hover preview and triggers onHoverChange callback.
     */
    const handleMouseEnter = useCallback((starValue: number) => {
      if (!isInteractive) return;
      setHoverValue(starValue);
      onHoverChange?.(starValue);
    }, [isInteractive, onHoverChange]);

    /**
     * Handle mouse leave from container.
     * Clears hover state and notifies via callback.
     */
    const handleMouseLeave = useCallback(() => {
      if (!isInteractive) return;
      setHoverValue(null);
      onHoverChange?.(0);
    }, [isInteractive, onHoverChange]);

    /**
     * Handle keyboard navigation.
     * Supports Arrow keys, Home, End, Enter, and Space.
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
     * Render custom or default character for a star.
     */
    const renderCharacter = useCallback((index: number, filled: boolean, half: boolean) => {
      if (typeof character === 'function') {
        return character({ index, value: displayValue || 0 } as RateCharacterProps);
      }
      if (character) {
        return character;
      }
      return <StarIcon filled={filled} half={half} />;
    }, [character, displayValue]);

    // -------------------------------------------------------------------------
    // Styles
    // -------------------------------------------------------------------------

    // Build CSS variables for theming
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

    /**
     * Get styles for individual star element.
     */
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

    // -------------------------------------------------------------------------
    // Render Stars
    // -------------------------------------------------------------------------

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

    // -------------------------------------------------------------------------
    // Render
    // -------------------------------------------------------------------------

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

// Set display name for React DevTools debugging
BaseRate.displayName = 'BaseRate';

export default BaseRate;
