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
} from '../Layout.types';

/**
 * Classic Layout shell -- a thin passthrough to Ant Design's Layout.
 *
 * Delegates entirely to AntLayout so consumers get full Ant Design theming,
 * collapsible sidebar behavior, and responsive breakpoint support out of the box.
 *
 * @param props - Layout container props (hasSider, className, style).
 * @returns A ref-forwarding Ant Design Layout wrapper.
 */
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

/**
 * Classic Header backed by AntLayout.Header.
 * Accepts an optional `height` override merged into the inline style.
 *
 * @param props - Header props (height, className, style).
 * @returns A ref-forwarding Ant Design Header wrapper.
 */
export const Header = React.forwardRef<HTMLDivElement, LayoutHeaderProps>(
  (props, ref) => {
    const { height, children, className, style } = props;
    // Merge height into style so it overrides the Ant Design default (64px)
    const headerStyle = height ? { ...style, height } : style;
    return (
      <AntLayout.Header ref={ref} className={className} style={headerStyle}>
        {children}
      </AntLayout.Header>
    );
  }
);
Header.displayName = 'Layout.Header.Classic';

/**
 * Classic Sider backed by AntLayout.Sider.
 *
 * Passes through all Ant Design sidebar props (collapsible, breakpoint, theme)
 * for native collapsible behavior and responsive auto-collapse at breakpoints.
 *
 * @param props - Sider props (width, collapsible, collapsed, breakpoint, theme, etc.)
 * @returns A ref-forwarding Ant Design Sider wrapper.
 */
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

/**
 * Classic Content area backed by AntLayout.Content.
 *
 * @param props - Content props (className, style).
 * @returns A ref-forwarding Ant Design Content wrapper.
 */
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

/**
 * Classic Footer backed by AntLayout.Footer.
 *
 * @param props - Footer props (className, style).
 * @returns A ref-forwarding Ant Design Footer wrapper.
 */
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
