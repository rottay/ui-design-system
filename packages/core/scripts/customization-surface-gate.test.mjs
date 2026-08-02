/**
 * Drills for the D0 customization-surface gates. Each drill self-injects a
 * synthetic violation through the census script's `--drill=<case>` switch
 * and the gate MUST exit non-zero naming the violation — a gate that cannot
 * fail is not a gate. The positive case proves the same invocation passes
 * on the real tree, so a red drill can never be blamed on setup.
 */
import { spawnSync } from 'node:child_process';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
import test from 'node:test';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SCRIPT = join(ROOT, 'scripts', 'customization-surface-census.mjs');

function run(...args) {
  const result = spawnSync(process.execPath, [SCRIPT, ...args], {
    cwd: ROOT,
    encoding: 'utf8',
  });
  return { status: result.status, out: `${result.stdout}\n${result.stderr}` };
}

test('positive: the full check passes on the real tree', () => {
  const { status, out } = run('--check');
  assert.equal(status, 0, out);
});

test('drill: a stale report fails the freshness gate', () => {
  const { status, out } = run('--check=freshness', '--drill=freshness');
  assert.notEqual(status, 0);
  assert.match(out, /STALE/);
});

test('drill: an unclassified row fails the classification gate', () => {
  const { status, out } = run('--check=classification', '--drill=unclassified');
  assert.notEqual(status, 0);
  assert.match(out, /classification:/);
});

test('drill: broken capability evidence fails the capability gate', () => {
  const { status, out } = run('--check=capabilities', '--drill=evidence');
  assert.notEqual(status, 0);
  assert.match(out, /capabilities:/);
});

test('drill: a NEW dead writer fails the decrease-only gate', () => {
  const { status, out } = run('--check=dead', '--drill=dead-growth');
  assert.notEqual(status, 0);
  assert.match(out, /NEW dead writer/);
});
