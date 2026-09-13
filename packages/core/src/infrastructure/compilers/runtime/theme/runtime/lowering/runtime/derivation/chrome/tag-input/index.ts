/**
 * @fileoverview The tag-input family: its container on the field surface and
 * palette, its focus on the ring decision and its type on the input scale.
 *
 * @module Compilers/Theme/Lowering/Runtime/derivation/chrome/tag-input
 * @category Compilers
 * @package @rottay/design-system
 */

import type { FamilyDeriver } from "../../../../foundation/contract";

/** A vertical's own tag-input chrome outranks every relation stated here. */
export const tagInputChromeDeriver: FamilyDeriver = {
  family: "tag-input",
  rank: "derived",
  consumes: ["palette.*", "surfaces.materials", "shape.radius", "states.focus", "typography.roles"],
  produces: [
    "--ds-tag-input-bg",
    "--ds-tag-input-radius",
    "--ds-tag-input-border",
    "--ds-tag-input-border-hover",
    "--ds-tag-input-border-focus",
    "--ds-tag-input-shadow-focus",
    "--ds-tag-input-error-border",
    "--ds-tag-input-rejected-ink",
    "--ds-tag-input-disabled-opacity",
    "--ds-tag-input-ink",
    "--ds-tag-input-caret",
    "--ds-tag-input-placeholder",
    "--ds-tag-input-placeholder-opacity",
    "--ds-tag-input-chip-ink",
    "--ds-tag-input-sm-font-size",
    "--ds-tag-input-md-font-size",
    "--ds-tag-input-lg-font-size",
    "--ds-tag-input-error-ink",
    "--ds-tag-input-error-font-weight",
    "--ds-tag-input-error-line-height",
  ],
  derive: () => deriveTagInputChannels(),
};

export function deriveTagInputChannels(): Record<string, string> {
  const vars: Record<string, string> = {};
  vars["--ds-tag-input-bg"] = "var(--ds-input-bg)";
  vars["--ds-tag-input-radius"] = "var(--ds-radius-md)";
  vars["--ds-tag-input-border"] = "var(--ds-color-border)";
  vars["--ds-tag-input-border-hover"] = "var(--ds-material-control-border-hover)";
  vars["--ds-tag-input-border-focus"] = "var(--ds-color-primary)";
  vars["--ds-tag-input-shadow-focus"] = "var(--ds-shadow-focus-ring)";
  vars["--ds-tag-input-error-border"] = "var(--ds-color-error)";
  vars["--ds-tag-input-rejected-ink"] = "var(--ds-color-warning-ink)";
  vars["--ds-tag-input-disabled-opacity"] = "var(--ds-state-disabled-opacity)";
  vars["--ds-tag-input-ink"] = "var(--ds-color-text-primary)";
  vars["--ds-tag-input-caret"] = "var(--ds-input-border-focus)";
  vars["--ds-tag-input-placeholder"] = "var(--ds-input-color-placeholder)";
  vars["--ds-tag-input-placeholder-opacity"] = "var(--ds-input-placeholder-opacity)";
  vars["--ds-tag-input-chip-ink"] = "var(--ds-color-white)";
  vars["--ds-tag-input-sm-font-size"] = "var(--ds-input-sm-font-size)";
  vars["--ds-tag-input-md-font-size"] = "var(--ds-input-md-font-size)";
  vars["--ds-tag-input-lg-font-size"] = "var(--ds-input-lg-font-size)";
  vars["--ds-tag-input-error-ink"] = "var(--ds-color-error-ink)";
  vars["--ds-tag-input-error-font-weight"] = "var(--ds-input-error-message-font-weight)";
  vars["--ds-tag-input-error-line-height"] = "var(--ds-input-helper-line-height)";
  return vars;
}
