'use client';

/**
 * @fileoverview Affix Apollo Engine - Rottay Design System
 * @description Pure HTML/CSS implementation of the Affix component.
 * Provides maximum accessibility and zero external dependencies.
 *
 * @remarks
 * The Apollo engine offers a headless, dependency-free implementation
 * of the Affix component using vanilla HTML and CSS. This approach:
 * - Ensures maximum browser compatibility
 * - Provides complete accessibility control
 * - Eliminates external dependencies
 * - Allows full CSS customization via variables
 * - Ideal for lightweight or specialized environments
 *
 * @example Apollo Engine Usage
 * ```tsx
 * import { Affix } from '@rottay/design-system';
 *
 * function AccessibleStickyNav() {
 *   return (
 *     <Affix engine="apollo" offsetTop={0}>
 *       <nav role="navigation" aria-label="Main navigation">
 *         Navigation Content
 *       </nav>
 *     </Affix>
 *   );
 * }
 * ```
 *
 * @example With Custom Styling
 * ```tsx
 * <Affix
 *   engine="apollo"
 *   offsetTop={64}
 *   style={{ '--affix-shadow': '0 4px 12px rgba(0,0,0,0.1)' }}
 *   onChange={(affixed) => console.log(affixed)}
 * >
 *   <header>Pure CSS Sticky Header</header>
 * </Affix>
 * ```
 *
 * @see {@link AffixProps} for component props
 * @see {@link AffixState} for internal state interface
 *
 * @module Affix/Engines/Apollo
 * @category Navigation
 * @package @rottay/design-system
 */

import React, { forwardRef, useState, useEffect, useRef, useCallback } from 'react';
import type { AffixProps, AffixState } from '../../types';
import { AFFIX_DEFAULTS } from '../../types';

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
// Apollo Engine Component
// ============================================================================

/**
 * Apollo engine implementation using pure HTML/CSS.
 *
 * @description
 * Maximum accessibility and zero external dependencies implementation.
 * Uses CSS position: sticky for simple cases and fixed positioning
 * with JavaScript for precise onChange tracking.
 *
 * @remarks
 * Key features of the Apollo implementation:
 * - No external library dependencies
 * - Full CSS variable support for theming
 * - Semantic HTML structure
 * - Built-in box-shadow transition for visual feedback
 * - Consistent Rottay class naming conventions
 * - SSR-safe with 'use client' directive
 *
 * @param props - {@link AffixProps}
 * @param ref - Forwarded ref to the affix element
 * @returns React element with vanilla CSS sticky positioning
 *
 * @example
 * ```tsx
 * <ApolloAffix
 *   offsetTop={0}
 *   zIndex={100}
 *   onChange={(affixed) => {
 *     document.body.classList.toggle('has-sticky-header', affixed);
 *   }}
 * >
 *   <header className="site-header">Site Header</header>
 * </ApolloAffix>
 * ```
 */
export const ApolloAffix = forwardRef<HTMLDivElement, AffixProps>(
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
     * Uses requestAnimationFrame for optimized scroll handling.
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
    // CSS Variables
    // ========================================================================

    // CSS variables for theming (enables tenant customization)
    const cssVars: React.CSSProperties = {
      '--ds-affix-z-index': zIndex,
      '--ds-affix-offset-top': `${offsetTop}px`,
      '--ds-affix-offset-bottom': offsetBottom !== undefined ? `${offsetBottom}px` : 'auto',
      '--ds-affix-transition': 'box-shadow 0.2s ease-in-out',
    } as React.CSSProperties;

    // ========================================================================
    // Render - Simple Sticky Mode
    // ========================================================================

    // Simple sticky mode (no onChange callback) - pure CSS solution
    if (!onChange) {
      const stickyStyle: React.CSSProperties = {
        ...cssVars,
        position: 'sticky',
        zIndex,
        ...(offsetBottom !== undefined
          ? { bottom: offsetBottom }
          : { top: offsetTop }
        ),
        ...style,
      };

      return (
        <div
          ref={ref}
          className={`rottay-affix rottay-affix--apollo ${className}`}
          style={stickyStyle}
        >
          {children}
        </div>
      );
    }

    // ========================================================================
    // Render - Advanced Mode with onChange
    // ========================================================================

    // Advanced mode with onChange tracking - uses JavaScript positioning
    const affixedStyle: React.CSSProperties = state.affixed
      ? {
          ...cssVars,
          ...state.fixedStyle,
          boxShadow: 'var(--ds-affix-shadow, 0 2px 8px rgba(0, 0, 0, 0.15))',
          transition: 'var(--ds-affix-transition)',
          ...style,
        }
      : {
          ...cssVars,
          transition: 'var(--ds-affix-transition)',
          ...style,
        };

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
          className={`rottay-affix rottay-affix--apollo ${state.affixed ? 'rottay-affix--affixed' : ''} ${className}`}
          style={affixedStyle}
        >
          {children}
        </div>
      </div>
    );
  }
);

ApolloAffix.displayName = 'Affix.Apollo';

export default ApolloAffix;
