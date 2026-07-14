import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import ts from 'typescript';

import { countArc09PaintInFile } from './lib/inline-paint-counter.mjs';
import { analyzeRuntimeSvgPaint } from './lib/runtime-svg-paint-counter.mjs';

const packageRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const chartsRoot = join(packageRoot, 'src/components/patterns/visualization/charts');
const exemptionsPath = resolve(packageRoot, '../..', 'roadmap/skin-exemptions.json');

const FILES = {
  scaffold: { path: 'chart-scaffold.tsx', start: [4, 0], floor: [0, 0], topology: '7128c939d91ecdb86bf4861f6e98c64f12ad69f5b313ddecc1b2280425814ae0' },
  brush: { path: 'hooks/use-chart-brush.ts', start: [12, 0], floor: [0, 0], topology: 'ff3639d218c5fb49579fc315d595ce11fb8e7a3acb0018eda6f2cef6c980f12a' },
  exportHook: { path: 'hooks/use-chart-export.ts', start: [1, 0], floor: [0, 0], topology: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855' },
  theme: { path: 'hooks/use-chart-theme.ts', start: [4, 0], floor: [4, 0], topology: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855' },
  tooltip: { path: 'tooltip/index.tsx', start: [11, 0], floor: [2, 0], topology: '89be9e4d95bd9c886ebf76bf2439ddd86c1fc368aa8d63a1dc72a7daaff6f6e0' },
  crosshair: { path: 'tooltip/crosshair.ts', start: [0, 4], floor: [0, 1], topology: '13e42bf71b21e37452b3e4d30b6238efc2cc86410b1c47b40b0a642739e4a7be' },
  exporter: { path: 'utils/export.ts', start: [2, 4], floor: [2, 4], topology: '9f02066a213d04963aa441dcf4805feceb85887f55e8a88f572a03bed73b5f8a' },
};

function pathFor(entry) {
  return join(chartsRoot, entry.path);
}

function source(entry) {
  return readFileSync(pathFor(entry), 'utf8');
}

function renderAnatomy(text, path) {
  const sourceFile = ts.createSourceFile(
    path,
    text,
    ts.ScriptTarget.Latest,
    true,
    path.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS
  );
  const anatomy = [];

  function visit(node) {
    if (ts.isJsxElement(node)) {
      anatomy.push(`jsx:${node.openingElement.tagName.getText(sourceFile)}`);
    } else if (ts.isJsxSelfClosingElement(node)) {
      anatomy.push(`jsx:${node.tagName.getText(sourceFile)}`);
    } else if (ts.isCallExpression(node)) {
      let method = null;
      if (ts.isIdentifier(node.expression)) method = node.expression.text;
      if (ts.isPropertyAccessExpression(node.expression)) method = node.expression.name.text;
      const first = node.arguments[0];
      if (method === 'append' && first && ts.isStringLiteralLike(first)) anatomy.push(`d3:${first.text}`);
      if (method === 'createElement' && first && ts.isStringLiteralLike(first)) anatomy.push(`react:${first.text}`);
      if (
        (method === 'createElement' || method === 'createElementNS') &&
        ts.isPropertyAccessExpression(node.expression) &&
        node.expression.expression.getText(sourceFile) === 'document'
      ) {
        const tag = node.arguments.at(-1);
        if (tag && ts.isStringLiteralLike(tag)) anatomy.push(`dom:${tag.text}`);
      }
    }
    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return anatomy.join('\n');
}

test('CK-E foundation retains its exact 34 inline + 8 runtime pre-step sites', () => {
  let inlineTotal = 0;
  let runtimeTotal = 0;
  for (const [name, entry] of Object.entries(FILES)) {
    const path = pathFor(entry);
    const text = source(entry);
    const inline = countArc09PaintInFile(text, path);
    const runtime = analyzeRuntimeSvgPaint(text, path);
    assert.equal(inline, entry.start[0], `${name} inline paint drifted during the inert pre-step`);
    assert.equal(runtime.count, entry.start[1], `${name} runtime SVG paint drifted during the inert pre-step`);
    assert.equal(runtime.unclassified, 0, `${name} introduced unclassified runtime SVG paint`);
    inlineTotal += inline;
    runtimeTotal += runtime.count;
  }
  assert.deepEqual([inlineTotal, runtimeTotal], [34, 8]);
});

test('CK-E foundation exposes scaffold, brush, tooltip and crosshair anatomy', () => {
  const scaffold = source(FILES.scaffold);
  assert.match(scaffold, /\['ds-chart-scaffold', className\]/);
  for (const part of ['chart-scaffold', 'loading', 'heading', 'title', 'subtitle', 'accessible-summary', 'plot']) {
    assert.match(scaffold, new RegExp(`data-part="${part}"`), `scaffold lacks ${part}`);
  }
  assert.match(scaffold, /data-state="loading"/);
  assert.match(scaffold, /data-state="ready"/);

  const brush = source(FILES.brush);
  for (const part of ['chart-brush', 'brush-background', 'brush-separator', 'brush-dim', 'brush-selection', 'brush-selection-border', 'brush-handle', 'brush-interaction']) {
    assert.match(brush, new RegExp(`'data-part': '${part}'`), `brush lacks ${part}`);
  }
  assert.match(brush, /'data-state': isBrushing \? 'brushing' : pixelSelection \? 'selected' : 'idle'/);

  const tooltip = source(FILES.tooltip);
  assert.match(tooltip, /className="ds-chart-tooltip"/);
  for (const part of ['chart-tooltip', 'tooltip-value', 'tooltip-series', 'series-row', 'swatch', 'label', 'value']) {
    assert.match(tooltip, new RegExp(`data-part="${part}"`), `tooltip lacks ${part}`);
  }
  assert.match(tooltip, /data-state=\{visible \? 'visible' : 'hidden'\}/);

  const crosshair = source(FILES.crosshair);
  for (const part of ['crosshair', 'crosshair-line', 'crosshair-dot']) {
    assert.match(crosshair, new RegExp(`\\.attr\\('data-part', '${part}'\\)`), `crosshair lacks ${part}`);
  }
  assert.match(crosshair, /\.attr\('data-state', 'visible'\)/);
  assert.match(crosshair, /\.attr\('data-state', 'hidden'\)/);
});

test('CK-E exporter classification is explicit, counted and exact', () => {
  const exporter = source(FILES.exporter);
  assert.equal(exporter.split('@runtime-svg-paint-copy').length - 1, 2);
  const runtime = analyzeRuntimeSvgPaint(exporter, pathFor(FILES.exporter));
  assert.equal(runtime.count, 4);
  assert.equal(runtime.classifiedPaint, 4);
  assert.equal(runtime.domSetAttributes, 4);
  assert.equal(runtime.unclassified, 0);
});

test('CK-E foundation floors pin theme data, tooltip swatches, crosshair data and export fidelity', () => {
  const exemptions = JSON.parse(readFileSync(exemptionsPath, 'utf8'));
  const runtime = exemptions['SKIN-EXEMPT-RUNTIME-VALUE'].files;
  const notPaint = exemptions['SKIN-EXEMPT-NOT-PAINT'].files;
  assert.equal(notPaint['patterns/visualization/charts/hooks/use-chart-theme.ts'].floor, 4);
  assert.equal(runtime['patterns/visualization/charts/tooltip/index.tsx'].floor, 2);
  assert.equal(runtime['patterns/visualization/charts/tooltip/crosshair.ts'].runtimeSvgFloor, 1);
  assert.deepEqual(
    {
      inline: runtime['patterns/visualization/charts/utils/export.ts'].floor,
      runtime: runtime['patterns/visualization/charts/utils/export.ts'].runtimeSvgFloor,
    },
    { inline: 2, runtime: 4 }
  );

  const theme = source(FILES.theme);
  assert.equal(theme.match(/background: FALLBACK_HEX\.surfaceBg/g)?.length, 1);
  assert.equal(theme.match(/background: `var\(\$\{CSS_VARS\.surfaceBg\}\)`/g)?.length, 2);
  assert.equal(theme.match(/background: resolveName\(CSS_VARS\.surfaceBg, FALLBACK_HEX\.surfaceBg\)/g)?.length, 1);
  assert.equal(source(FILES.exportHook).match(/backgroundColor: '#ffffff'/g)?.length, 1);
  const start = Object.values(FILES).reduce((sum, entry) => sum + entry.start[0] + entry.start[1], 0);
  const floor = Object.values(FILES).reduce((sum, entry) => sum + entry.floor[0] + entry.floor[1], 0);
  assert.equal(start, 42);
  assert.equal(floor, 13);
  assert.equal(start - floor, 29);
});

test('CK-E foundation preserves its pre-step React, D3 and DOM element anatomy', () => {
  for (const [name, entry] of Object.entries(FILES)) {
    const path = pathFor(entry);
    const digest = createHash('sha256').update(renderAnatomy(source(entry), path)).digest('hex');
    assert.equal(digest, entry.topology, `${name} element anatomy drifted`);
  }
});

test('CK-E globally reconciles 478 measured sites to the exact 111-site Stage-1 boundary', () => {
  const start = {
    inline: 195 + 45 + 25 + 34,
    runtime: 0 + 114 + 57 + 8,
  };
  const floor = {
    inline: 6 + 27 + 9 + 8,
    runtime: 0 + 36 + 20 + 5,
  };
  assert.deepEqual(start, { inline: 299, runtime: 179 });
  assert.deepEqual(floor, { inline: 50, runtime: 61 });
  assert.equal(start.inline + start.runtime, 478);
  assert.equal(floor.inline + floor.runtime, 111);
  assert.equal(start.inline + start.runtime - floor.inline - floor.runtime, 367);
});
