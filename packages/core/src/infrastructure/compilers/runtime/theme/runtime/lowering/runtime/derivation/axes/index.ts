/**
 * @fileoverview The scale-axis family: the dials every other family reads.
 *
 * @module Compilers/Theme/Lowering/Runtime/derivation/axes
 * @category Compilers
 * @package @rottay/design-system
 */

import type { BrandTheme } from "@/foundation/contracts/composition/tenants/themes";
import { appearancePostureToVariables } from "@/infrastructure/compilers/kernel/foundation/css/appearance-posture";
import type { AppearancePostureFields } from "@/infrastructure/compilers/kernel/foundation/css/appearance-posture";
import type { ExpressiveExpansion } from "@/foundation/tokens/ts/presentation/expressive-profiles/expansion";
import type { FamilyDeriver } from "../../../foundation/contract";
import {
  ELEVATION_PRESET_CHANNELS,
  TYPE_PAIRING_CHANNELS,
} from "../../../foundation/contract";

const FOREIGN_POSTURE_CHANNELS: ReadonlySet<string> = new Set<string>([
  ...TYPE_PAIRING_CHANNELS,
  ...ELEVATION_PRESET_CHANNELS,
  "--ds-density-mode-factor",
  "--ds-motion-intensity",
  "--ds-motion-duration-scale",
]);

/** The posture channels this family owns: the table's output minus the two above. */
export function axisPostureVariables(
  posture: AppearancePostureFields
): Record<string, string> {
  const vars: Record<string, string> = {};
  for (const [channel, value] of Object.entries(
    appearancePostureToVariables(posture)
  )) {
    if (!FOREIGN_POSTURE_CHANNELS.has(channel)) vars[channel] = value;
  }
  return vars;
}

/** The posture a theme states outright, in the shape the shared table reads. */
export function authoredPosture(bt: BrandTheme): AppearancePostureFields {
  return {
    typePairing: bt.typography?.typePairing,
    typeScale: bt.typography?.scale,
    buttonStyle: bt.surfaces?.buttonStyle,
    radiusScale: bt.surfaces?.radiusScale,
    density: bt.surfaces?.density,
    motion: bt.motion
      ? {
          intensity: bt.motion.intensity,
          durationScale: bt.motion.durationScale,
          ambient: bt.motion.ambient,
        }
      : undefined,
    elevation: bt.surfaces?.elevation,
  };
}

/**
 * The two ramp dials every other family reads, and the button silhouette.
 *
 * A compiled theme keeps the axes explicit in its artifact instead of relying
 * on the consumer-side `var(--ds-*-scale, 1)` fallbacks: a DB tenant artifact
 * emits the same canonical properties, so both sides of the cascade stay
 * observable and comparable without a second app-side theme channel.
 *
 * Density, rhythm, elevation and the motion dials are NOT axes of this family
 * even though the shared posture table computes them here: each is the whole
 * subject of its own deriver, and a dial emitted beside the family that bends
 * it is a second owner of that family. They are filtered out above and settle
 * in `../density`, `../rhythm`, `../elevation` and `../motion`.
 */
export const axesDeriver: FamilyDeriver = {
  family: "axes",
  rank: "derived",
  consumes: [
    "surfaces.buttonStyle",
    "surfaces.radiusScale",
    "typography.scale",
    "typography.typePairing",
    "expressive.*",
  ],
  produces: ["--ds-type-scale", "--ds-radius-scale", "--ds-radius-button"],
  derive: (context) => deriveAxisChannels(context.theme, context.expressive.expansion),
};

export function deriveAxisChannels(
  bt: BrandTheme,
  expansion: ExpressiveExpansion
): Record<string, string> {
  const vars: Record<string, string> = {
    "--ds-type-scale": "1",
    "--ds-radius-scale": "1",
  };
  Object.assign(vars, axisPostureVariables(expansion.fieldDefaults));
  Object.assign(vars, axisPostureVariables(authoredPosture(bt)));
  return vars;
}
