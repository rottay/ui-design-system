/**
 * @fileoverview The shape family: the geometry a theme decides, derived once.
 *
 * @module Compilers/Theme/Lowering/Runtime/derivation/shape
 * @category Compilers
 * @package @rottay/design-system
 */

import type { FamilyDeriver } from "../../../foundation/contract";
import { deriveButtonSilhouette } from "./button";
import { deriveRadiusRamp } from "./radius";

/**
 * Every channel the geometry decisions state, in one producer.
 *
 * `shape.radius-scale` reaches the ramp through the `-base` operands and
 * `shape.button-style` through the silhouette; both are normalized against the
 * vertical's own dial position so the decision moves what it declares instead
 * of reproducing the authored pixel at every position. The dial CHANNEL itself
 * stays with the scale axes: this family reads it, it does not restate it.
 */
export const shapeDeriver: FamilyDeriver = {
  family: "shape",
  rank: "derived",
  consumes: ["surfaces.borderRadius", "surfaces.buttonStyle", "expressive.*"],
  produces: [
    "--ds-radius-sm-base",
    "--ds-radius-md-base",
    "--ds-radius-lg-base",
    "--ds-radius-xl-base",
    "--ds-radius-full",
    "--ds-radius-button",
    "--ds-button-xs-radius",
    "--ds-button-sm-radius",
    "--ds-button-md-radius",
    "--ds-button-lg-radius",
    "--ds-button-xl-radius",
  ],
  derive: (context) => ({
    ...deriveRadiusRamp(context.theme, context.radiusBaseline),
    ...deriveButtonSilhouette(
      context.theme,
      context.expressive.expansion,
      context.radiusBaseline
    ),
  }),
};
