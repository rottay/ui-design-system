/**
 * @fileoverview The tree-select family: its trigger and search field on the
 * input grammar and the control material, its focus and status frames on the
 * palette and focus decisions, and its tree panel on the overlay material.
 *
 * @module Compilers/Theme/Lowering/Runtime/derivation/chrome/tree-select
 * @category Compilers
 * @package @rottay/design-system
 */

import type { FamilyDeriver } from "../../../../foundation/contract";

export const treeSelectChromeDeriver: FamilyDeriver = {
  family: "tree-select",
  rank: "derived",
  consumes: ["palette.*", "surfaces.materials", "surfaces.elevation", "typography.roles", "states.focus"],
  produces: [
    "--ds-tree-select-bg",
    "--ds-tree-select-ink",
    "--ds-tree-select-font-family",
    "--ds-tree-select-border",
    "--ds-tree-select-border-hover",
    "--ds-tree-select-border-focus",
    "--ds-tree-select-shadow-focus",
    "--ds-tree-select-error-border",
    "--ds-tree-select-warning-border",
    "--ds-tree-select-error-shadow-focus",
    "--ds-tree-select-warning-shadow-focus",
    "--ds-tree-select-placeholder",
    "--ds-tree-select-clear-color",
    "--ds-tree-select-clear-color-hover",
    "--ds-tree-select-dropdown-bg",
    "--ds-tree-select-dropdown-border",
    "--ds-tree-select-dropdown-shadow",
    "--ds-tree-select-divider",
    "--ds-tree-select-empty-ink",
    "--ds-tree-select-option-ink",
    "--ds-tree-select-option-ink-selected",
    "--ds-tree-select-option-bg-hover",
    "--ds-tree-select-option-bg-selected",
    "--ds-tree-select-option-border-selected",
    "--ds-tree-select-highlight-ink",
    "--ds-tree-select-check-accent",
    "--ds-tree-select-line",
    "--ds-tree-select-spinner-track",
    "--ds-tree-select-spinner-ink",
  ],
  derive: () => deriveTreeSelectChannels(),
};

export function deriveTreeSelectChannels(): Record<string, string> {
  const vars: Record<string, string> = {};
  vars["--ds-tree-select-bg"] = "var(--ds-input-bg, var(--ds-material-control-background))";
  vars["--ds-tree-select-ink"] = "var(--ds-color-text-primary)";
  vars["--ds-tree-select-font-family"] = "var(--ds-input-font-family, var(--ds-type-body-font-family))";
  vars["--ds-tree-select-border"] = "var(--ds-input-border, var(--ds-material-control-border))";
  vars["--ds-tree-select-border-hover"] = "var(--ds-material-control-border-hover)";
  vars["--ds-tree-select-border-focus"] = "var(--ds-color-primary)";
  vars["--ds-tree-select-shadow-focus"] = "var(--ds-focus-ring)";
  vars["--ds-tree-select-error-border"] = "var(--ds-color-error)";
  vars["--ds-tree-select-warning-border"] = "var(--ds-color-warning)";
  vars["--ds-tree-select-error-shadow-focus"] = "var(--ds-input-error-shadow-focus, var(--ds-focus-ring))";
  vars["--ds-tree-select-warning-shadow-focus"] = "var(--ds-input-warning-shadow-focus, var(--ds-focus-ring))";
  vars["--ds-tree-select-placeholder"] = "var(--ds-type-color-muted)";
  vars["--ds-tree-select-clear-color"] = "var(--ds-color-text-primary)";
  vars["--ds-tree-select-clear-color-hover"] = "var(--ds-input-clear-color-hover, var(--ds-color-text-primary))";
  vars["--ds-tree-select-dropdown-bg"] = "var(--ds-material-overlay-background)";
  vars["--ds-tree-select-dropdown-border"] = "var(--ds-color-border)";
  vars["--ds-tree-select-dropdown-shadow"] = "var(--ds-elevation-2)";
  vars["--ds-tree-select-divider"] = "var(--ds-color-border)";
  vars["--ds-tree-select-empty-ink"] = "var(--ds-type-color-muted)";
  vars["--ds-tree-select-option-ink"] = "var(--ds-color-text-primary)";
  vars["--ds-tree-select-option-ink-selected"] = "var(--ds-color-primary)";
  vars["--ds-tree-select-option-bg-hover"] = "var(--ds-color-bg-hover, var(--ds-material-control-background-hover))";
  vars["--ds-tree-select-option-bg-selected"] = "color-mix(in srgb, var(--ds-color-primary) 10%, transparent)";
  vars["--ds-tree-select-option-border-selected"] = "color-mix(in srgb, var(--ds-color-primary) 24%, transparent)";
  vars["--ds-tree-select-highlight-ink"] = "var(--ds-color-primary)";
  vars["--ds-tree-select-check-accent"] = "var(--ds-color-primary)";
  vars["--ds-tree-select-line"] = "var(--ds-color-border-subtle)";
  vars["--ds-tree-select-spinner-track"] = "var(--ds-color-border)";
  vars["--ds-tree-select-spinner-ink"] = "var(--ds-color-primary)";
  return vars;
}
