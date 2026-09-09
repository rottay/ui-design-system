/**
 * @fileoverview Admission: the plan decides which decisions a tenant may move.
 *
 * `tier` was decorative before WO-CAT-03 (F-03): the catalog carried it, the
 * document carried a plan, and nothing compared them, so a `standard` tenant
 * could activate a `pro` decision and see it painted. The comparison happens
 * here, once, so `previewThemeIntent` and `documentThemeIntent` refuse the same
 * document with the same error.
 *
 * IT JUDGES SELECTIONS, NOT LEAVES. The first version of this station re-read
 * the decisions off the merged patch's authored leaves, which cannot tell a
 * font leaf a Pro `typography.families` NAMED from the same leaf a Standard
 * `typography.pairing` expanded into -- so every legal Standard pairing was
 * refused as Pro font authorship (RA01). The owner's law is that the plan
 * limits EDITING, not where an authorized edit propagates, and a leaf cannot
 * carry that distinction. The gate's ledger can, and does: only its
 * `direct-override` entries are judged, each at the tier the catalog gave it
 * when it was captured.
 *
 * @module Compilers/Theme/Facade/Foundation/Admission/Runtime/Tier
 * @category Compilers
 * @package @rottay/design-system
 */

import type { PlanEntitlement } from "@/foundation/contracts/composition/tenants/themes/intent";
import {
  directOverrideEntries,
  type DecisionProvenanceEntry,
  type DecisionProvenanceLedger,
} from "@/foundation/contracts/composition/tenants/themes/provenance";
import { THEME_PLAN_TIERS } from "@/contracts/theme/foundation/decisions";
import type { ThemeDecisionId } from "@/contracts/theme/foundation/decisions";
import type { ThemeAdmissionIssue } from "../../foundation/issues";

/** The tenant's own selections, as the gate recorded them. */
export type ThemeAdmissionLedger = DecisionProvenanceLedger;

/**
 * The decisions this tenant authored DIRECTLY, in capture order.
 *
 * A sanctioned override is not one of them: it carries no catalog tier and its
 * Pro gate is `assertOverrideEntitlement`, applied by the document contract.
 * A profile-derived default is not one either -- expansion never creates
 * authorship (I-T4).
 */
export function decisionsAuthoredBy(
  ledger: ThemeAdmissionLedger | undefined
): readonly ThemeDecisionId[] {
  if (!ledger) return [];
  return directOverrideEntries(ledger)
    .filter((entry) => entry.ref.kind === "decision")
    .map((entry) => (entry.ref as { id: ThemeDecisionId }).id);
}

function isAboveTier(
  entry: DecisionProvenanceEntry,
  entitled: ReadonlySet<string>
): boolean {
  return (
    entry.ref.kind === "decision" &&
    entry.tier !== null &&
    !entitled.has(entry.tier)
  );
}

/**
 * The directly authored decisions this plan does not entitle.
 *
 * An intent with NO entitlement is not tier-checked, and that is deliberate:
 * D-02 says a defaulted plan is an entitlement nobody granted, so the door
 * refuses to invent one. A v2 document always carries its plan, and the intent
 * producers put it on the intent, so every document-shaped origin is checked.
 */
export function decisionsAboveTier(
  ledger: ThemeAdmissionLedger | undefined,
  entitlement: PlanEntitlement | undefined
): readonly ThemeDecisionId[] {
  if (!entitlement || !ledger) return [];
  const entitled = new Set<string>(THEME_PLAN_TIERS[entitlement.plan] ?? []);
  return directOverrideEntries(ledger)
    .filter((entry) => isAboveTier(entry, entitled))
    .map((entry) => (entry.ref as { id: ThemeDecisionId }).id);
}

/** Refuse an activation the plan does not entitle, by decision name. */
export function tierIssues(
  ledger: ThemeAdmissionLedger | undefined,
  entitlement: PlanEntitlement | undefined
): ThemeAdmissionIssue[] {
  if (!entitlement) return [];
  // An entitled intent that reports no provenance cannot be judged, and the
  // one thing this station may never do is read that silence as "authored
  // nothing". A transport that names a plan names its selections too.
  if (!ledger) {
    return [
      {
        code: "invalid_value",
        path: "$.ledger",
        message:
          `An intent entitled under the "${entitlement.plan}" plan carries the ` +
          "provenance ledger its gate captured; tier is judged on authored " +
          "selections, never re-inferred from the merged patch.",
      },
    ];
  }
  const entitled = new Set<string>(THEME_PLAN_TIERS[entitlement.plan] ?? []);
  return directOverrideEntries(ledger)
    .filter((entry) => isAboveTier(entry, entitled))
    .map((entry): ThemeAdmissionIssue => {
      const id = (entry.ref as { id: ThemeDecisionId }).id;
      return {
        code: "invalid_value",
        path: `$.decisions[${JSON.stringify(id)}]`,
        message:
          `Decision "${id}" is tier "${entry.tier}" and the "${entitlement.plan}" plan ` +
          `entitles ${(THEME_PLAN_TIERS[entitlement.plan] ?? [])
            .map((tier) => `"${tier}"`)
            .join(", ")}. Unset it, or upgrade the plan.`,
      };
    });
}
