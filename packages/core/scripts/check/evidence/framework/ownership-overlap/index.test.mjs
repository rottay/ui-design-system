/**
 * Drills for ownership overlap and the executable round plan.
 *
 * Two lanes that can write the same real file is the failure this module
 * exists to make impossible, and every way of hiding it -- a glob that contains
 * another, an exclusion that only claims to resolve an overlap, a prospective
 * path neither lane has created yet -- has a drill here.
 */

import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import { packageRoot as findPackageRoot } from '../../../../libraries/repo-root/index.mjs';
import {
  loadProgramContracts,
  roundEvidenceRelativePath,
  REPOSITORY_ROOT,
} from '../contracts/index.mjs';
import {
  clearAnalysisCaches,
  globRelationship,
  effectiveFiles,
  laneScopeContains,
  findOwnershipCollisions,
  patternToRegex,
  expandEntry,
  classifyReservedHit,
  findExpansionViolations,
  analyzeOwnershipProposal,
  checkDomainCoverage,
  deriveAnatomyEdges,
  deriveSharedAuthorityEdges,
  findProspectiveWriterConflicts,
  loadRoundWriteDomains,
  checkDomainUnitCoverage,
  checkNoWriteExceptions,
  probePath,
  checkSharedRequests,
  findUnsequencedCohortEdges,
  checkReadSetsAgainstDerivation,
  checkDeclaredEdges,
  checkSingletonCardinality,
} from './index.mjs';

const contracts = loadProgramContracts();

/**
 * The R0 canary proposal is SEALED evidence. It is located through the live
 * program contract instead of a hardcoded path, so a round relocation moves the
 * drills with it and the receipt is never rewritten to keep a test green.
 */
function r0ProposalPath() {
  return path.join(
    REPOSITORY_ROOT,
    roundEvidenceRelativePath(contracts, 'R0'),
    'receipts/r1-canary-ownership-proposal.json',
  );
}

/**
 * The receipt's writeSets name the UI root as it was spelled at the SHA the
 * receipt was sealed at: `packages/core/src/ui/**` with PascalCase family
 * folders. Re-anchoring IN MEMORY is what makes the cohort measurable against
 * the tree that exists now; rewriting the sealed file to the same effect would
 * destroy the evidence it is.
 *
 * The fold is resolved against GIT-TRACKED paths, not against the filesystem.
 * `existsSync` would resolve `.../inputs/Button` on a case-insensitive
 * filesystem and fail on a case-sensitive one, which is the exact class of
 * macOS-only false green this programme exists to remove.
 */
const R0_SEALED_ROOT = ['packages/core/src', 'ui/'].join('/');
const R0_LIVE_ROOT = 'packages/core/src/components/';

const canonicalFold = (value) => value.toLowerCase().replace(/[^a-z0-9]/g, '');

let trackedDirectoriesByFold = null;
function trackedDirectoryFold() {
  if (trackedDirectoriesByFold) return trackedDirectoriesByFold;
  const listed = spawnSync('git', ['ls-files', '-z', 'packages/core/src/components'], {
    cwd: REPOSITORY_ROOT,
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
  });
  assert.equal(listed.status, 0, 'git ls-files must succeed; the fold is resolved against the index');
  const byFold = new Map();
  for (const file of listed.stdout.split('\0')) {
    if (!file) continue;
    const segments = file.split('/');
    for (let end = segments.length - 1; end > 0; end--) {
      const directory = segments.slice(0, end).join('/');
      const key = canonicalFold(directory);
      const seen = byFold.get(key);
      if (seen && seen !== directory) {
        throw new Error(`canonical fold ${key} is ambiguous: ${seen} and ${directory}`);
      }
      byFold.set(key, directory);
    }
  }
  trackedDirectoriesByFold = byFold;
  return byFold;
}

/**
 * Resolve one sealed writeSet entry onto its tracked path. A pattern whose
 * root does not resolve is returned unchanged, so it expands to nothing and the
 * per-lane floor reports it loudly instead of the fold silently inventing a
 * path.
 */
function reanchorEntry(entry) {
  const relocated = entry.split(R0_SEALED_ROOT).join(R0_LIVE_ROOT);
  const [head, ...rest] = relocated.split('/**');
  const tracked = trackedDirectoryFold().get(canonicalFold(head));
  return tracked ? [tracked, ...rest].join('/**') : relocated;
}

