import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import postcss from 'postcss';

import { countArc09PaintInFile } from './lib/inline-paint-counter.mjs';
import { analyzeRuntimeSvgPaint } from './lib/runtime-svg-paint-counter.mjs';

const packageRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const sourceRoot = join(packageRoot, 'src/ui');
const cssRoot = join(packageRoot, 'src/foundation/tokens/css');

const sources = [
  // Non-chart visualization patterns.
  { slice: 'noncharts', path: 'patterns/visualization/calendar-view/engines/modern/index.tsx', inline: 1, runtimeSvg: 0 },
  { slice: 'noncharts', path: 'patterns/visualization/calendar-view/engines/rustic/index.tsx', inline: 1, runtimeSvg: 0 },
  { slice: 'noncharts', path: 'patterns/visualization/kanban-board/engines/modern/index.tsx', inline: 1, runtimeSvg: 0 },
  { slice: 'noncharts', path: 'patterns/visualization/kanban-board/engines/rustic/index.tsx', inline: 1, runtimeSvg: 0 },
  { slice: 'noncharts', path: 'patterns/visualization/map-view/engines/modern/index.tsx', inline: 1, runtimeSvg: 0 },
  { slice: 'noncharts', path: 'patterns/visualization/map-view/engines/rustic/index.tsx', inline: 1, runtimeSvg: 0 },
  { slice: 'noncharts', path: 'patterns/visualization/timeline/engines/modern/index.tsx', inline: 0, runtimeSvg: 0 },
  { slice: 'noncharts', path: 'patterns/visualization/timeline/engines/rustic/index.tsx', inline: 0, runtimeSvg: 0 },
  { slice: 'noncharts', path: 'patterns/visualization/tree-view/engines/modern/index.tsx', inline: 0, runtimeSvg: 0 },
  { slice: 'noncharts', path: 'patterns/visualization/tree-view/engines/rustic/index.tsx', inline: 0, runtimeSvg: 0 },

  // Charts A+B.
  { slice: 'chartsAB', path: 'patterns/visualization/charts/families/area-chart/index.tsx', inline: 2, runtimeSvg: 8 },
  { slice: 'chartsAB', path: 'patterns/visualization/charts/families/bar-chart/index.tsx', inline: 2, runtimeSvg: 6 },
  { slice: 'chartsAB', path: 'patterns/visualization/charts/families/radar-chart/index.tsx', inline: 2, runtimeSvg: 4 },
  { slice: 'chartsAB', path: 'patterns/visualization/charts/families/treemap/index.tsx', inline: 1, runtimeSvg: 1 },
  { slice: 'chartsAB', path: 'patterns/visualization/charts/families/pie-chart/index.tsx', inline: 1, runtimeSvg: 1 },
  { slice: 'chartsAB', path: 'patterns/visualization/charts/families/bullet/index.tsx', inline: 12, runtimeSvg: 8 },
  { slice: 'chartsAB', path: 'patterns/visualization/charts/families/waterfall/index.tsx', inline: 4, runtimeSvg: 2 },
  { slice: 'chartsAB', path: 'patterns/visualization/charts/families/line-chart/index.tsx', inline: 2, runtimeSvg: 5 },
  { slice: 'chartsAB', path: 'patterns/visualization/charts/families/gantt-chart/index.tsx', inline: 0, runtimeSvg: 2 },
  { slice: 'chartsAB', path: 'patterns/visualization/charts/families/heatmap/index.tsx', inline: 0, runtimeSvg: 1 },
  { slice: 'chartsAB', path: 'patterns/visualization/charts/families/calendar-heatmap/index.tsx', inline: 0, runtimeSvg: 1 },

  // Charts C.
  { slice: 'chartC', path: 'patterns/visualization/charts/families/histogram/index.tsx', inline: 2, runtimeSvg: 5 },
  { slice: 'chartC', path: 'patterns/visualization/charts/families/scatter/index.tsx', inline: 1, runtimeSvg: 2 },
  { slice: 'chartC', path: 'patterns/visualization/charts/families/gauge/index.tsx', inline: 1, runtimeSvg: 4 },
  { slice: 'chartC', path: 'patterns/visualization/charts/families/sankey/index.tsx', inline: 3, runtimeSvg: 2 },
  { slice: 'chartC', path: 'patterns/visualization/charts/families/sparkline/index.tsx', inline: 0, runtimeSvg: 4 },
  { slice: 'chartC', path: 'patterns/visualization/charts/families/funnel-chart/index.tsx', inline: 1, runtimeSvg: 2 },
  { slice: 'chartC', path: 'patterns/visualization/charts/families/network-graph/index.tsx', inline: 1, runtimeSvg: 1 },

  // Shared chart foundation.
  { slice: 'foundation', path: 'patterns/visualization/charts/presentation/scaffold/index.tsx', inline: 0, runtimeSvg: 0 },
  { slice: 'foundation', path: 'patterns/visualization/charts/runtime/interaction/brush/index.ts', inline: 0, runtimeSvg: 0 },
  { slice: 'foundation', path: 'patterns/visualization/charts/runtime/exporting/composition/react/index.ts', inline: 0, runtimeSvg: 0 },
  { slice: 'foundation', path: 'patterns/visualization/charts/runtime/theming/presentation/react/color-theme/index.ts', inline: 4, runtimeSvg: 0 },
  { slice: 'foundation', path: 'patterns/visualization/charts/presentation/tooltip/index.tsx', inline: 2, runtimeSvg: 0 },
  { slice: 'foundation', path: 'patterns/visualization/charts/presentation/crosshair/index.ts', inline: 0, runtimeSvg: 1 },
  { slice: 'foundation', path: 'patterns/visualization/charts/runtime/exporting/foundation/file/index.ts', inline: 2, runtimeSvg: 5 },
];

