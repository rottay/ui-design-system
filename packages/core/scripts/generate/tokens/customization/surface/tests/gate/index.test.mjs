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
import {
  adjudicatedAliveNames,
  buildDispositionsDoc,
  buildReport,
  datedPopulation,
  evaluateDatedDispositions,
  verifyKeepLiveClaims,
} from '../../index.mjs';

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

test('drill: a KEEP_LIVE whose named app file does not read the channel fails the dead arm', () => {
  const { status, out } = run('--check=dead', '--drill=keep-live-unread');
  assert.notEqual(status, 0);
  assert.match(out, /--ds-drill-keep-live-unread — .* does not read it/);
  assert.match(out, /--ds-drill-keep-live-unread — claims 1 app read\(s\), measured 0/);
});

test('drill: a KEEP_LIVE whose declared read count drifts from the measured one fails the dead arm', () => {
  const { status, out } = run('--check=dead', '--drill=keep-live-count');
  assert.notEqual(status, 0);
  assert.match(out, /adjudication: --ds-[a-z0-9-]+ — claims \d+ app read\(s\), measured \d+/);
});

test('planted: KEEP_LIVE claims are measured, and an absent app checkout fails closed', () => {
  const claim = { name: '--ds-planted', decision: 'KEEP_LIVE_APP_CONSUMER', readers: { apps: 1, appFiles: ['app-nowhere/src/a.css'] } };
  const missing = verifyKeepLiveClaims([claim], { resolveRoot: () => join(ROOT, 'does-not-exist') });
  assert.equal(missing.length, 1);
  assert.match(missing[0], /app-nowhere is not checked out/);
  const noVerifier = verifyKeepLiveClaims([{ name: '--ds-planted', decision: 'KEEP_LIVE_JS_CONSUMER', readers: {} }]);
  assert.match(noVerifier[0], /has no reader verifier/);
  assert.deepEqual(verifyKeepLiveClaims([{ name: '--ds-planted', decision: 'EXECUTED_DEFECT_FIX' }]), []);
});

test('scope: a writer read only in showroom is live, and the showroom leg is what keeps it live', () => {
  const { report: real } = buildReport();
  const { report: blind } = buildReport({ drill: 'showroom-blind' });
  const showroomOnly = Object.keys(real.rows).filter((name) => {
    const row = real.rows[name];
    return row.writer && row.status === 'active' && row.reads.css === 0 && row.reads.ts === 0 && row.reads.showroom > 0;
  });
  assert.ok(showroomOnly.length > 0, 'positive control: the tree has writers read only in showroom');
  const realDead = new Set(real.deadWriters);
  const blindDead = new Set(blind.deadWriters);
  for (const name of showroomOnly) {
    assert.ok(!realDead.has(name), `${name}: read in showroom, so not dead`);
    assert.notEqual(blind.rows[name].status, 'active', `${name}: without the showroom leg nothing reads it`);
  }
  assert.ok(showroomOnly.some((name) => blindDead.has(name)), 'at least one showroom-only reader turns dead when showroom is not read');
  for (const name of real.deadWriters) {
    const row = real.rows[name];
    assert.equal(row.reads.css + row.reads.ts + row.reads.showroom, 0, `${name}: a dead writer is read nowhere in the corpus`);
  }
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
  assert.equal(nameOnly.size, 14, 'the rows that carry a name field');
  assert.equal(keyed.size, 35, 'every adjudicated-live row, however it is addressed');
  for (const name of nameOnly) assert.ok(keyed.has(name), `${name}: the key reading must not lose a named row`);
  // A named 301-era row, so this cannot pass on an empty registry.
  assert.ok(keyed.has('--ds-input-placeholder'), 'the EXECUTED_DEFECT_FIX row that had been inert since it was written');
});

/**
 * F-91: every dead writer the DS declares carries one disposition held by a receiver the gate verifies. The positive
 * case runs the real arm; the drills and planted rows prove each way a row can be wrong is red.
 */
test('positive: every DS-declared dead writer is held by a verified receiver', () => {
  const { status, out } = run('--check=dated');
  assert.equal(status, 0, out);
  assert.match(out, /each held by a verified receiver/);
});

test('drill: a DS-declared dead writer with no disposition fails the dated arm', () => {
  const { status, out } = run('--check=dated', '--drill=undated');
  assert.notEqual(status, 0);
  assert.match(out, /--ds-drill-undated-dead-writer is a dead writer with no disposition/);
});

test('drill: a holding work order that closes with the debt open fails the dated arm', () => {
  const { status, out } = run('--check=dated', '--drill=receiver-closed');
  assert.notEqual(status, 0);
  assert.match(out, /RECEIVER CLOSED: WO-[A-Z]+-\d{2} is done and this debt is still open/);
});

test('drill: a registry row that moves under its disposition fails the dated arm', () => {
  const { status, out } = run('--check=dated', '--drill=drifted');
  assert.notEqual(status, 0);
  assert.match(out, /DRIFTED: the system row now reads/);
});

const RECEIVERS = {
  roadmapReadable: true,
  workOrders: new Map([['WO-RET-01', 'in-progress'], ['WO-RET-02', 'done']]),
  registries: {
    system: { entries: { '--ds-planted': { decision: 'KEEP_PARAMETRIC_RAMP', finalState: 'KEEP_ACTIVE' } } },
    cards: { entries: { '--ds-planted': { decision: 'DELIBERATE_DELTA_PENDING_OWNER', finalState: 'OWNER_DECISION' } } },
  },
};
const ROW = { verdict: 'RETIRE', registered: '2026-10-07', reason: 'planted' };
const check = (row, today = '2026-10-07') => evaluateDatedDispositions(['--ds-planted'], { schemaVersion: 2, dispositions: { '--ds-planted': row } }, { today, receivers: RECEIVERS });

