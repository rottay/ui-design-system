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
const chartsRoot = join(packageRoot, 'src/ui/patterns/visualization/charts/families');
const renderersRoot = join(packageRoot, 'src/ui/patterns/visualization/charts/runtime/chart-engine/presentation/react/renderers');
const skinsRoot = join(packageRoot, 'src/foundation/tokens/css/presentation/components/skin');

const CHARTS = {
  area: {
    directory: 'area-chart',
    skin: 'chart-area.css',
    scope: 'ds-chart-area',
    start: [4, 16],
    floor: [2, 8],
    topology: 'b76e34d168107004b4cdb768a1e1e545e75e16a2529503a95d65c924470881d2',
    parts: ['legend-swatch', 'legend-label', 'plot-area', 'grid-line', 'axis-tick-label', 'area', 'series-line', 'interaction-overlay', 'axis-label', 'axis-domain', 'axis-tick'],
  },
  bar: {
    directory: 'bar-chart',
    skin: 'chart-bar.css',
    scope: 'ds-chart-bar',
    start: [6, 29],
    floor: [2, 6],
    topology: '096edd869bbbc7a7b40c1a57dfbf04e5d72d538f1e41d0b6cb61db287691685b',
    parts: ['legend-swatch', 'legend-label', 'plot-area', 'grid-line', 'axis-tick-label', 'bar', 'value-label', 'axis-label', 'axis-domain', 'axis-tick'],
  },
  radar: {
    directory: 'radar-chart',
    renderer: 'radar',
    skin: 'chart-radar.css',
    scope: 'ds-chart-radar',
    start: [5, 7],
    floor: [2, 0],
    topology: '6345023782424eaf4f5f30b912e9be9cb30b1d8a7657748384a75470e589b648',
    parts: ['legend-swatch', 'legend-label', 'plot-area', 'grid-level', 'axis-line', 'axis-label', 'series-area', 'series-point'],
  },
  treemap: {
    directory: 'treemap',
    skin: 'chart-treemap.css',
    scope: 'ds-chart-treemap',
    start: [3, 4],
    floor: [1, 1],
    topology: '32b60f40cb629a5b6c37ee4ba010acc7494a5c547ed2d3d9403ebf46c5a0fa4d',
    parts: ['legend-swatch', 'legend-label', 'tile', 'tile-surface', 'tile-label', 'tile-value'],
  },
  pie: {
    directory: 'pie-chart',
    skin: 'chart-pie.css',
    scope: 'ds-chart-pie',
    start: [3, 3],
    floor: [1, 1],
    topology: 'a6a946d433b82ac038dc72687cc640dccd21b34aca90099a8fa9d5cf284b9961',
    parts: ['legend-swatch', 'legend-label', 'plot-area', 'slice', 'slice-surface', 'slice-label'],
  },
  bullet: {
    directory: 'bullet',
    skin: 'chart-bullet.css',
    scope: 'ds-chart-bullet',
    start: [14, 10],
    floor: [12, 8],
    topology: '2af51df936edc7e5cc0a2bc371c627694ebd1eea4f574793a3c4b55836bff4c3',
    parts: ['legend-swatch', 'legend-label', 'item', 'range-band', 'value-bar', 'target-marker', 'item-label', 'value-label'],
  },
  waterfall: {
    directory: 'waterfall',
    skin: 'chart-waterfall.css',
    scope: 'ds-chart-waterfall',
    start: [6, 14],
    floor: [4, 2],
    topology: '019b9a3bf5bff6db509a14523f3a1a3d1c3019d50ed02aac2657b73bef21cf1b',
    parts: ['legend-swatch', 'legend-label', 'plot-area', 'axis-tick-label', 'grid-line', 'connector', 'bar', 'value-label', 'axis-domain', 'axis-tick'],
  },
  line: {
    directory: 'line-chart',
    skin: 'chart-line.css',
    scope: 'ds-chart-line',
    start: [4, 14],
    floor: [2, 5],
    topology: '4bf096e267d4673d2824d23170b00c73bdb7dc18cc4cc0874f03336c6d9b6418',
    parts: ['legend-swatch', 'legend-label', 'plot-area', 'grid-line', 'axis-tick-label', 'gradient-stop', 'area', 'series-line', 'series-point', 'interaction-overlay', 'axis-label', 'axis-domain', 'axis-tick'],
  },
  gantt: {
    directory: 'gantt-chart',
    skin: 'chart-gantt.css',
    scope: 'ds-chart-gantt',
    start: [0, 9],
    floor: [0, 2],
    topology: '5a40e40ee1dd4ec99c5642ba3c8865dfa10c7415503e845315c4f0fe9029c1f0',
    parts: ['plot-area', 'axis-tick-label', 'grid-line', 'axis-domain', 'task', 'task-duration', 'task-progress', 'today-marker', 'today-label', 'axis-tick'],
  },
  heatmap: {
    directory: 'heatmap',
    skin: 'chart-heatmap.css',
    scope: 'ds-chart-heatmap',
    start: [0, 5],
    floor: [0, 1],
    topology: 'ee285e28c6026014dfb38ae7686714561a7379d68b6413dfe3b0ca963d0490d4',
    parts: ['plot-area', 'axis-tick-label', 'cell', 'axis-domain', 'axis-tick'],
  },
  calendarHeatmap: {
    directory: 'calendar-heatmap',
    skin: 'chart-calendar-heatmap.css',
    scope: 'ds-chart-calendar-heatmap',
    start: [0, 3],
    floor: [0, 1],
    topology: 'e972aca2054d63711b27ae9f472e7526a02276edb3dcc202d03c9ecbc93f8f4b',
    parts: ['plot-area', 'day-labels', 'day-label', 'month-labels', 'month-label', 'cell'],
  },
};

