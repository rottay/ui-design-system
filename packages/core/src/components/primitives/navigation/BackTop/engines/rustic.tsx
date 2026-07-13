'use client';

/**
 * @fileoverview BackTop Rustic Engine - Rottay Design System
 * @description Vanilla HTML/CSS implementation of the BackTop component.
 * Provides a zero-dependency, fully accessible back-to-top button.
 *
 * @remarks
 * The Rustic engine provides a pure HTML/CSS implementation featuring:
 * - Zero external dependencies
 * - Maximum accessibility compliance
 * - Full control over styling via CSS-in-JS
 * - Smooth CSS transitions for visibility changes
 * - Lightweight bundle size
 *
 * This implementation uses inline styles and native browser APIs,
 * making it ideal for projects that prioritize minimal dependencies
 * or require maximum control over the component's behavior.
 *
 * @example
 * ```tsx
 * import { BackTop } from '@rottay/design-system';
 *
 * <BackTop engine="rustic" visibilityHeight={300} />
 * ```
 *
 * @example Custom Styling
 * ```tsx
 * <BackTop
 *   engine="rustic"
 *   style={{
 *     backgroundColor: '#52c41a',
 *     bottom: '60px',
 *     right: '20px',
 *   }}
 * />
 * ```
 *
 * @see {@link BackTop} for the main component
 * @see {@link BackTopProps} for prop documentation
 * @see {@link BaseBackTop} for the base implementation this extends
 *
 * @module BackTop/Engines/Rustic
 * @category Navigation
 * @package @rottay/design-system
 */

import React, { useState, useEffect, useCallback } from 'react';
import type { BackTopProps } from '../BackTop.types';
import { BACKTOP_DEFAULTS } from '../BackTop.types';

// ============================================================================
// Styles
// ============================================================================

/**
 * Default styles for the Rustic BackTop button.
 * Uses CSS-in-JS for zero-dependency styling.
 */
const styles = {
  /** Base button styles - fixed position, circular shape, primary color */
  button: {
    position: 'fixed',
    bottom: 'var(--ds-backtop-bottom, 32px)',
    right: 'var(--ds-backtop-right, 32px)',
    width: 'var(--ds-backtop-size, 44px)',
    height: 'var(--ds-backtop-size, 44px)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 'var(--ds-backtop-z-index, 1000)' as unknown as number,
    transition: 'opacity 0.3s, transform 0.3s',
  } as React.CSSProperties,
  /** Hidden state: pointerEvents:'none' ensures the invisible button cannot be
   *  clicked. The shrink-out scale rides `data-state` in the skin. */
  hidden: {
    opacity: 0,
    pointerEvents: 'none',
  } as React.CSSProperties,
  /** Visible state styles - fully visible and interactive */
  visible: {
    opacity: 1,
  } as React.CSSProperties,
};

// ============================================================================
// Component
// ============================================================================

/**
 * Rustic (Vanilla HTML/CSS) implementation of BackTop.
 *
 * @description
 * A zero-dependency implementation using native browser APIs. Features:
 * - CSS transition-based visibility (opacity + transform)
 * - Passive scroll event listeners for performance
 * - Native smooth scroll behavior
 * - Full ARIA accessibility support
 *
 * @remarks
 * Unlike Modern which uses conditional rendering, Rustic keeps the
 * element in the DOM and uses CSS transitions for smooth show/hide
 * animations. The pointer-events property prevents interaction when hidden.
 *
 * @param props - {@link BackTopProps}
 * @param ref - Forwarded ref to the button element
 * @returns The BackTop button element (always rendered, visibility controlled via CSS)
 *
 * @example
 * ```tsx
 * <BackTop
 *   engine="rustic"
 *   visibilityHeight={200}
 *   style={{ backgroundColor: '#ff4d4f' }}
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
      className,
      style,
    } = props;

    // ========================================================================
    // State
    // ========================================================================

    /** Controls button visibility via CSS transitions */
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

    // Style merge order: base button -> visibility state -> consumer overrides.
    // Consumer styles come last so they can override position/color if needed.
    const buttonStyle: React.CSSProperties = {
      ...styles.button,
      ...(visible ? styles.visible : styles.hidden),
      ...style,
    };

    return (
      <button
        ref={ref}
        type="button"
        className={`rottay-backtop rottay-backtop--rustic ${className}`.trim()}
        style={buttonStyle}
        onClick={handleClick}
        aria-label="Back to top"
        data-part="trigger"
        data-state={visible ? 'visible' : 'hidden'}
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

BackTop.displayName = 'BackTop.Rustic';

export default BackTop;
