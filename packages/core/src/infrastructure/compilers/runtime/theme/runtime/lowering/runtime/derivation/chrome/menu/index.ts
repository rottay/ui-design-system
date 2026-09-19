/**
 * @fileoverview The menu family: a navigation rail on the paired card
 * material, its rows on the body and supporting roles, hover, press and
 * selection washes from the palette, the current-row markers on the
 * primary ink, and every geometry channel on the spacing ramp so density
 * reaches the rail. A sidebar tone reaches the rail through the produced
 * `--ds-sidebar-*` roots the menu colour, group, child and indent channels
 * chain to, so a tenant's authored `chrome.sidebar` leaves keep painting.
 *
 * @module Compilers/Theme/Lowering/Runtime/derivation/chrome/menu
 * @category Compilers
 * @package @rottay/design-system
 */

import type { FamilyDeriver } from "../../../../foundation/contract";

/** A vertical's own menu chrome outranks every relation stated here. */
export const menuChromeDeriver: FamilyDeriver = {
  family: "menu",
  rank: "derived",
  consumes: [
    "palette.*",
    "surfaces.materials",
    "surfaces.elevation",
    "surfaces.effects",
    "surfaces.radiusScale",
    "typography.roles",
    "states.focus",
    "states.press",
    "density",
    "motion",
    "navigation.sidebarTone",
  ],
  produces: [
    "--ds-menu-bg",
    "--ds-menu-dark-bg",
    "--ds-menu-color",
    "--ds-menu-font-family",
    "--ds-menu-radius",
    "--ds-menu-shadow",
    "--ds-menu-border-color",
    "--ds-menu-border-width",
    "--ds-menu-padding-block",
    "--ds-menu-padding-inline",
    "--ds-menu-gap",
    "--ds-menu-horizontal-gap",
    "--ds-menu-horizontal-padding-inline",
    "--ds-menu-collapsed-inline-size",
    "--ds-menu-panel-layer",
    "--ds-menu-item-color",
    "--ds-menu-item-color-hover",
    "--ds-menu-item-color-active",
    "--ds-menu-item-color-disabled",
    "--ds-menu-item-bg-hover",
    "--ds-menu-item-bg-pressed",
    "--ds-menu-item-bg-active",
    "--ds-menu-item-border-hover",
    "--ds-menu-item-border-active",
    "--ds-menu-item-shadow-hover",
    "--ds-menu-item-shadow-active",
    "--ds-menu-item-keyline",
    "--ds-menu-item-radius",
    "--ds-menu-item-gap",
    "--ds-menu-item-padding-inline",
    "--ds-menu-item-height",
    "--ds-menu-item-child-height",
    "--ds-menu-item-horizontal-height",
    "--ds-menu-child-padding-inline",
    "--ds-menu-inline-indent",
    "--ds-menu-item-font-family",
    "--ds-menu-item-font-size",
    "--ds-menu-item-font-size-child",
    "--ds-menu-item-font-weight",
    "--ds-menu-item-font-weight-selected",
    "--ds-menu-item-line-height",
    "--ds-menu-item-lift",
    "--ds-menu-level",
    "--ds-menu-touch-target-min",
    "--ds-menu-disabled-opacity",
    "--ds-menu-item-danger-color",
    "--ds-menu-danger-bg-hover",
    "--ds-menu-danger-border-hover",
    "--ds-menu-focus-ring",
    "--ds-menu-focus-ring-width",
    "--ds-menu-current-tick-size",
    "--ds-menu-current-tick-ink",
    "--ds-menu-current-rule-size",
    "--ds-menu-current-rule-ink",
    "--ds-menu-current-rule-inset",
    "--ds-menu-trigger-open-color",
    "--ds-menu-trigger-open-bg",
    "--ds-menu-trigger-open-border",
    "--ds-menu-submenu-bg",
    "--ds-menu-icon-color",
    "--ds-menu-icon-size",
    "--ds-menu-icon-column-size",
    "--ds-menu-icon-radius",
    "--ds-menu-icon-plate-bg",
    "--ds-menu-icon-opacity",
    "--ds-menu-icon-scale",
    "--ds-menu-arrow-size",
    "--ds-menu-arrow-bg",
    "--ds-menu-arrow-opacity",
    "--ds-menu-panel-bg",
    "--ds-menu-panel-radius",
    "--ds-menu-panel-margin-block",
    "--ds-menu-panel-enter-distance",
    "--ds-menu-nested-thread-size",
    "--ds-menu-nested-thread-style",
    "--ds-menu-nested-thread-ink",
    "--ds-menu-submenu-indent",
    "--ds-menu-group-color",
    "--ds-menu-group-bg",
    "--ds-menu-group-font-family",
    "--ds-menu-group-font-size",
    "--ds-menu-group-font-weight",
    "--ds-menu-group-letter-spacing",
    "--ds-menu-group-line-height",
    "--ds-menu-group-text-transform",
    "--ds-menu-group-padding-block",
    "--ds-menu-group-padding-inline",
    "--ds-menu-group-margin-block",
    "--ds-menu-group-radius",
    "--ds-menu-divider",
    "--ds-menu-divider-color",
    "--ds-menu-divider-margin-block",
    "--ds-menu-divider-margin-inline",
  ],
  derive: () => deriveMenuChannels(),
};

