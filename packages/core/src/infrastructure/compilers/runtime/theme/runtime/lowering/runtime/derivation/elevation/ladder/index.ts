/**
 * @fileoverview Elevation sub-owner: the seven-role ladder a governed posture
 * states, and the authored ladder that refines it.
 *
 * @module Compilers/Theme/Lowering/Runtime/derivation/elevation/ladder
 * @category Compilers
 * @package @rottay/design-system
 */

import type { FlatTheme } from "@/foundation/contracts/composition/tenants/themes";
import type { RampSurface } from "@/foundation/kernel/color/oklch/ramp";
import type { ExpressiveExpansion } from "@/foundation/tokens/ts/presentation/expressive-profiles/expansion";
import { appearancePostureToVariables } from "@/infrastructure/compilers/kernel/foundation/css/appearance-posture";
import type { AppearancePostureFields } from "@/infrastructure/compilers/kernel/foundation/css/appearance-posture";
import { isDarkSurface } from "@/infrastructure/compilers/kernel/foundation/css/color-math";
import { ELEVATION_PRESET_CHANNELS } from "../../../../foundation/contract";
import {
  DARK_DEFAULT_GROUND,
  LIGHT_DEFAULT_GROUND,
} from "../../../../foundation/ground";

export type ElevationPosture = NonNullable<
  AppearancePostureFields["elevation"]
>;

const ELEVATION_CHANNELS: ReadonlySet<string> = new Set<string>(
  ELEVATION_PRESET_CHANNELS
);

/**
 * The soft ladder on a dark ground: a top hairline plus a deeper ambient,
 * because a black shadow cannot be seen on a dark canvas. Level 6 continues
 * the 4-to-5 increments mechanically.
 */
export const DARK_GROUND_ELEVATION_LADDER: Readonly<Record<string, string>> =
  Object.freeze({
    "--ds-elevation-0": "none",
    "--ds-elevation-1":
      "inset 0 1px 0 rgba(255, 255, 255, 0.04), 0 1px 2px rgba(0, 0, 0, 0.40), 0 2px 6px rgba(0, 0, 0, 0.28)",
    "--ds-elevation-2":
      "inset 0 1px 0 rgba(255, 255, 255, 0.05), 0 2px 4px rgba(0, 0, 0, 0.44), 0 6px 16px rgba(0, 0, 0, 0.34)",
    "--ds-elevation-3":
      "inset 0 1px 0 rgba(255, 255, 255, 0.06), 0 6px 12px rgba(0, 0, 0, 0.46), 0 12px 28px rgba(0, 0, 0, 0.40)",
    "--ds-elevation-4":
      "inset 0 1px 0 rgba(255, 255, 255, 0.07), 0 12px 24px rgba(0, 0, 0, 0.50), 0 20px 44px rgba(0, 0, 0, 0.44), 0 0 24px color-mix(in srgb, var(--ds-color-primary, #ffffff) 8%, transparent)",
    "--ds-elevation-5":
      "inset 0 1px 0 rgba(255, 255, 255, 0.08), 0 20px 40px rgba(0, 0, 0, 0.56), 0 32px 64px rgba(0, 0, 0, 0.48), 0 0 32px color-mix(in srgb, var(--ds-color-primary, #ffffff) 10%, transparent)",
    "--ds-elevation-6":
      "inset 0 1px 0 rgba(255, 255, 255, 0.09), 0 28px 56px rgba(0, 0, 0, 0.62), 0 44px 84px rgba(0, 0, 0, 0.52), 0 0 40px color-mix(in srgb, var(--ds-color-primary, #ffffff) 12%, transparent)",
  });

/**
 * The foundation's light ladder, restated where a light block sits beside a
 * dark one, so the mode block stays a delta over channels the base declares.
 */
