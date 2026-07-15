'use client';

/**
 * @fileoverview Layout Rustic Engine - Rottay Design System
 * @description Rustic (Pure HTML/CSS) implementation of the Layout compound component.
 * Uses inline CSS styles for maximum compatibility without external dependencies.
 *
 * @remarks
 * The Rustic engine provides:
 * - Pure inline CSS with flexbox layout
 * - Dark theme header and sider styling by default
 * - Light theme option for sider with border
 * - Collapsible sidebar with smooth width transition
 * - Centered footer with light background
 *
 * This implementation is ideal for:
 * - Embedded applications without CSS framework dependencies
 * - Server-side rendering without CSS extraction
 * - Maximum browser compatibility scenarios
 *
 * @example Using Rustic Engine
 * ```tsx
 * import { Layout } from '@rottay/design-system';
 *
 * // Pure inline CSS styling
 * <Layout engine="rustic" hasSider>
 *   <Layout.Sider engine="rustic" theme="light" collapsible>
 *     Navigation
 *   </Layout.Sider>
 *   <Layout>
 *     <Layout.Header engine="rustic">Header</Layout.Header>
 *     <Layout.Content engine="rustic">Content</Layout.Content>
 *     <Layout.Footer engine="rustic">Footer</Layout.Footer>
 *   </Layout>
 * </Layout>
 * ```
 *
 * @see {@link Layout} - The main engine-aware component
 * @module Layout/Engines/Rustic
 * @category Layout
 * @package @rottay/design-system
 */
import React, { useState } from 'react';
import type {
  LayoutProps,
  LayoutHeaderProps,
  LayoutSiderProps,
  LayoutContentProps,
  LayoutFooterProps,
} from '../Layout.types';
import { LAYOUT_DEFAULTS } from '../Layout.types';

/**
 * Pre-defined inline style objects for each layout region.
 *
 * All colors and spacing reference CSS custom properties (--ds-*) with hardcoded
 * fallbacks, enabling full theming through the design system's token layer while
 * remaining functional without any external stylesheet loaded. The `as const`
 * cast on each object satisfies React.CSSProperties typing.
 */
const styles = {
  /** Root layout container: vertical flex column spanning the full viewport */
  layout: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
  } as React.CSSProperties,
  /** Override when hasSider is true: switch to horizontal row direction */
  layoutWithSider: {
    flexDirection: 'row',
  } as React.CSSProperties,
  /** Header: layout only -- background/color live in engines/rustic/skin/layout.css. */
  header: {
    padding: 'var(--ds-layout-header-padding, 0 16px)',
    display: 'flex',
    alignItems: 'center',
    flexShrink: 0,
  } as React.CSSProperties,
  /** Sider: layout only -- background/color (dark base + light override) live in the skin. */
  sider: {
    flexShrink: 0,
    overflow: 'auto',
    transition: 'width 0.3s',
  } as React.CSSProperties,
  /** Content: flex-growing main area -- background lives in the skin. */
  content: {
    flex: 1,
    padding: 'var(--ds-layout-content-padding, 16px)',
    overflow: 'auto',
  } as React.CSSProperties,
  /** Footer: layout only -- background lives in the skin. */
  footer: {
    padding: 'var(--ds-layout-footer-padding, 16px)',
    textAlign: 'center',
    flexShrink: 0,
  } as React.CSSProperties,
  /** Collapse toggle button: layout only -- chrome lives in the skin. */
  trigger: {
    width: '100%',
    padding: '8px',
    cursor: 'pointer',
    textAlign: 'center',
  } as React.CSSProperties,
};

/**
 * Rustic Layout shell using pure inline CSS.
 *
 * Defaults to a vertical flex column; flips to a horizontal row when
 * `hasSider` is true so the sidebar sits alongside the content area.
 *
 * @param props - Layout container props (hasSider, className, style).
 * @returns A ref-forwarding div element styled with token-backed CSS properties.
 */
export const Layout = React.forwardRef<HTMLDivElement, LayoutProps>(
  (props, ref) => {
    const { hasSider, children, className, style } = props;
    return (
      <div
        ref={ref}
        className={`rottay-layout rottay-layout--rustic ${className ?? ''}`.trim()}
        style={{
          ...styles.layout,
          ...(hasSider ? styles.layoutWithSider : {}),
          ...style,
        }}
        data-part="root"
        data-has-sider={hasSider ? 'true' : 'false'}
      >
        {children}
      </div>
    );
  }
);
Layout.displayName = 'Layout.Rustic';

