import assert from 'node:assert/strict';
import test from 'node:test';

import { CHART_GEOMETRY_DIRECTORY, chartGeometryRenderedExports } from './index.mjs';

const DIST = `/repo/packages/core/dist${CHART_GEOMETRY_DIRECTORY}`;
const BUILDERS = ['buildSvgBarGeometry', 'buildSvgFunnelGeometry', 'buildSvgGaugeGeometry'];
const retained = (modules) => {
  const rendered = chartGeometryRenderedExports(modules);
  return BUILDERS.filter((builder) => rendered.has(builder));
};

const SINGLE_MODULE = new Map([
  [`${DIST}index.js`, { renderedLength: 900, renderedExports: BUILDERS }],
  ['/repo/packages/core/dist/components/patterns/visualization/charts/runtime/chart-engine/presentation/react/renderers/bar/index.js', {
    renderedLength: 400,
    renderedExports: ['SvgBarRenderer'],
  }],
]);
const SPLIT_MEMBERS = new Map([
  [`${DIST}foundation/index.js`, { renderedLength: 120, renderedExports: ['finiteNumber'] }],
  [`${DIST}bar/index.js`, { renderedLength: 300, renderedExports: ['buildSvgBarGeometry'] }],
  [`${DIST}funnel/index.js`, { renderedLength: 300, renderedExports: ['buildSvgFunnelGeometry'] }],
  [`${DIST}gauge/index.js`, { renderedLength: 300, renderedExports: ['buildSvgGaugeGeometry'] }],
]);

test('reads the builders of the single geometry module', () => {
  assert.deepEqual(retained(SINGLE_MODULE), BUILDERS);
  assert.equal(chartGeometryRenderedExports(SINGLE_MODULE).has('SvgBarRenderer'), false);
});

test('reads the builders across every member of a split geometry folder', () => {
  assert.deepEqual(retained(SPLIT_MEMBERS), BUILDERS);
});

test('a member missing from the read loses its builder', () => {
  for (const member of ['bar', 'funnel', 'gauge']) {
    const modules = new Map(SPLIT_MEMBERS);
    modules.delete(`${DIST}${member}/index.js`);
    assert.equal(retained(modules).length, BUILDERS.length - 1, member);
  }
  // The pre-split read (one file) finds no builder in a split folder.
  const rootOnly = new Map([...SPLIT_MEMBERS].filter(([moduleId]) => moduleId.endsWith(`${CHART_GEOMETRY_DIRECTORY}index.js`)));
  assert.deepEqual(retained(rootOnly), []);
});

test('ignores a builder name rendered outside the geometry folder', () => {
  const modules = new Map([
    ['/repo/packages/core/dist/components/patterns/visualization/charts/elsewhere/geometry-copy/index.js', {
      renderedLength: 300,
      renderedExports: BUILDERS,
    }],
  ]);
  assert.deepEqual(retained(modules), []);
});
