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
 *
 * The `neutral` ramp is NOT here: it has no seed, so what a tenant decides
 * about it is `palette.neutral-temperature`, and the palette family that owns
 * that decision owns the channels too.
 *
 * The focus ring is here for one reason: it is a CHOICE OF STOP. Which colour a
 * ring may paint depends on the seed, the ramp built from it and the ground this
 * block renders on, and this is the only family that holds all three. It stays
 * one channel with one producer -- the sheet's two scopes remain the answer for
 * a theme that states no seed (D6-FAM-01).
 */
export const rampsDeriver: FamilyDeriver = {
  family: "ramps",
  rank: "derived",
  consumes: ["palette.primaryColor", "palette.secondaryColor", "palette.successColor", "palette.warningColor", "palette.errorColor", "palette.infoColor", "palette.backgroundColor", "palette.ramps"],
  produces: ["--ds-color-*", "--ds-focus-ring-color"],
  derive: (context) =>
    deriveTenantColorRamps(context.theme.palette, context.surface),
};
