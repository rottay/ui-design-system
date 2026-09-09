/**
 * @fileoverview The expressive-profile family: the channels a selected profile
 * paints that no other family claims.
 *
 * @module Compilers/Theme/Lowering/Runtime/derivation/expressive
 * @category Compilers
 * @package @rottay/design-system
 */

import type { FamilyDeriver } from "../../../foundation/contract";

/**
 * The channels a selected profile fills that no other family claims.
 *
 * Rank `profile`: the weakest statement in the merge. Every `--ds-type-<role>`
 * facet it writes is restated by the type-roles family one rank up, and every
 * material texture by the surfaces family, so a profile only ever paints a
 * channel nobody else claimed for this theme.
 */
export const expressiveDeriver: FamilyDeriver = {
  family: "expressive",
  rank: "profile",
  consumes: ["expressive.*"],
  produces: [
    "--ds-divider-style",
    "--ds-divider-width",
    "--ds-edge-emphasis-width",
    "--ds-edge-hairline-width",
    "--ds-edge-standard-style",
    "--ds-edge-standard-width",
    "--ds-elevation-lift-strength",
    "--ds-material-canvas-texture",
    "--ds-material-card-highlight",
    "--ds-material-card-texture",
    "--ds-material-overlay-texture",
    "--ds-material-panel-texture",
    "--ds-material-raised-highlight",
    "--ds-menu-group-text-transform",
    "--ds-page-header-bg",
    "--ds-page-header-eyebrow-text-transform",
    "--ds-select-group-text-transform",
    "--ds-shadow-ambient-strength",
    "--ds-shadow-key-strength",
    "--ds-shadow-tint",
    "--ds-table-header-letter-spacing",
    "--ds-table-header-text-transform",
    "--ds-type-*",
  ],
  derive: (context) => context.expressive.expansion.variables,
};
