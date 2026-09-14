/**
 * @fileoverview The sheet family: its panel on the overlay material, the
 * elevation scale and a primary-warmed ground, its scrim on the glass
 * decisions, its title on the section-title role, and its handle, close control
 * and footer rail on the palette, control material and focus decisions.
 *
 * @module Compilers/Theme/Lowering/Runtime/derivation/chrome/sheet
 * @category Compilers
 * @package @rottay/design-system
 */

import type { FamilyDeriver } from "../../../../foundation/contract";

/** A vertical's own sheet chrome outranks every relation stated here. */
export const sheetChromeDeriver: FamilyDeriver = {
  family: "sheet",
  rank: "derived",
  consumes: ["palette.*", "surfaces.materials", "surfaces.elevation", "surfaces.effects", "typography.roles", "states.focus"],
  produces: [
    "--ds-sheet-bg",
    "--ds-sheet-ground-top",
    "--ds-sheet-ground-end",
    "--ds-sheet-surface-lift",
    "--ds-sheet-shadow",
    "--ds-sheet-keyline",
    "--ds-sheet-border-color",
    "--ds-sheet-overlay-bg",
    "--ds-sheet-overlay-glass",
    "--ds-sheet-overlay-backdrop",
    "--ds-sheet-handle-bg",
    "--ds-sheet-header-border",
    "--ds-sheet-footer-border",
    "--ds-sheet-footer-bg",
    "--ds-sheet-title-color",
    "--ds-sheet-title-font-family",
    "--ds-sheet-title-font-size",
    "--ds-sheet-title-font-weight",
    "--ds-sheet-body-color",
    "--ds-sheet-close-color",
    "--ds-sheet-close-color-hover",
    "--ds-sheet-close-bg-hover",
    "--ds-sheet-focus-ring",
  ],
  derive: () => deriveSheetChannels(),
};

export function deriveSheetChannels(): Record<string, string> {
  const vars: Record<string, string> = {};
  vars["--ds-sheet-bg"] = "var(--ds-material-overlay-background)";
  vars["--ds-sheet-ground-top"] = "color-mix(in srgb, var(--ds-color-bg-primary) 98%, var(--ds-color-primary) 2%)";
  vars["--ds-sheet-ground-end"] = "var(--ds-color-bg-primary)";
  vars["--ds-sheet-surface-lift"] = "var(--ds-elevation-surface-4)";
  vars["--ds-sheet-shadow"] = "var(--ds-elevation-4)";
  vars["--ds-sheet-keyline"] =
    "color-mix(in srgb, var(--ds-color-bg-elevated) calc(72% * var(--ds-effect-intensity)), transparent)";
  vars["--ds-sheet-border-color"] = "var(--ds-color-border-subtle)";
  vars["--ds-sheet-overlay-bg"] = "color-mix(in srgb, var(--ds-color-black) 80%, transparent)";
  vars["--ds-sheet-overlay-glass"] = "var(--ds-glass-scrim-tint)";
  vars["--ds-sheet-overlay-backdrop"] = "var(--ds-glass-backdrop-filter)";
  vars["--ds-sheet-handle-bg"] = "var(--ds-color-border-secondary)";
  vars["--ds-sheet-header-border"] = "var(--ds-color-border-subtle)";
  vars["--ds-sheet-footer-border"] = "var(--ds-color-border-subtle)";
  vars["--ds-sheet-footer-bg"] = "color-mix(in srgb, var(--ds-color-bg-secondary) 74%, transparent)";
  vars["--ds-sheet-title-color"] = "var(--ds-color-text-primary)";
  vars["--ds-sheet-title-font-family"] = "var(--ds-type-section-title-font-family)";
  vars["--ds-sheet-title-font-size"] = "var(--ds-type-section-title-font-size)";
  vars["--ds-sheet-title-font-weight"] = "var(--ds-type-section-title-font-weight)";
  vars["--ds-sheet-body-color"] = "var(--ds-color-text-primary)";
  vars["--ds-sheet-close-color"] = "var(--ds-color-text-secondary)";
  vars["--ds-sheet-close-color-hover"] = "var(--ds-color-text-primary)";
  vars["--ds-sheet-close-bg-hover"] = "var(--ds-material-control-background-hover)";
  vars["--ds-sheet-focus-ring"] = "var(--ds-focus-ring)";
  return vars;
}
