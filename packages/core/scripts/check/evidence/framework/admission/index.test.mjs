/**
 * Drills for writer-lane admission.
 *
 * Admission is the only thing standing between a lane packet and a write, so
 * the interesting cases are the ones that look admissible: a spoofed laneClass,
 * a reserved path inside a family glob, a packet whose lane is absent from the
 * proposal. The CLI drills invoke the real command, so the wired public path is
 * proven rather than the function behind it.
 */

import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import test from 'node:test';

import { repoRoot as findRepoRoot } from '../../../../libraries/repo-root/index.mjs';
import {
  admitWriterLane,
  matchesReserved,
  validateConflictGraph,
} from './index.mjs';
import {
  loadProgramContracts,
} from '../contracts/index.mjs';

const contracts = loadProgramContracts();

// --- Real-CLI admission drills -------------------------------------------------------------
// The parity drills above call admitWriterLane directly. These invoke the actual command so
// the wired public path is proven, not merely the function behind it.

const CLI = path.join(import.meta.dirname, '../cli/index.mjs');
const REPO_ROOT = findRepoRoot(import.meta.dirname);

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
  const inputs = 'packages/core/src/components/primitives/inputs';
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

test('NEGATIVE DRILL: a broad parent write set colliding with a child lane is rejected', () => {
  // The defect this drill exists for: string equality let `x/**` and `x/child/**` read as
  // two unrelated files, so a category-wide claim passed a check named "conflict-free".
  const graph = {
    activeCohort: 1,
    nodes: [
      { lane: 'A-broad-parent', laneClass: 'family-writer', cohort: 1, writeSet: ['packages/core/src/components/patterns/data/**'] },
      { lane: 'B-child', laneClass: 'family-writer', cohort: 1, writeSet: ['packages/core/src/components/patterns/data/list-toolbar/**'] },
    ],
    edges: [],
  };
  const result = validateConflictGraph(graph);
  assert.equal(result.safe, false);
  assert.ok(result.blockers.some((blocker) => blocker.includes('contains') && blocker.includes('same file')));
});

test('DRILL: admission now sees packages/core/src/index.ts, which the naive matcher missed', () => {
  assert.equal(matchesReserved('packages/core/src/index.ts', loadProgramContracts().orchestration.reservedPaths), true);
});

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
    ownedFiles: ['packages/core/src/components/primitives/inputs/Input/engines/modern/index.tsx'],
  });
  const run = runCli(['admission', outside, fixtures.proposal]);
  assert.equal(run.code, 1);
  assert.ok(JSON.parse(run.stdout).blockers.some((blocker) => blocker.includes('outside the effective write set of lane LANE-A')));
  fs.rmSync(fixtures.directory, { recursive: true, force: true });
});

test('DRILL: an integrator packet is lane-bound too, not only family-writers', () => {
  // Without this, an integrator could claim a family's own entrypoint with no ownership
  // check at all, because the reserved-path loop is scoped to family-writer.
  const inputs = 'packages/core/src/components/primitives/inputs';
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
  const proposal = { lanes: [{ lane: 'L', laneClass: 'family-writer', families: [], writeSet: ['packages/core/src/components/primitives/inputs/Button/**'] }] };
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
  const proposal = { lanes: [{ lane: 'L', laneClass: 'family-writer', families: [], writeSet: ['packages/core/src/components/primitives/inputs/Button/**'] }] };
  const spoof = {
    ...Object.fromEntries(contracts.orchestration.writerHandoffRequiredFields.map((f) => [f, 'declared'])),
    lane: 'L',
    laneClass: 'architecture-integrator',
    ownedFiles: ['packages/core/src/components/primitives/inputs/Button/index.ts'],
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
  const button = 'packages/core/src/components/primitives/inputs/Button';
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
