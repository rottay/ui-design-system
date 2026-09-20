/**
 * @fileoverview The tree family: its node rhythm on the spacing ramp, its
 * corner on the radius step, its selected weight on the type roles, its
 * control and loading sizes on the spacing ramp, its touch target on the
 * foundation minimum, its drop affordance on the primary seed, and the two
 * opacity dials that separate a disabled node from one filtered out.
 *
 * The depth channels the engine stamps per node (the connector inset and the
 * row indent) are produced at the spacing ramp's zero rung: the skin declares
 * both at the family root and the TSX re-stamps them per node, so these
 * derived statements rest underneath and a read whose channel is never stated
 * still lands on a produced root. The node's base opacity is a full-opacity
 * keyword no opacity rung shares, so it stays unproduced and literal.
 *
 * @module Compilers/Theme/Lowering/Runtime/derivation/chrome/tree
 * @category Compilers
 * @package @rottay/design-system
 */

import type { FamilyDeriver } from "../../../../foundation/contract";

/** A vertical's own tree chrome outranks every relation stated here. */
export const treeChromeDeriver: FamilyDeriver = {
  family: "tree",
  rank: "derived",
  consumes: [
    "palette.*",
    "surfaces.radiusScale",
    "surfaces.borderStyle",
    "typography.roleWeights",
    "density",
  ],
  produces: [
    "--ds-tree-node-padding-block",
    "--ds-tree-node-padding-inline",
    "--ds-tree-node-radius",
    "--ds-tree-node-font-weight-selected",
    "--ds-tree-checkbox-size",
    "--ds-tree-loading-size",
    "--ds-tree-connector-elbow",
    "--ds-tree-line-width",
    "--ds-tree-touch-target-min",
    "--ds-tree-drop-indicator-color",
    "--ds-tree-disabled-opacity",
    "--ds-tree-filtered-out-opacity",
    "--ds-tree-connector-inset",
    "--ds-tree-row-indent",
  ],
  derive: () => deriveTreeChannels(),
};

export function deriveTreeChannels(): Record<string, string> {
  const vars: Record<string, string> = {};

  vars["--ds-tree-node-padding-block"] = "var(--ds-spacing-1)";
  vars["--ds-tree-node-padding-inline"] = "var(--ds-spacing-2)";
  vars["--ds-tree-node-radius"] = "var(--ds-radius-md)";
  vars["--ds-tree-node-font-weight-selected"] = "var(--ds-font-weight-medium)";

  vars["--ds-tree-checkbox-size"] = "var(--ds-spacing-4)";
  vars["--ds-tree-loading-size"] = "var(--ds-spacing-4)";
  vars["--ds-tree-connector-elbow"] = "var(--ds-spacing-3)";
  // A hierarchy line is the hairline role, not the component frame; the
  // component default rests at the same 1px, so no connector repaints.
  vars["--ds-tree-line-width"] = "var(--ds-edge-hairline-width)";
  vars["--ds-tree-touch-target-min"] = "var(--ds-touch-target-min)";

  // A drag affordance is NOT a connector: it wears the primary seed so it never
  // flattens into the sanctioned neutral line colour.
  vars["--ds-tree-drop-indicator-color"] = "var(--ds-color-primary)";

  // Two different absences: a node the user may not act on, and one the current
  // filter excluded. They are separate dials so a tenant can tell them apart.
  vars["--ds-tree-disabled-opacity"] = "0.5";
  vars["--ds-tree-filtered-out-opacity"] = "0.4";

  /* Depth geometry the skin declares at the family root and the TSX stamps per
     node: produced underneath at the zero rung so an unstated channel still
     lands on a produced root. */
  vars["--ds-tree-connector-inset"] = "var(--ds-spacing-0, 0)";
  vars["--ds-tree-row-indent"] = "var(--ds-spacing-0, 0)";

  return vars;
}
