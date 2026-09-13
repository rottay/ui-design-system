/**
 * @fileoverview The checkbox family: its fill, frame and ink on the palette
 * decisions, and its supporting text on the caption type role.
 *
 * @module Compilers/Theme/Lowering/Runtime/derivation/chrome/checkbox
 * @category Compilers
 * @package @rottay/design-system
 */

import type { FamilyDeriver } from "../../../../foundation/contract";

/** A vertical's own checkbox chrome outranks every relation stated here. */
export const checkboxChromeDeriver: FamilyDeriver = {
  family: "checkbox",
  rank: "derived",
  consumes: ["palette.*", "typography.roles"],
  produces: [
    "--ds-checkbox-checked-bg",
    "--ds-checkbox-check-color",
    "--ds-checkbox-border",
    "--ds-checkbox-error-border-color",
    "--ds-checkbox-label-color",
    "--ds-checkbox-description-color",
    "--ds-checkbox-description-font-size",
    "--ds-checkbox-description-line-height",
  ],
  derive: () => deriveCheckboxChannels(),
};

export function deriveCheckboxChannels(): Record<string, string> {
  const vars: Record<string, string> = {};
  vars["--ds-checkbox-checked-bg"] = "var(--ds-color-primary)";
  vars["--ds-checkbox-check-color"] = "var(--ds-color-text-on-primary)";
  vars["--ds-checkbox-border"] = "var(--ds-color-border-secondary)";
  vars["--ds-checkbox-error-border-color"] = "var(--ds-color-error)";
  vars["--ds-checkbox-label-color"] = "var(--ds-color-text-primary)";
  vars["--ds-checkbox-description-color"] = "var(--ds-type-color-muted)";
  vars["--ds-checkbox-description-font-size"] = "var(--ds-type-caption-font-size)";
  vars["--ds-checkbox-description-line-height"] = "var(--ds-type-caption-line-height)";
  return vars;
}
