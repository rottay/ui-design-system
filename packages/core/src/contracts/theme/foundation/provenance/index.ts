/**
 * @fileoverview The decision-provenance ledger: which raw authored selection
 * owns each effective leaf, and under which of the three provenance classes.
 * @description The side ledger the merge cannot answer for. It travels beside
 * the patch instead of inside it, because merging is exactly what destroys
 * "whose is this value".
 *
 * FENCES.
 * - No import from `infrastructure/**`, and no import of a compiler, ingress or
 *   lowering module: the same fence the control catalog carries. `intent` and
 *   `resolved` consume these types with `import type`, so the only runtime edge
 *   is this module -> the decision catalog, never back.
 * - Tier is never a producer input. It is read from
 *   `THEME_DECISION_TIER_BY_ID` when the ledger is built and re-checked when a
 *   ledger arrives over a transport (I-P3b): a tier a caller can state is a
 *   tier a caller can forge.
 * - The ledger is derived, never merged. Two ledgers are not combined; a
 *   station that has more claims re-resolves the whole claim set.
 *
 * @module Contracts/Theme/Provenance
 * @category Types
 * @package @rottay/design-system
 */

import {
  THEME_DECISION_IDS,
  THEME_DECISION_TIER_BY_ID,
  type ThemeDecisionId,
  type ThemeDecisionTier,
} from "@/contracts/theme/foundation/decisions";

/* -------------------------------------------------------------------------- */
/* The three provenance classes                                               */
/* -------------------------------------------------------------------------- */

/**
 * The three classes every effective leaf belongs to, exactly one of them.
 *
 * `direct-override`  the tenant authored the selection that caused this leaf.
 * `profile-derived`  a profile expansion filled a field the tenant left empty.
 * `preset-inherited` the vertical baseline supplied it and nobody decided.
 */
export const DECISION_PROVENANCE_CLASSES = Object.freeze([
  "direct-override",
  "profile-derived",
  "preset-inherited",
] as const);

export type DecisionProvenance = (typeof DECISION_PROVENANCE_CLASSES)[number];

/**
 * Inter-class precedence (I-P1), higher wins, without exceptions.
 *
 * A profile default never loses to the vertical baseline: selecting the
 * profile is itself a tenant decision, and the baseline is the fallback for
 * "nobody decided", not an authorship that competes with one.
 */
export const DECISION_PROVENANCE_PRECEDENCE: Readonly<
  Record<DecisionProvenance, number>
> = Object.freeze({
  "direct-override": 2,
  "profile-derived": 1,
  "preset-inherited": 0,
});

function isDecisionProvenance(value: unknown): value is DecisionProvenance {
  return (DECISION_PROVENANCE_CLASSES as readonly string[]).includes(
    value as string
  );
}

/* -------------------------------------------------------------------------- */
/* Immutable raw identity                                                     */
/* -------------------------------------------------------------------------- */

/** The two authorship classes a v2 document admits. */
export const AUTHORED_SELECTION_KINDS = Object.freeze([
  "decision",
  "sanctioned-override",
] as const);

export type AuthoredSelectionKind = (typeof AUTHORED_SELECTION_KINDS)[number];

/**
 * What a source of authorship declared, BEFORE any projection or expansion.
 *
 * A sanctioned override is NOT a decision id and no id is invented for it: it
 * is recorded by its original transport path, and its entitlement is the one
 * `assertOverrideEntitlement` already applies, not a catalog tier.
 */
export type AuthoredSelectionRef =
  | { readonly kind: "decision"; readonly id: ThemeDecisionId }
  | { readonly kind: "sanctioned-override"; readonly path: string };

/** A stable key for one raw selection; two selections never share one. */
export function authoredSelectionKey(ref: AuthoredSelectionRef): string {
  return ref.kind === "decision"
    ? `decision:${ref.id}`
    : `sanctioned-override:${ref.path}`;
}

/**
 * The tier of a raw selection, read from the catalog and from nowhere else
 * (I-P3b). `null` for a sanctioned override, whose gate is entitlement rather
 * than tier.
 */
export function catalogTierOf(
  ref: AuthoredSelectionRef
): ThemeDecisionTier | null {
  return ref.kind === "decision" ? THEME_DECISION_TIER_BY_ID[ref.id] : null;
}

