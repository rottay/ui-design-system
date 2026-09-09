/**
 * The ledger's own invariants: causal attribution (I-P3a) under the two
 * precedence rules (I-P1, I-P5), transitivity by construction (I-P0),
 * retention without silent loss (I-P3c), a tier nobody can state (I-P3b),
 * and authorship that value equality cannot erase (I-P4).
 */

import { describe, expect, it } from "vitest";

import {
  THEME_DECISION_IDS,
  THEME_DECISION_TIER_BY_ID,
  type ThemeDecisionId,
  type ThemeDecisionTier,
} from "@/contracts/theme/foundation/decisions";

import {
  assertDecisionProvenanceLedger,
  authoredSelectionKey,
  catalogTierOf,
  DECISION_PROVENANCE_CLASSES,
  DECISION_PROVENANCE_PRECEDENCE,
  directOverrideEntries,
  EMPTY_DECISION_PROVENANCE_LEDGER,
  ledgerOwnerOfLeaf,
  LEAF_CLAIM_SPECIFICITIES,
  resolveDecisionProvenanceLedger,
  snapshotDecisionProvenanceLedger,
  type DecisionProvenanceCatalog,
  type DecisionProvenanceClaim,
  type DecisionProvenanceLedger,
} from "..";

/**
 * The catalog is INJECTED exactly as the resolution boundary injects it: the
 * ledger owner sits below the catalog in the theme ladder and never reads it,
 * so every assertion below has to state the canonical domain itself.
 */
const catalog: DecisionProvenanceCatalog<ThemeDecisionId, ThemeDecisionTier> =
  Object.freeze({
    ids: THEME_DECISION_IDS,
    tierById: THEME_DECISION_TIER_BY_ID,
  });

const FONT_BASE = "typography.fontFamilyBase";
const FONT_HEADING = "typography.fontFamilyHeading";

/** A Standard pairing: it NAMES its own dial and EXPANDS into the families. */
const pairingClaim = (
  value: unknown = "geometric"
): DecisionProvenanceClaim<ThemeDecisionId> => ({
  ref: { kind: "decision", id: "typography.pairing" },
  provenance: "direct-override",
  authoredValue: value,
  leaves: [
    { leaf: "typography.typePairing", specificity: "named" },
    { leaf: FONT_BASE, specificity: "expansion-derived" },
    { leaf: FONT_HEADING, specificity: "expansion-derived" },
  ],
});

/** A Pro families selection: it names the same two font leaves directly. */
const familiesClaim = (
  value: unknown = { base: "inter" }
): DecisionProvenanceClaim<ThemeDecisionId> => ({
  ref: { kind: "decision", id: "typography.families" },
  provenance: "direct-override",
  authoredValue: value,
  leaves: [
    { leaf: FONT_BASE, specificity: "named" },
    { leaf: FONT_HEADING, specificity: "named" },
  ],
});

describe("the closed vocabularies", () => {
  it("names exactly the three provenance classes, ranked without a tie", () => {
    expect([...DECISION_PROVENANCE_CLASSES]).toEqual([
      "direct-override",
      "profile-derived",
      "preset-inherited",
    ]);
    const ranks = DECISION_PROVENANCE_CLASSES.map(
      (klass) => DECISION_PROVENANCE_PRECEDENCE[klass]
    );
    expect(new Set(ranks).size).toBe(DECISION_PROVENANCE_CLASSES.length);
    expect(ranks).toEqual([...ranks].sort((a, b) => b - a));
  });

  it("names exactly the two leaf specificities", () => {
    expect([...LEAF_CLAIM_SPECIFICITIES]).toEqual(["named", "expansion-derived"]);
  });

  it("keys a decision and a sanctioned override apart", () => {
    expect(
      authoredSelectionKey({ kind: "decision", id: "typography.pairing" })
    ).toBe("decision:typography.pairing");
    expect(
      authoredSelectionKey({
        kind: "sanctioned-override",
        path: "chrome.cardComponent.radius",
      })
    ).toBe("sanctioned-override:chrome.cardComponent.radius");
  });
});