function r0Proposal({ reanchored = true } = {}) {
  const proposal = JSON.parse(fs.readFileSync(r0ProposalPath(), 'utf8'));
  if (!reanchored) return proposal;
  return {
    ...proposal,
    lanes: proposal.lanes.map((lane) => ({
      ...lane,
      ...(lane.writeSet ? { writeSet: lane.writeSet.map(reanchorEntry) } : {}),
      ...(lane.writeSetExcludes ? { writeSetExcludes: lane.writeSetExcludes.map(reanchorEntry) } : {}),
      ...(lane.readSet ? { readSet: lane.readSet.map(reanchorEntry) } : {}),
      ...(lane.families
        ? {
            families: lane.families.map((family) => ({
              ...family,
              ...(family.sourceOwner ? { sourceOwner: reanchorEntry(family.sourceOwner) } : {}),
            })),
          }
        : {}),
    })),
  };
}

/**
 * The round write-domain registry was relocated by the same blanket rewrite as
 * the receipt and carries the pre-fold PascalCase family folders
 * (`.../inputs/Button`), which git has never contained. It is a lane-C
 * authority, so it is folded HERE, in memory, and never edited: the drills
 * below compare two spellings of the same path, and comparing a tracked
 * spelling against an untracked one would report a false "unit has no owner".
 */
function foldDomains(domains) {
  const foldPath = (value) => (typeof value === 'string' ? reanchorEntry(value) : value);
  return {
    ...domains,
    ...(domains.required
      ? {
          required: domains.required.map((domain) => ({
            ...domain,
            ...(domain.units ? { units: domain.units.map(foldPath) } : {}),
            ...(domain.globs ? { globs: domain.globs.map(foldPath) } : {}),
          })),
        }
      : {}),
  };
}

/** Lanes that declare a writeSet but expand to nothing. */
function vacuousLanes(proposal) {
  return proposal.lanes
    .filter((lane) => (lane.writeSet ?? []).length > 0 && effectiveFiles(lane).size === 0)
    .map((lane) => lane.lane);
}

// --- R1 executable-plan drills --------------------------------------------------------------
const R1_PROPOSAL = r0Proposal();
const R1_DOMAINS = foldDomains(loadRoundWriteDomains('R1'));

function withoutLane(laneName) {
  return { ...R1_PROPOSAL, lanes: R1_PROPOSAL.lanes.filter((lane) => lane.lane !== laneName) };
}

// --- Adversarial drills for the hardened R1 gate -------------------------------------------
const R1_DOM = foldDomains(loadRoundWriteDomains('R1'));
const R1_PLAN = r0Proposal();

// --- Seventh-denial reproductions, pinned ---------------------------------------------------
function r1Clone() {
  return JSON.parse(JSON.stringify(R1_PLAN));
}

// --- Singleton cardinality, isolated from the rest of the topology ----------
//
// The singleton law is about ONE THING: how many lanes claim a lane class the
// contract marks singleton. Asserting it against the real R1 plan mixed it with
// every other law the analyzer runs -- file collisions, glob expansion, domain
// coverage, readSet hygiene, edge sequencing -- so the verdict moved whenever
// any unrelated law did. That is what made the previous
// `assert.equal(analysis.conflictFree, true)` fail: on the sealed R1 proposal
// `singletonCardinalityFindings` is already `[]` (the law under test passes),
// while `conflictFree` is false for 2 expansion violations and 7 readSet
// findings that say nothing about cardinality.
//
// The fix is isolation, not a weaker assertion. This probe keeps the thing the
// law actually reads -- the real R1 lane NAMES and CLASSES, 12 family-writers
// and one of each integrator -- and empties everything the law does not read:
// writeSet, readSet, sharedRequests, cohorts and edges, analyzed against empty
// round write domains. With no file topology left to violate, `conflictFree`
// becomes a faithful readout of cardinality alone, so it can be asserted in
// BOTH directions without borrowing a verdict from an unrelated law.
const SINGLETON_PROBE_LANE = Object.freeze({
  lane: '',
  canary: null,
  laneClass: '',
  families: [],
  writeSet: [],
  writeSetExcludes: [],
  readSet: [],
  sharedRequests: [],
});

