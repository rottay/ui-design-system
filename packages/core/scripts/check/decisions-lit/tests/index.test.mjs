/**
 * The instrument's own guards. Every one of these plants the failure it claims
 * to catch: a census that passes on a truncated catalog, a headline whose
 * format drifted, or a violation set that stays empty while the positive
 * control is inert would each make a broken run publishable as green.
 */

import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, rmSync, utimesSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import test from 'node:test';

import {
  DECISIONS,
  NEW_DECISION_IDS,
  POSITIVE_CONTROL_ID,
  assertCatalogCensus,
  censusErrors,
} from '../foundation-catalog/index.mjs';
import {
  discrepanciesOf,
  headline,
  headlineLines,
  measuredFamilies,
  measuredHeadline,
  summarize,
  violations,
} from '../public-cli/index.mjs';
import { assertDoorBuildIsFresh, repoRelative } from '../runtime/compile/index.mjs';
import {
  INSTRUMENT_ENTRY,
  digestOf,
  doorFiles,
  freshnessFailures,
  instrumentFiles,
  sourceFingerprints,
} from '../runtime/freshness/index.mjs';

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


/**
 * The freshness guard's own drills.
 *
 * Every one plants the failure it claims to catch: a digest that stopped
 * covering a file, a fingerprint set that stopped covering a borrowed owner, an
 * artifact that binds itself to nothing, and a refused run republished as
 * fresh would each let STATUS print a number whose subject is gone.
 */

/** A throwaway core tree carrying an instrument entry and the files it imports. */
function tempInstrument() {
  const root = mkdtempSync(join(tmpdir(), 'decisions-lit-instrument-'));
  const write = (relative, body) => {
    const absolute = join(root, relative);
    mkdirSync(dirname(absolute), { recursive: true });
    writeFileSync(absolute, body);
    return relative;
  };
  write('probe/public/cli/index.mjs', [
    "import { x } from '../../foundation/catalog/index.mjs';",
    "import { y } from '../../../borrowed/roster/index.mjs';",
    'export { x, y };\n',
  ].join('\n'));
  write('probe/foundation/catalog/index.mjs', "export const x = 1;\n");
  write('probe/foundation/catalog/data/index.json', '{"rows":1}\n');
  write('borrowed/roster/index.mjs', "export const y = 2;\n");
  write('borrowed/roster/fixtures/index.json', '{"fixtures":[]}\n');
  write('probe/evidence/index.json', '{"headline":"published"}\n');
  write('probe/tests/index.test.mjs', "import '../public-cli/index.mjs';\n");
  write('probe/foundation/catalog/tests/index.test.mjs', "export {};\n");
  return { root, cleanup: () => rmSync(root, { recursive: true, force: true }) };
}

test('the instrument set is the module closure, and it carries each owner\'s data', () => {
  const tree = tempInstrument();
  try {
    assert.deepEqual(instrumentFiles({ coreRoot: tree.root, entry: 'probe/public/cli/index.mjs' }), [
      'borrowed/roster/fixtures/index.json',
      'borrowed/roster/index.mjs',
      'probe/foundation/catalog/data/index.json',
      'probe/foundation/catalog/index.mjs',
      'probe/public/cli/index.mjs',
    ]);
  } finally {
    tree.cleanup();
  }
});

test('the instrument set EXCLUDES tests and the published artifact it is written into', () => {
  const tree = tempInstrument();
  try {
    const files = instrumentFiles({ coreRoot: tree.root, entry: 'probe/public/cli/index.mjs' });
    assert.ok(
      !files.some((file) => file.includes('/tests/')),
      'a test edit must not invalidate a measurement it cannot change',
    );
    assert.ok(
      !files.includes('probe/evidence/index.json'),
      'a digest that hashed the file it is written into cannot exist',
    );
  } finally {
    tree.cleanup();
  }
});

test('a NEW borrowed owner enters the instrument set the moment it is imported', () => {
  const tree = tempInstrument();
  try {
    const before = instrumentFiles({ coreRoot: tree.root, entry: 'probe/public/cli/index.mjs' });
    mkdirSync(join(tree.root, 'borrowed/scope'), { recursive: true });
    writeFileSync(join(tree.root, 'borrowed/scope/index.mjs'), 'export const z = 3;\n');
    writeFileSync(
      join(tree.root, 'borrowed/roster/index.mjs'),
      "import { z } from '../scope/index.mjs';\nexport const y = z;\n",
    );
    const after = instrumentFiles({ coreRoot: tree.root, entry: 'probe/public/cli/index.mjs' });
    assert.deepEqual(
      after.filter((file) => !before.includes(file)),
      ['borrowed/scope/index.mjs'],
      'a hand-listed root set would have missed the new owner; the closure must not',
    );
  } finally {
    tree.cleanup();
  }
});

test('the digest MOVES when one covered byte moves, and is order-independent', () => {
  const tree = tempInstrument();
  try {
    const files = instrumentFiles({ coreRoot: tree.root, entry: 'probe/public/cli/index.mjs' });
    const before = digestOf(files, { coreRoot: tree.root });
    assert.equal(
      digestOf([...files].reverse(), { coreRoot: tree.root }),
      before,
      'the digest must not depend on the order the walk happened to produce',
    );
    writeFileSync(join(tree.root, 'borrowed/roster/fixtures/index.json'), '{"fixtures":["a"]}\n');
    assert.notEqual(
      digestOf(files, { coreRoot: tree.root }),
      before,
      'a fixture edit changes what the probe measures and must change the digest',
    );
  } finally {
    tree.cleanup();
  }
});

