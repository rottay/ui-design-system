import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import test from 'node:test';

import { admitWriterLane, matchesReserved, validateConflictGraph } from './admission.mjs';
import { loadProgramContracts } from './contracts.mjs';
import {
  analyzeOwnershipProposal,
  checkDomainUnitCoverage,
  checkNoWriteExceptions,
  checkSharedRequests,
  findUnsequencedCohortEdges,
  checkReadSetsAgainstDerivation,
  probePath,
  clearAnalysisCaches,
  expandEntry,
  checkDeclaredEdges,
  checkSingletonCardinality,
  checkDomainCoverage,
  classifyReservedHit,
  deriveAnatomyEdges,
  deriveSharedAuthorityEdges,
  findProspectiveWriterConflicts,
  loadRoundWriteDomains,
  deriveFamilyRoots,
  effectiveFiles,
  laneScopeContains,
  findExpansionViolations,
  findOwnershipCollisions,
  globRelationship,
  patternToRegex,
} from './ownership-overlap.mjs';
import { improvedDimensionCount, scoreCraft } from './craft-score.mjs';
import { evaluateFamilyEligibility } from './eligibility.mjs';
import { computeSourceDigest, validateReceipt } from './receipts.mjs';
import { validateRoundEvidence } from './round-evidence.mjs';

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
    sourceFilesChanged: ['packages/core/src/ui/primitives/inputs/Button/engines/modern/index.tsx'],
    sourceDigest: 'unused-by-eligibility',
    evidenceReceipts: [],
    remainingP0P1Defects: [],
    vetoes: [],
    blockers: [],
    failureTaxonomy: fullTaxonomyPass(),
    ...overrides,
  };
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

test('a family with a resolved profile clears its threshold and reports the sighted authority', () => {
  const verdict = evaluateFamilyEligibility(baseFamilyReceipt());
  assert.deepEqual(verdict.blockers, []);
  assert.equal(verdict.binaryEligible, true);
  assert.equal(verdict.craftScore, 100);
  assert.equal(verdict.sightedAuthority, 'Codex');
  assert.equal(verdict.maximumClaim, 'IMPLEMENTED_PENDING_CODEX_AUDIT');
});

test('a receipt that omits layerProfile inherits the resolved inventory profile', () => {
  const verdict = evaluateFamilyEligibility(baseFamilyReceipt({ layerProfile: undefined }));
  assert.equal(verdict.layerProfile, 'primitive-interactive-control-data-overlay');
  assert.equal(verdict.threshold, 92);
});

test('NEGATIVE DRILL: an unresolved layer profile fails closed rather than borrowing a threshold', () => {
  // Forced directly rather than by omitting the receipt field: since R0 resolved all 252
  // inventory rows, an omitted field now legitimately inherits a profile, so omission no
  // longer reaches the unresolved branch this invariant guards.
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

test('NEGATIVE DRILL: Claude cannot record Codex sighted approval', () => {
  const verdict = evaluateFamilyEligibility(baseFamilyReceipt({ codexSightedApproval: true }));
  assert.equal(verdict.binaryEligible, false);
  assert.ok(verdict.blockers.some((blocker) => blocker.includes('only Codex may accept sighted quality')));
});

test('NEGATIVE DRILL: ELEVATED without a productive source change is rejected', () => {
  const verdict = evaluateFamilyEligibility(
    baseFamilyReceipt({
      sourceFilesChanged: [
        'packages/core/src/ui/primitives/inputs/Button/tests/button.test.tsx',
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

test('improvement counting compares effective scores, not claims', () => {
  const before = premiumScores(2);
  const after = premiumScores(2);
  after['typography-content'] = { score: 5 };
  const { improved } = improvedDimensionCount(before, after);
  assert.deepEqual(improved, [], 'a claim without evidence cannot count as an improvement');
});

test('NEGATIVE DRILL: a receipt whose artifact hash is stale is rejected', () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'rottay-qe-v2-'));
  const relative = `${contracts.evidence.root}/R0/manifest.json`;
  const absolute = path.join(directory, relative);
  fs.mkdirSync(path.dirname(absolute), { recursive: true });
  fs.writeFileSync(absolute, JSON.stringify({ roundId: 'R0' }));
  const realDigest = crypto.createHash('sha256').update(fs.readFileSync(absolute)).digest('hex');

  // The drill stays hermetic: the owned source lives inside the same temporary root the
  // validator reads, so a digest mismatch can only come from the rule under test.
  const sourceFile = 'packages/core/src/ui/primitives/inputs/Button/index.tsx';
  fs.mkdirSync(path.dirname(path.join(directory, sourceFile)), { recursive: true });
  fs.writeFileSync(path.join(directory, sourceFile), 'export const Button = () => null;\n');

  const receipt = {
    schemaVersion: 2,
    roundId: 'R0',
    familyId: 'program/r0',
    scenarioId: 'manifest',
    evidenceKind: 'manifest',
    commandOrTool: 'node cli.mjs round-evidence R0',
    toolVersion: process.version,
    exitCode: 0,
    sourceFiles: [sourceFile],
    sourceDigest: computeSourceDigest([sourceFile], { root: directory }),
    artifactPath: relative,
    artifactSha256: `${realDigest.slice(0, -1)}0`,
    createdAt: new Date().toISOString(),
    negativeDrill: null,
    producer: 'claude-modern-rescue',
  };

  const stale = validateReceipt(receipt, { root: directory });
  assert.equal(stale.valid, false);
  assert.ok(stale.failures.some((failure) => failure.includes('does not match declared')));

  receipt.artifactSha256 = realDigest;
  const fresh = validateReceipt(receipt, { root: directory });
  assert.deepEqual(fresh.failures, []);

  receipt.sourceDigest = 'f'.repeat(64);
  const staleSource = validateReceipt(receipt, { root: directory });
  assert.ok(staleSource.failures.some((failure) => failure.includes('source digest is stale')));

  fs.rmSync(directory, { recursive: true, force: true });
});

test('NEGATIVE DRILL: the sighted approver may not be the evidence producer', () => {
  const result = validateReceipt({ producer: 'Codex', sourceFiles: [] });
  assert.ok(result.failures.some((failure) => failure.includes('producer must not be the sighted approver')));
});

test('NEGATIVE DRILL: an empty artifact is not evidence', () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'rottay-qe-v2-'));
  const relative = `${contracts.evidence.root}/R0/SUMMARY.json`;
  const absolute = path.join(directory, relative);
  fs.mkdirSync(path.dirname(absolute), { recursive: true });
  fs.writeFileSync(absolute, '');
  const result = validateReceipt(
    { artifactPath: relative, artifactSha256: crypto.createHash('sha256').update('').digest('hex'), sourceFiles: [] },
    { root: directory },
  );
  assert.ok(result.failures.some((failure) => failure.includes('is empty and cannot be evidence')));
  fs.rmSync(directory, { recursive: true, force: true });
});

test('NEGATIVE DRILL: work-order admission blocks a lane packet missing an observable defect', () => {
  const packet = Object.fromEntries(
    contracts.orchestration.writerHandoffRequiredFields.map((field) => [field, `value for ${field}`]),
  );
  packet.ownedFiles = ['packages/showroom/src/app/probe/whitelabel-torture/page.tsx'];
  packet.laneClass = 'family-writer';
  packet.lane = 'LANE-PROBE';
  // A family-writer must resolve against the authorized proposal before anything else can be
  // judged, so the observable-defect assertion is made with ownership already satisfied.
  const proposal = {
    lanes: [
      {
        lane: 'LANE-PROBE',
        laneClass: 'family-writer',
        families: [],
        writeSet: ['packages/showroom/src/app/probe/whitelabel-torture/**'],
      },
    ],
  };
  assert.equal(admitWriterLane(packet, { proposal }).admitted, true);

  packet.observableDefect = '';
  const blocked = admitWriterLane(packet, { proposal });
  assert.equal(blocked.admitted, false);
  assert.ok(blocked.blockers.some((blocker) => blocker.includes('empty observableDefect')));

  // The same packet with a complete defect but NO proposal must still fail closed.
  packet.observableDefect = 'value for observableDefect';
  const unproven = admitWriterLane(packet);
  assert.equal(unproven.admitted, false);
  assert.ok(unproven.blockers.some((blocker) => blocker.includes('requires the authorized ownership proposal')));
});

test('NEGATIVE DRILL: a family-writer lane may not own a reserved path', () => {
  const packet = Object.fromEntries(
    contracts.orchestration.writerHandoffRequiredFields.map((field) => [field, `value for ${field}`]),
  );
  packet.laneClass = 'family-writer';
  packet.ownedFiles = ['packages/core/src/infrastructure/compilers/kernel/runtime/appearance/index.ts'];
  const result = admitWriterLane(packet);
  assert.equal(result.admitted, false);
  assert.ok(result.blockers.some((blocker) => blocker.includes('may not own reserved path')));
});

test('NEGATIVE DRILL: two lanes writing the same file make the conflict graph unsafe', () => {
  const graph = {
    activeCohort: 1,
    nodes: [
      { lane: 'A', laneClass: 'family-writer', cohort: 1, readSet: [], writeSet: ['a.tsx'] },
      { lane: 'B', laneClass: 'family-writer', cohort: 1, readSet: [], writeSet: ['a.tsx'] },
    ],
    edges: [],
  };
  const result = validateConflictGraph(graph);
  assert.equal(result.safe, false);
  assert.ok(result.blockers.some((blocker) => blocker.includes('is written by both A and B')));
});

test('NEGATIVE DRILL: two lanes claiming a singleton integrator role are rejected', () => {
  const graph = {
    activeCohort: 1,
    nodes: [
      { lane: 'A', laneClass: 'architecture-integrator', cohort: 1, readSet: [], writeSet: ['a.ts'] },
      { lane: 'B', laneClass: 'architecture-integrator', cohort: 1, readSet: [], writeSet: ['b.ts'] },
    ],
    edges: [],
  };
  const result = validateConflictGraph(graph);
  assert.equal(result.safe, false);
  assert.ok(result.blockers.some((blocker) => blocker.includes('must be singleton')));
});

test('NEGATIVE DRILL: a reviewer lane that declares a write set is rejected', () => {
  const result = validateConflictGraph({
    activeCohort: 1,
    nodes: [{ lane: 'R', laneClass: 'reviewer', cohort: 1, readSet: [], writeSet: ['x.ts'] }],
    edges: [],
  });
  assert.equal(result.safe, false);
  assert.ok(result.blockers.some((blocker) => blocker.includes('declares a write set')));
});

test('NEGATIVE DRILL: R0 evidence carrying a capture is rejected', (t) => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'rottay-qe-v2-'));
  const roundRoot = path.join(directory, contracts.evidence.root, 'R0');
  fs.mkdirSync(path.join(roundRoot, 'captures'), { recursive: true });
  fs.writeFileSync(path.join(roundRoot, 'manifest.json'), JSON.stringify({ roundId: 'R0' }));
  fs.writeFileSync(path.join(roundRoot, 'captures', 'button.png'), 'not-really-a-png');
  const manifestDigest = crypto
    .createHash('sha256')
    .update(fs.readFileSync(path.join(roundRoot, 'manifest.json')))
    .digest('hex');
  fs.writeFileSync(path.join(roundRoot, 'SHA256SUMS'), `${manifestDigest}  manifest.json\n`);

  const result = validateRoundEvidence('R0', { root: directory });
  assert.equal(result.valid, false);
  assert.ok(result.blockers.some((blocker) => blocker.includes('declares no captures')));
  fs.rmSync(directory, { recursive: true, force: true });
  t.diagnostic('R0 is capture-free by evidence-contract.json#minimumReliableEvidenceByRound');
});

