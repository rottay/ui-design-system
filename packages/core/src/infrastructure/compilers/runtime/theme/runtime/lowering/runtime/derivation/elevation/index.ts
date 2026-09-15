/**
 * @fileoverview The elevation family: the depth ladder, the stacking bands,
 * and the keyline weight -- authored, not implied.
 *
 * @module Compilers/Theme/Lowering/Runtime/derivation/elevation
 * @category Compilers
 * @package @rottay/design-system
 */

import type { BrandTheme } from "@/foundation/contracts/composition/tenants/themes";
import type { ExpressiveExpansion } from "@/foundation/tokens/ts/presentation/expressive-profiles/expansion";
import type { FamilyDeriver } from "../../../foundation/contract";
import { deriveBorderPosture } from "./border";
import { deriveElevationLadder } from "./ladder";
import { deriveZIndexBands } from "./z-index";

export { deriveBorderPosture } from "./border";
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
 *
 * The keyline is the third: `surfaces.borderStyle` (kit row 18) states the
 * border-width roles a bounded surface wears, and it is a DEPTH statement for
 * the same reason a shadow is -- a card reads as raised through its edge or its
 * shadow, and choosing one is choosing against the other. It reaches the three
 * width roles and stops there: the style token beside them is the expressive
 * `edge` axis's.
 */
export const elevationDeriver: FamilyDeriver = {
  family: "elevation",
  rank: "derived",
  consumes: [
    "surfaces.elevation",
    "surfaces.elevations",
    "surfaces.borderStyle",
  ],
  produces: [
    "--ds-elevation-*",
    "--ds-z-index-*",
    "--ds-edge-hairline-width",
    "--ds-edge-standard-width",
    "--ds-edge-emphasis-width",
  ],
  derive: (context) =>
    deriveElevationChannels(context.theme, context.expressive.expansion),
};

/**
 * Bands, then the posture's ladder, then the authored keyline widths.
 *
 * The three write disjoint channels, so this order is assembly and not
 * precedence. The keyline stops at the width roles deliberately: the style
 * token the skins compose beside them is `--ds-edge-standard-style`, owned by
 * the expressive `edge` axis, so no border style is stated here at all.
 */
export function deriveElevationChannels(
  bt: BrandTheme,
  expansion: ExpressiveExpansion
): Record<string, string> {
  return {
    ...deriveZIndexBands(),
    ...deriveElevationLadder(bt, expansion),
    ...deriveBorderPosture(bt),
  };
}
