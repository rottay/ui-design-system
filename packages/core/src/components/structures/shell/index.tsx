'use client';

/**
 * @fileoverview AppShell — DS-owned application shell structure.
 *
 * Provides sidebar + header + content layout with:
 * - Controlled/uncontrolled collapse (desktop only)
 * - Shared phone/tablet navigation drawer (never inherits desktop collapsed)
 * - Canonical safe-area and fixed-bottom-chrome inset ownership
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

import React, {
  useState,
  useCallback,
  useEffect,
  useId,
  useMemo,
  createContext,
  useContext,
} from 'react';
import type {
  AppShellProps,
  ShellInset,
  ShellInsetByPosture,
  ShellPosture,
} from './types';
import { SHELL_DEFAULTS } from './types';
import { useBreakpoints } from '../../../hooks/responsive/useBreakpoints';
import { Sheet } from '../../primitives/overlay/Sheet';

// Re-export types for barrel consumers
export type {
  AppShellProps,
  ShellSidebarSlots,
  ShellHeaderSlots,
  ShellGeometry,
  ShellInset,
  ShellInsetByPosture,
  ShellPosture,
} from './types';
export { SHELL_DEFAULTS } from './types';

// ---------------------------------------------------------------------------
// Context — allows children to read shell state
// ---------------------------------------------------------------------------

export interface ShellContextValue {
  collapsed: boolean;
  /** Current shared responsive posture. */
  posture: ShellPosture;
  /** Phone/tablet postures use overlay navigation instead of a fixed sidebar. */
  isCompact: boolean;
  /** Whether compact navigation is currently open. */
  navigationOpen: boolean;
  sidebarWidth: number;
  sidebarCollapsedWidth: number;
  headerHeight: number;
  toggleCollapse: () => void;
  openNavigation: () => void;
  closeNavigation: () => void;
}

const ShellContext = createContext<ShellContextValue | null>(null);

/** Read shell state from any descendant. */
export function useShellContext(): ShellContextValue | null {
  return useContext(ShellContext);
}

type ShellCustomProperties = React.CSSProperties &
  Partial<Record<`--ds-shell-${string}`, string | number>>;

function toCssLength(value: number | string): string {
  return typeof value === 'number' ? `${value}px` : value;
}

