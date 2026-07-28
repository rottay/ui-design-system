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
import type { AppShellProps, ShellInset, ShellInsetByPosture, ShellPosture } from './contracts';
import { SHELL_DEFAULTS } from './contracts';
import { useBreakpoints } from '@/infrastructure/runtime/responsive/composition/react/provider/breakpoint-state';
import { useOptionalTranslation } from '@/infrastructure/runtime/i18n';
import { ActionCloseIcon } from '@/graphics/icons/presentation/semantic/generated/roles/action-close';
import { NavigationMenuIcon } from '@/graphics/icons/presentation/semantic/generated/roles/navigation-menu';
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
} from './contracts';
export { SHELL_DEFAULTS } from './contracts';
export { BottomTabBar, BOTTOM_TAB_BAR_DEFAULTS } from './bottom-tab-bar';
export type { BottomTabBarProps, BottomTabBarItem } from './bottom-tab-bar';

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
  return postureValue === undefined ? SHELL_DEFAULTS.bottomInset : toCssLength(postureValue);
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
  const contentId = useId();
  const { isMobile, isTablet, isMobileOrTablet } = useBreakpoints();
  const posture: ShellPosture = isTablet ? 'tablet' : isMobile ? 'phone' : 'desktop';
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
  const sidebarCollapsedWidth =
    geometry?.sidebarCollapsedWidth ?? SHELL_DEFAULTS.sidebarCollapsedWidth;
  const headerHeight = geometry?.headerHeight ?? SHELL_DEFAULTS.headerHeight;
  const sidebarHeaderHeight = geometry?.sidebarHeaderHeight ?? SHELL_DEFAULTS.sidebarHeaderHeight;
  const transition = geometry?.collapseTransition ?? SHELL_DEFAULTS.collapseTransition;
  const bottomInset = resolveBottomInset(geometry?.bottomInset, posture);

  // -- Guarded i18n channel (K4 idiom): chrome labels resolve through the
  //    `components` catalog when an I18nProvider is mounted; without one the
  //    documented English floor renders, byte-identical to the pre-i18n
  //    contract. An explicit `sidebar.navigationLabel` prop always wins. ----
  const i18n = useOptionalTranslation('components');
  const navigationLabel =
    sidebar?.navigationLabel?.trim() ||
    i18n?.tOr('appShell.navigation.label', 'Navigation') ||
    'Navigation';
  const openNavigationLabel =
    i18n?.tOr('appShell.navigation.open', `Open ${navigationLabel}`, { label: navigationLabel }) ??
    `Open ${navigationLabel}`;
  const closeNavigationLabel =
    i18n?.tOr('appShell.navigation.close', `Close ${navigationLabel}`, { label: navigationLabel }) ??
    `Close ${navigationLabel}`;
  const skipToContentLabel =
    i18n?.tOr('appShell.skipToContent.label', 'Skip to main content') ?? 'Skip to main content';

  const sidebarInlineSize = `var(--ds-shell-sidebar-width, ${sidebarWidth}px)`;
  const sidebarCollapsedInlineSize = `var(--ds-shell-sidebar-collapsed-width, ${sidebarCollapsedWidth}px)`;
  const headerBlockSize = `var(--ds-shell-header-block-size, var(--ds-shell-topbar-height, ${headerHeight}px))`;
  const sidebarHeaderBlockSize = `var(--ds-shell-sidebar-header-block-size, var(--ds-shell-topbar-height, ${sidebarHeaderHeight}px))`;
  const activeSidebarInlineSize = collapsed ? sidebarCollapsedInlineSize : sidebarInlineSize;
  const hasHeader = Boolean(header || (isCompact && sidebar));
  const desktopSidebarInset =
    sidebar && !isCompact
      ? `calc(${activeSidebarInlineSize} + var(--ds-shell-safe-area-left))`
      : '0px';

  // -- Context value --------------------------------------------------------
  const contextValue = useMemo<ShellContextValue>(
    () => ({
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
    }),
    [
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
    ],
  );

  // -- Shared sidebar content renderer --------------------------------------
  const renderSidebarContent = (isDrawer: boolean) => (
    <>
      {isDrawer && (
        <div
          className="rottay-app-shell__navigation-drawer-header"
          data-part="navigation-drawer-header"
          data-compact="true"
          style={
            {
              '--ds-shell-resolved-sidebar-header-min-block-size': `max(${sidebarHeaderBlockSize}, 44px)`,
            } as ShellCustomProperties
          }
        >
          <div className="rottay-app-shell__navigation-drawer-logo">{sidebar?.logo}</div>
          <button
            type="button"
            className="rottay-app-shell__navigation-close"
            data-part="navigation-close"
            onClick={closeNavigation}
            aria-label={closeNavigationLabel}
          >
            <ActionCloseIcon decorative size={20} />
          </button>
        </div>
      )}
      {!isDrawer && sidebar?.logo && (
        <div
          className="rottay-app-shell__navigation-logo"
          data-part="navigation-logo"
          data-collapsed={collapsed ? 'true' : 'false'}
          data-compact="false"
          style={
            {
              '--ds-shell-resolved-sidebar-header-block-size': sidebarHeaderBlockSize,
            } as ShellCustomProperties
          }
        >
          {sidebar.logo}
        </div>
      )}
      {sidebar?.nav && (
        <div
          className="rottay-app-shell__navigation-body"
          data-part="navigation-body"
          data-collapsed={!isDrawer && collapsed ? 'true' : 'false'}
          data-compact={isDrawer ? 'true' : 'false'}
        >
          {sidebar.nav}
        </div>
      )}
      {sidebar?.footer && (
        <div
          className="rottay-app-shell__navigation-footer"
          data-part="navigation-footer"
          data-collapsed={!isDrawer && collapsed ? 'true' : 'false'}
          data-compact={isDrawer ? 'true' : 'false'}
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
    '--ds-shell-header-height': headerBlockSize,
    '--ds-shell-top-inset': hasHeader
      ? `calc(${headerBlockSize} + var(--ds-shell-safe-area-top))`
      : 'var(--ds-shell-safe-area-top)',
    '--ds-shell-bottom-inset': bottomInset,
    '--ds-shell-inline-start-inset': isCompact
      ? 'var(--ds-shell-safe-area-left)'
      : desktopSidebarInset,
    '--ds-shell-inline-end-inset': 'var(--ds-shell-safe-area-right)',
    '--ds-shell-collapse-transition': transition,
    '--ds-shell-resolved-main-transition': isCompact ? 'none' : `margin-inline-start ${transition}`,
    ...style,
  };

  return (
    <ShellContext.Provider value={contextValue}>
      <div
        className={['rottay-app-shell', className].filter(Boolean).join(' ')}
        data-part="root"
        data-posture={posture}
        data-collapsed={collapsed ? 'true' : 'false'}
        data-compact={isCompact ? 'true' : 'false'}
        style={rootStyle}
      >
        {/* ---- Skip link: first tab stop, targets the content landmark ---- */}
        <a
          href={`#${contentId}`}
          className="rottay-app-shell__skip-link"
          data-part="skip-link"
        >
          {skipToContentLabel}
        </a>

        {/* ---- Desktop sidebar ---- */}
        {sidebar && !isCompact && (
          <aside
            className="rottay-app-shell__navigation-sidebar"
            data-part="navigation-sidebar"
            data-collapsed={collapsed ? 'true' : 'false'}
            data-compact="false"
            aria-label={navigationLabel}
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
            bodyClassName="rottay-app-shell__navigation-drawer-body"
            bodyStyle={{
              // The Sheet engine writes its scroll-body padding/overflow inline.
              // The drawer body is a slot compositor, not a scroll region (the
              // navigation body scrolls), so the shell restates the contract
              // through the sanctioned `bodyStyle` channel instead of CSS
              // `!important`. `bodyStyle` spreads last inside the engine.
              padding: 'var(--ds-shell-navigation-drawer-body-padding, 0)',
              overflow: 'hidden',
            }}
            surfaceStyle={
              {
                '--ds-shell-resolved-drawer-inline-size': `min(${sidebarInlineSize}, 100dvw)`,
                // Sheet owns the portal position inline. The shell contributes only
                // the runtime width that cannot be expressed from portal-inherited
                // state; every static declaration lives in the colocated stylesheet.
                width: 'var(--ds-shell-resolved-drawer-inline-size)',
              } as ShellCustomProperties
            }
          >
            {renderSidebarContent(true)}
          </Sheet>
        )}

        {/* ---- Main area ---- */}
        <div
          className="rottay-app-shell__main"
          data-part="main-area"
          data-compact={isCompact ? 'true' : 'false'}
          data-has-header={hasHeader ? 'true' : 'false'}
        >
          {/* Header */}
          {hasHeader && (
            <header
              className="rottay-app-shell__header"
              data-part="header"
              data-compact={isCompact ? 'true' : 'false'}
            >
              {/* Compact navigation trigger */}
              {isCompact && sidebar && (
                <button
                  type="button"
                  className="rottay-app-shell__navigation-trigger"
                  data-part="navigation-trigger"
                  onClick={openNavigation}
                  aria-label={openNavigationLabel}
                  aria-expanded={navigationOpen}
                  aria-controls={navigationDialogId}
                >
                  <NavigationMenuIcon decorative size={22} />
                </button>
              )}
              <div className="rottay-app-shell__header-slot" data-part="header-left">
                {header?.left}
              </div>
              <div
                className="rottay-app-shell__header-slot rottay-app-shell__header-slot--center"
                data-part="header-center"
              >
                {header?.center}
              </div>
              <div
                className="rottay-app-shell__header-slot rottay-app-shell__header-slot--right"
                data-part="header-right"
              >
                {header?.right}
              </div>
            </header>
          )}

          {/* Content */}
          <main
            id={contentId}
            tabIndex={-1}
            className="rottay-app-shell__content"
            data-part="content"
          >
            {children}
          </main>

          {/* Footer */}
          {footer && (
            <footer className="rottay-app-shell__footer" data-part="footer">
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
