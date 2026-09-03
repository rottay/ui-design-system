/**
 * Cross-unit drills: the two consumers of the reserved-path authority must
 * agree.
 *
 * `admitWriterLane` and `findExpansionViolations` classify the same files
 * through different code. A canonical authority with two consumers that
 * classify differently is not closed, so these drills run BOTH paths over the
 * same file and require identical verdicts. They live in their own owner
 * because they belong to neither module alone.
 */

import assert from 'node:assert/strict';
import path from 'node:path';
import test from 'node:test';

import {
  admitWriterLane,
  matchesReserved,
} from '../admission/index.mjs';
import {
  loadProgramContracts,
} from '../contracts/index.mjs';
import {
  deriveFamilyRoots,
  classifyReservedHit,
  findExpansionViolations,
} from '../ownership-overlap/index.mjs';

const contracts = loadProgramContracts();

// --- Consumer parity: admitWriterLane and findExpansionViolations must agree ---------------
// A canonical authority with two consumers that classify differently is not closed. These
// drills run BOTH paths over the same files and require identical verdicts.

const PARITY_PROPOSAL = {
  lanes: [
    {
      lane: 'R1-PatternDataTable-mobile-projection',
      laneClass: 'family-writer',
      families: [{ sourceOwner: 'packages/core/src/components/patterns/data' }],
      writeSet: ['packages/core/src/components/patterns/data/data-table/**'],
      writeSetExcludes: [
        'packages/core/src/components/patterns/data/data-table/**/tests/**',
        'packages/core/src/components/patterns/data/data-table/**/contracts/**',
      ],
    },
  ],
};

function admitOwning(file, proposal) {
  return admitWriterLane(
    {
      // Required-field defaults FIRST, so the real values below are not overwritten by them.
      ...Object.fromEntries(
        loadProgramContracts().orchestration.writerHandoffRequiredFields.map((field) => [field, 'declared']),
      ),
      lane: 'R1-PatternDataTable-mobile-projection',
      laneClass: 'family-writer',
      ownedFiles: [file],
      observableDefect: 'rows collapse illegibly under 360px',
      responsiveStrategy: 'mobile-card projection',
      expectedTenantDivergence: ['geometry', 'color'],
    },
    { proposal },
  );
}

function ownershipVerdictFor(file, proposal) {
  const roots = deriveFamilyRoots(proposal.lanes);
  const rule = loadProgramContracts().orchestration.barrelOwnership;
  return classifyReservedHit(file, rule.appliesToReservedPattern, roots, rule);
}

test('NEGATIVE DRILL: a reserved barrel inside a family glob is caught at expansion, not at the string', () => {
  const lanes = [{ lane: 'A', laneClass: 'family-writer', writeSet: ['packages/core/src/components/patterns/data/data-table/**'] }];
  // The glob string itself matches no reservedPath pattern; only its expansion does.
  assert.equal(matchesReserved('packages/core/src/components/patterns/data/data-table/**', contracts.orchestration.reservedPaths), false);
  const violations = findExpansionViolations(lanes);
  assert.ok(violations.some((violation) => violation.rule === 'reservedPath' && violation.file.endsWith('/index.ts')));
  // The mayNotEdit category is read from the contract, never spelled by hand.
  // The recovered drill asserted on `tests`, which the contract has never
  // declared for this lane class, so it could only ever have been red or
  // vacuous. `contracts` is what the authority actually forbids, and the
  // family owner really does carry that directory.
  const forbidden = contracts.orchestration.laneTypes['family-writer'].mayNotEdit;
  assert.ok(forbidden.includes('contracts'), 'the contract must still forbid the contracts directory');
  assert.equal(forbidden.includes('tests'), false, 'tests is not a declared mayNotEdit category');
  assert.ok(
    violations.some((violation) => violation.rule === 'mayNotEdit' && violation.pattern === 'contracts'),
  );
});