function resolveBottomInset(
  value: ShellInset | ShellInsetByPosture | undefined,
  posture: ShellPosture,
): string {
  if (typeof value === 'number' || typeof value === 'string') {
    return toCssLength(value);
  }

  const postureValue = value?.[posture];
  return postureValue === undefined
    ? SHELL_DEFAULTS.bottomInset
    : toCssLength(postureValue);
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

  // -- Compact navigation state (independent of desktop collapsed) -----------
  const [navigationOpen, setNavigationOpen] = useState(false);
  const navigationDialogId = useId();
  const { isMobile, isTablet, isMobileOrTablet } = useBreakpoints();
  const posture: ShellPosture = isTablet
    ? 'tablet'
    : isMobile
      ? 'phone'
      : 'desktop';
  const isCompact = isMobileOrTablet;

  const openNavigation = useCallback(() => setNavigationOpen(true), []);
  const closeNavigation = useCallback(() => setNavigationOpen(false), []);

  useEffect(() => {
    setNavigationOpen(false);
  }, [posture]);

  // Close compact navigation on route changes (children change).
  useEffect(() => {
    if (isCompact) setNavigationOpen(false);
  }, [children, isCompact]);

  // -- Geometry --------------------------------------------------------------
  const sidebarWidth = geometry?.sidebarWidth ?? SHELL_DEFAULTS.sidebarWidth;
  const sidebarCollapsedWidth = geometry?.sidebarCollapsedWidth ?? SHELL_DEFAULTS.sidebarCollapsedWidth;
  const headerHeight = geometry?.headerHeight ?? SHELL_DEFAULTS.headerHeight;
  const sidebarHeaderHeight = geometry?.sidebarHeaderHeight ?? SHELL_DEFAULTS.sidebarHeaderHeight;
  const transition = geometry?.collapseTransition ?? SHELL_DEFAULTS.collapseTransition;
  const bottomInset = resolveBottomInset(
    geometry?.bottomInset,
    posture,
  );
  const navigationLabel = sidebar?.navigationLabel?.trim() || 'Navigation';

  const activeSidebarWidth = sidebar ? (collapsed ? sidebarCollapsedWidth : sidebarWidth) : 0;
  const hasHeader = Boolean(header || (isCompact && sidebar));
  const desktopSidebarInset = sidebar && !isCompact
    ? `calc(${activeSidebarWidth}px + var(--ds-shell-safe-area-left))`
    : '0px';

  // -- Context value --------------------------------------------------------
  const contextValue = useMemo<ShellContextValue>(() => ({
    collapsed,
    posture,
    isCompact,
    navigationOpen,
    sidebarWidth,
    sidebarCollapsedWidth,
    headerHeight,
    toggleCollapse,
    openNavigation,
    closeNavigation,
  }), [
    closeNavigation,
    collapsed,
    headerHeight,
    isCompact,
    navigationOpen,
    openNavigation,
    posture,
    sidebarCollapsedWidth,
    sidebarWidth,
    toggleCollapse,
  ]);

  // -- Shared sidebar content renderer --------------------------------------
  const renderSidebarContent = (isDrawer: boolean) => (
    <>
      {isDrawer && (
        <div
          data-part="navigation-drawer-header"
          style={{
            minHeight: Math.max(sidebarHeaderHeight, 44),
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 'var(--ds-spacing-3, 12px)',
            padding: '0 var(--ds-spacing-3, 12px) 0 var(--ds-spacing-5, 20px)',
            borderBottom: '1px solid var(--ds-sidebar-border, var(--ds-color-border-subtle))',
            overflow: 'hidden',
          }}
        >
          <div style={{ minWidth: 0, overflow: 'hidden' }}>{sidebar?.logo}</div>
          <button
            type="button"
            data-part="navigation-close"
            onClick={closeNavigation}
            aria-label={`Close ${navigationLabel}`}
            style={{
              width: 44,
              minWidth: 44,
              height: 44,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              padding: 0,
              border: 'none',
              borderRadius: 'var(--ds-radius-md, 8px)',
              background: 'transparent',
              color: 'var(--ds-color-text-primary)',
              cursor: 'pointer',
            }}
          >
            <svg
              aria-hidden="true"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
      {!isDrawer && sidebar?.logo && (
        <div
          data-part="navigation-logo"
          style={{
            height: sidebarHeaderHeight,
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: (!isDrawer && collapsed) ? 'center' : 'flex-start',
            padding: (!isDrawer && collapsed) ? '0' : '0 var(--ds-spacing-5, 20px)',
            borderBottom: '1px solid var(--ds-sidebar-border, var(--ds-color-border-subtle))',
            overflow: 'hidden',
          }}
        >
          {sidebar.logo}
        </div>
      )}
      {sidebar?.nav && (
        <div
          data-part="navigation-body"
          style={{
            flex: 1,
            overflowY: 'auto',
            overflowX: 'hidden',
            padding: (!isDrawer && collapsed)
              ? 'var(--ds-spacing-3, 12px) var(--ds-spacing-2, 8px)'
              : 'var(--ds-spacing-3, 12px) var(--ds-spacing-3, 12px) calc(var(--ds-spacing-3, 12px) + 28px) var(--ds-spacing-3, 12px)',
            scrollPaddingBlockEnd: 'calc(var(--ds-spacing-6, 24px) + 76px)',
          }}
        >
          {sidebar.nav}
        </div>
      )}
      {sidebar?.footer && (
        <div
          data-part="navigation-footer"
          style={{
            flexShrink: 0,
            padding: (!isDrawer && collapsed)
              ? 'var(--ds-spacing-3, 12px) var(--ds-spacing-2, 8px)'
              : 'var(--ds-spacing-3, 12px) var(--ds-spacing-3, 12px) var(--ds-spacing-3, 12px)',
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
  const rootStyle: ShellCustomProperties = {
    '--ds-shell-safe-area-top': 'env(safe-area-inset-top, 0px)',
    '--ds-shell-safe-area-right': 'env(safe-area-inset-right, 0px)',
    '--ds-shell-safe-area-bottom': 'env(safe-area-inset-bottom, 0px)',
    '--ds-shell-safe-area-left': 'env(safe-area-inset-left, 0px)',
    '--ds-shell-header-height': `${headerHeight}px`,
    '--ds-shell-top-inset': hasHeader
      ? `calc(${headerHeight}px + var(--ds-shell-safe-area-top))`
      : 'var(--ds-shell-safe-area-top)',
    '--ds-shell-bottom-inset': bottomInset,
    '--ds-shell-inline-start-inset': isCompact
      ? 'var(--ds-shell-safe-area-left)'
      : desktopSidebarInset,
    '--ds-shell-inline-end-inset': 'var(--ds-shell-safe-area-right)',
    minHeight: '100dvh',
    display: 'flex',
    background: 'var(--ds-surface-canvas)',
    ...style,
  };

  return (
    <ShellContext.Provider value={contextValue}>
      <div
        className={['rottay-app-shell', className].filter(Boolean).join(' ')}
        data-part="root"
        data-posture={posture}
        style={rootStyle}
      >
        {/* ---- Desktop sidebar ---- */}
        {sidebar && !isCompact && (
          <aside
            data-part="navigation-sidebar"
            aria-label={navigationLabel}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              bottom: 0,
              width: 'var(--ds-shell-inline-start-inset)',
              zIndex: 100,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              boxSizing: 'border-box',
              paddingInlineStart: 'var(--ds-shell-safe-area-left)',
              paddingBlockStart: 'var(--ds-shell-safe-area-top)',
              paddingBlockEnd: 'var(--ds-shell-safe-area-bottom)',
              transition: `width ${transition}`,
              background: 'var(--ds-sidebar-bg, var(--ds-surface-shell, var(--ds-color-bg-elevated, #FFFFFF)))',
              borderRight: '1px solid var(--ds-sidebar-border, var(--ds-color-border-subtle))',
            }}
          >
            {renderSidebarContent(false)}
          </aside>
        )}

        {/* ---- Phone/tablet drawer (expanded, independent of collapsed) ---- */}
        {sidebar && isCompact && (
          <Sheet
            open={navigationOpen}
            onOpenChange={setNavigationOpen}
            side="left"
            showHandle={false}
            showOverlay
            closeOnEscape
            closeOnOverlayClick
            restoreFocus
            id={navigationDialogId}
            aria-label={navigationLabel}
            surfaceClassName="rottay-app-shell__navigation-drawer"
            surfaceStyle={{
              width: `min(${sidebarWidth}px, 100dvw)`,
              maxWidth: '100dvw',
              height: '100dvh',
              maxHeight: '100dvh',
              boxSizing: 'border-box',
              // Sheet is portaled to document.body, so root-scoped custom
              // properties do not inherit into it. Resolve device env() values
              // at the surface and keep the public variables on the shell root.
              paddingBlockStart: 'env(safe-area-inset-top, 0px)',
              paddingBlockEnd: 'env(safe-area-inset-bottom, 0px)',
              paddingInlineStart: 'env(safe-area-inset-left, 0px)',
              background:
                'var(--ds-sidebar-bg, var(--ds-surface-shell, var(--ds-color-bg-elevated, #FFFFFF)))',
              borderRight:
                '1px solid var(--ds-sidebar-border, var(--ds-color-border-subtle))',
              boxShadow: 'var(--ds-elevation-3)',
            }}
            bodyStyle={{
              display: 'flex',
              flexDirection: 'column',
              minHeight: 0,
              padding: 0,
              overflow: 'hidden',
            }}
          >
            {renderSidebarContent(true)}
          </Sheet>
        )}

        {/* ---- Main area ---- */}
        <div
          data-part="main-area"
          style={{
            flex: 1,
            marginLeft: isCompact ? 0 : 'var(--ds-shell-inline-start-inset)',
            transition: isCompact ? 'none' : `margin-left ${transition}`,
            display: 'flex',
            flexDirection: 'column',
            minHeight: '100dvh',
            minWidth: 0,
            boxSizing: 'border-box',
            paddingBlockStart: hasHeader ? 0 : 'var(--ds-shell-safe-area-top)',
            paddingBlockEnd: 'var(--ds-shell-bottom-inset)',
            paddingInlineStart: isCompact ? 'var(--ds-shell-safe-area-left)' : 0,
            paddingInlineEnd: 'var(--ds-shell-safe-area-right)',
          }}
        >
          {/* Header */}
          {hasHeader && (
            <header
              data-part="header"
              style={{
                position: 'sticky',
                top: 0,
                zIndex: 50,
                height: 'var(--ds-shell-top-inset)',
                boxSizing: 'border-box',
                paddingTop: 'var(--ds-shell-safe-area-top)',
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                paddingInline: 'var(--ds-spacing-6, 24px)',
                background: 'var(--ds-layout-header-bg, var(--ds-surface-canvas))',
                borderBottom: '1px solid var(--ds-layout-header-border, var(--ds-color-border-subtle))',
                backdropFilter: 'var(--ds-layout-header-backdrop, blur(12px))',
                WebkitBackdropFilter: 'var(--ds-layout-header-backdrop, blur(12px))',
              }}
            >
              {/* Compact navigation trigger */}
              {isCompact && sidebar && (
                <button
                  type="button"
                  data-part="navigation-trigger"
                  onClick={openNavigation}
                  aria-label={`Open ${navigationLabel}`}
                  aria-expanded={navigationOpen}
                  aria-controls={navigationDialogId}
                  style={{
                    width: 44,
                    minWidth: 44,
                    height: 44,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'transparent',
                    border: 'none',
                    borderRadius: 'var(--ds-radius-md, 8px)',
                    color: 'var(--ds-color-text-primary)',
                    cursor: 'pointer',
                    marginRight: 'var(--ds-spacing-3, 12px)',
                    padding: 0,
                  }}
                >
                  <svg
                    aria-hidden="true"
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  >
                    <path d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              )}
              <div data-part="header-left" style={{ flex: 1, minWidth: 0 }}>{header?.left}</div>
              <div data-part="header-center" style={{ flex: 1, minWidth: 0, display: 'flex', justifyContent: 'center' }}>{header?.center}</div>
              <div data-part="header-right" style={{ flex: 1, minWidth: 0, display: 'flex', justifyContent: 'flex-end', gap: 'var(--ds-spacing-1, 4px)' }}>{header?.right}</div>
            </header>
          )}

          {/* Content */}
          <main data-part="content" style={{ flex: 1, minWidth: 0 }}>
            {children}
          </main>

          {/* Footer */}
          {footer && (
            <footer data-part="footer" style={{ flexShrink: 0 }}>
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
