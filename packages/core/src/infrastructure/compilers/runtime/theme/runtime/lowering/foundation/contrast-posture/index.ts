/**
 * @fileoverview The contrast posture: how hard the derived ink and separator
 * layer pushes against its ground.
 *
 * @module Compilers/Theme/Lowering/Runtime/derivation/palette/contrast-posture
 * @category Compilers
 * @package @rottay/design-system
 */

import type { FlatTheme } from "@/foundation/contracts/composition/tenants/themes";
import {
  READABLE_INK_DARK,
  READABLE_INK_LIGHT,
  WCAG_AA_NORMAL_TEXT_RATIO,
} from "@/infrastructure/compilers/kernel/foundation/css/color-math/readable-ink";

/** An ink pair, a legibility floor and two separator strengths. */
export interface ContrastPosture {
  /** The light half of the canonical ink pair a tone's ink is chosen from. */
  readonly inkLight: string;
  /** The dark half of that pair. */
  readonly inkDark: string;
  /** The WCAG ratio a derived ink must clear before it claims its channel. */
  readonly minimumRatio: number;
  /** Percent of the tone that survives in its own separator. */
  readonly separatorMix: number;
  /** Percent of the tone that survives in its quietest wash. */
  readonly washMix: number;
}

/**
 * `standard` is the identity: the canonical ink pair, the AA floor and the
 * 20 %/10 % separator strengths the status floor already emitted.
 */
export const CONTRAST_POSTURES = {
  soft: {
    inkLight: "#fafafa",
    inkDark: "#3f3f3f",
    minimumRatio: 3,
    separatorMix: 12,
    washMix: 6,
  },
  standard: {
    inkLight: READABLE_INK_LIGHT,
    inkDark: READABLE_INK_DARK,
    minimumRatio: WCAG_AA_NORMAL_TEXT_RATIO,
    separatorMix: 20,
    washMix: 10,
  },
  high: {
    inkLight: "#ffffff",
    inkDark: "#000000",
    minimumRatio: 7,
    separatorMix: 34,
    washMix: 16,
  },
} as const satisfies Readonly<Record<string, ContrastPosture>>;

export type ContrastPostureName = keyof typeof CONTRAST_POSTURES;

/** The posture this block compiles under; an unstated one rests at `standard`. */
export function resolveContrastPosture(bt: FlatTheme): ContrastPosture {
  const authored = bt.palette?.contrastPosture;
  return authored !== undefined && authored in CONTRAST_POSTURES
    ? CONTRAST_POSTURES[authored as ContrastPostureName]
    : CONTRAST_POSTURES.standard;
}
