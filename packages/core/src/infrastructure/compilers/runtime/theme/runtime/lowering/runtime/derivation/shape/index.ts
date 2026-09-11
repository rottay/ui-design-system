/**
 * @fileoverview The shape family: the geometry a theme decides, derived once.
 *
 * @module Compilers/Theme/Lowering/Runtime/derivation/shape
 * @category Compilers
 * @package @rottay/design-system
 */

import type { FamilyDeriver } from "../../../foundation/contract";
import { deriveButtonSilhouette } from "./button";
import { deriveControlHeightScale } from "./control-height";
import { deriveNestingLaw } from "./nesting";
import { deriveRadiusRamp } from "./radius";

/**
 * Every channel the geometry decisions state, in one producer.
 *
 * `shape.radius-scale` reaches the ramp through the `-base` operands and
 * `shape.button-style` through the silhouette; both are normalized against the
 * vertical's own dial position so the decision moves what it declares instead
 * of reproducing the authored pixel at every position. The dial CHANNEL itself
 * stays with the scale axes: this family reads it, it does not restate it.
 *
 * `shape.nesting` and `shape.control-height` are the other two geometry
 * decisions, and neither restates a value another sub-owner already emits:
 * nesting states the two operands of the nested-corner derivation, and the
 * control height states one factor the control families fold in where they
 * already fold in the density scale. Both are absent channels until a theme
 * authors the word, so an unauthored theme compiles byte-identically.
 */
export const shapeDeriver: FamilyDeriver = {
  family: "shape",
  rank: "derived",
  consumes: [
    "surfaces.borderRadius",
    "surfaces.buttonStyle",
    "surfaces.nesting",
    "surfaces.controlHeight",
    "expressive.*",
  ],
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
    "--ds-radius-nest-inset",
    "--ds-radius-nest-ratio",
    "--ds-control-height-scale",
  ],
  derive: (context) => ({
    ...deriveRadiusRamp(context.theme, context.radiusBaseline),
    ...deriveButtonSilhouette(
      context.theme,
      context.expressive.expansion,
      context.radiusBaseline
    ),
    ...deriveNestingLaw(context.theme),
    ...deriveControlHeightScale(context.theme),
  }),
};
