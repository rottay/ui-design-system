/**
 * @fileoverview The type-family family: font families and the two metrics a
 * governed pairing shares with an authored typography block.
 *
 * @module Compilers/Theme/Lowering/Runtime/derivation/typography
 * @category Compilers
 * @package @rottay/design-system
 */

import { withArabicSafeFallback } from "@/foundation/kernel/typography";
import { appearancePostureToVariables } from "@/infrastructure/compilers/kernel/foundation/css/appearance-posture";
import type { AppearancePostureFields } from "@/infrastructure/compilers/kernel/foundation/css/appearance-posture";
import type { BrandTheme } from "@/foundation/contracts/composition/tenants/themes";
import type { ExpressiveExpansion } from "@/foundation/tokens/ts/presentation/expressive-profiles/expansion";
import type { FamilyDeriver } from "../../../foundation/contract";
import { TYPE_PAIRING_CHANNELS } from "../../../foundation/contract";

const PAIRING_CHANNELS: ReadonlySet<string> = new Set<string>(
  TYPE_PAIRING_CHANNELS
);

/** The pairing's five channels, and nothing else the posture table computes. */
function pairingVariables(
  typePairing: AppearancePostureFields["typePairing"]
): Record<string, string> {
  if (!typePairing) return {};
  const vars: Record<string, string> = {};
  for (const [channel, value] of Object.entries(
    appearancePostureToVariables({ typePairing })
  )) {
    if (PAIRING_CHANNELS.has(channel)) vars[channel] = value;
  }
  return vars;
}

/**
 * The single producer of the type families and their tracking/leading.
 *
 * These five channels -- base, heading and mono family, heading tracking and
 * display leading -- used to be written twice inside one function, once from
 * the vertical's own block and once from the tenant floor, which is why write
 * order rather than authority decided them. The three vertical-level
 * statements (profile pairing, authored pairing, authored literal) resolve
 * HERE, in that order; the tenant's own pairing and literals are a separate
 * family one rank up, so the contest between authorities is the ranked merge
 * and not a trailing assignment.
 */
export const typographyDeriver: FamilyDeriver = {
  family: "typography",
  rank: "derived",
  consumes: ["typography.*", "expressive.*"],
  produces: [
    "--ds-font-family-base",
    "--ds-font-family-heading",
    "--ds-font-family-mono",
    "--ds-font-family-display",
    "--ds-letter-spacing-display",
    "--ds-letter-spacing-heading",
    "--ds-letter-spacing-body",
    "--ds-letter-spacing-mono",
    "--ds-line-height-display",
    "--ds-line-height-heading",
    "--ds-line-height-body",
    "--ds-line-height-tight",
    "--ds-line-height-relaxed",
  ],
  derive: (context) =>
    deriveTypeFamilyChannels(context.theme, context.expressive.expansion),
};

export function deriveTypeFamilyChannels(
  bt: BrandTheme,
  expansion: ExpressiveExpansion
): Record<string, string> {
  const vars: Record<string, string> = {};
  Object.assign(vars, pairingVariables(expansion.fieldDefaults.typePairing));
  const ty = bt.typography;
  if (!ty) return vars;
  Object.assign(vars, pairingVariables(ty.typePairing));
  if (ty.fontFamilyBase)
    vars["--ds-font-family-base"] = withArabicSafeFallback(ty.fontFamilyBase);
  if (ty.fontFamilyHeading)
    vars["--ds-font-family-heading"] = withArabicSafeFallback(
      ty.fontFamilyHeading
    );
  if (ty.fontFamilyMono) vars["--ds-font-family-mono"] = ty.fontFamilyMono;
  if (ty.fontFamilyDisplay)
    vars["--ds-font-family-display"] = withArabicSafeFallback(
      ty.fontFamilyDisplay
    );
  if (ty.letterSpacing) {
    if (ty.letterSpacing.display)
      vars["--ds-letter-spacing-display"] = ty.letterSpacing.display;
    if (ty.letterSpacing.heading)
      vars["--ds-letter-spacing-heading"] = ty.letterSpacing.heading;
    if (ty.letterSpacing.body)
      vars["--ds-letter-spacing-body"] = ty.letterSpacing.body;
    if (ty.letterSpacing.mono)
      vars["--ds-letter-spacing-mono"] = ty.letterSpacing.mono;
  }
  if (ty.lineHeight) {
    if (ty.lineHeight.display != null)
      vars["--ds-line-height-display"] = String(ty.lineHeight.display);
    if (ty.lineHeight.heading != null)
      vars["--ds-line-height-heading"] = String(ty.lineHeight.heading);
    if (ty.lineHeight.body != null)
      vars["--ds-line-height-body"] = String(ty.lineHeight.body);
    if (ty.lineHeight.tight != null)
      vars["--ds-line-height-tight"] = String(ty.lineHeight.tight);
    if (ty.lineHeight.relaxed != null)
      vars["--ds-line-height-relaxed"] = String(ty.lineHeight.relaxed);
  }
  return vars;
}
