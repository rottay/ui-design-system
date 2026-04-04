'use client';

/**
 * @fileoverview Affix Modern Engine - Rottay Design System
 * @description Tailwind CSS-based implementation of the Affix component with DS token styling.
 * Provides a lightweight sticky solution using Tailwind CSS utilities.
 *
 * @remarks
 * The Modern engine offers a lightweight, utility-first implementation
 * of the Affix component using Tailwind CSS. This approach:
 * - Minimizes bundle size with CSS utilities
 * - Provides smooth transitions via Tailwind classes
 * - Offers easy customization through utility classes
 * - Maintains full onChange callback support
 *
 * @example Modern Engine Usage
 * ```tsx
 * import { Affix } from '@rottay/design-system';
 *
 * function StickyNav() {
 *   return (
 *     <Affix engine="modern" offsetTop={0}>
 *       <nav className="bg-white shadow-lg">Navigation</nav>
 *     </Affix>
 *   );
 * }
 * ```
 *
 * @example With Tailwind Customization
 * ```tsx
 * <Affix
 *   engine="modern"
 *   offsetTop={64}
 *   className="transition-all duration-300"
 *   onChange={(affixed) => console.log(affixed)}
 * >
 *   <header className="p-4">Header</header>
 * </Affix>
 * ```
 *
 * @see {@link AffixProps} for component props
 * @see {@link https://tailwindcss.com/docs/position#sticky-positioning} Tailwind sticky docs
 *
 * @module Affix/Engines/Modern
 * @category Navigation
 * @package @rottay/design-system
 */

import React, { forwardRef, useState, useEffect, useRef, useCallback } from 'react';
import type { AffixProps, AffixState } from '../Affix.types';
import { AFFIX_DEFAULTS } from '../Affix.types';

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get scroll container element.
 *
 * @description
 * Retrieves the scroll container from the target function prop.
 * Falls back to window if no target is specified.
 *
 * @param target - Optional function that returns the scroll container
 * @returns The scroll container (Window or HTMLElement)
 *
 * @internal
 */
function getTargetContainer(target?: () => Window | HTMLElement | null): Window | HTMLElement {
  if (target) {
    const container = target();
    if (container) return container;
  }
  return typeof window !== 'undefined' ? window : (null as unknown as Window);
}

/**
 * Get bounding rect relative to target container.
 *
 * @description
 * Calculates the bounding rectangle of the target container.
 * Creates a virtual rect for window, uses getBoundingClientRect for elements.
 *
 * @param target - The scroll container
 * @returns DOMRect representing the container bounds
 *
 * @internal
 */
function getTargetRect(target: Window | HTMLElement): DOMRect {
  if (target === window) {
    return {
      top: 0,
      bottom: window.innerHeight,
      left: 0,
      right: window.innerWidth,
      width: window.innerWidth,
      height: window.innerHeight,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    };
  }
  return (target as HTMLElement).getBoundingClientRect();
}

// ============================================================================
// Modern Engine Component
// ============================================================================

/**
 * Modern engine implementation using Tailwind CSS utilities.
 *
 * @description
 * Provides a lightweight sticky solution with onChange callback support.
 * Uses pure CSS sticky positioning when onChange is not needed, and
 * switches to JavaScript-based fixed positioning for precise tracking.
 *
 * @remarks
 * Key features of the Modern implementation:
 * - Tailwind CSS utility classes for z-index
 * - Smooth shadow transitions when affixed
 * - Optimized scroll handling with requestAnimationFrame
 * - Minimal JavaScript when onChange is not used
 *
 * @param props - {@link AffixProps}
 * @param ref - Forwarded ref to the affix element
 * @returns React element with Tailwind-styled sticky positioning
 *
 * @example
 * ```tsx
 * <ModernAffix
 *   offsetTop={0}
 *   zIndex={50}
 *   onChange={(affixed) => setShowShadow(affixed)}
 * >
 *   <header>Header</header>
 * </ModernAffix>
 * ```
 */
