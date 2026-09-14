/**
 * @fileoverview The dropdown family: its menu surface on the overlay material,
 * the elevation scale and a primary-tinted edge, its rows on the label role and
 * the palette wells for hover, selection and danger, and its focus ring on the
 * focus decisions.
 *
 * @module Compilers/Theme/Lowering/Runtime/derivation/chrome/dropdown
 * @category Compilers
 * @package @rottay/design-system
 */

import type { FamilyDeriver } from "../../../../foundation/contract";

/** A vertical's own dropdown chrome outranks every relation stated here. */
export const dropdownChromeDeriver: FamilyDeriver = {
  family: "dropdown",
  rank: "derived",
  consumes: ["palette.*", "surfaces.materials", "surfaces.elevation", "surfaces.effects", "typography.roles", "states.focus"],
  produces: [
    "--ds-dropdown-bg",
    "--ds-dropdown-surface-lift",
    "--ds-dropdown-texture",
    "--ds-dropdown-keyline",
    "--ds-dropdown-border-color",
    "--ds-dropdown-color",
    "--ds-dropdown-font-family",
    "--ds-dropdown-font-size",
    "--ds-dropdown-font-weight",
    "--ds-dropdown-item-color",
    "--ds-dropdown-item-color-hover",
    "--ds-dropdown-item-border-hover",
    "--ds-dropdown-item-bg-hover",
    "--ds-dropdown-item-keyline",
    "--ds-dropdown-item-sheen",
    "--ds-dropdown-item-focus-ring",
    "--ds-dropdown-item-color-selected",
    "--ds-dropdown-item-border-selected",
    "--ds-dropdown-item-bg-selected",
    "--ds-dropdown-item-color-disabled",
    "--ds-dropdown-danger-color",
    "--ds-dropdown-danger-border-hover",
    "--ds-dropdown-danger-bg-hover",
    "--ds-dropdown-selection-color",
    "--ds-dropdown-icon-color",
    "--ds-dropdown-icon-bg",
    "--ds-dropdown-icon-bg-hover",
    "--ds-dropdown-submenu-indicator-bg",
    "--ds-dropdown-group-color",
    "--ds-dropdown-group-bg",
    "--ds-dropdown-divider",
  ],
  derive: () => deriveDropdownChannels(),
};

export function deriveDropdownChannels(): Record<string, string> {
  const vars: Record<string, string> = {};
  vars["--ds-dropdown-bg"] = "var(--ds-material-overlay-background)";
  vars["--ds-dropdown-surface-lift"] = "var(--ds-elevation-surface-3)";
  vars["--ds-dropdown-texture"] = "none";
  vars["--ds-dropdown-keyline"] = "color-mix(in srgb, var(--ds-color-bg-elevated) calc(72% * var(--ds-effect-intensity)), transparent)";
  vars["--ds-dropdown-border-color"] = "color-mix(in srgb, var(--ds-color-border) 86%, var(--ds-color-primary) 14%)";
  vars["--ds-dropdown-color"] = "var(--ds-color-text-secondary)";
  vars["--ds-dropdown-font-family"] = "var(--ds-type-label-font-family)";
  vars["--ds-dropdown-font-size"] = "var(--ds-type-label-font-size)";
  vars["--ds-dropdown-font-weight"] = "var(--ds-type-label-font-weight)";
  vars["--ds-dropdown-item-color"] = "var(--ds-color-text-secondary)";
  vars["--ds-dropdown-item-color-hover"] = "var(--ds-color-text-primary)";
  vars["--ds-dropdown-item-border-hover"] = "color-mix(in srgb, var(--ds-color-primary) 24%, var(--ds-color-border-subtle))";
  vars["--ds-dropdown-item-bg-hover"] = "linear-gradient(135deg, color-mix(in srgb, var(--ds-color-primary) 9%, var(--ds-surface-card)), color-mix(in srgb, var(--ds-color-primary) 3%, var(--ds-surface-card)))";
  vars["--ds-dropdown-item-keyline"] = "color-mix(in srgb, var(--ds-color-text-on-primary) 58%, transparent)";
  vars["--ds-dropdown-item-sheen"] = "color-mix(in srgb, var(--ds-color-text-on-primary) 28%, transparent)";
  vars["--ds-dropdown-item-focus-ring"] = "var(--ds-focus-ring)";
  vars["--ds-dropdown-item-color-selected"] = "var(--ds-color-primary)";
  vars["--ds-dropdown-item-border-selected"] = "color-mix(in srgb, var(--ds-color-primary) 36%, var(--ds-color-border-subtle))";
  vars["--ds-dropdown-item-bg-selected"] = "linear-gradient(135deg, color-mix(in srgb, var(--ds-color-primary) 14%, var(--ds-surface-card)), color-mix(in srgb, var(--ds-color-primary) 6%, var(--ds-surface-card)))";
  vars["--ds-dropdown-item-color-disabled"] = "var(--ds-color-text-disabled)";
  vars["--ds-dropdown-danger-color"] = "var(--ds-color-error)";
  vars["--ds-dropdown-danger-border-hover"] = "color-mix(in srgb, var(--ds-color-error) 30%, var(--ds-color-border-subtle))";
  vars["--ds-dropdown-danger-bg-hover"] = "linear-gradient(135deg, color-mix(in srgb, var(--ds-color-error) 10%, var(--ds-surface-card)), color-mix(in srgb, var(--ds-color-error) 4%, var(--ds-surface-card)))";
  vars["--ds-dropdown-selection-color"] = "var(--ds-color-primary)";
  vars["--ds-dropdown-icon-color"] = "currentColor";
  vars["--ds-dropdown-icon-bg"] = "color-mix(in srgb, currentColor 7%, transparent)";
  vars["--ds-dropdown-icon-bg-hover"] = "color-mix(in srgb, currentColor 11%, transparent)";
  vars["--ds-dropdown-submenu-indicator-bg"] = "color-mix(in srgb, currentColor 6%, transparent)";
  vars["--ds-dropdown-group-color"] = "var(--ds-type-color-muted)";
  vars["--ds-dropdown-group-bg"] = "linear-gradient(90deg, color-mix(in srgb, var(--ds-color-text-primary) 4%, transparent), transparent 78%)";
  vars["--ds-dropdown-divider"] = "linear-gradient(90deg, transparent, color-mix(in srgb, var(--ds-color-border) 92%, transparent) 15%, color-mix(in srgb, var(--ds-color-border) 92%, transparent) 85%, transparent)";
  return vars;
}
