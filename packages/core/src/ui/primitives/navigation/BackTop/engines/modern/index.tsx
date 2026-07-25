'use client';

/**
 * @fileoverview BackTop Modern Engine - Rottay Design System
 * @description Token-driven implementation of the BackTop component.
 * Provides a lightweight back-to-top button whose chrome, sizing, and
 * interaction states live in the modern skin (`back-top.css`).
 *
 * @remarks
 * The Modern engine provides:
 * - Conditional rendering (unmounts when below the visibility threshold)
 * - The governed semantic icon (`navigation-up`) as the default glyph
 * - A localized aria-label via the components catalog (English fallback)
 * - LOGICAL placement utilities (`end-8`, never a physical `right-8`)
 *
 * Sizing (44px coarse-pointer floor), hover lift, pressed dip, and the
 * focus ring are skin-owned; the engine stamps anatomy only.
 *
 * @example
 * ```tsx
 * import { BackTop } from '@rottay/design-system';
 *
 * <BackTop engine="modern" visibilityHeight={300} />
 * ```
 *
 * @example Custom Content
 * ```tsx
 * <BackTop engine="modern">
 *   <span>Top</span>
 * </BackTop>
 * ```
 *
 * @see {@link BackTop} for the main component
 * @see {@link BackTopProps} for prop documentation
 *
 * @module BackTop/Engines/Modern
 * @category Navigation
 * @package @rottay/design-system
 */

import React, { useState, useEffect, useCallback } from 'react';
import type { BackTopProps } from '../../contracts';
import { BACKTOP_DEFAULTS } from '../../contracts';
import { useOptionalTranslation } from '@/infrastructure/runtime/i18n';
import { NavigationUpIcon } from '@/graphics/icons/presentation/semantic/generated/roles/navigation-up';

// ============================================================================
// Component
// ============================================================================

/**
 * Modern (token-driven) implementation of BackTop.
 *
 * @description
 * Features:
 * - Conditional rendering (unmounts when not visible)
 * - Skin-owned circular chrome, 44px sizing, and interaction states
 * - Fixed positioning via logical placement utilities
 * - Native smooth scroll behavior
 * - Localized aria-label (components catalog, English fallback)
 *
 * @remarks
 * Unlike the Rustic engine which uses opacity transitions, Modern
 * completely unmounts the component when not visible for optimal performance.
 *
 * @param props - {@link BackTopProps}
 * @param ref - Forwarded ref to the button element
 * @returns The BackTop button or null when hidden
 */
export const BackTop = React.forwardRef<HTMLButtonElement, BackTopProps>(
  (props, ref) => {
    // Optional so standalone renders (no I18nProvider mounted, e.g. direct
    // engine renders in tests/Storybook isolation) fall back to the
    // documented English accessibility string instead of throwing.
    const i18n = useOptionalTranslation('components');

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

    // Conditional rendering (vs CSS opacity) fully removes the element from
    // the DOM, preventing accidental focus or click interactions when hidden
    if (!visible) return null;

    return (
      <button
        ref={ref}
        type="button"
        // `end-8` is LOGICAL (inset-inline-end): the button parks at the
        // inline-end corner in both writing directions. Sizing, chrome and
        // interaction states are skin-owned (`back-top.css`).
        className={`rottay-backtop rottay-backtop--modern fixed bottom-8 end-8 z-50 ${className}`}
        style={style}
        onClick={handleClick}
        aria-label={i18n?.t('backTop.back_to_top') ?? 'Back to top'}
        data-part="trigger"
      >
        {/* Default governed semantic glyph; consumers can override with
            children for brand-specific content */}
        {children || <NavigationUpIcon decorative size={20} />}
      </button>
    );
  }
);

BackTop.displayName = 'BackTop.Modern';

export default BackTop;
