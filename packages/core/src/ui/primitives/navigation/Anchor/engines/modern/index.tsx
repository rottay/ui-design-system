/**
 * @fileoverview Anchor Modern Engine - Rottay Design System
 * @description Token-driven implementation of the Anchor component.
 * Paint, rhythm, and structure live in the modern skin (`anchor.css`);
 * the engine stamps anatomy and keeps runtime values inline.
 *
 * @remarks
 * **Engine contract (K3-C pass 1; P2-20 pass 2):**
 * - The accent marker is LOGICAL and fully skin-owned: `border-inline-start`
 *   geometry + idle/selected colors live in `anchor.css` (the pass-1
 *   `border-s-2`/`border-transparent` utilities are drained), so the marker
 *   flips to the correct side in RTL with a single paint owner.
 * - Nested indentation is skin-owned `margin-inline-start` (was `ml-4`).
 * - The active link carries `aria-current="location"`.
 * - Click scrolling honors `prefers-reduced-motion` (`behavior: 'auto'`).
 * - `target='_blank'` links stamp `rel='noopener noreferrer'` (P2-20).
 * - The root mints the canonical `rottay-anchor rottay-anchor--modern`
 *   pair + `data-direction`/`data-affix`; sticky/flex structure moved to
 *   the skin.
 * - B9 pass 2: arrow-key/Home/End navigation across links on the root
 *   (native tab order untouched), and a native `title` full-value
 *   affordance on string titles (the skin ellipsizes overflow).
 *
 * @example Basic Usage
 * ```tsx
 * import { Anchor } from '@rottay/design-system';
 *
 * <Anchor engine="modern">
 *   <Anchor.Link href="#section1" title="Section 1" />
 *   <Anchor.Link href="#section2" title="Section 2" />
 * </Anchor>
 * ```
 *
 * @example Horizontal Layout
 * ```tsx
 * <Anchor engine="modern" direction="horizontal">
 *   <Anchor.Link href="#tab1" title="Tab 1" />
 *   <Anchor.Link href="#tab2" title="Tab 2" />
 *   <Anchor.Link href="#tab3" title="Tab 3" />
 * </Anchor>
 * ```
 *
 * @see {@link AnchorProps} - Component props interface
 * @see {@link Anchor} for the main component
 * @module Anchor/Engines/Modern
 * @category Navigation
 * @package @rottay/design-system
 */

'use client';

import React, { useState, useEffect, createContext, useContext, useCallback, useRef, Children, isValidElement } from 'react';
import type { AnchorProps, AnchorLinkProps } from '../../contracts';
import { ANCHOR_DEFAULTS } from '../../contracts';
import { useOptionalTranslation } from '@/infrastructure/runtime/i18n';
import { revealInlineWithinScroller } from '../../../../foundation/scroll-reveal';
import { resolveReadingDirectionIsRtl } from '@/ui/primitives/runtime/collection/roving-focus';

// ============================================================================
// Context
// ============================================================================

/**
 * Context value interface for anchor state sharing.
 *
 * @internal
 */
interface AnchorContextValue {
  /** Currently active link href */
  activeKey: string;
  /** Click handler from parent anchor */
  onClick?: (e: React.MouseEvent, link: { title: React.ReactNode; href: string }) => void;
  /** Navigation direction */
  direction: 'vertical' | 'horizontal';
  /** In-page jump; only the Anchor knows the scroll container and `offsetTop`. */
  scrollToSection: (href: string) => void;
}

/**
 * Context for sharing anchor state with child Link components.
 *
 * @internal
 */
const AnchorContext = createContext<AnchorContextValue | null>(null);

/** Scroll behavior for the click-to-section jump: instant for users who
 *  asked the OS for reduced motion, smooth otherwise. */
function scrollBehavior(): ScrollBehavior {
  if (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  ) {
    return 'auto';
  }
  return 'smooth';
}

function isFragmentHref(href: string): boolean {
  return href.startsWith('#');
}