const sliceTargets = {
  noncharts: { files: 10, inline: 6, runtimeSvg: 0, combined: 6 },
  chartsAB: { files: 11, inline: 26, runtimeSvg: 39, combined: 65 },
  chartC: { files: 7, inline: 9, runtimeSvg: 20, combined: 29 },
  foundation: { files: 7, inline: 8, runtimeSvg: 6, combined: 14 },
};

const skins = [
  {
    path: 'presentation/components/skin/chart-foundation.css',
    anchors: [
      '.ds-chart-scaffold',
      '.ds-chart-frame',
      '.ds-chart-data-access',
      '.ds-chart-renderer',
      '.ds-chart-brush',
      '.ds-chart-tooltip',
      '.ds-chart-tooltip-value',
      '.ds-chart-tooltip-series',
    ],
  },
  { path: 'presentation/components/skin/chart-area.css', anchors: ['.ds-chart-area'] },
  { path: 'presentation/components/skin/chart-bar.css', anchors: ['.ds-chart-bar'] },
  { path: 'presentation/components/skin/chart-bullet.css', anchors: ['.ds-chart-bullet'] },
  { path: 'presentation/components/skin/chart-calendar-heatmap.css', anchors: ['.ds-chart-calendar-heatmap'] },
  { path: 'presentation/components/skin/chart-gantt.css', anchors: ['.ds-chart-gantt'] },
  { path: 'presentation/components/skin/chart-heatmap.css', anchors: ['.ds-chart-heatmap'] },
  { path: 'presentation/components/skin/chart-line.css', anchors: ['.ds-chart-line'] },
  { path: 'presentation/components/skin/chart-pie.css', anchors: ['.ds-chart-pie'] },
  { path: 'presentation/components/skin/chart-radar.css', anchors: ['.ds-chart-radar'] },
  { path: 'presentation/components/skin/chart-treemap.css', anchors: ['.ds-chart-treemap'] },
  { path: 'presentation/components/skin/chart-waterfall.css', anchors: ['.ds-chart-waterfall'] },
  {
    path: 'presentation/components/skin/chart-c.css',
    anchors: [
      '.ds-chart-histogram',
      '.ds-chart-scatter',
      '.ds-chart-gauge',
      '.ds-chart-sankey',
      '.ds-chart-sparkline',
      '.ds-chart-funnel',
      '.ds-chart-network-graph',
    ],
  },
  { path: 'runtime/engines/modern/skin/pattern-calendar-view.css', anchors: ['.ds-pattern-calendar-view.ds-engine-modern'] },
  { path: 'runtime/engines/rustic/skin/pattern-calendar-view.css', anchors: ['.ds-pattern-calendar-view.ds-engine-rustic'] },
  { path: 'runtime/engines/modern/skin/pattern-kanban-board.css', anchors: ['.ds-pattern-kanban-board.ds-engine-modern'] },
  { path: 'runtime/engines/rustic/skin/pattern-kanban-board.css', anchors: ['.ds-pattern-kanban-board.ds-engine-rustic'] },
  { path: 'runtime/engines/modern/skin/pattern-map-view.css', anchors: ['.ds-pattern-map-view.ds-engine-modern'] },
  { path: 'runtime/engines/rustic/skin/pattern-map-view.css', anchors: ['.ds-pattern-map-view.ds-engine-rustic'] },
  { path: 'runtime/engines/modern/skin/pattern-timeline.css', anchors: ['.ds-pattern-timeline.ds-engine-modern'] },
  { path: 'runtime/engines/rustic/skin/pattern-timeline.css', anchors: ['.ds-pattern-timeline.ds-engine-rustic'] },
  { path: 'runtime/engines/modern/skin/pattern-tree-view.css', anchors: ['.ds-pattern-tree-view.ds-engine-modern'] },
  { path: 'runtime/engines/rustic/skin/pattern-tree-view.css', anchors: ['.ds-pattern-tree-view.ds-engine-rustic'] },
];