test('NEGATIVE DRILL: an evidence artifact that declares work-order status is rejected', () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'rottay-qe-v2-'));
  const roundRoot = path.join(directory, contracts.evidence.root, 'R0');
  fs.mkdirSync(roundRoot, { recursive: true });
  fs.writeFileSync(path.join(roundRoot, 'manifest.json'), JSON.stringify({ roundId: 'R0', status: 'done' }));
  const digest = crypto
    .createHash('sha256')
    .update(fs.readFileSync(path.join(roundRoot, 'manifest.json')))
    .digest('hex');
  fs.writeFileSync(path.join(roundRoot, 'SHA256SUMS'), `${digest}  manifest.json\n`);

  const result = validateRoundEvidence('R0', { root: directory });
  assert.equal(result.valid, false);
  assert.ok(result.blockers.some((blocker) => blocker.includes('declares work-order status key status')));
  fs.rmSync(directory, { recursive: true, force: true });
});

test('NEGATIVE DRILL: a stale SHA256SUMS entry is rejected', () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'rottay-qe-v2-'));
  const roundRoot = path.join(directory, contracts.evidence.root, 'R0');
  fs.mkdirSync(roundRoot, { recursive: true });
  fs.writeFileSync(path.join(roundRoot, 'manifest.json'), JSON.stringify({ roundId: 'R0' }));
  fs.writeFileSync(path.join(roundRoot, 'SHA256SUMS'), `${'0'.repeat(64)}  manifest.json\n`);
  const result = validateRoundEvidence('R0', { root: directory });
  assert.equal(result.valid, false);
  assert.ok(result.blockers.some((blocker) => blocker.includes('digest for manifest.json is stale')));
  fs.rmSync(directory, { recursive: true, force: true });
});

test('NEGATIVE DRILL: a broad parent write set colliding with a child lane is rejected', () => {
  // The defect this drill exists for: string equality let `x/**` and `x/child/**` read as
  // two unrelated files, so a category-wide claim passed a check named "conflict-free".
  const graph = {
    activeCohort: 1,
    nodes: [
      { lane: 'A-broad-parent', laneClass: 'family-writer', cohort: 1, writeSet: ['packages/core/src/ui/patterns/data/**'] },
      { lane: 'B-child', laneClass: 'family-writer', cohort: 1, writeSet: ['packages/core/src/ui/patterns/data/list-toolbar/**'] },
    ],
    edges: [],
  };
  const result = validateConflictGraph(graph);
  assert.equal(result.safe, false);
  assert.ok(result.blockers.some((blocker) => blocker.includes('contains') && blocker.includes('same file')));
});

test('NEGATIVE DRILL: glob containment is detected in both spelling orders', () => {
  assert.equal(globRelationship('a/b/**', 'a/b/c/**'), 'LEFT_CONTAINS_RIGHT');
  assert.equal(globRelationship('a/b/c/**', 'a/b/**'), 'RIGHT_CONTAINS_LEFT');
  assert.equal(globRelationship('a/b/**', 'a/b/**'), 'EXACT_EQUAL');
  assert.equal(globRelationship('a/b/**', 'a/bc/**'), 'DISJOINT');
  assert.equal(globRelationship('a/b/**', 'a/b/c/d.ts'), 'LEFT_CONTAINS_RIGHT');
  assert.equal(globRelationship('a/b/c.ts', 'a/b/d.ts'), 'DISJOINT');
});

