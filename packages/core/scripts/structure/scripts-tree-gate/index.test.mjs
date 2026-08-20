#!/usr/bin/env node

/**
 * scripts-tree-gate/index.test.mjs — teeth + honesty drills for the §1.2/§2.9
 * scripts-tree gate. A structure gate that cannot fail is debt dressed as law.
 */

import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import assert from 'node:assert/strict';

import { collectFindings, evaluate } from './index.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const GATE = join(HERE, 'index.mjs');
const SCRIPTS_ROOT = dirname(dirname(HERE));
const BASELINE = JSON.parse(readFileSync(join(HERE, 'scripts-tree-gate.baseline.json'), 'utf8'));

const runGate = (args) =>
  spawnSync(process.execPath, [GATE, ...args], { encoding: 'utf8' });

test('positive: the real scripts/ tree passes with exactly the adjudicated baseline', () => {
  const out = runGate([]);
  assert.equal(out.status, 0, out.stderr);
  assert.match(out.stdout, /scripts-tree-gate OK/);
});

test('baseline integrity: every entry carries rule, path and a non-empty reason', () => {
  assert.ok(Array.isArray(BASELINE.entries));
  assert.ok(BASELINE.entries.length > 0);
  for (const entry of BASELINE.entries) {
    assert.ok(entry.rule, JSON.stringify(entry));
    assert.ok(entry.path, JSON.stringify(entry));
    assert.ok(typeof entry.reason === 'string' && entry.reason.length > 10, JSON.stringify(entry));
  }
});

for (const rule of ['R1', 'R2', 'R3', 'R4', 'R5', 'R6']) {
  test(`drill ${rule}: an injected ${rule} violation is caught`, () => {
    const out = runGate([`--drill=${rule}`]);
    assert.equal(out.status, 0, out.stderr);
    assert.match(out.stdout, new RegExp(`drill ${rule}: violation caught`));
  });
}

test('drill honesty: a drill that reports nothing fails the gate itself', () => {
  const failures = evaluate(collectFindings(SCRIPTS_ROOT, { drill: 'R1' }), BASELINE);
  assert.ok(failures.some((f) => f.includes('drill-loose-file.mjs')));
});

test('evaluate: a finding outside the baseline is NEW and fails', () => {
  const failures = evaluate([{ rule: 'R1-loose-root-file', path: 'planted.mjs' }], BASELINE);
  assert.ok(failures.some((f) => f.startsWith('NEW R1-loose-root-file planted.mjs')));
});

test('evaluate: a baseline entry without a live finding is STALE and fails (decrease-only)', () => {
  const ghost = { entries: [{ rule: 'R5-family-prefix-repeat', path: 'ci/ci-ghost', reason: 'planted stale entry for the drill' }] };
  const failures = evaluate([], ghost);
  assert.equal(failures.length, 1);
  assert.match(failures[0], /^STALE baseline entry/);
});

test('the baseline never absorbs silently: live findings match the baseline exactly, entry by entry', () => {
  const live = new Set(collectFindings(SCRIPTS_ROOT).map((f) => `${f.rule} ${f.path}`));
  const recorded = new Set(BASELINE.entries.map((e) => `${e.rule} ${e.path}`));
  assert.deepEqual(live, recorded);
});
