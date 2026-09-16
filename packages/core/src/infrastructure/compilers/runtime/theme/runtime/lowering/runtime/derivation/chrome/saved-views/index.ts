/**
 * @fileoverview The saved-views family: every channel its Modern skin reads, at the
 * resting value the skin itself stated, so a decision now has somewhere to
 * move it. One namespace, taken from the folder name.
 *
 * @module Compilers/Theme/Lowering/Runtime/derivation/chrome/saved-views
 * @category Compilers
 * @package @rottay/design-system
 */

import type { FamilyDeriver } from "../../../../foundation/contract";

/** A vertical's own saved-views chrome outranks every relation stated here. */
export const savedViewsChromeDeriver: FamilyDeriver = {
  family: "saved-views",
  rank: "derived",
  consumes: [
    "palette.*",
    "surfaces.radiusScale",
    "surfaces.focusStyle",
    "typography.roles",
    "density",
  ],
  produces: [
    "--ds-saved-views-bar-min-height",
    "--ds-saved-views-bar-padding-inline",
    "--ds-saved-views-bar-padding-inline-compact",
    "--ds-saved-views-create-button-font-weight",
    "--ds-saved-views-create-button-gap",
    "--ds-saved-views-create-button-padding-block",
    "--ds-saved-views-create-button-padding-inline",
    "--ds-saved-views-create-form-gap",
    "--ds-saved-views-create-form-padding-block",
    "--ds-saved-views-drag-handle-opacity",
    "--ds-saved-views-focus-ring-radius",
    "--ds-saved-views-gap",
    "--ds-saved-views-gap-compact",
    "--ds-saved-views-input-font-size",
    "--ds-saved-views-input-height",
    "--ds-saved-views-input-padding-inline",
    "--ds-saved-views-input-width",
    "--ds-saved-views-menu-trigger-size",
    "--ds-saved-views-pill-font-size",
    "--ds-saved-views-pill-font-weight",
    "--ds-saved-views-pill-font-weight-active",
    "--ds-saved-views-pill-gap",
    "--ds-saved-views-pill-label-max-width",
    "--ds-saved-views-pill-line-height",
    "--ds-saved-views-pill-padding-block",
    "--ds-saved-views-pill-padding-inline",
    "--ds-saved-views-touch-target-min",
    "--ds-saved-views-unsaved-dot-size",
  ],
  derive: () => deriveSavedViewsChannels(),
};

export function deriveSavedViewsChannels(): Record<string, string> {
  const vars: Record<string, string> = {};
  vars["--ds-saved-views-bar-min-height"] = "40px";
  vars["--ds-saved-views-bar-padding-inline"] = "8px";
  vars["--ds-saved-views-bar-padding-inline-compact"] = "4px";
  vars["--ds-saved-views-create-button-font-weight"] = "var(--ds-font-weight-medium, 500)";
  vars["--ds-saved-views-create-button-gap"] = "4px";
  vars["--ds-saved-views-create-button-padding-block"] = "4px";
  vars["--ds-saved-views-create-button-padding-inline"] = "10px";
  vars["--ds-saved-views-create-form-gap"] = "4px";
  vars["--ds-saved-views-create-form-padding-block"] = "4px";
  vars["--ds-saved-views-drag-handle-opacity"] = "0.4";
  vars["--ds-saved-views-focus-ring-radius"] = "var(--ds-radius-sm)";
  vars["--ds-saved-views-gap"] = "6px";
  vars["--ds-saved-views-gap-compact"] = "4px";
  vars["--ds-saved-views-input-font-size"] = "13px";
  vars["--ds-saved-views-input-height"] = "26px";
  vars["--ds-saved-views-input-padding-inline"] = "8px";
  vars["--ds-saved-views-input-width"] = "130px";
  vars["--ds-saved-views-menu-trigger-size"] = "20px";
  vars["--ds-saved-views-pill-font-size"] = "13px";
  vars["--ds-saved-views-pill-font-weight"] = "400";
  vars["--ds-saved-views-pill-font-weight-active"] = "var(--ds-font-weight-semibold, 600)";
  vars["--ds-saved-views-pill-gap"] = "6px";
  vars["--ds-saved-views-pill-label-max-width"] = "14rem";
  vars["--ds-saved-views-pill-line-height"] = "20px";
  vars["--ds-saved-views-pill-padding-block"] = "4px";
  vars["--ds-saved-views-pill-padding-inline"] = "12px";
  vars["--ds-saved-views-touch-target-min"] = "var(--ds-touch-target-min, 44px)";
  vars["--ds-saved-views-unsaved-dot-size"] = "7px";
  return vars;
}

