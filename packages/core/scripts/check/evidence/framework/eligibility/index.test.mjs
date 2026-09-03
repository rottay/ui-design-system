/**
 * Drills for family eligibility.
 *
 * Eligibility is the gate between a scored family and an elevated one. It must
 * fail closed on an unresolved profile, on a missing taxonomy category and on
 * an elevation claimed without a productive source change -- each of which
 * would otherwise read as a pass.
 */

import assert from 'node:assert/strict';
import test from 'node:test';

import {
  loadProgramContracts,
} from '../contracts/index.mjs';
import {
  evaluateFamilyEligibility,
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

function baseFamilyReceipt(overrides = {}) {
  return {
    familyId: 'primitive/inputs/button',
    layer: 'primitive',
    layerProfile: 'primitive-interactive-control-data-overlay',
    divergenceProfile: 'interactive-control-layout',
    finalPendingStatus: 'ELEVATED_PENDING_CODEX_AUDIT',
    dominantDefect: 'action cluster reads as unrelated default controls',
    beforeDimensionScores: premiumScores(2),
    afterDimensionScores: perfectScores(),
    materialDeltaTable: [{ defectId: 'D1' }],
    unchangedDimensionPremiumProof: [],
    applicableStressCases: fullStressFloor(),
    applicableStates: ['rest', 'hover', 'focus-visible', 'disabled'],
    tenantDivergenceAxes: ['color', 'typography', 'geometry', 'edge'],
    staticDbCausalityAndRestore: { staticPathCausal: true, dbPathCausal: true, exactRestore: true },
    sourceFilesChanged: ['packages/core/src/components/primitives/inputs/Button/engines/modern/index.tsx'],
    sourceDigest: 'unused-by-eligibility',
    evidenceReceipts: [],
    remainingP0P1Defects: [],
    vetoes: [],
    blockers: [],
    failureTaxonomy: fullTaxonomyPass(),
    ...overrides,
  };
}

test('a family with a resolved profile clears its threshold and reports the sighted authority', () => {
  const verdict = evaluateFamilyEligibility(baseFamilyReceipt());
  assert.deepEqual(verdict.blockers, []);
  assert.equal(verdict.binaryEligible, true);
  assert.equal(verdict.craftScore, 100);
  assert.equal(verdict.sightedAuthority, contracts.rubric.eligibility.finalSightedAuthority);
  assert.equal(verdict.maximumClaim, 'IMPLEMENTED_PENDING_CODEX_AUDIT');
});

test('a receipt that omits layerProfile inherits the resolved inventory profile', () => {
  const verdict = evaluateFamilyEligibility(baseFamilyReceipt({ layerProfile: undefined }));
  assert.equal(verdict.layerProfile, 'primitive-interactive-control-data-overlay');
  assert.equal(verdict.threshold, 92);
});

test('NEGATIVE DRILL: an unresolved layer profile fails closed rather than borrowing a threshold', () => {
  // Forced directly rather than by omitting the receipt field: every inventory row now carries
  // a resolved profile, so an omitted field legitimately inherits one and omission no longer
  // reaches the unresolved branch this invariant guards.
  const unresolved = {
    ...contracts,
    inventory: {
      ...contracts.inventory,
      rows: contracts.inventory.rows.map((row) =>
        row.id === 'primitive/inputs/button'
          ? { ...row, layerProfile: null, divergenceProfile: null }
          : row,
      ),
    },
  };
  const verdict = evaluateFamilyEligibility(baseFamilyReceipt({ layerProfile: undefined, divergenceProfile: undefined }), {
    contracts: unresolved,
  });
  assert.equal(verdict.binaryEligible, false);
  assert.equal(verdict.threshold, null);
  assert.ok(verdict.blockers.some((blocker) => blocker.includes('no resolved layer profile')));
  assert.ok(verdict.blockers.some((blocker) => blocker.includes('no resolved divergence profile')));
});

test('NEGATIVE DRILL: one hard veto blocks eligibility', () => {
  const verdict = evaluateFamilyEligibility(
    baseFamilyReceipt({ vetoes: ['tenant-divergence-only-by-color'] }),
  );
  assert.equal(verdict.binaryEligible, false);
  assert.ok(verdict.blockers.some((blocker) => blocker.includes('hard veto count is 1')));
});

test('NEGATIVE DRILL: omitting a failure-taxonomy category blocks elevation', () => {
  const taxonomy = fullTaxonomyPass();
  delete taxonomy['charts-and-data-visualization'];
  const verdict = evaluateFamilyEligibility(baseFamilyReceipt({ failureTaxonomy: taxonomy }));
  assert.equal(verdict.binaryEligible, false);
  assert.ok(verdict.blockers.some((blocker) => blocker.includes('is omitted')));
});

test('NEGATIVE DRILL: a taxonomy N/A without a reason is rejected', () => {
  const taxonomy = fullTaxonomyPass();
  taxonomy['charts-and-data-visualization'][0] = { outcome: 'NOT_APPLICABLE_WITH_REASON' };
  const verdict = evaluateFamilyEligibility(baseFamilyReceipt({ failureTaxonomy: taxonomy }));
  assert.ok(verdict.blockers.some((blocker) => blocker.includes('without naming the absent capability')));
});

test('NEGATIVE DRILL: any applicable taxonomy FAIL keeps the family out of ELEVATED', () => {
  const taxonomy = fullTaxonomyPass();
  taxonomy['geometry-boundaries-and-shape'][0] = { outcome: 'FAIL' };
  const verdict = evaluateFamilyEligibility(baseFamilyReceipt({ failureTaxonomy: taxonomy }));
  assert.equal(verdict.binaryEligible, false);
  assert.ok(verdict.blockers.some((blocker) => blocker.includes('failure-taxonomy checks FAIL')));
});

test('NEGATIVE DRILL: dropping one stressMatrix floor case sets resilience below 1', () => {
  const stress = fullStressFloor();
  stress.locales = undefined;
  stress.localesRuntime = ['en', 'es'];
  const verdict = evaluateFamilyEligibility(baseFamilyReceipt({ applicableStressCases: stress }));
  assert.equal(verdict.resilience, 0);
  assert.equal(verdict.binaryEligible, false);
  assert.ok(verdict.blockers.some((blocker) => blocker.includes('omits floor case ar')));
});

test('NEGATIVE DRILL: color-only tenant divergence is rejected', () => {
  const verdict = evaluateFamilyEligibility(baseFamilyReceipt({ tenantDivergenceAxes: ['color'] }));
  assert.equal(verdict.binaryEligible, false);
  assert.ok(verdict.blockers.some((blocker) => blocker.includes('color-only')));
});

test('NEGATIVE DRILL: Claude cannot record DT sighted approval', () => {
  const verdict = evaluateFamilyEligibility(baseFamilyReceipt({ codexSightedApproval: true }));
  assert.equal(verdict.binaryEligible, false);
  assert.ok(verdict.blockers.some((blocker) => blocker.includes('only the DT may accept sighted quality')));
});

test('NEGATIVE DRILL: ELEVATED without a productive source change is rejected', () => {
  const verdict = evaluateFamilyEligibility(
    baseFamilyReceipt({
      sourceFilesChanged: [
        'packages/core/src/components/primitives/inputs/Button/tests/button.test.tsx',
        'docs-engineering/engineering/design-system/README.md',
      ],
    }),
  );
  assert.equal(verdict.binaryEligible, false);
  assert.ok(verdict.blockers.some((blocker) => blocker.includes('material productive source change')));
});

test('NEGATIVE DRILL: ALREADY_REFERENCE_GRADE with a productive edit is rejected', () => {
  const verdict = evaluateFamilyEligibility(
    baseFamilyReceipt({ finalPendingStatus: 'ALREADY_REFERENCE_GRADE_PENDING_CODEX_AUDIT' }),
  );
  assert.ok(verdict.blockers.some((blocker) => blocker.includes('permits no productive source edit')));
});

test('NEGATIVE DRILL: a shallow elevation that leaves dimensions below the premium floor is rejected', () => {
  const before = premiumScores(2);
  const after = premiumScores(2);
  after['anatomy-composition'] = { score: 5, evidence: 'one improved part' };
  const verdict = evaluateFamilyEligibility(
    baseFamilyReceipt({ beforeDimensionScores: before, afterDimensionScores: after }),
  );
  assert.equal(verdict.binaryEligible, false);
  assert.ok(
    verdict.blockers.some((blocker) => blocker.includes('requires 4')),
    `expected a material-improvement blocker, got ${JSON.stringify(verdict.blockers)}`,
  );
});
