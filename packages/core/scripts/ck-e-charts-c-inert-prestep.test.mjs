import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import ts from 'typescript';

import { countArc09PaintInFile } from './lib/inline-paint-counter.mjs';
import { analyzeRuntimeSvgPaint } from './lib/runtime-svg-paint-counter.mjs';

const packageRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const chartsRoot = join(packageRoot, 'src/components/patterns/visualization/charts');

const CHARTS = {
  histogram: {
    directory: 'histogram',
    scope: 'ds-chart-histogram',
    start: [5, 13],
    floor: [2, 5],
    topology: '7c030ca4234b7b70a5e88b6a78ccb9ef43b3906fbf6215657355500289e22e2a',
    parts: ['legend', 'legend-swatch', 'plot-area', 'axis', 'grid-line', 'bar', 'value-label', 'cumulative-line', 'cumulative-point', 'axis-domain', 'axis-tick'],
  },
  scatter: {
    directory: 'scatter',
    scope: 'ds-chart-scatter',
    start: [3, 11],
    floor: [1, 2],
    topology: '67027457ada5e0ad57ca735779b96351e9a5c987b3e837051a7fae08b0a1e0ff',
    parts: ['legend', 'legend-swatch', 'plot-area', 'axis', 'grid', 'grid-line', 'trend-line', 'series-point', 'axis-domain', 'axis-tick'],
  },
  gauge: {
    directory: 'gauge',
    scope: 'ds-chart-gauge',
    start: [6, 7],
    floor: [1, 4],
    topology: '62ea150453ef72d39be532c47640b7fb8754b5be9ae8ee45ff1f47752f02b19d',
    parts: ['legend', 'legend-swatch', 'plot-area', 'track', 'segment', 'needle', 'needle-mark', 'needle-cap', 'value-label'],
  },
  sankey: {
    directory: 'sankey',
    scope: 'ds-chart-sankey',
    start: [5, 6],
    floor: [3, 2],
    topology: '8d78313782922662881b00ad3c9e98f37741315e69f82e9df8a72dc0b1f074aa',
    parts: ['plot-area', 'links', 'link', 'link-label', 'nodes', 'node', 'node-mark', 'node-label', 'legend'],
  },
  sparkline: {
    directory: 'sparkline',
    scope: 'ds-chart-sparkline',
    start: [0, 9],
    floor: [0, 4],
    topology: '696259d39477bd5ab0105a9668b225447c815af8d4f4dbae0869ae55249033f5',
    parts: ['sparkline', 'definitions', 'area-gradient', 'area-gradient-stop', 'area', 'line', 'end-dot', 'min-dot', 'max-dot'],
  },
  funnel: {
    directory: 'funnel-chart',
    scope: 'ds-chart-funnel',
    start: [3, 6],
    floor: [1, 2],
    topology: 'c724f10b2f95823112abbf332ddd50c092fb446bcc27972cab500476ffeafef8',
    parts: ['legend', 'legend-swatch', 'plot-area', 'segment', 'segment-label', 'segment-value', 'conversion-label'],
  },
  network: {
    directory: 'network-graph',
    scope: 'ds-chart-network-graph',
    start: [3, 5],
    floor: [1, 1],
    topology: '702cef4fd53762711bc70105e4f08aed887809533bd9054cac8b769f173a40c5',
    parts: ['definitions', 'edge-marker', 'edge-marker-path', 'edge', 'node', 'node-mark', 'node-label', 'legend'],
  },
};

function sourcePath(chart) {
  return join(chartsRoot, chart.directory, 'index.tsx');
}

function source(chart) {
  return readFileSync(sourcePath(chart), 'utf8');
}

function authoredParts(text) {
  return new Set(
    [...text.matchAll(/data-part="([^"]+)"/g), ...text.matchAll(/\.attr\('data-part',\s*'([^']+)'\)/g)].map(
      (match) => match[1]
    )
  );
}

