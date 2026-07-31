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
    // Localized aria-label with an English floor: a missing catalogue entry
    // echoes the full key back, which must never reach an aria-label.
    const resolvedLabel = i18n?.t('backTop.back_to_top');
    const ariaLabel =
      resolvedLabel && resolvedLabel !== 'backTop.back_to_top' && resolvedLabel !== 'components.backTop.back_to_top'
        ? resolvedLabel
        : 'Back to top';

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
     * Handles button click - scrolls to top and triggers callback. The
     * motion authority gates the animation: under reduced motion the jump is
     * instant (the smooth behavior animates regardless of OS preference).
     */
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      const t = getTarget();
      const prefersReducedMotion =
        typeof window !== 'undefined' &&
        typeof window.matchMedia === 'function' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const behavior: ScrollBehavior = prefersReducedMotion ? 'instant' : 'smooth';
      if (t === window) {
        window.scrollTo({ top: 0, behavior });
      } else {
        (t as HTMLElement).scrollTo({ top: 0, behavior });
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
        // `end-8` is LOGICAL (inset-inline-end) and test-pinned -- it stays as
        // a bridge string while the skin OVERRIDES its inline-end paint at the
        // same 2rem value (single geometry owner, pinned-class precedent).
        // Position, block-end inset and z-index are skin-owned.
        className={`rottay-backtop rottay-backtop--modern end-8 ${className}`}
        style={style}
        onClick={handleClick}
        aria-label={ariaLabel}
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
