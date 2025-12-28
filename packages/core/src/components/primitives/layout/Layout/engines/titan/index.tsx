'use client';

/**
 * @fileoverview Layout Titan Engine - Rottay Design System
 * @description Titan (Ant Design) implementation of the Layout compound component.
 * Wraps Ant Design's Layout components with full feature parity.
 *
 * @remarks
 * The Titan engine provides:
 * - Direct passthrough to Ant Design Layout, Header, Sider, Content, Footer
 * - Full Ant Design styling and theming support
 * - Native collapsible sidebar with all Ant Design features
 * - Responsive breakpoint support for auto-collapse
 *
 * @example Using Titan Engine
 * ```tsx
 * import { Layout } from '@rottay/design-system';
 *
 * <Layout engine="titan" hasSider>
 *   <Layout.Sider engine="titan" collapsible>
 *     Sidebar content
 *   </Layout.Sider>
 *   <Layout>
 *     <Layout.Header engine="titan">Header</Layout.Header>
 *     <Layout.Content engine="titan">Content</Layout.Content>
 *   </Layout>
 * </Layout>
 * ```
 *
 * @see {@link Layout} - The main engine-aware component
 * @module Layout/Engines/Titan
 * @category Layout
 * @package @rottay/design-system
 */
import React from 'react';
import { Layout as AntLayout } from 'antd';
import type {
  LayoutProps,
  LayoutHeaderProps,
  LayoutSiderProps,
  LayoutContentProps,
  LayoutFooterProps,
} from '../../types';

export const Layout = React.forwardRef<HTMLDivElement, LayoutProps>(
  (props, ref) => {
    const { hasSider, children, className, style } = props;
    return (
      <AntLayout ref={ref} hasSider={hasSider} className={className} style={style}>
        {children}
      </AntLayout>
    );
  }
);
Layout.displayName = 'Layout.Titan';

export const Header = React.forwardRef<HTMLDivElement, LayoutHeaderProps>(
  (props, ref) => {
    const { height, children, className, style } = props;
    const headerStyle = height ? { ...style, height } : style;
    return (
      <AntLayout.Header ref={ref} className={className} style={headerStyle}>
        {children}
      </AntLayout.Header>
    );
  }
);
Header.displayName = 'Layout.Header.Titan';

export const Sider = React.forwardRef<HTMLDivElement, LayoutSiderProps>(
  (props, ref) => {
    const {
      width,
      collapsedWidth,
      collapsed,
      defaultCollapsed,
      collapsible,
      onCollapse,
      trigger,
      breakpoint,
      theme,
      children,
      className,
      style,
    } = props;
    return (
      <AntLayout.Sider
        ref={ref}
        width={width}
        collapsedWidth={collapsedWidth}
        collapsed={collapsed}
        defaultCollapsed={defaultCollapsed}
        collapsible={collapsible}
        onCollapse={onCollapse}
        trigger={trigger}
        breakpoint={breakpoint}
        theme={theme}
        className={className}
        style={style}
      >
        {children}
      </AntLayout.Sider>
    );
  }
);
Sider.displayName = 'Layout.Sider.Titan';

export const Content = React.forwardRef<HTMLDivElement, LayoutContentProps>(
  (props, ref) => {
    const { children, className, style } = props;
    return (
      <AntLayout.Content ref={ref} className={className} style={style}>
        {children}
      </AntLayout.Content>
    );
  }
);
Content.displayName = 'Layout.Content.Titan';

export const Footer = React.forwardRef<HTMLDivElement, LayoutFooterProps>(
  (props, ref) => {
    const { children, className, style } = props;
    return (
      <AntLayout.Footer ref={ref} className={className} style={style}>
        {children}
      </AntLayout.Footer>
    );
  }
);
Footer.displayName = 'Layout.Footer.Titan';

export default Layout;
