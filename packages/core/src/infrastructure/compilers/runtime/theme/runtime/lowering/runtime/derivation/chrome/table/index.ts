/**
 * @fileoverview The table family: its title and pagination steps on the type
 * roles and weights, its footer, title and pagination gaps on the spacing ramp,
 * the numeric postures its figures align on, and the coarse-pointer sizes its
 * selection control and hit areas take from the touch-target foundation.
 *
 * The runtime geometry channels the Modern skin declares at the family root
 * (the TSX stamps what only the runtime knows: a resized column, a sticky
 * offset, a virtual spacer) are produced here at the same resting values, so a
 * read whose channel is never stated still lands on a produced root: the zero
 * offsets ride the spacing ramp's zero rung and the truncating cap rides the
 * 20rem rung. The skin's family-root declarations and the per-element TSX
 * stamps both outrank these derived statements. The remaining reads (the
 * container's 100% inline size, the column's auto width, the uncapped scroll
 * axis) are keyword values no governed root shares, so they stay literal.
 *
 * @module Compilers/Theme/Lowering/Runtime/derivation/chrome/table
 * @category Compilers
 * @package @rottay/design-system
 */

import type { FamilyDeriver } from "../../../../foundation/contract";

/** A vertical's own table chrome outranks every relation stated here. */
export const tableChromeDeriver: FamilyDeriver = {
  family: "table",
  rank: "derived",
  consumes: ["typography.roles", "typography.roleWeights", "density", "surfaces.controlHeight"],
  produces: [
    "--ds-table-title-font-weight",
    "--ds-table-title-margin-block-end",
    "--ds-table-footer-margin-block-start",
    "--ds-table-cell-numeric",
    "--ds-table-pagination-numeric",
    "--ds-table-pagination-font-size",
    "--ds-table-pagination-current-font-weight",
    "--ds-table-pagination-margin-block-start",
    "--ds-table-selection-control-coarse-size",
    "--ds-table-touch-target-min",
    "--ds-table-col-min-width",
    "--ds-table-sticky-top",
    "--ds-table-virtual-spacer",
    "--ds-table-cell-ellipsis-max-width",
  ],
  derive: () => deriveTableChannels(),
};

export function deriveTableChannels(): Record<string, string> {
  const vars: Record<string, string> = {};

  vars["--ds-table-title-font-weight"] = "var(--ds-font-weight-semibold)";
  vars["--ds-table-title-margin-block-end"] = "var(--ds-spacing-2)";
  vars["--ds-table-footer-margin-block-start"] = "var(--ds-spacing-2)";

  // Figures align in a column, so the cell and the page counter both take the
  // tabular posture rather than the family's proportional default.
  vars["--ds-table-cell-numeric"] = "tabular-nums";
  vars["--ds-table-pagination-numeric"] = "tabular-nums";

  vars["--ds-table-pagination-font-size"] = "var(--ds-type-supporting-font-size)";
  vars["--ds-table-pagination-current-font-weight"] = "var(--ds-font-weight-semibold)";
  vars["--ds-table-pagination-margin-block-start"] = "var(--ds-spacing-4)";

  vars["--ds-table-selection-control-coarse-size"] =
    "calc(var(--ds-spacing-5) * var(--ds-density-effective-scale, 1) * var(--ds-control-height-scale, 1))";
  vars["--ds-table-touch-target-min"] = "var(--ds-touch-target-min)";

  /* Runtime geometry the skin declares at the family root: produced underneath
     at the zero rung so a read whose channel is never stated still reaches a
     produced root; the TSX stamp and the family-root declaration outrank this. */
  vars["--ds-table-col-min-width"] = "var(--ds-spacing-0, 0)";
  vars["--ds-table-sticky-top"] = "var(--ds-spacing-0, 0)";
  vars["--ds-table-virtual-spacer"] = "var(--ds-spacing-0, 0)";
  /* The truncating column's cap rests at the 20rem spacing rung (320px). */
  vars["--ds-table-cell-ellipsis-max-width"] = "var(--ds-spacing-80, 320px)";

  return vars;
}
