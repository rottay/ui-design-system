'use client';

/**
 * Affix - Apollo Engine (Vanilla HTML/CSS)
 * Pure HTML/CSS implementation with maximum accessibility
 */

import React, { forwardRef, useState, useEffect, useRef, useCallback } from 'react';
import type { AffixProps, AffixState } from '../../types';
import { AFFIX_DEFAULTS } from '../../types';

/**
 * Get scroll container element
 */
function getTargetContainer(target?: () => Window | HTMLElement | null): Window | HTMLElement {
  if (target) {
    const container = target();
    if (container) return container;
  }
  return typeof window !== 'undefined' ? window : (null as unknown as Window);
}

/**
 * Get bounding rect relative to target container
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

/**
 * Apollo engine implementation using pure HTML/CSS.
 * Maximum accessibility and zero external dependencies.
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

    const placeholderRef = useRef<HTMLDivElement>(null);
    const affixRef = useRef<HTMLDivElement>(null);
    const [state, setState] = useState<AffixState>({ affixed: false });
    const lastAffixedRef = useRef<boolean>(false);

    /**
     * Measure element and calculate affix state
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

    /**
     * Set up scroll and resize listeners
     */
    useEffect(() => {
      // If no onChange, use simple sticky and skip measurements
      if (!onChange) return;

      const targetContainer = getTargetContainer(target);
      if (!targetContainer) return;

      // Throttle scroll events
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

    // CSS variables for theming
    const cssVars: React.CSSProperties = {
      '--affix-z-index': zIndex,
      '--affix-offset-top': `${offsetTop}px`,
      '--affix-offset-bottom': offsetBottom !== undefined ? `${offsetBottom}px` : 'auto',
      '--affix-transition': 'box-shadow 0.2s ease-in-out',
    } as React.CSSProperties;

    // Simple sticky mode (no onChange callback)
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

    // Advanced mode with onChange tracking
    const affixedStyle: React.CSSProperties = state.affixed
      ? {
          ...cssVars,
          ...state.fixedStyle,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
          transition: 'var(--affix-transition)',
          ...style,
        }
      : {
          ...cssVars,
          transition: 'var(--affix-transition)',
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
