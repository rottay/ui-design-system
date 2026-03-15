'use client';

/**
 * @fileoverview BackTop Modern Engine - Rottay Design System
 * @description DaisyUI/Tailwind implementation of the BackTop component.
 * Provides a utility-first, lightweight back-to-top button using DaisyUI classes.
 *
 * @remarks
 * The Modern engine provides a Tailwind CSS-based implementation featuring:
 * - DaisyUI button components for consistent styling
 * - Utility-first CSS approach for easy customization
 * - Minimal JavaScript overhead
 * - Optimized for Tailwind CSS projects
 *
 * This implementation uses DaisyUI's btn-circle and btn-primary classes
 * for styling, making it easy to customize via Tailwind configuration.
 *
 * @example
 * ```tsx
 * import { BackTop } from '@rottay/design-system';
 *
 * <BackTop engine="modern" visibilityHeight={300} />
 * ```
 *
 * @example Custom Styling with Tailwind
 * ```tsx
 * <BackTop
 *   engine="modern"
 *   className="btn-secondary hover:scale-110 transition-transform"
 * />
 * ```
 *
 * @see {@link BackTop} for the main component
 * @see {@link BackTopProps} for prop documentation
 * @see {@link https://daisyui.com/components/button} DaisyUI Button docs
 *
 * @module BackTop/Engines/Modern
 * @category Navigation
 * @package @rottay/design-system
 */

import React, { useState, useEffect, useCallback } from 'react';
import type { BackTopProps } from '../BackTop.types';
import { BACKTOP_DEFAULTS } from '../BackTop.types';

// ============================================================================
// Component
// ============================================================================

/**
 * Modern (DaisyUI/Tailwind) implementation of BackTop.
 *
 * @description
 * A utility-first implementation using DaisyUI button classes. Features:
 * - Conditional rendering (unmounts when not visible)
 * - DaisyUI btn-circle styling for circular button
 * - Fixed positioning with shadow for visibility
 * - Native smooth scroll behavior
 *
 * @remarks
 * Unlike the Rustic engine which uses opacity transitions, Modern
 * completely unmounts the component when not visible for optimal performance.
 *
 * @param props - {@link BackTopProps}
 * @param ref - Forwarded ref to the button element
 * @returns The BackTop button or null when hidden
 *
 * @example
 * ```tsx
 * <BackTop
 *   engine="modern"
 *   className="btn-accent"
 *   visibilityHeight={100}
 * />
 * ```
 */
export const BackTop = React.forwardRef<HTMLButtonElement, BackTopProps>(
  (props, ref) => {
    const {
      target,
      visibilityHeight = BACKTOP_DEFAULTS.visibilityHeight!,
      onClick,
      children,
      className = '',
      style,
    } = props;

    // ========================================================================
    // State
    // ========================================================================

    /** Controls button visibility - component unmounts when false */
    const [visible, setVisible] = useState(false);

    // ========================================================================
    // Callbacks
    // ========================================================================

    /**
     * Returns the scroll target element.
     * Defaults to window if no target is specified.
     */
    const getTarget = useCallback(() => target?.() ?? window, [target]);

    /**
     * Handles scroll events to update button visibility.
     * Compares current scroll position against visibilityHeight threshold.
     */
    const handleScroll = useCallback(() => {
      const t = getTarget();
      const scrollTop = t === window
        ? document.documentElement.scrollTop || document.body.scrollTop
        : (t as HTMLElement).scrollTop;
      setVisible(scrollTop >= visibilityHeight);
    }, [getTarget, visibilityHeight]);

    // ========================================================================
    // Effects
    // ========================================================================

    /**
     * Sets up scroll event listener on the target element.
     * Uses passive listener for better scroll performance.
     */
    useEffect(() => {
      const t = getTarget();
      t.addEventListener('scroll', handleScroll, { passive: true });
      handleScroll();
      return () => t.removeEventListener('scroll', handleScroll);
    }, [getTarget, handleScroll]);

    // ========================================================================
    // Event Handlers
    // ========================================================================

    /**
     * Handles button click - scrolls to top and triggers callback.
     */
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      const t = getTarget();
      if (t === window) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        (t as HTMLElement).scrollTo({ top: 0, behavior: 'smooth' });
      }
      onClick?.(e);
    };

    // ========================================================================
    // Render
    // ========================================================================

    /** Return null when not visible (conditional rendering) */
    if (!visible) return null;

    return (
      <button
        ref={ref}
        type="button"
        className={`btn btn-circle btn-primary fixed bottom-8 right-8 shadow-lg z-50 ${className}`}
        style={style}
        onClick={handleClick}
        aria-label="Back to top"
      >
        {children || (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
        )}
      </button>
    );
  }
);

BackTop.displayName = 'BackTop.Modern';

export default BackTop;
