/**
 * @fileoverview The ramp family: one perceptually-even ramp per seeded role.
 *
 * @module Compilers/Theme/Lowering/Runtime/derivation/ramps
 * @category Compilers
 * @package @rottay/design-system
 */

import type { FamilyDeriver } from "../../../foundation/contract";
import { deriveTenantColorRamps } from "../../../foundation/ramps";

/**
 * One ramp, on the surface THIS block compiles for.
 *
 * A mode overlay re-enters the family with its own merged palette and its own
 * mode, so its ramp derives against its own ground through the same call --
 * one channel family, two blocks, never a namespaced twin.
 */
export const rampsDeriver: FamilyDeriver = {
  family: "ramps",
  rank: "derived",
  consumes: ["palette.primaryColor", "palette.secondaryColor", "palette.accentColor", "palette.successColor", "palette.warningColor", "palette.errorColor", "palette.infoColor", "palette.backgroundColor", "palette.ramps"],
  produces: ["--ds-color-*"],
  derive: (context) =>
    deriveTenantColorRamps(context.theme.palette, context.surface),
};