test('NEGATIVE DRILL: two lanes reaching the same real file collide even with different globs', () => {
  const lanes = [
    { lane: 'A', laneClass: 'family-writer', writeSet: ['packages/core/src/ui/patterns/data/**'] },
    { lane: 'B', laneClass: 'family-writer', writeSet: ['packages/core/src/ui/patterns/data/saved-views/**'] },
  ];
  const collisions = findOwnershipCollisions(lanes);
  assert.equal(collisions.length, 1);
  assert.ok(collisions[0].sharedFileCount > 0);
});

test('NEGATIVE DRILL: an exclusion actually resolves an overlap, and dropping it restores the collision', () => {
  const withExclusion = [
    {
      lane: 'A',
      laneClass: 'family-writer',
      writeSet: ['packages/core/src/ui/patterns/data/**'],
      writeSetExcludes: ['packages/core/src/ui/patterns/data/saved-views/**'],
    },
    { lane: 'B', laneClass: 'family-writer', writeSet: ['packages/core/src/ui/patterns/data/saved-views/**'] },
  ];
  assert.equal(findOwnershipCollisions(withExclusion).length, 0);

  const withoutExclusion = withExclusion.map(({ writeSetExcludes, ...lane }) => lane);
  assert.ok(findOwnershipCollisions(withoutExclusion).length > 0);
});

test('NEGATIVE DRILL: a reserved barrel inside a family glob is caught at expansion, not at the string', () => {
  const lanes = [{ lane: 'A', laneClass: 'family-writer', writeSet: ['packages/core/src/ui/patterns/data/data-table/**'] }];
  // The glob string itself matches no reservedPath pattern; only its expansion does.
  assert.equal(matchesReserved('packages/core/src/ui/patterns/data/data-table/**', contracts.orchestration.reservedPaths), false);
  const violations = findExpansionViolations(lanes);
  assert.ok(violations.some((violation) => violation.rule === 'reservedPath' && violation.file.endsWith('/index.ts')));
  assert.ok(violations.some((violation) => violation.rule === 'mayNotEdit' && violation.pattern === 'tests'));
});

test('NEGATIVE DRILL: an ownership proposal cannot assert conflictFree — it is computed', () => {
  const proposal = {
    ownershipCollisions: [],
    conflictFree: true,
    checkpointCohorts: [['a', 'b']],
    lanes: [
      { lane: 'A', canary: 'a', laneClass: 'family-writer', writeSet: ['packages/core/src/ui/patterns/data/**'] },
      { lane: 'B', canary: 'b', laneClass: 'family-writer', writeSet: ['packages/core/src/ui/patterns/data/widget-board/**'] },
    ],
  };
  const analysis = analyzeOwnershipProposal(proposal);
  assert.equal(analysis.conflictFree, false);
  assert.ok(analysis.cohortCollisions.length > 0);
});

test('NEGATIVE DRILL: reserved-path matching handles zero intermediate segments', () => {
  // The naive `**` -> `.*` rewrite cannot match zero segments, so `a/**/index.ts` misses
  // `a/index.ts`. The corrected builder is a strict superset of the naive one.
  const naive = (file, pattern) =>
    new RegExp(
      `^${pattern.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*\*/g, ' ').replace(/\*/g, '[^/]*').replace(/ /g, '.*')}$`,
    ).test(file);

  assert.equal(naive('packages/core/src/index.ts', 'packages/core/src/**/index.ts'), false);
  assert.equal(patternToRegex('packages/core/src/**/index.ts').test('packages/core/src/index.ts'), true);
  assert.equal(patternToRegex('packages/core/src/**/index.ts').test('packages/core/src/a/b/index.ts'), true);
  assert.equal(patternToRegex('packages/core/src/**/index.ts').test('packages/core/other/index.ts'), false);
});

test('NEGATIVE DRILL: a shared/category barrel inside a family glob turns the check red', () => {
  // The laundering path this closes: a lane declares the CATEGORY as its own root, so the
  // category barrel sits "at" that root and a naive positional rule would permit it.
  const lanes = [
    { lane: 'A-broad', laneClass: 'family-writer', writeSet: ['packages/core/src/ui/patterns/data/**'] },
    { lane: 'B-child', laneClass: 'family-writer', writeSet: ['packages/core/src/ui/patterns/data/saved-views/**'] },
  ];
  const violations = findExpansionViolations(lanes);
  const barrel = violations.find((v) => v.file === 'packages/core/src/ui/patterns/data/index.ts');
  assert.ok(barrel, 'the category barrel must be adjudicated, not skipped');
  assert.equal(barrel.barrelClass, 'shared-barrel');
  assert.equal(barrel.classification, 'blocking');

  const analysis = analyzeOwnershipProposal({ lanes, checkpointCohorts: [] });
  assert.equal(analysis.conflictFree, false, 'a swallowed shared barrel must make the verdict red');
});

test('NEGATIVE DRILL: an implementation entrypoint is permitted only when the canonical rule classifies it', () => {
  const lane = {
    lane: 'A',
    laneClass: 'family-writer',
    writeSet: ['packages/core/src/ui/patterns/data/data-table/**'],
    writeSetExcludes: [
      'packages/core/src/ui/patterns/data/data-table/**/tests/**',
      'packages/core/src/ui/patterns/data/data-table/**/contracts/**',
    ],
  };
  const permitted = findExpansionViolations([lane]).filter((v) => v.classification === 'permitted-by-contract-rule');
  assert.ok(permitted.length > 0);
  for (const entry of permitted) {
    assert.equal(entry.barrelClass, 'implementation-entrypoint');
    assert.ok(entry.owningFamilyRoot, 'a permitted entrypoint must name the family root that justifies it');
  }
  // Nothing is permitted merely for being named index.ts.
  assert.ok(permitted.every((entry) => entry.file.startsWith(entry.owningFamilyRoot)));
});

test('NEGATIVE DRILL: a reserved hit the rule cannot classify fails closed', () => {
  const contracts = loadProgramContracts();
  const pattern = contracts.orchestration.barrelOwnership.appliesToReservedPattern;

  // No declared family roots -> the positional rule has no authority to classify.
  const unclassifiable = classifyReservedHit('packages/core/src/ui/x/index.ts', pattern, [], contracts.orchestration.barrelOwnership);
  assert.equal(unclassifiable.classification, 'blocking');
  assert.equal(unclassifiable.barrelClass, 'unclassified');

  // A reserved hit on a DIFFERENT pattern is outside the adjudication and still blocks.
  const otherPattern = classifyReservedHit(
    'packages/core/src/foundation/contracts/thing.ts',
    'packages/core/src/foundation/contracts/**',
    ['packages/core/src/ui/patterns/data/data-table'],
    contracts.orchestration.barrelOwnership,
  );
  assert.equal(otherPattern.classification, 'blocking');

  // And with no rule at all in the contract, everything reserved blocks.
  const noRule = classifyReservedHit('packages/core/src/ui/a/index.ts', pattern, ['packages/core/src/ui/a'], null);
  assert.equal(noRule.classification, 'blocking');
});

// --- Consumer parity: admitWriterLane and findExpansionViolations must agree ---------------
// A canonical authority with two consumers that classify differently is not closed. These
// drills run BOTH paths over the same files and require identical verdicts.

