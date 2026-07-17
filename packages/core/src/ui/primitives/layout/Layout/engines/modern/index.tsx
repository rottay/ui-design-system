'use client';

/**
 * @fileoverview Layout Modern Engine - Rottay Design System
 * @description Modern (token-driven) implementation of the Layout compound component.
 * Uses Tailwind CSS utility classes for styling with DS token theme integration.
 *
 * @remarks
 * The Modern engine generates:
 * - `flex flex-col min-h-screen` for main layout
 * - `md:flex-row` when hasSider is true (responsive row layout)
 * - `var(--ds-surface-inset)` for header/footer backgrounds
 * - `var(--ds-surface-card)` or `var(--ds-surface-panel)` for sider based on theme
 * - Custom collapsible sidebar with controlled/uncontrolled state
 *
 * @example Using Modern Engine
 * ```tsx
 * import { Layout } from '@rottay/design-system';
 *
 * // Tailwind-styled layout
 * <Layout engine="modern" hasSider>
 *   <Layout.Sider engine="modern" theme="dark" collapsible>
 *     Navigation
 *   </Layout.Sider>
 *   <Layout>
 *     <Layout.Header engine="modern">Header</Layout.Header>
 *     <Layout.Content engine="modern">Content</Layout.Content>
 *   </Layout>
 * </Layout>
 * ```
 *
 * @see {@link Layout} - The main engine-aware component
 * @module Layout/Engines/Modern
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
} from '../../contracts';
import { LAYOUT_DEFAULTS } from '../../contracts';

/**
 * Modern Layout shell using Tailwind flexbox utilities.
 *
 * Renders a full-height flex column by default. When `hasSider` is true,
 * switches to a row direction at the `md` breakpoint so the sidebar sits
 * alongside the content area on wider screens.
 *
 * @param props - Layout container props (hasSider, className, style).
 * @returns A ref-forwarding div styled with Tailwind flex utilities.
 */
export const Layout = React.forwardRef<HTMLDivElement, LayoutProps>(
  (props, ref) => {
    const { hasSider, children, className = '', style } = props;
    return (
      <div
        ref={ref}
        className={`rottay-layout rottay-layout--modern flex flex-col min-h-screen ${hasSider ? 'md:flex-row' : ''} ${className}`}
        style={style}
        data-part="root"
        data-has-sider={hasSider ? 'true' : 'false'}
      >
        {children}
      </div>
    );
  }
);
Layout.displayName = 'Layout.Modern';

/**
 * Modern Header using DS token surface-inset background and flex alignment.
 * Height is set via inline style to support both pixel and string values.
 *
 * @param props - Header props (height, className, style).
 * @returns A ref-forwarding semantic `<header>` element.
 */
export const Header = React.forwardRef<HTMLElement, LayoutHeaderProps>(
  (props, ref) => {
    const { height = LAYOUT_DEFAULTS.headerHeight, children, className = '', style } = props;
    return (
      <header
        ref={ref}
        className={`rottay-layout-header rottay-layout-header--modern px-4 flex items-center shrink-0 ${className}`}
        style={{ height: typeof height === 'number' ? `${height}px` : height, ...style }}
        data-part="header"
      >
        {children}
      </header>
    );
  }
);
Header.displayName = 'Layout.Header.Modern';

/**
 * Modern Sider with controlled/uncontrolled collapse support.
 *
 * Uses DS token styles (`--ds-surface-panel` for dark, `--ds-surface-card` for light)
 * and a CSS width transition for smooth collapse animation. Supports both
 * controlled (`collapsed` prop) and uncontrolled (`defaultCollapsed`) modes
 * following React's standard controlled-component pattern.
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
      theme = 'light',
      children,
      className = '',
      style,
    } = props;

    // Internal state for uncontrolled mode; ignored when `collapsed` is provided
    const [internalCollapsed, setInternalCollapsed] = useState(defaultCollapsed);
    // Controlled prop takes priority over internal state
    const isCollapsed = controlledCollapsed ?? internalCollapsed;

    const handleToggle = () => {
      const newCollapsed = !isCollapsed;
      // Only update internal state in uncontrolled mode
      if (controlledCollapsed === undefined) {
        setInternalCollapsed(newCollapsed);
      }
      onCollapse?.(newCollapsed);
    };

    const currentWidth = isCollapsed ? collapsedWidth : width;
    // DS tokens: surface-panel for dark sidebar, surface-card for light
    return (
      <aside
        ref={ref}
        className={`rottay-layout-sider rottay-layout-sider--modern shrink-0 overflow-y-auto transition-all duration-300 ${className}`}
        style={{
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
            style={{ height: 32, padding: '0 12px', fontSize: 13, cursor: 'pointer', width: '100%', marginTop: 8, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
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
Sider.displayName = 'Layout.Sider.Modern';

/**
 * Modern Content area -- a flex-growing `<main>` with default padding and scroll.
 *
 * @param props - Content props (className, style).
 * @returns A ref-forwarding semantic `<main>` element.
 */
export const Content = React.forwardRef<HTMLElement, LayoutContentProps>(
  (props, ref) => {
    const { children, className = '', style } = props;
    return (
      <main ref={ref} className={`rottay-layout-content flex-1 p-4 overflow-auto ${className}`} style={style} data-part="content">
        {children}
      </main>
    );
  }
);
Content.displayName = 'Layout.Content.Modern';

/**
 * Modern Footer using DS token surface-inset background.
 * Shrink-proof so it stays at its natural height even in flex overflow.
 *
 * @param props - Footer props (className, style).
 * @returns A ref-forwarding semantic `<footer>` element.
 */
export const Footer = React.forwardRef<HTMLElement, LayoutFooterProps>(
  (props, ref) => {
    const { children, className = '', style } = props;
    return (
      <footer ref={ref} className={`rottay-layout-footer rottay-layout-footer--modern px-4 py-2 shrink-0 ${className}`} style={style} data-part="footer">
        {children}
      </footer>
    );
  }
);
Footer.displayName = 'Layout.Footer.Modern';

export default Layout;
