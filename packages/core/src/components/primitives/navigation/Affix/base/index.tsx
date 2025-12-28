'use client';

/**
 * @fileoverview Affix Base Component - Rottay Design System
 * @description Base implementation of the Affix component using CSS position: sticky
 * with scroll event listeners for onChange callback support.
 *
 * @remarks
 * This base component provides the foundational sticky positioning logic that
 * is extended by engine-specific implementations (Titan, Hermes, Apollo).
 * It uses CSS sticky positioning as the primary method with JavaScript-based
 * fixed positioning as a fallback when onChange callback is needed.
 *
 * The component intelligently switches between two modes:
 * 1. **Simple Sticky Mode**: Uses pure CSS `position: sticky` (more performant)
 * 2. **Advanced Fixed Mode**: Uses JavaScript scroll listeners with `position: fixed`
 *    for precise onChange callback support
 *
 * @example Direct Base Usage
 * ```tsx
 * import { BaseAffix } from '@rottay/design-system';
 *
 * function CustomAffix() {
 *   return (
 *     <BaseAffix offsetTop={64} onChange={(affixed) => console.log(affixed)}>
 *       <nav>Navigation</nav>
 *     </BaseAffix>
 *   );
 * }
 * ```
 *
 * @see {@link AffixProps} for component props
 * @see {@link AFFIX_DEFAULTS} for default values
 *
 * @module Affix/Base
 * @category Navigation
 * @package @rottay/design-system
 */

import React, { forwardRef, useState, useEffect, useRef, useCallback } from 'react';
import type { AffixProps, AffixState } from '../types';
import { AFFIX_DEFAULTS } from '../types';

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get scroll container element.
 *
 * @description
 * Retrieves the scroll container from the target function prop.
 * Falls back to window if no target is specified or if the target returns null.
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
 * For window, creates a virtual rect representing the viewport.
 * For HTMLElements, uses getBoundingClientRect().
 *
 * @param target - The scroll container (Window or HTMLElement)
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
// Base Component
// ============================================================================

/**
 * Base Affix component using CSS position: sticky with scroll event listeners.
 *
 * @description
 * Provides sticky positioning functionality with onChange callback support.
 * Uses CSS sticky for simple cases and switches to fixed positioning when
 * onChange callback is provided for precise state tracking.
 *
 * @remarks
 * - Uses requestAnimationFrame for scroll throttling
 * - Automatically handles window resize events
 * - Maintains placeholder dimensions to prevent layout shift
 * - Supports both top and bottom affix modes
 * - Fully accessible and keyboard navigable
 *
 * @param props - {@link AffixProps}
 * @param ref - Forwarded ref to the affix container element
 * @returns React element with sticky positioning
 *
 * @example
 * ```tsx
 * <BaseAffix
 *   offsetTop={100}
 *   zIndex={50}
 *   onChange={(affixed) => setIsSticky(affixed)}
 * >
 *   <header className="main-header">Header Content</header>
 * </BaseAffix>
 * ```
 */
export const BaseAffix = forwardRef<HTMLDivElement, AffixProps>(
  (props, ref) => {
    const {
      offsetTop = AFFIX_DEFAULTS.offsetTop,
      offsetBottom,
      target,
      onChange,
      children,
      className = '',
      style = {},
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
     * Calculates whether the element should be affixed based on its position
     * relative to the target container and the specified offset values.
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
     * Attaches scroll and resize event listeners to the target container
     * for tracking affix state changes. Uses requestAnimationFrame for
     * throttling scroll events to maintain smooth performance.
     */
    useEffect(() => {
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
    }, [measure, target]);

    // ========================================================================
    // CSS Variables
    // ========================================================================

    // Build CSS variables for the affix (enables theming)
    const affixVars: React.CSSProperties = {
      '--ds-affix-z-index': zIndex,
      '--ds-affix-offset-top': `${offsetTop}px`,
      '--ds-affix-offset-bottom': offsetBottom !== undefined ? `${offsetBottom}px` : 'auto',
    } as React.CSSProperties;

    // ========================================================================
    // Simple Sticky Mode (when no onChange needed)
    // ========================================================================

    // For simple sticky positioning (fallback when no onChange needed)
    const stickyStyle: React.CSSProperties = {
      ...affixVars,
      position: 'sticky',
      zIndex,
      ...(offsetBottom !== undefined
        ? { bottom: offsetBottom }
        : { top: offsetTop }
      ),
      ...style,
    };

    // ========================================================================
    // Render
    // ========================================================================

    // If onChange is provided, use fixed positioning for precise control
    if (onChange) {
      return (
        <div ref={placeholderRef} style={state.placeholderStyle}>
          <div
            ref={(node) => {
              // Handle both refs
              (affixRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
              if (typeof ref === 'function') {
                ref(node);
              } else if (ref) {
                ref.current = node;
              }
            }}
            className={`rottay-affix ${state.affixed ? 'rottay-affix--affixed' : ''} ${className}`}
            style={state.affixed ? { ...affixVars, ...state.fixedStyle, ...style } : { ...affixVars, ...style }}
          >
            {children}
          </div>
        </div>
      );
    }

    // Simple sticky mode (no onChange callback)
    return (
      <div
        ref={ref}
        className={`rottay-affix ${className}`}
        style={stickyStyle}
      >
        {children}
      </div>
    );
  }
);

BaseAffix.displayName = 'BaseAffix';

export default BaseAffix;