const entrypoints = [
  { name: 'styles.css', path: join(cssRoot, 'facade/entrypoints/styles.css') },
  { name: 'facade/entrypoints/base.css', path: join(cssRoot, 'facade/entrypoints/base.css') },
];

function isInsideKeyframes(rule) {
  for (let parent = rule.parent; parent; parent = parent.parent) {
    if (parent.type === 'atrule' && /keyframes$/i.test(parent.name)) return true;
  }
  return false;
}

function isScopeAnchored(selector, anchors) {
  if (anchors.some((anchor) => selector.startsWith(anchor))) return true;

  // Direction is document context, not paint ownership. Keep the chart scope
  // as the first owning selector after the zero-specificity RTL/LTR context.
  const directionalContext = selector.match(
    /^:where\(\[dir=['"](?:rtl|ltr)['"]\]\)\s+([\s\S]+)$/,
  );
  if (
    directionalContext &&
    anchors.some((anchor) => directionalContext[1].startsWith(anchor))
  ) {
    return true;
  }

  // Static SVG presentation attributes have zero specificity. A byte-exact
  // migration may therefore wrap the complete scoped selector in :where() so
  // ordinary consumer author CSS keeps the same ability to override it.
  const zeroSpecificity = selector.match(/^:where\(([^,()]*)\)$/);
  return Boolean(
    zeroSpecificity &&
    anchors.some((anchor) => zeroSpecificity[1].trim().startsWith(anchor)),
  );
}

function parseImportParams(params) {
  const quoted = params.trim().match(/^(['"])(.*?)\1(.*)$/s);
  if (quoted) return { target: quoted[2], suffix: quoted[3].trim() };

  const url = params.trim().match(/^url\(\s*(['"])(.*?)\1\s*\)(.*)$/s);
  if (url) return { target: url[2], suffix: url[3].trim() };

  return null;
}

test('CK-E inventory is exactly the 35 certified source files', () => {
  assert.equal(sources.length, 35, 'CK-E must certify exactly 35 source files');
  assert.equal(new Set(sources.map(({ path }) => path)).size, sources.length, 'CK-E source paths must be unique');

  for (const [slice, target] of Object.entries(sliceTargets)) {
    assert.equal(
      sources.filter((source) => source.slice === slice).length,
      target.files,
      `${slice} must keep its certified file inventory`,
    );
  }

  for (const source of sources) {
    const absolutePath = join(sourceRoot, source.path);
    assert.ok(existsSync(absolutePath), `missing CK-E source: ${source.path}`);
  }
});

test('CK-E paint migration holds every per-file, slice, and global post-migration target', () => {
  const actualSlices = Object.fromEntries(
    Object.keys(sliceTargets).map((slice) => [slice, { files: 0, inline: 0, runtimeSvg: 0, combined: 0 }]),
  );

  let inline = 0;
  let runtimeSvg = 0;
  let unclassified = 0;

  for (const expected of sources) {
    const absolutePath = join(sourceRoot, expected.path);
    const text = readFileSync(absolutePath, 'utf8');
    const inlineResult = countArc09PaintInFile(text, absolutePath);
    const runtimeResult = analyzeRuntimeSvgPaint(text, absolutePath);

    assert.equal(runtimeResult.unclassified, 0, `${expected.path} has unclassified runtime SVG paint`);
    assert.equal(inlineResult, expected.inline, `${expected.path} inline paint drifted`);
    assert.equal(runtimeResult.count, expected.runtimeSvg, `${expected.path} runtime SVG paint drifted`);

    const slice = actualSlices[expected.slice];
    slice.files += 1;
    slice.inline += inlineResult;
    slice.runtimeSvg += runtimeResult.count;
    slice.combined += inlineResult + runtimeResult.count;

    inline += inlineResult;
    runtimeSvg += runtimeResult.count;
    unclassified += runtimeResult.unclassified;
  }

  assert.deepEqual(actualSlices, sliceTargets, 'CK-E slice floors drifted');
  assert.deepEqual(
    { inline, runtimeSvg, combined: inline + runtimeSvg, unclassified },
    { inline: 49, runtimeSvg: 65, combined: 114, unclassified: 0 },
    'CK-E global post-migration target drifted',
  );
});

test('all 23 CK-E skins are unlayered, scope-anchored, and free of !important', () => {
  assert.equal(skins.length, 23, 'CK-E must certify exactly 23 skins');
  assert.equal(new Set(skins.map(({ path }) => path)).size, skins.length, 'CK-E skin paths must be unique');

  for (const skin of skins) {
    const absolutePath = join(cssRoot, skin.path);
    assert.ok(existsSync(absolutePath), `missing CK-E skin: ${skin.path}`);

    const root = postcss.parse(readFileSync(absolutePath, 'utf8'), { from: absolutePath });
    const layers = [];
    const importantDeclarations = [];
    const scopedSelectors = [];

    root.walkAtRules('layer', (atRule) => layers.push(atRule));
    root.walkDecls((declaration) => {
      if (declaration.important) importantDeclarations.push(declaration);
    });
    root.walkRules((rule) => {
      if (isInsideKeyframes(rule)) return;

      for (const selector of rule.selectors) {
        const trimmed = selector.trim();
        assert.ok(
          isScopeAnchored(trimmed, skin.anchors),
          `${skin.path} has an unscoped selector: ${trimmed}`,
        );
        scopedSelectors.push(trimmed);
      }
    });

    assert.equal(layers.length, 0, `${skin.path} must remain unlayered`);
    assert.equal(importantDeclarations.length, 0, `${skin.path} must not use !important`);
    assert.ok(scopedSelectors.length > 0, `${skin.path} must contain at least one scoped selector`);
  }
});

test('both canonical entrypoints import every CK-E skin exactly once and unlayered', () => {
  for (const entrypoint of entrypoints) {
    assert.ok(existsSync(entrypoint.path), `missing CK-E entrypoint: ${entrypoint.name}`);
    const root = postcss.parse(readFileSync(entrypoint.path, 'utf8'), { from: entrypoint.path });
    const imports = [];

    root.walkAtRules('import', (atRule) => {
      const parsed = parseImportParams(atRule.params);
      if (parsed) imports.push(parsed);
    });

    for (const skin of skins) {
      const target = `../../${skin.path}`;
      const matches = imports.filter((entry) => entry.target === target);

      assert.equal(matches.length, 1, `${entrypoint.name} must import ${target} exactly once`);
      assert.equal(matches[0].suffix, '', `${entrypoint.name} must import ${target} without a layer or condition`);
    }
  }
});