/* -------------------------------------------------------------------------- */
/* The ledger                                                                 */
/* -------------------------------------------------------------------------- */

/**
 * One raw selection and the effective leaves it ended up owning.
 *
 * `effectiveLeaves` may be empty: a selection displaced by a more specific one
 * is RETAINED with no leaves rather than deleted (I-P1 retention, I-P3c). Its
 * tier was already judged, and "the tenant authored this" stays a reportable
 * fact whether or not the value survived precedence.
 */
export interface DecisionProvenanceEntry {
  readonly ref: AuthoredSelectionRef;
  readonly provenance: DecisionProvenance;
  readonly tier: ThemeDecisionTier | null;
  readonly authoredValue: unknown;
  readonly effectiveLeaves: readonly string[];
}

/** Every raw selection a compile saw, in capture order. */
export interface DecisionProvenanceLedger {
  readonly entries: readonly DecisionProvenanceEntry[];
}

/** "No selection was captured." Not "no selection exists". */
export const EMPTY_DECISION_PROVENANCE_LEDGER: DecisionProvenanceLedger =
  Object.freeze({ entries: Object.freeze([]) as readonly DecisionProvenanceEntry[] });

/* -------------------------------------------------------------------------- */
/* Claims: what a producer states, before precedence                          */
/* -------------------------------------------------------------------------- */

/**
 * How a claim reaches a leaf, which is what decides an intra-class collision
 * (I-P5): the selection that NAMES the leaf beats the leaf a sibling selection
 * of the same class merely expanded into.
 */
export const LEAF_CLAIM_SPECIFICITIES = Object.freeze([
  "named",
  "expansion-derived",
] as const);

export type LeafClaimSpecificity = (typeof LEAF_CLAIM_SPECIFICITIES)[number];

const LEAF_CLAIM_PRECEDENCE: Readonly<Record<LeafClaimSpecificity, number>> =
  Object.freeze({ named: 1, "expansion-derived": 0 });

export interface AuthoredLeafClaim {
  /** A BrandTheme-space keypath, e.g. `typography.fontFamilyBase`. */
  readonly leaf: string;
  readonly specificity: LeafClaimSpecificity;
}

/**
 * What one authored selection claims, before precedence is applied.
 *
 * Transitivity (I-P0) is structural, not a rule a producer has to remember:
 * the leaves an expansion writes are listed on the claim of the selection that
 * CAUSED them, so they carry that selection's class and there is no shape in
 * which an expansion can raise its own class. A profile default expanding font
 * families stays `profile-derived`; an authored pairing expanding the same
 * leaves stays `direct-override`.
 *
 * `tier` is deliberately absent: it is read from the catalog when the ledger
 * is built (I-P3b).
 */
export interface DecisionProvenanceClaim {
  readonly ref: AuthoredSelectionRef;
  readonly provenance: DecisionProvenance;
  readonly authoredValue: unknown;
  readonly leaves: readonly AuthoredLeafClaim[];
}

/* -------------------------------------------------------------------------- */
/* Validation                                                                 */
/* -------------------------------------------------------------------------- */

const OBJECT_KEYS = (value: object): readonly string[] => Object.keys(value);

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function quoted(values: readonly string[]): string {
  return values.map((value) => JSON.stringify(value)).join(", ");
}

function assertExactKeys(
  value: Record<string, unknown>,
  expected: readonly string[],
  optional: readonly string[],
  where: string
): void {
  const unknownKeys = OBJECT_KEYS(value).filter(
    (key) => !expected.includes(key)
  );
  if (unknownKeys.length > 0) {
    throw new Error(
      `${where}: unknown key(s) ${quoted(unknownKeys)}; it carries exactly ${expected.join(", ")}`
    );
  }
  for (const key of expected) {
    if (optional.includes(key)) continue;
    if (!Object.prototype.hasOwnProperty.call(value, key)) {
      throw new Error(`${where}: ${key} must be an own property`);
    }
  }
}

