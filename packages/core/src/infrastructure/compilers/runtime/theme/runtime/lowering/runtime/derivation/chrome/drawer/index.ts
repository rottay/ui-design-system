/**
 * @fileoverview The drawer family: its panel on the overlay material, the
 * elevation scale and a primary-warmed ground, its scrim on the glass
 * decisions, its title on the section-title role, and its header mark, close
 * control and footer rail on the palette, control material and focus decisions.
 *
 * @module Compilers/Theme/Lowering/Runtime/derivation/chrome/drawer
 * @category Compilers
 * @package @rottay/design-system
 */

import type { FamilyDeriver } from "../../../../foundation/contract";

/** A vertical's own drawer chrome outranks every relation stated here. */
export const drawerChromeDeriver: FamilyDeriver = {
  family: "drawer",
  rank: "derived",
  consumes: ["palette.*", "surfaces.materials", "surfaces.elevation", "surfaces.effects", "typography.roles", "states.focus"],
  produces: [
    "--ds-drawer-bg",
    "--ds-drawer-ground-top",
    "--ds-drawer-ground-end",
    "--ds-drawer-texture",
    "--ds-drawer-surface-lift",
    "--ds-drawer-shadow",
    "--ds-drawer-keyline",
    "--ds-drawer-border-color",
    "--ds-drawer-overlay-tint",
    "--ds-drawer-overlay-glass",
    "--ds-drawer-overlay-backdrop",
    "--ds-drawer-header-border",
    "--ds-drawer-footer-border",
    "--ds-drawer-footer-bg",
    "--ds-drawer-footer-backdrop",
    "--ds-drawer-title-color",
    "--ds-drawer-title-font-family",
    "--ds-drawer-title-font-size",
    "--ds-drawer-title-font-weight",
    "--ds-drawer-body-color",
    "--ds-drawer-body-bg",
    "--ds-drawer-icon-color",
    "--ds-drawer-icon-bg",
    "--ds-drawer-icon-border",
    "--ds-drawer-icon-highlight",
    "--ds-drawer-close-color",
    "--ds-drawer-close-color-hover",
    "--ds-drawer-close-bg-hover",
    "--ds-drawer-focus-ring",
  ],
  derive: () => deriveDrawerChannels(),
};

export function deriveDrawerChannels(): Record<string, string> {
  const vars: Record<string, string> = {};
  vars["--ds-drawer-bg"] = "var(--ds-material-overlay-background)";
  vars["--ds-drawer-ground-top"] = "color-mix(in srgb, var(--ds-color-bg-primary) 98%, var(--ds-color-primary) 2%)";
  vars["--ds-drawer-ground-end"] = "var(--ds-color-bg-primary)";
  vars["--ds-drawer-texture"] = "none";
  vars["--ds-drawer-surface-lift"] = "var(--ds-elevation-surface-4)";
  vars["--ds-drawer-shadow"] = "var(--ds-elevation-4)";
  vars["--ds-drawer-keyline"] =
    "color-mix(in srgb, var(--ds-color-bg-elevated) calc(72% * var(--ds-effect-intensity)), transparent)";
  vars["--ds-drawer-border-color"] = "var(--ds-color-border-subtle)";
  vars["--ds-drawer-overlay-tint"] = "var(--ds-color-black)";
  vars["--ds-drawer-overlay-glass"] = "var(--ds-glass-scrim-tint)";
  vars["--ds-drawer-overlay-backdrop"] = "var(--ds-glass-backdrop-filter)";
  vars["--ds-drawer-header-border"] = "var(--ds-color-border-subtle)";
  vars["--ds-drawer-footer-border"] = "var(--ds-color-border-subtle)";
  vars["--ds-drawer-footer-bg"] = "color-mix(in srgb, var(--ds-color-bg-secondary) 74%, transparent)";
  vars["--ds-drawer-footer-backdrop"] = "var(--ds-glass-backdrop-filter)";
  vars["--ds-drawer-title-color"] = "var(--ds-color-text-primary)";
  vars["--ds-drawer-title-font-family"] = "var(--ds-type-section-title-font-family)";
  vars["--ds-drawer-title-font-size"] = "var(--ds-type-section-title-font-size)";
  vars["--ds-drawer-title-font-weight"] = "var(--ds-type-section-title-font-weight)";
  vars["--ds-drawer-body-color"] = "var(--ds-color-text-primary)";
  vars["--ds-drawer-body-bg"] = "transparent";
  vars["--ds-drawer-icon-color"] = "var(--ds-color-primary)";
  vars["--ds-drawer-icon-bg"] = "color-mix(in srgb, var(--ds-color-primary) 10%, var(--ds-color-bg-primary))";
  vars["--ds-drawer-icon-border"] = "color-mix(in srgb, var(--ds-color-primary) 24%, var(--ds-color-border-subtle))";
  vars["--ds-drawer-icon-highlight"] = "color-mix(in srgb, var(--ds-color-bg-elevated) 54%, transparent)";
  vars["--ds-drawer-close-color"] = "var(--ds-color-text-secondary)";
  vars["--ds-drawer-close-color-hover"] = "var(--ds-color-text-primary)";
  vars["--ds-drawer-close-bg-hover"] = "var(--ds-material-control-background-hover)";
  vars["--ds-drawer-focus-ring"] = "var(--ds-focus-ring)";
  return vars;
}
