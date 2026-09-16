/**
 * @fileoverview The filter-panel family: every channel its Modern skin reads, at the
 * resting value the skin itself stated, so a decision now has somewhere to
 * move it. One namespace, taken from the folder name.
 *
 * @module Compilers/Theme/Lowering/Runtime/derivation/chrome/filter-panel
 * @category Compilers
 * @package @rottay/design-system
 */

import type { FamilyDeriver } from "../../../../foundation/contract";

/** A vertical's own filter-panel chrome outranks every relation stated here. */
export const filterPanelChromeDeriver: FamilyDeriver = {
  family: "filter-panel",
  rank: "derived",
  consumes: [
    "palette.*",
    "surfaces.radiusScale",
    "typography.roles",
    "density",
  ],
  produces: [
    "--ds-filter-panel-content-max-height",
    "--ds-filter-panel-field-gap",
    "--ds-filter-panel-inline-control-width",
    "--ds-filter-panel-inline-flex",
    "--ds-filter-panel-inline-gap",
    "--ds-filter-panel-inline-min-width",
    "--ds-filter-panel-inline-wrap",
    "--ds-filter-panel-option-gap",
    "--ds-filter-panel-range-gap",
    "--ds-filter-panel-stacked-gap",
    "--ds-filter-panel-touch-target",
  ],
  derive: () => deriveFilterPanelChannels(),
};

export function deriveFilterPanelChannels(): Record<string, string> {
  const vars: Record<string, string> = {};
  vars["--ds-filter-panel-content-max-height"] = "125rem";
  vars["--ds-filter-panel-field-gap"] = "var(--ds-spacing-2)";
  vars["--ds-filter-panel-inline-control-width"] = "0px";
  vars["--ds-filter-panel-inline-flex"] = "1 1 268px";
  vars["--ds-filter-panel-inline-gap"] = "var(--ds-spacing-3)";
  vars["--ds-filter-panel-inline-min-width"] = "196px";
  vars["--ds-filter-panel-inline-wrap"] = "wrap";
  vars["--ds-filter-panel-option-gap"] = "var(--ds-spacing-2)";
  vars["--ds-filter-panel-range-gap"] = "var(--ds-spacing-2)";
  vars["--ds-filter-panel-stacked-gap"] = "var(--ds-spacing-3)";
  vars["--ds-filter-panel-touch-target"] = "2.75rem";
  return vars;
}