// getElementById, not querySelector: an id need not be a valid CSS ident.
function resolveSection(href: string): HTMLElement | null {
  return isFragmentHref(href) ? document.getElementById(href.slice(1)) : null;
}

// Block-axis jump confined to the caller's container, landing `offsetTop` below
// its edge. Not `scrollIntoView`: that walks every ancestor and drops the offset.
function scrollSectionIntoContainer(
  section: HTMLElement,
  container: Window | HTMLElement,
  offsetTop: number,
  behavior: ScrollBehavior
): void {
  const sectionTop = section.getBoundingClientRect().top;

  if (container === window) {
    window.scrollTo({ top: sectionTop + window.scrollY - offsetTop, behavior });
    return;
  }

  const element = container as HTMLElement;
  const delta = sectionTop - element.getBoundingClientRect().top - offsetTop;
  element.scrollTo({ top: element.scrollTop + delta, behavior });
}

// ============================================================================
// Link Component
// ============================================================================

/**
 * Modern engine implementation of the Anchor.Link component.
 *
 * @description
 * A navigation link that scrolls to its target section. Color, accent-marker
 * geometry, padding rhythm and typography are skin-owned (`anchor.css`,
 * single paint owner since P2-20); the engine stamps anatomy + state only.
 *
 * @param props - {@link AnchorLinkProps}
 * @param ref - Forwarded ref to the anchor element
 * @returns Navigation link element
 */
export const Link = React.forwardRef<HTMLAnchorElement, AnchorLinkProps>(
  (props, ref) => {
    // ---------------------------------------------------------------------------
    // Props Destructuring
    // ---------------------------------------------------------------------------

    const { href, title, target, children, className = '', style } = props;

    // ---------------------------------------------------------------------------
    // Context & State
    // ---------------------------------------------------------------------------

    const context = useContext(AnchorContext);
    const isActive = context?.activeKey === href;

    // ---------------------------------------------------------------------------
    // Event Handlers
    // ---------------------------------------------------------------------------

    /**
     * Handle link click - scroll to target section.
     * Calls parent onClick handler and performs the scroll.
     */
    const handleClick = (e: React.MouseEvent) => {
      context?.onClick?.(e, { title, href });

      // Only an in-page fragment is ours to intercept; anything else navigates.
      if (!e.defaultPrevented && isFragmentHref(href)) {
        e.preventDefault();
        context?.scrollToSection(href);
      }
    };

    // ---------------------------------------------------------------------------
    // Render
    // ---------------------------------------------------------------------------

    return (
      <div data-part="link-wrapper">
        <a
          ref={ref}
          href={href}
          target={target}
          // External anchors get the same security floor as the Link family
          // (P2-20): `target='_blank'` without rel is a reverse-tabnabbing
          // vector.
          rel={target === '_blank' ? 'noopener noreferrer' : undefined}
          onClick={handleClick}
          // Truncation affordance (B9 pass 2): the skin ellipsizes long
          // titles, so a string title doubles as the native full-value
          // tooltip. ReactNode titles carry their own semantics.
          title={typeof title === 'string' ? title : undefined}
          // P2-20: the border geometry/idle color utilities (`border-s-2`,
          // `border-transparent`) are DRAINED — the skin is the single owner
          // of the accent-marker track (width, idle transparent, selected
          // neutral), keyed on data-part + data-selected.
          className={`rottay-anchor-link rottay-anchor-link--modern ${className}`}
          style={style}
          data-part="item"
          data-selected={isActive}
          aria-current={isActive ? 'location' : undefined}
        >
          {title}
        </a>
        {children && (
          <div data-part="nested">
            {children}
          </div>
        )}
      </div>
    );
  }
);
Link.displayName = 'Anchor.Link.Modern';

// ============================================================================
// Anchor Component
// ============================================================================

/**
 * Modern engine implementation of the Anchor component.
 *
 * @description
 * An anchor navigation container that tracks scroll position and provides
 * context for child Link components. Sticky/flex structure is skin-owned;
 * the `offsetTop` runtime value stays inline.
 *
 * @param props - {@link AnchorProps}
 * @param ref - Forwarded ref to the container div
 * @returns Anchor navigation container
 */
