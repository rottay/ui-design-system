'use client';

/**
 * @fileoverview AppShell — DS-owned application shell structure.
 *
 * Provides sidebar + header + content layout with:
 * - Controlled/uncontrolled collapse
 * - DS token-driven geometry and styling
 * - Slot-based composition (app provides content, DS owns chrome)
 * - Mobile overlay sidebar with backdrop
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
import type { AppShellProps, ShellGeometry } from './types';
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
// Helpers
// ---------------------------------------------------------------------------

function toPixels(value: number | string | undefined, fallback: number): number {
  if (value === undefined) return fallback;
  if (typeof value === 'number') return value;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? fallback : parsed;
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
  // -- Collapse state (controlled/uncontrolled) -----------------------------
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

  // -- Mobile overlay -------------------------------------------------------
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(max-width: 768px)');
    const handler = (e: MediaQueryListEvent | MediaQueryList) => setIsMobile(e.matches);
    handler(mq);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Close mobile sidebar on route changes (children change)
  useEffect(() => {
    if (isMobile) setMobileOpen(false);
  }, [children, isMobile]);

  // -- Geometry -------------------------------------------------------------
  const sidebarWidth = toPixels(geometry?.sidebarWidth, SHELL_DEFAULTS.sidebarWidth);
  const sidebarCollapsedWidth = toPixels(geometry?.sidebarCollapsedWidth, SHELL_DEFAULTS.sidebarCollapsedWidth);
  const headerHeight = toPixels(geometry?.headerHeight, SHELL_DEFAULTS.headerHeight);
  const sidebarHeaderHeight = toPixels(geometry?.sidebarHeaderHeight, SHELL_DEFAULTS.sidebarHeaderHeight);
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
        {/* ---- Sidebar (desktop) ---- */}
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
            {/* Logo area */}
            {sidebar.logo && (
              <div
                style={{
                  height: sidebarHeaderHeight,
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  padding: collapsed ? '0' : '0 var(--ds-spacing-5, 18px)',
                  borderBottom: '1px solid var(--ds-sidebar-border, var(--ds-color-border-subtle))',
                  overflow: 'hidden',
                }}
              >
                {sidebar.logo}
              </div>
            )}

            {/* Navigation (scrollable) */}
            {sidebar.nav && (
              <div
                style={{
                  flex: 1,
                  overflowY: 'auto',
                  overflowX: 'hidden',
                  padding: collapsed
                    ? 'var(--ds-spacing-3, 12px) var(--ds-spacing-2, 8px)'
                    : 'var(--ds-spacing-3, 10px) var(--ds-spacing-3, 10px) var(--ds-spacing-3, 12px)',
                }}
              >
                {sidebar.nav}
              </div>
            )}

            {/* User footer */}
            {sidebar.footer && (
              <div
                style={{
                  flexShrink: 0,
                  padding: collapsed
                    ? 'var(--ds-spacing-3, 12px) var(--ds-spacing-2, 8px)'
                    : 'var(--ds-spacing-3, 12px) var(--ds-spacing-3, 10px) var(--ds-spacing-3, 14px)',
                  borderTop: '1px solid var(--ds-sidebar-border, var(--ds-color-border-subtle))',
                  background: 'var(--ds-sidebar-footer-bg, var(--ds-sidebar-bg))',
                }}
              >
                {sidebar.footer}
              </div>
            )}
          </aside>
        )}

        {/* ---- Mobile sidebar overlay ---- */}
        {sidebar && isMobile && mobileOpen && (
          <>
            {/* Backdrop */}
            <div
              onClick={() => setMobileOpen(false)}
              style={{
                position: 'fixed',
                inset: 0,
                zIndex: 199,
                background: 'var(--ds-overlay-backdrop, rgba(0, 0, 0, 0.5))',
              }}
            />
            {/* Off-canvas sidebar */}
            <aside
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                bottom: 0,
                width: sidebarWidth,
                zIndex: 200,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                background: 'var(--ds-sidebar-bg, var(--ds-surface-shell, #0D0D10))',
                borderRight: '1px solid var(--ds-sidebar-border, var(--ds-color-border-subtle))',
                boxShadow: 'var(--ds-elevation-3)',
              }}
            >
              {sidebar.logo && (
                <div
                  style={{
                    height: sidebarHeaderHeight,
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0 var(--ds-spacing-5, 18px)',
                    borderBottom: '1px solid var(--ds-sidebar-border, var(--ds-color-border-subtle))',
                  }}
                >
                  {sidebar.logo}
                </div>
              )}
              {sidebar.nav && (
                <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: 'var(--ds-spacing-3, 10px)' }}>
                  {sidebar.nav}
                </div>
              )}
              {sidebar.footer && (
                <div
                  style={{
                    flexShrink: 0,
                    padding: 'var(--ds-spacing-3, 12px) var(--ds-spacing-3, 10px) var(--ds-spacing-3, 14px)',
                    borderTop: '1px solid var(--ds-sidebar-border, var(--ds-color-border-subtle))',
                    background: 'var(--ds-sidebar-footer-bg, var(--ds-sidebar-bg))',
                  }}
                >
                  {sidebar.footer}
                </div>
              )}
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
