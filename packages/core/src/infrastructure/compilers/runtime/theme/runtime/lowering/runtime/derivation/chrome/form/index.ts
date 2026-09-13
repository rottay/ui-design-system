/**
 * @fileoverview The form family: its item labels on the field grammar and the
 * palette, its supporting text on the secondary ink and its spinner on motion.
 *
 * @module Compilers/Theme/Lowering/Runtime/derivation/chrome/form
 * @category Compilers
 * @package @rottay/design-system
 */

import type { FamilyDeriver } from "../../../../foundation/contract";

/** A vertical's own form chrome outranks every relation stated here. */
export const formChromeDeriver: FamilyDeriver = {
  family: "form",
  rank: "derived",
  consumes: ["palette.*", "typography.roles", "motion.*"],
  produces: [
    "--ds-form-label-color",
    "--ds-form-label-color-focus",
    "--ds-form-label-font-family",
    "--ds-form-label-text-transform",
    "--ds-form-supporting-color",
    "--ds-form-spinner-duration",
    "--ds-form-badge-ink",
  ],
  derive: () => deriveFormChannels(),
};

export function deriveFormChannels(): Record<string, string> {
  const vars: Record<string, string> = {};
  vars["--ds-form-label-color"] = "var(--ds-input-label-color)";
  vars["--ds-form-label-color-focus"] = "var(--ds-color-primary)";
  vars["--ds-form-label-font-family"] = "var(--ds-input-label-font-family)";
  vars["--ds-form-label-text-transform"] = "var(--ds-type-label-text-transform)";
  vars["--ds-form-supporting-color"] = "var(--ds-color-text-secondary)";
  vars["--ds-form-spinner-duration"] = "var(--ds-motion-glacial)";
  vars["--ds-form-badge-ink"] = "color-mix(in srgb, var(--ds-color-text-muted) 50%, var(--ds-color-text-primary) 50%)";
  return vars;
}