const PARITY_PROPOSAL = {
  lanes: [
    {
      lane: 'R1-PatternDataTable-mobile-projection',
      laneClass: 'family-writer',
      families: [{ sourceOwner: 'packages/core/src/ui/patterns/data' }],
      writeSet: ['packages/core/src/ui/patterns/data/data-table/**'],
      writeSetExcludes: [
        'packages/core/src/ui/patterns/data/data-table/**/tests/**',
        'packages/core/src/ui/patterns/data/data-table/**/contracts/**',
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

test('PARITY DRILL: an implementation entrypoint is permitted by BOTH consumers', () => {
  const file = 'packages/core/src/ui/patterns/data/data-table/runtime/state/index.ts';
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
  const file = 'packages/core/src/ui/patterns/data/index.ts';
  const ownership = ownershipVerdictFor(file, PARITY_PROPOSAL);
  assert.equal(ownership.barrelClass, 'shared-barrel');
  assert.equal(ownership.classification, 'blocking');

  const admission = admitOwning(file, PARITY_PROPOSAL);
  assert.equal(admission.admitted, false);
  assert.ok(admission.blockers.some((blocker) => blocker.includes('may not own reserved path')));
});

test('PARITY DRILL: an unclassifiable reserved index is blocked by BOTH consumers', () => {
  const file = 'packages/core/src/ui/patterns/data/data-table/runtime/state/index.ts';
  const empty = { lanes: [] };
  const ownership = ownershipVerdictFor(file, empty);
  assert.equal(ownership.barrelClass, 'unclassified');
  assert.equal(ownership.classification, 'blocking');

  const admission = admitOwning(file, empty);
  assert.equal(admission.admitted, false, 'no proposal means no authority to classify — must fail closed');
});

test('DRILL: a category-grade family root still yields shared-barrel for its own index', () => {
  // Exercises the ancestor clause, which fires zero times on the real R1 tree. Synthetic on
  // purpose: an unexercised contract clause is decorative.
  const rule = loadProgramContracts().orchestration.barrelOwnership;
  const roots = [
    { root: 'packages/core/src/ui/structures/shell', lane: 'L' },
    { root: 'packages/core/src/ui/structures/shell/bottom-tab-bar', lane: 'L' },
  ];
  const parent = classifyReservedHit('packages/core/src/ui/structures/shell/index.ts', rule.appliesToReservedPattern, roots, rule);
  assert.equal(parent.barrelClass, 'shared-barrel');

  const nested = classifyReservedHit('packages/core/src/ui/structures/shell/bottom-tab-bar/index.ts', rule.appliesToReservedPattern, roots, rule);
  assert.equal(nested.barrelClass, 'implementation-entrypoint');
  assert.equal(nested.owningFamilyRoot, 'packages/core/src/ui/structures/shell/bottom-tab-bar');
});

test('DRILL: a directory inside two lanes roots fails closed rather than picking one', () => {
  const rule = loadProgramContracts().orchestration.barrelOwnership;
  const roots = [
    { root: 'packages/core/src/ui/x', lane: 'LANE-A' },
    { root: 'packages/core/src/ui/x/y', lane: 'LANE-B' },
  ];
  const verdict = classifyReservedHit('packages/core/src/ui/x/y/index.ts', rule.appliesToReservedPattern, roots, rule);
  assert.equal(verdict.barrelClass, 'unclassified');
  assert.equal(verdict.classification, 'blocking');
});

test('DRILL: admission now sees packages/core/src/index.ts, which the naive matcher missed', () => {
  assert.equal(matchesReserved('packages/core/src/index.ts', loadProgramContracts().orchestration.reservedPaths), true);
});

test('DRILL: the barrels category only judges files the adjudicated pattern matches', () => {
  // Regression: the positional classifier once labelled any file sitting above a family root
  // — a README, a .tsx component — as a shared barrel, because the barrels branch classified
  // before checking the pattern.
  const lanes = [
    {
      lane: 'L',
      laneClass: 'family-writer',
      families: [{ sourceOwner: 'packages/core/src/ui/structures/shell/bottom-tab-bar' }],
      writeSet: ['packages/core/src/ui/structures/shell/**'],
      writeSetExcludes: [
        'packages/core/src/ui/structures/shell/**/tests/**',
        'packages/core/src/ui/structures/shell/**/contracts/**',
      ],
    },
  ];
  const violations = findExpansionViolations(lanes);
  const offenders = violations.filter((v) => /README\.md$|\.tsx$/.test(v.file));
  assert.deepEqual(offenders, [], 'non-index files must never be judged as barrels');
});

// --- Real-CLI admission drills -------------------------------------------------------------
// The parity drills above call admitWriterLane directly. These invoke the actual command so
// the wired public path is proven, not merely the function behind it.

const CLI = path.join(import.meta.dirname, 'cli.mjs');
const REPO_ROOT = path.resolve(import.meta.dirname, '../../../../..');

function runCli(args) {
  const result = spawnSync(process.execPath, [CLI, ...args], { cwd: REPO_ROOT, encoding: 'utf8' });
  return { code: result.status, stdout: result.stdout ?? '' };
}

function writeCliFixture(directory, name, value) {
  const file = path.join(directory, name);
  fs.writeFileSync(file, JSON.stringify(value, null, 2));
  return file;
}

function cliFixtures() {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'rottay-admission-cli-'));
  const inputs = 'packages/core/src/ui/primitives/inputs';
  const proposal = writeCliFixture(directory, 'proposal.json', {
    lanes: [
      { lane: 'LANE-A', laneClass: 'family-writer', families: [], writeSet: [`${inputs}/Button/**`] },
      { lane: 'LANE-B', laneClass: 'family-writer', families: [], writeSet: [`${inputs}/Input/**`] },
    ],
  });
  const packetFor = (name, lane, file) =>
    writeCliFixture(directory, name, {
      ...Object.fromEntries(contracts.orchestration.writerHandoffRequiredFields.map((field) => [field, 'declared'])),
      lane,
      laneClass: 'family-writer',
      ownedFiles: [file],
      observableDefect: 'control cluster reads as unrelated defaults',
      responsiveStrategy: 'stack under 480px',
      expectedTenantDivergence: ['color', 'geometry'],
    });
  return {
    directory,
    proposal,
    ownEntrypoint: packetFor('own.json', 'LANE-A', `${inputs}/Button/index.ts`),
    foreignEntrypoint: packetFor('foreign.json', 'LANE-A', `${inputs}/Input/index.ts`),
  };
}

test('CLI DRILL: the real admission command admits a lane owning its own entrypoint', () => {
  const fixtures = cliFixtures();
  const run = runCli(['admission', fixtures.ownEntrypoint, fixtures.proposal]);
  assert.equal(run.code, 0, `expected exit 0, got ${run.code}: ${run.stdout}`);
  const result = JSON.parse(run.stdout);
  assert.equal(result.admitted, true);
  assert.equal(result.proposalSupplied, true);
  assert.equal(result.resolvedLane, 'LANE-A');
  assert.equal(result.adjudicatedEntrypoints[0].owningLane, 'LANE-A');
  fs.rmSync(fixtures.directory, { recursive: true, force: true });
});

test('CLI DRILL: the real admission command blocks a lane claiming another lane\'s entrypoint', () => {
  const fixtures = cliFixtures();
  const run = runCli(['admission', fixtures.foreignEntrypoint, fixtures.proposal]);
  assert.equal(run.code, 1, 'a foreign entrypoint must exit non-zero');
  const result = JSON.parse(run.stdout);
  assert.equal(result.admitted, false);
  assert.ok(
    result.blockers.some((blocker) => blocker.includes('implementation entrypoint of lane LANE-B')),
    `expected a cross-lane ownership blocker, got ${JSON.stringify(result.blockers)}`,
  );
  fs.rmSync(fixtures.directory, { recursive: true, force: true });
});

test('CLI DRILL: the real admission command blocks when the proposal is not supplied', () => {
  const fixtures = cliFixtures();
  const run = runCli(['admission', fixtures.ownEntrypoint]);
  assert.equal(run.code, 1, 'a missing proposal must exit non-zero');
  const result = JSON.parse(run.stdout);
  assert.equal(result.admitted, false);
  assert.equal(result.proposalSupplied, false);
  assert.ok(result.blockers.some((blocker) => blocker.includes('requires the authorized ownership proposal')));
  fs.rmSync(fixtures.directory, { recursive: true, force: true });
});

test('CLI DRILL: a packet whose lane is absent from the proposal is blocked', () => {
  const fixtures = cliFixtures();
  const stray = writeCliFixture(fixtures.directory, 'stray.json', {
    ...JSON.parse(fs.readFileSync(fixtures.ownEntrypoint, 'utf8')),
    lane: 'LANE-NOT-IN-PROPOSAL',
  });
  const run = runCli(['admission', stray, fixtures.proposal]);
  assert.equal(run.code, 1);
  assert.ok(JSON.parse(run.stdout).blockers.some((blocker) => blocker.includes('is not declared in the ownership proposal')));
  fs.rmSync(fixtures.directory, { recursive: true, force: true });
});

test('CLI DRILL: an owned file outside the lane\'s effective write set is blocked', () => {
  const fixtures = cliFixtures();
  const outside = writeCliFixture(fixtures.directory, 'outside.json', {
    ...JSON.parse(fs.readFileSync(fixtures.ownEntrypoint, 'utf8')),
    ownedFiles: ['packages/core/src/ui/primitives/inputs/Input/engines/modern/index.tsx'],
  });
  const run = runCli(['admission', outside, fixtures.proposal]);
  assert.equal(run.code, 1);
  assert.ok(JSON.parse(run.stdout).blockers.some((blocker) => blocker.includes('outside the effective write set of lane LANE-A')));
  fs.rmSync(fixtures.directory, { recursive: true, force: true });
});

test('DRILL: an integrator packet is lane-bound too, not only family-writers', () => {
  // Without this, an integrator could claim a family's own entrypoint with no ownership
  // check at all, because the reserved-path loop is scoped to family-writer.
  const inputs = 'packages/core/src/ui/primitives/inputs';
  const proposal = {
    lanes: [
      { lane: 'LANE-A', laneClass: 'family-writer', families: [], writeSet: [`${inputs}/Button/**`] },
      { lane: 'INT', laneClass: 'architecture-integrator', families: [], writeSet: [`${inputs}/index.ts`] },
    ],
  };
  const base = Object.fromEntries(
    contracts.orchestration.writerHandoffRequiredFields.map((field) => [field, 'declared']),
  );
  const grabbing = {
    ...base,
    lane: 'INT',
    laneClass: 'architecture-integrator',
    ownedFiles: [`${inputs}/Button/index.ts`],
    observableDefect: 'd',
    responsiveStrategy: 's',
    expectedTenantDivergence: ['color'],
  };
  const blocked = admitWriterLane(grabbing, { proposal });
  assert.equal(blocked.admitted, false, 'an integrator claiming a family entrypoint must be blocked');
  assert.ok(blocked.blockers.some((blocker) => blocker.includes('outside the effective write set of lane INT')));

  const legitimate = { ...grabbing, ownedFiles: [`${inputs}/index.ts`] };
  assert.equal(admitWriterLane(legitimate, { proposal }).admitted, true, 'its own barrel must still be admitted');
});

test('DRILL: an unknown laneClass fails closed instead of skipping every ownership check', () => {
  // Gating on "is a writing class" fails OPEN for a class nobody declared: it would skip
  // lane resolution AND the family-writer reserved loop.
  const proposal = { lanes: [{ lane: 'L', laneClass: 'family-writer', families: [], writeSet: ['packages/core/src/ui/primitives/inputs/Button/**'] }] };
  const packet = {
    ...Object.fromEntries(contracts.orchestration.writerHandoffRequiredFields.map((f) => [f, 'declared'])),
    lane: 'L',
    laneClass: 'totally-made-up',
    ownedFiles: ['packages/core/src/index.ts'],
    observableDefect: 'd',
    responsiveStrategy: 's',
    expectedTenantDivergence: ['color'],
  };
  const result = admitWriterLane(packet, { proposal });
  assert.equal(result.admitted, false);
  assert.ok(result.blockers.some((b) => b.includes('unknown laneClass')));
});

test('DRILL: laneClass spoofing cannot dodge the family-writer reserved loop', () => {
  // A family lane declaring itself an integrator would skip the reserved-path adjudication.
  const proposal = { lanes: [{ lane: 'L', laneClass: 'family-writer', families: [], writeSet: ['packages/core/src/ui/primitives/inputs/Button/**'] }] };
  const spoof = {
    ...Object.fromEntries(contracts.orchestration.writerHandoffRequiredFields.map((f) => [f, 'declared'])),
    lane: 'L',
    laneClass: 'architecture-integrator',
    ownedFiles: ['packages/core/src/ui/primitives/inputs/Button/index.ts'],
    observableDefect: 'd',
    responsiveStrategy: 's',
    expectedTenantDivergence: ['color'],
  };
  const result = admitWriterLane(spoof, { proposal });
  assert.equal(result.admitted, false);
  assert.ok(result.blockers.some((b) => b.includes('declares laneClass architecture-integrator but the proposal declares family-writer')));
});

test('DRILL: a not-yet-existing file inside the lane scope is admissible, outside it is not', () => {
  // admission runs BEFORE the write, so refusing every nonexistent claim would make the gate
  // unsatisfiable for exactly the work it authorizes.
  const button = 'packages/core/src/ui/primitives/inputs/Button';
  const proposal = { lanes: [{ lane: 'QI', laneClass: 'quality-integrator', families: [], writeSet: [`${button}/**/tests/**`] }] };
  const packetFor = (file) => ({
    ...Object.fromEntries(contracts.orchestration.writerHandoffRequiredFields.map((f) => [f, 'declared'])),
    lane: 'QI',
    laneClass: 'quality-integrator',
    ownedFiles: [file],
    observableDefect: 'd',
    responsiveStrategy: 's',
    expectedTenantDivergence: ['color'],
  });
  assert.equal(admitWriterLane(packetFor(`${button}/tests/Button.not-yet.test.tsx`), { proposal }).admitted, true);

  const outside = admitWriterLane(packetFor(`${button}/engines/modern/NotYet.tsx`), { proposal });
  assert.equal(outside.admitted, false);
  assert.ok(outside.blockers.some((b) => b.includes('does not exist yet and is outside the declared write scope')));
});

test('DRILL: laneScopeContains agrees with effectiveFiles on every real file of every R0 lane', () => {
  // The intensional twin must not be looser than the extensional authority it stands in for.
  const proposal = JSON.parse(
    fs.readFileSync(
      path.join(import.meta.dirname, '../../../test-artifacts/quality-evidence/wo-cra-23/R0/receipts/r1-canary-ownership-proposal.json'),
      'utf8',
    ),
  );
  let checked = 0;
  for (const lane of proposal.lanes) {
    for (const file of effectiveFiles(lane)) {
      assert.equal(laneScopeContains(lane, file), true, `${lane.lane} expands ${file} but its declared scope does not cover it`);
      checked++;
    }
  }
  assert.ok(checked > 100, `expected a substantial sweep, checked ${checked}`);
});

test('DRILL: the analyzer owning-lane invariant is asserted, not assumed', () => {
  // Every permitted entry the analyzer emits must name the lane it was found under.
  const proposal = JSON.parse(
    fs.readFileSync(
      path.join(import.meta.dirname, '../../../test-artifacts/quality-evidence/wo-cra-23/R0/receipts/r1-canary-ownership-proposal.json'),
      'utf8',
    ),
  );
  const analysis = analyzeOwnershipProposal(proposal);
  assert.ok(analysis.permittedByContractRule.length > 0);
  for (const entry of analysis.permittedByContractRule) {
    assert.equal(entry.owningLane, entry.lane, `${entry.file} permitted under ${entry.lane} but owned by ${entry.owningLane}`);
  }
});

// --- R1 executable-plan drills --------------------------------------------------------------
const R1_PROPOSAL = JSON.parse(
  fs.readFileSync(
    path.join(import.meta.dirname, '../../../test-artifacts/quality-evidence/wo-cra-23/R0/receipts/r1-canary-ownership-proposal.json'),
    'utf8',
  ),
);
const R1_DOMAINS = loadRoundWriteDomains('R1');

function withoutLane(laneName) {
  return { ...R1_PROPOSAL, lanes: R1_PROPOSAL.lanes.filter((lane) => lane.lane !== laneName) };
}

test('DRILL: the reference lab losing its owner turns the plan red', () => {
  const findings = checkDomainCoverage(withoutLane('R1-reference-lab'), R1_DOMAINS);
  assert.ok(findings.some((f) => f.domainId === 'reference-lab' && f.issue === 'no owner'));
});

test('DRILL: the R1 evidence surface losing its owner turns the plan red', () => {
  const stripped = {
    ...R1_PROPOSAL,
    lanes: R1_PROPOSAL.lanes.map((lane) =>
      lane.lane === 'R1-quality-integrator'
        ? { ...lane, writeSet: lane.writeSet.filter((w) => !w.includes('wo-cra-23/R1')) }
        : lane,
    ),
  };
  const findings = checkDomainCoverage(stripped, R1_DOMAINS);
  assert.ok(findings.some((f) => f.domainId === 'round-evidence' && f.issue === 'no owner'));
});

test('DRILL: a writing lane with no declared readSet turns the plan red', () => {
  const stripped = {
    ...R1_PROPOSAL,
    lanes: R1_PROPOSAL.lanes.map((lane) => (lane.lane === 'R1-reference-lab' ? { ...lane, readSet: [] } : lane)),
  };
  const analysis = analyzeOwnershipProposal(stripped, { roundWriteDomains: R1_DOMAINS });
  assert.equal(analysis.conflictFree, false);
  assert.ok(analysis.lanesMissingReadSet.includes('R1-reference-lab'));
});

test('DRILL: a read/write anatomy dependency is COMPUTED from real imports, not asserted', () => {
  const edges = deriveAnatomyEdges(R1_PROPOSAL.lanes);
  assert.ok(edges.length > 0, 'the analyzer must find real consumption edges');
  // Anchored on a hand-verified line: Card.stories.tsx:15 is literally
  // `import { Button } from '../../inputs/Button';` — a direct-path import, not a barrel.
  // Two earlier versions of this drill asserted edges that did NOT exist: first a
  // list-toolbar -> data-table edge (a prose comment in an excluded contracts file), then a
  // data-table -> Button edge that the resolver only produced by fanning a `primitives`
  // category-barrel import out to every lane beneath it. Both times the drill was wrong.
  const cardToButton = edges.find(
    (e) => e.from === 'R1-Card-SemanticSurface' && e.to === 'R1-Button-and-action-cluster',
  );
  assert.ok(cardToButton, `expected the Card -> Button consumption edge, got ${edges.length} edges`);
  assert.equal(cardToButton.via, 'direct-file');

  for (const edge of edges) {
    assert.equal(edge.condition, 'consumes-anatomy');
    assert.notEqual(edge.from, edge.to);
    assert.ok(edge.reason.includes('imports'), 'every edge must cite the import that produced it');
    assert.ok(['direct-file', 'named-through-barrel'].includes(edge.via), 'every edge must state how it was resolved');
  }
});

test('DRILL: a category-barrel import does not fan out to every lane beneath it', () => {
  // The defect this closes: `import { Button } from "../../../primitives"` once produced an
  // edge to ALL six lanes owning anything under primitives, so five of them were fabricated.
  const edges = deriveAnatomyEdges(R1_PROPOSAL.lanes);
  for (const edge of edges.filter((e) => e.via === 'named-through-barrel')) {
    const target = R1_PROPOSAL.lanes.find((l) => l.lane === edge.to);
    const names = (target.families ?? []).map((f) => f.family);
    assert.ok(
      names.some((name) => edge.reason.includes(name)),
      `barrel-mediated edge to ${edge.to} must name one of its families, got: ${edge.reason}`,
    );
  }
});

test('DRILL: two lanes requesting the same shared authority produce a sequencing edge', () => {
  const edges = deriveSharedAuthorityEdges(R1_PROPOSAL, R1_DOMAINS);
  assert.ok(edges.length > 0);
  assert.ok(edges.some((e) => e.condition === 'same-reserved-authority'));
  // Every edge must name two distinct lanes; a self-edge would be a computation bug.
  for (const edge of edges) assert.notEqual(edge.from, edge.to);
});

test('DRILL: two lanes claiming the same PROSPECTIVE path turn the plan red before the file exists', () => {
  const clashing = {
    ...R1_PROPOSAL,
    lanes: [
      ...R1_PROPOSAL.lanes,
      {
        lane: 'R1-intruder',
        laneClass: 'family-writer',
        families: [],
        writeSet: ['packages/showroom/src/app/probe/ds-reference/**'],
        writeSetExcludes: [],
        readSet: ['packages/core/src/ui/**'],
      },
    ],
  };
  const conflicts = findProspectiveWriterConflicts(clashing.lanes);
  assert.ok(conflicts.some((c) => c.leftLane === 'R1-reference-lab' || c.rightLane === 'R1-reference-lab'));
  assert.equal(analyzeOwnershipProposal(clashing, { roundWriteDomains: R1_DOMAINS }).conflictFree, false);
});

test('DRILL: a lane claiming a declared no-write domain turns the plan red', () => {
  const trespass = {
    ...R1_PROPOSAL,
    lanes: R1_PROPOSAL.lanes.map((lane) =>
      lane.lane === 'R1-reference-lab' ? { ...lane, writeSet: [...lane.writeSet, 'roadmap/**'] } : lane,
    ),
  };
  const findings = checkDomainCoverage(trespass, R1_DOMAINS);
  assert.ok(findings.some((f) => f.issue === 'no-write domain is claimed' && f.domainId === 'roadmap'));
});

// --- Adversarial drills for the hardened R1 gate -------------------------------------------
const R1_DOM = loadRoundWriteDomains('R1');
const R1_PLAN = JSON.parse(
  fs.readFileSync(
    path.join(import.meta.dirname, '../../../test-artifacts/quality-evidence/wo-cra-23/R0/receipts/r1-canary-ownership-proposal.json'),
    'utf8',
  ),
);

test('ADVERSARIAL: importing your own module creates no edge to the contracts/tests integrators', () => {
  // The defect: a mid-path glob was truncated to its module root, so `Button/**/contracts/**`
  // read as ownership of all of Button and a module importing itself "consumed" the integrators.
  const edges = deriveAnatomyEdges(R1_PLAN.lanes);
  for (const edge of edges.filter((e) => e.to.includes('integrator') && e.via === 'direct-file')) {
    const target = R1_PLAN.lanes.find((l) => l.lane === edge.to);
    assert.ok(
      laneScopeContains(target, edge.resolvedFile),
      `${edge.to} must really own ${edge.resolvedFile}, otherwise the edge is a truncation artifact`,
    );
  }
  assert.equal(probePath('a/**/contracts/**'), 'a/probe/contracts/probe', 'a probe must preserve the channel');
});

test('ADVERSARIAL: a junk or omitted readSet turns the plan red', () => {
  const junk = {
    ...R1_PLAN,
    lanes: R1_PLAN.lanes.map((l) => (l.laneClass === 'family-writer' ? { ...l, readSet: ['x'] } : l)),
  };
  assert.ok(checkReadSetsAgainstDerivation(junk, deriveAnatomyEdges(junk.lanes)).length > 0);
  assert.equal(analyzeOwnershipProposal(junk, { roundWriteDomains: R1_DOM }).conflictFree, false);
});

test('ADVERSARIAL: a request whose target does not own the path turns the plan red', () => {
  const bogus = {
    ...R1_PLAN,
    lanes: R1_PLAN.lanes.map((l) =>
      l.lane === 'R1-Button-and-action-cluster'
        ? {
            ...l,
            sharedRequests: [
              { requestId: 'X', fromLane: l.lane, targetLane: 'R1-quality-integrator', domainId: 'shared-barrels', paths: ['packages/core/src/ui/primitives/inputs/Button/index.ts'], change: 'modify', reason: 'r' },
            ],
          }
        : l,
    ),
  };
  const findings = checkSharedRequests(bogus);
  assert.ok(findings.some((f) => f.issue === 'request target does not own the requested path'));
  assert.ok(findings.some((f) => f.issue === 'lane requests a path it already owns'));
});

test('ADVERSARIAL: losing ONE canary root turns the plan red, not just losing all of them', () => {
  const dropped = {
    ...R1_PLAN,
    lanes: R1_PLAN.lanes.filter((l) => l.lane !== 'R1-Card-SemanticSurface'),
  };
  const findings = checkDomainUnitCoverage(dropped, R1_DOM);
  assert.ok(findings.some((f) => f.issue === 'unit has no owner'), 'a single unowned canary root must be caught');
  assert.equal(analyzeOwnershipProposal(dropped, { roundWriteDomains: R1_DOM }).conflictFree, false);
});

test('ADVERSARIAL: a showroom write outside the reference lab turns the plan red', () => {
  const trespass = {
    ...R1_PLAN,
    lanes: R1_PLAN.lanes.map((l) =>
      l.lane === 'R1-reference-lab'
        ? { ...l, writeSet: [...l.writeSet, 'packages/showroom/src/app/probe/kit-inventory/**'] }
        : l,
    ),
  };
  const findings = checkNoWriteExceptions(trespass, R1_DOM);
  assert.ok(findings.some((f) => f.domainId === 'product-applications'));
  assert.equal(analyzeOwnershipProposal(trespass, { roundWriteDomains: R1_DOM }).conflictFree, false);
});

test('ADVERSARIAL: an unsequenced intra-cohort edge changes the verdict', () => {
  const undeclared = { ...R1_PLAN, declaredEdges: [] };
  const edges = [
    ...deriveAnatomyEdges(undeclared.lanes),
    ...deriveSharedAuthorityEdges(undeclared, R1_DOM),
  ];
  assert.ok(findUnsequencedCohortEdges(undeclared, edges).length > 0, 'edges must govern, not decorate');
  assert.equal(analyzeOwnershipProposal(undeclared, { roundWriteDomains: R1_DOM }).conflictFree, false);
});

test('ADVERSARIAL: a no-write rule expressed with an unsupported matcher cannot pass vacuously', () => {
  // The previous product-applications rule used a negative lookahead the matcher dropped,
  // so it always passed. The supported form is (root, allowedRoots).
  const rule = R1_DOM.noWriteExcept.find((r) => r.domainId === 'product-applications');
  assert.ok(rule, 'the exception must be expressed as a supported rule, not a lookahead glob');
  assert.ok(Array.isArray(rule.allowedRoots) && rule.allowedRoots.length > 0);
  assert.ok(!JSON.stringify(rule).includes('(?!'), 'no unsupported matcher may remain');
});

test('ADVERSARIAL: the analysis cache never serves a stale listing for a mutable root', () => {
  // Caching is scoped to REPOSITORY_ROOT, which no analysis writes. A temporary root — which
  // drills DO write — must bypass the cache entirely, or a later check could read a listing
  // taken before the write.
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'rottay-cache-'));
  fs.mkdirSync(path.join(directory, 'pkg'), { recursive: true });
  fs.writeFileSync(path.join(directory, 'pkg', 'a.ts'), 'export const a = 1;');

  const first = expandEntry('pkg/**', { root: directory });
  assert.deepEqual(first, ['pkg/a.ts']);

  fs.writeFileSync(path.join(directory, 'pkg', 'b.ts'), 'export const b = 2;');
  const second = expandEntry('pkg/**', { root: directory });
  assert.deepEqual(second, ['pkg/a.ts', 'pkg/b.ts'], 'a mutable root must never be served from cache');

  fs.rmSync(directory, { recursive: true, force: true });
});

