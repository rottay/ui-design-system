/**
 * @fileoverview The tooltip family: its four material recipes on the overlay
 * and raised materials, the palette inks and the elevation scale; its tone
 * bubbles on the palette seeds; and its shortcut keys and focus frame on
 * currentColor and the focus decisions.
 *
 * @module Compilers/Theme/Lowering/Runtime/derivation/chrome/tooltip
 * @category Compilers
 * @package @rottay/design-system
 */

import type { FamilyDeriver } from "../../../../foundation/contract";

/** A vertical's own tooltip chrome outranks every relation stated here. */
export const tooltipChromeDeriver: FamilyDeriver = {
  family: "tooltip",
  rank: "derived",
  consumes: ["palette.*", "surfaces.materials", "surfaces.elevation", "states.focus"],
  produces: [
    "--ds-tooltip-bordered-background",
    "--ds-tooltip-bordered-foreground",
    "--ds-tooltip-bordered-border",
    "--ds-tooltip-bordered-shadow",
    "--ds-tooltip-bordered-texture",
    "--ds-tooltip-bordered-highlight",
    "--ds-tooltip-minimal-background",
    "--ds-tooltip-minimal-foreground",
    "--ds-tooltip-minimal-border",
    "--ds-tooltip-minimal-shadow",
    "--ds-tooltip-minimal-texture",
    "--ds-tooltip-minimal-highlight",
    "--ds-tooltip-inverse-background",
    "--ds-tooltip-inverse-foreground",
    "--ds-tooltip-inverse-border",
    "--ds-tooltip-inverse-shadow",
    "--ds-tooltip-inverse-texture",
    "--ds-tooltip-inverse-highlight",
    "--ds-tooltip-rich-background",
    "--ds-tooltip-rich-foreground",
    "--ds-tooltip-rich-border",
    "--ds-tooltip-rich-shadow",
    "--ds-tooltip-rich-texture",
    "--ds-tooltip-rich-highlight",
    "--ds-tooltip-opaque-background",
    "--ds-tooltip-tone-border",
    "--ds-tooltip-primary-bg",
    "--ds-tooltip-primary-color",
    "--ds-tooltip-secondary-bg",
    "--ds-tooltip-secondary-color",
    "--ds-tooltip-success-bg",
    "--ds-tooltip-warning-bg",
    "--ds-tooltip-error-bg",
    "--ds-tooltip-success-color",
    "--ds-tooltip-warning-color",
    "--ds-tooltip-error-color",
    "--ds-tooltip-shortcut-key-background",
    "--ds-tooltip-shortcut-key-border",
    "--ds-tooltip-shortcut-key-shadow",
    "--ds-tooltip-focus-color",
  ],
  derive: () => deriveTooltipChannels(),
};

export function deriveTooltipChannels(): Record<string, string> {
  const vars: Record<string, string> = {};
  vars["--ds-tooltip-bordered-background"] = "var(--ds-material-overlay-background)";
  vars["--ds-tooltip-bordered-foreground"] = "var(--ds-color-text-primary)";
  vars["--ds-tooltip-bordered-border"] = "var(--ds-color-border-primary)";
  vars["--ds-tooltip-bordered-shadow"] = "var(--ds-elevation-3)";
  vars["--ds-tooltip-bordered-texture"] = "none";
  vars["--ds-tooltip-bordered-highlight"] = "linear-gradient(180deg, color-mix(in srgb, currentColor 5%, transparent), transparent 48%)";
  vars["--ds-tooltip-minimal-background"] = "var(--ds-material-overlay-background)";
  vars["--ds-tooltip-minimal-foreground"] = "var(--ds-color-text-primary)";
  vars["--ds-tooltip-minimal-border"] = "transparent";
  vars["--ds-tooltip-minimal-shadow"] = "var(--ds-shadow-sm)";
  vars["--ds-tooltip-minimal-texture"] = "none";
  vars["--ds-tooltip-minimal-highlight"] = "none";
  vars["--ds-tooltip-inverse-background"] = "var(--ds-color-text-primary)";
  vars["--ds-tooltip-inverse-foreground"] = "var(--ds-color-text-inverse)";
  vars["--ds-tooltip-inverse-border"] = "color-mix(in srgb, var(--ds-color-text-inverse) 18%, transparent)";
  vars["--ds-tooltip-inverse-shadow"] = "var(--ds-shadow-lg)";
  vars["--ds-tooltip-inverse-texture"] = "none";
  vars["--ds-tooltip-inverse-highlight"] = "linear-gradient(180deg, color-mix(in srgb, currentColor 7%, transparent), transparent 52%)";
  vars["--ds-tooltip-rich-background"] = "var(--ds-material-raised-background)";
  vars["--ds-tooltip-rich-foreground"] = "var(--ds-color-text-primary)";
  vars["--ds-tooltip-rich-border"] = "var(--ds-color-border-secondary)";
  vars["--ds-tooltip-rich-shadow"] = "var(--ds-shadow-xl)";
  vars["--ds-tooltip-rich-texture"] = "none";
  vars["--ds-tooltip-rich-highlight"] = "linear-gradient(145deg, color-mix(in srgb, currentColor 7%, transparent), transparent 56%)";
  vars["--ds-tooltip-opaque-background"] = "var(--ds-material-overlay-opaque)";
  vars["--ds-tooltip-tone-border"] = "color-mix(in srgb, currentColor 20%, transparent)";
  vars["--ds-tooltip-primary-bg"] = "var(--ds-color-primary)";
  vars["--ds-tooltip-primary-color"] = "var(--ds-color-text-on-primary)";
  vars["--ds-tooltip-secondary-bg"] = "var(--ds-color-secondary)";
  vars["--ds-tooltip-secondary-color"] = "var(--ds-color-text-on-primary)";
  vars["--ds-tooltip-success-bg"] = "var(--ds-color-success)";
  vars["--ds-tooltip-warning-bg"] = "var(--ds-color-warning)";
  vars["--ds-tooltip-error-bg"] = "var(--ds-color-error)";
  vars["--ds-tooltip-success-color"] = "var(--ds-color-text-on-primary)";
  vars["--ds-tooltip-warning-color"] = "var(--ds-color-text-on-primary)";
  vars["--ds-tooltip-error-color"] = "var(--ds-color-on-error)";
  vars["--ds-tooltip-shortcut-key-background"] = "color-mix(in srgb, currentColor 10%, transparent)";
  vars["--ds-tooltip-shortcut-key-border"] = "color-mix(in srgb, currentColor 28%, transparent)";
  vars["--ds-tooltip-shortcut-key-shadow"] = "inset 0 1px 0 color-mix(in srgb, currentColor 10%, transparent)";
  vars["--ds-tooltip-focus-color"] = "var(--ds-focus-ring-color)";
  return vars;
}
