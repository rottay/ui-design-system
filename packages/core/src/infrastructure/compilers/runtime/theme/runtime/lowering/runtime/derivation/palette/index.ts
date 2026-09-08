/**
 * @fileoverview The palette family: seeds, semantics, inks and the two floors.
 *
 * @module Compilers/Theme/Lowering/Runtime/derivation/palette
 * @category Compilers
 * @package @rottay/design-system
 */

import { isHexColor } from "@/infrastructure/compilers/kernel/foundation/css/color-math";
import { derivePaletteSemantics } from "@/infrastructure/compilers/kernel/foundation/css/color-math/palette-derivations";
import {
  ON_TONE_ROLES,
  deriveReadableInk,
  onToneChannel,
} from "@/infrastructure/compilers/kernel/foundation/css/color-math/readable-ink";
import type { BrandTheme } from "@/foundation/contracts/composition/tenants/themes";
import type { FamilyDeriver } from "../../../foundation/contract";
import {
  deriveExtendedPaletteFloor,
  deriveStatusTintFloor,
  setExtendedPaletteVariables,
} from "../../../foundation/palette";

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
 * second field on this one.
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
  derive: (context) => derivePaletteChannels(context.theme),
};

export function derivePaletteChannels(bt: BrandTheme): Record<string, string> {
  const vars: Record<string, string> = {};
  if (!bt.palette) return vars;
  const effectivePrimary = bt.palette.primaryColor;
  Object.assign(
    vars,
    derivePaletteSemantics({
      primary: effectivePrimary,
      background: bt.palette.backgroundColor,
    })
  );

  if (bt.palette.primaryColor)
    vars["--ds-color-primary"] = bt.palette.primaryColor;
  if (bt.palette.secondaryColor)
    vars["--ds-color-secondary"] = bt.palette.secondaryColor;
  if (bt.palette.accentColor)
    vars["--ds-color-accent"] = bt.palette.accentColor;
  if (bt.palette.textPrimaryColor)
    vars["--ds-color-text-primary"] = bt.palette.textPrimaryColor;
  if (bt.palette.textSecondaryColor)
    vars["--ds-color-text-secondary"] = bt.palette.textSecondaryColor;
  if (bt.palette.textPageColor)
    vars["--ds-color-text-page"] = bt.palette.textPageColor;
  if (bt.palette.textMutedColor)
    vars["--ds-color-text-muted"] = bt.palette.textMutedColor;
  if (bt.palette.textDisabledColor)
    vars["--ds-color-text-disabled"] = bt.palette.textDisabledColor;
  if (bt.palette.borderPrimaryColor)
    vars["--ds-color-border-primary"] = bt.palette.borderPrimaryColor;
  if (bt.palette.borderSecondaryColor)
    vars["--ds-color-border-secondary"] = bt.palette.borderSecondaryColor;
  if (bt.palette.successColor)
    vars["--ds-color-success"] = bt.palette.successColor;
  if (bt.palette.warningColor)
    vars["--ds-color-warning"] = bt.palette.warningColor;
  if (bt.palette.errorColor) vars["--ds-color-error"] = bt.palette.errorColor;
  if (bt.palette.infoColor) vars["--ds-color-info"] = bt.palette.infoColor;
  // Readable ink over each hex status tone, from the shared derivation the
  // DB path also uses; a dark-mode tone re-derives its own ink.
  for (const role of ON_TONE_ROLES) {
    const seed = bt.palette[`${role}Color`];
    if (seed && isHexColor(seed)) {
      vars[onToneChannel(role)] = deriveReadableInk(seed);
    }
  }
  Object.assign(vars, deriveExtendedPaletteFloor(effectivePrimary));
  Object.assign(vars, deriveStatusTintFloor(bt.palette));
  setExtendedPaletteVariables(vars, bt.palette);

  // This mode's ground. A theme declares one ground in the plain channel; its
  // other mode declares that mode's ground in its own overlay, which compiles
  // into a mode block.
  if (bt.palette.backgroundColor) {
    vars["--ds-color-bg-primary"] = bt.palette.backgroundColor;
    vars["--ds-color-bg"] = bt.palette.backgroundColor;
    vars["--ds-color-background"] = bt.palette.backgroundColor;
  }
  return vars;
}
