'use client';

/**
 * @fileoverview Layout Apollo Engine - Rottay Design System
 * @description Apollo (Pure HTML/CSS) implementation of the Layout compound component.
 * Uses inline CSS styles for maximum compatibility without external dependencies.
 *
 * @remarks
 * The Apollo engine provides:
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
 * @example Using Apollo Engine
 * ```tsx
 * import { Layout } from '@rottay/design-system';
 *
 * // Pure inline CSS styling
 * <Layout engine="apollo" hasSider>
 *   <Layout.Sider engine="apollo" theme="light" collapsible>
 *     Navigation
 *   </Layout.Sider>
 *   <Layout>
 *     <Layout.Header engine="apollo">Header</Layout.Header>
 *     <Layout.Content engine="apollo">Content</Layout.Content>
 *     <Layout.Footer engine="apollo">Footer</Layout.Footer>
 *   </Layout>
 * </Layout>
 * ```
 *
 * @see {@link Layout} - The main engine-aware component
 * @module Layout/Engines/Apollo
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
} from '../../types';
import { LAYOUT_DEFAULTS } from '../../types';

const styles = {
  layout: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
  } as React.CSSProperties,
  layoutWithSider: {
    flexDirection: 'row',
  } as React.CSSProperties,
  header: {
    backgroundColor: '#001529',
    color: '#fff',
    padding: '0 16px',
    display: 'flex',
    alignItems: 'center',
    flexShrink: 0,
  } as React.CSSProperties,
  sider: {
    backgroundColor: '#001529',
    color: '#fff',
    flexShrink: 0,
    overflow: 'auto',
    transition: 'width 0.3s',
  } as React.CSSProperties,
  siderLight: {
    backgroundColor: '#fff',
    color: '#000',
    borderRight: '1px solid #f0f0f0',
  } as React.CSSProperties,
  content: {
    flex: 1,
    padding: '16px',
    overflow: 'auto',
    backgroundColor: '#fff',
  } as React.CSSProperties,
  footer: {
    backgroundColor: '#f5f5f5',
    padding: '16px',
    textAlign: 'center',
    flexShrink: 0,
  } as React.CSSProperties,
  trigger: {
    width: '100%',
    padding: '8px',
    border: 'none',
    background: 'transparent',
    color: 'inherit',
    cursor: 'pointer',
    textAlign: 'center',
  } as React.CSSProperties,
};

export const Layout = React.forwardRef<HTMLDivElement, LayoutProps>(
  (props, ref) => {
    const { hasSider, children, className, style } = props;
    return (
      <div
        ref={ref}
        className={className}
        style={{
          ...styles.layout,
          ...(hasSider ? styles.layoutWithSider : {}),
          ...style,
        }}
      >
        {children}
      </div>
    );
  }
);
Layout.displayName = 'Layout.Apollo';

export const Header = React.forwardRef<HTMLElement, LayoutHeaderProps>(
  (props, ref) => {
    const { height = LAYOUT_DEFAULTS.headerHeight, children, className, style } = props;
    return (
      <header
        ref={ref}
        className={className}
        style={{
          ...styles.header,
          height: typeof height === 'number' ? `${height}px` : height,
          ...style,
        }}
      >
        {children}
      </header>
    );
  }
);
Header.displayName = 'Layout.Header.Apollo';

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
        className={className}
        style={{
          ...styles.sider,
          ...(theme === 'light' ? styles.siderLight : {}),
          width: typeof currentWidth === 'number' ? `${currentWidth}px` : currentWidth,
          ...style,
        }}
      >
        {children}
        {collapsible && (
          <button type="button" style={styles.trigger} onClick={handleToggle}>
            {trigger ?? (isCollapsed ? '→' : '←')}
          </button>
        )}
      </aside>
    );
  }
);
Sider.displayName = 'Layout.Sider.Apollo';

export const Content = React.forwardRef<HTMLElement, LayoutContentProps>(
  (props, ref) => {
    const { children, className, style } = props;
    return (
      <main ref={ref} className={className} style={{ ...styles.content, ...style }}>
        {children}
      </main>
    );
  }
);
Content.displayName = 'Layout.Content.Apollo';

export const Footer = React.forwardRef<HTMLElement, LayoutFooterProps>(
  (props, ref) => {
    const { children, className, style } = props;
    return (
      <footer ref={ref} className={className} style={{ ...styles.footer, ...style }}>
        {children}
      </footer>
    );
  }
);
Footer.displayName = 'Layout.Footer.Apollo';

export default Layout;
