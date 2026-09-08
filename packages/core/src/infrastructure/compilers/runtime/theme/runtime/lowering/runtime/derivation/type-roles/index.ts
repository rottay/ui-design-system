/**
 * @fileoverview The type-role family: the named ramp and the semantic roles.
 *
 * @module Compilers/Theme/Lowering/Runtime/derivation/type-roles
 * @category Compilers
 * @package @rottay/design-system
 */

import type { BrandTheme } from "@/foundation/contracts/composition/tenants/themes";
import type { ExpressiveTypeRoleOverlay } from "@/foundation/tokens/ts/presentation/expressive-profiles/expansion";
import type { FamilyDeriver } from "../../../foundation/contract";
import { omitUndefined } from "../../../foundation/shape";
import { setTypeRampVariables } from "../../../foundation/type-ramp";
import { setSemanticTypographyVariables } from "../../../foundation/typography";

/**
 * The composite ramp plus the nine semantic roles.
 *
 * `labelStyle` is an AUTHORED case decision and belongs in the authored layer
 * of the single role emitter, above any expressive profile overlay: it used to
 * feed personality only, which let the label role channel silently ignore it.
 * The finer `typography.roles.label` surface still wins over this mapping when
 * both are authored.
 */
export const typeRolesDeriver: FamilyDeriver = {
  family: "type-roles",
  rank: "derived",
  consumes: ["typography.roles", "typography.labelStyle", "expressive.*"],
  produces: ["--ds-text-*", "--ds-type-*"],
  derive: (context) =>
    deriveTypeRoleChannels(context.theme, context.expressive.typeRoleOverlay),
};

export function deriveTypeRoleChannels(
  bt: BrandTheme,
  typeRoleOverlay: ExpressiveTypeRoleOverlay | undefined
): Record<string, string> {
  const vars: Record<string, string> = {};
  setTypeRampVariables(vars);
  const authoredLabelCase: "uppercase" | "capitalize" | "none" | undefined =
    bt.typography?.labelStyle === undefined
      ? undefined
      : bt.typography.labelStyle === "uppercase"
      ? "uppercase"
      : bt.typography.labelStyle === "capitalize"
      ? "capitalize"
      : "none";
  const authoredRoles =
    authoredLabelCase === undefined
      ? bt.typography?.roles
      : {
          ...bt.typography?.roles,
          label: {
            textTransform: authoredLabelCase,
            ...omitUndefined(bt.typography?.roles?.label),
          },
        };
  setSemanticTypographyVariables(vars, authoredRoles, typeRoleOverlay);
  return vars;
}
