/**
 * The drill for `state-material-arm`.
 *
 * A counter that has never been red is not a counter. Every clause the gate
 * can fail on is driven red here against a fixture tree and then back to
 * green, and every exclusion is shown to exclude for its stated reason rather
 * than because the row happened to be missed.
 *
 * The population drills replay the mutation of audit 100 (F6): keep every
 * stylesheet, rename every `--ds-` prefix away, and the three original clauses
 * all stay green on nothing at all.
 */
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

import { classify, measure, runGate } from './index.mjs';

const BASELINE = { ungoverned: 0, ratioFloor: 0.8, corpusFloor: 1, populationFloor: 1 };

function fixture(css, { path = 'src/foundation/tokens/css/probe/index.css' } = {}) {
  const root = mkdtempSync(join(tmpdir(), 'state-material-arm-'));
  const file = join(root, path);
  mkdirSync(join(file, '..'), { recursive: true });
  writeFileSync(file, css);
  return { root, cleanup: () => rmSync(root, { recursive: true, force: true }) };
}

const GOVERNED = `:root {\n  --ds-widget-bg-hover: var(--ds-material-card-background-hover);\n}\n`;

test('a governed root declaration passes and is counted', () => {
  const { root, cleanup } = fixture(GOVERNED);
  try {
    const report = measure({ root });
    assert.equal(report.population, 1);
    assert.equal(report.governed, 1);
    assert.equal(report.ungoverned, 0);
  } finally { cleanup(); }
});

test('planting one ungoverned state channel makes the ratchet red', () => {
  const { root, cleanup } = fixture(`${GOVERNED}:root {\n  --ds-widget-bg-active: #ff0000;\n}\n`);
  try {
    const { report, failures } = runGate({ root, baseline: BASELINE, quiet: true });
    assert.equal(report.ungoverned, 1);
    assert.equal(failures.length > 0, true);
    assert.match(failures.join('\n'), /decrease-only/);
  } finally { cleanup(); }
});

test('the ratio floor bites even when the ratchet does not', () => {
  const planted = [...Array(9)].map((_, i) => `  --ds-widget-${i}-bg-active: #ff0000;`).join('\n');
  const { root, cleanup } = fixture(`${GOVERNED}:root {\n${planted}\n}\n`);
  try {
    const { report, failures } = runGate({
      root,
      baseline: { ...BASELINE, ungoverned: 99 },
      quiet: true,
    });
    assert.equal(report.ratio < 0.8, true);
    assert.match(failures.join('\n'), /the floor is 80\.0 %/);
  } finally { cleanup(); }
});

test('an empty corpus fails instead of passing by looking at nothing', () => {
  const { root, cleanup } = fixture(GOVERNED);
  try {
    const { failures } = runGate({ root, baseline: { ...BASELINE, corpusFloor: 5 }, quiet: true });
    assert.match(failures.join('\n'), /corpus collapsed/);
  } finally { cleanup(); }
});

test('the audit-100 mutation is caught: a full corpus with an empty population', () => {
  const { root, cleanup } = fixture(GOVERNED.replaceAll('--ds-', '--audit-'));
  try {
    for (let i = 0; i < 4; i += 1) {
      const file = join(root, `src/components/probe-${i}/index.css`);
      mkdirSync(join(file, '..'), { recursive: true });
      writeFileSync(file, ':root {\n  --audit-widget-bg-hover: #ff0000;\n}\n');
    }
    const { report, failures } = runGate({
      root,
      baseline: { ...BASELINE, corpusFloor: 5 },
      quiet: true,
    });
    assert.equal(report.corpus, 5);
    assert.equal(report.population, 0);
    assert.equal(report.ratio, 1);
    assert.equal(failures.length, 1);
    assert.match(failures[0], /population collapsed to 0 root-scope state channels/);
  } finally { cleanup(); }
});

test('the pinned population floor bites before the population reaches zero', () => {
  const { root, cleanup } = fixture(GOVERNED);
  try {
    const { report, failures } = runGate({
      root,
      baseline: { ...BASELINE, populationFloor: 2 },
      quiet: true,
    });
    assert.equal(report.population, 1);
    assert.match(failures.join('\n'), /floor 2/);
  } finally { cleanup(); }
});

