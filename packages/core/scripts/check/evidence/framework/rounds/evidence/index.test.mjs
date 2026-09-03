/**
 * Drills for round evidence and its seal.
 *
 * SHA256SUMS is an EXACT, complete, recursive seal. Digest verification alone
 * certifies only the files someone chose to list, so every drill here plants a
 * seal that is individually well-formed on the entries it DOES carry.
 */

import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import {
  loadProgramContracts,
  roundEvidenceRelativePath,
} from '../../contracts/index.mjs';
import {
  validateRoundEvidence,
} from './index.mjs';

const contracts = loadProgramContracts();

/**
 * The round root is resolved through the contract, never spelled out. A round
 * that is relocated moves its drills with it, and a location the contract
 * cannot state safely throws here rather than being joined onto a temp root.
 */
function roundRootIn(directory, roundId = 'R0') {
  return path.join(directory, roundEvidenceRelativePath(contracts, roundId));
}

// --- SHA256SUMS is an EXACT, complete, recursive seal --------------------
//
// Digest verification alone certifies only the files someone chose to list.
// Every drill below plants a seal that is individually well-formed on the
// entries it DOES carry, so a validator that only re-hashes declared paths
// passes all of them -- which is precisely the false green being closed.

const SEAL_MANIFEST = JSON.stringify({ roundId: 'R0' });
const SEAL_SCORECARD = JSON.stringify({ family: 'primitive/inputs/button' });

function sealDigest(content) {
  return crypto.createHash('sha256').update(content).digest('hex');
}

/**
 * A temp R0 round. R0 is capture-free by contract, so the second artifact is a
 * NESTED scorecard: it also proves the coverage walk recurses rather than
 * reading only the round root's top level.
 */
function makeSealedRound(files) {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'rottay-qe-v2-sums-'));
  const roundRoot = roundRootIn(directory);
  fs.mkdirSync(roundRoot, { recursive: true });
  for (const [relative, content] of Object.entries(files)) {
    const absolute = path.join(roundRoot, relative);
    fs.mkdirSync(path.dirname(absolute), { recursive: true });
    fs.writeFileSync(absolute, content);
  }
  return { directory, roundRoot };
}

function writeSums(roundRoot, lines) {
  fs.writeFileSync(path.join(roundRoot, 'SHA256SUMS'), `${lines.join('\n')}\n`);
}

const COMPLETE_SEAL = [
  `${sealDigest(SEAL_MANIFEST)}  manifest.json`,
  `${sealDigest(SEAL_SCORECARD)}  scorecards/button.json`,
];

const SEALED_FILES = {
  'manifest.json': SEAL_MANIFEST,
  'scorecards/button.json': SEAL_SCORECARD,
};

test('NEGATIVE DRILL: R0 evidence carrying a capture is rejected', (t) => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'rottay-qe-v2-'));
  const roundRoot = roundRootIn(directory);
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
  const roundRoot = roundRootIn(directory);
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
  const roundRoot = roundRootIn(directory);
  fs.mkdirSync(roundRoot, { recursive: true });
  fs.writeFileSync(path.join(roundRoot, 'manifest.json'), JSON.stringify({ roundId: 'R0' }));
  fs.writeFileSync(path.join(roundRoot, 'SHA256SUMS'), `${'0'.repeat(64)}  manifest.json\n`);
  const result = validateRoundEvidence('R0', { root: directory });
  assert.equal(result.valid, false);
  assert.ok(result.blockers.some((blocker) => blocker.includes('digest for manifest.json is stale')));
  fs.rmSync(directory, { recursive: true, force: true });
});

test('POSITIVE: a complete, exact, recursive SHA256SUMS validates', () => {
  // Non-vacuity for every negative drill below: they must fail for the defect
  // they plant, not because this shape was never acceptable to begin with.
  const { directory, roundRoot } = makeSealedRound(SEALED_FILES);
  writeSums(roundRoot, COMPLETE_SEAL);

  const result = validateRoundEvidence('R0', { root: directory });
  assert.deepEqual(result.blockers, [], 'a complete seal must validate');
  assert.equal(result.valid, true);
  assert.ok(
    result.notes.some((note) => note.includes('covers 2 of 2 present artifacts')),
    `expected a 2-of-2 coverage note, got ${JSON.stringify(result.notes)}`,
  );
  fs.rmSync(directory, { recursive: true, force: true });
});

