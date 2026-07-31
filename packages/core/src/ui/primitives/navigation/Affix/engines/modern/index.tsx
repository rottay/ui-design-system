'use client';

/**
 * @fileoverview Affix Modern Engine - Rottay Design System
 * @description Token-driven, skin-painted implementation of the Affix component.
 * Pure CSS sticky positioning when no onChange is needed; measured fixed
 * positioning with a geometry-preserving placeholder when it is. The affixed
 * surface and its transition are owned by the modern skin (`skin/affix.css`);
 * position/offsets stay inline as runtime-measured values. The caller's
 * z-index travels through `--ds-affix-runtime-z-index`, while the skin owns
 * the actual `z-index` declaration and its tenant-token fallback.
 *
 * @remarks
 * - No Tailwind utilities: the z-index class mapping is gone (the inline
 *   zIndex always wins, so the classes were dead weight).
 * - No inline surface paint: background/elevation of the affixed state live
 *   in the skin (the quality contract pins `style.background`/`boxShadow`
 *   empty).
 * - Never hardcode bg/shadow utilities on children: the affixed surface is
 *   token-owned.
 *
 * @example Modern Engine Usage
 * ```tsx
 * import { Affix } from '@rottay/design-system';
 *
 * function StickyNav() {
 *   return (
 *     <Affix engine="modern" offsetTop={0}>
 *       <nav>Navigation</nav>
 *     </Affix>
 *   );
 * }
 * ```
 *
 * @example With Customization
 * ```tsx
 * // The affixed surface (background, elevation) is token-owned by the
 * // modern skin -- never hardcode bg/shadow utilities on children.
 * <Affix
 *   engine="modern"
 *   offsetTop={64}
 *   onChange={(affixed) => console.log(affixed)}
 * >
 *   <header>Header</header>
 * </Affix>
 * ```
 *
 * @see {@link AffixProps} for component props
 *
 * @module Affix/Engines/Modern
 * @category Navigation
 * @package @rottay/design-system
 */

import React, { forwardRef, useState, useEffect, useRef, useCallback } from 'react';
import type { AffixProps, AffixState } from '../../contracts';
import { AFFIX_DEFAULTS } from '../../contracts';

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
 * Modern engine implementation (skin-painted, token-driven).
 *
 * @description
 * Provides a lightweight sticky solution with onChange callback support.
 * Uses pure CSS sticky positioning when onChange is not needed, and
 * switches to JavaScript-measured fixed positioning for precise tracking.
 *
 * @remarks
 * Key features of the Modern implementation:
 * - Runtime z-index custom property (default rides `--ds-z-affix`)
 * - Skin-owned affixed surface and transition (`affix.css`)
 * - Optimized scroll handling with requestAnimationFrame
 * - Minimal JavaScript when onChange is not used
 *
 * @param props - {@link AffixProps}
 * @param ref - Forwarded ref to the affix element
 * @returns React element with token-styled sticky positioning
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

    // The caller's zIndex is runtime input, but the property owner remains
    // the skin. Passing the value through a family-scoped custom property
    // preserves caller customization without creating a second inline-paint
    // authority. The default still rides the tenant's `--ds-z-affix` channel.
    const resolvedZIndex: string | number =
      zIndex === AFFIX_DEFAULTS.zIndex
        ? `var(--ds-z-affix, ${AFFIX_DEFAULTS.zIndex})`
        : zIndex;
    const runtimeVariables = {
      '--ds-affix-runtime-z-index': resolvedZIndex,
    } as React.CSSProperties;

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
    }, [offsetTop, offsetBottom, target, onChange, resolvedZIndex]);

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
        ...runtimeVariables,
        ...style,
      };

      return (
        <div
          ref={ref}
          className={`rottay-affix rottay-affix--modern ${className}`.trim()}
          style={stickyStyle}
          data-part="root"
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
    // The affixed surface + transition paint is skin-owned (`affix.css`).
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
          className={`rottay-affix rottay-affix--modern ${className}`.trim()}
          style={
            state.affixed
              ? { ...runtimeVariables, ...state.fixedStyle, ...style }
              : { ...runtimeVariables, ...style }
          }
          data-part="root"
          data-sticky={state.affixed || undefined}
        >
          {children}
        </div>
      </div>
    );
  }
);

ModernAffix.displayName = 'Affix.Modern';

export default ModernAffix;
