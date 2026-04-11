'use client';

/**
 * @fileoverview AppShell — DS-owned application shell structure.
 *
 * Provides sidebar + header + content layout with:
 * - Controlled/uncontrolled collapse (desktop only)
 * - Separate mobile drawer state (never inherits desktop collapsed)
 * - DS token-driven geometry and styling
 * - Slot-based composition (app provides content, DS owns chrome)
 *
 * @example
 * ```tsx
 * <AppShell
 *   collapsed={collapsed}
 *   onCollapsedChange={setCollapsed}
 *   sidebar={{ logo: <Logo />, nav: <NavMenu />, footer: <UserCard /> }}
 *   header={{ center: <Search />, right: <Actions /> }}
 * >
 *   <PageContent />
 * </AppShell>
 * ```
 */

import React, { useState, useCallback, useEffect, createContext, useContext } from 'react';
import type { AppShellProps } from './types';
import { SHELL_DEFAULTS } from './types';

// Re-export types for barrel consumers
export type {
  AppShellProps,
  ShellSidebarSlots,
  ShellHeaderSlots,
  ShellGeometry,
} from './types';
export { SHELL_DEFAULTS } from './types';

// ---------------------------------------------------------------------------
// Context — allows children to read shell state
// ---------------------------------------------------------------------------

export interface ShellContextValue {
  collapsed: boolean;
  sidebarWidth: number;
  sidebarCollapsedWidth: number;
  headerHeight: number;
  toggleCollapse: () => void;
}

const ShellContext = createContext<ShellContextValue | null>(null);