function renderAnatomy(text, path) {
  const sourceFile = ts.createSourceFile(path, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const anatomy = [];

  function visit(node) {
    if (ts.isJsxElement(node)) {
      anatomy.push(`jsx:${node.openingElement.tagName.getText(sourceFile)}`);
    } else if (ts.isJsxSelfClosingElement(node)) {
      anatomy.push(`jsx:${node.tagName.getText(sourceFile)}`);
    } else if (
      ts.isCallExpression(node) &&
      ts.isPropertyAccessExpression(node.expression) &&
      node.expression.name.text === 'append' &&
      node.arguments[0] &&
      ts.isStringLiteralLike(node.arguments[0])
    ) {
      anatomy.push(`d3:${node.arguments[0].text}`);
    }
    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return anatomy.join('\n');
}

test('CK-E chart slice C retains its exact 25 inline + 57 runtime pre-step sites', () => {
  let inlineTotal = 0;
  let runtimeTotal = 0;
  for (const [name, chart] of Object.entries(CHARTS)) {
    const path = sourcePath(chart);
    const text = source(chart);
    const inline = countArc09PaintInFile(text, path);
    const runtime = analyzeRuntimeSvgPaint(text, path);
    assert.equal(inline, chart.start[0], `${name} inline paint drifted during the inert pre-step`);
    assert.equal(runtime.count, chart.start[1], `${name} runtime SVG paint drifted during the inert pre-step`);
    assert.equal(runtime.unclassified, 0, `${name} introduced unclassified runtime SVG paint`);
    inlineTotal += inline;
    runtimeTotal += runtime.count;
  }
  assert.deepEqual([inlineTotal, runtimeTotal], [25, 57]);
});

test('CK-E chart slice C exposes every planned scope, part and finite state', () => {
  for (const [name, chart] of Object.entries(CHARTS)) {
    const text = source(chart);
    const parts = authoredParts(text);
    assert.match(text, new RegExp(`className=\\{\\['${chart.scope}', className\\]`), `${name} lacks its scope`);
    for (const part of chart.parts) assert.ok(parts.has(part), `${name} lacks data-part="${part}"`);
  }

  assert.match(source(CHARTS.histogram), /data-variant=\{density \? 'density' : 'frequency'\}/);
  assert.match(source(CHARTS.histogram), /\.tick line:not\(\[data-part\]\)/);
  assert.match(source(CHARTS.scatter), /\.attr\('data-state',\s*'hovered'\)/);
  assert.match(source(CHARTS.scatter), /\.tick line:not\(\[data-part\]\)/);
  assert.match(source(CHARTS.gauge), /\.attr\('data-state',\s*seg === activeSegment \? 'active' : 'inactive'\)/);
  assert.match(source(CHARTS.sankey), /\.attr\('data-state',\s*'hovered'\)/);
  assert.match(source(CHARTS.sparkline), /data-state="ready"/);
  assert.match(source(CHARTS.funnel), /\.attr\('data-position',\s*i === 0/);
  assert.match(source(CHARTS.network), /data-variant=\{directed \? 'directed' : 'undirected'\}/);
});

test('CK-E chart slice C preserves its pre-step React and D3 element anatomy', () => {
  for (const [name, chart] of Object.entries(CHARTS)) {
    const path = sourcePath(chart);
    const digest = createHash('sha256').update(renderAnatomy(source(chart), path)).digest('hex');
    assert.equal(digest, chart.topology, `${name} React/D3 element anatomy drifted`);
  }
});

test('CK-E chart slice C reconciles the exact Stage-1 boundary 82 -> 29', () => {
  const start = Object.values(CHARTS).reduce((sum, chart) => sum + chart.start[0] + chart.start[1], 0);
  const floor = Object.values(CHARTS).reduce((sum, chart) => sum + chart.floor[0] + chart.floor[1], 0);
  assert.equal(start, 82);
  assert.equal(floor, 29);
  assert.equal(start - floor, 53);
});