test('ADVERSARIAL: caching does not change any analysis result', () => {
  // The speedup must be pure memoization. Clearing the caches and recomputing must produce
  // byte-identical findings, or the cache is deciding outcomes rather than reusing work.
  const before = analyzeOwnershipProposal(R1_PLAN, { roundWriteDomains: R1_DOM });
  clearAnalysisCaches();
  const after = analyzeOwnershipProposal(R1_PLAN, { roundWriteDomains: R1_DOM });
  assert.equal(after.conflictFree, before.conflictFree);
  assert.equal(after.edges.anatomy.length, before.edges.anatomy.length);
  assert.deepEqual(
    after.edges.anatomy.map((e) => e.key).sort(),
    before.edges.anatomy.map((e) => e.key).sort(),
  );
  assert.equal(after.readSetFindings.length, before.readSetFindings.length);
  assert.equal(after.sharedRequestFindings.length, before.sharedRequestFindings.length);
});

// --- Seventh-denial reproductions, pinned ---------------------------------------------------
function r1Clone() {
  return JSON.parse(JSON.stringify(R1_PLAN));
}

test('ADVERSARIAL: a unit owned by the WRONG lane class turns the plan red', () => {
  // Uniqueness alone failed open: the existential class check was satisfied by any sibling of
  // the right class, so one canary root could be owned by a lab-writer and still pass.
  const p = r1Clone();
  p.lanes.find((l) => l.lane === 'R1-Button-and-action-cluster').laneClass = 'lab-writer';
  const findings = checkDomainUnitCoverage(p, R1_DOM);
  assert.ok(findings.some((f) => f.issue === 'unit owner has the wrong lane class'));
  assert.equal(analyzeOwnershipProposal(p, { roundWriteDomains: R1_DOM }).conflictFree, false);
});

