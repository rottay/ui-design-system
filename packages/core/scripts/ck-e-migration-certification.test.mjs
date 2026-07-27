import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import postcss from 'postcss';

const packageRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const cssRoot = join(packageRoot, 'src/foundation/tokens/css');

const skins = [
  {
    path: 'presentation/components/skin/chart-foundation.css',
    anchors: [
      '.ds-chart-scaffold',
      '.ds-chart-frame',
      '.ds-chart-data-access',
      '.ds-chart-renderer',
      '.ds-chart-renderer-bar',
      '.ds-chart-renderer-heatmap',
      '.ds-chart-renderer-line',
      '.ds-chart-renderer-pie',
      '.ds-chart-renderer-scatter',
      '.ds-chart-metric-trend',
      '.ds-chart-ranked-rows',
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

test('all 23 CK-E skins are internally scope-anchored and free of escalation', () => {
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

test('both canonical entrypoints import every CK-E skin exactly once in its owning layer', () => {
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
      const expectedLayer = skin.path.startsWith('runtime/engines/')
        ? 'layer(rottay-engines)'
        : 'layer(rottay-components)';
      assert.equal(
        matches[0].suffix,
        expectedLayer,
        `${entrypoint.name} must import ${target} through ${expectedLayer}`,
      );
    }
  }
});
