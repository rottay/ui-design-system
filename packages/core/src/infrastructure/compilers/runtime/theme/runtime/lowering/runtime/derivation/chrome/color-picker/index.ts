/**
 * @fileoverview The color-picker family: its trigger swatch frame and hover on
 * the palette and elevation, its panel on the overlay material, and its hex and
 * format fields, presets and clear action on the control material, the palette
 * and the focus decision.
 *
 * @module Compilers/Theme/Lowering/Runtime/derivation/chrome/color-picker
 * @category Compilers
 * @package @rottay/design-system
 */

import type { FamilyDeriver } from "../../../../foundation/contract";

/** A vertical's own color-picker chrome outranks every relation stated here. */
export const colorPickerChromeDeriver: FamilyDeriver = {
  family: "color-picker",
  rank: "derived",
  consumes: ["palette.*", "surfaces.materials", "surfaces.elevation", "typography.roles", "states.focus", "shape.radius"],
  produces: [
    "--ds-color-picker-shadow-focus",
    "--ds-color-picker-empty-bg",
    "--ds-color-picker-empty-slash",
    "--ds-color-picker-swatch-shadow",
    "--ds-color-picker-swatch-shadow-hover",
    "--ds-color-picker-swatch-radius",
    "--ds-color-picker-swatch-border",
    "--ds-color-picker-swatch-border-hover",
    "--ds-color-picker-text-ink",
    "--ds-color-picker-font-family",
    "--ds-color-picker-panel-radius",
    "--ds-color-picker-panel-bg",
    "--ds-color-picker-panel-shadow",
    "--ds-color-picker-panel-border",
    "--ds-color-picker-field-radius",
    "--ds-color-picker-field-bg",
    "--ds-color-picker-field-ink",
    "--ds-color-picker-field-border",
    "--ds-color-picker-field-border-hover",
    "--ds-color-picker-field-border-focus",
    "--ds-color-picker-error-border",
    "--ds-color-picker-error-ink",
    "--ds-color-picker-divider",
    "--ds-color-picker-label-ink",
    "--ds-color-picker-selected-ring",
    "--ds-color-picker-check-ink",
    "--ds-color-picker-check-halo",
    "--ds-color-picker-clear-ink",
    "--ds-color-picker-clear-bg-hover",
  ],
  derive: () => deriveColorPickerChannels(),
};

export function deriveColorPickerChannels(): Record<string, string> {
  const vars: Record<string, string> = {};
  vars["--ds-color-picker-shadow-focus"] = "var(--ds-focus-ring)";
  vars["--ds-color-picker-empty-bg"] = "var(--ds-material-control-background)";
  vars["--ds-color-picker-empty-slash"] = "var(--ds-type-color-muted)";
  vars["--ds-color-picker-swatch-shadow"] = "var(--ds-elevation-1)";
  vars["--ds-color-picker-swatch-shadow-hover"] = "var(--ds-elevation-2)";
  vars["--ds-color-picker-swatch-radius"] = "var(--ds-radius-sm)";
  vars["--ds-color-picker-swatch-border"] = "var(--ds-color-border)";
  vars["--ds-color-picker-swatch-border-hover"] =
    "color-mix(in srgb, var(--ds-color-primary) 34%, var(--ds-color-border))";
  vars["--ds-color-picker-text-ink"] = "var(--ds-color-text-primary)";
  vars["--ds-color-picker-font-family"] = "var(--ds-input-font-family, var(--ds-type-body-font-family))";
  vars["--ds-color-picker-panel-radius"] = "var(--ds-radius-lg)";
  vars["--ds-color-picker-panel-bg"] = "var(--ds-material-overlay-background, var(--ds-surface-card))";
  vars["--ds-color-picker-panel-shadow"] = "var(--ds-material-overlay-shadow, var(--ds-elevation-2))";
  vars["--ds-color-picker-panel-border"] = "var(--ds-material-overlay-border, var(--ds-color-border-subtle))";
  vars["--ds-color-picker-field-radius"] = "var(--ds-radius-md)";
  vars["--ds-color-picker-field-bg"] = "var(--ds-input-bg, var(--ds-material-control-background))";
  vars["--ds-color-picker-field-ink"] = "var(--ds-color-text-primary)";
  vars["--ds-color-picker-field-border"] = "var(--ds-input-border, var(--ds-material-control-border))";
  vars["--ds-color-picker-field-border-hover"] = "var(--ds-material-control-border-hover)";
  vars["--ds-color-picker-field-border-focus"] = "var(--ds-color-primary)";
  vars["--ds-color-picker-error-border"] = "var(--ds-color-error)";
  vars["--ds-color-picker-error-ink"] = "var(--ds-color-error)";
  vars["--ds-color-picker-divider"] = "var(--ds-color-border)";
  vars["--ds-color-picker-label-ink"] = "var(--ds-color-text-secondary)";
  vars["--ds-color-picker-selected-ring"] = "var(--ds-color-primary)";
  vars["--ds-color-picker-check-ink"] = "var(--ds-color-white)";
  vars["--ds-color-picker-check-halo"] = "color-mix(in srgb, var(--ds-color-neutral-900) 85%, transparent)";
  vars["--ds-color-picker-clear-ink"] = "var(--ds-color-text-primary)";
  vars["--ds-color-picker-clear-bg-hover"] = "var(--ds-material-inset-background, var(--ds-surface-inset))";
  return vars;
}
