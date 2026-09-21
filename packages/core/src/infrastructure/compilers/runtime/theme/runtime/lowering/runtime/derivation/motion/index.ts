/**
 * @fileoverview The motion family: ONE duration/easing vocabulary, every role
 * of it stated at rest, plus the two bounded dials.
 *
 * @module Compilers/Theme/Lowering/Runtime/derivation/motion
 * @category Compilers
 * @package @rottay/design-system
 */

import type { FlatTheme } from "@/foundation/contracts/composition/tenants/themes";
import type { ExpressiveExpansion } from "@/foundation/tokens/ts/presentation/expressive-profiles/expansion";
import { appearancePostureToVariables } from "@/infrastructure/compilers/kernel/foundation/css/appearance-posture";
import type { AppearancePostureFields } from "@/infrastructure/compilers/kernel/foundation/css/appearance-posture";
import type { FamilyDeriver } from "../../../foundation/contract";
import { setMotionVariables } from "../../../foundation/motion";
import { deriveMotionCharacter } from "./character";

export { deriveMotionCharacter } from "./character";

/** The two bounded dials the shared posture table computes for this family. */
const MOTION_DIAL_CHANNELS: ReadonlySet<string> = new Set([
  "--ds-motion-intensity",
  "--ds-motion-duration-scale",
]);

function motionDialVariables(
  motion: AppearancePostureFields["motion"]
): Record<string, string> {
  if (!motion) return {};
  const vars: Record<string, string> = {};
  for (const [channel, value] of Object.entries(
    appearancePostureToVariables({ motion })
  )) {
    if (MOTION_DIAL_CHANNELS.has(channel)) vars[channel] = value;
  }
  return vars;
}

/**
 * The duration aliases the vocabulary also answers to.
 *
 * `instant/calm/deliberate` are the product-law cadence; `fast/normal/slow/
 * glacial` are the same three steps under the names the token sheet and the
 * skins already read. They are ALIASES of the cadence, not a second ladder:
 * deriving them from it is what keeps a second spelling from becoming a second
 * authority, which is how the retired pre-composed transition catalog drifted
 * from the cadence it was supposed to restate.
 *
 * `fast/normal/slow` are DIAL PRODUCTS of that cadence, in the same shape the
 * intent names take: the cadence is the dial's INPUT and every public duration
 * name a skin may bind is its OUTPUT. Stating them as a bare `var()` made the
 * distinction between the two spellings a distinction between a tenant-movable
 * duration and a fixed one -- `--ds-motion-feedback` answered `motion.dial`
 * while `--ds-motion-fast`, its own rung under the other name, could not. At
 * `durationScale: 1` both spellings resolve to the same duration they always
 * did, so this changes no resting value; under a dial they now agree.
 *
 * `glacial` is deliberately NOT one. It is the ambient-loop rung, and the loops
 * that ride it already multiply it by the dial at the call site
 * (`calc(var(--ds-motion-glacial) * var(--ds-motion-duration-scale, 1))`, the
 * empty-state precedent); making the channel a product too would apply the
 * dial twice. Measured, not assumed: 16 declaration sites carry the factor already.
 */
const DURATION_ALIASES: Readonly<Record<string, string>> = {
  "--ds-motion-fast":
    "calc(var(--ds-motion-instant) * var(--ds-motion-duration-scale, 1))",
  "--ds-motion-normal":
    "calc(var(--ds-motion-calm) * var(--ds-motion-duration-scale, 1))",
  "--ds-motion-slow":
    "calc(var(--ds-motion-deliberate) * var(--ds-motion-duration-scale, 1))",
  "--ds-motion-glacial": "calc(var(--ds-motion-deliberate) * 1.5625)",
};

/**
 * Roles a skin animates on that carried no resting value.
 *
 * A component that writes `animation: … var(--ds-motion-calm)` produces an
 * INVALID animation wherever the channel is unset -- and `calm` and
 * `deliberate` existed only inside the reduced-motion block, so thirteen
 * modern animations were invalid in every context that ships the engine
 * without a compiled tenant artifact. A role a component may bind has a
 * resting value or it is not a role.
 */
const REST_ROLES: Readonly<Record<string, string>> = {
  "--ds-motion-ease-standard": "var(--ds-ease-standard)",
  "--ds-motion-ease-out": "var(--ds-motion-ease-enter)",
  "--ds-motion-ease-in-out": "cubic-bezier(0.4, 0, 0.6, 1)",
  "--ds-motion-scale-in": "0.98",
  "--ds-motion-offset-in": "-2px",
  "--ds-motion-panel-offset": "12px",
};

/**
 * Three durations, two easing families, and the dials that bend them.
 *
 * The bounded `intensity` and `durationScale` dials used to be emitted by the
 * scale-axis family while the vocabulary they bend was emitted here, so one
 * axis had two owners separated by the whole registry. They are motion
 * statements and settle in the motion family.
 *
 * `motion.character` (kit row 23) is the third statement and the second axis:
 * the dial bends the cadence, the character reshapes the curve. It settles here
 * for the same reason -- one axis, one owner -- and it deliberately reaches no
 * duration, so the two rows cannot double-count each other.
 */
export const motionDeriver: FamilyDeriver = {
  family: "motion",
  rank: "derived",
  consumes: ["motion.*", "motion.character"],
  produces: ["--ds-motion-*", "--ds-ease-*"],
  derive: (context) =>
    deriveMotionChannels(context.theme, context.expressive.expansion),
};

export function deriveMotionChannels(
  bt: FlatTheme,
  expansion: ExpressiveExpansion
): Record<string, string> {
  const vars: Record<string, string> = {};
  setMotionVariables(vars, bt);
  Object.assign(vars, DURATION_ALIASES, REST_ROLES);
  // The AUTHORED character refines the resting roles above: `REST_ROLES` is the
  // value a role has when nobody chose, and a chosen character is a choice. The
  // two live in one family, so this composition is the whole contest.
  Object.assign(vars, deriveMotionCharacter(bt));
  Object.assign(vars, motionDialVariables(expansion.fieldDefaults.motion));
  Object.assign(
    vars,
    motionDialVariables(
      bt.motion
        ? {
            intensity: bt.motion.intensity,
            durationScale: bt.motion.durationScale,
            ambient: bt.motion.ambient,
          }
        : undefined
    )
  );
  return vars;
}
