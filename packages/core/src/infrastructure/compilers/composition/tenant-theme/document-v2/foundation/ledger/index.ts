/**
 * @fileoverview The v2 publication ledger: which raw selection owns which
 * effective leaf, for the document the adapter is about to publish.
 *
 * It DERIVES nothing the door has not already answered. The decisions come from
 * the admission report the door emits (`DecisionProjection`), the sanctioned
 * overrides from the document's own transport paths, and the profile defaults
 * from the expansion station -- three sources, each the owner of its own class,
 * assembled once by `resolveDecisionProvenanceLedger` so the leaf a selection
 * ends up owning is the causal winner rather than the last writer.
 *
 * @module Compilers/TenantTheme/DocumentV2/Foundation/Ledger
 * @category Compilers
 * @package @rottay/design-system
 */

import {
  THEME_DECISION_IDS,
  THEME_DECISION_TIER_BY_ID,
  type ThemeDecisionId,
  type ThemeDecisionTier,
} from "@/contracts/theme/foundation/decisions";
import type { TenantThemeDocumentV2 } from "@/contracts/theme/presentation/document";
import { themeControl } from "@/contracts/theme/runtime/catalog";
import {
  resolveDecisionProvenanceLedger,
  type DecisionProvenanceCatalog,
  type DecisionProvenanceClaim,
  type DecisionProvenanceLedger,
} from "@/foundation/contracts/composition/tenants/themes/provenance";
import type { DocumentAdmission } from "@/infrastructure/compilers/runtime/theme";

/**
 * The admitted decision domain, bound at this trusted boundary. A caller that
 * could hand in the catalog could hand in the tier every entry is judged
 * against, which is the one thing the ledger's tier rule exists to refuse.
 */
const CATALOG: DecisionProvenanceCatalog<ThemeDecisionId, ThemeDecisionTier> =
  Object.freeze({
    ids: THEME_DECISION_IDS,
    tierById: THEME_DECISION_TIER_BY_ID,
  });

/** The Theme-space leaves a catalog row states, one per `{a,b}` member. */
function brandThemeLeaves(id: ThemeDecisionId): readonly string[] {
  const keypath = themeControl(id).keypath.brandTheme;
  if (keypath === null) return [];
  const brace = keypath.match(/^(.*)\{([^}]*)\}(.*)$/);
  return brace
    ? brace[2]
        .split(",")
        .map((member) => `${brace[1]}${member.trim()}${brace[3]}`)
    : [keypath];
}

/**
 * The leaves one authored decision actually owns.
 *
 * A record decision that names two of its four members owns two leaves, not
 * four: claiming the whole row would let a partly authored dial swallow the
 * profile default that filled the rest of it.
 */
function authoredLeaves(id: ThemeDecisionId, value: unknown): readonly string[] {
  const leaves = brandThemeLeaves(id);
  if (
    leaves.length < 2 ||
    typeof value !== "object" ||
    value === null ||
    Array.isArray(value)
  ) {
    return leaves;
  }
  const members = new Set(Object.keys(value as Record<string, unknown>));
  const named = leaves.filter((leaf) =>
    members.has(leaf.slice(leaf.lastIndexOf(".") + 1))
  );
  return named.length > 0 ? named : leaves;
}

/** Every `overrides.chrome.<family>.<channel>` the document carries. */
function overrideClaims(
  document: TenantThemeDocumentV2
): readonly DecisionProvenanceClaim<ThemeDecisionId>[] {
  const chrome = document.overrides?.chrome;
  if (!chrome) return [];
  return Object.entries(chrome).flatMap(([family, channels]) =>
    Object.entries(channels as Record<string, unknown>).map(
      ([channel, value]) => ({
        ref: {
          kind: "sanctioned-override" as const,
          path: `overrides.chrome.${family}.${channel}`,
        },
        provenance: "direct-override" as const,
        authoredValue: value,
        leaves: [
          {
            leaf: `chrome.${family}.${channel}`,
            specificity: "named" as const,
          },
        ],
      })
    )
  );
}

/**
 * The ledger for one admitted v2 document.
 *
 * Every activated decision becomes an entry even when the door reported it
 * unlit: a decision that moves no keypath today is still a decision the tenant
 * made, its tier was still judged, and dropping it would make the ledger a
 * report of what the compiler happens to implement rather than of what the
 * tenant authored.
 */
export function documentV2Ledger(input: {
  document: TenantThemeDocumentV2;
  admission: DocumentAdmission;
}): DecisionProvenanceLedger<ThemeDecisionId, ThemeDecisionTier> {
  const decisions = input.document.decisions as Partial<
    Record<ThemeDecisionId, unknown>
  >;
  const decided: DecisionProvenanceClaim<ThemeDecisionId>[] =
    input.admission.decisions.map((projection) => ({
      ref: { kind: "decision", id: projection.id },
      provenance: "direct-override",
      authoredValue: decisions[projection.id],
      leaves: (projection.lit
        ? authoredLeaves(projection.id, decisions[projection.id])
        : []
      ).map((leaf) => ({ leaf, specificity: "named" as const })),
    }));
  return resolveDecisionProvenanceLedger(
    [...decided, ...overrideClaims(input.document), ...input.admission.profileClaims],
    CATALOG,
    "compileTenantThemeDocumentV2"
  );
}