test('NEGATIVE DRILL: an unsealed file present in the round is rejected (omission)', (t) => {
  // The headline defect. Every DECLARED entry here is present and its digest is
  // correct, so digest-only verification reports a clean round while an
  // artifact nobody sealed ships inside it.
  const { directory, roundRoot } = makeSealedRound(SEALED_FILES);
  writeSums(roundRoot, [COMPLETE_SEAL[0]]);

  const result = validateRoundEvidence('R0', { root: directory });
  assert.equal(result.valid, false);
  assert.ok(
    result.blockers.some((blocker) => blocker.includes('does not cover present file scorecards/button.json')),
    `expected an uncovered-file blocker, got ${JSON.stringify(result.blockers)}`,
  );
  fs.rmSync(directory, { recursive: true, force: true });
  t.diagnostic('the omitted artifact is nested, so this also proves the coverage walk recurses');
});

test('NEGATIVE DRILL: a SHA256SUMS entry traversing out of the round root is rejected', () => {
  const { directory, roundRoot } = makeSealedRound(SEALED_FILES);
  writeSums(roundRoot, [...COMPLETE_SEAL, `${sealDigest('x')}  ../../../etc/hosts`]);

  const result = validateRoundEvidence('R0', { root: directory });
  assert.equal(result.valid, false);
  assert.ok(
    result.blockers.some((blocker) => blocker.includes('traverses outside the round root')),
    `expected a traversal blocker, got ${JSON.stringify(result.blockers)}`,
  );
  fs.rmSync(directory, { recursive: true, force: true });
});

test('NEGATIVE DRILL: a ".." segment that normalises away is still rejected as traversal', () => {
  // `scorecards/../manifest.json` normalises to the innocent `manifest.json`,
  // so a validator that checks containment only AFTER normalising cannot tell
  // this from a plain entry and launders it. Rejection must read the raw
  // segments.
  const { directory, roundRoot } = makeSealedRound(SEALED_FILES);
  writeSums(roundRoot, [
    `${sealDigest(SEAL_MANIFEST)}  scorecards/../manifest.json`,
    COMPLETE_SEAL[1],
  ]);

  const result = validateRoundEvidence('R0', { root: directory });
  assert.equal(result.valid, false);
  assert.ok(
    result.blockers.some((blocker) => blocker.includes('traverses outside the round root')),
    `expected a traversal blocker, got ${JSON.stringify(result.blockers)}`,
  );
  fs.rmSync(directory, { recursive: true, force: true });
});

test('NEGATIVE DRILL: an absolute SHA256SUMS path is rejected', () => {
  const { directory, roundRoot } = makeSealedRound(SEALED_FILES);
  writeSums(roundRoot, [...COMPLETE_SEAL, `${sealDigest('x')}  /etc/hosts`]);

  const result = validateRoundEvidence('R0', { root: directory });
  assert.equal(result.valid, false);
  assert.ok(
    result.blockers.some((blocker) => blocker.includes('is absolute')),
    `expected an absolute-path blocker, got ${JSON.stringify(result.blockers)}`,
  );
  fs.rmSync(directory, { recursive: true, force: true });
});

test('NEGATIVE DRILL: a duplicated SHA256SUMS entry is rejected', () => {
  // Both copies carry the CORRECT digest, so per-entry verification passes
  // twice. Only a once-only rule can see it -- and without one, a duplicate is
  // how a coverage count is inflated to hide an omission.
  const { directory, roundRoot } = makeSealedRound(SEALED_FILES);
  writeSums(roundRoot, [COMPLETE_SEAL[0], COMPLETE_SEAL[0]]);

  const result = validateRoundEvidence('R0', { root: directory });
  assert.equal(result.valid, false);
  assert.ok(
    result.blockers.some((blocker) => blocker.includes('more than once')),
    `expected a duplicate blocker, got ${JSON.stringify(result.blockers)}`,
  );
  fs.rmSync(directory, { recursive: true, force: true });
});

test('NEGATIVE DRILL: a malformed SHA256SUMS line is rejected', () => {
  const { directory, roundRoot } = makeSealedRound(SEALED_FILES);
  writeSums(roundRoot, [...COMPLETE_SEAL, 'not-a-digest scorecards/button.json']);

  const result = validateRoundEvidence('R0', { root: directory });
  assert.equal(result.valid, false);
  assert.ok(
    result.blockers.some((blocker) => blocker.includes('is malformed')),
    `expected a malformed-line blocker, got ${JSON.stringify(result.blockers)}`,
  );
  fs.rmSync(directory, { recursive: true, force: true });
});