export const ModernAffix = forwardRef<HTMLDivElement, AffixProps>(
  (props, ref) => {
    const {
      offsetTop = AFFIX_DEFAULTS.offsetTop,
      offsetBottom,
      target,
      onChange,
      children,
      className = '',
      style,
      zIndex = AFFIX_DEFAULTS.zIndex,
    } = props;

    // ========================================================================
    // Refs and State
    // ========================================================================

    const placeholderRef = useRef<HTMLDivElement>(null);
    const affixRef = useRef<HTMLDivElement>(null);
    const [state, setState] = useState<AffixState>({ affixed: false });
    const lastAffixedRef = useRef<boolean>(false);

    // ========================================================================
    // Measurement Logic
    // ========================================================================

    /**
     * Measure element and calculate affix state.
     *
     * @description
     * Calculates whether the element should be affixed based on scroll position
     * and offset values. Updates state and triggers onChange when status changes.
     */
    const measure = useCallback(() => {
      const targetContainer = getTargetContainer(target);
      if (!targetContainer || !placeholderRef.current) return;

      const targetRect = getTargetRect(targetContainer);
      const placeholderRect = placeholderRef.current.getBoundingClientRect();

      let affixed = false;
      let fixedStyle: React.CSSProperties | undefined;
      let placeholderStyle: React.CSSProperties | undefined;

      if (offsetBottom !== undefined) {
        // Bottom affix mode
        const distanceFromBottom = targetRect.bottom - placeholderRect.bottom;
        if (distanceFromBottom <= offsetBottom) {
          affixed = true;
          fixedStyle = {
            position: 'fixed',
            bottom: offsetBottom,
            left: placeholderRect.left,
            width: placeholderRect.width,
            zIndex,
          };
          placeholderStyle = {
            width: placeholderRect.width,
            height: placeholderRect.height,
          };
        }
      } else {
        // Top affix mode
        const distanceFromTop = placeholderRect.top - targetRect.top;
        if (distanceFromTop <= offsetTop) {
          affixed = true;
          fixedStyle = {
            position: 'fixed',
            top: offsetTop + targetRect.top,
            left: placeholderRect.left,
            width: placeholderRect.width,
            zIndex,
          };
          placeholderStyle = {
            width: placeholderRect.width,
            height: placeholderRect.height,
          };
        }
      }

      // Update state if affixed status changed
      if (affixed !== lastAffixedRef.current) {
        lastAffixedRef.current = affixed;
        onChange?.(affixed);
      }

      setState({ affixed, fixedStyle, placeholderStyle });
    }, [offsetTop, offsetBottom, target, onChange, zIndex]);

    // ========================================================================
    // Event Listeners
    // ========================================================================

    /**
     * Set up scroll and resize listeners.
     *
     * @description
     * Only attaches listeners when onChange callback is provided.
     * Uses requestAnimationFrame for smooth scroll handling.
     */
    useEffect(() => {
      // If no onChange, use simple sticky and skip measurements
      if (!onChange) return;

      const targetContainer = getTargetContainer(target);
      if (!targetContainer) return;

      // Throttle scroll events using requestAnimationFrame
      let ticking = false;
      const handleScroll = () => {
        if (!ticking) {
          window.requestAnimationFrame(() => {
            measure();
            ticking = false;
          });
          ticking = true;
        }
      };

      const handleResize = () => {
        measure();
      };

      targetContainer.addEventListener('scroll', handleScroll, { passive: true });
      window.addEventListener('resize', handleResize, { passive: true });

      // Initial measurement
      measure();

      return () => {
        targetContainer.removeEventListener('scroll', handleScroll);
        window.removeEventListener('resize', handleResize);
      };
    }, [measure, target, onChange]);

    // ========================================================================
    // Tailwind Classes
    // ========================================================================

    // Map numeric zIndex to Tailwind utility classes so Tailwind can purge
    // unused z-index values. Arbitrary values fall through to inline style.
    const zIndexClass = zIndex === 10 ? 'z-10' :
                        zIndex === 20 ? 'z-20' :
                        zIndex === 30 ? 'z-30' :
                        zIndex === 40 ? 'z-40' :
                        zIndex === 50 ? 'z-50' : '';

    // ========================================================================
    // Render - Simple Sticky Mode
    // ========================================================================

    // When no onChange callback is needed, we use pure CSS sticky positioning
    // to avoid JavaScript scroll listeners entirely, reducing CPU usage
    if (!onChange) {
      const stickyStyle: React.CSSProperties = {
        position: 'sticky',
        ...(offsetBottom !== undefined
          ? { bottom: offsetBottom }
          : { top: offsetTop }
        ),
        zIndex,
        ...style,
      };

      return (
        <div
          ref={ref}
          className={`${zIndexClass} ${className}`.trim()}
          style={stickyStyle}
        >
          {children}
        </div>
      );
    }

    // ========================================================================
    // Render - Advanced Mode with onChange
    // ========================================================================

    // Advanced mode: a placeholder div preserves document flow when the
    // content switches to fixed positioning, preventing layout jumps.
    // The ref callback merges internal and forwarded refs so both the
    // component's measurement logic and parent consumers share the same node.
    return (
      <div ref={placeholderRef} style={state.placeholderStyle}>
        <div
          ref={(node) => {
            (affixRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
            if (typeof ref === 'function') {
              ref(node);
            } else if (ref) {
              ref.current = node;
            }
          }}
          className={`transition-all duration-200 ${zIndexClass} ${className}`.trim()}
          style={state.affixed ? { ...state.fixedStyle, boxShadow: 'var(--ds-elevation-1)', ...style } : style}
        >
          {children}
        </div>
      </div>
    );
  }
);

ModernAffix.displayName = 'Affix.Modern';

export default ModernAffix;
