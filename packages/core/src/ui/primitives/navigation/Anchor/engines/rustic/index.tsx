/**
 * @fileoverview Anchor Apollo Engine - Rottay Design System
 * @description Vanilla HTML/CSS implementation of the Anchor component.
 * A zero-dependency engine for maximum accessibility and control.
 *
 * @remarks
 * **Engine Overview:**
 * Apollo is the headless, zero-dependency engine in the Rottay Design System.
 * It provides maximum flexibility and accessibility without external styling
 * libraries. Key characteristics:
 * - Pure React with inline styles
 * - No external CSS or component library dependencies
 * - Maximum accessibility compliance
 * - Full control over styling and behavior
 * - Smallest possible bundle footprint
 *
 * **When to Use Apollo:**
 * - When you need complete control over styling
 * - For accessibility-critical applications
 * - When minimizing bundle size is paramount
 * - For custom design systems that diverge from Ant Design/DaisyUI
 * - Server-side rendering with minimal client JavaScript
 *
 * **Multi-Tenant Theming:**
 * Apollo uses inline styles that can be overridden via CSS custom properties
 * or the style prop. Colors are hardcoded by default but can be customized
 * through tenant-specific CSS variables.
 *
 * **Default Colors:**
 * - Inactive text: #595959
 * - Active text: #1890ff
 * - Active border: #1890ff
 *
 * @example Basic Usage
 * ```tsx
 * import { Anchor } from '@rottay/design-system';
 *
 * <Anchor engine="rustic">
 *   <Anchor.Link href="#section1" title="Section 1" />
 *   <Anchor.Link href="#section2" title="Section 2" />
 * </Anchor>
 * ```
 *
 * @example Custom Styling
 * ```tsx
 * <Anchor
 *   engine="rustic"
 *   style={{ '--anchor-active-color': '#ff6b6b' }}
 * >
 *   <Anchor.Link href="#section" title="Section" />
 * </Anchor>
 * ```
 *
 * @example With Global Engine Provider
 * ```tsx
 * import { EngineProvider, Anchor } from '@rottay/design-system';
 *
 * <EngineProvider engine="rustic">
 *   <Anchor>
 *     <Anchor.Link href="#intro" title="Introduction" />
 *     <Anchor.Link href="#features" title="Features" />
 *   </Anchor>
 * </EngineProvider>
 * ```
 *
 * @see {@link AnchorProps} - Component props interface
 * @see {@link TitanAnchor} - Ant Design alternative
 * @see {@link HermesAnchor} - DaisyUI alternative
 * @module Anchor/Engines/Apollo
 * @category Navigation
 * @package @rottay/design-system
 */

'use client';

import React, { useState, useEffect, createContext, useContext, useCallback, Children, isValidElement } from 'react';

import type { AnchorProps, AnchorLinkProps } from '../../contracts';
import { ANCHOR_DEFAULTS } from '../../contracts';

// ============================================================================
// Styles
// ============================================================================

/**
 * Default styles for the Apollo anchor implementation.
 * Uses inline styles for zero-dependency rendering.
 *
 * @remarks
 * These styles provide a clean, accessible default appearance.
 * Override via className or style props for customization.
 *
 * @internal
 */
const styles = {
  /** Container base styles */
  container: {
    position: 'relative',
  } as React.CSSProperties,

  /** Container styles when affixed */
  containerAffix: {
    position: 'sticky',
  } as React.CSSProperties,

  /** Container styles for horizontal direction */
  containerHorizontal: {
    display: 'flex',
    gap: 8,
  } as React.CSSProperties,

  /** Link base styles */
  link: {
    display: 'block',
    padding: 'var(--ds-anchor-link-padding, 4px 12px)',
    fontSize: 'var(--ds-anchor-link-font-size, 14px)',
    textDecoration: 'none',
    transition: 'color 0.2s, border-color 0.2s',
  } as React.CSSProperties,

  /** Active link styles */
  linkActive: {
    fontWeight: 500,
  } as React.CSSProperties,

  /** Nested links container */
  nested: {
    marginLeft: 'var(--ds-anchor-nested-indent, 16px)',
  } as React.CSSProperties,
};

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
}

/**
 * Context for sharing anchor state with child Link components.
 *
 * @internal
 */
const AnchorContext = createContext<AnchorContextValue | null>(null);

// ============================================================================
// Link Component
// ============================================================================

/**
 * Apollo Engine implementation of the Anchor.Link component.
 *
 * @description
 * A vanilla HTML/CSS styled navigation link that scrolls to target sections.
 * Uses inline styles for zero-dependency rendering.
 *
 * @remarks
 * **Features:**
 * - Smooth scroll to target on click
 * - Automatic active state from context
 * - Hover state with visual feedback
 * - Support for nested children
 * - Fully accessible with proper href
 *
 * **Styling:**
 * - Uses inline styles merged with custom style prop
 * - Hover state managed via React state
 * - Active state provided via context
 *
 * @param props - {@link AnchorLinkProps}
 * @param ref - Forwarded ref to the anchor element
 * @returns Styled navigation link element
 *
 * @example
 * ```tsx
 * <Link href="#section" title="Section Title">
 *   <Link href="#subsection" title="Subsection" />
 * </Link>
 * ```
 */
