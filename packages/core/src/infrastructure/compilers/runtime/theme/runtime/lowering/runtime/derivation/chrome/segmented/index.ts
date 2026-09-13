/**
 * @fileoverview The segmented family: its option geometry on the control ramp
 * the shape, density and type decisions move, its frame and depth on the
 * control material, and its hover and selected weight on the state and label
 * role decisions.
 *
 * @module Compilers/Theme/Lowering/Runtime/derivation/chrome/segmented
 * @category Compilers
 * @package @rottay/design-system
 */

import type { FamilyDeriver } from "../../../../foundation/contract";

/** A vertical's own segmented chrome outranks every relation stated here. */
export const segmentedChromeDeriver: FamilyDeriver = {
  family: "segmented",
  rank: "derived",
  consumes: [
    "surfaces.borderRadius",
    "surfaces.controlHeight",
    "surfaces.densityScale",
    "surfaces.materials",
    "surfaces.stateEmphasis",
    "palette.*",
    "typography.roleWeights",
  ],
  produces: [
    "--ds-segmented-sm-height",
    "--ds-segmented-sm-padding-x",
    "--ds-segmented-sm-font-size",
    "--ds-segmented-sm-line-height",
    "--ds-segmented-sm-gap",
    "--ds-segmented-sm-icon-size",
    "--ds-segmented-sm-radius",
    "--ds-segmented-md-height",
    "--ds-segmented-md-padding-x",
    "--ds-segmented-md-font-size",
    "--ds-segmented-md-line-height",
    "--ds-segmented-md-gap",
    "--ds-segmented-md-icon-size",
    "--ds-segmented-md-radius",
    "--ds-segmented-lg-height",
    "--ds-segmented-lg-padding-x",
    "--ds-segmented-lg-font-size",
    "--ds-segmented-lg-line-height",
    "--ds-segmented-lg-gap",
    "--ds-segmented-lg-icon-size",
    "--ds-segmented-lg-radius",
    "--ds-segmented-item-radius",
    "--ds-segmented-border",
    "--ds-segmented-border-hover",
    "--ds-segmented-shadow-hover",
    "--ds-segmented-item-bg-hover",
    "--ds-segmented-item-border-hover",
    "--ds-segmented-item-color-hover",
    "--ds-segmented-item-font-weight",
    "--ds-segmented-item-font-weight-selected",
  ],
  derive: () => deriveSegmentedChannels(),
};

export function deriveSegmentedChannels(): Record<string, string> {
  const vars: Record<string, string> = {};
  vars["--ds-segmented-sm-height"] = "var(--ds-button-sm-height)";
  vars["--ds-segmented-sm-padding-x"] = "var(--ds-button-sm-padding-x)";
  vars["--ds-segmented-sm-font-size"] = "var(--ds-button-sm-font-size)";
  vars["--ds-segmented-sm-line-height"] = "var(--ds-button-sm-line-height)";
  vars["--ds-segmented-sm-gap"] = "var(--ds-button-sm-gap)";
  vars["--ds-segmented-sm-icon-size"] = "var(--ds-button-sm-icon-size)";
  vars["--ds-segmented-sm-radius"] = "var(--ds-button-sm-radius)";
  vars["--ds-segmented-md-height"] = "var(--ds-button-md-height)";
  vars["--ds-segmented-md-padding-x"] = "var(--ds-button-md-padding-x)";
  vars["--ds-segmented-md-font-size"] = "var(--ds-button-md-font-size)";
  vars["--ds-segmented-md-line-height"] = "var(--ds-button-md-line-height)";
  vars["--ds-segmented-md-gap"] = "var(--ds-button-md-gap)";
  vars["--ds-segmented-md-icon-size"] = "var(--ds-button-md-icon-size)";
  vars["--ds-segmented-md-radius"] = "var(--ds-button-md-radius)";
  vars["--ds-segmented-lg-height"] = "var(--ds-button-lg-height)";
  vars["--ds-segmented-lg-padding-x"] = "var(--ds-button-lg-padding-x)";
  vars["--ds-segmented-lg-font-size"] = "var(--ds-button-lg-font-size)";
  vars["--ds-segmented-lg-line-height"] = "var(--ds-button-lg-line-height)";
  vars["--ds-segmented-lg-gap"] = "var(--ds-button-lg-gap)";
  vars["--ds-segmented-lg-icon-size"] = "var(--ds-button-lg-icon-size)";
  vars["--ds-segmented-lg-radius"] = "var(--ds-button-lg-radius)";
  vars["--ds-segmented-item-radius"] = "var(--ds-button-md-radius)";
  vars["--ds-segmented-border"] = "var(--ds-material-control-border)";
  vars["--ds-segmented-border-hover"] = "var(--ds-material-control-border-hover)";
  vars["--ds-segmented-shadow-hover"] = "var(--ds-material-control-shadow-hover)";
  vars["--ds-segmented-item-bg-hover"] = "color-mix(in srgb, var(--ds-color-primary) var(--ds-state-hover-shift), var(--ds-card-bg, var(--ds-color-bg-secondary)))";
  vars["--ds-segmented-item-border-hover"] = "color-mix(in srgb, var(--ds-color-border) 72%, transparent)";
  vars["--ds-segmented-item-color-hover"] = "var(--ds-color-text-primary)";
  vars["--ds-segmented-item-font-weight"] = "var(--ds-font-weight-medium)";
  vars["--ds-segmented-item-font-weight-selected"] = "var(--ds-type-label-font-weight)";
  return vars;
}
