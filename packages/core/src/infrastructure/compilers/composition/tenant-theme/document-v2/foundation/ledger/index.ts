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
  authoredSelectionKey,
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

interface KeypathMember {
  /** The brace member, e.g. `fontFamilyBase`; empty for a single keypath. */
  readonly member: string;
  readonly leaf: string;
}

/** The `{a,b}` members a catalog keypath states, expanded in place. */
function expandBraces(keypath: string | null): readonly KeypathMember[] {
  if (keypath === null) return [];
  const brace = keypath.match(/^(.*)\{([^}]*)\}(.*)$/);
  if (!brace) return [{ member: "", leaf: keypath }];
  return brace[2].split(",").map((raw) => {
    const member = raw.trim();
    return { member, leaf: `${brace[1]}${member}${brace[3]}` };
  });
}

function brandThemeMembers(id: ThemeDecisionId): readonly KeypathMember[] {
  return expandBraces(themeControl(id).keypath.brandTheme);
}

/**
 * The members a v1 document can carry for a row, or `null` when the row states
 * a single keypath. `typography.families` registers four font roles and the v1
 * transport writes two of them: the other two are unlit, so they own no leaf.
 */
function documentMembers(id: ThemeDecisionId): readonly string[] | null {
  const members = expandBraces(themeControl(id).keypath.document);
  return members.length > 1 ? members.map((entry) => entry.member) : null;
}

/**
 * Whether an authored record key names a brace member. The two spellings the
 * kit uses are the member itself (`motion.{intensity}`) and a role the member
 * is built around (`base` in `typography.{fontFamilyBase}`, `primary` in
 * `palette.{primaryColor}`).
 */
function namesMember(key: string, member: string): boolean {
  const lower = key.toLowerCase();
  const candidate = member.toLowerCase();
  return (
    candidate === lower ||
    candidate.endsWith(lower) ||
    candidate.startsWith(lower)
  );
}

/**
 * The leaves one authored selection NAMES.
 *
 * A record decision that names two of its four members owns two leaves, not
 * four: claiming the whole row would let a partly authored dial swallow the
 * profile default that filled the rest of it, and would let one authored font
 * role swallow the three the tenant never mentioned.
 */
function namedLeaves(id: ThemeDecisionId, value: unknown): readonly string[] {
  const members = brandThemeMembers(id);
  if (
    members.length < 2 ||
    typeof value !== "object" ||
    value === null ||
    Array.isArray(value)
  ) {
    return members.map((entry) => entry.leaf);
  }
  const writable = documentMembers(id);
  const named: string[] = [];
  let matched = false;
  for (const [key, authored] of Object.entries(value as Record<string, unknown>)) {
    if (authored === undefined) continue;
    const hit = members.find(({ member }) => namesMember(key, member));
    if (!hit) continue;
    matched = true;
    if (writable && !writable.some((member) => namesMember(key, member))) continue;
    if (!named.includes(hit.leaf)) named.push(hit.leaf);
  }
  // A record whose keys name no member is a shape this owner cannot read; the
  // row is claimed whole rather than silently left unowned.
  return matched ? named : members.map((entry) => entry.leaf);
}

/**
 * Selections whose value the v1 migration EXPANDS into leaves another row
 * names. The pairing is the one: `typePairingToTypography` writes the font
 * families a pairing implies, and the catalog states them as the channels the
 * pairing produces rather than as its keypath.
 */
const EXPANDING_DECISIONS: readonly ThemeDecisionId[] = ["typography.pairing"];

/** `--ds-font-family-base` and `typography.fontFamilyBase` are one name. */
function channelKey(name: string): string {
  return name.replace(/^--ds-/, "").replace(/-/g, "").toLowerCase();
}

const LEAF_BY_CHANNEL_KEY: ReadonlyMap<string, string> = new Map(
  THEME_DECISION_IDS.flatMap((id) =>
    brandThemeMembers(id).map(({ member, leaf }): [string, string] => [
      channelKey(member || leaf.slice(leaf.lastIndexOf(".") + 1)),
      leaf,
    ])
  )
);

function expansionLeaves(id: ThemeDecisionId): readonly string[] {
  if (!EXPANDING_DECISIONS.includes(id)) return [];
  const leaves: string[] = [];
  for (const channel of themeControl(id).produces.channels) {
    const leaf = LEAF_BY_CHANNEL_KEY.get(channelKey(channel));
    if (leaf && !leaves.includes(leaf)) leaves.push(leaf);
  }
  return leaves;
}