export const LIGHT_GROUND_ELEVATION_LADDER: Readonly<Record<string, string>> =
  Object.freeze({
    "--ds-elevation-0": "none",
    "--ds-elevation-1":
      "0 1px 2px color-mix(in srgb, var(--ds-shadow-tint) calc(4% * var(--ds-shadow-key-strength)), transparent), 0 2px 4px color-mix(in srgb, var(--ds-shadow-tint) calc(3% * var(--ds-shadow-key-strength)), transparent), 0 4px 8px color-mix(in srgb, var(--ds-shadow-tint) calc(2% * var(--ds-shadow-ambient-strength)), transparent)",
    "--ds-elevation-2":
      "0 2px 4px color-mix(in srgb, var(--ds-shadow-tint) calc(3% * var(--ds-shadow-key-strength)), transparent), 0 4px 8px color-mix(in srgb, var(--ds-shadow-tint) calc(4% * var(--ds-shadow-key-strength)), transparent), 0 8px 16px color-mix(in srgb, var(--ds-shadow-tint) calc(3% * var(--ds-shadow-ambient-strength)), transparent)",
    "--ds-elevation-3":
      "0 2px 4px color-mix(in srgb, var(--ds-shadow-tint) calc(2% * var(--ds-shadow-key-strength)), transparent), 0 4px 8px color-mix(in srgb, var(--ds-shadow-tint) calc(3% * var(--ds-shadow-key-strength)), transparent), 0 8px 16px color-mix(in srgb, var(--ds-shadow-tint) calc(4% * var(--ds-shadow-key-strength)), transparent), 0 16px 32px color-mix(in srgb, var(--ds-shadow-tint) calc(4% * var(--ds-shadow-ambient-strength)), transparent)",
    "--ds-elevation-4":
      "0 4px 8px color-mix(in srgb, var(--ds-shadow-tint) calc(2% * var(--ds-shadow-key-strength)), transparent), 0 8px 16px color-mix(in srgb, var(--ds-shadow-tint) calc(3% * var(--ds-shadow-key-strength)), transparent), 0 16px 32px color-mix(in srgb, var(--ds-shadow-tint) calc(4% * var(--ds-shadow-key-strength)), transparent), 0 32px 64px color-mix(in srgb, var(--ds-shadow-tint) calc(6% * var(--ds-shadow-ambient-strength)), transparent)",
    "--ds-elevation-5":
      "0 8px 16px color-mix(in srgb, var(--ds-shadow-tint) calc(4% * var(--ds-shadow-key-strength)), transparent), 0 16px 32px color-mix(in srgb, var(--ds-shadow-tint) calc(6% * var(--ds-shadow-key-strength)), transparent), 0 32px 64px color-mix(in srgb, var(--ds-shadow-tint) calc(8% * var(--ds-shadow-ambient-strength)), transparent)",
    "--ds-elevation-6":
      "0 12px 24px color-mix(in srgb, var(--ds-shadow-tint) calc(5% * var(--ds-shadow-key-strength)), transparent), 0 24px 48px color-mix(in srgb, var(--ds-shadow-tint) calc(7% * var(--ds-shadow-key-strength)), transparent), 0 48px 96px color-mix(in srgb, var(--ds-shadow-tint) calc(10% * var(--ds-shadow-ambient-strength)), transparent)",
  });

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
  bt: FlatTheme,
  expansion: ExpressiveExpansion,
  surface: RampSurface = "light",
  overlay = false,
  carriesDarkOverlay = false
): Record<string, string> {
  const su = bt.surfaces;
  const posture = su?.elevation ?? expansion.fieldDefaults.elevation;
  const vars =
    posture === undefined || posture === "soft"
      ? { ...groundLadder(bt, surface, overlay || carriesDarkOverlay) }
      : posturePreset(posture);
  const authored = su?.elevations;
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

/** The block's canvas: its authored ground, else the foundation ground of its surface. */
function groundLadder(
  bt: FlatTheme,
  surface: RampSurface,
  besideDark: boolean
): Readonly<Record<string, string>> {
  const ground =
    bt.palette?.backgroundColor ??
    (surface === "dark" ? DARK_DEFAULT_GROUND : LIGHT_DEFAULT_GROUND);
  if (isDarkSurface(ground)) return DARK_GROUND_ELEVATION_LADDER;
  return besideDark ? LIGHT_GROUND_ELEVATION_LADDER : {};
}
