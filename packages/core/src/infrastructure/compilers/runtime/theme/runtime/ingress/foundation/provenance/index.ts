/**
 * @fileoverview Capture what a document AUTHORED, at the gate, before anything
 * projects or expands it.
 *
 * A decision and the leaves its expansion writes are indistinguishable once the
 * patch exists: `typography.fontFamilyBase` looks the same whether a Pro
 * `typography.families` named it or a Standard `typography.pairing` expanded
 * into it. Re-reading it off the patch is what refused a legal Standard pairing
 * as Pro font authorship. So the raw selection is recorded here, once, and
 * every later station reads the record instead of guessing.
 *
 * @module Compilers/Theme/Ingress/Foundation/Provenance
 * @category Compilers
 * @package @rottay/design-system
 */

import {
  resolveDecisionProvenanceLedger,
  type DecisionProvenanceCatalog,
  type DecisionProvenanceClaim,
  type DecisionProvenanceLedger,
} from "@/foundation/contracts/composition/tenants/themes/provenance";
import {
  THEME_DECISION_IDS,
  THEME_DECISION_TIER_BY_ID,
  type ThemeDecisionId,
  type ThemeDecisionTier,
} from "@/contracts/theme/foundation/decisions";
import { THEME_CONTROL_CATALOG } from "@/contracts/theme/runtime/catalog";

/** The decision domain a ledger built here is judged against. */
export const THEME_DECISION_PROVENANCE_CATALOG: DecisionProvenanceCatalog<
  ThemeDecisionId,
  ThemeDecisionTier
> = Object.freeze({
  ids: THEME_DECISION_IDS,
  tierById: THEME_DECISION_TIER_BY_ID,
});

export type ThemeProvenanceLedger = DecisionProvenanceLedger<
  ThemeDecisionId,
  ThemeDecisionTier
>;

type ThemeProvenanceClaim = DecisionProvenanceClaim<ThemeDecisionId>;

/**
 * The BrandTheme leaves a decision NAMES, expanded from the one keypath column
 * the catalog owns. A row with no BrandTheme keypath names none: it is a kit
 * row with no authoring surface yet, not a row that claims everything.
 */
const NAMED_LEAVES: ReadonlyMap<ThemeDecisionId, readonly string[]> = new Map(
  THEME_CONTROL_CATALOG.map((row) => [
    row.id,
    row.keypath.brandTheme === null ? [] : expandKeypath(row.keypath.brandTheme),
  ])
);

function expandKeypath(keypath: string): readonly string[] {
  const brace = /^(.*)\{([^}]*)\}(.*)$/.exec(keypath);
  const spellings = brace
    ? brace[2].split(",").map((member) => `${brace[1]}${member.trim()}${brace[3]}`)
    : [keypath];
  return spellings.map((path) => (path.endsWith(".*") ? path.slice(0, -2) : path));
}

/**
 * The leaves a decision reaches by EXPANSION rather than by name (I-P0).
 *
 * Both entries are the migration's own expansions, not a policy invented here:
 * a pairing lowers to the two font families through `typePairingToTypography`,
 * and a button style lowers to the control geometry radius through
 * `buttonStyleRadius`. They are listed as expansion-derived so that a selection
 * NAMING the same leaf outranks them within the same provenance class (I-P5)
 * while the tier of both selections is still judged separately.
 */
const EXPANSION_LEAVES: Partial<Record<ThemeDecisionId, readonly string[]>> =
  Object.freeze({
    "typography.pairing": [
      "typography.fontFamilyBase",
      "typography.fontFamilyHeading",
    ],
    "shape.button-style": ["chrome.controls.buttonGeometry.radius"],
  });

/**
 * Every leaf some decision reaches by expansion, flattened.
 *
 * Read by the admission's authored-caps station for the ONE transport that
 * carries no ledger: a `BrandTheme` draft states a decision and its derived
 * geometry at the same level, so `9999px` there is the DS's own pill radius
 * rather than a tenant reaching past its ceiling.
 */
export const DECISION_EXPANSION_LEAVES: ReadonlySet<string> = new Set(
  Object.values(EXPANSION_LEAVES).flat()
);

function decisionClaim(
  id: ThemeDecisionId,
  authoredValue: unknown
): ThemeProvenanceClaim {
  const named = NAMED_LEAVES.get(id) ?? [];
  const derived = EXPANSION_LEAVES[id] ?? [];
  return {
    ref: { kind: "decision", id },
    provenance: "direct-override",
    authoredValue,
    leaves: [
      ...named.map((leaf) => ({ leaf, specificity: "named" as const })),
      ...derived
        .filter((leaf) => !named.includes(leaf))
        .map((leaf) => ({ leaf, specificity: "expansion-derived" as const })),
    ],
  };
}

/**
 * One claim per authored chrome channel, recorded at its ORIGINAL transport
 * path so a refusal can point at what the author wrote.
 *
 * A sanctioned override is not a decision and gets no invented catalog id: its
 * gate is `assertOverrideEntitlement`, which the document contract already
 * applies, so its ledger tier is `null` by construction.
 */
function chromeOverrideClaims(
  chrome: unknown,
  transportPrefix: string
): ThemeProvenanceClaim[] {
  const claims: ThemeProvenanceClaim[] = [];
  const walk = (value: unknown, trail: readonly string[]): void => {
    if (value === undefined) return;
    // `anatomy` is the `chrome.anatomy` DECISION wherever it is spelled: the
    // v2 contract refuses it as an override and the v1 migration lifts it into
    // the decision. Claiming it here too would give one leaf two owners.
    if (trail[trail.length - 1] === "anatomy") return;
    if (value === null || typeof value !== "object" || Array.isArray(value)) {
      if (trail.length === 0) return;
      claims.push({
        ref: {
          kind: "sanctioned-override",
          path: [transportPrefix, ...trail].join("."),
        },
        provenance: "direct-override",
        authoredValue: value,
        leaves: [
          { leaf: ["chrome", ...trail].join("."), specificity: "named" },
        ],
      });
      return;
    }
    for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
      walk(child, [...trail, key]);
    }
  };
  walk(chrome, []);
  return claims;
}

/**
 * The ledger a document contributes, from what its OWN transport declared.
 *
 * The two documents are not read here: the caller hands in the decision map
 * its version already speaks (the v2 document's own, or the migration's answer
 * for a v1 row) and the chrome subtree at the transport path the author wrote.
 * That keeps this owner a mechanism over the claim model rather than a second
 * reader of either document shape.
 */
export function documentProvenanceLedger(input: {
  readonly decisions: Readonly<Record<string, unknown>>;
  readonly chrome: unknown;
  readonly chromeTransportPrefix: string;
}): ThemeProvenanceLedger {
  const decisions = input.decisions;
  const claims: ThemeProvenanceClaim[] = [
    ...THEME_DECISION_IDS.filter((id) => decisions[id] !== undefined).map((id) =>
      decisionClaim(id, decisions[id])
    ),
    ...chromeOverrideClaims(input.chrome, input.chromeTransportPrefix),
  ];
  return resolveDecisionProvenanceLedger(
    claims,
    THEME_DECISION_PROVENANCE_CATALOG,
    "documentProvenanceLedger"
  );
}