describe("I-P3b: the tier is the catalog's, never the producer's", () => {
  it("reads every decision tier from the catalog", () => {
    for (const id of THEME_DECISION_IDS) {
      expect(catalogTierOf({ kind: "decision", id }, catalog)).toBe(
        THEME_DECISION_TIER_BY_ID[id]
      );
    }
  });

  it("gives a sanctioned override no tier at all", () => {
    expect(
      catalogTierOf(
        { kind: "sanctioned-override", path: "chrome.modal.bg" },
        catalog
      )
    ).toBeNull();
  });

  it("stamps the catalog tier on the entry a claim resolves to", () => {
    const ledger = resolveDecisionProvenanceLedger([
      pairingClaim(),
      familiesClaim(),
    ], catalog);
    expect(ledger.entries.map((entry) => entry.tier)).toEqual([
      "standard",
      "pro",
    ]);
  });

  it("refuses a transported ledger whose tier is not the catalog's", () => {
    const forged = {
      entries: [
        {
          ref: { kind: "decision", id: "typography.families" },
          provenance: "direct-override",
          tier: "standard",
          authoredValue: { base: "inter" },
          effectiveLeaves: [FONT_BASE],
        },
      ],
    };
    expect(() => assertDecisionProvenanceLedger(forged, catalog)).toThrow(
      /is not the catalog tier "pro" of decision:typography\.families/u
    );
  });
});

describe("I-P3a: the owner of a leaf is the causal winner", () => {
  it("I-P5: within a class, the selection that names the leaf beats the expansion", () => {
    const ledger = resolveDecisionProvenanceLedger([
      pairingClaim(),
      familiesClaim(),
    ], catalog);
    expect(ledgerOwnerOfLeaf(ledger, FONT_BASE)?.ref).toEqual({
      kind: "decision",
      id: "typography.families",
    });
    expect(ledgerOwnerOfLeaf(ledger, FONT_HEADING)?.ref).toEqual({
      kind: "decision",
      id: "typography.families",
    });
    // The pairing keeps the leaf it named itself.
    expect(ledgerOwnerOfLeaf(ledger, "typography.typePairing")?.ref).toEqual({
      kind: "decision",
      id: "typography.pairing",
    });
  });

  it("does not depend on the order the claims were captured in", () => {
    const forward = resolveDecisionProvenanceLedger([
      pairingClaim(),
      familiesClaim(),
    ], catalog);
    const reversed = resolveDecisionProvenanceLedger([
      familiesClaim(),
      pairingClaim(),
    ], catalog);
    expect(ledgerOwnerOfLeaf(reversed, FONT_BASE)?.ref).toEqual(
      ledgerOwnerOfLeaf(forward, FONT_BASE)?.ref
    );
  });

  it("I-P1: a profile default outranks the vertical baseline, without exception", () => {
    const ledger = resolveDecisionProvenanceLedger([
      {
        ref: { kind: "decision", id: "motion.dial" },
        provenance: "preset-inherited",
        authoredValue: 1,
        leaves: [{ leaf: "motion.intensity", specificity: "named" }],
      },
      {
        ref: { kind: "decision", id: "experience.profile" },
        provenance: "profile-derived",
        authoredValue: "rottay/management-editorial@1",
        leaves: [{ leaf: "motion.intensity", specificity: "expansion-derived" }],
      },
    ], catalog);
    expect(ledgerOwnerOfLeaf(ledger, "motion.intensity")?.provenance).toBe(
      "profile-derived"
    );
  });

  it("I-P1: a direct override outranks a profile default on the same leaf", () => {
    const ledger = resolveDecisionProvenanceLedger([
      {
        ref: { kind: "decision", id: "motion.dial" },
        provenance: "profile-derived",
        authoredValue: 0.7,
        leaves: [{ leaf: "motion.intensity", specificity: "named" }],
      },
      {
        ref: { kind: "sanctioned-override", path: "motion.intensity" },
        provenance: "direct-override",
        authoredValue: 0.4,
        leaves: [{ leaf: "motion.intensity", specificity: "named" }],
      },
    ], catalog);
    const owner = ledgerOwnerOfLeaf(ledger, "motion.intensity");
    expect(owner?.ref).toEqual({
      kind: "sanctioned-override",
      path: "motion.intensity",
    });
    expect(owner?.tier).toBeNull();
  });

  it("refuses a tie both rules leave open rather than inventing a winner", () => {
    expect(() =>
      resolveDecisionProvenanceLedger([
        familiesClaim(),
        {
          ref: { kind: "sanctioned-override", path: "typography.fontFamilyBase" },
          provenance: "direct-override",
          authoredValue: "inter",
          leaves: [{ leaf: FONT_BASE, specificity: "named" }],
        },
      ], catalog)
    ).toThrow(/precedence cannot name a winner/u);
  });

  it("I-P3d: no leaf is ever owned twice", () => {
    const ledger = resolveDecisionProvenanceLedger([
      pairingClaim(),
      familiesClaim(),
    ], catalog);
    const owned = ledger.entries.flatMap((entry) => [...entry.effectiveLeaves]);
    expect(new Set(owned).size).toBe(owned.length);
    expect(() => assertDecisionProvenanceLedger(ledger, catalog)).not.toThrow();
  });
});

