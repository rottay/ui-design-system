/**
 * Drills for craft scoring.
 *
 * Scoring is where a family's grade is decided, so its failure modes are
 * generous ones: a dimension that scores on a claim rather than on observable
 * evidence, or an unjustified not-applicable that quietly lowers the bar.
 * Every drill below plants one of those and requires a zero.
 */

import assert from 'node:assert/strict';
import test from 'node:test';

import {
  loadProgramContracts,
} from '../contracts/index.mjs';
import {
  scoreCraft,
  improvedDimensionCount,
} from './index.mjs';

const contracts = loadProgramContracts();

function perfectScores({ evidence = 'button root background-color derives from --ds-button-primary-bg' } = {}) {
  return Object.fromEntries(
    contracts.rubric.dimensions.map((dimension) => [dimension.id, { score: 5, evidence }]),
  );
}

function premiumScores(score = 4) {
  return Object.fromEntries(
    contracts.rubric.dimensions.map((dimension) => [
      dimension.id,
      { score, evidence: `observed part/property for ${dimension.id}` },
    ]),
  );
}

function fullStressFloor() {
  return Object.fromEntries(
    Object.entries(contracts.rubric.stressMatrix).map(([axis, cases]) => [axis, [...cases]]),
  );
}

function fullTaxonomyPass() {
  return Object.fromEntries(
    Object.entries(contracts.visualCraft.failureTaxonomy.categories).map(([category, checks]) => [
      category,
      checks.map((check) => ({ check, outcome: 'PASS' })),
    ]),
  );
}

test('craft scoring is blind to binary contract results', () => {
  const withEvidence = scoreCraft(perfectScores());
  assert.equal(withEvidence.score, 100);
  assert.equal(withEvidence.testsAwardedPoints, false);
});

test('NEGATIVE DRILL: a scored dimension without observable evidence scores zero', () => {
  const scores = perfectScores();
  scores['anatomy-composition'] = { score: 5 };
  const result = scoreCraft(scores);
  const row = result.rows.find((entry) => entry.dimensionId === 'anatomy-composition');
  assert.equal(row.declaredScore, 5);
  assert.equal(row.effectiveScore, 0, 'a claim without evidence must score zero');
  assert.ok(result.violations.some((violation) => violation.includes('without observable evidence')));
  assert.ok(result.score < 100);
});

test('NEGATIVE DRILL: a not-applicable dimension without a reason is treated as applicable and scores zero', () => {
  const scores = perfectScores();
  scores['icons-multimodal'] = { applicable: false };
  const result = scoreCraft(scores);
  assert.ok(result.violations.some((violation) => violation.includes('not applicable without a falsifiable reason')));
  assert.ok(result.score < 100);
});

test('a justified not-applicable dimension renormalizes instead of capping the family below its threshold', () => {
  const scores = perfectScores();
  scores['icons-multimodal'] = { applicable: false, notApplicableReason: 'family renders no glyph slot' };
  const result = scoreCraft(scores);
  assert.equal(result.score, 100);
  assert.equal(result.applicableWeight, 96);
});

test('improvement counting compares effective scores, not claims', () => {
  const before = premiumScores(2);
  const after = premiumScores(2);
  after['typography-content'] = { score: 5 };
  const { improved } = improvedDimensionCount(before, after);
  assert.deepEqual(improved, [], 'a claim without evidence cannot count as an improvement');
});
