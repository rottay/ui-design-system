/**
 * @fileoverview The palette family: what the seeds state, what they imply, and
 * the two postures that decide how the implications land.
 *
 * @module Compilers/Theme/Lowering/Runtime/derivation/palette
 * @category Compilers
 * @package @rottay/design-system
 */

import type { BrandTheme } from "@/foundation/contracts/composition/tenants/themes";
import type { FamilyDeriver } from "../../../foundation/contract";
import {
  deriveExtendedPaletteFloor,
  setExtendedPaletteVariables,
} from "../../../foundation/palette";
import { resolveContrastPosture } from "./contrast-posture";
import { derivePaletteInks } from "./inks";
import { deriveNeutralAxis } from "./neutral-temperature";
import {
  derivePaletteGround,
  derivePaletteSemanticChannels,
  derivePaletteSemanticFloor,
} from "./semantic";

export { resolveContrastPosture } from "./contrast-posture";
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
    "--ds-text-tertiary",
    "--ds-text-disabled",
    "--ds-text-inverse",
    "--ds-border-color*",
  ],
  derive: (context) => derivePaletteChannels(context.theme, context.statusTints),
};

export function derivePaletteChannels(
  bt: BrandTheme,
  statusTints: Record<string, string>
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
  Object.assign(vars, derivePaletteSemanticChannels(palette));
  Object.assign(vars, derivePaletteInks(palette, inkPair));
  Object.assign(
    vars,
    deriveExtendedPaletteFloor(palette.primaryColor, inkPair)
  );
  Object.assign(vars, statusTints);
  setExtendedPaletteVariables(vars, palette);
  Object.assign(vars, derivePaletteGround(palette));
  Object.assign(vars, deriveNeutralAxis(bt));
  return vars;
}
