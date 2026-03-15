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
    backgroundColor: 'var(--ds-layout-header-bg, var(--ds-color-primary-900))',
    color: 'var(--ds-layout-header-color, var(--ds-color-text-on-primary))',
    padding: 'var(--ds-layout-header-padding, 0 16px)',
    display: 'flex',
    alignItems: 'center',
    flexShrink: 0,
  } as React.CSSProperties,
  sider: {
    backgroundColor: 'var(--ds-layout-sider-bg, var(--ds-color-primary-900))',
    color: 'var(--ds-layout-sider-color, var(--ds-color-text-on-primary))',
    flexShrink: 0,
    overflow: 'auto',
    transition: 'width 0.3s',
  } as React.CSSProperties,
  siderLight: {
    backgroundColor: 'var(--ds-layout-sider-light-bg, var(--ds-color-bg-elevated))',
    color: 'var(--ds-layout-sider-light-color, var(--ds-color-text-primary))',
    borderRight: '1px solid var(--ds-layout-sider-light-border, var(--ds-color-border-subtle))',
  } as React.CSSProperties,
  content: {
    flex: 1,
    padding: 'var(--ds-layout-content-padding, 16px)',
    overflow: 'auto',
    backgroundColor: 'var(--ds-layout-content-bg, var(--ds-color-bg-primary))',
  } as React.CSSProperties,
  footer: {
    backgroundColor: 'var(--ds-layout-footer-bg, var(--ds-color-bg-secondary))',
    padding: 'var(--ds-layout-footer-padding, 16px)',
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
Layout.displayName = 'Layout.Rustic';

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
Header.displayName = 'Layout.Header.Rustic';

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
Sider.displayName = 'Layout.Sider.Rustic';

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
Content.displayName = 'Layout.Content.Rustic';

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
Footer.displayName = 'Layout.Footer.Rustic';

export default Layout;
