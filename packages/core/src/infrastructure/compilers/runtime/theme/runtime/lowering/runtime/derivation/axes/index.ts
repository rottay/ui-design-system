/**
 * @fileoverview The scale-axis family: the dials every other family reads.
 *
 * @module Compilers/Theme/Lowering/Runtime/derivation/axes
 * @category Compilers
 * @package @rottay/design-system
 */

import type { BrandTheme } from "@/foundation/contracts/composition/tenants/themes";
import {
  TENANT_THEME_RHYTHM_FACTORS,
  TENANT_THEME_RHYTHM_SCALE_BOUNDS,
} from "@/foundation/contracts/composition/tenants/themes/tenant-theme";
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
 * The three ramp axes plus the rhythm axis, and the bounded posture dials.
 *
 * A compiled theme keeps the axes explicit in its artifact instead of relying
 * on the consumer-side `var(--ds-*-scale, 1)` fallbacks: a DB tenant artifact
 * emits the same canonical properties, so both sides of the cascade stay
 * observable and comparable without a second app-side theme channel.
 *
 * FAILING CLOSED IS PART OF THE RHYTHM PARITY, not an extra. A `BrandTheme` is
 * typed, but it is plain data by the time it reaches this compiler: it crosses
 * the RSC/JSON boundary and arrives through the compatibility
 * `TenantConfig.brandTheme` field, where no type survives. A bare bracket read
 * of the factor table therefore resolves INHERITED members, and any of them
 * makes `clamp(0.8, var(--ds-rhythm-scale, 1), 1.25)` invalid at
 * computed-value time for every consumer. The DB path rejects all of them at
 * document validation, so an own-property plus numeric guard is what makes the
 * two ingress paths fail closed the same way.
 */
export const axesDeriver: FamilyDeriver = {
  family: "axes",
  rank: "derived",
  consumes: [
    "surfaces.densityScale",
    "surfaces.rhythm",
    "surfaces.buttonStyle",
    "surfaces.radiusScale",
    "surfaces.density",
    "typography.scale",
    "typography.typePairing",
    "motion.intensity",
    "motion.durationScale",
    "motion.ambient",
    "expressive.*",
  ],
  produces: [
    "--ds-type-scale",
    "--ds-radius-scale",
    "--ds-density-scale",
    "--ds-rhythm-scale",
    "--ds-radius-button",
    "--ds-density-mode-factor",
    "--ds-motion-intensity",
    "--ds-motion-duration-scale",
  ],
  derive: (context) => deriveAxisChannels(context.theme, context.expressive.expansion),
};

export function deriveAxisChannels(
  bt: BrandTheme,
  expansion: ExpressiveExpansion
): Record<string, string> {
  const vars: Record<string, string> = {
    "--ds-type-scale": "1",
    "--ds-radius-scale": "1",
    "--ds-density-scale": String(bt.surfaces?.densityScale ?? 1),
  };
  const authoredRhythm = bt.surfaces?.rhythm;
  if (
    typeof authoredRhythm === "string" &&
    Object.prototype.hasOwnProperty.call(
      TENANT_THEME_RHYTHM_FACTORS,
      authoredRhythm
    )
  ) {
    const rhythmFactor =
      TENANT_THEME_RHYTHM_FACTORS[
        authoredRhythm as keyof typeof TENANT_THEME_RHYTHM_FACTORS
      ];
    if (typeof rhythmFactor === "number" && Number.isFinite(rhythmFactor)) {
      vars["--ds-rhythm-scale"] = String(
        Math.min(
          TENANT_THEME_RHYTHM_SCALE_BOUNDS.max,
          Math.max(TENANT_THEME_RHYTHM_SCALE_BOUNDS.min, rhythmFactor)
        )
      );
    }
  }
  Object.assign(vars, axisPostureVariables(expansion.fieldDefaults));
  Object.assign(vars, axisPostureVariables(authoredPosture(bt)));
  return vars;
}
