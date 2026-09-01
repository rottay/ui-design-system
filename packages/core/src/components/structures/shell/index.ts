/**
 * @fileoverview Shell group barrel — application chrome that frames a whole
 * screen: the app shell itself, the compact bottom tab bar, the page-shell
 * surface wrapper, the sidebar surface, and the small surface-chrome family
 * those shells and the surfaces tier render inside their frames.
 *
 * @description
 * This file aggregates child owners and nothing else. `AppShell`, its context
 * hook and the shell context type used to be authored here, which made the
 * barrel an authored production peer of the very folders it aggregates: the
 * taxonomy inventory could not name an owner for `structure/shell/app-shell`
 * without handing it the whole group's exports. The component moved to
 * `./app-shell` unchanged — same source, same public names, one owner per
 * family.
 *
 * The shared `AppShellProps` / geometry / inset contract stays in the group's
 * `./contracts` support owner because more than one child reads it.
 */

export { AppShell, useShellContext } from './app-shell';
export type { ShellContextValue } from './app-shell';

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

export { PageShellSurface } from './page-shell-surface';
export type { PageShellSurfaceProps } from './page-shell-surface';

// The atmospheric shell a premium collection workspace renders into. It is
// page chrome, so it belongs to this group rather than to `surfaces/`, where
// it briefly lived. Its two config types stay published from the surfaces
// contract barrel, which re-exports them from the owner below.
export { WorkspaceShell } from './workspace-shell';
export type { WorkspaceShellProps } from './workspace-shell';

export { SidebarSurface } from './navigation/sidebar-surface';
export type { SidebarSurfaceProps } from './navigation/sidebar-surface';

// The composite `structure/shell/surface-chrome` family. These three used to
// be published from `../foundation/chrome/presentation/rendering` through the
// surfaces barrel — a support owner shipping public products, which is why no
// inventory row could own them. Same names, same API, one honest owner.
export {
  SurfaceActionBar,
  SurfaceTabbedLabel,
  SurfaceSectionCard,
  surfaceSectionCardRecipe,
} from './surface-chrome';
export type {
  SurfaceActionBarProps,
  SurfaceTabbedLabelProps,
  SurfaceSectionCardProps,
} from './surface-chrome';
