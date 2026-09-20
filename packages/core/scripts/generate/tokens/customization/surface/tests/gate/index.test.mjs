/**
 * Drills for the D0 customization-surface gates. Each drill self-injects a
 * synthetic violation through the census script's `--drill=<case>` switch
 * and the gate MUST exit non-zero naming the violation — a gate that cannot
 * fail is not a gate. The positive case proves the same invocation passes
 * on the real tree, so a red drill can never be blamed on setup.
 */
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
import test from 'node:test';
import { packageRoot as findPackageRoot } from '../../../../../../libraries/repo-root/index.mjs';
import { adjudicatedAliveNames } from '../../index.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = findPackageRoot(HERE);
const SCRIPT = join(ROOT, 'scripts/generate/tokens/customization/surface/index.mjs');

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

/**
 * THE ADJUDICATION WALKER. These cases exist because the mechanism they cover
 * was built, wired into the dead-writer census and never once fired: it
 * required a `name` field on the same object as the decision, and 525 of the
 * 538 rows in the two registries are keyed by channel with no such field, so
 * `adjudicated-live` measured ZERO tree-wide. No drill covered it, which is
 * why nothing said so.
 */
test('planted: a row with no name field but an accepted decision IS seen, through its index key', () => {
  const seen = adjudicatedAliveNames({
    entries: { '--ds-planted-keyed': { decision: 'KEEP_LIVE_APP_CONSUMER', readers: { apps: 3 } } },
  });
  assert.deepEqual([...seen], ['--ds-planted-keyed']);
});

test('planted: a row with neither a name NOR an accepted decision is still refused', () => {
  const seen = adjudicatedAliveNames({
    entries: {
      '--ds-planted-pending': { decision: 'RETIRE_PROPOSED' },
      '--ds-planted-owner': { decision: 'KEEP_TENANT_CHANNEL_GAP_PENDING_OWNER' },
      '--ds-planted-silent': { note: 'no decision at all' },
      nameless: { decision: 'KEEP_LIVE_APP_CONSUMER' },
    },
  });
  assert.deepEqual([...seen], [], 'a pending class, a silent row and a non-channel key are all refused');
});

test('planted: the key speaks only for the node it addresses, never for its children', () => {
  // Otherwise a nested sub-decision inside a row would mark the whole row live.
  const seen = adjudicatedAliveNames({
    entries: {
      '--ds-planted-parent': {
        decision: 'RETIRE_PROPOSED',
        alternatives: [{ decision: 'EXECUTED_RECONNECT', note: 'an option that was NOT taken' }],
        evidence: { decision: 'EXECUTED_ZERO_DELTA' },
      },
    },
  });
  assert.deepEqual([...seen], [], 'the row was retired; nothing nested inside it may overturn that');
});

test('planted: a written name wins over the key, so a row is read as it is written', () => {
  const seen = adjudicatedAliveNames({
    entries: { '--ds-planted-filed-here': { name: '--ds-planted-really-this', decision: 'EXECUTED_DEFECT_FIX' } },
  });
  assert.deepEqual([...seen], ['--ds-planted-really-this']);
});

test('the real registries: the key reading strictly dominates the name-only reading', () => {
  // Measured 2026-09-15. The name-only figure is the thirteen rows D6-2d-resto
  // wrote; the other twenty-one are historical adjudications that had been
  // inert since the registries were created. Both are exact: a later
  // adjudication must re-measure them here rather than drift.
  const nameOnly = new Set();
  const keyed = new Set();
  const walkNameOnly = (node) => {
    if (Array.isArray(node)) { for (const item of node) walkNameOnly(item); return; }
    if (typeof node !== 'object' || node === null) return;
    const decision = node.decision ?? node.verdict;
    const name = node.name ?? node.token;
    if (typeof name === 'string' && typeof decision === 'string' && /^(KEEP_LIVE|EXECUTED)/.test(decision)) {
      nameOnly.add(name);
    }
    for (const value of Object.values(node)) walkNameOnly(value);
  };
  for (const registry of ['system', 'cards']) {
    const document = JSON.parse(
      readFileSync(join(ROOT, `src/foundation/tokens/data/decisions/writers/unused/${registry}/index.json`), 'utf8'),
    );
    walkNameOnly(document);
    for (const name of adjudicatedAliveNames(document)) keyed.add(name);
  }
  assert.equal(nameOnly.size, 13, 'the rows that carry a name field');
  assert.equal(keyed.size, 34, 'every adjudicated-live row, however it is addressed');
  for (const name of nameOnly) assert.ok(keyed.has(name), `${name}: the key reading must not lose a named row`);
  // A named 301-era row, so this cannot pass on an empty registry.
  assert.ok(keyed.has('--ds-input-placeholder'), 'the EXECUTED_DEFECT_FIX row that had been inert since it was written');
});
