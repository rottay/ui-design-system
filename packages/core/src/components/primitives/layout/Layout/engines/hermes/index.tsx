'use client';

/**
 * Layout - Hermes Engine (DaisyUI/Tailwind)
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

export const Layout = React.forwardRef<HTMLDivElement, LayoutProps>(
  (props, ref) => {
    const { hasSider, children, className = '', style } = props;
    return (
      <div
        ref={ref}
        className={`flex flex-col min-h-screen ${hasSider ? 'md:flex-row' : ''} ${className}`}
        style={style}
      >
        {children}
      </div>
    );
  }
);
Layout.displayName = 'Layout.Hermes';

export const Header = React.forwardRef<HTMLElement, LayoutHeaderProps>(
  (props, ref) => {
    const { height = LAYOUT_DEFAULTS.headerHeight, children, className = '', style } = props;
    return (
      <header
        ref={ref}
        className={`bg-base-200 px-4 flex items-center shrink-0 ${className}`}
        style={{ height: typeof height === 'number' ? `${height}px` : height, ...style }}
      >
        {children}
      </header>
    );
  }
);
Header.displayName = 'Layout.Header.Hermes';

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
    const themeClass = theme === 'dark' ? 'bg-base-300 text-base-content' : 'bg-base-100';

    return (
      <aside
        ref={ref}
        className={`shrink-0 overflow-y-auto transition-all duration-300 ${themeClass} ${className}`}
        style={{ width: typeof currentWidth === 'number' ? `${currentWidth}px` : currentWidth, ...style }}
      >
        {children}
        {collapsible && (
          <button
            type="button"
            className="btn btn-ghost btn-sm w-full mt-2"
            onClick={handleToggle}
          >
            {trigger ?? (isCollapsed ? '→' : '←')}
          </button>
        )}
      </aside>
    );
  }
);
Sider.displayName = 'Layout.Sider.Hermes';

export const Content = React.forwardRef<HTMLElement, LayoutContentProps>(
  (props, ref) => {
    const { children, className = '', style } = props;
    return (
      <main ref={ref} className={`flex-1 p-4 overflow-auto ${className}`} style={style}>
        {children}
      </main>
    );
  }
);
Content.displayName = 'Layout.Content.Hermes';

export const Footer = React.forwardRef<HTMLElement, LayoutFooterProps>(
  (props, ref) => {
    const { children, className = '', style } = props;
    return (
      <footer ref={ref} className={`bg-base-200 px-4 py-2 shrink-0 ${className}`} style={style}>
        {children}
      </footer>
    );
  }
);
Footer.displayName = 'Layout.Footer.Hermes';

export default Layout;
