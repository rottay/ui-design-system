import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { join } from 'node:path';
import test from 'node:test';

import { loadProgramContracts } from '../contracts/index.mjs';
import {
  computeSourceDigest,
  resolveEvidenceArtifactPath,
  sightedApprovers,
  validateReceipt,
} from './index.mjs';

const contracts = loadProgramContracts();

test('legacy F4B artifact paths resolve to the archived control proof', (t) => {
  const root = mkdtempSync(join(tmpdir(), 'receipt-relocation-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const current =
    'packages/core/artifacts/quality/programs/modern-rescue/cascade-proofs/controls/spacing-rhythm/computed-static-db/bithire.json';
  mkdirSync(join(root, current, '..'), { recursive: true });
  writeFileSync(join(root, current), '{}\n');
  assert.equal(
    resolveEvidenceArtifactPath(
      'packages/core/test-artifacts/quality-evidence/wo-cra-23/F4B/spacing-rhythm/bithire.json',
      { root }
    ),
    current
  );
});

test('an unresolved legacy path stays invalid', () => {
  const legacy =
    'packages/core/test-artifacts/quality-evidence/wo-cra-23/F4B/spacing-rhythm/missing.json';
  assert.equal(resolveEvidenceArtifactPath(legacy, { root: tmpdir() }), legacy);
});

// --- Receipt validation, the law the schema names ---------------------------
//
// `governance/manifest/schema/index.json` names `validateReceipt` as THE
// validator for an evidence receipt, and until now nothing exercised it. A
// receipt whose artifact hash is stale, whose source digest is stale, whose
// artifact is empty, or whose producer is also the sighted approver is not
// evidence, and each of those is a way of looking like evidence.

test('NEGATIVE DRILL: a receipt whose artifact hash is stale is rejected', () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'rottay-qe-v2-'));
  const relative = `${contracts.evidence.root}/R0/manifest.json`;
  const absolute = path.join(directory, relative);
  fs.mkdirSync(path.dirname(absolute), { recursive: true });
  fs.writeFileSync(absolute, JSON.stringify({ roundId: 'R0' }));
  const realDigest = crypto.createHash('sha256').update(fs.readFileSync(absolute)).digest('hex');

  // The drill stays hermetic: the owned source lives inside the same temporary root the
  // validator reads, so a digest mismatch can only come from the rule under test.
  const sourceFile = 'packages/core/src/components/primitives/inputs/button/index.tsx';
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
  for (const approver of sightedApprovers(contracts)) {
    const result = validateReceipt({ producer: approver, sourceFiles: [] });
    assert.ok(result.failures.some((failure) => failure.includes('producer must not be the sighted approver')));
  }
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

test('NEGATIVE DRILL: a non-zero exit code cannot certify positive evidence', () => {
  // A command that failed and a command that proved something look identical in
  // a receipt unless the exit code is judged. The exception is deliberate: a
  // negative drill is evidence precisely because it failed.
  const positive = validateReceipt({ exitCode: 1, evidenceKind: 'manifest', sourceFiles: [] });
  assert.ok(
    positive.failures.some((failure) => failure.includes('is non-zero for a positive evidence kind')),
  );

  const negativeDrill = validateReceipt({ exitCode: 1, evidenceKind: 'negative-drill', sourceFiles: [] });
  assert.equal(
    negativeDrill.failures.some((failure) => failure.includes('is non-zero for a positive evidence kind')),
    false,
    'a negative drill is evidence BECAUSE it failed; judging it as a positive would invert the law',
  );
});

test('NEGATIVE DRILL: a receipt missing a required field is rejected by name', () => {
  // Fail-closed on shape. A receipt that omits a field is not a partially valid
  // receipt; the omission is reported with the field name so the gap is not
  // guessed at.
  const result = validateReceipt({ sourceFiles: [] });
  assert.equal(result.valid, false);
  assert.ok(result.failures.length > 0, 'an empty receipt must not validate vacuously');
  for (const field of ['roundId', 'familyId', 'artifactPath', 'artifactSha256']) {
    assert.ok(
      result.failures.some((failure) => failure.includes(field)),
      `${field} must be reported by name, got: ${JSON.stringify(result.failures)}`,
    );
  }
});
