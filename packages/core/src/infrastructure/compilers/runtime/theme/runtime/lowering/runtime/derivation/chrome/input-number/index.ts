/**
 * @fileoverview The input-number family: its frame, ground and ink on the
 * field grammar the input decisions move, and its steppers on the palette.
 *
 * @module Compilers/Theme/Lowering/Runtime/derivation/chrome/input-number
 * @category Compilers
 * @package @rottay/design-system
 */

import type { FamilyDeriver } from "../../../../foundation/contract";

/** A vertical's own input-number chrome outranks every relation stated here. */
export const inputNumberChromeDeriver: FamilyDeriver = {
  family: "input-number",
  rank: "derived",
  consumes: ["palette.*", "surfaces.materials", "typography.roles"],
  produces: [
    "--ds-input-number-bg",
    "--ds-input-number-bg-disabled",
    "--ds-input-number-color",
    "--ds-input-number-color-disabled",
    "--ds-input-number-caret",
    "--ds-input-number-placeholder",
    "--ds-input-number-placeholder-opacity",
    "--ds-input-number-selection-bg",
    "--ds-input-number-selection-color",
    "--ds-input-number-border",
    "--ds-input-number-border-hover",
    "--ds-input-number-border-focus",
    "--ds-input-number-border-disabled",
    "--ds-input-number-shadow-focus",
    "--ds-input-number-error-border",
    "--ds-input-number-error-bg",
    "--ds-input-number-error-shadow-focus",
    "--ds-input-number-warning-border",
    "--ds-input-number-warning-bg",
    "--ds-input-number-warning-shadow-focus",
    "--ds-input-number-readonly-color",
    "--ds-input-number-readonly-bg",
    "--ds-input-number-readonly-border",
    "--ds-input-number-addon-bg",
    "--ds-input-number-addon-border",
    "--ds-input-number-addon-color",
    "--ds-input-number-affix-color",
    "--ds-input-number-font-family",
    "--ds-input-number-font-weight",
    "--ds-input-number-letter-spacing",
    "--ds-input-number-stepper-color",
    "--ds-input-number-stepper-color-hover",
    "--ds-input-number-stepper-color-disabled",
    "--ds-input-number-stepper-bg-hover",
    "--ds-input-number-stepper-separator",
  ],
  derive: () => deriveInputNumberChannels(),
};

export function deriveInputNumberChannels(): Record<string, string> {
  const vars: Record<string, string> = {};
  vars["--ds-input-number-bg"] = "var(--ds-input-bg)";
  vars["--ds-input-number-bg-disabled"] = "var(--ds-input-bg-disabled)";
  vars["--ds-input-number-color"] = "var(--ds-input-color)";
  vars["--ds-input-number-color-disabled"] = "var(--ds-input-color-disabled)";
  vars["--ds-input-number-caret"] = "var(--ds-input-caret-color)";
  vars["--ds-input-number-placeholder"] = "var(--ds-input-color-placeholder)";
  vars["--ds-input-number-placeholder-opacity"] = "var(--ds-input-placeholder-opacity)";
  vars["--ds-input-number-selection-bg"] = "var(--ds-input-selection-bg)";
  vars["--ds-input-number-selection-color"] = "var(--ds-input-selection-color)";
  vars["--ds-input-number-border"] = "var(--ds-input-border)";
  vars["--ds-input-number-border-hover"] = "var(--ds-input-border-hover)";
  vars["--ds-input-number-border-focus"] = "var(--ds-input-border-focus)";
  vars["--ds-input-number-border-disabled"] = "var(--ds-input-border-disabled)";
  vars["--ds-input-number-shadow-focus"] = "var(--ds-input-shadow-focus)";
  vars["--ds-input-number-error-border"] = "var(--ds-input-error-border)";
  vars["--ds-input-number-error-bg"] = "var(--ds-input-error-bg)";
  vars["--ds-input-number-error-shadow-focus"] = "var(--ds-input-error-shadow-focus)";
  vars["--ds-input-number-warning-border"] = "var(--ds-input-warning-border)";
  vars["--ds-input-number-warning-bg"] = "var(--ds-input-warning-bg)";
  vars["--ds-input-number-warning-shadow-focus"] = "var(--ds-input-warning-shadow-focus)";
  vars["--ds-input-number-readonly-color"] = "var(--ds-input-readonly-color)";
  vars["--ds-input-number-readonly-bg"] = "var(--ds-input-readonly-bg)";
  vars["--ds-input-number-readonly-border"] = "var(--ds-input-readonly-border)";
  vars["--ds-input-number-addon-bg"] = "var(--ds-input-addon-bg)";
  vars["--ds-input-number-addon-border"] = "var(--ds-input-addon-border)";
  vars["--ds-input-number-addon-color"] = "var(--ds-input-addon-color)";
  vars["--ds-input-number-affix-color"] = "var(--ds-input-affix-color)";
  vars["--ds-input-number-font-family"] = "var(--ds-input-font-family)";
  vars["--ds-input-number-font-weight"] = "var(--ds-input-font-weight)";
  vars["--ds-input-number-letter-spacing"] = "var(--ds-input-letter-spacing)";
  vars["--ds-input-number-stepper-color"] = "var(--ds-color-text-secondary)";
  vars["--ds-input-number-stepper-color-hover"] = "var(--ds-color-primary)";
  vars["--ds-input-number-stepper-color-disabled"] = "var(--ds-color-text-disabled)";
  vars["--ds-input-number-stepper-bg-hover"] = "var(--ds-material-control-background-hover)";
  vars["--ds-input-number-stepper-separator"] = "var(--ds-color-border-subtle)";
  return vars;
}
