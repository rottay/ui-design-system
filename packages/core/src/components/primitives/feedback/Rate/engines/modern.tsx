/**
 * @fileoverview Rate Modern Engine - Rottay Design System
 * @description DaisyUI/Tailwind implementation of the Rate component.
 * Utility-first styling for modern, lightweight applications.
 *
 * @remarks
 * **Engine Overview:**
 * Modern is the utility-first engine in the Rottay Design System, built on
 * DaisyUI and Tailwind CSS. It provides:
 * - DaisyUI rating component classes
 * - Tailwind utility-based styling
 * - Smaller bundle size than Classic
 * - Consistent with Tailwind design patterns
 *
 * **When to Use Modern:**
 * - Projects using Tailwind CSS
 * - Applications prioritizing bundle size
 * - When you prefer utility-first styling
 * - Modern, lightweight applications
 *
 * **Multi-Tenant Theming:**
 * Modern rates use DaisyUI theme variables and Tailwind configuration,
 * allowing per-tenant customization through theme configuration.
 *
 * **DaisyUI Rating Classes:**
 * | Size | DaisyUI Class |
 * |------|---------------|
 * | xs | rating-xs |
 * | sm | rating-sm |
 * | md | rating-md |
 * | lg | rating-lg |
 * | xl | rating-lg (fallback) |
 *
 * @example Basic Usage
 * ```tsx
 * import { Rate } from '@rottay/design-system';
 *
 * <Rate engine="modern" defaultValue={3} />
 * ```
 *
 * @example With DaisyUI Theming
 * ```tsx
 * // Uses DaisyUI's warning color for active stars by default
 * <Rate engine="modern" defaultValue={4} allowHalf />
 * ```
 *
 * @example Custom Styling
 * ```tsx
 * <Rate
 *   engine="modern"
 *   defaultValue={3}
 *   activeColor="#ff4d4f"
 *   className="custom-rating"
 * />
 * ```
 *
 * @see {@link RateProps} - Component props interface
 * @see {@link ClassicRate} - Ant Design alternative
 * @see {@link RusticRate} - Vanilla alternative
 * @see {@link https://daisyui.com/components/rating/} - DaisyUI Rating docs
 * @module Rate/Engines/Modern
 * @category Feedback
 * @package @rottay/design-system
 */

'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import type { RateProps, RateCharacterProps } from '../Rate.types';
import { RATE_DEFAULTS, RATE_SIZE_MAP } from '../Rate.types';

// ============================================================================
// Constants
// ============================================================================

/**
 * Map design system sizes to DaisyUI/Tailwind classes.
 * Note: DaisyUI doesn't have an 'xl' size, so we fall back to 'lg'.
 *
 * @internal
 */
const SIZE_CLASSES: Record<string, string> = {
  /** Extra small rating */
  xs: 'rating-xs',
  /** Small rating */
  sm: 'rating-sm',
  /** Medium rating (default) */
  md: 'rating-md',
  /** Large rating */
  lg: 'rating-lg',
  /** Extra large - falls back to large */
  xl: 'rating-lg',
};

// ============================================================================
// Component
// ============================================================================

