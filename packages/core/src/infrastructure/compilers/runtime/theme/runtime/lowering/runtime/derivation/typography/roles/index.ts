/**
 * @fileoverview Typography sub-owner: the nine semantic roles.
 *
 * @module Compilers/Theme/Lowering/Runtime/derivation/typography/roles
 * @category Compilers
 * @package @rottay/design-system
 */

import type { BrandTheme } from "@/foundation/contracts/composition/tenants/themes";
import type {
  SemanticTypographyRole,
  SemanticTypographyTokens,
} from "@/foundation/contracts/kernel/tokens/typography";
import type { ExpressiveTypeRoleOverlay } from "@/foundation/tokens/ts/presentation/expressive-profiles/expansion";
import { omitUndefined } from "../../../../foundation/shape";
import { setSemanticTypographyVariables } from "../../../../foundation/typography";
import { NUMERIC_POSTURE } from "../numeric";

/** Per-facet merge: the right-hand role wins facet by facet, never wholesale. */
function mergeRoles(
  under: SemanticTypographyTokens | undefined,
  over: SemanticTypographyTokens | undefined
): SemanticTypographyTokens | undefined {
  if (!under) return over;
  if (!over) return under;
  const merged: SemanticTypographyTokens = { ...under };
  for (const key of Object.keys(over) as SemanticTypographyRole[]) {
    merged[key] = { ...under[key], ...omitUndefined(over[key]) };
  }
  return merged;
}

/**
 * The nine roles a component binds instead of a size/weight/tracking triple.
 *
 * `labelStyle` is an AUTHORED case decision and belongs in the authored layer
 * of the single role emitter, above any expressive profile overlay: it used to
 * feed personality only, which let the label role channel silently ignore it.
 * The finer `typography.roles.label` surface still wins over this mapping when
 * both are authored.
 */
export function deriveTypeRoleChannels(
  bt: BrandTheme,
  typeRoleOverlay: ExpressiveTypeRoleOverlay | undefined
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
  setSemanticTypographyVariables(
    vars,
    mergeRoles(NUMERIC_POSTURE, authoredRoles),
    typeRoleOverlay
  );
  return vars;
}
