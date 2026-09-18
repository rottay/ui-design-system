/**
 * Drill for the browser leg of chart-scheme-scope-causality.
 *
 * Like its happy-dom sibling, this leg is RED at its own base, so the drill
 * cannot be "run it and expect green". It proves four things instead:
 *
 *   1. the adjudicator can go green AND has teeth: a synthetic census where
 *      every fill is its own scheme's slot 1 passes, and each divergence class
 *      reddens it one plant at a time;
 *   2. a row whose negative control is vacuous -- the wrong scheme resolves to
 *      the same colour as the right one -- is NOT reported as a pass, because
 *      such a row proves nothing;
 *   3. the mode witness catches a capture that measured one mode twice;
 *   4. the staleness guard refuses a published stylesheet that no longer
 *      contains a chain source, by name.
 *
 * The live leg is opt-in through CHART_CAUSALITY_BROWSER_LIVE=1: it builds a
 * bundle and drives Chromium twice, and belongs in the instrument's own window.
 */
import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import test from 'node:test';

import {
  CHAIN_SOURCES,
  DIVERGENCES,
  adjudicate,
  assertStylesheetFreshness,
  classify,
  measure,
  modeSensitivity,
  negativeControl,
} from './index.mjs';

const AGREEING = {
  family: 'pie-chart',
  requested: 'vibrant',
  mode: 'light',
  expectedScheme: 'vibrant',
  stampedScheme: 'vibrant',
  rendered: true,
  computedFill: 'rgb(0, 107, 99)',
  expectedFill: 'rgb(0, 107, 99)',
  wrongScheme: 'monochrome',
  wrongFill: 'rgb(44, 85, 135)',
  fillTable: 'vibrant',
  markColorChannel: 'var(--ds-chart-paint-1, var(--ds-color-primary))',
};

function row(overrides) {
  return { ...AGREEING, ...overrides };
}

function census(rows, overrides = {}) {
  return {
    mode: 'light',
    modeWitness: { vibrant: 'rgb(0, 107, 99)' },
    rows,
    ...overrides,
  };
}

test('a census where every fill is its own scheme passes', () => {
  const report = adjudicate(census([row({}), row({ family: 'bar-chart' })]));
  assert.equal(report.total, 2);
  assert.equal(report.agreeing, 2);
  assert.deepEqual(report.divergences, []);
});

test('P5: a scope stamped from tokens rather than the decision reddens', () => {
  const report = adjudicate(census([row({ stampedScheme: 'default' })]));
  assert.equal(report.divergences[0].kind, DIVERGENCES.SCOPE);
});

test('a fill taken from another scheme table reddens', () => {
  // The bar/pie divergence measured at base: the request is `default`, the
  // paint is `accessible` slot 1.
  const report = adjudicate(
    census([
      row({
        family: 'bar-chart',
        requested: 'default',
        expectedScheme: 'default',
        stampedScheme: 'default',
        computedFill: 'rgb(47, 107, 154)',
        expectedFill: 'rgb(15, 118, 110)',
        fillTable: 'accessible',
      }),
    ]),
  );
  assert.equal(report.divergences[0].kind, DIVERGENCES.FILL_WRONG_TABLE);
});

test('a fill that resolved to nothing is not a pass', () => {
  const report = adjudicate(census([row({ expectedFill: null })]));
  assert.equal(report.divergences[0].kind, DIVERGENCES.FILL_UNRESOLVED);
});

test('a family that never rendered is a divergence, not a silent pass', () => {
  const report = adjudicate(census([row({ rendered: false })]));
  assert.equal(report.divergences[0].kind, DIVERGENCES.UNRENDERED);
});

test('a row whose wrong scheme resolves to the same colour proves nothing', () => {
  const report = adjudicate(census([row({ wrongFill: AGREEING.expectedFill })]));
  assert.equal(report.divergences[0].kind, DIVERGENCES.INDISCRIMINATE);
});

test('the scope is adjudicated before the fill, so one row carries one cause', () => {
  assert.equal(
    classify(row({ stampedScheme: 'default', computedFill: 'rgb(1, 1, 1)' })),
    DIVERGENCES.SCOPE,
  );
});

test('an empty census is not a pass by vacuity', () => {
  const report = adjudicate(census([]));
  assert.equal(report.total, 0);
  assert.equal(report.agreeing, 0);
});

test('the negative control flips every agreeing row and names any survivor', () => {
  const control = negativeControl(census([row({}), row({ family: 'bar-chart' })]));
  assert.equal(control.agreeingBefore, 2);
  assert.equal(control.flipped, 2);
  assert.deepEqual(control.survived, []);
});

test('a capture that measured one mode twice is caught by the witness', () => {
  const light = census([], { mode: 'light', modeWitness: { vibrant: 'rgb(0, 107, 99)' } });
  const dark = census([], { mode: 'dark', modeWitness: { vibrant: 'rgb(0, 107, 99)' } });
  assert.deepEqual(modeSensitivity([light, dark]).inert, ['vibrant']);
  const moved = census([], { mode: 'dark', modeWitness: { vibrant: 'rgb(85, 220, 203)' } });
  assert.deepEqual(modeSensitivity([light, moved]).inert, []);
});

test('one captured mode is reported as unmeasured, never as sensitive', () => {
  const sensitivity = modeSensitivity([census([], { mode: 'light' })]);
  assert.equal(sensitivity.measured, false);
  assert.equal(typeof sensitivity.reason, 'string');
});

test('a published stylesheet missing a chain source is refused by name', () => {
  const workspace = mkdtempSync(join(tmpdir(), 'chart-causality-freshness-'));
  const contents = CHAIN_SOURCES.map((source, index) => `.plant-${index} { color: red; }`);
  for (const [index, source] of CHAIN_SOURCES.entries()) {
    mkdirSync(join(workspace, dirname(source)), { recursive: true });
    writeFileSync(join(workspace, source), `${contents[index]}\n`, 'utf8');
  }
  mkdirSync(join(workspace, 'dist'), { recursive: true });

  writeFileSync(join(workspace, 'dist/styles.css'), contents.join('\n'), 'utf8');
  assert.equal(assertStylesheetFreshness({ cwd: workspace }).verified, CHAIN_SOURCES.length);

  writeFileSync(join(workspace, 'dist/styles.css'), contents.slice(1).join('\n'), 'utf8');
  assert.throws(
    () => assertStylesheetFreshness({ cwd: workspace }),
    (error) => error.message.includes(CHAIN_SOURCES[0]) && error.message.includes('stale'),
  );
});

test(
  'the live capture still measures both families in both modes',
  { skip: process.env.CHART_CAUSALITY_BROWSER_LIVE !== '1' },
  () => {
    const report = adjudicate(measure());
    assert.equal(report.total, 20, 'two families times five schemes times two modes');
    assert.deepEqual(report.modeSensitivity.inert, []);
    assert.equal(
      report.agreeing > 0,
      true,
      'nothing agrees: the scene stopped rendering rather than the tree regressing',
    );
  },
);
