'use client';

/**
 * @fileoverview AppShell — DS-owned application shell structure.
 *
 * Provides sidebar + header + content layout with:
 * - Controlled/uncontrolled collapse (desktop only)
 * - A navigation presentation resolved through the shared adaptation kernel:
 *   a fixed track, or an overlay drawer that never inherits desktop collapsed
 * - Canonical safe-area and fixed-bottom-chrome inset ownership
 * - DS token-driven geometry and styling
 * - Slot-based composition (app provides content, DS owns chrome)
 *
 * @example
 * ```tsx
 * <AppShell
 *   collapsed={collapsed}
 *   onCollapsedChange={setCollapsed}
 *   adapt={{ tablet: { navigation: 'sidebar' } }}
 *   sidebar={{ logo: <Logo />, nav: <NavMenu />, footer: <UserCard /> }}
 *   header={{ center: <Search />, right: <Actions /> }}
 * >
 *   <PageContent />
 * </AppShell>
 * ```
 *
 * @see `../index.ts` for the shell group barrel. This owner exports only its
 * own symbols — `AppShell`, `useShellContext` and `ShellContextValue`; the
 * shared props/geometry types live in the group's `../contracts` support owner.
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
  AppShellAdaptation,
  AppShellProps,
  ResolvedAppShellAdaptation,
  ShellInset,
  ShellInsetByPosture,
  ShellPosture,
} from '../contracts';
import { SHELL_DEFAULTS, SHELL_GEOMETRY_READS } from '../contracts';
import type { Adapt } from '@/foundation/contracts/kernel/adaptation';
import { partAttributes } from '@/foundation/behavior/kernel/anatomy';
import { useInteractionState } from '@/foundation/behavior/runtime/interaction-state';
import { useAdaptation } from '@/infrastructure/runtime/adaptation';
import { useOptionalDirection, useOptionalTranslation } from '@/infrastructure/runtime/i18n';
import { ActionCloseIcon } from '@/graphics/icons/semantic/generated/roles/action-close';
import { NavigationMenuIcon } from '@/graphics/icons/semantic/generated/roles/navigation-menu';
import { Sheet } from '../../../primitives/overlay/sheet';

// ---------------------------------------------------------------------------
// Context — allows children to read shell state
// ---------------------------------------------------------------------------

export interface ShellContextValue {
  collapsed: boolean;
  /** Current shared responsive posture. */
  posture: ShellPosture;
  /** The overlay-drawer presentation replaces the fixed track. */
  isCompact: boolean;
  /** Whether compact navigation is currently open. */
  navigationOpen: boolean;
  /** The geometry the app stated, if it stated any. */
  sidebarWidth: number | undefined;
  sidebarCollapsedWidth: number | undefined;
  headerHeight: number | undefined;
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

/** The family's navigation defaults: phone and tablet present an overlay. */
const NAVIGATION_DEFAULTS: Adapt<AppShellAdaptation> = {
  phone: { navigation: 'drawer' },
  tablet: { navigation: 'drawer' },
};

const BASE_ADAPTATION: ResolvedAppShellAdaptation = { navigation: 'sidebar' };

/**
 * The collapse cadence, read the way the skin reads it but ending in the
 * shell's own pre-derivation literal rather than in another name: a var()
 * chain with no terminal value is invalid at computed-value time wherever the
 * family deriver has not been registered, and an invalid `transition` is no
 * transition at all.
 */
const SHELL_COLLAPSE_TRANSITION_READ =
  'var(--ds-shell-collapse-transition, 220ms cubic-bezier(0.16, 1, 0.3, 1))';

/**
 * The adapt slot, declared on the owner the layout-sensitive registry names.
 * Extending `Pick` makes this member and the group contract's one thing: they
 * cannot drift apart without failing to compile.
 */
interface AppShellAdaptSlot extends Pick<AppShellProps, 'adapt'> {
  adapt?: Adapt<AppShellAdaptation>;
}

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

