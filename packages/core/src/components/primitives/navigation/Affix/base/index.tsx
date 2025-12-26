'use client';

/**
 * Affix - Base Component
 * Uses CSS position: sticky with scroll event listeners for onChange callback
 * This is extended by engine-specific implementations.
 */

import React, { forwardRef, useState, useEffect, useRef, useCallback } from 'react';
import type { AffixProps, AffixState } from '../types';
import { AFFIX_DEFAULTS } from '../types';

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
 * Base Affix component using CSS position: sticky with scroll event listeners.
 * Provides onChange callback support for detecting affix state changes.
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
    }, [measure, target]);

    // Build CSS variables for the affix
    const affixVars: React.CSSProperties = {
      '--affix-z-index': zIndex,
      '--affix-offset-top': `${offsetTop}px`,
      '--affix-offset-bottom': offsetBottom !== undefined ? `${offsetBottom}px` : 'auto',
    } as React.CSSProperties;

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
