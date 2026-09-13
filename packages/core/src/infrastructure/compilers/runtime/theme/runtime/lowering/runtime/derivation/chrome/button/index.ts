/**
 * @fileoverview The button family: its label on the label type role, and the
 * depth every variant wears at rest, hover and press on the control material.
 *
 * @module Compilers/Theme/Lowering/Runtime/derivation/chrome/button
 * @category Compilers
 * @package @rottay/design-system
 */

import type { FamilyDeriver } from "../../../../foundation/contract";

const REST = "var(--ds-material-control-shadow)";
const HOVER = "var(--ds-material-control-shadow-hover)";
const ACTIVE = "var(--ds-material-control-shadow-active)";

/** A vertical's own button chrome outranks every relation stated here. */
export const buttonChromeDeriver: FamilyDeriver = {
  family: "button",
  rank: "derived",
  consumes: [
    "typography.roles",
    "typography.roleWeights",
    "surfaces.elevation",
    "surfaces.materials",
    "surfaces.surfaceRoles",
  ],
  produces: [
    "--ds-button-font-family",
    "--ds-button-font-weight",
    "--ds-button-primary-shadow",
    "--ds-button-primary-shadow-hover",
    "--ds-button-primary-shadow-active",
    "--ds-button-secondary-shadow",
    "--ds-button-secondary-shadow-hover",
    "--ds-button-secondary-shadow-active",
    "--ds-button-default-shadow",
    "--ds-button-default-shadow-hover",
    "--ds-button-default-shadow-active",
    "--ds-button-ghost-shadow",
    "--ds-button-ghost-shadow-hover",
    "--ds-button-ghost-shadow-active",
    "--ds-button-text-shadow",
    "--ds-button-text-shadow-hover",
    "--ds-button-text-shadow-active",
    "--ds-button-dashed-shadow",
    "--ds-button-dashed-shadow-hover",
    "--ds-button-dashed-shadow-active",
    "--ds-button-error-shadow",
    "--ds-button-error-shadow-hover",
    "--ds-button-error-shadow-active",
    "--ds-button-success-shadow",
    "--ds-button-success-shadow-hover",
    "--ds-button-success-shadow-active",
    "--ds-button-warning-shadow",
    "--ds-button-warning-shadow-hover",
    "--ds-button-warning-shadow-active",
    "--ds-button-info-shadow",
    "--ds-button-info-shadow-hover",
    "--ds-button-info-shadow-active",
    "--ds-button-ai-shadow",
    "--ds-button-ai-shadow-hover",
    "--ds-button-ai-shadow-active",
    "--ds-button-link-shadow",
    "--ds-button-link-shadow-hover",
    "--ds-button-link-shadow-active",
  ],
  derive: () => deriveButtonChannels(),
};

export function deriveButtonChannels(): Record<string, string> {
  const vars: Record<string, string> = {};
  vars["--ds-button-font-family"] = "var(--ds-type-label-font-family)";
  vars["--ds-button-font-weight"] = "var(--ds-type-label-font-weight)";
  vars["--ds-button-primary-shadow"] = REST;
  vars["--ds-button-primary-shadow-hover"] = HOVER;
  vars["--ds-button-primary-shadow-active"] = ACTIVE;
  vars["--ds-button-secondary-shadow"] = REST;
  vars["--ds-button-secondary-shadow-hover"] = HOVER;
  vars["--ds-button-secondary-shadow-active"] = ACTIVE;
  vars["--ds-button-default-shadow"] = REST;
  vars["--ds-button-default-shadow-hover"] = HOVER;
  vars["--ds-button-default-shadow-active"] = ACTIVE;
  vars["--ds-button-ghost-shadow"] = REST;
  vars["--ds-button-ghost-shadow-hover"] = HOVER;
  vars["--ds-button-ghost-shadow-active"] = ACTIVE;
  vars["--ds-button-text-shadow"] = REST;
  vars["--ds-button-text-shadow-hover"] = HOVER;
  vars["--ds-button-text-shadow-active"] = ACTIVE;
  vars["--ds-button-dashed-shadow"] = REST;
  vars["--ds-button-dashed-shadow-hover"] = HOVER;
  vars["--ds-button-dashed-shadow-active"] = ACTIVE;
  vars["--ds-button-error-shadow"] = REST;
  vars["--ds-button-error-shadow-hover"] = HOVER;
  vars["--ds-button-error-shadow-active"] = ACTIVE;
  vars["--ds-button-success-shadow"] = REST;
  vars["--ds-button-success-shadow-hover"] = HOVER;
  vars["--ds-button-success-shadow-active"] = ACTIVE;
  vars["--ds-button-warning-shadow"] = REST;
  vars["--ds-button-warning-shadow-hover"] = HOVER;
  vars["--ds-button-warning-shadow-active"] = ACTIVE;
  vars["--ds-button-info-shadow"] = REST;
  vars["--ds-button-info-shadow-hover"] = HOVER;
  vars["--ds-button-info-shadow-active"] = ACTIVE;
  vars["--ds-button-ai-shadow"] = REST;
  vars["--ds-button-ai-shadow-hover"] = HOVER;
  vars["--ds-button-ai-shadow-active"] = ACTIVE;
  vars["--ds-button-link-shadow"] = REST;
  vars["--ds-button-link-shadow-hover"] = HOVER;
  vars["--ds-button-link-shadow-active"] = ACTIVE;
  return vars;
}