describe("I-P0: a class travels with its cause and can never be raised", () => {
  it("keeps the expanded font leaves at the class of the selection that caused them", () => {
    const ledger = resolveDecisionProvenanceLedger([
      {
        ...pairingClaim(),
        provenance: "profile-derived",
      },
    ], catalog);
    const entry = ledgerOwnerOfLeaf(ledger, FONT_BASE);
    expect(entry?.provenance).toBe("profile-derived");
    expect(directOverrideEntries(ledger)).toEqual([]);
  });

  it("keeps them direct when the tenant authored the pairing", () => {
    const ledger = resolveDecisionProvenanceLedger([pairingClaim()], catalog);
    expect(ledgerOwnerOfLeaf(ledger, FONT_BASE)?.provenance).toBe(
      "direct-override"
    );
    expect(directOverrideEntries(ledger)).toHaveLength(1);
  });
});

describe("I-P3c / I-P4: nothing is lost, and equality is not a reason to lose it", () => {
  it("retains a displaced selection with no effective leaves", () => {
    const ledger = resolveDecisionProvenanceLedger([
      {
        ref: { kind: "decision", id: "typography.pairing" },
        provenance: "direct-override",
        authoredValue: "geometric",
        leaves: [
          { leaf: FONT_BASE, specificity: "expansion-derived" },
          { leaf: FONT_HEADING, specificity: "expansion-derived" },
        ],
      },
      familiesClaim(),
    ], catalog);
    expect(ledger.entries).toHaveLength(2);
    const pairing = ledger.entries[0];
    expect(pairing.effectiveLeaves).toEqual([]);
    expect(pairing.tier).toBe("standard");
    expect(pairing.authoredValue).toBe("geometric");
  });

  it("retains an authored selection whose value equals the one that displaced it", () => {
    const sameValue = { base: "inter" };
    const ledger = resolveDecisionProvenanceLedger([
      pairingClaim(sameValue),
      familiesClaim(sameValue),
    ], catalog);
    expect(ledger.entries).toHaveLength(2);
    expect(ledger.entries.map((entry) => entry.authoredValue)).toEqual([
      sameValue,
      sameValue,
    ]);
    expect(directOverrideEntries(ledger)).toHaveLength(2);
  });

  it("keeps a selection that claimed no leaf at all", () => {
    const ledger = resolveDecisionProvenanceLedger([
      {
        ref: { kind: "decision", id: "experience.profile" },
        provenance: "direct-override",
        authoredValue: "rottay/management-editorial@1",
        leaves: [],
      },
    ], catalog);
    expect(ledger.entries).toHaveLength(1);
    expect(ledger.entries[0].effectiveLeaves).toEqual([]);
  });
});

