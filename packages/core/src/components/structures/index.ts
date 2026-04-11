/**
 * @fileoverview Structures tier barrel — Tier 2.5 of the design system.
 *
 * The `structures` tier sits between `patterns` (engine-agnostic
 * compositions) and `surfaces` (page-level config objects). It hosts
 * structures families organized into 5 groups:
 *
 * - `headers/`    — collection, detail, edit, form page headers
 * - `workspace/`  — command bars, filter bars, column menus, scope
 *                   switchers, saved views, preview rails, table toolbars
 * - `record/`     — record field grids, summary strips, action bars,
 *                   panels, form sections
 * - `dashboard/`  — dashboard insight variants, stats headers, metric cards
 * - `feedback/`   — loading overlays
 * - `shell/`      — application shell (sidebar + header + content)
 *
 * The tier is editorial structure for the source tree, not part of the
 * published API surface. Every identifier below is re-exported by the
 * root barrel (`@rottay/design-system`) alongside primitives, patterns,
 * and surfaces — consumers never see a `structures/` path in their
 * import statements.
 */

export * from './headers';
export * from './workspace';
export * from './record';
export * from './dashboard';
export * from './feedback';
export { AppShell, useShellContext, SHELL_DEFAULTS } from './shell';
export type {
  AppShellProps,
  ShellSidebarSlots,
  ShellHeaderSlots,
  ShellGeometry,
  ShellContextValue,
} from './shell';
