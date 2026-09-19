/**
 * @fileoverview The app-shell family: the application chrome around a page —
 * the navigation track, the sticky header, the content well, the footer and
 * the skip link. Its tracks rest on the tenant's authored sidebar widths, its
 * rhythm on the spacing ramp, its rules on the sidebar and layout border
 * roots, its surfaces on the canvas and elevated roots, and the collapse of
 * the track on the rearrange cadence.
 *
 * @remarks
 * Each produced value is the single chained fallback its skin reads it with,
 * so producing the name cannot move a pixel — it changes WHO can reach the
 * value, not what it rests at. The two exceptions are stated, not hidden:
 *
 * - `--ds-shell-collapse-transition` used to be a `220ms cubic-bezier(…)`
 *   literal authored in TSX. A track change is a rearrangement, so it now
 *   rests where the sibling `sidebar-surface` family rests.
 * - the four geometry tracks used to be `296 / 96 / 64 / 104` px literals in
 *   `SHELL_DEFAULTS`. They rest on the tenant's own sidebar channels with the
 *   same numbers as the honest literal tail; an app that states
 *   `geometry.sidebarWidth` writes the channel on its own root and outranks
 *   both, which is what the static-first vertical identity requires.
 *
 * `--ds-shell-navigation-shadow` is deliberately NOT produced: one channel
 * with two correct rests (a flat fixed track, a lifted overlay drawer), and
 * app-bithire authors the name on both elements. Producing either rest
 * silently repaints the other.
 *
 * @module Compilers/Theme/Lowering/Runtime/derivation/chrome/app-shell
 * @category Compilers
 * @package @rottay/design-system
 */

import type { FamilyDeriver } from "../../../../foundation/contract";

/** A vertical's own `chrome.shell` / `chrome.layout` statement outranks this. */
export const appShellChromeDeriver: FamilyDeriver = {
  family: "app-shell",
  rank: "derived",
  consumes: [
    "surfaces.*",
    "palette.*",
    "shape.*",
    "density",
    "motion",
    "navigation.sidebarTone",
  ],
  produces: [
    // Tracks and cadence
    "--ds-shell-sidebar-width",
    "--ds-shell-sidebar-collapsed-width",
    "--ds-shell-header-block-size",
    "--ds-shell-sidebar-header-block-size",
    "--ds-shell-collapse-transition",
    // Root
    "--ds-shell-background",
    // Skip link
    "--ds-shell-skip-link-z-index",
    "--ds-shell-skip-link-padding",
    "--ds-shell-skip-link-radius",
    "--ds-shell-skip-link-background",
    "--ds-shell-skip-link-color",
    "--ds-shell-skip-link-border",
    "--ds-shell-skip-link-shadow",
    // Navigation track and drawer
    "--ds-shell-navigation-z-index",
    "--ds-shell-navigation-background",
    "--ds-shell-navigation-border",
    "--ds-shell-navigation-border-inline-end",
    "--ds-shell-navigation-radius",
    "--ds-shell-navigation-header-background",
    "--ds-shell-navigation-header-border",
    "--ds-shell-navigation-drawer-header-padding",
    "--ds-shell-navigation-drawer-body-padding",
    "--ds-shell-navigation-logo-padding",
    "--ds-shell-navigation-logo-padding-collapsed",
    "--ds-shell-navigation-body-padding",
    "--ds-shell-navigation-body-padding-collapsed",
    "--ds-shell-navigation-body-scroll-padding-block-end",
    "--ds-shell-navigation-footer-background",
    "--ds-shell-navigation-footer-border",
    "--ds-shell-navigation-footer-padding",
    "--ds-shell-navigation-footer-padding-collapsed",
    "--ds-shell-navigation-trigger-margin-inline-end",
    "--ds-shell-navigation-action-hover-bg",
    "--ds-shell-navigation-action-active-bg",
    // Header
    "--ds-shell-header-z-index",
    "--ds-shell-header-inset-block-start",
    "--ds-shell-header-inset-inline",
    "--ds-shell-header-padding-block-start",
    "--ds-shell-header-padding-inline",
    "--ds-shell-header-background",
    "--ds-shell-header-border",
    "--ds-shell-header-border-block-end",
    "--ds-shell-header-radius",
    "--ds-shell-header-shadow",
    "--ds-shell-header-backdrop",
    "--ds-shell-header-slot-gap",
    // Main, content, footer
    "--ds-shell-main-background",
    "--ds-shell-main-border",
    "--ds-shell-main-shadow",
    "--ds-shell-content-padding",
    "--ds-shell-content-background",
    "--ds-shell-content-border",
    "--ds-shell-footer-padding",
    "--ds-shell-footer-background",
    "--ds-shell-footer-border",
    "--ds-shell-footer-shadow",
  ],
  derive: () => deriveAppShellChannels(),
};

/** The sidebar hairline, stated once because four owners rest on it. */
const SIDEBAR_RULE = "1px solid var(--ds-sidebar-border, var(--ds-color-border-subtle))";

