/**
 * @fileoverview The radio family: its ring, dot and ink on the palette
 * decisions, and its supporting text on the caption type role.
 *
 * @module Compilers/Theme/Lowering/Runtime/derivation/chrome/radio
 * @category Compilers
 * @package @rottay/design-system
 */

import type { FamilyDeriver } from "../../../../foundation/contract";

/** A vertical's own radio chrome outranks every relation stated here. */
export const radioChromeDeriver: FamilyDeriver = {
  family: "radio",
  rank: "derived",
  consumes: ["palette.*", "typography.roles"],
  produces: [
    "--ds-radio-checked-border",
    "--ds-radio-checked-dot",
    "--ds-radio-border",
    "--ds-radio-error-border-color",
    "--ds-radio-label-color",
    "--ds-radio-description-color",
    "--ds-radio-description-font-size",
    "--ds-radio-description-line-height",
  ],
  derive: () => deriveRadioChannels(),
};

export function deriveRadioChannels(): Record<string, string> {
  const vars: Record<string, string> = {};
  vars["--ds-radio-checked-border"] = "var(--ds-color-primary)";
  vars["--ds-radio-checked-dot"] = "var(--ds-color-primary)";
  vars["--ds-radio-border"] = "var(--ds-color-border-secondary)";
  vars["--ds-radio-error-border-color"] = "var(--ds-color-error)";
  vars["--ds-radio-label-color"] = "var(--ds-color-text-primary)";
  vars["--ds-radio-description-color"] = "var(--ds-type-color-muted)";
  vars["--ds-radio-description-font-size"] = "var(--ds-type-caption-font-size)";
  vars["--ds-radio-description-line-height"] = "var(--ds-type-caption-line-height)";
  return vars;
}