/**
 * Rustic Header with dark primary background via CSS custom properties.
 * Height merges into the base style to override the default token value.
 *
 * @param props - Header props (height, className, style).
 * @returns A ref-forwarding semantic `<header>` element.
 */
export const Header = React.forwardRef<HTMLElement, LayoutHeaderProps>(
  (props, ref) => {
    const { height = LAYOUT_DEFAULTS.headerHeight, children, className, style } = props;
    return (
      <header
        ref={ref}
        className={`rottay-layout-header rottay-layout-header--rustic ${className ?? ''}`.trim()}
        style={{
          ...styles.header,
          height: typeof height === 'number' ? `${height}px` : height,
          ...style,
        }}
        data-part="header"
      >
        {children}
      </header>
    );
  }
);
Header.displayName = 'Layout.Header.Rustic';

/**
 * Rustic Sider with controlled/uncontrolled collapse and dark/light theming.
 *
 * The collapse toggle is implemented as a plain `<button>` with inherited
 * color and no borders, keeping the rustic engine dependency-free. The CSS
 * `transition: width 0.3s` on the base sider style provides a smooth
 * collapse animation without JavaScript animation libraries.
 *
 * @param props - Sider props (width, collapsible, collapsed, theme, etc.)
 * @returns A ref-forwarding semantic `<aside>` element.
 */
export const Sider = React.forwardRef<HTMLElement, LayoutSiderProps>(
  (props, ref) => {
    const {
      width = LAYOUT_DEFAULTS.siderWidth,
      collapsedWidth = LAYOUT_DEFAULTS.siderCollapsedWidth,
      collapsed: controlledCollapsed,
      defaultCollapsed = false,
      collapsible = false,
      onCollapse,
      trigger,
      theme = 'dark',
      children,
      className,
      style,
    } = props;

    // Internal state for uncontrolled mode; ignored when `collapsed` is provided
    const [internalCollapsed, setInternalCollapsed] = useState(defaultCollapsed);
    const isCollapsed = controlledCollapsed ?? internalCollapsed;

    const handleToggle = () => {
      const newCollapsed = !isCollapsed;
      if (controlledCollapsed === undefined) {
        setInternalCollapsed(newCollapsed);
      }
      onCollapse?.(newCollapsed);
    };

    const currentWidth = isCollapsed ? collapsedWidth : width;

    return (
      <aside
        ref={ref}
        className={`rottay-layout-sider rottay-layout-sider--rustic ${className ?? ''}`.trim()}
        style={{
          ...styles.sider,
          width: typeof currentWidth === 'number' ? `${currentWidth}px` : currentWidth,
          ...style,
        }}
        data-part="sider"
        data-theme={theme}
        data-collapsed={isCollapsed ? 'true' : 'false'}
      >
        {children}
        {collapsible && (
          <button
            type="button"
            style={styles.trigger}
            onClick={handleToggle}
            data-part="trigger"
            data-collapsed={isCollapsed ? 'true' : 'false'}
          >
            {trigger ?? (isCollapsed ? '→' : '←')}
          </button>
        )}
      </aside>
    );
  }
);
Sider.displayName = 'Layout.Sider.Rustic';

/**
 * Rustic Content area -- a flex-growing `<main>` with token-based padding.
 *
 * @param props - Content props (className, style).
 * @returns A ref-forwarding semantic `<main>` element.
 */
export const Content = React.forwardRef<HTMLElement, LayoutContentProps>(
  (props, ref) => {
    const { children, className, style } = props;
    return (
      <main ref={ref} className={`rottay-layout-content rottay-layout-content--rustic ${className ?? ''}`.trim()} style={{ ...styles.content, ...style }} data-part="content">
        {children}
      </main>
    );
  }
);
Content.displayName = 'Layout.Content.Rustic';

/**
 * Rustic Footer with centered text and secondary background token.
 *
 * @param props - Footer props (className, style).
 * @returns A ref-forwarding semantic `<footer>` element.
 */
export const Footer = React.forwardRef<HTMLElement, LayoutFooterProps>(
  (props, ref) => {
    const { children, className, style } = props;
    return (
      <footer ref={ref} className={`rottay-layout-footer rottay-layout-footer--rustic ${className ?? ''}`.trim()} style={{ ...styles.footer, ...style }} data-part="footer">
        {children}
      </footer>
    );
  }
);
Footer.displayName = 'Layout.Footer.Rustic';

export default Layout;