/**
 * Modern Engine implementation of the Rate component.
 *
 * @description
 * Custom implementation using DaisyUI rating classes and Tailwind utilities.
 * Provides a lightweight rating component with utility-first styling.
 *
 * @remarks
 * **Key Features:**
 * - DaisyUI rating class integration
 * - Tailwind utility-based styling
 * - Custom half-star support
 * - Full keyboard navigation
 * - Responsive design support
 *
 * **Implementation Notes:**
 * - Uses hidden radio inputs for accessibility
 * - Custom star SVG for consistent cross-browser rendering
 * - Half-star support via overlay technique
 * - Focus ring using Tailwind ring utilities
 *
 * **Tailwind Classes Used:**
 * - `rating`, `rating-{size}`: DaisyUI rating container
 * - `text-warning`: Active star color
 * - `text-base-300`: Inactive star color
 * - `cursor-pointer`, `cursor-not-allowed`: Interaction states
 * - `transition-all`, `duration-200`: Animations
 * - `hover:scale-110`: Hover effect
 * - `ring-2`, `ring-warning`: Focus indicator
 *
 * @param props - {@link RateProps}
 * @param ref - Forwarded ref to the container div
 * @returns The rendered DaisyUI-styled Rate component
 *
 * @example
 * ```tsx
 * <ModernRate
 *   defaultValue={3}
 *   allowHalf
 *   count={5}
 *   size="lg"
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
    // State Management
    // -------------------------------------------------------------------------

    // Controlled vs uncontrolled pattern: when `value` is provided the
    // parent owns the state; otherwise we track it internally.
    const isControlled = value !== undefined;
    const [internalValue, setInternalValue] = useState(defaultValue);
    const [hoverValue, setHoverValue] = useState<number | null>(null);
    const [focusIndex, setFocusIndex] = useState<number | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // displayValue prioritises hover feedback so the user sees a live
    // preview before committing their selection via click
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
     * Handle hover state changes.
     */
    const handleHover = useCallback((starValue: number | null) => {
      if (!isInteractive) return;
      setHoverValue(starValue);
      if (starValue !== null) {
        onHoverChange?.(starValue);
      } else {
        onHoverChange?.(0);
      }
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
        default:
          return;
      }

      if (!isControlled) {
        setInternalValue(newValue);
      }
      onChange?.(newValue);
    }, [keyboard, isInteractive, currentValue, count, allowHalf, isControlled, onChange]);

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
          className="w-full h-full"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      );
    };

    // -------------------------------------------------------------------------
    // Styles
    // -------------------------------------------------------------------------

    // Get size value for custom sizing
    const sizeValue = RATE_SIZE_MAP[size];

    // -------------------------------------------------------------------------
    // Render Stars
    // -------------------------------------------------------------------------

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
            ${isInteractive ? 'cursor-pointer hover:scale-110' : disabled ? 'cursor-not-allowed opacity-50' : 'cursor-default'}
            ${isFocused ? 'ring-2 ring-offset-2' : ''}
          `}
          style={{
            width: `${sizeValue}px`,
            height: `${sizeValue}px`,
            color: isFilled || isHalfFilled
              ? activeColor || 'var(--ds-rate-active-color, var(--ds-color-warning, #facc15))'
              : inactiveColor || 'var(--ds-rate-inactive-color, var(--ds-color-neutral-200, #d1d5db))',
            // DS token override for the focus ring color; Tailwind's
            // ring-warning is replaced by an inline value so tenants
            // can control focus appearance.
            '--tw-ring-color': 'var(--ds-rate-focus-ring-color, var(--ds-color-warning, #facc15))',
            transitionDuration: 'var(--ds-motion-duration-fast, 200ms)',
          } as React.CSSProperties}
          title={tooltips?.[index]}
          onMouseEnter={() => handleHover(starIndex)}
          onMouseLeave={() => handleHover(null)}
          role="radio"
          aria-checked={isFilled}
          aria-label={tooltips?.[index] || `${starIndex} star${starIndex > 1 ? 's' : ''}`}
        >
          {/* Hidden radio input ensures the rating works inside native forms.
              Random name avoids radio-group collisions when multiple Rate
              instances coexist on the same page. */}
          <input
            type="radio"
            name={`rating-${Math.random().toString(36).substr(2, 9)}`}
            className="hidden"
            value={starIndex}
            disabled={!isInteractive}
            onClick={() => handleClick(starIndex)}
            onChange={() => {}}
          />
          {/* Invisible overlay covering the left half of the star.
              stopPropagation prevents the full-star handler from firing
              when the user interacts with the half-star zone. */}
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
          {/* Half star visual - overlay technique */}
          {isHalfFilled ? (
            <span className="relative inline-flex w-full h-full">
              {/* Background (inactive) star */}
              <span
                className="absolute inset-0"
                style={{ color: inactiveColor || 'var(--ds-rate-inactive-color, var(--ds-color-neutral-200, #d1d5db))' }}
              >
                {renderCharacter(index)}
              </span>
              {/* Foreground (active) half star */}
              <span
                className="absolute inset-0 overflow-hidden"
                style={{
                  width: '50%',
                  color: activeColor || 'var(--ds-rate-active-color, var(--ds-color-warning, #facc15))',
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

    // -------------------------------------------------------------------------
    // Render
    // -------------------------------------------------------------------------

    // Combine DaisyUI classes
    const ratingClasses = [
      'rating',
      SIZE_CLASSES[size] || SIZE_CLASSES.md,
      'gap-1',
      className,
    ].filter(Boolean).join(' ');

    return (
      <div
        // Merge the forwarded ref with our internal containerRef so both
        // the consumer and the autoFocus effect can access the DOM node
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

// Set display name for React DevTools debugging
Rate.displayName = 'Rate.Modern';

export default Rate;