export function deriveAppShellChannels(): Record<string, string> {
  const vars: Record<string, string> = {};

  // Tracks: the tenant's authored sidebar geometry, with the honest literal
  // tail the shell used to carry in TypeScript.
  vars["--ds-shell-sidebar-width"] = "var(--ds-sidebar-width, 18.5rem)";
  vars["--ds-shell-sidebar-collapsed-width"] = "var(--ds-sidebar-collapsed-width, 6rem)";
  vars["--ds-shell-header-block-size"] = "var(--ds-shell-topbar-height, 4rem)";
  vars["--ds-shell-sidebar-header-block-size"] = "var(--ds-sidebar-header-height, 6.5rem)";

  // Collapsing the track is a rearrangement, on the motion dial.
  vars["--ds-shell-collapse-transition"] =
    "var(--ds-motion-rearrange, var(--ds-motion-normal)) var(--ds-motion-ease-move)";

  // The shell ground is the canvas.
  vars["--ds-shell-background"] = "var(--ds-surface-canvas)";

  // The skip link is a floating control on the elevated surface.
  vars["--ds-shell-skip-link-z-index"] = "var(--ds-z-index-skip-link, 9999)";
  vars["--ds-shell-skip-link-padding"] = "0 var(--ds-spacing-4, 16px)";
  vars["--ds-shell-skip-link-radius"] = "var(--ds-radius-md, 8px)";
  vars["--ds-shell-skip-link-background"] = "var(--ds-color-bg-elevated)";
  vars["--ds-shell-skip-link-color"] = "var(--ds-color-text-primary)";
  vars["--ds-shell-skip-link-border"] = "1px solid var(--ds-color-border-subtle)";
  vars["--ds-shell-skip-link-shadow"] = "var(--ds-elevation-2, none)";

  // The navigation region: the sidebar tone's surface, the sidebar rule, and
  // the spacing ramp for its interior rhythm.
  vars["--ds-shell-navigation-z-index"] = "var(--ds-z-index-fixed, 1200)";
  vars["--ds-shell-navigation-background"] =
    "var(--ds-sidebar-bg, var(--ds-surface-shell, var(--ds-color-bg-elevated)))";
  vars["--ds-shell-navigation-border"] = "0";
  vars["--ds-shell-navigation-border-inline-end"] = SIDEBAR_RULE;
  vars["--ds-shell-navigation-radius"] = "0";
  vars["--ds-shell-navigation-header-background"] = "transparent";
  vars["--ds-shell-navigation-header-border"] = SIDEBAR_RULE;
  vars["--ds-shell-navigation-drawer-header-padding"] =
    "0 var(--ds-spacing-3, 12px) 0 var(--ds-spacing-5, 20px)";
  vars["--ds-shell-navigation-drawer-body-padding"] = "0";
  vars["--ds-shell-navigation-logo-padding"] = "0 var(--ds-spacing-5, 20px)";
  vars["--ds-shell-navigation-logo-padding-collapsed"] = "0";
  vars["--ds-shell-navigation-body-padding"] =
    "var(--ds-sidebar-shell-padding-inline, var(--ds-spacing-3, 12px) var(--ds-spacing-3, 12px) calc(var(--ds-spacing-3, 12px) + 28px) var(--ds-spacing-3, 12px))";
  vars["--ds-shell-navigation-body-padding-collapsed"] =
    "var(--ds-sidebar-shell-padding-collapsed, var(--ds-spacing-3, 12px) var(--ds-spacing-2, 8px))";
  vars["--ds-shell-navigation-body-scroll-padding-block-end"] =
    "calc(var(--ds-spacing-6, 24px) + 76px)";
  vars["--ds-shell-navigation-footer-background"] =
    "var(--ds-sidebar-footer-bg, var(--ds-sidebar-bg))";
  vars["--ds-shell-navigation-footer-border"] = SIDEBAR_RULE;
  vars["--ds-shell-navigation-footer-padding"] = "var(--ds-spacing-3, 12px)";
  vars["--ds-shell-navigation-footer-padding-collapsed"] =
    "var(--ds-spacing-3, 12px) var(--ds-spacing-2, 8px)";
  vars["--ds-shell-navigation-trigger-margin-inline-end"] = "var(--ds-spacing-3, 12px)";

  // The chrome actions wash quietly: the neutral ramp, never the accent.
  vars["--ds-shell-navigation-action-hover-bg"] = "var(--ds-color-neutral-100)";
  vars["--ds-shell-navigation-action-active-bg"] =
    "var(--ds-color-neutral-200, var(--ds-color-neutral-100))";

  // The sticky header: the layout header roots, flush by default.
  vars["--ds-shell-header-z-index"] = "var(--ds-z-index-sticky, 1100)";
  vars["--ds-shell-header-inset-block-start"] = "0";
  vars["--ds-shell-header-inset-inline"] = "0";
  vars["--ds-shell-header-padding-block-start"] = "var(--ds-shell-safe-area-top)";
  vars["--ds-shell-header-padding-inline"] = "var(--ds-spacing-6, 24px)";
  vars["--ds-shell-header-background"] =
    "var(--ds-layout-header-bg, var(--ds-surface-canvas))";
  vars["--ds-shell-header-border"] = "0";
  vars["--ds-shell-header-border-block-end"] =
    "1px solid var(--ds-layout-header-border, var(--ds-color-border-subtle))";
  vars["--ds-shell-header-radius"] = "0";
  vars["--ds-shell-header-shadow"] = "none";
  vars["--ds-shell-header-backdrop"] =
    "var(--ds-layout-header-backdrop, blur(12px))";
  vars["--ds-shell-header-slot-gap"] = "var(--ds-spacing-1, 4px)";

  // The main column, the content well and the footer are unpainted grounds:
  // the shell frames a page, it does not decorate one.
  vars["--ds-shell-main-background"] = "transparent";
  vars["--ds-shell-main-border"] = "0";
  vars["--ds-shell-main-shadow"] = "none";
  vars["--ds-shell-content-padding"] = "0";
  vars["--ds-shell-content-background"] = "transparent";
  vars["--ds-shell-content-border"] = "0";
  vars["--ds-shell-footer-padding"] = "0";
  vars["--ds-shell-footer-background"] = "transparent";
  vars["--ds-shell-footer-border"] = "0";
  vars["--ds-shell-footer-shadow"] = "none";

  return vars;
}