test('planted: each receiver form passes when it verifies', () => {
  assert.deepEqual(check({ ...ROW, heldBy: 'WO-RET-01' }), []);
  assert.deepEqual(check({ ...ROW, verdict: 'KEEP_RESERVED', heldBy: { registry: 'system', decision: 'KEEP_PARAMETRIC_RAMP', finalState: 'KEEP_ACTIVE' } }), []);
  assert.deepEqual(check({ ...ROW, verdict: 'DECIDE', heldBy: { registry: 'cards', decision: 'DELIBERATE_DELTA_PENDING_OWNER', finalState: 'OWNER_DECISION' } }), []);
  assert.deepEqual(check({ ...ROW, owner: 'WO-RET-01', due: '2026-11-06' }), []);
});

test('planted: an overdue dated row, an unknown or closed work order and a mismatched registry row all fail', () => {
  assert.match(check({ ...ROW, owner: 'WO-RET-01', due: '2026-11-06' }, '2026-11-07').join('\n'), /OVERDUE: due 2026-11-06, today 2026-11-07/);
  assert.match(check({ ...ROW, heldBy: 'WO-NOP-99' }).join('\n'), /not a work order in roadmap\/registry.json/);
  assert.match(check({ ...ROW, heldBy: 'WO-RET-02' }).join('\n'), /RECEIVER CLOSED/);
  assert.match(check({ ...ROW, heldBy: 'kernel typography' }).join('\n'), /not a work-order id/);
  assert.match(check({ ...ROW, verdict: 'KEEP_RESERVED', heldBy: { registry: 'cards', decision: 'DELIBERATE_DELTA_PENDING_OWNER', finalState: 'OWNER_DECISION' } }).join('\n'), /must rest on a KEEP_ACTIVE registry row/);
  assert.match(check({ ...ROW, heldBy: { registry: 'system', decision: 'RETIRE_PROPOSED', finalState: 'OWNER_DECISION' } }).join('\n'), /DRIFTED/);
  assert.match(check({ ...ROW, heldBy: { registry: 'elsewhere' } }).join('\n'), /not system or cards/);
  assert.match(check({ ...ROW, heldBy: 'WO-RET-01', due: '2026-11-06', owner: 'WO-RET-01' }).join('\n'), /exactly one of/);
  assert.match(check({ ...ROW }).join('\n'), /names no receiver/);
  assert.match(check({ ...ROW, verdict: 'KEEP', heldBy: 'WO-RET-01' }).join('\n'), /closed vocabulary/);
});

test('planted: a stale row and a missing or v1 document fail', () => {
  const doc = { schemaVersion: 2, dispositions: { '--ds-planted': { ...ROW, heldBy: 'WO-RET-01' } } };
  assert.match(evaluateDatedDispositions([], doc, { today: '2026-10-07', receivers: RECEIVERS })[0], /no longer a dead writer/);
  assert.match(evaluateDatedDispositions(['--ds-planted'], null, { today: '2026-10-07', receivers: RECEIVERS })[0], /missing, unreadable/);
  assert.match(evaluateDatedDispositions(['--ds-planted'], { schemaVersion: 1, dispositions: {} }, { today: '2026-10-07', receivers: RECEIVERS })[0], /schemaVersion 2/);
});

test('planted: the door copies the registry row it rests on and refuses what it cannot verify', () => {
  const base = { previous: null, population: ['--ds-planted'], names: ['--ds-planted'], reason: 'planted', registered: '2026-10-07', receivers: RECEIVERS };
  const held = buildDispositionsDoc({ ...base, verdict: 'KEEP_RESERVED', heldBy: 'registry:system' }).dispositions['--ds-planted'];
  assert.deepEqual(held.heldBy, { registry: 'system', decision: 'KEEP_PARAMETRIC_RAMP', finalState: 'KEEP_ACTIVE' });
  assert.throws(() => buildDispositionsDoc({ ...base, names: ['--ds-live-token'], verdict: 'RETIRE', heldBy: 'WO-RET-01' }), /only a live dead writer/);
  assert.throws(() => buildDispositionsDoc({ ...base, verdict: 'RETIRE', heldBy: 'WO-RET-02' }), /RECEIVER CLOSED/);
  assert.throws(() => buildDispositionsDoc({ ...base, verdict: 'DECIDE', heldBy: 'registry:system' }), /must rest on a OWNER_DECISION registry row/);
  assert.throws(() => buildDispositionsDoc({ ...base, verdict: 'RETIRE', owner: 'WO-RET-01' }), /names no receiver/);
  assert.throws(() => buildDispositionsDoc({ ...base, names: [], verdict: 'RETIRE', heldBy: 'WO-RET-01' }), /names no token/);
});

test('scope: the dispositioned population is the DS-declared dead writers, and the fiche examples are in it', () => {
  const { report } = buildReport();
  const population = datedPopulation(report);
  for (const name of ['--ds-space-fluid-1', '--ds-elevation-surface-0', '--ds-color-mono-100']) {
    assert.ok(population.includes(name), `${name}: named by F-91 and still dead, so it must be dispositioned`);
  }
  for (const name of population) assert.ok(['canonical-authority', 'authored-css-local'].includes(report.rows[name].category));
  assert.ok(report.deadWriters.some((name) => !population.includes(name)), 'the compiler-derived channels stay outside the claim');
});