test('ADVERSARIAL: a request naming a domain outside the registry turns the plan red', () => {
  const p = r1Clone();
  p.lanes.find((l) => l.lane === 'R1-reference-lab').sharedRequests[0].domainId = 'invented-domain';
  const findings = checkSharedRequests(p, { roundWriteDomains: R1_DOM });
  assert.ok(findings.some((f) => f.issue === 'request names a domain that is not in the round registry'));
  assert.equal(analyzeOwnershipProposal(p, { roundWriteDomains: R1_DOM }).conflictFree, false);
});

test('ADVERSARIAL: a request whose target is not the authoritative class turns the plan red', () => {
  const p = r1Clone();
  const request = p.lanes.find((l) => l.lane === 'R1-Button-and-action-cluster').sharedRequests[0];
  request.targetLane = 'R1-quality-integrator'; // contracts belong to the architecture integrator
  const findings = checkSharedRequests(p, { roundWriteDomains: R1_DOM });
  assert.ok(findings.some((f) => f.issue === 'request target is not the authoritative class for the domain'));
});

test('ADVERSARIAL: an incomplete request schema turns the plan red', () => {
  const p = r1Clone();
  p.lanes.find((l) => l.lane === 'R1-reference-lab').sharedRequests = [
    { domainId: 'round-evidence', targetLane: 'R1-quality-integrator', paths: ['x'], reason: 'r' },
  ];
  const findings = checkSharedRequests(p, { roundWriteDomains: R1_DOM });
  for (const issue of [
    'request has no requestId',
    'request fromLane does not match its container lane',
    'request declares an unsupported change',
    'request dependsOnCompletion must be a boolean',
  ]) {
    assert.ok(findings.some((f) => f.issue === issue), `missing check: ${issue}`);
  }
});

