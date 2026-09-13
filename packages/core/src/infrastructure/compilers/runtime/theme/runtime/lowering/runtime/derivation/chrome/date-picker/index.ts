/**
 * @fileoverview The date-picker family: its triggers on the input grammar and
 * the control material, its focus and status frames on the palette and focus
 * decisions, and its calendar panel, cells, range band and Today action on the
 * overlay material and the palette.
 *
 * @module Compilers/Theme/Lowering/Runtime/derivation/chrome/date-picker
 * @category Compilers
 * @package @rottay/design-system
 */

import type { FamilyDeriver } from "../../../../foundation/contract";

/** A vertical's own date-picker chrome outranks every relation stated here. */
export const datePickerChromeDeriver: FamilyDeriver = {
  family: "date-picker",
  rank: "derived",
  consumes: ["palette.*", "surfaces.materials", "surfaces.elevation", "typography.roles", "states.focus"],
  produces: [
    "--ds-date-picker-bg",
    "--ds-date-picker-bg-disabled",
    "--ds-date-picker-filled-bg",
    "--ds-date-picker-color",
    "--ds-date-picker-font-family",
    "--ds-date-picker-placeholder",
    "--ds-date-picker-border",
    "--ds-date-picker-border-hover",
    "--ds-date-picker-border-focus",
    "--ds-date-picker-shadow-focus",
    "--ds-date-picker-active-ring",
    "--ds-date-picker-error-border",
    "--ds-date-picker-warning-border",
    "--ds-date-picker-clear-color",
    "--ds-date-picker-icon-color",
    "--ds-date-picker-separator-color",
    "--ds-date-picker-panel-bg",
    "--ds-date-picker-panel-shadow",
    "--ds-date-picker-divider",
    "--ds-date-picker-title-ink",
    "--ds-date-picker-weekday-ink",
    "--ds-date-picker-nav-ink",
    "--ds-date-picker-nav-bg-hover",
    "--ds-date-picker-cell-ink",
    "--ds-date-picker-cell-bg-hover",
    "--ds-date-picker-cell-bg-selected",
    "--ds-date-picker-cell-ink-selected",
    "--ds-date-picker-band-bg",
    "--ds-date-picker-band-preview-bg",
    "--ds-date-picker-today-ring",
    "--ds-date-picker-today-marker",
    "--ds-date-picker-time-select-bg",
    "--ds-date-picker-today-bg",
    "--ds-date-picker-today-bg-hover",
    "--ds-date-picker-today-ink",
  ],
  derive: () => deriveDatePickerChannels(),
};

export function deriveDatePickerChannels(): Record<string, string> {
  const vars: Record<string, string> = {};
  vars["--ds-date-picker-bg"] = "var(--ds-input-bg, var(--ds-material-control-background))";
  vars["--ds-date-picker-bg-disabled"] = "var(--ds-material-control-background-disabled)";
  vars["--ds-date-picker-filled-bg"] = "var(--ds-input-filled-bg, var(--ds-material-inset-background))";
  vars["--ds-date-picker-color"] = "var(--ds-color-text-primary)";
  vars["--ds-date-picker-font-family"] = "var(--ds-input-font-family, var(--ds-type-body-font-family))";
  vars["--ds-date-picker-placeholder"] = "var(--ds-type-color-muted)";
  vars["--ds-date-picker-border"] = "var(--ds-input-border, var(--ds-material-control-border))";
  vars["--ds-date-picker-border-hover"] = "var(--ds-material-control-border-hover)";
  vars["--ds-date-picker-border-focus"] = "var(--ds-color-primary)";
  vars["--ds-date-picker-shadow-focus"] = "var(--ds-focus-ring)";
  vars["--ds-date-picker-active-ring"] = "0 0 0 var(--ds-focus-ring-width) var(--ds-color-primary)";
  vars["--ds-date-picker-error-border"] = "var(--ds-color-error)";
  vars["--ds-date-picker-warning-border"] = "var(--ds-color-warning)";
  vars["--ds-date-picker-clear-color"] = "var(--ds-color-text-primary)";
  vars["--ds-date-picker-icon-color"] = "var(--ds-type-color-muted)";
  vars["--ds-date-picker-separator-color"] = "var(--ds-color-text-secondary)";
  vars["--ds-date-picker-panel-bg"] = "var(--ds-color-bg-elevated, var(--ds-material-overlay-background))";
  vars["--ds-date-picker-panel-shadow"] = "var(--ds-shadow-popover, var(--ds-elevation-3))";
  vars["--ds-date-picker-divider"] = "var(--ds-color-border)";
  vars["--ds-date-picker-title-ink"] = "var(--ds-color-text-primary)";
  vars["--ds-date-picker-weekday-ink"] = "var(--ds-type-color-muted)";
  vars["--ds-date-picker-nav-ink"] = "var(--ds-color-text-primary)";
  vars["--ds-date-picker-nav-bg-hover"] = "var(--ds-color-bg-hover, var(--ds-material-control-background-hover))";
  vars["--ds-date-picker-cell-ink"] = "var(--ds-color-text-primary)";
  vars["--ds-date-picker-cell-bg-hover"] = "var(--ds-color-bg-hover, var(--ds-material-control-background-hover))";
  vars["--ds-date-picker-cell-bg-selected"] = "var(--ds-color-primary)";
  vars["--ds-date-picker-cell-ink-selected"] = "var(--ds-color-text-on-primary)";
  vars["--ds-date-picker-band-bg"] = "var(--ds-wash-band)";
  vars["--ds-date-picker-band-preview-bg"] = "var(--ds-wash-band-preview)";
  vars["--ds-date-picker-today-ring"] = "var(--ds-color-primary)";
  vars["--ds-date-picker-today-marker"] = "var(--ds-color-primary)";
  vars["--ds-date-picker-time-select-bg"] = "var(--ds-color-bg-elevated, var(--ds-material-control-background))";
  vars["--ds-date-picker-today-bg"] = "var(--ds-color-primary)";
  vars["--ds-date-picker-today-bg-hover"] = "var(--ds-color-primary-hover, var(--ds-color-primary))";
  vars["--ds-date-picker-today-ink"] = "var(--ds-color-text-on-primary)";
  return vars;
}
