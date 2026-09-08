/**
 * @fileoverview The motion family: the closed duration/easing vocabulary.
 *
 * @module Compilers/Theme/Lowering/Runtime/derivation/motion
 * @category Compilers
 * @package @rottay/design-system
 */

import type { FamilyDeriver } from "../../../foundation/contract";
import { setMotionVariables } from "../../../foundation/motion";

/**
 * Three durations and two easing families, expressed as tokens; `calm` tracks
 * the theme's own entrance duration so tabs and tooltips animate at the speed
 * the theme authored for its entrances.
 */
export const motionDeriver: FamilyDeriver = {
  family: "motion",
  rank: "derived",
  consumes: ["motion.*"],
  produces: ["--ds-motion-*", "--ds-ease-*"],
  derive: (context) => {
    const vars: Record<string, string> = {};
    setMotionVariables(vars, context.theme);
    return vars;
  },
};
