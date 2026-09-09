/**
 * @fileoverview Elevation sub-owner: the seven-role ladder a governed posture
 * states, and the authored ladder that refines it.
 *
 * @module Compilers/Theme/Lowering/Runtime/derivation/elevation/ladder
 * @category Compilers
 * @package @rottay/design-system
 */

import type { BrandTheme } from "@/foundation/contracts/composition/tenants/themes";
import type { ExpressiveExpansion } from "@/foundation/tokens/ts/presentation/expressive-profiles/expansion";
import { appearancePostureToVariables } from "@/infrastructure/compilers/kernel/foundation/css/appearance-posture";
import type { AppearancePostureFields } from "@/infrastructure/compilers/kernel/foundation/css/appearance-posture";
import { ELEVATION_PRESET_CHANNELS } from "../../../../foundation/contract";

export type ElevationPosture = NonNullable<
  AppearancePostureFields["elevation"]
>;

const ELEVATION_CHANNELS: ReadonlySet<string> = new Set<string>(
  ELEVATION_PRESET_CHANNELS
);

/** The ladder a bounded posture presets, and nothing else the table computes. */
function posturePreset(
  elevation: ElevationPosture | undefined
): Record<string, string> {
  if (!elevation) return {};
  const vars: Record<string, string> = {};
  for (const [channel, value] of Object.entries(
    appearancePostureToVariables({ elevation })
  )) {
    if (ELEVATION_CHANNELS.has(channel)) vars[channel] = value;
  }
  return vars;
}

/**
 * The posture floor, then the authored ceiling.
 *
 * The posture table is the ONE place the seven roles of each preset are
 * written, so a tenant floor and a vertical baseline state the same ladder
 * rather than two truncations of it. An authored `surfaces.elevations` refines
 * the vertical's own ladder at this rank; a tenant posture outranks both from
 * the tenant family above.
 */
export function deriveElevationLadder(
  bt: BrandTheme,
  expansion: ExpressiveExpansion
): Record<string, string> {
  const su = bt.surfaces;
  if (!su) return {};
  const vars = posturePreset(su.elevation ?? expansion.fieldDefaults.elevation);
  const authored = su.elevations;
  if (authored) {
    if (authored.level0) vars["--ds-elevation-0"] = authored.level0;
    if (authored.level1) vars["--ds-elevation-1"] = authored.level1;
    if (authored.level2) vars["--ds-elevation-2"] = authored.level2;
    if (authored.level3) vars["--ds-elevation-3"] = authored.level3;
    if (authored.level4) vars["--ds-elevation-4"] = authored.level4;
    if (authored.level5) vars["--ds-elevation-5"] = authored.level5;
  }
  return vars;
}