test('the disposition list is held to the tree in both directions', () => {
  const { root, cleanup } = fixture(`${GOVERNED}:root {\n  --ds-widget-bg-active: #ff0000;\n}\n`);
  try {
    const undisposed = runGate({
      root,
      baseline: { ...BASELINE, ungoverned: 1, ungovernedDispositions: [] },
      quiet: true,
    });
    assert.match(undisposed.failures.join('\n'), /carry no disposition .*--ds-widget-bg-active/);

    const stale = runGate({
      root,
      baseline: {
        ...BASELINE,
        ungoverned: 1,
        ungovernedDispositions: [
          { channel: '--ds-widget-bg-active', owner: 'WO-FAM-01' },
          { channel: '--ds-widget-bg-selected', owner: 'WO-FAM-01' },
        ],
      },
      quiet: true,
    });
    assert.match(stale.failures.join('\n'), /no longer has: --ds-widget-bg-selected/);
  } finally { cleanup(); }
});

test('each exclusion excludes for its own stated reason', () => {
  const { root, cleanup } = fixture(
    `:root {\n`
    + `  --ds-widget-primary-bg-hover: #ff0000;\n`
    + `  --ds-widget-alt-bg-hover: var(--ds-color-primary-600);\n`
    + `  --ds-widget-bg-selected: transparent;\n`
    + `  --ds-sidebar-item-bg-hover: #ff0000;\n`
    + `  --ds-widget-color-hover: #ff0000;\n`
    + `}\n`,
  );
  try {
    const report = measure({ root });
    assert.equal(report.population, 0);
    assert.deepEqual(report.excluded, {
      tone: 2,
      structural: 1,
      familyGoverned: 1,
      outsideVocabulary: 1,
    });
  } finally { cleanup(); }
});

test('a governed alias of a sibling counts as governed, one indirection deep', () => {
  const { root, cleanup } = fixture(
    `:root {\n`
    + `  --ds-widget-border-color-hover: var(--ds-material-card-border-hover);\n`
    + `  --ds-widget-border-hover: var(--ds-widget-border-color-hover);\n`
    + `}\n`,
  );
  try {
    const report = measure({ root });
    assert.equal(report.population, 2);
    assert.equal(report.ungoverned, 0);
  } finally { cleanup(); }
});

test('a scoped restatement is reported apart from the root authority', () => {
  const { root, cleanup } = fixture(
    `${GOVERNED}.ds-widget--compact {\n  --ds-widget-bg-active: #ff0000;\n}\n`,
  );
  try {
    const report = measure({ root });
    assert.equal(report.population, 1);
    assert.equal(report.scoped, 1);
    assert.equal(report.ungoverned, 0);
  } finally { cleanup(); }
});

test('a frozen engine and a generated artifact are outside the corpus', () => {
  const { root, cleanup } = fixture(GOVERNED);
  try {
    for (const path of [
      'src/foundation/tokens/css/runtime/engines/rustic/skin/probe/index.css',
      'src/foundation/tokens/css/facade/artifacts/rottay/index.css',
    ]) {
      const file = join(root, path);
      mkdirSync(join(file, '..'), { recursive: true });
      writeFileSync(file, ':root {\n  --ds-widget-bg-active: #ff0000;\n}\n');
    }
    const report = measure({ root });
    assert.equal(report.corpus, 1);
    assert.equal(report.ungoverned, 0);
  } finally { cleanup(); }
});

test('the classifier reads the facet off the name, suffix order included', () => {
  assert.deepEqual(classify('--ds-widget-bg-hover')?.facet, 'background');
  assert.deepEqual(classify('--ds-widget-hover-bg')?.facet, 'background');
  assert.deepEqual(classify('--ds-widget-hover-background-color')?.facet, 'background');
  assert.deepEqual(classify('--ds-widget-border-color-disabled')?.facet, 'border');
  assert.deepEqual(classify('--ds-widget-shadow-hover')?.facet, 'shadow');
  assert.equal(classify('--ds-color-bg-hover'), null);
  assert.equal(classify('--ds-widget-transform-hover'), null);
});
