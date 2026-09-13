/**
 * @fileoverview The mentions family: its textarea on the input field grammar
 * and the control material, its focus and status frames on the palette and
 * focus decisions, and its suggestion panel on the overlay material.
 *
 * @module Compilers/Theme/Lowering/Runtime/derivation/chrome/mentions
 * @category Compilers
 * @package @rottay/design-system
 */

import type { FamilyDeriver } from "../../../../foundation/contract";

export const mentionsChromeDeriver: FamilyDeriver = {
  family: "mentions",
  rank: "derived",
  consumes: ["palette.*", "surfaces.materials", "surfaces.elevation", "typography.roles", "states.focus"],
  produces: [
    "--ds-mentions-font-family",
    "--ds-mentions-border",
    "--ds-mentions-border-hover",
    "--ds-mentions-border-focus",
    "--ds-mentions-border-disabled",
    "--ds-mentions-border-readonly",
    "--ds-mentions-input-bg",
    "--ds-mentions-input-bg-disabled",
    "--ds-mentions-input-bg-readonly",
    "--ds-mentions-ink",
    "--ds-mentions-ink-disabled",
    "--ds-mentions-ink-readonly",
    "--ds-mentions-caret",
    "--ds-mentions-placeholder-color",
    "--ds-mentions-shadow-focus",
    "--ds-mentions-error-border",
    "--ds-mentions-warning-border",
    "--ds-mentions-error-shadow-focus",
    "--ds-mentions-warning-shadow-focus",
    "--ds-mentions-dropdown-bg",
    "--ds-mentions-dropdown-border",
    "--ds-mentions-dropdown-shadow",
    "--ds-mentions-scrollbar-thumb",
    "--ds-mentions-trigger-accent",
    "--ds-mentions-option-ink",
    "--ds-mentions-option-bg-hover",
    "--ds-mentions-option-border-active",
    "--ds-mentions-empty-ink",
    "--ds-mentions-spinner-track",
    "--ds-mentions-spinner-ink",
  ],
  derive: () => deriveMentionsChannels(),
};

export function deriveMentionsChannels(): Record<string, string> {
  const vars: Record<string, string> = {};
  vars["--ds-mentions-font-family"] = "var(--ds-input-font-family, var(--ds-type-body-font-family))";
  vars["--ds-mentions-border"] = "var(--ds-input-border, var(--ds-material-control-border))";
  vars["--ds-mentions-border-hover"] = "var(--ds-material-control-border-hover)";
  vars["--ds-mentions-border-focus"] = "var(--ds-input-border-focus, var(--ds-color-primary))";
  vars["--ds-mentions-border-disabled"] = "var(--ds-input-border-disabled, var(--ds-material-control-border-disabled))";
  vars["--ds-mentions-border-readonly"] = "var(--ds-input-readonly-border, var(--ds-material-control-border))";
  vars["--ds-mentions-input-bg"] = "var(--ds-input-bg, var(--ds-material-control-background))";
  vars["--ds-mentions-input-bg-disabled"] = "var(--ds-input-bg-disabled, var(--ds-material-control-background-disabled))";
  vars["--ds-mentions-input-bg-readonly"] = "var(--ds-input-readonly-bg, var(--ds-mentions-input-bg))";
  vars["--ds-mentions-ink"] = "var(--ds-color-text-primary)";
  vars["--ds-mentions-ink-disabled"] = "var(--ds-color-text-disabled)";
  vars["--ds-mentions-ink-readonly"] = "var(--ds-input-readonly-color, var(--ds-color-text-primary))";
  vars["--ds-mentions-caret"] = "var(--ds-input-border-focus, var(--ds-color-primary))";
  vars["--ds-mentions-placeholder-color"] = "var(--ds-input-color-placeholder, var(--ds-type-color-muted))";
  vars["--ds-mentions-shadow-focus"] = "var(--ds-input-shadow-focus, var(--ds-focus-ring))";
  vars["--ds-mentions-error-border"] = "var(--ds-color-error)";
  vars["--ds-mentions-warning-border"] = "var(--ds-color-warning)";
  vars["--ds-mentions-error-shadow-focus"] = "var(--ds-input-error-shadow-focus, var(--ds-focus-ring))";
  vars["--ds-mentions-warning-shadow-focus"] = "var(--ds-input-warning-shadow-focus, var(--ds-focus-ring))";
  vars["--ds-mentions-dropdown-bg"] = "var(--ds-material-overlay-background)";
  vars["--ds-mentions-dropdown-border"] = "var(--ds-color-border-subtle)";
  vars["--ds-mentions-dropdown-shadow"] = "var(--ds-elevation-3)";
  vars["--ds-mentions-scrollbar-thumb"] = "var(--ds-color-border-secondary)";
  vars["--ds-mentions-trigger-accent"] = "color-mix(in srgb, var(--ds-color-primary) 30%, var(--ds-color-border-subtle))";
  vars["--ds-mentions-option-ink"] = "var(--ds-color-text-primary)";
  vars["--ds-mentions-option-bg-hover"] =
    "color-mix(in srgb, var(--ds-color-primary) 9%, var(--ds-material-overlay-background))";
  vars["--ds-mentions-option-border-active"] = "color-mix(in srgb, var(--ds-color-primary) 28%, transparent)";
  vars["--ds-mentions-empty-ink"] = "var(--ds-type-color-muted)";
  vars["--ds-mentions-spinner-track"] = "var(--ds-color-border)";
  vars["--ds-mentions-spinner-ink"] = "var(--ds-color-primary)";
  return vars;
}
