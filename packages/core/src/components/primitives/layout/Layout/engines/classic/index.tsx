'use client';

/**
 * @fileoverview Layout Classic Engine - Rottay Design System
 * @description Classic (Ant Design) implementation of the Layout compound component.
 * Wraps Ant Design's Layout components with full feature parity.
 *
 * @remarks
 * The Classic engine provides:
 * - Direct passthrough to Ant Design Layout, Header, Sider, Content, Footer
 * - Full Ant Design styling and theming support
 * - Native collapsible sidebar with all Ant Design features
 * - Responsive breakpoint support for auto-collapse
 *
 * @example Using Classic Engine
 * ```tsx
 * import { Layout } from '@rottay/design-system';
 *
 * <Layout engine="classic" hasSider>
 *   <Layout.Sider engine="classic" collapsible>
 *     Sidebar content
 *   </Layout.Sider>
 *   <Layout>
 *     <Layout.Header engine="classic">Header</Layout.Header>
 *     <Layout.Content engine="classic">Content</Layout.Content>
 *   </Layout>
 * </Layout>
 * ```
 *
 * @see {@link Layout} - The main engine-aware component
 * @module Layout/Engines/Classic
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
} from '../../Layout.types';

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
Layout.displayName = 'Layout.Classic';

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
Header.displayName = 'Layout.Header.Classic';

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
Sider.displayName = 'Layout.Sider.Classic';

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
Content.displayName = 'Layout.Content.Classic';

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
Footer.displayName = 'Layout.Footer.Classic';

export default Layout;