function assertAuthoredSelectionRef(value: unknown, where: string): void {
  if (!isPlainObject(value)) {
    throw new Error(`${where}: ref must be an object`);
  }
  const { kind } = value;
  if (!(AUTHORED_SELECTION_KINDS as readonly unknown[]).includes(kind)) {
    throw new Error(
      `${where}: unknown ref kind ${JSON.stringify(kind)}; the closed set is ${quoted(
        AUTHORED_SELECTION_KINDS
      )}`
    );
  }
  if (kind === "decision") {
    assertExactKeys(value, ["kind", "id"], [], `${where}.ref`);
    if (!(THEME_DECISION_IDS as readonly unknown[]).includes(value.id)) {
      throw new Error(
        `${where}: unknown decision id ${JSON.stringify(value.id)}; the catalog is the closed set`
      );
    }
    return;
  }
  assertExactKeys(value, ["kind", "path"], [], `${where}.ref`);
  if (typeof value.path !== "string" || value.path.length === 0) {
    throw new Error(
      `${where}: a sanctioned-override ref carries a non-empty transport path; got ${JSON.stringify(
        value.path
      )}`
    );
  }
}

function assertLeafList(
  leaves: unknown,
  where: string,
  field: string
): readonly unknown[] {
  if (!Array.isArray(leaves)) {
    throw new Error(`${where}: ${field} must be an array`);
  }
  return leaves;
}

function assertLeafKeypath(leaf: unknown, where: string): asserts leaf is string {
  if (typeof leaf !== "string" || leaf.length === 0) {
    throw new Error(
      `${where}: a leaf is a non-empty keypath; got ${JSON.stringify(leaf)}`
    );
  }
}

/**
 * Refuse a malformed ledger BY NAME, at the boundary it crosses.
 *
 * What this can prove is I-P3 (b) tier not forged, (c) no entry dropped and
 * (d) no leaf owned twice, plus the closed vocabularies. What it cannot prove
 * is I-P3 (a) causal attribution: the losing claims are not in the ledger, so
 * "the right owner won" is a property of `resolveDecisionProvenanceLedger`,
 * which is why building a ledger by hand is not a supported route.
 */
export function assertDecisionProvenanceLedger(
  value: unknown,
  context = "decision provenance ledger"
): asserts value is DecisionProvenanceLedger {
  if (!isPlainObject(value)) {
    throw new Error(`${context}: must be an object`);
  }
  assertExactKeys(value, ["entries"], [], context);
  const { entries } = value;
  if (!Array.isArray(entries)) {
    throw new Error(`${context}.entries: must be an array`);
  }
  const seenRefs = new Map<string, number>();
  const ownerByLeaf = new Map<string, number>();
  entries.forEach((entry, index) => {
    const where = `${context}.entries[${index}]`;
    if (!isPlainObject(entry)) {
      throw new Error(`${where}: must be an object`);
    }
    assertExactKeys(
      entry,
      ["ref", "provenance", "tier", "authoredValue", "effectiveLeaves"],
      [],
      where
    );
    assertAuthoredSelectionRef(entry.ref, where);
    const ref = entry.ref as AuthoredSelectionRef;
    const key = authoredSelectionKey(ref);
    const twin = seenRefs.get(key);
    if (twin !== undefined) {
      throw new Error(
        `${where}: ${key} is already captured at entries[${twin}]; a raw selection is captured once`
      );
    }
    seenRefs.set(key, index);
    if (!isDecisionProvenance(entry.provenance)) {
      throw new Error(
        `${where}: unknown provenance ${JSON.stringify(entry.provenance)}; the closed set is ${quoted(
          DECISION_PROVENANCE_CLASSES
        )}`
      );
    }
    const catalogTier = catalogTierOf(ref);
    if (entry.tier !== catalogTier) {
      throw new Error(
        `${where}: tier ${JSON.stringify(entry.tier)} is not the catalog tier ${JSON.stringify(
          catalogTier
        )} of ${key}; a tier is read from the catalog, never stated`
      );
    }
    const leaves = assertLeafList(entry.effectiveLeaves, where, "effectiveLeaves");
    const ownHere = new Set<string>();
    leaves.forEach((leaf, leafIndex) => {
      assertLeafKeypath(leaf, `${where}.effectiveLeaves[${leafIndex}]`);
      if (ownHere.has(leaf)) {
        throw new Error(
          `${where}.effectiveLeaves: ${JSON.stringify(leaf)} is listed twice`
        );
      }
      ownHere.add(leaf);
      const holder = ownerByLeaf.get(leaf);
      if (holder !== undefined) {
        throw new Error(
          `${context}: ${JSON.stringify(leaf)} is owned by both entries[${holder}] and entries[${index}]; an effective leaf has exactly one owner`
        );
      }
      ownerByLeaf.set(leaf, index);
    });
  });
}