test('ADVERSARIAL: a reversed declared edge (a two-node cycle) turns the plan red', () => {
  // Reducing an edge to a sorted unordered pair let the reverse of a real edge satisfy the
  // very sequencing requirement it breaks.
  const p = r1Clone();
  const first = p.declaredEdges[0];
  p.declaredEdges.push({ ...first, from: first.to, to: first.from });
  const derived = [
    ...deriveAnatomyEdges(p.lanes),
    ...deriveSharedAuthorityEdges(p, R1_DOM),
  ];
  const findings = checkDeclaredEdges(p, derived);
  assert.ok(findings.length > 0, 'a reversed edge must be caught');
  assert.equal(analyzeOwnershipProposal(p, { roundWriteDomains: R1_DOM }).conflictFree, false);
});

test('ADVERSARIAL: a declared edge with no derived counterpart or no sequencing turns the plan red', () => {
  const p = r1Clone();
  p.declaredEdges = [
    { from: 'R1-reference-lab', to: 'R1-architecture-integrator', cohort: 1, condition: 'consumes-anatomy', sequencing: '' },
  ];
  const findings = checkDeclaredEdges(p, []);
  assert.ok(findings.some((f) => f.issue === 'declared edge has no derived counterpart in that direction'));
  assert.ok(findings.some((f) => f.issue === 'edge declares no sequencing'));
});

