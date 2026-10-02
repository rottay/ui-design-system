import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { collectFamilyRosters, reconcileCompiledEmission, runGate } from '../index.mjs';
import { compileFirstPartyEmission } from './index.mjs';

const bucketsOf = (rows, keyOf) => Object.fromEntries(Object.entries(Object.groupBy(rows, keyOf))
  .map(([key, members]) => [key, members.map((row) => row.name)]));

function fakeDistRoot(serverSource) {
  const root = mkdtempSync(join(tmpdir(), 'reconcile-door-'));
  mkdirSync(join(root, 'dist'));
  writeFileSync(join(root, 'dist', 'server.js'), serverSource);
  return root;
}

const FIXTURE_CHANNELS = [
  { name: '--ds-color-a', emitted: true, emittedVia: 'direct-literal', classification: 'LIVE_MODERN_PAINTED' },
  { name: '--ds-color-b', emitted: true, emittedVia: 'direct-literal', classification: 'LIVE_MODERN_PAINTED' },
  { name: '--ds-color-tenant-only', emitted: true, emittedVia: 'direct-literal', classification: 'LIVE_MODERN_PAINTED' },
  { name: '--ds-field-bg', emitted: true, emittedVia: 'produces-roster', classification: 'LIVE_MODERN_PAINTED' },
  { name: '--ds-radius-md', emitted: true, emittedVia: 'compiled-artifact', classification: 'LIVE_MODERN_PAINTED' },
  { name: '--ds-unemitted', emitted: false, emittedVia: null, classification: 'DECLARED_ONLY' },
];
const FIXTURE_ROSTERS = [
  { family: 'palette', exact: [{ name: '--ds-color-a' }, { name: '--ds-color-b' }], globs: [{ prefix: '--ds-color-ramp-' }], unresolved: [] },
];
const FIXTURE_PINS = [{ owner: 'WO-EVI-02', channels: ['--ds-color-ramp-1'] }];
const fixtureCompiled = (extra = []) => new Map([
  ['bithire', new Set(['--ds-color-a', '--ds-color-ramp-1', ...extra])],
  ['evnto', new Set(['--ds-color-b', '--ds-color-ramp-1'])],
]);

test('FIXTURE: forward, reverse and the reverse buckets classify exactly, and the clean fixture passes', () => {
  const outcome = reconcileCompiledEmission({ channels: FIXTURE_CHANNELS, compiled: fixtureCompiled(), rosters: FIXTURE_ROSTERS, pins: FIXTURE_PINS });
  assert.equal(outcome.ok, true, outcome.failures.join('\n'));
  assert.equal(outcome.compiledNames, 3);
  assert.deepEqual(outcome.forward, [
    { name: '--ds-color-ramp-1', verticals: ['bithire', 'evnto'], rosterFamilies: ['palette'], owner: 'WO-EVI-02' },
  ]);
  assert.deepEqual(outcome.reverse.map((row) => row.name), ['--ds-color-tenant-only', '--ds-field-bg', '--ds-radius-md']);
  assert.deepEqual(bucketsOf(outcome.reverse, (row) => row.emittedVia), {
    'direct-literal': ['--ds-color-tenant-only'],
    'produces-roster': ['--ds-field-bg'],
    'compiled-artifact': ['--ds-radius-md'],
  });
  assert.deepEqual(outcome.outsideAnyRoster, []);
});

test('RED: a planted unowned forward row fails the outcome by name', () => {
  const outcome = reconcileCompiledEmission({
    channels: FIXTURE_CHANNELS, compiled: fixtureCompiled(['--ds-color-ramp-9']), rosters: FIXTURE_ROSTERS, pins: FIXTURE_PINS,
  });
  assert.equal(outcome.ok, false);
  assert.deepEqual(outcome.failures, [
    'unowned forward gap: --ds-color-ramp-9 is emitted by bithire and absent from the source universe with no owner pin',
  ]);
  assert.deepEqual(outcome.forward.find((row) => row.name === '--ds-color-ramp-9'), {
    name: '--ds-color-ramp-9', verticals: ['bithire'], rosterFamilies: ['palette'], owner: null,
  });
});