function assertClaims(
  claims: readonly DecisionProvenanceClaim[],
  context: string
): void {
  if (!Array.isArray(claims)) {
    throw new Error(`${context}: claims must be an array`);
  }
  const seenRefs = new Map<string, number>();
  claims.forEach((claim, index) => {
    const where = `${context}.claims[${index}]`;
    if (!isPlainObject(claim)) {
      throw new Error(`${where}: must be an object`);
    }
    assertExactKeys(
      claim as unknown as Record<string, unknown>,
      ["ref", "provenance", "authoredValue", "leaves"],
      [],
      where
    );
    assertAuthoredSelectionRef(claim.ref, where);
    const key = authoredSelectionKey(claim.ref as AuthoredSelectionRef);
    const twin = seenRefs.get(key);
    if (twin !== undefined) {
      throw new Error(
        `${where}: ${key} is already claimed at claims[${twin}]; a raw selection is captured once`
      );
    }
    seenRefs.set(key, index);
    if (!isDecisionProvenance(claim.provenance)) {
      throw new Error(
        `${where}: unknown provenance ${JSON.stringify(claim.provenance)}; the closed set is ${quoted(
          DECISION_PROVENANCE_CLASSES
        )}`
      );
    }
    const leaves = assertLeafList(claim.leaves, where, "leaves");
    const seenLeaves = new Set<string>();
    leaves.forEach((entry, leafIndex) => {
      const at = `${where}.leaves[${leafIndex}]`;
      if (!isPlainObject(entry)) {
        throw new Error(`${at}: must be an object`);
      }
      assertExactKeys(entry, ["leaf", "specificity"], [], at);
      assertLeafKeypath(entry.leaf, at);
      if (
        !(LEAF_CLAIM_SPECIFICITIES as readonly unknown[]).includes(
          entry.specificity
        )
      ) {
        throw new Error(
          `${at}: unknown specificity ${JSON.stringify(entry.specificity)}; the closed set is ${quoted(
            LEAF_CLAIM_SPECIFICITIES
          )}`
        );
      }
      if (seenLeaves.has(entry.leaf)) {
        throw new Error(`${at}: ${JSON.stringify(entry.leaf)} is claimed twice by ${key}`);
      }
      seenLeaves.add(entry.leaf);
    });
  });
}

/* -------------------------------------------------------------------------- */
/* Precedence: claims to ledger                                               */
/* -------------------------------------------------------------------------- */

interface LeafClaimant {
  readonly index: number;
  readonly specificity: LeafClaimSpecificity;
}

/**
 * Apply I-P1 (between classes) then I-P5 (within a class) to a claim set, and
 * return the ledger those claims resolve to.
 *
 * This is the only supported way to build a ledger, because it is what makes
 * I-P3a true: the owner of a leaf is the CAUSAL winner over every claimant of
 * that leaf, not merely a unique one. Every claim survives into an entry, with
 * `effectiveLeaves` empty when it lost them all (I-P3c), and no claim's
 * `authoredValue` is ever compared against another's: a value that happens to
 * equal the one it replaced is still authorship (I-P4).
 *
 * A collision that both rules leave tied — two claims of the same class both
 * NAMING the same leaf — is a producer defect, refused by name rather than
 * settled by an invented tie-break such as declaration order.
 */
