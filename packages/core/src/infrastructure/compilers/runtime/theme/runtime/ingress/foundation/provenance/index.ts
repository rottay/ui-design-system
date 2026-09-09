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
import {
  buttonStyleRadius,
  typePairingToTypography,
} from "@/infrastructure/compilers/kernel/foundation/css/appearance-posture";

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
 * One spelling of a catalog keypath, and the brace member that produced it.
 *
 * The member is what makes per-MEMBER attribution possible: a record decision
 * owns the leaves of the members it names and no others, so
 * `typography.families: { base }` cannot claim the heading a pairing wrote.
 */
interface KeypathSpelling {
  readonly leaf: string;
  readonly member: string | null;
}

/**
 * The BrandTheme leaves a decision NAMES, expanded from the one keypath column
 * the catalog owns. A row with no BrandTheme keypath names none: it is a kit
 * row with no authoring surface yet, not a row that claims everything.
 */
const NAMED_SPELLINGS: ReadonlyMap<ThemeDecisionId, readonly KeypathSpelling[]> =
  new Map(
    THEME_CONTROL_CATALOG.map((row) => [
      row.id,
      row.keypath.brandTheme === null
        ? []
        : expandKeypath(row.keypath.brandTheme),
    ])
  );

function expandKeypath(keypath: string): readonly KeypathSpelling[] {
  const brace = /^(.*)\{([^}]*)\}(.*)$/.exec(keypath);
  if (!brace) return [{ leaf: trimWildcard(keypath), member: null }];
  return brace[2].split(",").map((raw) => {
    const member = raw.trim();
    return {
      leaf: trimWildcard(`${brace[1]}${member}${brace[3]}`),
      member,
    };
  });
}

function trimWildcard(path: string): string {
  return path.endsWith(".*") ? path.slice(0, -2) : path;
}

function isRecordValue(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** Case and separator insensitive, so `base` recognizes `fontFamilyBase`. */
function normalizeMember(member: string): string {
  return member.toLowerCase().replace(/[^a-z0-9]/gu, "");
}

/**
 * The leaves a decision names GIVEN what it authored.
 *
 * A record decision reaches only the members it carries: claiming the whole
 * brace list gave `typography.families: { base }` the heading, mono and
 * display leaves it never named, which then displaced the pairing that really
 * wrote them (I-P3a). A member the catalog spells differently is matched by
 * name rather than by position, because the two lists agree on neither order
 * nor length; an ambiguous match is refused rather than guessed.
 */
function namedLeaves(
  id: ThemeDecisionId,
  authoredValue: unknown
): readonly string[] {
  const spellings = NAMED_SPELLINGS.get(id) ?? [];
  const braced = spellings.filter((spelling) => spelling.member !== null);
  if (braced.length === 0 || !isRecordValue(authoredValue)) {
    return spellings.map((spelling) => spelling.leaf);
  }
  const claimed: string[] = [];
  for (const [member, value] of Object.entries(authoredValue)) {
    if (value === undefined) continue;
    const matches = braced.filter((spelling) =>
      normalizeMember(spelling.member as string).includes(normalizeMember(member))
    );
    if (matches.length > 1) {
      throw new Error(
        `documentProvenanceLedger: member "${member}" of "${id}" matches ` +
          `${matches.map((match) => JSON.stringify(match.leaf)).join(", ")}; ` +
          "a record member owns exactly one keypath"
      );
    }
    if (matches.length === 1) claimed.push(matches[0].leaf);
  }
  return [...new Set(claimed)];
}

/**
 * The leaves a decision reaches by EXPANSION rather than by name (I-P0), read
 * from the lowering that performs the expansion instead of from a second table.
 *
 * A pairing lowers to font families, the heading letter-spacing and the display
 * line-height through `typePairingToTypography`, and it tunes mono only where
 * the preset does; a button style lowers to the control geometry radius through
 * `buttonStyleRadius`. Both are value-dependent for that reason. They are
 * listed as expansion-derived so a selection NAMING the same leaf outranks them
 * within the same provenance class (I-P5) while both tiers are still judged
 * separately.
 */
function expansionLeaves(
  id: ThemeDecisionId,
  authoredValue: unknown
): readonly string[] {
  if (id === "typography.pairing") {
    return flattenLeaves(
      typePairingToTypography(
        authoredValue as Parameters<typeof typePairingToTypography>[0]
      ),
      "typography"
    );
  }
  if (id === "shape.button-style") {
    return buttonStyleRadius(
      authoredValue as Parameters<typeof buttonStyleRadius>[0]
    ) === undefined
      ? []
      : ["chrome.controls.buttonGeometry.radius"];
  }
  return [];
}

function flattenLeaves(value: unknown, trail: string): readonly string[] {
  if (value === undefined) return [];
  if (!isRecordValue(value)) return [trail];
  return Object.entries(value).flatMap(([key, child]) =>
    flattenLeaves(child, `${trail}.${key}`)
  );
}

function decisionClaim(
  id: ThemeDecisionId,
  authoredValue: unknown
): ThemeProvenanceClaim {
  const named = namedLeaves(id, authoredValue);
  const derived = expansionLeaves(id, authoredValue);
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
