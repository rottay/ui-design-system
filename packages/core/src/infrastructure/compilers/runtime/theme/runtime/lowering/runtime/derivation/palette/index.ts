/**
 * @fileoverview The palette family: what the seeds state, what they imply, and
 * the two postures that decide how the implications land.
 *
 * @module Compilers/Theme/Lowering/Runtime/derivation/palette
 * @category Compilers
 * @package @rottay/design-system
 */

import type {
  BrandPalette,
  FlatTheme,
  FlatThemeMode,
} from "@/foundation/contracts/composition/tenants/themes";
import { apcaContrast } from "@/foundation/kernel/accessibility/branding-contrast";
import type { RampSurface } from "@/foundation/kernel/color/oklch/ramp";
import { isHexColor } from "@/infrastructure/compilers/kernel/foundation/css/color-math";
import type { OnToneRole } from "@/infrastructure/compilers/kernel/foundation/css/color-math/readable-ink";
import type { FamilyDeriver } from "../../../foundation/contract";
import {
  DARK_DEFAULT_GROUND,
  LIGHT_DEFAULT_GROUND,
} from "../../../foundation/ground";
import {
  deriveExtendedPaletteFloor,
  setExtendedPaletteVariables,
  textGrounds,
} from "../../../foundation/palette";
import { resolveContrastPosture } from "../../../foundation/contrast-posture";
import { derivePaletteInks } from "./inks";
import { deriveNeutralAxis } from "./neutral-temperature";
import {
  derivePaletteBorderHover,
  derivePaletteGround,
  derivePaletteSemanticChannels,
  derivePaletteSemanticFloor,
  STATUS_ROLE_STEP,
} from "./semantic";

export { resolveContrastPosture } from "../../../foundation/contrast-posture";
export { derivePaletteTints } from "./tints";

/**
 * Every channel a palette states or implies, in one producer.
 *
 * Semantic defaults come FIRST, so every authored layer outranks them: the
 * palette literals restate their own channels, and the vertical's chrome
 * outranks the whole family one rank up. A theme that authors its button
 * chrome therefore keeps its exact pixels while a palette-only theme stops
 * being inert -- the seeds reach the buttons, focus ring, links, interactive
 * states and grounds instead of stopping at the ramps.
 *
 * A mode overlay re-enters this family with its own merged palette, so the
 * other mode resolves its own seed here rather than being smuggled through a
 * second field on this one. The neutral axis is emitted here, not beside the
 * seeded ramps: `palette.neutral-temperature` is what decides it.
 *
 * The status tints arrive as a context fact rather than being derived here:
 * the seeds family restates the same channels at tenant rank, and one
 * derivation per block is what keeps the two from disagreeing about the
 * posture's mix strengths.
 */
export const paletteDeriver: FamilyDeriver = {
  family: "palette",
  rank: "derived",
  consumes: ["palette.*", "chrome.controls.input.bg"],
  produces: [
    "--ds-button-primary-*",
    "--ds-input-border-focus",
    "--ds-input-shadow-focus",
    "--ds-input-bg",
    "--ds-card-bg",
    "--ds-table-header-bg",
    "--ds-color-*",
    "--ds-text-primary",
    "--ds-text-secondary",
    "--ds-text-disabled",
    "--ds-border-color*",
  ],
  derive: (context) =>
    derivePaletteChannels(context.theme, context.statusTints, context.mode, {
      tones: context.inheritedStatusTones,
      surface: context.surface,
      rampChannels: context.rampChannels,
    }),
};

/** The status tones a block re-grades onto its own ramp, and that ramp's surface. */
export interface StatusRegrade {
  readonly tones: readonly OnToneRole[];
  readonly surface: RampSurface;
  /** The block's own ramp channels, as the ramps family emits them. */
  readonly rampChannels: Readonly<Record<string, string>>;
}

/**
 * What each regraded role resolves to: its step on the ramp this surface
 * derives, and only where that step reads harder on the block's own ground
 * than the seed does -- a block that kept the body's canvas keeps the seed.
 */
function regradedTonePaint(
  palette: BrandPalette,
  regrade: StatusRegrade | undefined
): Partial<Record<OnToneRole, string>> {
  if (!regrade || regrade.tones.length === 0) return {};
  const ground =
    palette.backgroundColor ??
    (regrade.surface === "dark" ? DARK_DEFAULT_GROUND : LIGHT_DEFAULT_GROUND);
  if (!isHexColor(ground)) return {};
  const painted: Partial<Record<OnToneRole, string>> = {};
  for (const role of regrade.tones) {
    const seed = palette[`${role}Color`];
    const step = regrade.rampChannels[`--ds-color-${role}-${STATUS_ROLE_STEP}`];
    if (!seed || !isHexColor(seed) || !step || !isHexColor(step)) continue;
    if (
      Math.abs(apcaContrast(step, ground)) > Math.abs(apcaContrast(seed, ground))
    ) {
      painted[role] = step;
    }
  }
  return painted;
}

export function derivePaletteChannels(
  bt: FlatTheme,
  statusTints: Record<string, string>,
  mode: FlatThemeMode,
  regrade?: StatusRegrade
): Record<string, string> {
  const vars: Record<string, string> = {};
  const palette = bt.palette;
  if (!palette) return vars;
  const posture = resolveContrastPosture(bt);
  const inkPair = {
    light: posture.inkLight,
    dark: posture.inkDark,
    minimumRatio: posture.minimumRatio,
  };

  Object.assign(vars, derivePaletteSemanticFloor(palette));
  Object.assign(vars, derivePaletteBorderHover());
  const painted = regradedTonePaint(palette, regrade);
  Object.assign(vars, derivePaletteSemanticChannels(palette, painted));
  Object.assign(vars, derivePaletteInks(palette, inkPair, painted));
  Object.assign(
    vars,
    deriveExtendedPaletteFloor(palette.primaryColor, inkPair, textGrounds(palette, mode))
  );
  Object.assign(vars, statusTints);
  setExtendedPaletteVariables(vars, palette);
  Object.assign(vars, derivePaletteGround(palette));
  Object.assign(vars, deriveNeutralAxis(bt));
  return vars;
}
