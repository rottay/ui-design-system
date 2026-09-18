/**
 * @fileoverview The ink a ground can actually carry, at a stated contrast floor.
 *
 * A colour chosen for BRAND or for EMPHASIS is not a contrast statement. A seed
 * is what the tenant is; a de-emphasis literal is how quiet the role should
 * read. Neither knows which canvas it will be painted on, and CSS cannot check
 * itself -- so the same declaration that reads correctly in one mode can be
 * invisible in the other. `safeFocusRingColor` already settles that question
 * for the focus ring by walking the seed's own ramp; this settles it for text
 * inks, which have no ramp of their own to walk.
 *
 * The move is along OKLCH LIGHTNESS only: hue and chroma are the identity of
 * the preferred colour, and lightness is the axis every contrast floor is
 * actually stated on. So the returned ink is the same colour the caller asked
 * for, at the lightness this ground can carry.
 */

import { contrastRatio, isHexColor } from '../../contrast';
import { hexToOklch, oklchToHex } from '..';

/**
 * How far one search step moves along OKLCH lightness.
 *
 * Small enough that the answer is the smallest visible change from the
 * preferred colour, large enough that the winning step clears the floor with
 * margin instead of landing on it.
 */
const LIGHTNESS_STEP = 0.02;

/** Passes iff the floor test does not fire, epsilon-guarded like every other floor here. */
function clearsFloor(hex: string, groundHex: string, minimumRatio: number): boolean {
  return !(contrastRatio(hex, groundHex) + Number.EPSILON < minimumRatio);
}

/**
 * The ink this ground can actually show: the preferred colour when it clears
 * the floor, else the same colour moved along lightness until it does.
 *
 * MEASURABLE OR DEFERRED. A preferred colour or a ground that is a legal CSS
 * colour but not a hex literal -- `var(--x)`, `oklch(...)`, `currentColor` --
 * has no value to measure, so the preferred colour is returned untouched. A
 * value moved on the strength of a pairing nobody measured would be a claim,
 * not a check.
 *
 * The direction is decided by the ground, not by the preferred colour: whichever
 * of black or white contrasts more with this canvas is the way legibility lies,
 * which stays correct for a mid-luminance ground where the preferred colour's
 * own lightness says nothing useful.
 */
export function safeInkOnGround(
  preferredHex: string,
  groundHex: string,
  minimumRatio: number
): string {
  if (!isHexColor(preferredHex) || !isHexColor(groundHex)) return preferredHex;
  if (clearsFloor(preferredHex, groundHex, minimumRatio)) return preferredHex;

  const towardLight =
    contrastRatio('#ffffff', groundHex) > contrastRatio('#000000', groundHex);
  const direction = towardLight ? 1 : -1;
  const preferred = hexToOklch(preferredHex);
  for (
    let lightness = preferred.l + direction * LIGHTNESS_STEP;
    lightness >= 0 && lightness <= 1;
    lightness += direction * LIGHTNESS_STEP
  ) {
    const candidate = oklchToHex({ ...preferred, l: lightness });
    if (clearsFloor(candidate, groundHex, minimumRatio)) return candidate;
  }
  // The extreme this ground points at. Reached only by a floor no ink clears,
  // and still the most legible answer available rather than a refusal.
  return towardLight ? '#ffffff' : '#000000';
}
