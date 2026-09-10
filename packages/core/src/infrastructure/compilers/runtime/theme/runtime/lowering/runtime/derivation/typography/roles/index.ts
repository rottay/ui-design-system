/**
 * @fileoverview Typography sub-owner: the nine semantic roles.
 *
 * @module Compilers/Theme/Lowering/Runtime/derivation/typography/roles
 * @category Compilers
 * @package @rottay/design-system
 */

import type { BrandTheme } from "@/foundation/contracts/composition/tenants/themes";
import type { SemanticTypographyTokens } from "@/foundation/contracts/kernel/tokens/typography";
import type { ExpressiveTypeRoleOverlay } from "@/foundation/tokens/ts/presentation/expressive-profiles/expansion";
import { omitUndefined } from "../../../../foundation/shape";
import { setSemanticTypographyVariables } from "../../../../foundation/typography";

/**
 * The coarse postures the family hands down, in the order they are folded.
 * They are produced by their own sub-owners and composed by the family, so the
 * emitter ranks them without depending on the owners that state them.
 */
export interface TypeRolePostures {
  readonly numeric: SemanticTypographyTokens;
  readonly weights: SemanticTypographyTokens;
}

/**
 * The three COARSE decisions of the type vocabulary, folded into the authored
 * layer of the one role emitter, in increasing specificity.
 *
 * Each of them names a facet the roles already carry, and each is authored --
 * so each belongs above any expressive profile overlay and below the finer
 * `typography.roles.<role>` surface that names the same facet outright. Merging
 * them here, once, is what keeps them from becoming three more writers that a
 * later reader has to rank; the emitter's single-writer precedence does the
 * ranking.
 */
function foldPosture(
  authored: SemanticTypographyTokens | undefined,
  posture: SemanticTypographyTokens
): SemanticTypographyTokens | undefined {
  const roles = Object.keys(posture);
  if (roles.length === 0) return authored;
  const merged: Record<string, unknown> = { ...authored };
  for (const role of roles) {
    merged[role] = {
      ...(posture as Record<string, object>)[role],
      ...omitUndefined(
        (authored as Record<string, object> | undefined)?.[role]
      ),
    };
  }
  return merged as SemanticTypographyTokens;
}

/**
 * The nine roles a component binds instead of a size/weight/tracking triple.
 *
 * `labelStyle` is an AUTHORED case decision and belongs in the authored layer
 * of the single role emitter, above any expressive profile overlay: it used to
 * feed personality only, which let the label role channel silently ignore it.
 * `typography.roleWeights` (kit row 9) and `typography.numeric` (kit row 10)
 * are the same shape of statement and enter the same way -- which is what makes
 * them move `--ds-type-<role>-font-weight` and
 * `--ds-type-<role>-font-variant-numeric` instead of a raw channel beside them.
 * The finer `typography.roles.<role>` surface still wins over all three.
 */
export function deriveTypeRoleChannels(
  bt: BrandTheme,
  typeRoleOverlay: ExpressiveTypeRoleOverlay | undefined,
  postures: TypeRolePostures
): Record<string, string> {
  const vars: Record<string, string> = {};
  const authoredLabelCase: "uppercase" | "capitalize" | "none" | undefined =
    bt.typography?.labelStyle === undefined
      ? undefined
      : bt.typography.labelStyle === "uppercase"
      ? "uppercase"
      : bt.typography.labelStyle === "capitalize"
      ? "capitalize"
      : "none";
  const withLabelCase =
    authoredLabelCase === undefined
      ? bt.typography?.roles
      : {
          ...bt.typography?.roles,
          label: {
            textTransform: authoredLabelCase,
            ...omitUndefined(bt.typography?.roles?.label),
          },
        };
  const authoredRoles = foldPosture(
    foldPosture(withLabelCase, postures.numeric),
    postures.weights
  );
  setSemanticTypographyVariables(vars, authoredRoles, typeRoleOverlay);
  return vars;
}
