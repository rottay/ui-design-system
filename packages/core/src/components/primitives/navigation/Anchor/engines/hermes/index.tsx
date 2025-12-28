/**
 * @fileoverview Anchor Hermes Engine - Rottay Design System
 * @description DaisyUI/Tailwind CSS implementation of the Anchor component.
 * A utility-first engine optimized for Tailwind-based projects.
 *
 * @remarks
 * **Engine Overview:**
 * Hermes is built on DaisyUI and Tailwind CSS, providing a lightweight
 * implementation with utility-first styling. Key characteristics:
 * - Minimal JavaScript, maximum CSS utilities
 * - Tailwind-native class composition
 * - DaisyUI semantic color tokens
 * - Smaller bundle size than Titan
 *
 * **When to Use Hermes:**
 * - Projects using Tailwind CSS as the primary styling solution
 * - When you prefer utility-first CSS approach
 * - For smaller bundle sizes compared to Titan
 * - When DaisyUI is already in your stack
 *
 * **Multi-Tenant Theming:**
 * Hermes anchors use DaisyUI's semantic color classes (primary, base-content)
 * which automatically adapt to the configured DaisyUI theme. This integrates
 * seamlessly with Rottay's multi-tenant theming system.
 *
 * **Tailwind Classes Used:**
 * - `sticky`, `top-0`: Affix positioning
 * - `flex`, `gap-2`: Horizontal direction
 * - `text-primary`, `border-primary`: Active state
 * - `text-base-content/70`: Inactive state
 * - `transition-colors`: Smooth color transitions
 *
 * @example Basic Usage
 * ```tsx
 * import { Anchor } from '@rottay/design-system';
 *
 * <Anchor engine="hermes">
 *   <Anchor.Link href="#section1" title="Section 1" />
 *   <Anchor.Link href="#section2" title="Section 2" />
 * </Anchor>
 * ```
 *
 * @example With Global Engine Provider
 * ```tsx
 * import { EngineProvider, Anchor } from '@rottay/design-system';
 *
 * <EngineProvider engine="hermes">
 *   <Anchor>
 *     <Anchor.Link href="#intro" title="Introduction" />
 *     <Anchor.Link href="#features" title="Features" />
 *   </Anchor>
 * </EngineProvider>
 * ```
 *
 * @example Horizontal Layout
 * ```tsx
 * <Anchor engine="hermes" direction="horizontal">
 *   <Anchor.Link href="#tab1" title="Tab 1" />
 *   <Anchor.Link href="#tab2" title="Tab 2" />
 *   <Anchor.Link href="#tab3" title="Tab 3" />
 * </Anchor>
 * ```
 *
 * @see {@link AnchorProps} - Component props interface
 * @see {@link TitanAnchor} - Ant Design alternative
 * @see {@link ApolloAnchor} - Vanilla alternative
 * @see {@link https://daisyui.com/} - DaisyUI documentation
 * @module Anchor/Engines/Hermes
 * @category Navigation
 * @package @rottay/design-system
 */

'use client';

import React, { useState, useEffect, createContext, useContext, useCallback, Children, isValidElement } from 'react';
import type { AnchorProps, AnchorLinkProps } from '../../types';
import { ANCHOR_DEFAULTS } from '../../types';

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
 * Hermes Engine implementation of the Anchor.Link component.
 *
 * @description
 * A Tailwind/DaisyUI styled navigation link that scrolls to target sections.
 * Uses utility classes for styling and DaisyUI semantic colors.
 *
 * @remarks
 * **Tailwind Classes:**
 * - Active: `text-primary border-l-2 border-primary font-medium`
 * - Inactive: `text-base-content/70 hover:text-primary border-transparent`
 * - Base: `block py-1 px-3 text-sm transition-colors`
 *
 * **Features:**
 * - Smooth scroll to target on click
 * - Automatic active state from context
 * - Hover state styling
 * - Support for nested children
 *
 * @param props - {@link AnchorLinkProps}
 * @param ref - Forwarded ref to the anchor element
 * @returns Styled navigation link element
 *
 * @example
 * ```tsx
 * <Link href="#section" title="Section Title" />
 * ```
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
      <div className={context?.direction === 'horizontal' ? 'inline-block' : ''}>
        <a
          ref={ref}
          href={href}
          target={target}
          onClick={handleClick}
          className={`block py-1 px-3 text-sm transition-colors ${
            isActive
              ? 'text-primary border-l-2 border-primary font-medium'
              : 'text-base-content/70 hover:text-primary border-l-2 border-transparent'
          } ${className}`}
          style={style}
        >
          {title}
        </a>
        {children && (
          <div className="ml-4">
            {children}
          </div>
        )}
      </div>
    );
  }
);
Link.displayName = 'Anchor.Link.Hermes';

// ============================================================================
// Anchor Component
// ============================================================================

/**
 * Hermes Engine implementation of the Anchor component.
 *
 * @description
 * A Tailwind/DaisyUI styled anchor navigation container. Tracks scroll
 * position and provides context for child Link components.
 *
 * @remarks
 * **Key Features:**
 * - Automatic scroll-based active link detection
 * - Support for custom scroll containers
 * - Sticky positioning via Tailwind utilities
 * - Vertical and horizontal layouts
 * - Controlled and uncontrolled active state
 *
 * **Tailwind Classes:**
 * - Affix: `sticky top-0`
 * - Horizontal: `flex gap-2`
 *
 * @param props - {@link AnchorProps}
 * @param ref - Forwarded ref to the container div
 * @returns Styled anchor navigation container
 *
 * @example
 * ```tsx
 * <Anchor
 *   engine="hermes"
 *   offsetTop={80}
 *   affix={true}
 *   direction="vertical"
 * >
 *   <Anchor.Link href="#intro" title="Introduction" />
 *   <Anchor.Link href="#features" title="Features" />
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
      className = '',
      style,
    } = props;

    // ---------------------------------------------------------------------------
    // State
    // ---------------------------------------------------------------------------

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
          if (isValidElement(child) && child.props.href) {
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

        let currentAnchor = '';
        for (const anchor of anchors) {
          const element = document.querySelector(anchor);
          if (element) {
            const rect = element.getBoundingClientRect();
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

    return (
      <AnchorContext.Provider value={{ activeKey, onClick, direction }}>
        <div
          ref={ref}
          className={`${affix ? 'sticky top-0' : ''} ${
            direction === 'horizontal' ? 'flex gap-2' : ''
          } ${className}`}
          style={{ top: affix ? offsetTop : undefined, ...style }}
        >
          {children}
        </div>
      </AnchorContext.Provider>
    );
  }
);
Anchor.displayName = 'Anchor.Hermes';

export default Anchor;