export const Link = React.forwardRef<HTMLAnchorElement, AnchorLinkProps>(
  (props, ref) => {
    // ---------------------------------------------------------------------------
    // Props Destructuring
    // ---------------------------------------------------------------------------

    const { href, title, target, children, className, style } = props;

    // ---------------------------------------------------------------------------
    // State
    // ---------------------------------------------------------------------------

    // ---------------------------------------------------------------------------
    // Context
    // ---------------------------------------------------------------------------

    const context = useContext(AnchorContext);
    const isActive = context?.activeKey === href;

    // ---------------------------------------------------------------------------
    // Event Handlers
    // ---------------------------------------------------------------------------

    /**
     * Handle link click - scroll to target section.
     * Calls parent onClick handler and performs smooth scroll.
     */
    const handleClick = (e: React.MouseEvent) => {
      context?.onClick?.(e, { title, href });

      if (!e.defaultPrevented) {
        e.preventDefault();
        const element = document.querySelector(href);
        element?.scrollIntoView({ behavior: 'smooth' });
      }
    };

    // ---------------------------------------------------------------------------
    // Render
    // ---------------------------------------------------------------------------

    return (
      <div style={context?.direction === 'horizontal' ? { display: 'inline-block' } : undefined}>
        <a
          ref={ref}
          href={href}
          target={target}
          onClick={handleClick}
          className={`rottay-anchor-link rottay-anchor-link--rustic ${className}`.trim()}
          style={{
            ...styles.link,
            ...(isActive ? styles.linkActive : {}),
            ...style,
          }}
          data-part="item"
          data-selected={isActive}
        >
          {title}
        </a>
        {children && <div style={styles.nested}>{children}</div>}
      </div>
    );
  }
);
Link.displayName = 'Anchor.Link.Apollo';

// ============================================================================
// Anchor Component
// ============================================================================

/**
 * Apollo Engine implementation of the Anchor component.
 *
 * @description
 * A vanilla HTML/CSS styled anchor navigation container. Provides full
 * functionality without external dependencies.
 *
 * @remarks
 * **Key Features:**
 * - Automatic scroll-based active link detection
 * - Support for custom scroll containers
 * - Sticky positioning via inline styles
 * - Vertical and horizontal layouts
 * - Controlled and uncontrolled active state
 * - Zero external dependencies
 *
 * **Scroll Detection Algorithm:**
 * The component listens to scroll events on the container (window or custom)
 * and calculates which section is in view based on:
 * 1. Current scroll position
 * 2. Element positions relative to container
 * 3. offsetTop and bounds configuration
 *
 * @param props - {@link AnchorProps}
 * @param ref - Forwarded ref to the container div
 * @returns Styled anchor navigation container
 *
 * @example
 * ```tsx
 * <Anchor
 *   engine="rustic"
 *   offsetTop={80}
 *   affix={true}
 *   direction="vertical"
 * >
 *   <Anchor.Link href="#intro" title="Introduction" />
 *   <Anchor.Link href="#features" title="Features">
 *     <Anchor.Link href="#feature-1" title="Feature 1" />
 *   </Anchor.Link>
 * </Anchor>
 * ```
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
      className,
      style,
    } = props;

    // ---------------------------------------------------------------------------
    // State
    // ---------------------------------------------------------------------------

    // Dual state pattern: supports both controlled (parent owns state) and
    // uncontrolled (component owns state) usage via nullish coalescing
    const [internalActiveKey, setInternalActiveKey] = useState('');
    const activeKey = controlledActiveKey ?? internalActiveKey;

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
          const element = document.querySelector(anchor);
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
      handleScroll(); // Initial check

      return () => {
        container.removeEventListener('scroll', handleScroll);
      };
    }, [getContainer, getAnchors, offsetTop, bounds, onChange, internalActiveKey]);

    // ---------------------------------------------------------------------------
    // Render
    // ---------------------------------------------------------------------------

    // Inline style merging order matters: container base, then optional
    // affix/direction overrides, then consumer style prop wins last
    return (
      <AnchorContext.Provider value={{ activeKey, onClick, direction }}>
        <div
          ref={ref}
          className={className}
          style={{
            ...styles.container,
            ...(affix ? { ...styles.containerAffix, top: offsetTop } : {}),
            ...(direction === 'horizontal' ? styles.containerHorizontal : {}),
            ...style,
          }}
          data-part="root"
        >
          {children}
        </div>
      </AnchorContext.Provider>
    );
  }
);
Anchor.displayName = 'Anchor.Apollo';

export default Anchor;
