/**
 * @fileoverview The auto-complete family: its field on the input grammar and the
 * control material, its focus and status frames on the palette and focus
 * decisions, and its suggestion panel on the overlay material.
 *
 * @module Compilers/Theme/Lowering/Runtime/derivation/chrome/auto-complete
 * @category Compilers
 * @package @rottay/design-system
 */

import type { FamilyDeriver } from "../../../../foundation/contract";

/** A vertical's own auto-complete chrome outranks every relation stated here. */
export const autoCompleteChromeDeriver: FamilyDeriver = {
  family: "auto-complete",
  rank: "derived",
  consumes: ["palette.*", "surfaces.materials", "surfaces.elevation", "typography.roles", "states.focus"],
  produces: [
    "--ds-auto-complete-bg",
    "--ds-auto-complete-border",
    "--ds-auto-complete-border-hover",
    "--ds-auto-complete-border-focus",
    "--ds-auto-complete-shadow-focus",
    "--ds-auto-complete-ink",
    "--ds-auto-complete-caret",
    "--ds-auto-complete-font-family",
    "--ds-auto-complete-placeholder",
    "--ds-auto-complete-error-bg",
    "--ds-auto-complete-warning-bg",
    "--ds-auto-complete-error-border",
    "--ds-auto-complete-warning-border",
    "--ds-auto-complete-error-shadow-focus",
    "--ds-auto-complete-warning-shadow-focus",
    "--ds-auto-complete-clear-color",
    "--ds-auto-complete-clear-color-hover",
    "--ds-auto-complete-dropdown-bg",
    "--ds-auto-complete-dropdown-shadow",
    "--ds-auto-complete-dropdown-border",
    "--ds-auto-complete-option-ink",
    "--ds-auto-complete-option-ink-active",
    "--ds-auto-complete-option-border-active",
    "--ds-auto-complete-option-bg-hover",
    "--ds-auto-complete-empty-color",
    "--ds-auto-complete-empty-border",
  ],
  derive: () => deriveAutoCompleteChannels(),
};

export function deriveAutoCompleteChannels(): Record<string, string> {
  const vars: Record<string, string> = {};
  vars["--ds-auto-complete-bg"] = "var(--ds-input-bg, var(--ds-material-control-background))";
  vars["--ds-auto-complete-border"] = "var(--ds-input-border, var(--ds-material-control-border))";
  vars["--ds-auto-complete-border-hover"] = "var(--ds-material-control-border-hover)";
  vars["--ds-auto-complete-border-focus"] = "var(--ds-color-primary)";
  vars["--ds-auto-complete-shadow-focus"] = "var(--ds-focus-ring)";
  vars["--ds-auto-complete-ink"] = "var(--ds-color-text-primary)";
  vars["--ds-auto-complete-caret"] = "var(--ds-input-caret-color, var(--ds-color-primary))";
  vars["--ds-auto-complete-font-family"] = "var(--ds-input-font-family, var(--ds-type-body-font-family))";
  vars["--ds-auto-complete-placeholder"] = "var(--ds-input-color-placeholder, var(--ds-type-color-muted))";
  vars["--ds-auto-complete-error-bg"] = "var(--ds-input-error-bg, var(--ds-auto-complete-bg))";
  vars["--ds-auto-complete-warning-bg"] = "var(--ds-input-warning-bg, var(--ds-auto-complete-bg))";
  vars["--ds-auto-complete-error-border"] = "var(--ds-color-error)";
  vars["--ds-auto-complete-warning-border"] = "var(--ds-color-warning)";
  vars["--ds-auto-complete-error-shadow-focus"] = "var(--ds-input-error-shadow-focus, var(--ds-focus-ring))";
  vars["--ds-auto-complete-warning-shadow-focus"] = "var(--ds-input-warning-shadow-focus, var(--ds-focus-ring))";
  vars["--ds-auto-complete-clear-color"] = "var(--ds-type-color-muted)";
  vars["--ds-auto-complete-clear-color-hover"] = "var(--ds-input-clear-color-hover, var(--ds-color-text-primary))";
  vars["--ds-auto-complete-dropdown-bg"] = "var(--ds-material-overlay-background)";
  vars["--ds-auto-complete-dropdown-shadow"] = "var(--ds-elevation-2)";
  vars["--ds-auto-complete-dropdown-border"] = "var(--ds-color-border-subtle)";
  vars["--ds-auto-complete-option-ink"] = "var(--ds-color-text-secondary)";
  vars["--ds-auto-complete-option-ink-active"] = "var(--ds-color-text-primary)";
  vars["--ds-auto-complete-option-border-active"] = "var(--ds-color-border-subtle)";
  vars["--ds-auto-complete-option-bg-hover"] =
    "color-mix(in srgb, var(--ds-color-primary) 5%, var(--ds-material-overlay-background))";
  vars["--ds-auto-complete-empty-color"] = "var(--ds-type-color-muted)";
  vars["--ds-auto-complete-empty-border"] = "var(--ds-color-border)";
  return vars;
}