/** A stated geometry number travels on its own channel; an omission does not. */
function statedChannel(
  channel: `--ds-shell-${string}`,
  value: number | string | undefined,
): ShellCustomProperties {
  return value === undefined ? {} : { [channel]: toCssLength(value) };
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
  adapt,
  geometry,
  floatingContent,
  footer,
  className = '',
  style,
}: AppShellProps & AppShellAdaptSlot) {
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
  // The shell IS the viewport band: its structure changes with the device
  // class, never with a box of its own, so no container is observed.
  const { posture: resolvedPosture, adaptation, postureAttribute } = useAdaptation<
    ResolvedAppShellAdaptation
  >(adapt, { base: BASE_ADAPTATION, defaults: NAVIGATION_DEFAULTS });
  const posture = resolvedPosture.viewport;
  const isCompact = adaptation.navigation === 'drawer';

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

  // Text direction (provider-free environments stay LTR, matching the
  // documented standalone contract). The compact drawer slides from the
  // inline-start edge: physical left in LTR, physical right in RTL — Sheet
  // sides are physical, so the shell resolves the side here.
  const direction = useOptionalDirection();
  const drawerSide = direction === 'rtl' ? 'right' : 'left';

  // The interaction triad for the two chrome actions is decided once, here,
  // and read off `data-state` by the skin.
  const triggerInteraction = useInteractionState();
  const closeInteraction = useInteractionState();
  const skipLinkInteraction = useInteractionState();

  // The four geometry reads state the same chain their deriver produces, so
  // the shell still resolves before the deriver is registered and inside the
  // Sheet's portal, where the root's own stamps do not reach. The fallback
  // arm is dead whenever the channel has a producer, and the deriver's
  // contract suite pins the two texts identical so they cannot drift.
  const sidebarInlineSize = SHELL_GEOMETRY_READS.sidebarWidth;
  const sidebarCollapsedInlineSize = SHELL_GEOMETRY_READS.sidebarCollapsedWidth;
  const headerBlockSize = SHELL_GEOMETRY_READS.headerBlockSize;
  const sidebarHeaderBlockSize = SHELL_GEOMETRY_READS.sidebarHeaderBlockSize;
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
      sidebarWidth: geometry?.sidebarWidth,
      sidebarCollapsedWidth: geometry?.sidebarCollapsedWidth,
      headerHeight: geometry?.headerHeight,
      toggleCollapse,
      openNavigation,
      closeNavigation,
    }),
    [
      closeNavigation,
      collapsed,
      geometry?.headerHeight,
      geometry?.sidebarCollapsedWidth,
      geometry?.sidebarWidth,
      isCompact,
      navigationOpen,
      openNavigation,
      posture,
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
            {...partAttributes('navigation-close', closeInteraction.state)}
            {...closeInteraction.handlers}
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
  // `rootStyle` is FUNCTIONAL wiring, not paint: every custom property below
  // is resolved at render time from runtime state (posture, collapse,
  // consumer geometry numbers) or bridges the physical `env(safe-area-inset-*)`
  // readings into named channels the skin consumes. None of it can move to
  // the stylesheet, because the values depend on props/hooks; the skin owns
  // every static declaration that consumes these channels.
  const rootStyle: ShellCustomProperties = {
    '--ds-shell-safe-area-top': 'env(safe-area-inset-top, 0px)',
    '--ds-shell-safe-area-right': 'env(safe-area-inset-right, 0px)',
    '--ds-shell-safe-area-bottom': 'env(safe-area-inset-bottom, 0px)',
    '--ds-shell-safe-area-left': 'env(safe-area-inset-left, 0px)',
    ...statedChannel('--ds-shell-sidebar-width', geometry?.sidebarWidth),
    ...statedChannel('--ds-shell-sidebar-collapsed-width', geometry?.sidebarCollapsedWidth),
    ...statedChannel('--ds-shell-header-block-size', geometry?.headerHeight),
    ...statedChannel('--ds-shell-sidebar-header-block-size', geometry?.sidebarHeaderHeight),
    ...statedChannel('--ds-shell-collapse-transition', geometry?.collapseTransition),
    '--ds-shell-header-height': headerBlockSize,
    '--ds-shell-top-inset': hasHeader
      ? `calc(${headerBlockSize} + var(--ds-shell-safe-area-top))`
      : 'var(--ds-shell-safe-area-top)',
    '--ds-shell-bottom-inset': bottomInset,
    '--ds-shell-inline-start-inset': isCompact
      ? 'var(--ds-shell-safe-area-left)'
      : desktopSidebarInset,
    '--ds-shell-inline-end-inset': 'var(--ds-shell-safe-area-right)',
    // The overlay presentation has no track to slide, so it has no transition
    // at all; otherwise the app's own `--ds-shell-main-transition` escape
    // hatch wins over the collapse cadence, resolved on this element so a
    // consumer statement on the same root still reaches it. The cadence read
    // ends in a literal so the chain can never be invalid at computed-value
    // time: without a terminal fallback a package consumed before the family
    // deriver is registered drops the whole declaration and the main column
    // stops animating. The literal is the shell's pre-derivation paint, and
    // it is dead wherever the channel has a producer.
    '--ds-shell-resolved-main-transition': isCompact
      ? 'none'
      : `var(--ds-shell-main-transition, margin-inline-start ${SHELL_COLLAPSE_TRANSITION_READ})`,
    ...style,
  };

  return (
    <ShellContext.Provider value={contextValue}>
      <div
        className={['rottay-app-shell', className].filter(Boolean).join(' ')}
        data-part="root"
        data-posture={postureAttribute}
        data-collapsed={collapsed ? 'true' : 'false'}
        data-compact={isCompact ? 'true' : 'false'}
        style={rootStyle}
      >
        {/* ---- Skip link: first tab stop, targets the content landmark ---- */}
        <a
          href={`#${contentId}`}
          className="rottay-app-shell__skip-link"
          {...partAttributes('skip-link', skipLinkInteraction.state)}
          {...skipLinkInteraction.handlers}
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
            side={drawerSide}
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
              padding: 'var(--ds-app-shell-navigation-drawer-body-padding, 0)',
              overflow: 'hidden',
            }}
            surfaceStyle={
              {
                '--ds-shell-resolved-drawer-inline-size': `min(${sidebarInlineSize}, var(--ds-viewport-inline-size))`,
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
                  {...partAttributes('navigation-trigger', triggerInteraction.state)}
                  {...triggerInteraction.handlers}
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