test('PLANT: a reverse row lands in its own bucket and does not fail the outcome', () => {
  const planted = { name: '--ds-planted-reverse', emitted: true, emittedVia: 'compiled-artifact', classification: 'LIVE_MODERN_PAINTED' };
  const outcome = reconcileCompiledEmission({
    channels: [...FIXTURE_CHANNELS, planted], compiled: fixtureCompiled(), rosters: FIXTURE_ROSTERS, pins: FIXTURE_PINS,
  });
  assert.equal(outcome.ok, true);
  assert.deepEqual(bucketsOf(outcome.reverse, (row) => row.emittedVia)['compiled-artifact'], ['--ds-planted-reverse', '--ds-radius-md']);
  assert.deepEqual(outcome.reverse.find((row) => row.name === '--ds-planted-reverse'), {
    name: '--ds-planted-reverse', emittedVia: 'compiled-artifact', classification: 'LIVE_MODERN_PAINTED',
  });
});

test('FAIL-CLOSED: a built door missing a named export is refused by that name', async () => {
  for (const missing of ['compileThemeIntent', 'staticThemeIntent', 'FIRST_PARTY_VERTICAL_SLUGS']) {
    const exports = {
      compileThemeIntent: 'export const compileThemeIntent = () => ({ compiled: { cssVariables: {} } });',
      staticThemeIntent: 'export const staticThemeIntent = (vertical) => vertical;',
      FIRST_PARTY_VERTICAL_SLUGS: "export const FIRST_PARTY_VERTICAL_SLUGS = ['rottay'];",
    };
    delete exports[missing];
    const root = fakeDistRoot(Object.values(exports).join('\n'));
    try {
      await assert.rejects(compileFirstPartyEmission(root), {
        message: `channel-liveness --reconcile: dist/server.js exports no ${missing}; build first`,
      });
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  }
});

test('FAIL-CLOSED: a vertical whose compile throws is refused loudly, never skipped', async () => {
  const root = fakeDistRoot([
    "export const FIRST_PARTY_VERTICAL_SLUGS = ['rottay', 'broken'];",
    'export const staticThemeIntent = (vertical) => ({ vertical });',
    "export const compileThemeIntent = ({ vertical }) => { if (vertical === 'broken') throw new Error('compile refused: broken'); return { compiled: { cssVariables: { '--ds-a': '1' } } }; };",
  ].join('\n'));
  try {
    await assert.rejects(compileFirstPartyEmission(root), (error) => {
      assert.equal(error.message, 'channel-liveness --reconcile: the first-party compile of broken failed: compile refused: broken');
      assert.ok(error.cause instanceof Error);
      assert.equal(error.cause.message, 'compile refused: broken');
      return true;
    });
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

/*
 * Census anchor, measured 2026-10-02. These counts move only by named lots: a closed forward gap discharges its
 * FORWARD_GAP_PINS row, a reverse row leaves when its emission joins a first-party compile. Re-pin with the lot.
 */
const CENSUS_2026_10_02 = Object.freeze({
  forward: 60,
  reverse: 117,
  reverseBuckets: Object.freeze({ 'produces-roster': 51, 'direct-literal': 58, 'compiled-artifact': 8 }),
});

/*
 * The oracle (compileThemeIntent().cssVariables + modeBlocks) is narrower than the compiled artifact by construction:
 * these are foundation-source declarations bundled into the artifact outside the compiler's cssVariables. Lawful, and
 * the standing proof of that gap -- so they are pinned by name, not by count.
 */
const COMPILED_ARTIFACT_REVERSE_NAMES = Object.freeze([
  '--ds-radius-lg',
  '--ds-radius-md',
  '--ds-radius-sm',
  '--ds-radius-xl',
  '--ds-surface-canvas',
  '--ds-surface-control',
  '--ds-surface-raised',
  '--ds-type-body-font-size',
]);

test('LIVE: the real reconcile matches the 2026-10-02 census and names the compiled-artifact reverse rows', async () => {
  const { result } = runGate({ requireArtifact: false });
  const compiled = await compileFirstPartyEmission();
  const outcome = reconcileCompiledEmission({ channels: result.channels, compiled, rosters: collectFamilyRosters() });
  assert.equal(outcome.ok, true, outcome.failures.join('\n'));
  assert.equal(outcome.forward.length, CENSUS_2026_10_02.forward);
  assert.equal(outcome.forward.filter((row) => row.owner).length, CENSUS_2026_10_02.forward);
  assert.equal(outcome.reverse.length, CENSUS_2026_10_02.reverse);
  const buckets = bucketsOf(outcome.reverse, (row) => row.emittedVia ?? 'none');
  assert.deepEqual(
    Object.fromEntries(Object.entries(buckets).map(([key, names]) => [key, names.length])),
    CENSUS_2026_10_02.reverseBuckets,
  );
  assert.deepEqual(buckets['compiled-artifact'], [...COMPILED_ARTIFACT_REVERSE_NAMES]);
});
