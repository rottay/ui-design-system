/**
 * The instrument's own guards. Every one of these plants the failure it claims
 * to catch: a census that passes on a truncated catalog, a headline whose
 * format drifted, or a violation set that stays empty while the positive
 * control is inert would each make a broken run publishable as green.
 */

import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, rmSync, utimesSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

import {
  DECISIONS,
  NEW_DECISION_IDS,
  POSITIVE_CONTROL_ID,
  assertCatalogCensus,
  censusErrors,
} from '../foundation/catalog/index.mjs';
import {
  discrepanciesOf,
  headline,
  headlineLines,
  measuredFamilies,
  measuredHeadline,
  summarize,
  violations,
} from '../public/cli/index.mjs';
import { assertDoorBuildIsFresh, repoRelative } from '../runtime/compile/index.mjs';

test('the catalog states the kit census: 29 rows, 19 standard, 10 pro, 10 new', () => {
  assert.deepEqual(censusErrors(), []);
  assert.equal(DECISIONS.length, 29);
  assert.equal(NEW_DECISION_IDS.length, 10);
  assert.doesNotThrow(assertCatalogCensus);
});

test('the census REFUSES a truncated catalog', () => {
  const errors = censusErrors(DECISIONS.slice(0, 28));
  assert.ok(errors.some((error) => error.includes('expected 29 rows')));
});

test('the census REFUSES a row whose two probe values are the same', () => {
  const tampered = DECISIONS.map((row, index) =>
    index === 0 ? { ...row, values: [row.values[0], row.values[0]] } : row,
  );
  assert.ok(
    censusErrors(tampered).some((error) => error.includes('measures nothing')),
    'a decision probed with one value twice measures nothing and must be refused',
  );
});

const row = (id, extra = {}) => ({
  id,
  vertical: 'bithire',
  artifactBytesDiffer: false,
  movedFamilies: [],
  movedTargets: {},
  movedChannels: [],
  ...extra,
});

function fullRun(overrides = {}) {
  return DECISIONS.map((decision) =>
    row(decision.id, {
      ...(decision.id === POSITIVE_CONTROL_ID
        ? { artifactBytesDiffer: true, movedFamilies: ['card-modern-md'] }
        : {}),
      ...(overrides[decision.id] ?? {}),
    }),
  );
}

test('the headline is exactly the string the acceptance gate reads', () => {
  const summary = summarize(fullRun());
  assert.equal(headline(summary), 'decisions lit = 7/22 (+0/10 new)');
});

test('the measured half is DERIVED from the rows, not from the recorded class', () => {
  // Two rows move a family: the positive control (recorded `full`) and a row
  // recorded `none`. The recorded count stays 7; the measured count is 2.
  const noneRow = DECISIONS.find((decision) => decision.recordedClass === 'none');
  const rows = fullRun({
    [noneRow.id]: { artifactBytesDiffer: true, movedFamilies: ['skeleton'] },
  });
  const summary = summarize(rows);
  assert.equal(summary.lit, 7);
  assert.equal(summary.measuredLit, 2);
  assert.equal(
    measuredHeadline(summary, 8),
    'measured on the 8-family sample: 2/22 move at least one sampled family',
  );
});

test('both halves are published, and the gate substring survives', () => {
  const summary = summarize(fullRun());
  const lines = headlineLines(summary, 8);
  assert.ok(lines[0].includes('decisions lit = 7/22 (+0/10 new)'));
  assert.ok(lines[0].includes('recorded'));
  assert.ok(lines[1].includes('measured on the 8-family sample'));
});

test('a recorded `full` row that moves no sampled family is published as a discrepancy', () => {
  const summary = summarize(fullRun());
  const full = DECISIONS.filter((decision) => decision.recordedClass === 'full');
  // Only the positive control moves in this synthetic run, so every other
  // recorded-full row must appear as a discrepancy rather than pass in silence.
  assert.equal(
    summary.discrepancies.filter((row) => row.kind === 'recorded-full-moved-nothing').length,
    full.length - 1,
  );
  assert.ok(headlineLines(summary, 8).join('\n').includes('recorded-full-moved-nothing'));
});

test('a recorded `none` row that moves families is published as a discrepancy', () => {
  const noneRow = DECISIONS.find((decision) => decision.recordedClass === 'none');
  const summary = summarize(
    fullRun({ [noneRow.id]: { artifactBytesDiffer: true, movedFamilies: ['skeleton'] } }),
  );
  assert.deepEqual(
    summary.discrepancies.filter((row) => row.kind === 'recorded-none-moved'),
    [{ id: noneRow.id, kind: 'recorded-none-moved', detail: 'skeleton' }],
  );
});

test('discrepanciesOf reports agreement as an empty list, never as silence', () => {
  assert.deepEqual(
    discrepanciesOf([
      { id: 'a', recordedClass: 'full', movedFamilies: ['card'], movedChannelCount: 3 },
      { id: 'b', recordedClass: 'none', movedFamilies: [], movedChannelCount: 0 },
      { id: 'c', recordedClass: 'partial', movedFamilies: [], movedChannelCount: 1 },
    ]),
    [],
  );
});