describe("malformed input is refused by name", () => {
  const cases: [string, unknown, RegExp][] = [
    ["a non-object", [], /must be an object/u],
    ["an envelope with a second key", { entries: [], extra: 1 }, /unknown key\(s\) "extra"/u],
    ["a missing entries list", {}, /entries must be an own property/u],
    ["entries that are not a list", { entries: {} }, /entries: must be an array/u],
    [
      "an entry missing a declared field",
      {
        entries: [
          {
            ref: { kind: "decision", id: "typography.pairing" },
            provenance: "direct-override",
            tier: "standard",
          },
        ],
      },
      /entries\[0\]: authoredValue must be an own property/u,
    ],
    [
      "an unknown ref kind",
      {
        entries: [
          {
            ref: { kind: "guess", id: "typography.pairing" },
            provenance: "direct-override",
            tier: "standard",
            authoredValue: "geometric",
            effectiveLeaves: [],
          },
        ],
      },
      /unknown ref kind "guess"/u,
    ],
    [
      "a decision id outside the catalog",
      {
        entries: [
          {
            ref: { kind: "decision", id: "typography.invented" },
            provenance: "direct-override",
            tier: "standard",
            authoredValue: 1,
            effectiveLeaves: [],
          },
        ],
      },
      /unknown decision id "typography\.invented"/u,
    ],
    [
      "a sanctioned override with no path",
      {
        entries: [
          {
            ref: { kind: "sanctioned-override", path: "" },
            provenance: "direct-override",
            tier: null,
            authoredValue: "8px",
            effectiveLeaves: [],
          },
        ],
      },
      /non-empty transport path/u,
    ],
    [
      "an unknown provenance class",
      {
        entries: [
          {
            ref: { kind: "decision", id: "typography.pairing" },
            provenance: "inherited-ish",
            tier: "standard",
            authoredValue: "geometric",
            effectiveLeaves: [],
          },
        ],
      },
      /unknown provenance "inherited-ish"/u,
    ],
    [
      "a leaf that is not a keypath",
      {
        entries: [
          {
            ref: { kind: "decision", id: "typography.pairing" },
            provenance: "direct-override",
            tier: "standard",
            authoredValue: "geometric",
            effectiveLeaves: [42],
          },
        ],
      },
      /a leaf is a non-empty keypath; got 42/u,
    ],
    [
      "the same raw selection captured twice",
      {
        entries: [
          {
            ref: { kind: "decision", id: "typography.pairing" },
            provenance: "direct-override",
            tier: "standard",
            authoredValue: "geometric",
            effectiveLeaves: [],
          },
          {
            ref: { kind: "decision", id: "typography.pairing" },
            provenance: "direct-override",
            tier: "standard",
            authoredValue: "humanist",
            effectiveLeaves: [],
          },
        ],
      },
      /decision:typography\.pairing is already captured at entries\[0\]/u,
    ],
    [
      "two owners of one effective leaf",
      {
        entries: [
          {
            ref: { kind: "decision", id: "typography.pairing" },
            provenance: "direct-override",
            tier: "standard",
            authoredValue: "geometric",
            effectiveLeaves: [FONT_BASE],
          },
          {
            ref: { kind: "decision", id: "typography.families" },
            provenance: "direct-override",
            tier: "pro",
            authoredValue: { base: "inter" },
            effectiveLeaves: [FONT_BASE],
          },
        ],
      },
      /is owned by both entries\[0\] and entries\[1\]/u,
    ],
  ];

  it.each(cases)("refuses %s", (_label, value, message) => {
    expect(() => assertDecisionProvenanceLedger(value, catalog)).toThrow(message);
  });

  it("names the context it was refused at", () => {
    expect(() =>
      assertDecisionProvenanceLedger(null, catalog, "resolveTheme: intent.ledger")
    ).toThrow(/^resolveTheme: intent\.ledger: must be an object$/u);
  });

  it("refuses a malformed claim before any precedence runs", () => {
    expect(() =>
      resolveDecisionProvenanceLedger([
        {
          ref: { kind: "decision", id: "typography.pairing" },
          provenance: "direct-override",
          authoredValue: "geometric",
          leaves: [
            { leaf: FONT_BASE, specificity: "named" },
            { leaf: FONT_BASE, specificity: "expansion-derived" },
          ],
        },
      ], catalog)
    ).toThrow(/is claimed twice by decision:typography\.pairing/u);
  });

  it("refuses a claim specificity outside the closed set", () => {
    expect(() =>
      resolveDecisionProvenanceLedger([
        {
          ref: { kind: "decision", id: "typography.pairing" },
          provenance: "direct-override",
          authoredValue: "geometric",
          leaves: [{ leaf: FONT_BASE, specificity: "mostly" as never }],
        },
      ], catalog)
    ).toThrow(/unknown specificity "mostly"/u);
  });
});

describe("the empty ledger and the snapshot", () => {
  it("is empty and frozen, and reads as no authorship", () => {
    expect(EMPTY_DECISION_PROVENANCE_LEDGER.entries).toEqual([]);
    expect(Object.isFrozen(EMPTY_DECISION_PROVENANCE_LEDGER)).toBe(true);
    expect(directOverrideEntries(EMPTY_DECISION_PROVENANCE_LEDGER)).toEqual([]);
    expect(() =>
      assertDecisionProvenanceLedger(EMPTY_DECISION_PROVENANCE_LEDGER, catalog)
    ).not.toThrow();
  });

  it("cannot be changed through the producer's copy after the snapshot", () => {
    const mutable = {
      entries: [
        {
          ref: { kind: "decision" as const, id: "typography.pairing" as const },
          provenance: "direct-override" as const,
          tier: "standard" as const,
          authoredValue: "geometric",
          effectiveLeaves: [FONT_BASE],
        },
      ],
    };
    const snapshot = snapshotDecisionProvenanceLedger(mutable, catalog);
    mutable.entries[0].effectiveLeaves.push(FONT_HEADING);
    mutable.entries.length = 0;
    expect(snapshot.entries).toHaveLength(1);
    expect(snapshot.entries[0].effectiveLeaves).toEqual([FONT_BASE]);
  });

  it("refuses to snapshot a ledger it would have refused to read", () => {
    const broken = { entries: [{ ref: { kind: "decision" } }] };
    expect(() =>
      snapshotDecisionProvenanceLedger(
        broken as unknown as DecisionProvenanceLedger,
        catalog
      )
    ).toThrow(/entries\[0\]: provenance must be an own property/u);
  });
});
