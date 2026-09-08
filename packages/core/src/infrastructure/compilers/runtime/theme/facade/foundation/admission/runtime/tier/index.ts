/**
 * @fileoverview Admission: the plan decides which decisions a tenant may move.
 *
 * `tier` was decorative before WO-CAT-03 (F-03): the catalog carried it, the
 * document carried a plan, and nothing compared them, so a `standard` tenant
 * could activate a `pro` decision and see it painted. The comparison happens
 * here, once, over the authored paths the resolution already collects -- so
 * `previewThemeIntent` and `documentThemeIntent` refuse the same document with
 * the same error.
 *
 * @module Compilers/Theme/Facade/Foundation/Admission/Runtime/Tier
 * @category Compilers
 * @package @rottay/design-system
 */

import type { PlanEntitlement } from "@/foundation/contracts/composition/tenants/themes/intent";
import { THEME_PLAN_TIERS } from "@/contracts/theme/foundation/decisions";
import type { ThemeDecisionId } from "@/contracts/theme/foundation/decisions";
import { THEME_CONTROL_CATALOG } from "@/contracts/theme/runtime/catalog";
import { authoringPrefixes } from "../../../../../presentation/adapters";
import { authoredUnderPrefix } from "../../foundation/authorship";
import type { ThemeAdmissionIssue } from "../../foundation/issues";

/**
 * Every catalog row that declares a BrandTheme keypath, with that keypath
 * expanded into the concrete prefixes an authored path can match.
 *
 * Rows whose `keypath.brandTheme` is `null` are the kit's not-yet-derived
 * decisions: they have no authoring surface in Theme space at all, so no
 * authored path can activate them and no tier question arises. They are
 * refused by the document contract long before this, by name.
 */
const TIERED_PREFIXES: readonly (readonly [
  ThemeDecisionId,
  readonly string[],
])[] = THEME_CONTROL_CATALOG.flatMap((row) =>
  row.keypath.brandTheme === null
    ? []
    : [[row.id, authoringPrefixes(row.keypath.brandTheme)] as const]
);

/**
 * The catalog decisions this tenant's own patch activated.
 *
 * Keyed on the CATALOG's keypath rather than on a second table: the catalog is
 * the only list of what a tenant can decide, so the only question that can be
 * asked here is which of ITS rows an authored path belongs to.
 */
export function decisionsActivatedBy(
  authoredLeaves: ReadonlySet<string>
): readonly ThemeDecisionId[] {
  const activated: ThemeDecisionId[] = [];
  for (const [id, prefixes] of TIERED_PREFIXES) {
    if (authoredUnderPrefix(authoredLeaves, prefixes)) activated.push(id);
  }
  return activated;
}

/**
 * The activated decisions this plan does not entitle.
 *
 * An intent with NO entitlement is not tier-checked, and that is deliberate:
 * D-02 says a defaulted plan is an entitlement nobody granted, so the door
 * refuses to invent one. A v2 document always carries its plan, and the intent
 * producers put it on the intent, so every document-shaped origin is checked.
 */
export function decisionsAboveTier(
  authoredLeaves: ReadonlySet<string>,
  entitlement: PlanEntitlement | undefined
): readonly ThemeDecisionId[] {
  if (!entitlement) return [];
  const entitled = new Set<string>(THEME_PLAN_TIERS[entitlement.plan] ?? []);
  return decisionsActivatedBy(authoredLeaves).filter((id) => {
    const row = THEME_CONTROL_CATALOG.find((candidate) => candidate.id === id);
    return row !== undefined && !entitled.has(row.tier);
  });
}

/** Refuse an activation the plan does not entitle, by decision name. */
export function tierIssues(
  authoredLeaves: ReadonlySet<string>,
  entitlement: PlanEntitlement | undefined
): ThemeAdmissionIssue[] {
  if (!entitlement) return [];
  const refused = decisionsAboveTier(authoredLeaves, entitlement);
  return refused.map((id): ThemeAdmissionIssue => {
    const row = THEME_CONTROL_CATALOG.find((candidate) => candidate.id === id);
    return {
      code: "invalid_value",
      path: `$.decisions[${JSON.stringify(id)}]`,
      message:
        `Decision "${id}" is tier "${row?.tier ?? "pro"}" and the "${entitlement.plan}" plan ` +
        `entitles ${(THEME_PLAN_TIERS[entitlement.plan] ?? [])
          .map((tier) => `"${tier}"`)
          .join(", ")}. Unset it, or upgrade the plan.`,
    };
  });
}
