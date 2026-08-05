import { loadProgramContracts } from './contracts.mjs';

const MINIMUM_RATING = 0;
const MAXIMUM_RATING = 5;

/**
 * Craft scoring is deliberately blind to binary contract results, drills and tests.
 * `quality-rubric.json#eligibility.testsAwardCraftPoints` is false, so a green gate
 * must never be able to raise a sighted score. This module therefore accepts only
 * dimension observations and never receives the eligibility input.
 */

function isObservableEvidence(value) {
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.some((entry) => isObservableEvidence(entry));
  if (value && typeof value === 'object') {
    return ['selector', 'rule', 'behavior', 'observation', 'part', 'property'].some((key) =>
      isObservableEvidence(value[key]),
    );
  }
  return false;
}

function normalizeRating(rating) {
  if (typeof rating !== 'number' || Number.isNaN(rating)) return null;
  if (rating < MINIMUM_RATING || rating > MAXIMUM_RATING) return null;
  return rating;
}

/**
 * @param {Record<string, {score?: number, evidence?: unknown, applicable?: boolean, notApplicableReason?: string}>} dimensionScores
 */
export function scoreCraft(dimensionScores, { contracts = loadProgramContracts() } = {}) {
  const rubricDimensions = contracts.rubric.dimensions;
  const rows = [];
  const violations = [];

  let applicableWeight = 0;
  let earnedWeight = 0;

  for (const dimension of rubricDimensions) {
    const declared = dimensionScores?.[dimension.id];

    if (declared === undefined) {
      violations.push(`dimension ${dimension.id} is missing from the scorecard`);
      rows.push({
        dimensionId: dimension.id,
        weight: dimension.weight,
        applicable: true,
        declaredScore: null,
        effectiveScore: 0,
        evidencePresent: false,
        reason: 'missing-dimension',
      });
      applicableWeight += dimension.weight;
      continue;
    }

    if (declared.applicable === false) {
      const reason = typeof declared.notApplicableReason === 'string' ? declared.notApplicableReason.trim() : '';
      if (reason.length === 0) {
        violations.push(
          `dimension ${dimension.id} is declared not applicable without a falsifiable reason`,
        );
        applicableWeight += dimension.weight;
        rows.push({
          dimensionId: dimension.id,
          weight: dimension.weight,
          applicable: true,
          declaredScore: null,
          effectiveScore: 0,
          evidencePresent: false,
          reason: 'not-applicable-without-reason',
        });
        continue;
      }
      rows.push({
        dimensionId: dimension.id,
        weight: dimension.weight,
        applicable: false,
        declaredScore: null,
        effectiveScore: null,
        evidencePresent: false,
        reason,
      });
      continue;
    }

    applicableWeight += dimension.weight;

    const rating = normalizeRating(declared.score);
    const evidencePresent = isObservableEvidence(declared.evidence);

    if (rating === null) {
      violations.push(`dimension ${dimension.id} has no rating in 0..5`);
    }

    // dimensionEvidenceLaw: a score without one concrete observable item scores zero.
    const effectiveScore = evidencePresent ? (rating ?? 0) : 0;
    if (!evidencePresent && (rating ?? 0) > 0) {
      violations.push(
        `dimension ${dimension.id} claims ${rating} without observable evidence and therefore scores zero`,
      );
    }

    earnedWeight += (dimension.weight * effectiveScore) / MAXIMUM_RATING;
    rows.push({
      dimensionId: dimension.id,
      weight: dimension.weight,
      applicable: true,
      declaredScore: rating,
      effectiveScore,
      evidencePresent,
      reason: evidencePresent ? null : 'missing-observable-evidence',
    });
  }

  // Renormalizing over applicable weight keeps a legitimately non-applicable dimension
  // from making its family's threshold unreachable, without letting it award free points.
  const score = applicableWeight === 0 ? 0 : Math.round((earnedWeight / applicableWeight) * 10000) / 100;

  const criticalShortfalls = rows
    .filter((row) => row.applicable)
    .filter((row) => contracts.rubric.dimensions.find((d) => d.id === row.dimensionId)?.critical)
    .filter((row) => (row.effectiveScore ?? 0) < contracts.rubric.familyCompletionContract.materialImprovement.premiumDimensionFloor)
    .map((row) => ({ dimensionId: row.dimensionId, effectiveScore: row.effectiveScore }));

  return {
    schemaVersion: 2,
    score,
    applicableWeight,
    rows,
    criticalShortfalls,
    violations,
    testsAwardedPoints: false,
  };
}

export function improvedDimensionCount(beforeScores, afterScores, { contracts = loadProgramContracts() } = {}) {
  const before = scoreCraft(beforeScores, { contracts });
  const after = scoreCraft(afterScores, { contracts });
  const improved = [];
  for (const afterRow of after.rows) {
    if (!afterRow.applicable) continue;
    const beforeRow = before.rows.find((row) => row.dimensionId === afterRow.dimensionId);
    if (!beforeRow || !beforeRow.applicable) continue;
    if ((afterRow.effectiveScore ?? 0) > (beforeRow.effectiveScore ?? 0)) {
      improved.push(afterRow.dimensionId);
    }
  }
  return { improved, before, after };
}
