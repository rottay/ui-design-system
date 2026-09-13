/**
 * @fileoverview The input family: its caret, selection and loading ink on the
 * palette decisions, its rest depth on the control material, and its counter
 * and placeholder on the type roles.
 *
 * @module Compilers/Theme/Lowering/Runtime/derivation/chrome/input
 * @category Compilers
 * @package @rottay/design-system
 */

import type { FamilyDeriver } from "../../../../foundation/contract";

/** A vertical's own input chrome outranks every relation stated here. */
export const inputChromeDeriver: FamilyDeriver = {
  family: "input",
  rank: "derived",
  consumes: [
    "palette.*",
    "surfaces.materials",
    "typography.roles",
    "typography.roleWeights",
  ],
  produces: [
    "--ds-input-caret-color",
    "--ds-input-selection-bg",
    "--ds-input-loading-color",
    "--ds-input-filled-border",
    "--ds-input-shadow-rest",
    "--ds-input-color-placeholder",
    "--ds-input-count-color",
    "--ds-input-count-limit-font-weight",
  ],
  derive: () => deriveInputChannels(),
};

export function deriveInputChannels(): Record<string, string> {
  const vars: Record<string, string> = {};
  vars["--ds-input-caret-color"] = "var(--ds-color-primary)";
  vars["--ds-input-selection-bg"] = "color-mix(in srgb, var(--ds-color-primary) 20%, transparent)";
  vars["--ds-input-loading-color"] = "var(--ds-color-primary)";
  vars["--ds-input-filled-border"] = "transparent";
  vars["--ds-input-shadow-rest"] = "var(--ds-material-control-shadow)";
  vars["--ds-input-color-placeholder"] = "var(--ds-type-color-muted)";
  vars["--ds-input-count-color"] = "var(--ds-type-color-muted)";
  vars["--ds-input-count-limit-font-weight"] = "var(--ds-type-label-font-weight)";
  return vars;
}