function singletonProbePlan(extraLanes = []) {
  return {
    schemaVersion: 2,
    checkpointCohorts: [],
    declaredEdges: [],
    lanes: [
      ...R1_PLAN.lanes.map((lane) => ({
        ...SINGLETON_PROBE_LANE,
        lane: lane.lane,
        canary: lane.canary,
        laneClass: lane.laneClass,
      })),
      ...extraLanes,
    ],
  };
}

const analyzeSingletonProbe = (plan) => analyzeOwnershipProposal(plan, { roundWriteDomains: {} });

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
    { lane: 'A', laneClass: 'family-writer', writeSet: ['packages/core/src/components/patterns/data/**'] },
    { lane: 'B', laneClass: 'family-writer', writeSet: ['packages/core/src/components/patterns/data/saved-views/**'] },
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
      writeSet: ['packages/core/src/components/patterns/data/**'],
      writeSetExcludes: ['packages/core/src/components/patterns/data/saved-views/**'],
    },
    { lane: 'B', laneClass: 'family-writer', writeSet: ['packages/core/src/components/patterns/data/saved-views/**'] },
  ];
  assert.equal(findOwnershipCollisions(withExclusion).length, 0);

  const withoutExclusion = withExclusion.map(({ writeSetExcludes, ...lane }) => lane);
  assert.ok(findOwnershipCollisions(withoutExclusion).length > 0);
});

