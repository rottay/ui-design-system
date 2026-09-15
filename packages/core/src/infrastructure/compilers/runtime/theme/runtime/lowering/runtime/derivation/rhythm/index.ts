/**
 * @fileoverview The rhythm family: how much room sits between controls.
 *
 * @module Compilers/Theme/Lowering/Runtime/derivation/rhythm
 * @category Compilers
 * @package @rottay/design-system
 */

import type { FlatTheme } from "@/foundation/contracts/composition/tenants/themes";
import {
  TENANT_THEME_RHYTHM_FACTORS,
  TENANT_THEME_RHYTHM_SCALE_BOUNDS,
} from "@/foundation/contracts/composition/tenants/themes/tenant-theme";
import type { FamilyDeriver } from "../../../foundation/contract";

/**
 * The rhythm posture, and the bounded scale every gap chain reads.
 *
 * FAILING CLOSED IS PART OF THE PARITY, not an extra. A `FlatTheme` is typed,
 * but it is plain data by the time it reaches this compiler: it crosses the
 * RSC/JSON boundary and arrives through the compatibility
 * `TenantConfig.brandTheme` field, where no type survives. A bare bracket read
 * of the factor table therefore resolves INHERITED members, and any of them
 * makes the clamp invalid at computed-value time for every consumer. The DB
 * path rejects all of them at document validation, so an own-property plus
 * numeric guard is what makes the two ingress paths fail closed the same way.
 *
 * The seed is clamped HERE and the derived `--ds-rhythm-effective-scale`
 * clamps again in the theme layer, which is what binds a raw tokenOverride
 * too. Only the seed is a compiler statement, so only the seed is emitted.
 */
export const rhythmDeriver: FamilyDeriver = {
  family: "rhythm",
  rank: "derived",
  consumes: ["surfaces.rhythm"],
  produces: ["--ds-rhythm-scale"],
  derive: (context) => deriveRhythmChannels(context.theme),
};

export function deriveRhythmChannels(bt: FlatTheme): Record<string, string> {
  const authored = bt.surfaces?.rhythm;
  if (
    typeof authored !== "string" ||
    !Object.prototype.hasOwnProperty.call(TENANT_THEME_RHYTHM_FACTORS, authored)
  ) {
    return {};
  }
  const factor =
    TENANT_THEME_RHYTHM_FACTORS[
      authored as keyof typeof TENANT_THEME_RHYTHM_FACTORS
    ];
  if (typeof factor !== "number" || !Number.isFinite(factor)) return {};
  const scale = Math.min(
    TENANT_THEME_RHYTHM_SCALE_BOUNDS.max,
    Math.max(TENANT_THEME_RHYTHM_SCALE_BOUNDS.min, factor)
  );
  return { "--ds-rhythm-scale": String(scale) };
}
