/**
 * @fileoverview The on-tone inks: the ink each status tone carries, chosen at
 * the block's contrast posture.
 *
 * @module Compilers/Theme/Lowering/Runtime/derivation/palette/inks
 * @category Compilers
 * @package @rottay/design-system
 */

import type { BrandPalette } from "@/foundation/contracts/composition/tenants/themes";
import { isHexColor } from "@/infrastructure/compilers/kernel/foundation/css/color-math";
import {
  ON_TONE_ROLES,
  deriveReadableInk,
  onToneChannel,
} from "@/infrastructure/compilers/kernel/foundation/css/color-math/readable-ink";
import type {
  OnToneRole,
  ReadableInkPair,
} from "@/infrastructure/compilers/kernel/foundation/css/color-math/readable-ink";

/**
 * Readable ink over each hex status tone; a dark-mode tone re-derives its own.
 * `palette.contrast-posture` moves the PAIR the shared derivation chooses
 * from, never adding a second choice.
 */
export function derivePaletteInks(
  palette: BrandPalette,
  inkPair: ReadableInkPair,
  painted: Readonly<Partial<Record<OnToneRole, string>>> = {}
): Record<string, string> {
  const vars: Record<string, string> = {};
  for (const role of ON_TONE_ROLES) {
    // The ink sits on what the role PAINTS, which is not the seed once regraded.
    const seed = painted[role] ?? palette[`${role}Color`];
    if (seed && isHexColor(seed)) {
      vars[onToneChannel(role)] = deriveReadableInk(seed, inkPair);
    }
  }
  return vars;
}