test('NEGATIVE DRILL: a reserved hit the rule cannot classify fails closed', () => {
  const contracts = loadProgramContracts();
  const pattern = contracts.orchestration.barrelOwnership.appliesToReservedPattern;

  // No declared family roots -> the positional rule has no authority to classify.
  const unclassifiable = classifyReservedHit('packages/core/src/components/x/index.ts', pattern, [], contracts.orchestration.barrelOwnership);
  assert.equal(unclassifiable.classification, 'blocking');
  assert.equal(unclassifiable.barrelClass, 'unclassified');

  // A reserved hit on a DIFFERENT pattern is outside the adjudication and still blocks.
  const otherPattern = classifyReservedHit(
    'packages/core/src/foundation/contracts/thing.ts',
    'packages/core/src/foundation/contracts/**',
    ['packages/core/src/components/patterns/data/data-table'],
    contracts.orchestration.barrelOwnership,
  );
  assert.equal(otherPattern.classification, 'blocking');

  // And with no rule at all in the contract, everything reserved blocks.
  const noRule = classifyReservedHit('packages/core/src/components/a/index.ts', pattern, ['packages/core/src/components/a'], null);
  assert.equal(noRule.classification, 'blocking');
});

test('PARITY DRILL: an implementation entrypoint is permitted by BOTH consumers', () => {
  const file = 'packages/core/src/components/patterns/data/data-table/runtime/state/index.ts';
  const ownership = ownershipVerdictFor(file, PARITY_PROPOSAL);
  assert.equal(ownership.classification, 'permitted-by-contract-rule');
  assert.equal(ownership.barrelClass, 'implementation-entrypoint');

  const admission = admitOwning(file, PARITY_PROPOSAL);
  assert.equal(admission.admitted, true, `admission must agree with ownership: ${admission.blockers.join('; ')}`);
  assert.equal(admission.adjudicatedEntrypoints.length, 1);
  assert.equal(admission.adjudicatedEntrypoints[0].ruleId, ownership.ruleId);
  assert.equal(admission.adjudicatedEntrypoints[0].owningFamilyRoot, ownership.owningFamilyRoot);
});

test('PARITY DRILL: a shared/category barrel is blocked by BOTH consumers', () => {
  const file = 'packages/core/src/components/patterns/data/index.ts';
  const ownership = ownershipVerdictFor(file, PARITY_PROPOSAL);
  assert.equal(ownership.barrelClass, 'shared-barrel');
  assert.equal(ownership.classification, 'blocking');

  const admission = admitOwning(file, PARITY_PROPOSAL);
  assert.equal(admission.admitted, false);
  assert.ok(admission.blockers.some((blocker) => blocker.includes('may not own reserved path')));
});

test('PARITY DRILL: an unclassifiable reserved index is blocked by BOTH consumers', () => {
  const file = 'packages/core/src/components/patterns/data/data-table/runtime/state/index.ts';
  const empty = { lanes: [] };
  const ownership = ownershipVerdictFor(file, empty);
  assert.equal(ownership.barrelClass, 'unclassified');
  assert.equal(ownership.classification, 'blocking');

  const admission = admitOwning(file, empty);
  assert.equal(admission.admitted, false, 'no proposal means no authority to classify — must fail closed');
});

test('DRILL: the barrels category only judges files the adjudicated pattern matches', () => {
  // Regression: the positional classifier once labelled any file sitting above a family root
  // — a README, a .tsx component — as a shared barrel, because the barrels branch classified
  // before checking the pattern.
  const lanes = [
    {
      lane: 'L',
      laneClass: 'family-writer',
      families: [{ sourceOwner: 'packages/core/src/components/structures/shell/bottom-tab-bar' }],
      writeSet: ['packages/core/src/components/structures/shell/**'],
      writeSetExcludes: [
        'packages/core/src/components/structures/shell/**/tests/**',
        'packages/core/src/components/structures/shell/**/contracts/**',
      ],
    },
  ];
  const violations = findExpansionViolations(lanes);
  const offenders = violations.filter((v) => /README\.md$|\.tsx$/.test(v.file));
  assert.deepEqual(offenders, [], 'non-index files must never be judged as barrels');
});
