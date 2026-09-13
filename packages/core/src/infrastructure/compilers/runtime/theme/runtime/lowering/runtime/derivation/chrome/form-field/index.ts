/**
 * @fileoverview The form-field family: its label and messages on the field
 * grammar the input decisions move, and its focus and error ink on the palette.
 *
 * @module Compilers/Theme/Lowering/Runtime/derivation/chrome/form-field
 * @category Compilers
 * @package @rottay/design-system
 */

import type { FamilyDeriver } from "../../../../foundation/contract";

/** A vertical's own form-field chrome outranks every relation stated here. */
export const formFieldChromeDeriver: FamilyDeriver = {
  family: "form-field",
  rank: "derived",
  consumes: ["palette.*", "typography.roles"],
  produces: [
    "--ds-form-field-ink",
    "--ds-form-field-label-color",
    "--ds-form-field-label-color-focus",
    "--ds-form-field-label-color-disabled",
    "--ds-form-field-label-font-family",
    "--ds-form-field-label-font-size",
    "--ds-form-field-label-font-weight",
    "--ds-form-field-label-text-transform",
    "--ds-form-field-required-color",
    "--ds-form-field-helper-color",
    "--ds-form-field-helper-font-size",
    "--ds-form-field-helper-line-height",
    "--ds-form-field-error-color",
    "--ds-form-field-error-font-weight",
  ],
  derive: () => deriveFormFieldChannels(),
};

export function deriveFormFieldChannels(): Record<string, string> {
  const vars: Record<string, string> = {};
  vars["--ds-form-field-ink"] = "var(--ds-input-color)";
  vars["--ds-form-field-label-color"] = "var(--ds-input-label-color)";
  vars["--ds-form-field-label-color-focus"] = "var(--ds-color-primary)";
  vars["--ds-form-field-label-color-disabled"] = "var(--ds-input-label-color-disabled)";
  vars["--ds-form-field-label-font-family"] = "var(--ds-input-label-font-family)";
  vars["--ds-form-field-label-font-size"] = "var(--ds-input-label-font-size)";
  vars["--ds-form-field-label-font-weight"] = "var(--ds-input-label-font-weight)";
  vars["--ds-form-field-label-text-transform"] = "var(--ds-type-label-text-transform)";
  vars["--ds-form-field-required-color"] = "var(--ds-input-label-required-color)";
  vars["--ds-form-field-helper-color"] = "color-mix(in srgb, var(--ds-input-helper-color) 65%, var(--ds-color-text-primary) 35%)";
  vars["--ds-form-field-helper-font-size"] = "var(--ds-input-helper-font-size)";
  vars["--ds-form-field-helper-line-height"] = "var(--ds-input-helper-line-height)";
  vars["--ds-form-field-error-color"] = "var(--ds-color-error-ink)";
  vars["--ds-form-field-error-font-weight"] = "var(--ds-input-error-message-font-weight)";
  return vars;
}