/**
 * A claim, plus the leaves its value expands into.
 *
 * The expansion is `expansion-derived` on purpose: it is a default INSIDE the
 * claim's own class, so a selection that NAMES the same leaf wins it under
 * I-P5 while the expanding selection keeps everything nobody named. A claim
 * that lit no leaf expands into none -- there was no value to expand.
 */
function withExpansion(
  claim: DecisionProvenanceClaim<ThemeDecisionId>
): DecisionProvenanceClaim<ThemeDecisionId> {
  if (claim.ref.kind !== "decision" || claim.leaves.length === 0) return claim;
  const extra = expansionLeaves(claim.ref.id).filter(
    (leaf) => !claim.leaves.some((entry) => entry.leaf === leaf)
  );
  if (extra.length === 0) return claim;
  return {
    ...claim,
    leaves: [
      ...claim.leaves,
      ...extra.map((leaf) => ({
        leaf,
        specificity: "expansion-derived" as const,
      })),
    ],
  };
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
 * The v2 transport path of one member of a decision row.
 *
 * A raw selection is captured ONCE, so the row's decision identity belongs to
 * the tenant's own selection; a member the tenant left empty is located by
 * where it sits in the document instead.
 */
function memberPath(id: ThemeDecisionId, leaf: string): string {
  return `decisions[${JSON.stringify(id)}].${leaf.slice(
    leaf.lastIndexOf(".") + 1
  )}`;
}

/**
 * Split a profile default off the decision identity the tenant already holds.
 *
 * One entry carries ONE provenance, so a row authored in part and filled for
 * the rest cannot be merged: the merged entry would report the profile's
 * members as the tenant's own (I-P0, I-T4). Each filled member becomes its own
 * path-keyed, tier-less claim, which is what a value nobody decided is.
 */
function splitDerivedClaim(
  claim: DecisionProvenanceClaim<ThemeDecisionId>
): readonly DecisionProvenanceClaim<ThemeDecisionId>[] {
  if (claim.ref.kind !== "decision") return [claim];
  const { id } = claim.ref;
  const authored = claim.authoredValue;
  return claim.leaves.map((leaf) => {
    const member = leaf.leaf.slice(leaf.leaf.lastIndexOf(".") + 1);
    return {
      ref: { kind: "sanctioned-override" as const, path: memberPath(id, leaf.leaf) },
      provenance: claim.provenance,
      authoredValue:
        typeof authored === "object" && authored !== null && !Array.isArray(authored)
          ? (authored as Record<string, unknown>)[member]
          : authored,
      leaves: [leaf],
    };
  });
}

/**
 * Add the profile's defaults to the selections the tenant already authored.
 *
 * A default whose row the tenant never touched keeps that row's identity, so
 * the ledger still reports WHICH decision the profile filled. A default that
 * lands on a row the tenant authored in part is split instead: the tenant keeps
 * the decision, and each member the profile supplied keeps `profile-derived`.
 */
function foldClaims(
  authored: readonly DecisionProvenanceClaim<ThemeDecisionId>[],
  derived: readonly DecisionProvenanceClaim<ThemeDecisionId>[]
): readonly DecisionProvenanceClaim<ThemeDecisionId>[] {
  const held = new Set(authored.map((claim) => authoredSelectionKey(claim.ref)));
  return [
    ...authored,
    ...derived.flatMap((claim) =>
      held.has(authoredSelectionKey(claim.ref)) ? splitDerivedClaim(claim) : [claim]
    ),
  ];
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
  /**
   * What the profile expansion filled, as `profile-derived` claims. Supplied by
   * the publish terminal that ran the station, not by the door: the door reports
   * what the tenant DECIDED, and a profile default is not one of those.
   */
  profileClaims: readonly DecisionProvenanceClaim<ThemeDecisionId>[];
}): DecisionProvenanceLedger<ThemeDecisionId, ThemeDecisionTier> {
  const decisions = input.document.decisions as Partial<
    Record<ThemeDecisionId, unknown>
  >;
  const authored: DecisionProvenanceClaim<ThemeDecisionId>[] =
    input.admission.decisions.map((projection) => ({
      ref: { kind: "decision", id: projection.id },
      provenance: "direct-override",
      authoredValue: decisions[projection.id],
      leaves: (projection.lit
        ? namedLeaves(projection.id, decisions[projection.id])
        : []
      ).map((leaf) => ({ leaf, specificity: "named" as const })),
    }));
  const claims = foldClaims(
    [...authored, ...overrideClaims(input.document)],
    input.profileClaims
  ).map(withExpansion);
  return resolveDecisionProvenanceLedger(
    claims,
    CATALOG,
    "compileTenantThemeDocumentV2"
  );
}