test('a clean run has no violations', () => {
  const rows = fullRun();
  assert.deepEqual(violations({ summary: summarize(rows), rows, verticals: ['bithire'] }), []);
});

test('REFUSES a run whose positive control moved no family', () => {
  const rows = DECISIONS.map((decision) => row(decision.id));
  const problems = violations({ summary: summarize(rows), rows, verticals: ['bithire'] });
  assert.ok(
    problems.some((problem) => problem.includes('this run measures nothing')),
    'an inert positive control voids every verdict in the same run',
  );
});

test('REFUSES a run in which a decision recorded `new` moved', () => {
  const rows = fullRun({ [NEW_DECISION_IDS[0]]: { artifactBytesDiffer: true } });
  const summary = summarize(rows);
  assert.equal(summary.newLit, 1);
  assert.equal(headline(summary), 'decisions lit = 7/22 (+1/10 new)');
  assert.ok(
    violations({ summary, rows, verticals: ['bithire'] }).some((problem) =>
      problem.includes('MEASURED MOVING'),
    ),
  );
});

test('a compile exclusion is published, never folded into "moved nothing"', () => {
  const rows = fullRun({ 'spacing.rhythm': { excluded: 'ThemeError: envelope rejects' } });
  const summary = summarize(rows);
  const rhythm = summary.decisions.find((entry) => entry.id === 'spacing.rhythm');
  assert.deepEqual(rhythm.excludedIn, [
    { vertical: 'bithire', reason: 'ThemeError: envelope rejects' },
  ]);
  assert.equal(rhythm.artifactBytesDiffer, false);
});

test('the family sample excludes the synthetic channel readout', () => {
  assert.deepEqual(
    measuredFamilies({ bithire: { matched: ['card-modern-md', 'token-readout'] } }),
    ['card'],
  );
});


/** A throwaway core tree: `dist/server.js` plus the two source roots. */
function tempCore({ distMs, sourceMs }) {
  const root = mkdtempSync(join(tmpdir(), 'decisions-lit-freshness-'));
  mkdirSync(join(root, 'dist'), { recursive: true });
  mkdirSync(join(root, 'src/foundation/deep'), { recursive: true });
  mkdirSync(join(root, 'src/infrastructure/compilers'), { recursive: true });
  const dist = join(root, 'dist/server.js');
  const source = join(root, 'src/foundation/deep/index.ts');
  const compiler = join(root, 'src/infrastructure/compilers/index.ts');
  for (const [path, ms] of [[dist, distMs], [source, sourceMs], [compiler, sourceMs]]) {
    writeFileSync(path, 'export {};\n');
    utimesSync(path, ms / 1000, ms / 1000);
  }
  return {
    root,
    dist,
    source,
    compiler,
    cleanup: () => rmSync(root, { recursive: true, force: true }),
  };
}

test('the freshness guard REFUSES a dist older than a source, naming the tree', () => {
  const now = Date.now();
  const tree = tempCore({ distMs: now - 60_000, sourceMs: now });
  try {
    assert.throws(
      () => assertDoorBuildIsFresh({ coreRoot: tree.root }),
      (error) => {
        assert.match(error.message, /older than the door it must measure/);
        assert.match(error.message, /src\/foundation/);
        assert.match(error.message, /index\.ts/);
        return true;
      },
    );
  } finally {
    tree.cleanup();
  }
});

test('the freshness guard PASSES when the dist is newer, and reports a relative path', () => {
  const now = Date.now();
  const tree = tempCore({ distMs: now, sourceMs: now - 60_000 });
  try {
    const result = assertDoorBuildIsFresh({ coreRoot: tree.root });
    assert.equal(typeof result.builtAt, 'string');
    assert.ok(!result.dist.startsWith('/'), 'the artifact must not carry an absolute machine path');
  } finally {
    tree.cleanup();
  }
});

test('the freshness guard REFUSES a missing dist rather than skipping the check', () => {
  const root = mkdtempSync(join(tmpdir(), 'decisions-lit-nodist-'));
  try {
    assert.throws(() => assertDoorBuildIsFresh({ coreRoot: root }), /is missing/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('the guard covers the compiler tree, not only the two door owners', () => {
  const now = Date.now();
  const tree = tempCore({ distMs: now, sourceMs: now - 60_000 });
  utimesSync(tree.compiler, (now + 60_000) / 1000, (now + 60_000) / 1000);
  try {
    assert.throws(
      () => assertDoorBuildIsFresh({ coreRoot: tree.root }),
      /src\/infrastructure\/compilers/,
    );
  } finally {
    tree.cleanup();
  }
});

test('repoRelative strips the machine prefix from a tracked path', () => {
  assert.ok(!repoRelative(process.cwd()).startsWith('/'));
});
