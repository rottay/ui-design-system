/**
 * Drills for the tokens-catalog gate: each `--drill=<case>` self-injects
 * one synthetic violation and the check MUST exit non-zero naming it.
 *
 * The FASE G drills guard the two claims the per-token catalog makes that no
 * aggregate view could make before it: every corpus name has exactly one row
 * (`omit-family`), and the operational tree never carries a debt name
 * (`mix-status`). A catalog that silently drops a family while still printing
 * a coverage assertion is worse than no catalog at all, so both are red-tested
 * rather than trusted.
 */
import { spawnSync } from 'node:child_process';
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
import test from 'node:test';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SCRIPT = join(ROOT, 'scripts', 'tokens-catalog.mjs');
const DOCS = resolve(ROOT, '../../../docs-engineering/engineering/design-system/tokens');

function run(...args) {
  const result = spawnSync(process.execPath, [SCRIPT, ...args], {
    cwd: ROOT,
    encoding: 'utf8',
  });
  return { status: result.status, out: `${result.stdout}\n${result.stderr}` };
}

/** Every `--ds-*` row emitted by the family pages of one tree. */
function pageNames(tree) {
  const dir = join(DOCS, tree, 'families');
  const names = [];
  for (const file of readdirSync(dir).sort()) {
    if (!file.endsWith('.md')) continue;
    for (const line of readFileSync(join(dir, file), 'utf8').split('\n')) {
      const match = /^\| `(--ds-[a-z0-9-]+)` \|/.exec(line);
      if (match) names.push({ name: match[1], file: `${tree}/families/${file}` });
    }
  }
  return names;
}

test('positive: the catalog check passes on the real tree', () => {
  const { status, out } = run('--check');
  assert.equal(status, 0, out);
});

test('positive: the two trees cover the census exactly once, and never mix', () => {
  const report = JSON.parse(readFileSync(join(ROOT, 'customization-surface-report.json'), 'utf8'));
  const operational = new Set(['active', 'app-slot', 'adjudicated-live']);
  const emitted = [...pageNames('catalog'), ...pageNames('governance')];

  const seen = new Map();
  for (const row of emitted) {
    assert.ok(report.rows[row.name], `${row.name} is on a page but not in the census`);
    assert.equal(seen.has(row.name), false, `${row.name} appears twice (${row.file})`);
    seen.set(row.name, row.file);
  }
  for (const name of Object.keys(report.rows)) {
    assert.ok(seen.has(name), `${name} is in the census but on no family page`);
    const tree = seen.get(name).startsWith('catalog/') ? 'catalog' : 'governance';
    const expected = operational.has(report.rows[name].status) ? 'catalog' : 'governance';
    assert.equal(tree, expected, `${name} (${report.rows[name].status}) landed in the ${tree} tree`);
  }
  assert.equal(seen.size, Object.keys(report.rows).length);
});

test('drill: a derivation cycle fails', () => {
  const { status, out } = run('--drill=cycle');
  assert.notEqual(status, 0);
  assert.match(out, /derivation cycle/);
});

test('drill: a public hook without owner metadata fails', () => {
  const { status, out } = run('--drill=hook-owner');
  assert.notEqual(status, 0);
  assert.match(out, /without owner/);
});

test('drill: an active capability with a channel unknown to the census fails', () => {
  const { status, out } = run('--drill=unknown-channel');
  assert.notEqual(status, 0);
  assert.match(out, /unknown to the census/);
});

test('drill: an unadjudicated dual-authority family fails', () => {
  const { status, out } = run('--drill=dual-authority');
  assert.notEqual(status, 0);
  assert.match(out, /dual authority/);
});

test('drill: stale generated docs fail', () => {
  const { status, out } = run('--drill=stale');
  assert.notEqual(status, 0);
  assert.match(out, /stale\/missing generated view/);
});

test('drill: a reconciliation not derived from the current report fails', () => {
  const { status, out } = run('--drill=recon-digest');
  assert.notEqual(status, 0);
  assert.match(out, /reconciliation digest mismatch/);
});

test('drill: dropping one family from the catalog fails coverage-100', () => {
  const { status, out } = run('--drill=omit-family');
  assert.notEqual(status, 0);
  assert.match(out, /coverage-100: \d+ corpus name\(s\) appear on no family page/);
});

test('drill: a dead name inside the operational corpus fails no-mixing', () => {
  const { status, out } = run('--drill=mix-status');
  assert.notEqual(status, 0);
  assert.match(out, /no-mixing: \d+ governance-status name\(s\) inside the operational catalog/);
});
