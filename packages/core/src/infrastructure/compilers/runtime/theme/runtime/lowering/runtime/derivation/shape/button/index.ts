/**
 * @fileoverview The button silhouette: one bounded word, the same six channels
 * on both transports.
 *
 * @module Compilers/Theme/Lowering/Runtime/derivation/shape/button
 * @category Compilers
 * @package @rottay/design-system
 */

import type { FlatTheme } from "@/foundation/contracts/composition/tenants/themes";
import type { ExpressiveExpansion } from "@/foundation/tokens/ts/presentation/expressive-profiles/expansion";
import {
  buttonSilhouetteAlias,
  buttonSilhouetteChannels,
} from "../../../../foundation/geometry";

/**
 * The silhouette the block's own theme states: the profile's default first,
 * the theme's own word over it, in the order the scale axes resolve the rest of
 * the bounded posture.
 *
 * A profile default reaches the ramp alias only. The five per-size radii are
 * the expansion of a CHOSEN silhouette -- flattening a skin's per-size geometry
 * because nobody chose a word would be the profile deciding a decision.
 */
export function deriveButtonSilhouette(
  bt: FlatTheme,
  expansion: ExpressiveExpansion,
  radiusBaseline: string
): Record<string, string> {
  return {
    ...buttonSilhouetteAlias(expansion.fieldDefaults.buttonStyle, radiusBaseline),
    ...buttonSilhouetteChannels(bt.surfaces?.buttonStyle, radiusBaseline),
  };
}
