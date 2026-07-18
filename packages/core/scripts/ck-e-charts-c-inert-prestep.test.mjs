import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import postcss from 'postcss';
import ts from 'typescript';

import { countArc09PaintInFile } from './lib/inline-paint-counter.mjs';
import { analyzeRuntimeSvgPaint } from './lib/runtime-svg-paint-counter.mjs';

const packageRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const chartsRoot = join(packageRoot, 'src/ui/patterns/visualization/charts/families');
const renderersRoot = join(packageRoot, 'src/ui/patterns/visualization/charts/runtime/chart-engine/presentation/react/renderers');
const skinPath = join(packageRoot, 'src/foundation/tokens/css/presentation/components/skin/chart-c.css');

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
    renderer: 'gauge',
    scope: 'ds-chart-gauge',
    start: [6, 7],
    floor: [1, 0],
    topology: '3283fb658d14feda807f8dba648f37a6e72717aad1ef00b195828ce426bb4ea4',
    parts: ['legend', 'legend-swatch', 'plot-area', 'track', 'segment', 'needle', 'needle-mark', 'needle-cap', 'value-label'],
  },
  sankey: {
    directory: 'sankey',
    scope: 'ds-chart-sankey',
    start: [5, 6],
    floor: [3, 2],
    topology: 'afc73715c1e9364de62506f0ba85bd752e768d6cc66e3bf9f8da8aae5e57920c',
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
    renderer: 'funnel',
    scope: 'ds-chart-funnel',
    start: [3, 6],
    floor: [1, 0],
    topology: 'db25b8c3386dfe28b2601c54741db33a7a07ec398ff4d89a27395399f53a78b9',
    parts: ['legend', 'legend-swatch', 'plot-area', 'segment', 'segment-label', 'segment-value', 'conversion-label'],
  },
  network: {
    directory: 'network-graph',
    scope: 'ds-chart-network-graph',
    start: [3, 5],
    floor: [1, 1],
    topology: '7aeeccd8b58da9fb9e71ce617cba45a4c97b2777fa5b996751094eee3003c898',
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

function rendererSource(chart) {
  return readFileSync(join(renderersRoot, chart.renderer, 'index.tsx'), 'utf8');
}

// A chart whose plot renders in a React-owned renderer keeps its scope wrapper
// and legend on the family adapter while the plot anatomy the skin styles lives
// on the renderer. Live anatomy for such a chart is the union of both files.
function authoredPartsForChart(chart) {
  const parts = authoredParts(source(chart));
  if (chart.renderer) {
    for (const part of authoredParts(rendererSource(chart))) parts.add(part);
  }
  return parts;
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

test('CK-E chart slice C lands its exact 9 inline + 14 runtime Stage-1 target', () => {
  let inlineTotal = 0;
  let runtimeTotal = 0;
  for (const [name, chart] of Object.entries(CHARTS)) {
    const path = sourcePath(chart);
    const text = source(chart);
    const inline = countArc09PaintInFile(text, path);
    const runtime = analyzeRuntimeSvgPaint(text, path);
    assert.equal(inline, chart.floor[0], `${name} inline paint drifted from the Stage-1 target`);
    assert.equal(runtime.count, chart.floor[1], `${name} runtime SVG paint drifted from the Stage-1 target`);
    assert.equal(runtime.unclassified, 0, `${name} introduced unclassified runtime SVG paint`);
    inlineTotal += inline;
    runtimeTotal += runtime.count;
  }
  assert.deepEqual([inlineTotal, runtimeTotal], [9, 14]);
});

test('CK-E chart slice C exposes every planned scope, part and finite state', () => {
  for (const [name, chart] of Object.entries(CHARTS)) {
    const text = source(chart);
    const parts = authoredPartsForChart(chart);
    assert.match(text, new RegExp(`className=\\{\\['${chart.scope}', className\\]`), `${name} lacks its scope`);
    for (const part of chart.parts) assert.ok(parts.has(part), `${name} lacks data-part="${part}"`);
  }

  assert.match(source(CHARTS.histogram), /data-variant=\{density \? 'density' : 'frequency'\}/);
  assert.match(source(CHARTS.histogram), /\.tick line:not\(\[data-part\]\)/);
  assert.match(source(CHARTS.scatter), /\.attr\('data-state',\s*'hovered'\)/);
  assert.match(source(CHARTS.scatter), /\.tick line:not\(\[data-part\]\)/);
  assert.match(source(CHARTS.gauge), /data-state=\{segment === activeSegment \? 'active' : 'inactive'\}/);
  assert.match(source(CHARTS.sankey), /\.attr\('data-state',\s*'hovered'\)/);
  assert.match(source(CHARTS.sparkline), /data-state="ready"/);
  assert.match(rendererSource(CHARTS.funnel), /data-position=\{segment\.position\}/);
  assert.match(source(CHARTS.network), /data-variant=\{directed \? 'directed' : 'undirected'\}/);
});

test('CK-E chart slice C preserves its pre-step React and D3 element anatomy', () => {
  for (const [name, chart] of Object.entries(CHARTS)) {
    const path = sourcePath(chart);
    const digest = createHash('sha256').update(renderAnatomy(source(chart), path)).digest('hex');
    assert.equal(digest, chart.topology, `${name} React/D3 element anatomy drifted`);
  }
});

test('CK-E chart slice C skin owns every static paint scope without importance escalation', () => {
  const css = readFileSync(skinPath, 'utf8');
  assert.doesNotThrow(() => postcss.parse(css, { from: skinPath }));
  assert.doesNotMatch(css, /!important/);

  for (const [name, chart] of Object.entries(CHARTS)) {
    assert.match(css, new RegExp(`\\.${chart.scope}(?:\\s|\\[)`), `${name} is absent from chart-c.css`);
  }

  const requiredRules = [
    [".ds-chart-histogram [data-part='axis-domain']", 'stroke: var(--ds-color-border-primary)'],
    [".ds-chart-scatter [data-part='trend-line']", 'stroke: var(--ds-color-text-secondary)'],
    [".ds-chart-gauge [data-part='track']", 'fill: var(--ds-color-bg-tertiary)'],
    [":where(.ds-chart-sankey [data-part='node'][data-state='hovered'] [data-part='node-mark'])", 'stroke: var(--ds-color-text-primary)'],
    [".ds-chart-sparkline [data-part='min-dot']", 'fill: var(--ds-color-error)'],
    [".ds-chart-funnel [data-part='segment-value']", 'fill: color-mix(in srgb, var(--ds-color-text-on-primary) 80%, transparent)'],
    [".ds-chart-network-graph [data-part='edge-marker-path']", 'fill: var(--ds-color-border-primary)'],
  ];
  for (const [selector, declaration] of requiredRules) {
    assert.ok(css.includes(selector), `missing selector ${selector}`);
    assert.ok(css.includes(declaration), `missing declaration ${declaration}`);
  }
});

test('CK-E chart slice C preserves the three adversarial cascade/runtime contracts', () => {
  const css = readFileSync(skinPath, 'utf8');
  for (const scope of ['histogram', 'scatter']) {
    const gridSelector = `.ds-chart-${scope} [data-part='grid-line']`;
    const firstGridRule = css.indexOf(gridSelector);
    const finalGridRule = css.lastIndexOf(gridSelector);
    assert.ok(firstGridRule >= 0 && finalGridRule > firstGridRule, `${scope} grid must preserve its final axis repaint`);
    assert.match(
      css.slice(finalGridRule, css.indexOf('}', finalGridRule) + 1),
      /stroke:\s*var\(--ds-color-border-primary\)/,
      `${scope} grid final paint must remain border-primary`
    );
  }

  const histogram = source(CHARTS.histogram);
  assert.match(histogram, /rightAxis\.select\('\.domain'\)\.attr\('stroke', cumulativeColor\)/);
  assert.doesNotMatch(histogram, /rightAxis\.select\('\.domain'\)\.style\('stroke', cumulativeColor\)/);

  const gauge = source(CHARTS.gauge);
  const gaugeRenderer = rendererSource(CHARTS.gauge);
  const publicSegmentContract = gauge.slice(
    gauge.indexOf('export interface GaugeSegment'),
    gauge.indexOf('/** Props for the backward-compatible {@link GaugeChart} family adapter. */'),
  );
  assert.match(publicSegmentContract, /color: string;/);
  assert.doesNotMatch(publicSegmentContract, /color\?: string;/);
  assert.match(gauge, /segments: providedSegments,/);
  assert.match(gauge, /const usesDefaultSegments = providedSegments === undefined;/);
  assert.match(gauge, /providedSegments \?\? defaultSegments\(rangeMin, rangeMax\)/);
  assert.match(gauge, /data-color-source=\{usesDefaultSegments \? 'default' : 'custom'\}/);
  // The segment mark's color-source and its custom-only fill live on the
  // React renderer that owns the plot; default segments carry no inline fill.
  assert.match(gaugeRenderer, /data-color-source=\{segment\.colorSource\}/);
  assert.match(gaugeRenderer, /fill=\{segment\.colorSource === 'custom' \? segment\.color : undefined\}/);
  assert.match(gauge, /backgroundColor: usesDefaultSegments\s*\?\s*DEFAULT_SEGMENT_COLORS\[segment\.toneIndex\]\s*:\s*segment\.color/);
  assert.doesNotMatch(gauge, /segment\.color\s*\?(?!\?)/);
  const defaultSegmentBlock = gauge.slice(
    gauge.indexOf('function defaultSegments('),
    gauge.indexOf('function normalizedSegments(')
  );
  assert.equal(
    defaultSegmentBlock.match(/label: '(?:Low|Medium|High)'/g)?.length,
    3
  );
  assert.doesNotMatch(defaultSegmentBlock, /color:/);
  const defaultColorBlock = gauge.slice(
    gauge.indexOf('const DEFAULT_SEGMENT_COLORS'),
    gauge.indexOf('function segmentTone')
  );
  assert.equal(defaultColorBlock.match(/'var\(--ds-color-(?:error|warning|success)\)'/g)?.length, 3);

  for (const tone of ['error', 'warning', 'success']) {
    assert.match(
      css,
      new RegExp(`:where\\(\\.ds-chart-gauge \\[data-part='segment'\\]\\[data-color-source='default'\\]\\[data-tone='${tone}'\\]\\)`)
    );
  }
  assert.doesNotMatch(css, /data-part='legend-swatch'\]\[data-color-source='default'/);
  assert.match(
    css,
    /:where\(\.ds-chart-sankey \[data-part='node'\]\[data-state='hovered'\] \[data-part='node-mark'\]\)/
  );

  const sankey = source(CHARTS.sankey);
  assert.match(sankey, /select\(this\)\.attr\('data-state', 'hovered'\);/);
  assert.match(sankey, /select\(this\)\.attr\('data-state', 'idle'\);/);
  assert.doesNotMatch(sankey, /select\('rect'\)\.attr\('stroke'/);
});

test('CK-E chart slice C reconciles the exact Stage-1 boundary 82 -> 23', () => {
  const start = Object.values(CHARTS).reduce((sum, chart) => sum + chart.start[0] + chart.start[1], 0);
  const floor = Object.values(CHARTS).reduce((sum, chart) => sum + chart.floor[0] + chart.floor[1], 0);
  assert.equal(start, 82);
  assert.equal(floor, 23);
  assert.equal(start - floor, 59);
});