export function resolveDecisionProvenanceLedger(
  claims: readonly DecisionProvenanceClaim[],
  context = "resolveDecisionProvenanceLedger"
): DecisionProvenanceLedger {
  assertClaims(claims, context);
  const claimantsByLeaf = new Map<string, LeafClaimant[]>();
  claims.forEach((claim, index) => {
    for (const { leaf, specificity } of claim.leaves) {
      const claimants = claimantsByLeaf.get(leaf);
      if (claimants) claimants.push({ index, specificity });
      else claimantsByLeaf.set(leaf, [{ index, specificity }]);
    }
  });

  const wonByClaim = claims.map(() => new Set<string>());
  for (const [leaf, claimants] of claimantsByLeaf) {
    let winner = claimants[0];
    for (const challenger of claimants.slice(1)) {
      const verdict = compareClaimants(claims, winner, challenger);
      if (verdict === 0) {
        throw new Error(
          `${context}: ${JSON.stringify(leaf)} is claimed as "${challenger.specificity}" by both ` +
            `${authoredSelectionKey(claims[winner.index].ref)} and ` +
            `${authoredSelectionKey(claims[challenger.index].ref)} at the same provenance ` +
            `"${claims[winner.index].provenance}"; precedence cannot name a winner`
        );
      }
      if (verdict < 0) winner = challenger;
    }
    wonByClaim[winner.index].add(leaf);
  }

  const entries = claims.map((claim, index) => {
    const won = wonByClaim[index];
    return Object.freeze({
      ref: Object.freeze({ ...claim.ref }) as AuthoredSelectionRef,
      provenance: claim.provenance,
      tier: catalogTierOf(claim.ref),
      authoredValue: claim.authoredValue,
      effectiveLeaves: Object.freeze(
        claim.leaves.filter(({ leaf }) => won.has(leaf)).map(({ leaf }) => leaf)
      ) as readonly string[],
    }) as DecisionProvenanceEntry;
  });
  return Object.freeze({ entries: Object.freeze(entries) as readonly DecisionProvenanceEntry[] });
}

function compareClaimants(
  claims: readonly DecisionProvenanceClaim[],
  left: LeafClaimant,
  right: LeafClaimant
): number {
  const byClass =
    DECISION_PROVENANCE_PRECEDENCE[claims[left.index].provenance] -
    DECISION_PROVENANCE_PRECEDENCE[claims[right.index].provenance];
  if (byClass !== 0) return byClass;
  return (
    LEAF_CLAIM_PRECEDENCE[left.specificity] -
    LEAF_CLAIM_PRECEDENCE[right.specificity]
  );
}

/* -------------------------------------------------------------------------- */
/* Reading a ledger                                                           */
/* -------------------------------------------------------------------------- */

/**
 * A validated, frozen copy, so that later mutation of the producer's ledger —
 * or of anything reachable from the returned value — cannot change what a
 * later reader sees. `authoredValue` crosses by reference: it is opaque here,
 * and cloning an unknown would be this contract inventing a value semantics.
 */
export function snapshotDecisionProvenanceLedger(
  ledger: DecisionProvenanceLedger,
  context = "decision provenance ledger"
): DecisionProvenanceLedger {
  assertDecisionProvenanceLedger(ledger, context);
  return Object.freeze({
    entries: Object.freeze(
      ledger.entries.map((entry) =>
        Object.freeze({
          ref: Object.freeze({ ...entry.ref }) as AuthoredSelectionRef,
          provenance: entry.provenance,
          tier: entry.tier,
          authoredValue: entry.authoredValue,
          effectiveLeaves: Object.freeze([
            ...entry.effectiveLeaves,
          ]) as readonly string[],
        })
      )
    ) as readonly DecisionProvenanceEntry[],
  });
}

/**
 * The selections the tenant authored directly — the set a tier station judges
 * (I-T1). It is read from the ledger and never re-inferred from a merged
 * patch's leaves, which is the inference that cannot tell a pairing from the
 * families it expanded into.
 */
export function directOverrideEntries(
  ledger: DecisionProvenanceLedger
): readonly DecisionProvenanceEntry[] {
  return ledger.entries.filter(
    (entry) => entry.provenance === "direct-override"
  );
}

/** Which selection owns one effective leaf, or `undefined` if none does. */
export function ledgerOwnerOfLeaf(
  ledger: DecisionProvenanceLedger,
  leaf: string
): DecisionProvenanceEntry | undefined {
  return ledger.entries.find((entry) => entry.effectiveLeaves.includes(leaf));
}
