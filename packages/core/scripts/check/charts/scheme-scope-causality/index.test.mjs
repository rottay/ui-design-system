/**
 * Drill for chart-scheme-scope-causality.
 *
 * This instrument is RED at its own base by design, so its drill cannot be
 * "run it and expect green". It proves two things instead:
 *
 *   1. the adjudicator has teeth AND can go green. A synthetic census where
 *      every scope matches its family's decision passes; each of the four
 *      divergence classes reddens it, one class per plant. This is the lot-0
 *      form of P5 -- reverting the renderer to the token hook is the mutation
 *      that produces exactly the `scope-ignores-request` census below, and it
 *      cannot be planted in the tree yet because the tree has not been wired.
 *   2. the real probe still measures the divergence the debrief recorded.
 *      A run that stopped finding it would mean the probe silently stopped
 *      rendering, not that the tree was repaired.
 *
 * The live leg is opt-in through CHART_CAUSALITY_DRILL_LIVE=1: it renders 55
 * charts and belongs in the instrument's own window, not in a unit drill.
 */
import assert from 'node:assert/strict';
import test from 'node:test';

import { DIVERGENCES, adjudicate, classify, measure } from './index.mjs';

const AGREEING = {
  family: 'bar-chart',
  requested: 'vibrant',
  expectedScheme: 'vibrant',
  expectedPaint: 'var(--ds-chart-category-1, var(--ds-chart-vibrant-1, #006b63))',
  stampedScheme: 'vibrant',
  governedPaint: 'var(--ds-chart-category-1, var(--ds-chart-vibrant-1, #006b63))',
  anyPaint: 'var(--ds-chart-category-1, var(--ds-chart-vibrant-1, #006b63))',
  scopeAgrees: true,
  paintAgrees: true,
  rendered: true,
};

function row(overrides) {
  return { ...AGREEING, ...overrides };
}

test('a census where every scope is its own decision passes', () => {
  const report = adjudicate({ rows: [row({}), row({ family: 'pie-chart' })] });
  assert.equal(report.total, 2);
  assert.equal(report.agreeing, 2);
  assert.deepEqual(report.divergences, []);
});

test('P5: a scope stamped from tokens rather than the decision reddens', () => {
  // Exactly the census a renderer re-resolving from useResolvedChartPersonality
  // produces: the request was vibrant, the stamp is the token default.
  const report = adjudicate({ rows: [row({ stampedScheme: 'default' })] });
  assert.equal(report.divergences.length, 1);
  assert.equal(report.divergences[0].kind, DIVERGENCES.SCOPE);
});

test('a mark painted outside the governed chain reddens', () => {
  const report = adjudicate({
    rows: [row({ governedPaint: null, anyPaint: 'var(--ds-color-primary-900)' })],
  });
  assert.equal(report.divergences[0].kind, DIVERGENCES.PAINT_UNGOVERNED);
});

test('a mark painted from another scheme table reddens', () => {
  const report = adjudicate({
    rows: [
      row({
        requested: 'default',
        expectedScheme: 'default',
        expectedPaint: 'var(--ds-chart-default-1, #0f766e)',
        stampedScheme: 'default',
        governedPaint: 'var(--ds-chart-accessible-1, #2f6b9a)',
      }),
    ],
  });
  assert.equal(report.divergences[0].kind, DIVERGENCES.PAINT_WRONG_TABLE);
});

test('a family that never rendered is a divergence, not a silent pass', () => {
  const report = adjudicate({ rows: [row({ rendered: false })] });
  assert.equal(report.divergences[0].kind, DIVERGENCES.UNRENDERED);
});

test('the scope is adjudicated before the paint, so one row carries one cause', () => {
  const both = row({ stampedScheme: 'default', governedPaint: null });
  assert.equal(classify(both), DIVERGENCES.SCOPE);
});

test('an empty census is not a pass by vacuity', () => {
  const report = adjudicate({ rows: [] });
  assert.equal(report.total, 0);
  assert.equal(report.agreeing, 0);
  // The CLI's own verdict is divergence-count based, so callers must check
  // `total` too; this test pins that an empty census reports zero measured.
  assert.deepEqual(report.divergences, []);
});

test('the live probe still measures the divergence the debrief recorded', { skip: process.env.CHART_CAUSALITY_DRILL_LIVE !== '1' }, () => {
  const report = adjudicate(measure());
  assert.equal(report.total, 55, 'eleven categorical families times five schemes');
  assert.equal(
    report.divergences.length > 0,
    true,
    'the tree reports no divergence: either lot 1 landed (re-pin this drill) or the probe stopped rendering',
  );
  assert.equal(report.byKind[DIVERGENCES.SCOPE] > 0, true);
});
