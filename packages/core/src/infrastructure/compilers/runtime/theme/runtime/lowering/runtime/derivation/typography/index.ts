/**
 * @fileoverview The typography family: ONE typographic authority -- pairing,
 * ramp, roles, weights, figure posture and pack binding.
 *
 * @module Compilers/Theme/Lowering/Runtime/derivation/typography
 * @category Compilers
 * @package @rottay/design-system
 */

import type { BrandTheme } from "@/foundation/contracts/composition/tenants/themes";
import type { ExpressiveExpansion } from "@/foundation/tokens/ts/presentation/expressive-profiles/expansion";
import type { ExpressiveTypeRoleOverlay } from "@/foundation/tokens/ts/presentation/expressive-profiles/expansion";
import type { FamilyDeriver } from "../../../foundation/contract";
import { deriveTypePairingChannels } from "./pairing";
import { deriveTypeRoleChannels } from "./roles";
import { deriveTypeScaleChannels } from "./scale";
import { deriveTypeWeightChannels } from "./weights";

export { deriveTypePairingChannels } from "./pairing";
export { deriveTypeRoleChannels } from "./roles";
export { deriveTypeScaleChannels } from "./scale";
export { deriveTypeWeightChannels, roleWeightOverlay } from "./weights";
export { NUMERIC_POSTURE, numericOverlay } from "./numeric";

/**
 * One family, one deriver.
 *
 * Type used to be split across two derivers and four parallel vocabularies:
 * the families and metrics here, the ramp and roles in a second family, a
 * weight ladder no decision could move, and a hardcoded scale exported from
 * the token facade. A component therefore had to know WHICH vocabulary a
 * given surface spoke before it could bind to it. The sub-owners below are
 * layers of one authority, not competing ones: pairing states the families,
 * scale states the ramp on the type dial, weights states the ladder the roles
 * bind, numeric states the figure posture the roles wear, and roles states
 * what a surface actually binds. They are composed in that order, so a later
 * layer refines an earlier one instead of contradicting it.
 *
 * The two COARSE postures of the kit -- `typography.roleWeights` (row 9) and
 * `typography.numeric` (row 10) -- reach the semantic roles through `roles`
 * rather than beside it, so the vocabulary a component binds has exactly one
 * writer no matter how many decisions state a facet of it.
 */
export const typographyDeriver: FamilyDeriver = {
  family: "typography",
  rank: "derived",
  consumes: [
    "typography.*",
    "typography.roles",
    "typography.labelStyle",
    "typography.roleWeights",
    "typography.numeric",
    "typography.headingWeightBias",
    "expressive.*",
  ],
  produces: [
    "--ds-font-family-*",
    "--ds-font-weight-*",
    "--ds-letter-spacing-*",
    "--ds-line-height-*",
    "--ds-text-*",
    "--ds-type-*",
  ],
  derive: (context) =>
    deriveTypographyChannels(
      context.theme,
      context.expressive.expansion,
      context.expressive.typeRoleOverlay
    ),
};

export function deriveTypographyChannels(
  bt: BrandTheme,
  expansion: ExpressiveExpansion,
  typeRoleOverlay: ExpressiveTypeRoleOverlay | undefined
): Record<string, string> {
  return {
    ...deriveTypePairingChannels(bt, expansion),
    ...deriveTypeScaleChannels(),
    ...deriveTypeWeightChannels(bt),
    ...deriveTypeRoleChannels(bt, typeRoleOverlay),
  };
}