/** Read shell state from any descendant. */
export function useShellContext(): ShellContextValue | null {
  return useContext(ShellContext);
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function AppShell({
  sidebar,
  header,
  children,
  collapsed: controlledCollapsed,
  defaultCollapsed = false,
  onCollapsedChange,
  geometry,
  floatingContent,
  footer,
  className = '',
  style,
}: AppShellProps) {
  // -- Desktop collapse state (controlled/uncontrolled) ---------------------
  const [internalCollapsed, setInternalCollapsed] = useState(defaultCollapsed);
  const collapsed = controlledCollapsed !== undefined ? controlledCollapsed : internalCollapsed;

  const setCollapsed = useCallback(
    (next: boolean) => {
      if (controlledCollapsed === undefined) {
        setInternalCollapsed(next);
      }
      onCollapsedChange?.(next);
    },
    [controlledCollapsed, onCollapsedChange],
  );

  const toggleCollapse = useCallback(() => setCollapsed(!collapsed), [collapsed, setCollapsed]);

  // -- Mobile drawer state (independent of desktop collapsed) ---------------
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(max-width: 768px)');
    const handler = (e: MediaQueryListEvent | MediaQueryList) => {
      setIsMobile(e.matches);
      if (e.matches) setMobileOpen(false); // close drawer on resize to mobile
    };
    handler(mq);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Close mobile drawer on route changes (children change)
  useEffect(() => {
    if (isMobile) setMobileOpen(false);
  }, [children, isMobile]);

  // -- Geometry (numbers only, no string/CSS var parsing) -------------------
  const sidebarWidth = geometry?.sidebarWidth ?? SHELL_DEFAULTS.sidebarWidth;
  const sidebarCollapsedWidth = geometry?.sidebarCollapsedWidth ?? SHELL_DEFAULTS.sidebarCollapsedWidth;
  const headerHeight = geometry?.headerHeight ?? SHELL_DEFAULTS.headerHeight;
  const sidebarHeaderHeight = geometry?.sidebarHeaderHeight ?? SHELL_DEFAULTS.sidebarHeaderHeight;
  const transition = geometry?.collapseTransition ?? SHELL_DEFAULTS.collapseTransition;

  const activeSidebarWidth = sidebar ? (collapsed ? sidebarCollapsedWidth : sidebarWidth) : 0;

  // -- Context value --------------------------------------------------------
  const contextValue: ShellContextValue = {
    collapsed,
    sidebarWidth,
    sidebarCollapsedWidth,
    headerHeight,
    toggleCollapse,
  };

  // -- Shared sidebar content renderer --------------------------------------
  const renderSidebarContent = (isDrawer: boolean) => (
    <>
      {sidebar?.logo && (
        <div
          style={{
            height: sidebarHeaderHeight,
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: (!isDrawer && collapsed) ? 'center' : 'flex-start',
            padding: (!isDrawer && collapsed) ? '0' : '0 var(--ds-spacing-5, 18px)',
            borderBottom: '1px solid var(--ds-sidebar-border, var(--ds-color-border-subtle))',
            overflow: 'hidden',
          }}
        >
          {sidebar.logo}
        </div>
      )}
      {sidebar?.nav && (
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            overflowX: 'hidden',
            padding: (!isDrawer && collapsed)
              ? 'var(--ds-spacing-3, 12px) var(--ds-spacing-2, 8px)'
              : 'var(--ds-spacing-3, 10px) var(--ds-spacing-3, 10px) var(--ds-spacing-3, 12px)',
          }}
        >
          {sidebar.nav}
        </div>
      )}
      {sidebar?.footer && (
        <div
          style={{
            flexShrink: 0,
            padding: (!isDrawer && collapsed)
              ? 'var(--ds-spacing-3, 12px) var(--ds-spacing-2, 8px)'
              : 'var(--ds-spacing-3, 12px) var(--ds-spacing-3, 10px) var(--ds-spacing-3, 14px)',
            borderTop: '1px solid var(--ds-sidebar-border, var(--ds-color-border-subtle))',
            background: 'var(--ds-sidebar-footer-bg, var(--ds-sidebar-bg))',
          }}
        >
          {sidebar.footer}
        </div>
      )}
    </>
  );

  // -- Render ---------------------------------------------------------------
  return (
    <ShellContext.Provider value={contextValue}>
      <div
        className={className}
        style={{
          minHeight: '100vh',
          display: 'flex',
          background: 'var(--ds-surface-canvas)',
          ...style,
        }}
      >
        {/* ---- Desktop sidebar ---- */}
        {sidebar && !isMobile && (
          <aside
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              bottom: 0,
              width: activeSidebarWidth,
              zIndex: 100,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              transition: `width ${transition}`,
              background: 'var(--ds-sidebar-bg, var(--ds-surface-shell, #0D0D10))',
              borderRight: '1px solid var(--ds-sidebar-border, var(--ds-color-border-subtle))',
            }}
          >
            {renderSidebarContent(false)}
          </aside>
        )}

        {/* ---- Mobile drawer (always expanded, independent of collapsed) ---- */}
        {sidebar && isMobile && mobileOpen && (
          <>
            <div
              onClick={() => setMobileOpen(false)}
              role="presentation"
              style={{
                position: 'fixed',
                inset: 0,
                zIndex: 199,
                background: 'var(--ds-overlay-backdrop, rgba(0, 0, 0, 0.5))',
              }}
            />
            <aside
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                bottom: 0,
                width: sidebarWidth, // always full width, never collapsed
                zIndex: 200,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                background: 'var(--ds-sidebar-bg, var(--ds-surface-shell, #0D0D10))',
                borderRight: '1px solid var(--ds-sidebar-border, var(--ds-color-border-subtle))',
                boxShadow: 'var(--ds-elevation-3)',
              }}
            >
              {renderSidebarContent(true)}
            </aside>
          </>
        )}

        {/* ---- Main area ---- */}
        <div
          style={{
            flex: 1,
            marginLeft: isMobile ? 0 : activeSidebarWidth,
            transition: isMobile ? 'none' : `margin-left ${transition}`,
            display: 'flex',
            flexDirection: 'column',
            minHeight: '100vh',
            width: isMobile ? '100%' : `calc(100dvw - ${activeSidebarWidth}px)`,
          }}
        >
          {/* Header */}
          {header && (
            <header
              style={{
                position: 'sticky',
                top: 0,
                zIndex: 50,
                height: headerHeight,
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                padding: '0 var(--ds-spacing-6, 24px)',
                background: 'var(--ds-layout-header-bg, var(--ds-surface-canvas))',
                borderBottom: '1px solid var(--ds-layout-header-border, var(--ds-color-border-subtle))',
                backdropFilter: 'var(--ds-layout-header-backdrop, blur(12px))',
                WebkitBackdropFilter: 'var(--ds-layout-header-backdrop, blur(12px))',
              }}
            >
              {/* Mobile hamburger */}
              {isMobile && sidebar && (
                <button
                  type="button"
                  onClick={() => setMobileOpen(true)}
                  aria-label="Open navigation"
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--ds-color-text-primary)',
                    fontSize: 20,
                    cursor: 'pointer',
                    marginRight: 'var(--ds-spacing-3, 12px)',
                    padding: 'var(--ds-spacing-1, 4px)',
                  }}
                >
                  &#9776;
                </button>
              )}
              <div style={{ flex: 1 }}>{header.left}</div>
              <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>{header.center}</div>
              <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', gap: 'var(--ds-spacing-1, 4px)' }}>{header.right}</div>
            </header>
          )}

          {/* Content */}
          <main style={{ flex: 1 }}>
            {children}
          </main>

          {/* Footer */}
          {footer && (
            <footer style={{ flexShrink: 0 }}>
              {footer}
            </footer>
          )}
        </div>

        {/* Floating content */}
        {floatingContent}
      </div>
    </ShellContext.Provider>
  );
}

AppShell.displayName = 'AppShell';
