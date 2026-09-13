/**
 * @fileoverview The select family: its trigger depth on the control material,
 * its type on the body role, its panel texture on the overlay material, and its
 * option, tag and action inks on the palette decisions.
 *
 * @module Compilers/Theme/Lowering/Runtime/derivation/chrome/select
 * @category Compilers
 * @package @rottay/design-system
 */

import type { FamilyDeriver } from "../../../../foundation/contract";

/** A vertical's own select chrome outranks every relation stated here. */
export const selectChromeDeriver: FamilyDeriver = {
  family: "select",
  rank: "derived",
  consumes: ["palette.*", "surfaces.materials", "surfaces.elevation", "typography.roles", "states.focus"],
  produces: [
    "--ds-select-shadow",
    "--ds-select-shadow-hover",
    "--ds-select-filled-border",
    "--ds-select-shadow-focus",
    "--ds-select-error-border",
    "--ds-select-warning-border",
    "--ds-select-success-border",
    "--ds-select-error-bg",
    "--ds-select-warning-bg",
    "--ds-select-success-bg",
    "--ds-select-placeholder-color",
    "--ds-select-font-family",
    "--ds-select-tag-border",
    "--ds-select-tag-count-bg",
    "--ds-select-action-color",
    "--ds-select-action-color-hover",
    "--ds-select-action-bg-hover",
    "--ds-select-action-border-hover",
    "--ds-select-action-focus-ring",
    "--ds-select-arrow-color-open",
    "--ds-select-dropdown-texture",
    "--ds-select-search-border",
    "--ds-select-search-icon-color",
    "--ds-select-group-color",
    "--ds-select-group-divider",
    "--ds-select-option-color-hover",
    "--ds-select-option-border-hover",
    "--ds-select-option-border-selected",
    "--ds-select-option-icon-bg",
    "--ds-select-option-icon-bg-active",
    "--ds-select-option-check-bg",
    "--ds-select-empty-ink",
    "--ds-select-empty-bg",
    "--ds-select-empty-border",
    "--ds-select-loading-track",
    "--ds-select-scrollbar-thumb",
  ],
  derive: () => deriveSelectChannels(),
};

export function deriveSelectChannels(): Record<string, string> {
  const vars: Record<string, string> = {};
  vars["--ds-select-shadow"] = "var(--ds-material-control-shadow)";
  vars["--ds-select-shadow-hover"] = "var(--ds-material-control-shadow-hover)";
  vars["--ds-select-filled-border"] = "transparent";
  vars["--ds-select-shadow-focus"] = "var(--ds-focus-ring)";
  vars["--ds-select-error-border"] = "var(--ds-color-error)";
  vars["--ds-select-warning-border"] = "var(--ds-color-warning)";
  vars["--ds-select-success-border"] = "var(--ds-color-success)";
  vars["--ds-select-error-bg"] = "var(--ds-select-bg, var(--ds-material-control-background))";
  vars["--ds-select-warning-bg"] = "var(--ds-select-bg, var(--ds-material-control-background))";
  vars["--ds-select-success-bg"] = "var(--ds-select-bg, var(--ds-material-control-background))";
  vars["--ds-select-placeholder-color"] = "var(--ds-type-color-muted)";
  vars["--ds-select-font-family"] = "var(--ds-input-font-family, var(--ds-type-body-font-family))";
  vars["--ds-select-tag-border"] = "color-mix(in srgb, var(--ds-color-primary) 16%, var(--ds-color-border-subtle))";
  vars["--ds-select-tag-count-bg"] = "var(--ds-surface-canvas)";
  vars["--ds-select-action-color"] = "var(--ds-color-text-muted)";
  vars["--ds-select-action-color-hover"] = "var(--ds-color-text-primary)";
  vars["--ds-select-action-bg-hover"] = "var(--ds-material-inset-background)";
  vars["--ds-select-action-border-hover"] = "var(--ds-color-border-subtle)";
  vars["--ds-select-action-focus-ring"] = "var(--ds-focus-ring)";
  vars["--ds-select-arrow-color-open"] = "var(--ds-color-primary)";
  vars["--ds-select-dropdown-texture"] = "var(--ds-material-overlay-texture, none)";
  vars["--ds-select-search-border"] = "var(--ds-color-border-subtle)";
  vars["--ds-select-search-icon-color"] = "var(--ds-color-text-muted)";
  vars["--ds-select-group-color"] = "var(--ds-color-text-muted)";
  vars["--ds-select-group-divider"] = "var(--ds-color-border-subtle)";
  vars["--ds-select-option-color-hover"] = "var(--ds-color-text-primary)";
  vars["--ds-select-option-border-hover"] = "var(--ds-color-border-subtle)";
  vars["--ds-select-option-border-selected"] =
    "color-mix(in srgb, var(--ds-color-primary) 32%, var(--ds-color-border-subtle))";
  vars["--ds-select-option-icon-bg"] = "color-mix(in srgb, currentColor 7%, transparent)";
  vars["--ds-select-option-icon-bg-active"] = "color-mix(in srgb, currentColor 11%, transparent)";
  vars["--ds-select-option-check-bg"] = "color-mix(in srgb, var(--ds-color-primary) 9%, transparent)";
  vars["--ds-select-empty-ink"] = "var(--ds-color-text-muted)";
  vars["--ds-select-empty-bg"] = "transparent";
  vars["--ds-select-empty-border"] = "var(--ds-color-border)";
  vars["--ds-select-loading-track"] = "color-mix(in srgb, var(--ds-color-primary) 28%, var(--ds-color-border))";
  vars["--ds-select-scrollbar-thumb"] = "color-mix(in srgb, var(--ds-color-primary) 24%, var(--ds-color-border))";
  return vars;
}