export const Anchor = React.forwardRef<HTMLDivElement, AnchorProps>(
  (props, ref) => {
    // ---------------------------------------------------------------------------
    // Props Destructuring
    // ---------------------------------------------------------------------------

    const {
      getContainer,
      activeKey: controlledActiveKey,
      offsetTop = ANCHOR_DEFAULTS.offsetTop,
      bounds = ANCHOR_DEFAULTS.bounds,
      onChange,
      onClick,
      direction = ANCHOR_DEFAULTS.direction,
      affix = ANCHOR_DEFAULTS.affix,
      children,
      className = '',
      style,
    } = props;

    // ---------------------------------------------------------------------------
    // State
    // ---------------------------------------------------------------------------

    // Dual state pattern: supports both controlled (parent owns state) and
    // uncontrolled (component owns state) usage via nullish coalescing
    const [internalActiveKey, setInternalActiveKey] = useState('');
    const activeKey = controlledActiveKey ?? internalActiveKey;

    /** The root is its own scrollport when `direction='horizontal'`. */
    const rootRef = useRef<HTMLDivElement | null>(null);

    /** Confined to `getContainer` so the landed section clears an affixed bar. */
    const scrollToSection = useCallback(
      (href: string) => {
        const section = resolveSection(href);
        if (!section) return;
        scrollSectionIntoContainer(
          section,
          getContainer?.() ?? window,
          offsetTop,
          scrollBehavior()
        );
      },
      [getContainer, offsetTop]
    );

    // Landmark name: catalog-first with the documented English floor (the
    // `anchor.navigation` key lands with the locale JSONs; the echo guard
    // falls back until then). Bare compositions never crash on a missing
    // provider (the useOptionalTranslation contract).
    const i18n = useOptionalTranslation('components');
    const navigationLabel = (() => {
      const translated = i18n?.t('anchor.navigation');
      return translated && !translated.endsWith('navigation') ? translated : 'Anchor navigation';
    })();

    // ---------------------------------------------------------------------------
    // Helpers
    // ---------------------------------------------------------------------------

    /**
     * Extract all anchor hrefs from children recursively.
     * Used to determine which sections to track for scroll detection.
     */
    const getAnchors = useCallback((): string[] => {
      const anchors: string[] = [];
      const traverse = (nodes: React.ReactNode) => {
        Children.forEach(nodes, (child) => {
          if (isValidElement<{ href?: string; children?: React.ReactNode }>(child) && child.props.href) {
            anchors.push(child.props.href);
            if (child.props.children) {
              traverse(child.props.children);
            }
          }
        });
      };
      traverse(children);
      return anchors;
    }, [children]);

    // ---------------------------------------------------------------------------
    // Scroll Detection Effect
    // ---------------------------------------------------------------------------

    useEffect(() => {
      const container = getContainer?.() ?? window;
      const anchors = getAnchors();

      /**
       * Handle scroll events and update active link.
       * Calculates which section is currently in view based on scroll position.
       */
      const handleScroll = () => {
        const scrollTop = container === window
          ? window.scrollY
          : (container as HTMLElement).scrollTop;

        // Walk anchors in document order; the last one whose top edge has
        // scrolled past the threshold wins, giving us the deepest visible section
        let currentAnchor = '';
        for (const anchor of anchors) {
          const element = resolveSection(anchor);
          if (element) {
            const rect = element.getBoundingClientRect();
            // Convert viewport-relative position to absolute document position
            const top = container === window
              ? rect.top + scrollTop
              : rect.top + (container as HTMLElement).scrollTop;

            if (scrollTop >= top - offsetTop - bounds) {
              currentAnchor = anchor;
            }
          }
        }

        if (currentAnchor !== internalActiveKey) {
          setInternalActiveKey(currentAnchor);
          onChange?.(currentAnchor);
        }
      };

      container.addEventListener('scroll', handleScroll);
      // Section geometry is viewport-dependent: a rotation or a column change
      // reflows every threshold without emitting a single scroll event.
      window.addEventListener('resize', handleScroll, { passive: true });
      handleScroll(); // Initial check

      return () => {
        container.removeEventListener('scroll', handleScroll);
        window.removeEventListener('resize', handleScroll);
      };
    }, [getContainer, getAnchors, offsetTop, bounds, onChange, internalActiveKey]);

    // ------------------------------- Scrollport Reveal -------------------------

    // A horizontal root is an `overflow-x: auto` scrollport, so the selected link
    // can sit outside it. Scrollport-local by construction, never `scrollIntoView`.
    const revealItem = useCallback((item: HTMLElement | null) => {
      const root = rootRef.current;
      if (!root || !item) return;
      if (root.dataset.direction !== 'horizontal') return;
      revealInlineWithinScroller(root, item);
    }, []);

    useEffect(() => {
      const root = rootRef.current;
      if (!root) return;
      revealItem(
        root.querySelector<HTMLElement>("[data-part='item'][data-selected='true']")
      );
    }, [activeKey, direction, revealItem]);

    // ---------------------------------------------------------------------------
    // Keyboard Navigation (B9 pass 2)
    // ---------------------------------------------------------------------------

    /**
     * Arrow-key navigation across the anchor's links. Links stay native
     * tabbable anchors (no roving tabindex) — the arrows are a shortcut on
     * top, matching the direction axis: vertical uses ArrowUp/ArrowDown,
     * horizontal uses ArrowLeft/ArrowRight mirrored under RTL; Home/End jump
     * to the first/last link. Focus moves only — activation stays on the
     * native Enter/Space click (which performs the scroll jump).
     */
    const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
      const { key } = event;
      const vertical = direction !== 'horizontal';
      // `dir` on an ancestor is the authoritative declaration of direction and
      // is read first; computed style stays the CSS-only fallback.
      const rtl = resolveReadingDirectionIsRtl(event.currentTarget);

      const links = Array.from(
        event.currentTarget.querySelectorAll<HTMLElement>("[data-part='item']")
      );
      if (links.length === 0) return;

      // Focus alone is not enough inside a scrollport: the link the arrows
      // reach must also be brought into the visible window.
      const focusLink = (link: HTMLElement | undefined) => {
        if (!link) return;
        link.focus();
        revealItem(link);
      };

      if (key === 'Home' || key === 'End') {
        event.preventDefault();
        focusLink(links[key === 'Home' ? 0 : links.length - 1]);
        return;
      }

      let delta = 0;
      if (vertical) {
        if (key === 'ArrowDown') delta = 1;
        else if (key === 'ArrowUp') delta = -1;
      } else {
        if (key === 'ArrowRight') delta = rtl ? -1 : 1;
        else if (key === 'ArrowLeft') delta = rtl ? 1 : -1;
      }
      if (delta === 0) return;

      const currentIndex = links.indexOf(document.activeElement as HTMLElement);
      if (currentIndex < 0) return;
      event.preventDefault();
      focusLink(links[(currentIndex + delta + links.length) % links.length]);
    };

    // ---------------------------------------------------------------------------
    // Render
    // ---------------------------------------------------------------------------

    return (
      <AnchorContext.Provider value={{ activeKey, onClick, direction, scrollToSection }}>
        <div
          ref={(node) => {
            rootRef.current = node;
            if (typeof ref === 'function') {
              ref(node);
            } else if (ref) {
              ref.current = node;
            }
          }}
          className={`rottay-anchor rottay-anchor--modern ${className}`}
          style={{ top: affix ? offsetTop : undefined, ...style }}
          onKeyDown={handleKeyDown}
          data-part="root"
          data-direction={direction}
          data-affix={affix ? 'true' : 'false'}
          role="navigation"
          aria-label={navigationLabel}
        >
          {children}
        </div>
      </AnchorContext.Provider>
    );
  }
);
Anchor.displayName = 'Anchor.Modern';

export default Anchor;