test('NEGATIVE DRILL: a SHA256SUMS entry for a file that is not present is rejected (extra)', () => {
  const { directory, roundRoot } = makeSealedRound(SEALED_FILES);
  writeSums(roundRoot, [...COMPLETE_SEAL, `${sealDigest('ghost')}  scorecards/ghost.json`]);

  const result = validateRoundEvidence('R0', { root: directory });
  assert.equal(result.valid, false);
  assert.ok(
    result.blockers.some((blocker) => blocker.includes('scorecards/ghost.json, which is not a regular file')),
    `expected an extra-entry blocker, got ${JSON.stringify(result.blockers)}`,
  );
  fs.rmSync(directory, { recursive: true, force: true });
});

test('NEGATIVE DRILL: a SHA256SUMS that declares itself is rejected', () => {
  const { directory, roundRoot } = makeSealedRound(SEALED_FILES);
  writeSums(roundRoot, [...COMPLETE_SEAL, `${sealDigest('whatever')}  SHA256SUMS`]);

  const result = validateRoundEvidence('R0', { root: directory });
  assert.equal(result.valid, false);
  assert.ok(
    result.blockers.some((blocker) => blocker.includes('must not declare itself')),
    `expected a self-declaration blocker, got ${JSON.stringify(result.blockers)}`,
  );
  fs.rmSync(directory, { recursive: true, force: true });
});

test('NEGATIVE DRILL: a symlink escaping the round root is rejected', (t) => {
  const { directory, roundRoot } = makeSealedRound(SEALED_FILES);
  const outside = path.join(directory, 'outside.json');
  fs.writeFileSync(outside, JSON.stringify({ outside: true }));

  try {
    fs.symlinkSync(outside, path.join(roundRoot, 'scorecards', 'escape.json'));
  } catch (error) {
    fs.rmSync(directory, { recursive: true, force: true });
    t.skip(`this platform does not permit symlink creation: ${error.code}`);
    return;
  }

  // The seal is otherwise complete and correct for every regular file, so the
  // ONLY thing that can fail here is the symlink rule.
  writeSums(roundRoot, COMPLETE_SEAL);

  const result = validateRoundEvidence('R0', { root: directory });
  assert.equal(result.valid, false);
  assert.ok(
    result.blockers.some((blocker) => blocker.includes('escape.json') && blocker.includes('escapes the round root')),
    `expected a symlink-escape blocker, got ${JSON.stringify(result.blockers)}`,
  );
  fs.rmSync(directory, { recursive: true, force: true });
});

// --- The location helper itself, which the refactor introduced untested ------
//
// Every drill above joins a contract-declared location onto a root. If that
// helper could return an absolute path or one carrying `..`, the join would
// silently escape the round and the seal would certify the wrong tree. The
// helper is the only thing standing between the contract and that join, so its
// refusals are asserted rather than assumed.

function contractsWithRoundLocation(location) {
  return {
    ...contracts,
    evidence: {
      ...contracts.evidence,
      roundLocations: { ...contracts.evidence.roundLocations, R0: location },
    },
  };
}

test('roundEvidenceRelativePath resolves every declared round under the evidence root', () => {
  for (const roundId of Object.keys(contracts.evidence.roundLocations)) {
    const resolved = roundEvidenceRelativePath(contracts, roundId);
    assert.equal(path.isAbsolute(resolved), false, `${roundId} resolved to an absolute path`);
    assert.ok(
      resolved.startsWith(`${contracts.evidence.root}/`),
      `${roundId} resolved outside the evidence root: ${resolved}`,
    );
    assert.equal(resolved.split('/').includes('..'), false, `${roundId} resolved through a traversal`);
  }
  // Non-vacuity: the loop above proves nothing if the contract declares no round.
  assert.ok(
    Object.keys(contracts.evidence.roundLocations).length >= 8,
    'expected the full declared round roster',
  );
});

test('NEGATIVE DRILL: an absolute round location is refused, not joined', () => {
  assert.throws(
    () => roundEvidenceRelativePath(contractsWithRoundLocation('/etc'), 'R0'),
    /no safe semantic evidence location/,
  );
});

test('NEGATIVE DRILL: a round location traversing out of the evidence root is refused', () => {
  assert.throws(
    () => roundEvidenceRelativePath(contractsWithRoundLocation('checkpoints/../../../etc'), 'R0'),
    /no safe semantic evidence location/,
  );
});

test('NEGATIVE DRILL: a missing or empty round location is refused rather than defaulted', () => {
  assert.throws(() => roundEvidenceRelativePath(contractsWithRoundLocation(''), 'R0'), /no safe semantic/);
  const withoutR0 = {
    ...contracts,
    evidence: { ...contracts.evidence, roundLocations: { ...contracts.evidence.roundLocations } },
  };
  delete withoutR0.evidence.roundLocations.R0;
  assert.throws(() => roundEvidenceRelativePath(withoutR0, 'R0'), /no safe semantic/);
});
