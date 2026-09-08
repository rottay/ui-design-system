/**
 * @fileoverview The seed family: the primary and status families a TENANT seed
 * owns, re-derived over the assembled block.
 *
 * @module Compilers/Theme/Lowering/Runtime/derivation/seeds
 * @category Compilers
 * @package @rottay/design-system
 */

import type {
  AssembledChannels,
  DerivedChannels,
  FamilyDeriver,
} from "../../../foundation/contract";
import {
  applyTenantSeedDerivations,
  applyTenantStatusSeedDerivations,
} from "../../../foundation/seeds";

/** Only what this family actually moved, so the merge records one producer. */
function movedChannels(
  next: Record<string, string>,
  below: AssembledChannels
): DerivedChannels {
  const moved: Record<string, string> = {};
  for (const [channel, value] of Object.entries(next)) {
    if (below[channel] !== value) moved[channel] = value;
  }
  return moved;
}

/**
 * A tenant that sets its primary colour and nothing else must get a sidebar, a
 * focus ring and a link colour that are ITS brand, not the vertical's.
 *
 * This family reads the assembled block because its question is about what is
 * already there: a value that bakes no colour of its own already tracks the
 * seed and is left alone, and a tenant leaf that names the channel directly
 * outranks the tenant's own seed. Both guards live in the shared owners it
 * calls; there is no second derivation and no arithmetic here.
 */
export const seedsDeriver: FamilyDeriver = {
  family: "seeds",
  rank: "tenant",
  consumes: ["palette.primaryColor", "palette.successColor", "palette.warningColor", "palette.errorColor", "palette.infoColor"],
  produces: [
    "--ds-button-primary-*",
    "--ds-input-border-focus",
    "--ds-input-shadow-focus",
    "--ds-color-*",
  ],
  derive: (context, below) => {
    const tenant = context.tenant;
    if (!tenant || tenant.authoredPaths === undefined) return {};
    const next: Record<string, string> = { ...below };
    applyTenantSeedDerivations(next, context.theme.palette?.primaryColor, {
      authoredPaths: tenant.authoredPaths,
      modePrefix: context.modePrefix,
      seedIsTenantAuthored: tenant.seedIsTenantAuthored,
    });
    applyTenantStatusSeedDerivations(next, context.theme.palette, {
      authoredPaths: tenant.authoredPaths,
      modePrefix: context.modePrefix,
      toneSeedIsTenantAuthored: tenant.toneSeedIsTenantAuthored,
    });
    return movedChannels(next, below);
  },
};