function sourcePath(chart) {
  return join(chartsRoot, chart.directory, 'index.tsx');
}

function source(chart) {
  return readFileSync(sourcePath(chart), 'utf8');
}

function skin(chart) {
  return readFileSync(join(skinsRoot, chart.skin), 'utf8');
}

function authoredParts(text) {
  return new Set([
    ...text.matchAll(/data-part="([^"]+)"/g),
    ...text.matchAll(/\.attr\('data-part',\s*'([^']+)'\)/g),
  ].map((match) => match[1]));
}

// A chart whose plot renders in a React-owned renderer keeps its scope wrapper
// and legend on the family adapter while the plot anatomy the skin styles lives
// on the renderer. Live anatomy for such a chart is the union of both files.
function authoredPartsForChart(chart) {
  const parts = authoredParts(source(chart));
  if (chart.renderer) {
    const rendererText = readFileSync(join(renderersRoot, chart.renderer, 'index.tsx'), 'utf8');
    for (const part of authoredParts(rendererText)) parts.add(part);
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

test('CK-E chart slices A+B reach their exact 26 + 35 Stage-1 floors', () => {
  const totals = { inline: 0, runtime: 0 };

  for (const [name, chart] of Object.entries(CHARTS)) {
    const path = sourcePath(chart);
    const text = source(chart);
    const inline = countArc09PaintInFile(text, path);
    const runtime = analyzeRuntimeSvgPaint(text, path);

    assert.equal(inline, chart.floor[0], `${name} inline paint missed its Stage-1 floor`);
    assert.equal(runtime.count, chart.floor[1], `${name} runtime SVG paint missed its Stage-1 floor`);
    assert.equal(runtime.unclassified, 0, `${name} introduced unclassified runtime SVG paint`);
    totals.inline += inline;
    totals.runtime += runtime.count;
  }

  assert.deepEqual(totals, { inline: 26, runtime: 35 });
});

test('CK-E chart slices A+B expose every planned scope and anatomy hook', () => {
  for (const [name, chart] of Object.entries(CHARTS)) {
    const text = source(chart);
    const parts = authoredPartsForChart(chart);

    assert.match(text, new RegExp(`className=\\{\\['${chart.scope}', className\\]`), `${name} lacks its unique chart scope`);
    for (const part of chart.parts) {
      assert.ok(parts.has(part), `${name} lacks data-part="${part}"`);
    }
  }

  assert.match(source(CHARTS.bar), /\.attr\('data-layout',\s*'(?:stacked|grouped|single)'\)/);
  assert.match(source(CHARTS.bar), /\.attr\('data-orientation',\s*'(?:vertical|horizontal)'\)/);
  assert.match(source(CHARTS.bullet), /data-variant=\{item\.label === 'Target'/);
  assert.match(source(CHARTS.pie), /\.attr\('data-variant',\s*donut \? 'donut' : 'pie'\)/);
  assert.match(source(CHARTS.waterfall), /\.attr\('data-status',\s*\(d\) => d\.type\)/);
  assert.match(source(CHARTS.line), /\.attr\('data-x-type',\s*xType\)/);
  assert.match(source(CHARTS.calendarHeatmap), /\.attr\('data-state',\s*\(d\) => \{/);
});

test('CK-E chart slices A+B skins are scope-anchored and reference live anatomy', () => {
  for (const [name, chart] of Object.entries(CHARTS)) {
    const css = skin(chart);
    const cssWithoutComments = css.replace(/\/\*[\s\S]*?\*\//g, '');
    const parts = authoredPartsForChart(chart);

    assert.doesNotMatch(css, /!important/, `${name} skin must not use !important`);
    for (const match of cssWithoutComments.matchAll(/([^{}]+)\{/g)) {
      for (const selector of match[1].split(',')) {
        assert.match(
          selector.trim(),
          new RegExp(`^\\.${chart.scope}(?:\\s|\\[|\\.|:|$)`),
          `${name} has an unscoped skin selector: ${selector.trim()}`,
        );
      }
    }
    for (const match of css.matchAll(/\[data-part='([^']+)'\]/g)) {
      assert.ok(parts.has(match[1]), `${name} skin references dead data-part="${match[1]}"`);
    }
  }

  for (const name of ['area', 'bar', 'waterfall', 'line', 'gantt']) {
    const css = skin(CHARTS[name]);
    const secondary = css.indexOf('stroke: var(--ds-color-border-secondary)');
    const finalPrimary = css.lastIndexOf('stroke: var(--ds-color-border-primary)');
    assert.ok(secondary >= 0 && finalPrimary > secondary, `${name} lost the final tick/grid overwrite`);
    assert.equal(css.match(/\[data-part='grid-line'\]/g)?.length, 2, `${name} must preserve both grid writes`);
  }

  for (const name of ['area', 'line']) {
    assert.match(
      skin(CHARTS[name]),
      /\[data-part='interaction-overlay'\]\s*\{\s*fill:\s*transparent;/,
      `${name} overlay must remain pointer-painted`,
    );
  }
});

test('CK-E chart slices A+B preserve the pre-step React and D3 element anatomy', () => {
  for (const [name, chart] of Object.entries(CHARTS)) {
    const path = sourcePath(chart);
    const digest = createHash('sha256').update(renderAnatomy(source(chart), path)).digest('hex');
    assert.equal(digest, chart.topology, `${name} React/D3 element anatomy drifted`);
  }
});

test('CK-E chart slices A+B reconcile the planned Stage-1 boundaries exactly', () => {
  const starts = Object.values(CHARTS).reduce((total, chart) => total + chart.start[0] + chart.start[1], 0);
  const floors = Object.values(CHARTS).reduce((total, chart) => total + chart.floor[0] + chart.floor[1], 0);

  assert.equal(starts, 159);
  assert.equal(floors, 61);
  assert.equal(starts - floors, 98);

  const chartA = ['area', 'bar', 'radar', 'treemap', 'pie'];
  const chartB = ['bullet', 'waterfall', 'line', 'gantt', 'heatmap', 'calendarHeatmap'];
  const migrate = (names) => names.reduce((total, name) => {
    const chart = CHARTS[name];
    return total + chart.start[0] + chart.start[1] - chart.floor[0] - chart.floor[1];
  }, 0);

  assert.equal(migrate(chartA), 56);
  assert.equal(migrate(chartB), 42);
});
