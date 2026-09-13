/**
 * @fileoverview The cascader family: its trigger and search field on the input
 * grammar and the control material, its focus and status frames on the palette
 * and focus decisions, and its column panel on the overlay material.
 *
 * @module Compilers/Theme/Lowering/Runtime/derivation/chrome/cascader
 * @category Compilers
 * @package @rottay/design-system
 */

import type { FamilyDeriver } from "../../../../foundation/contract";

export const cascaderChromeDeriver: FamilyDeriver = {
  family: "cascader",
  rank: "derived",
  consumes: ["palette.*", "surfaces.materials", "surfaces.elevation", "typography.roles", "states.focus"],
  produces: [
    "--ds-cascader-bg",
    "--ds-cascader-ink",
    "--ds-cascader-font-family",
    "--ds-cascader-border",
    "--ds-cascader-border-hover",
    "--ds-cascader-border-focus",
    "--ds-cascader-shadow-focus",
    "--ds-cascader-error-border",
    "--ds-cascader-warning-border",
    "--ds-cascader-placeholder",
    "--ds-cascader-clear-color",
    "--ds-cascader-clear-color-hover",
    "--ds-cascader-dropdown-bg",
    "--ds-cascader-dropdown-border",
    "--ds-cascader-dropdown-shadow",
    "--ds-cascader-divider",
    "--ds-cascader-empty-ink",
    "--ds-cascader-option-ink",
    "--ds-cascader-option-bg-hover",
    "--ds-cascader-option-bg-selected",
    "--ds-cascader-option-border-selected",
    "--ds-cascader-chevron-ink",
    "--ds-cascader-spinner-track",
    "--ds-cascader-spinner-ink",
  ],
  derive: () => deriveCascaderChannels(),
};

export function deriveCascaderChannels(): Record<string, string> {
  const vars: Record<string, string> = {};
  vars["--ds-cascader-bg"] = "var(--ds-input-bg, var(--ds-material-control-background))";
  vars["--ds-cascader-ink"] = "var(--ds-color-text-primary)";
  vars["--ds-cascader-font-family"] = "var(--ds-input-font-family, var(--ds-type-body-font-family))";
  vars["--ds-cascader-border"] = "var(--ds-input-border, var(--ds-material-control-border))";
  vars["--ds-cascader-border-hover"] = "var(--ds-material-control-border-hover)";
  vars["--ds-cascader-border-focus"] = "var(--ds-color-primary)";
  vars["--ds-cascader-shadow-focus"] = "var(--ds-focus-ring)";
  vars["--ds-cascader-error-border"] = "var(--ds-color-error)";
  vars["--ds-cascader-warning-border"] = "var(--ds-color-warning)";
  vars["--ds-cascader-placeholder"] = "var(--ds-type-color-muted)";
  vars["--ds-cascader-clear-color"] = "var(--ds-color-text-primary)";
  vars["--ds-cascader-clear-color-hover"] = "var(--ds-input-clear-color-hover, var(--ds-color-text-primary))";
  vars["--ds-cascader-dropdown-bg"] = "var(--ds-material-overlay-background)";
  vars["--ds-cascader-dropdown-border"] = "var(--ds-color-border)";
  vars["--ds-cascader-dropdown-shadow"] = "var(--ds-elevation-2)";
  vars["--ds-cascader-divider"] = "var(--ds-color-border)";
  vars["--ds-cascader-empty-ink"] = "var(--ds-type-color-muted)";
  vars["--ds-cascader-option-ink"] = "var(--ds-color-text-primary)";
  vars["--ds-cascader-option-bg-hover"] = "var(--ds-color-bg-hover, var(--ds-material-control-background-hover))";
  vars["--ds-cascader-option-bg-selected"] = "color-mix(in srgb, var(--ds-color-primary) 10%, transparent)";
  vars["--ds-cascader-option-border-selected"] = "color-mix(in srgb, var(--ds-color-primary) 24%, transparent)";
  vars["--ds-cascader-chevron-ink"] = "var(--ds-color-text-muted)";
  vars["--ds-cascader-spinner-track"] = "var(--ds-color-border)";
  vars["--ds-cascader-spinner-ink"] = "var(--ds-color-primary)";
  return vars;
}
