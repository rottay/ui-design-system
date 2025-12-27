'use client';

/**
 * @fileoverview BackTop Base Component - Rottay Design System
 * @description Base implementation of the BackTop component using vanilla HTML/CSS.
 * This serves as the foundation and fallback implementation for the BackTop component.
 *
 * @remarks
 * The base component provides a pure React implementation without external
 * dependencies. It serves as:
 * - A reference implementation for other engines
 * - A fallback when no specific engine is selected
 * - A lightweight option for minimal bundle size requirements
 *
 * @example
 * ```tsx
 * import { BaseBackTop } from './base';
 *
 * <BaseBackTop
 *   visibilityHeight={300}
 *   onClick={() => console.log('Scrolled!')}
 * />
 * ```
 *
 * @see {@link BackTop} for the main engine-agnostic component
 * @see {@link BackTopProps} for prop documentation
 *
 * @module BackTop/Base
 * @category Navigation
 * @package @rottay/design-system
 * @internal
 */

import React, { useState, useEffect, useCallback } from 'react';
import type { BackTopProps } from '../types';
import { BACKTOP_DEFAULTS } from '../types';

// ============================================================================
// Styles
// ============================================================================

/**
 * Default styles for the BackTop button.
 * Uses CSS-in-JS for zero-dependency styling.
 */
const styles = {
  /** Base button styles - fixed position, circular shape */
  button: {
    position: 'fixed',
    bottom: '32px',
    right: '32px',
    width: '44px',
    height: '44px',
    borderRadius: '50%',
    backgroundColor: '#1677ff',
    color: '#fff',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    zIndex: 1000,
    transition: 'opacity 0.3s, transform 0.3s',
  } as React.CSSProperties,
  /** Hidden state styles - invisible and non-interactive */
  hidden: {
    opacity: 0,
    transform: 'scale(0)',
    pointerEvents: 'none',
  } as React.CSSProperties,
  /** Visible state styles - fully visible and interactive */
  visible: {
    opacity: 1,
    transform: 'scale(1)',
  } as React.CSSProperties,
};

// ============================================================================
// Component
// ============================================================================

/**
 * Base BackTop component implementation.
 *
 * @description
 * A vanilla HTML/CSS implementation of the BackTop button. Features:
 * - Smooth scroll-to-top animation
 * - Visibility based on scroll position
 * - Support for custom scroll containers
 * - Accessible with ARIA attributes
 *
 * @remarks
 * This component uses native scroll behavior for smooth scrolling.
 * The visibility transition is handled via CSS transforms and opacity.
 *
 * @param props - {@link BackTopProps}
 * @param ref - Forwarded ref to the button element
 * @returns The BackTop button element
 *
 * @example
 * ```tsx
 * <BaseBackTop
 *   visibilityHeight={200}
 *   onClick={(e) => console.log('Clicked')}
 * >
 *   <CustomIcon />
 * </BaseBackTop>
 * ```
 */
export const BaseBackTop = React.forwardRef<HTMLButtonElement, BackTopProps>(
  (props, ref) => {
    const {
      target,
      visibilityHeight = BACKTOP_DEFAULTS.visibilityHeight!,
      onClick,
      children,
      className,
      style,
    } = props;

    // ========================================================================
    // State
    // ========================================================================

    /** Controls button visibility based on scroll position */
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

    /** Merged button styles including visibility state */
    const buttonStyle: React.CSSProperties = {
      ...styles.button,
      ...(visible ? styles.visible : styles.hidden),
      ...style,
    };

    return (
      <button
        ref={ref}
        type="button"
        className={className}
        style={buttonStyle}
        onClick={handleClick}
        aria-label="Back to top"
      >
        {children || (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 15l-6-6-6 6" />
          </svg>
        )}
      </button>
    );
  }
);

BaseBackTop.displayName = 'BaseBackTop';

export default BaseBackTop;