test('NEGATIVE DRILL: an ownership proposal cannot assert conflictFree — it is computed', () => {
  const proposal = {
    ownershipCollisions: [],
    conflictFree: true,
    checkpointCohorts: [['a', 'b']],
    lanes: [
      { lane: 'A', canary: 'a', laneClass: 'family-writer', writeSet: ['packages/core/src/components/patterns/data/**'] },
      { lane: 'B', canary: 'b', laneClass: 'family-writer', writeSet: ['packages/core/src/components/patterns/data/widget-board/**'] },
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
    { lane: 'A-broad', laneClass: 'family-writer', writeSet: ['packages/core/src/components/patterns/data/**'] },
    { lane: 'B-child', laneClass: 'family-writer', writeSet: ['packages/core/src/components/patterns/data/saved-views/**'] },
  ];
  const violations = findExpansionViolations(lanes);
  const barrel = violations.find((v) => v.file === 'packages/core/src/components/patterns/data/index.ts');
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
    writeSet: ['packages/core/src/components/patterns/data/data-table/**'],
    writeSetExcludes: [
      'packages/core/src/components/patterns/data/data-table/**/tests/**',
      'packages/core/src/components/patterns/data/data-table/**/contracts/**',
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

test('DRILL: a category-grade family root still yields shared-barrel for its own index', () => {
  // Exercises the ancestor clause, which fires zero times on the real R1 tree. Synthetic on
  // purpose: an unexercised contract clause is decorative.
  const rule = loadProgramContracts().orchestration.barrelOwnership;
  const roots = [
    { root: 'packages/core/src/components/structures/shell', lane: 'L' },
    { root: 'packages/core/src/components/structures/shell/bottom-tab-bar', lane: 'L' },
  ];
  const parent = classifyReservedHit('packages/core/src/components/structures/shell/index.ts', rule.appliesToReservedPattern, roots, rule);
  assert.equal(parent.barrelClass, 'shared-barrel');

  const nested = classifyReservedHit('packages/core/src/components/structures/shell/bottom-tab-bar/index.ts', rule.appliesToReservedPattern, roots, rule);
  assert.equal(nested.barrelClass, 'implementation-entrypoint');
  assert.equal(nested.owningFamilyRoot, 'packages/core/src/components/structures/shell/bottom-tab-bar');
});

test('DRILL: a directory inside two lanes roots fails closed rather than picking one', () => {
  const rule = loadProgramContracts().orchestration.barrelOwnership;
  const roots = [
    { root: 'packages/core/src/components/x', lane: 'LANE-A' },
    { root: 'packages/core/src/components/x/y', lane: 'LANE-B' },
  ];
  const verdict = classifyReservedHit('packages/core/src/components/x/y/index.ts', rule.appliesToReservedPattern, roots, rule);
  assert.equal(verdict.barrelClass, 'unclassified');
  assert.equal(verdict.classification, 'blocking');
});

test('DRILL: laneScopeContains agrees with effectiveFiles on every real file of every R0 lane', () => {
  // The intensional twin must not be looser than the extensional authority it
  // stands in for.
  //
  // The floor is PER LANE, not aggregate. An aggregate `checked > 100` is
  // satisfied by three integrator lanes alone, so the twelve family-writer
  // lanes this drill exists to protect can all collapse to zero files while it
  // stays green -- which is exactly what the sealed spelling does against the
  // current tree. A per-lane floor turns that silent cohort collapse into a
  // loud failure.
  const proposal = r0Proposal();
  let checked = 0;
  for (const lane of proposal.lanes) {
    const files = effectiveFiles(lane);
    if ((lane.writeSet ?? []).length > 0) {
      assert.ok(
        files.size > 0,
        `${lane.lane} declares a writeSet that expands to no file; the cohort it names is gone`,
      );
    }
    for (const file of files) {
      assert.equal(
        laneScopeContains(lane, file),
        true,
        `${lane.lane} expands ${file} but its declared scope does not cover it`,
      );
      checked++;
    }
  }
  // Non-vacuity for the sweep itself: the per-lane floor above is the real
  // claim, but a proposal that lost its lanes entirely would satisfy it
  // vacuously.
  assert.ok(proposal.lanes.length >= 15, `expected the full lane roster, got ${proposal.lanes.length}`);
  assert.ok(checked > 100, `expected a substantial sweep, checked ${checked}`);
});

test('DRILL: the per-lane floor is red on the sealed src/ui spelling', () => {
  // The mutant that proves the floor above has teeth. Reading the receipt
  // WITHOUT the in-memory re-anchor reproduces the exact state the aggregate
  // guard hid: every family-writer lane expands to zero files while the three
  // integrator lanes carry the sweep on their own.
  const sealed = r0Proposal({ reanchored: false });
  const collapsed = vacuousLanes(sealed);
  assert.ok(
    collapsed.length > 0,
    'the sealed spelling must expose collapsed lanes, or this drill is measuring nothing',
  );
  assert.equal(
    vacuousLanes(r0Proposal()).length,
    0,
    'the re-anchored proposal must have no collapsed lane, or the sweep above is still vacuous',
  );

  // And the aggregate guard the per-lane floor replaced would have passed on
  // that same collapsed cohort -- stated as an executable fact, not as prose.
  let aggregate = 0;
  for (const lane of sealed.lanes) aggregate += effectiveFiles(lane).size;
  assert.ok(
    aggregate > 100,
    'the old aggregate guard must be shown to pass on the collapsed cohort it failed to catch',
  );
});

test('DRILL: the analyzer owning-lane invariant is asserted, not assumed', () => {
  // Every permitted entry the analyzer emits must name the lane it was found under.
  const analysis = analyzeOwnershipProposal(r0Proposal());
  assert.ok(analysis.permittedByContractRule.length > 0);
  for (const entry of analysis.permittedByContractRule) {
    assert.equal(entry.owningLane, entry.lane, `${entry.file} permitted under ${entry.lane} but owned by ${entry.owningLane}`);
  }
});

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
        readSet: ['packages/core/src/components/**'],
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
              { requestId: 'X', fromLane: l.lane, targetLane: 'R1-quality-integrator', domainId: 'shared-barrels', paths: ['packages/core/src/components/primitives/inputs/button/index.ts'], change: 'modify', reason: 'r' },
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
    readSet: ['packages/core/src/components/**'],
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
    readSet: ['packages/core/src/components/**'],
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
  const plan = singletonProbePlan();
  assert.equal(
    plan.lanes.filter((lane) => lane.laneClass === 'family-writer').length,
    12,
    'the probe must carry the real twelve-canary partition, not a reduced stand-in',
  );

  const analysis = analyzeSingletonProbe(plan);
  assert.deepEqual(analysis.singletonCardinalityFindings, []);
  assert.equal(analysis.conflictFree, true, 'twelve family-writers are legitimate; nothing else is in play');
});

test('a THIRTEENTH family-writer is still not a singleton violation', () => {
  // The edge that proves the rule is class-driven rather than a count of 12
  // hardened into place: family-writer has no cardinality ceiling at all.
  const analysis = analyzeSingletonProbe(
    singletonProbePlan([
      { ...SINGLETON_PROBE_LANE, lane: 'R1-thirteenth-canary', canary: 'thirteenth-canary', laneClass: 'family-writer' },
    ]),
  );
  assert.deepEqual(analysis.singletonCardinalityFindings, []);
  assert.equal(analysis.conflictFree, true);
});