test('the digest distinguishes a DELETED covered file from an unchanged tree', () => {
  const tree = tempInstrument();
  try {
    const files = instrumentFiles({ coreRoot: tree.root, entry: 'probe/public/cli/index.mjs' });
    const before = digestOf(files, { coreRoot: tree.root });
    rmSync(join(tree.root, 'borrowed/roster/fixtures/index.json'));
    assert.notEqual(digestOf(files, { coreRoot: tree.root }), before);
  } finally {
    tree.cleanup();
  }
});

const FINGERPRINTS = {
  door: { roots: ['src/foundation'], fileCount: 2, digest: 'a'.repeat(64) },
  instrument: { entry: INSTRUMENT_ENTRY, fileCount: 3, digest: 'b'.repeat(64) },
};

function publishedArtifact(overrides = {}) {
  return {
    headline: 'decisions lit = 7/22 (+0/10 new)',
    producedAt: '2026-09-07T00:00:00.000Z',
    summary: { decisions: [], discrepancies: [] },
    violations: [],
    provenance: { sources: FINGERPRINTS },
    ...overrides,
  };
}

test('a published artifact whose two digests match this tree is fresh', () => {
  assert.deepEqual(
    freshnessFailures({ artifact: publishedArtifact(), fingerprints: FINGERPRINTS }),
    [],
  );
});

test('REFUSES an artifact that binds itself to no tree at all', () => {
  const failures = freshnessFailures({
    artifact: publishedArtifact({ provenance: { build: {} } }),
    fingerprints: FINGERPRINTS,
  });
  assert.equal(failures.length, 2);
  assert.ok(failures.every((failure) => failure.includes('records no')));
});

test('REFUSES a door that moved since the run, and says which side moved', () => {
  const failures = freshnessFailures({
    artifact: publishedArtifact(),
    fingerprints: {
      ...FINGERPRINTS,
      door: { ...FINGERPRINTS.door, fileCount: 3, digest: 'c'.repeat(64) },
    },
  });
  assert.equal(failures.length, 1);
  assert.match(failures[0], /^the door moved since the published run/);
  assert.match(failures[0], /run decisions-lit/);
});

test('REFUSES an instrument that moved since the run', () => {
  const failures = freshnessFailures({
    artifact: publishedArtifact(),
    fingerprints: {
      ...FINGERPRINTS,
      instrument: { ...FINGERPRINTS.instrument, digest: 'd'.repeat(64) },
    },
  });
  assert.equal(failures.length, 1);
  assert.match(failures[0], /^the instrument moved since the published run/);
});

test('REFUSES a run that never certified itself, however fresh its digests are', () => {
  const failures = freshnessFailures({
    artifact: publishedArtifact({ violations: ['positive control moved no family in bithire'] }),
    fingerprints: FINGERPRINTS,
  });
  assert.equal(failures.length, 1);
  assert.match(failures[0], /did not certify itself/);
});

test('a MISSING artifact is refused, never read as a fresh zero', () => {
  const failures = freshnessFailures({
    artifact: null,
    fingerprints: FINGERPRINTS,
    artifactPath: 'packages/core/scripts/check/decisions-lit/evidence/index.json',
  });
  assert.equal(failures.length, 1);
  assert.match(failures[0], /no run has published an artifact/);
  assert.ok(!/0\/22/.test(failures[0]), 'a missing run must never be published as a zero');
});

test('the real tree fingerprints are non-empty and cover both door roots', () => {
  const fingerprints = sourceFingerprints();
  assert.ok(fingerprints.door.fileCount > 0, 'a vacuous door set would make every artifact fresh');
  assert.ok(fingerprints.instrument.fileCount > 0);
  assert.equal(fingerprints.instrument.entry, INSTRUMENT_ENTRY);
  const files = doorFiles();
  for (const root of fingerprints.door.roots) {
    assert.ok(
      files.some((file) => file.startsWith(`${root}/`)),
      `the door digest covers no file under ${root}`,
    );
  }
  assert.ok(
    !files.some((file) => /\.(test|spec|stories)\./.test(file)),
    'a test edit must not force a re-measurement it cannot change',
  );
});

test('the build guard ignores GENERATED output under a door root, and only that', () => {
  const now = Date.now();
  const tree = tempCore({ distMs: now, sourceMs: now - 60_000 });
  const generated = join(tree.root, 'src/foundation/tokens/css/facade/artifacts/evnto/index.css');
  mkdirSync(dirname(generated), { recursive: true });
  writeFileSync(generated, ':root{}\n');
  utimesSync(generated, (now + 60_000) / 1000, (now + 60_000) / 1000);
  try {
    // `build:vertical-css` rewrites these AFTER vite build, so every correct
    // build ends in this state and the guard must not refuse it.
    assert.doesNotThrow(() => assertDoorBuildIsFresh({ coreRoot: tree.root }));
    utimesSync(tree.source, (now + 60_000) / 1000, (now + 60_000) / 1000);
    assert.throws(
      () => assertDoorBuildIsFresh({ coreRoot: tree.root }),
      /older than the door it must measure/,
      'an AUTHORED door source newer than the dist is still a stale build',
    );
  } finally {
    tree.cleanup();
  }
});
