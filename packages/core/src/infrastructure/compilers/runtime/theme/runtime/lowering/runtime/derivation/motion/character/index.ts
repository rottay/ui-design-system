/**
 * @fileoverview Motion sub-owner: the character of the curve, never its speed.
 *
 * @module Compilers/Theme/Lowering/Runtime/derivation/motion/character
 * @category Compilers
 * @package @rottay/design-system
 */

import type { BrandTheme } from "@/foundation/contracts/composition/tenants/themes";

/**
 * Kit row 23, as three statements about SHAPE.
 *
 * Motion has two independent axes and the kit gives each its own row: the dial
 * decides how LONG a transition takes, this decides what curve it travels and
 * how far a surface moves getting there. Nothing here touches
 * `--ds-motion-{instant,calm,deliberate}` or the duration scale, so a tenant
 * can ask for mechanical motion without also asking for fast motion -- a
 * character that also moved the cadence would apply one axis twice.
 *
 * `organic` is the identity: it restates the engine's own authored eases, which
 * is what makes the resting character expressible rather than only reachable by
 * authoring nothing.
 *
 * - `mechanical` — one symmetric ease, no anticipation and no travel: the curve
 *   an operational product wants, where a moving surface is a state change
 *   rather than a gesture.
 * - `organic`     — the DS default: a decelerating enter with a 2px settle.
 * - `playful`     — a back-out overshoot and a longer travel, so a surface
 *   arrives past its resting position and settles into it.
 */
const MOTION_CHARACTER: Readonly<
  Record<
    NonNullable<NonNullable<BrandTheme["motion"]>["character"]>,
    Readonly<Record<string, string>>
  >
> = {
  mechanical: {
    "--ds-ease-standard": "cubic-bezier(0.4, 0, 0.2, 1)",
    "--ds-ease-exit": "cubic-bezier(0.4, 0, 0.2, 1)",
    "--ds-motion-ease-enter": "cubic-bezier(0.4, 0, 0.2, 1)",
    "--ds-motion-ease-in-out": "cubic-bezier(0.4, 0, 0.2, 1)",
    "--ds-motion-scale-in": "1",
    "--ds-motion-offset-in": "0px",
    "--ds-motion-panel-offset": "8px",
  },
  organic: {
    "--ds-ease-standard": "cubic-bezier(0.2, 0, 0, 1)",
    "--ds-ease-exit": "cubic-bezier(0.4, 0, 1, 1)",
    "--ds-motion-ease-enter": "cubic-bezier(0.16, 1, 0.3, 1)",
    "--ds-motion-ease-in-out": "cubic-bezier(0.4, 0, 0.6, 1)",
    "--ds-motion-scale-in": "0.98",
    "--ds-motion-offset-in": "-2px",
    "--ds-motion-panel-offset": "12px",
  },
  playful: {
    "--ds-ease-standard": "cubic-bezier(0.34, 1.4, 0.64, 1)",
    "--ds-ease-exit": "cubic-bezier(0.36, 0, 0.66, -0.28)",
    "--ds-motion-ease-enter": "cubic-bezier(0.34, 1.56, 0.64, 1)",
    "--ds-motion-ease-in-out": "cubic-bezier(0.68, -0.2, 0.32, 1.2)",
    "--ds-motion-scale-in": "0.94",
    "--ds-motion-offset-in": "-6px",
    "--ds-motion-panel-offset": "18px",
  },
};

/**
 * The character the theme DECIDED, or nothing.
 *
 * Own-property guarded for the same reason the weight ladder is: a BrandTheme
 * is plain data by the time it reaches this compiler, so a bare bracket read of
 * a closed table resolves inherited members and unknown words alike -- and an
 * invalid easing string is an animation that silently does not run.
 */
export function deriveMotionCharacter(bt: BrandTheme): Record<string, string> {
  const authored = bt.motion?.character;
  if (
    typeof authored !== "string" ||
    !Object.prototype.hasOwnProperty.call(MOTION_CHARACTER, authored)
  ) {
    return {};
  }
  return { ...MOTION_CHARACTER[authored as keyof typeof MOTION_CHARACTER] };
}
