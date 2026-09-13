/**
 * @fileoverview The time-picker family: its triggers on the input grammar and
 * the control material, its focus and status frames on the palette and focus
 * decisions, and its column panel, cells and Now action on the overlay material
 * and the palette.
 *
 * @module Compilers/Theme/Lowering/Runtime/derivation/chrome/time-picker
 * @category Compilers
 * @package @rottay/design-system
 */

import type { FamilyDeriver } from "../../../../foundation/contract";

/** A vertical's own time-picker chrome outranks every relation stated here. */
export const timePickerChromeDeriver: FamilyDeriver = {
  family: "time-picker",
  rank: "derived",
  consumes: ["palette.*", "surfaces.materials", "surfaces.elevation", "typography.roles", "states.focus"],
  produces: [
    "--ds-time-picker-bg",
    "--ds-time-picker-bg-disabled",
    "--ds-time-picker-filled-bg",
    "--ds-time-picker-color",
    "--ds-time-picker-font-family",
    "--ds-time-picker-border",
    "--ds-time-picker-border-hover",
    "--ds-time-picker-border-focus",
    "--ds-time-picker-shadow-focus",
    "--ds-time-picker-active-ring",
    "--ds-time-picker-error-border",
    "--ds-time-picker-warning-border",
    "--ds-time-picker-clear-color",
    "--ds-time-picker-icon-color",
    "--ds-time-picker-separator-color",
    "--ds-time-picker-panel-bg",
    "--ds-time-picker-panel-shadow",
    "--ds-time-picker-divider",
    "--ds-time-picker-label-ink",
    "--ds-time-picker-option-ink",
    "--ds-time-picker-option-bg-hover",
    "--ds-time-picker-option-bg-selected",
    "--ds-time-picker-option-ink-selected",
    "--ds-time-picker-now-bg",
    "--ds-time-picker-now-bg-hover",
    "--ds-time-picker-now-ink",
  ],
  derive: () => deriveTimePickerChannels(),
};

export function deriveTimePickerChannels(): Record<string, string> {
  const vars: Record<string, string> = {};
  vars["--ds-time-picker-bg"] = "var(--ds-input-bg, var(--ds-material-control-background))";
  vars["--ds-time-picker-bg-disabled"] = "var(--ds-material-control-background-disabled)";
  vars["--ds-time-picker-filled-bg"] = "var(--ds-material-inset-background)";
  vars["--ds-time-picker-color"] = "var(--ds-color-text-primary)";
  vars["--ds-time-picker-font-family"] = "var(--ds-input-font-family, var(--ds-type-body-font-family))";
  vars["--ds-time-picker-border"] = "var(--ds-input-border, var(--ds-material-control-border))";
  vars["--ds-time-picker-border-hover"] = "var(--ds-material-control-border-hover)";
  vars["--ds-time-picker-border-focus"] = "var(--ds-color-primary)";
  vars["--ds-time-picker-shadow-focus"] = "var(--ds-focus-ring)";
  vars["--ds-time-picker-active-ring"] = "0 0 0 var(--ds-focus-ring-width) var(--ds-color-primary)";
  vars["--ds-time-picker-error-border"] = "var(--ds-color-error)";
  vars["--ds-time-picker-warning-border"] = "var(--ds-color-warning)";
  vars["--ds-time-picker-clear-color"] = "var(--ds-color-text-primary)";
  vars["--ds-time-picker-icon-color"] = "var(--ds-type-color-muted)";
  vars["--ds-time-picker-separator-color"] = "var(--ds-color-text-secondary)";
  vars["--ds-time-picker-panel-bg"] = "var(--ds-color-bg-elevated, var(--ds-material-overlay-background))";
  vars["--ds-time-picker-panel-shadow"] = "var(--ds-shadow-popover, var(--ds-elevation-3))";
  vars["--ds-time-picker-divider"] = "var(--ds-color-border)";
  vars["--ds-time-picker-label-ink"] = "var(--ds-type-color-muted)";
  vars["--ds-time-picker-option-ink"] = "var(--ds-color-text-primary)";
  vars["--ds-time-picker-option-bg-hover"] = "var(--ds-color-bg-hover, var(--ds-material-control-background-hover))";
  vars["--ds-time-picker-option-bg-selected"] = "var(--ds-color-primary)";
  vars["--ds-time-picker-option-ink-selected"] = "var(--ds-color-text-on-primary)";
  vars["--ds-time-picker-now-bg"] = "var(--ds-color-primary)";
  vars["--ds-time-picker-now-bg-hover"] = "var(--ds-color-primary-hover, var(--ds-color-primary))";
  vars["--ds-time-picker-now-ink"] = "var(--ds-color-text-on-primary)";
  return vars;
}