export function deriveMenuChannels(): Record<string, string> {
  const vars: Record<string, string> = {};

  // Surface: the paired card material, tinted a breath toward the primary.
  vars["--ds-menu-bg"] = "color-mix(in srgb, var(--ds-card-bg, var(--ds-surface-card)) 97%, var(--ds-color-primary) 3%)";
  vars["--ds-menu-dark-bg"] = "color-mix(in srgb, var(--ds-surface-panel) 94%, var(--ds-color-white) 6%)";
  vars["--ds-menu-color"] = "var(--ds-sidebar-text, var(--ds-color-text-secondary))";
  vars["--ds-menu-font-family"] = "var(--ds-type-body-font-family)";
  vars["--ds-menu-radius"] = "var(--ds-radius-xl)";
  vars["--ds-menu-shadow"] = "var(--ds-elevation-1)";
  vars["--ds-menu-border-color"] = "var(--ds-sidebar-border, var(--ds-color-border-subtle))";
  vars["--ds-menu-border-width"] = "var(--ds-edge-standard-width)";
  vars["--ds-menu-padding-block"] = "var(--ds-spacing-2)";
  vars["--ds-menu-padding-inline"] = "var(--ds-spacing-2)";
  vars["--ds-menu-gap"] = "var(--ds-spacing-1)";
  vars["--ds-menu-horizontal-gap"] = "var(--ds-spacing-1)";
  vars["--ds-menu-horizontal-padding-inline"] = "var(--ds-spacing-2)";
  vars["--ds-menu-collapsed-inline-size"] = "var(--ds-spacing-16)";
  vars["--ds-menu-panel-layer"] = "var(--ds-z-index-relative-above)";

  // Rows: ink and washes from the palette, geometry from the spacing ramp.
  vars["--ds-menu-item-color"] = "var(--ds-sidebar-text, var(--ds-color-text-secondary))";
  vars["--ds-menu-item-color-hover"] = "var(--ds-color-text-primary)";
  vars["--ds-menu-item-color-active"] = "var(--ds-sidebar-item-color-active, var(--ds-color-primary))";
  vars["--ds-menu-item-color-disabled"] = "var(--ds-sidebar-text-muted, var(--ds-color-text-secondary))";
  vars["--ds-menu-item-bg-hover"] = "var(--ds-sidebar-item-bg-hover, color-mix(in srgb, var(--ds-color-primary) 4%, var(--ds-card-bg, var(--ds-surface-card))))";
  vars["--ds-menu-item-bg-pressed"] = "var(--ds-sidebar-item-bg-hover, color-mix(in srgb, var(--ds-color-primary) 8%, var(--ds-card-bg, var(--ds-surface-card))))";
  vars["--ds-menu-item-bg-active"] = "var(--ds-sidebar-item-bg-active, color-mix(in srgb, var(--ds-color-primary) 9%, var(--ds-card-bg, var(--ds-surface-card))))";
  vars["--ds-menu-item-border-hover"] = "color-mix(in srgb, var(--ds-color-primary) 18%, var(--ds-color-border-subtle))";
  vars["--ds-menu-item-border-active"] = "color-mix(in srgb, var(--ds-color-primary) 34%, var(--ds-color-border-subtle))";
  vars["--ds-menu-item-shadow-hover"] = "var(--ds-elevation-1)";
  vars["--ds-menu-item-shadow-active"] = "var(--ds-elevation-2)";
  vars["--ds-menu-item-keyline"] = "inset 0 1px 0 color-mix(in srgb, var(--ds-color-white) calc(52% * var(--ds-effect-intensity)), transparent)";
  vars["--ds-menu-item-radius"] = "var(--ds-radius-lg)";
  vars["--ds-menu-item-gap"] = "var(--ds-sidebar-item-gap, var(--ds-spacing-2))";
  vars["--ds-menu-item-padding-inline"] = "var(--ds-sidebar-item-padding-inline, var(--ds-spacing-4))";
  vars["--ds-menu-item-height"] = "var(--ds-spacing-12)";
  vars["--ds-menu-item-child-height"] = "var(--ds-sidebar-item-child-height, var(--ds-spacing-10))";
  vars["--ds-menu-item-horizontal-height"] = "var(--ds-spacing-11)";
  vars["--ds-menu-child-padding-inline"] = "var(--ds-sidebar-item-indent, var(--ds-spacing-2))";
  vars["--ds-menu-inline-indent"] = "var(--ds-spacing-6)";
  vars["--ds-menu-item-font-family"] = "var(--ds-type-body-font-family)";
  vars["--ds-menu-item-font-size"] = "var(--ds-sidebar-item-font-size, var(--ds-type-body-font-size))";
  vars["--ds-menu-item-font-size-child"] = "var(--ds-sidebar-item-font-size-child, var(--ds-type-supporting-font-size))";
  vars["--ds-menu-item-font-weight"] = "var(--ds-font-weight-medium)";
  vars["--ds-menu-item-font-weight-selected"] = "var(--ds-font-weight-semibold)";
  vars["--ds-menu-item-line-height"] = "var(--ds-type-body-line-height)";
  vars["--ds-menu-item-lift"] = "calc(-1px * var(--ds-motion-intensity))";
  /* The hierarchy multiplier the engine stamps per row: the skin declares the
     name at the component root, so this derived statement rests underneath it
     and the zero rung of the spacing ramp lands the read on a produced root. */
  vars["--ds-menu-level"] = "var(--ds-spacing-0, 0)";
  vars["--ds-menu-touch-target-min"] = "var(--ds-touch-target-min)";
  vars["--ds-menu-disabled-opacity"] = "0.5";

  // Danger keeps the error seed; forced colors re-key it to a dashed frame.
  vars["--ds-menu-item-danger-color"] = "var(--ds-color-error)";
  vars["--ds-menu-danger-bg-hover"] = "color-mix(in srgb, var(--ds-color-error) 7%, var(--ds-card-bg, var(--ds-surface-card)))";
  vars["--ds-menu-danger-border-hover"] = "color-mix(in srgb, var(--ds-color-error) 22%, var(--ds-color-border-subtle))";

  // Focus reads the focus decisions.
  vars["--ds-menu-focus-ring"] = "var(--ds-focus-ring)";
  vars["--ds-menu-focus-ring-width"] = "var(--ds-focus-ring-width)";

  // Current markers: a logical inline-start tick (vertical) or a block-end rule (horizontal).
  vars["--ds-menu-current-tick-size"] = "var(--ds-border-width-2)";
  vars["--ds-menu-current-tick-ink"] = "var(--ds-color-primary)";
  vars["--ds-menu-current-rule-size"] = "var(--ds-border-width-2)";
  vars["--ds-menu-current-rule-ink"] = "var(--ds-color-primary)";
  vars["--ds-menu-current-rule-inset"] = "var(--ds-spacing-3)";

  // An open or ancestor-of-current trigger reads as lit, not selected.
  vars["--ds-menu-trigger-open-color"] = "var(--ds-color-text-primary)";
  vars["--ds-menu-trigger-open-bg"] = "var(--ds-sidebar-item-bg-hover, color-mix(in srgb, var(--ds-color-primary) 5%, var(--ds-card-bg, var(--ds-surface-card))))";
  vars["--ds-menu-trigger-open-border"] = "color-mix(in srgb, var(--ds-color-primary) 18%, var(--ds-color-border-subtle))";
  vars["--ds-menu-submenu-bg"] = "var(--ds-color-bg-secondary)";

  // Icon well and disclosure arrow.
  vars["--ds-menu-icon-color"] = "currentColor";
  vars["--ds-menu-icon-size"] = "var(--ds-icon-sm-size)";
  vars["--ds-menu-icon-column-size"] = "var(--ds-spacing-6)";
  vars["--ds-menu-icon-radius"] = "var(--ds-radius-md)";
  vars["--ds-menu-icon-plate-bg"] = "color-mix(in srgb, currentColor 6%, transparent)";
  vars["--ds-menu-icon-opacity"] = "0.7";
  vars["--ds-menu-icon-scale"] = "calc(1 + 0.04 * var(--ds-motion-intensity))";
  vars["--ds-menu-arrow-size"] = "var(--ds-spacing-4)";
  vars["--ds-menu-arrow-bg"] = "var(--ds-type-code-inline-bg, color-mix(in srgb, var(--ds-color-text-primary) 5%, transparent))";
  vars["--ds-menu-arrow-opacity"] = "0.4";

  // Disclosure panels and the nested thread that reads them as a tree.
  vars["--ds-menu-panel-bg"] = "color-mix(in srgb, var(--ds-card-bg, var(--ds-surface-card)) 72%, transparent)";
  vars["--ds-menu-panel-radius"] = "var(--ds-radius-lg)";
  vars["--ds-menu-panel-margin-block"] = "var(--ds-spacing-1)";
  vars["--ds-menu-panel-enter-distance"] = "calc(-1 * var(--ds-spacing-1) * var(--ds-motion-intensity))";
  vars["--ds-menu-nested-thread-size"] = "var(--ds-divider-width)";
  vars["--ds-menu-nested-thread-style"] = "var(--ds-divider-style)";
  vars["--ds-menu-nested-thread-ink"] = "color-mix(in srgb, var(--ds-color-text-primary) 14%, transparent)";
  vars["--ds-menu-submenu-indent"] = "var(--ds-spacing-6)";

  // Group eyebrows on the caption role, cased by the overline grammar chain.
  vars["--ds-menu-group-color"] = "var(--ds-sidebar-text, var(--ds-color-text-secondary))";
  vars["--ds-menu-group-bg"] = "color-mix(in srgb, var(--ds-color-text-primary) 2%, transparent)";
  vars["--ds-menu-group-font-family"] = "var(--ds-type-caption-font-family)";
  vars["--ds-menu-group-font-size"] = "var(--ds-sidebar-group-font-size, var(--ds-type-caption-font-size))";
  vars["--ds-menu-group-font-weight"] = "var(--ds-font-weight-semibold)";
  vars["--ds-menu-group-letter-spacing"] = "var(--ds-letter-spacing-wider)";
  vars["--ds-menu-group-line-height"] = "var(--ds-type-caption-line-height)";
  vars["--ds-menu-group-text-transform"] = "var(--ds-page-header-eyebrow-text-transform, var(--ds-typography-label-transform, uppercase))";
  vars["--ds-menu-group-padding-block"] = "var(--ds-sidebar-group-padding-top, var(--ds-spacing-2)) var(--ds-spacing-1)";
  vars["--ds-menu-group-padding-inline"] = "var(--ds-sidebar-item-padding-inline, var(--ds-spacing-4))";
  vars["--ds-menu-group-margin-block"] = "var(--ds-sidebar-group-margin-top, var(--ds-spacing-1)) var(--ds-sidebar-group-margin-bottom, var(--ds-spacing-1))";
  vars["--ds-menu-group-radius"] = "var(--ds-radius-sm)";

  // Dividers fade at both ends so they never touch the rail's frame.
  vars["--ds-menu-divider"] = "linear-gradient(90deg, transparent, color-mix(in srgb, var(--ds-color-border-subtle) 92%, transparent) 12%, color-mix(in srgb, var(--ds-color-border-subtle) 92%, transparent) 88%, transparent)";
  vars["--ds-menu-divider-color"] = "var(--ds-color-border)";
  vars["--ds-menu-divider-margin-block"] = "var(--ds-spacing-1)";
  vars["--ds-menu-divider-margin-inline"] = "var(--ds-spacing-2)";
  return vars;
}
