/**
 * @fileoverview The elevation family: the depth ladder, the border posture it
 * implies, and the stacking bands.
 *
 * @module Compilers/Theme/Lowering/Runtime/derivation/elevation
 * @category Compilers
 * @package @rottay/design-system
 */

import type { BrandTheme } from "@/foundation/contracts/composition/tenants/themes";
import type { ExpressiveExpansion } from "@/foundation/tokens/ts/presentation/expressive-profiles/expansion";
import type { FamilyDeriver } from "../../../foundation/contract";
import { deriveElevationLadder } from "./ladder";
import { deriveZIndexBands } from "./z-index";

export { deriveElevationLadder } from "./ladder";
export { Z_INDEX_BANDS, deriveZIndexBands } from "./z-index";

/**
 * Depth, in one family.
 *
 * The ladder used to be emitted from the surfaces family and the stacking
 * bands from nowhere at all: no compiled block carried a z-index, so a tenant
 * that raised one band could not see the bands it now sat above, and the
 * single chrome field that could move one was the whole customer vocabulary
 * for stacking order. Both are statements about the same axis -- how far a
 * surface sits from the page -- so they answer to one deriver.
 */
export const elevationDeriver: FamilyDeriver = {
  family: "elevation",
  rank: "derived",
  consumes: ["surfaces.elevation", "surfaces.elevations"],
  produces: ["--ds-elevation-*", "--ds-z-index-*"],
  derive: (context) =>
    deriveElevationChannels(context.theme, context.expressive.expansion),
};

export function deriveElevationChannels(
  bt: BrandTheme,
  expansion: ExpressiveExpansion
): Record<string, string> {
  return { ...deriveZIndexBands(), ...deriveElevationLadder(bt, expansion) };
}