test('ADVERSARIAL: the declared sequencing graph is proven acyclic, not assumed', () => {
  const derived = [...deriveAnatomyEdges(R1_PLAN.lanes), ...deriveSharedAuthorityEdges(R1_PLAN, R1_DOM)];
  const findings = checkDeclaredEdges(R1_PLAN, derived);
  assert.deepEqual(findings, [], `the sealed plan must have a clean edge graph, got ${JSON.stringify(findings.slice(0, 3))}`);
});

test('ADVERSARIAL: a shared authority split across two singleton lanes turns the plan red', () => {
  // The exact mutation: carve one real file out of the architecture integrator and give it to
  // a SECOND architecture integrator. No file collision, no prospective overlap, full domain
  // coverage — and yet two owners of a contractual singleton authority.
  const p = r1Clone();
  const file = 'packages/core/src/foundation/tokens/prototype-ledger.schema.json';
  const arch = p.lanes.find((l) => l.lane === 'R1-architecture-integrator');
  arch.writeSetExcludes = [...(arch.writeSetExcludes ?? []), file];
  p.lanes.push({
    lane: 'R1-architecture-integrator-2',
    canary: null,
    laneClass: 'architecture-integrator',
    families: [],
    writeSet: [file],
    writeSetExcludes: [],
    readSet: ['packages/core/src/ui/**'],
    sharedRequests: [],
  });

  const analysis = analyzeOwnershipProposal(p, { roundWriteDomains: R1_DOM });
  assert.equal(analysis.ownershipCollisions.length, 0, 'the split is deliberately non-overlapping');
  assert.equal(analysis.prospectiveWriterConflicts.length, 0);
  assert.ok(analysis.singletonCardinalityFindings.some((f) => f.laneClass === 'architecture-integrator'));
  assert.equal(analysis.conflictFree, false, 'two owners of a singleton authority must turn the plan red');
});

test('ADVERSARIAL: a duplicate quality-integrator turns the plan red too', () => {
  const p = r1Clone();
  p.lanes.push({
    lane: 'R1-quality-integrator-2',
    canary: null,
    laneClass: 'quality-integrator',
    families: [],
    writeSet: ['packages/core/tests/**'],
    writeSetExcludes: [],
    readSet: ['packages/core/src/ui/**'],
    sharedRequests: [],
  });
  const analysis = analyzeOwnershipProposal(p, { roundWriteDomains: R1_DOM });
  assert.ok(analysis.singletonCardinalityFindings.some((f) => f.laneClass === 'quality-integrator'));
  assert.equal(analysis.conflictFree, false);
});

test('ADVERSARIAL: singleton classes are DERIVED from the contract, not hardcoded', () => {
  const declared = Object.entries(contracts.orchestration.laneTypes)
    .filter(([, definition]) => definition.singleton === true)
    .map(([name]) => name)
    .sort();
  assert.deepEqual(declared, ['architecture-integrator', 'quality-integrator']);

  // A contract that marks a further class singleton must bind it without a code change.
  const extended = {
    ...contracts,
    orchestration: {
      ...contracts.orchestration,
      laneTypes: { ...contracts.orchestration.laneTypes, 'lab-writer': { writes: true, singleton: true } },
    },
  };
  const p = r1Clone();
  p.lanes.push({ ...p.lanes.find((l) => l.lane === 'R1-reference-lab'), lane: 'R1-reference-lab-2' });
  assert.ok(checkSingletonCardinality(p, { contracts: extended }).some((f) => f.laneClass === 'lab-writer'));
});

test('the legitimate multi-lane family partition is NOT caught by singleton cardinality', () => {
  // family-writer is not a singleton class: twelve canary lanes are correct, and unit
  // coverage — not cardinality — is what enforces one owner per canary root.
  const analysis = analyzeOwnershipProposal(R1_PLAN, { roundWriteDomains: R1_DOM });
  assert.equal(R1_PLAN.lanes.filter((l) => l.laneClass === 'family-writer').length, 12);
  assert.deepEqual(analysis.singletonCardinalityFindings, []);
  assert.equal(analysis.conflictFree, true);
});
