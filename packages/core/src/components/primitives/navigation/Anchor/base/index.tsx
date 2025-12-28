/**
 * @fileoverview Anchor Base Component - Rottay Design System
 * @description Base/fallback implementation for the Anchor component.
 * Provides a functional vanilla HTML/CSS implementation.
 *
 * @remarks
 * The BaseAnchor serves as the core implementation used when:
 * - No engine is configured in the application
 * - The Apollo engine is selected
 * - An engine fails to load (caught by ErrorBoundary)
 * - Server-side rendering requires a minimal markup
 *
 * **Features:**
 * - Smooth scroll to target sections on click
 * - Automatic scroll-based active link detection
 * - Support for nested link hierarchies
 * - Vertical and horizontal layouts
 * - Sticky/affix positioning support
 *
 * **Multi-Tenant Integration:**
 * The base component respects tenant-specific CSS variables and
 * provides full styling through inline styles. Colors can be
 * customized via CSS variables in production.
 *
 * @example Direct Usage
 * ```tsx
 * import { BaseAnchor, Link } from '@rottay/design-system/components/primitives/navigation/Anchor/base';
 *
 * <BaseAnchor offsetTop={80}>
 *   <Link href="#section1" title="Section 1" />
 *   <Link href="#section2" title="Section 2" />
 * </BaseAnchor>
 * ```
 *
 * @example Recommended Usage
 * ```tsx
 * import { Anchor } from '@rottay/design-system';
 *
 * // Always prefer the main Anchor export
 * <Anchor offsetTop={80}>
 *   <Anchor.Link href="#section1" title="Section 1" />
 *   <Anchor.Link href="#section2" title="Section 2" />
 * </Anchor>
 * ```
 *
 * @see {@link AnchorProps} - Component props interface
 * @see {@link AnchorLinkProps} - Link component props
 * @see {@link TitanAnchor} - Ant Design implementation
 * @see {@link HermesAnchor} - DaisyUI implementation
 * @module Anchor/Base
 * @category Navigation
 * @package @rottay/design-system
 */

'use client';

import React, { useState, useEffect, createContext, useContext, useCallback, Children, isValidElement } from 'react';
import type { AnchorProps, AnchorLinkProps } from '../types';
import { ANCHOR_DEFAULTS } from '../types';

// ============================================================================
// Styles
// ============================================================================

/**
 * Default styles for the base anchor implementation.
 * Uses inline styles for zero-dependency rendering.
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
    padding: '4px 12px',
    fontSize: 14,
    textDecoration: 'none',
    color: '#595959',
    borderLeft: '2px solid transparent',
    transition: 'color 0.2s, border-color 0.2s',
  } as React.CSSProperties,

  /** Active link styles */
  linkActive: {
    color: '#1890ff',
    borderLeftColor: '#1890ff',
    fontWeight: 500,
  } as React.CSSProperties,

  /** Hovered link styles */
  linkHover: {
    color: '#1890ff',
  } as React.CSSProperties,

  /** Nested links container */
  nested: {
    marginLeft: 16,
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
 * Base Link component for anchor navigation.
 *
 * @description
 * Creates a clickable link that scrolls to the target section.
 * Automatically highlights when the section is in view.
 *
 * @remarks
 * - Uses context to receive active state from parent Anchor
 * - Supports smooth scrolling via scrollIntoView
 * - Handles hover states for visual feedback
 * - Renders nested children with indentation
 *
 * @param props - {@link AnchorLinkProps}
 * @param ref - Forwarded ref to the anchor element
 * @returns Link element with optional nested children
 */
export const Link = React.forwardRef<HTMLAnchorElement, AnchorLinkProps>(
  (props, ref) => {
    const { href, title, target, children, className, style } = props;
    const [isHovered, setIsHovered] = useState(false);

    // Get context from parent Anchor
    const context = useContext(AnchorContext);
    const isActive = context?.activeKey === href;

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

    return (
      <div style={context?.direction === 'horizontal' ? { display: 'inline-block' } : undefined}>
        <a
          ref={ref}
          href={href}
          target={target}
          onClick={handleClick}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className={className}
          style={{
            ...styles.link,
            ...(isActive ? styles.linkActive : {}),
            ...(isHovered && !isActive ? styles.linkHover : {}),
            ...style,
          }}
        >
          {title}
        </a>
        {children && <div style={styles.nested}>{children}</div>}
      </div>
    );
  }
);
Link.displayName = 'BaseAnchor.Link';

// ============================================================================
// Main Component
// ============================================================================

/**
 * Base Anchor component - vanilla HTML/CSS implementation.
 *
 * @description
 * Provides full anchor navigation functionality without external dependencies.
 * Used as the foundation for the Apollo engine and as a fallback.
 *
 * @remarks
 * **Key Features:**
 * - Automatic scroll-based active link detection
 * - Support for custom scroll containers
 * - Sticky positioning via affix prop
 * - Vertical and horizontal layouts
 * - Controlled and uncontrolled active state
 *
 * **Scroll Detection:**
 * The component tracks scroll position and determines which section
 * is currently in view using the `offsetTop` and `bounds` parameters.
 *
 * @param props - {@link AnchorProps}
 * @param ref - Forwarded ref to the container div
 * @returns Anchor navigation container
 *
 * @example
 * ```tsx
 * <BaseAnchor
 *   offsetTop={80}
 *   onChange={(key) => console.log('Active:', key)}
 * >
 *   <Link href="#intro" title="Introduction" />
 *   <Link href="#features" title="Features" />
 * </BaseAnchor>
 * ```
 */
export const BaseAnchor = React.forwardRef<HTMLDivElement, AnchorProps>(
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
          className={className}
          style={{
            ...styles.container,
            ...(affix ? { ...styles.containerAffix, top: offsetTop } : {}),
            ...(direction === 'horizontal' ? styles.containerHorizontal : {}),
            ...style,
          }}
        >
          {children}
        </div>
      </AnchorContext.Provider>
    );
  }
);
BaseAnchor.displayName = 'BaseAnchor';

export default BaseAnchor;
