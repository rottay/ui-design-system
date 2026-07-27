import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import { countArc09PaintInFile } from './lib/inline-paint-counter.mjs';

const packageRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const patternsRoot = join(packageRoot, 'src/ui/patterns/visualization');
const cssRoot = join(packageRoot, 'src/foundation/tokens/css/runtime/engines');

const FILES = {
  calendarModern: {
    path: 'calendar-view/engines/modern/index.tsx',
    start: 28,
    floor: 1,
  },
  calendarRustic: {
    path: 'calendar-view/engines/rustic/index.tsx',
    start: 18,
    floor: 1,
  },
  mapModern: {
    path: 'map-view/engines/modern/index.tsx',
    start: 13,
    floor: 1,
  },
  mapRustic: {
    path: 'map-view/engines/rustic/index.tsx',
    start: 16,
    floor: 1,
  },
  kanbanModern: {
    path: 'kanban-board/engines/modern/index.tsx',
    start: 16,
    floor: 1,
  },
  kanbanRustic: {
    path: 'kanban-board/engines/rustic/index.tsx',
    start: 32,
    floor: 1,
  },
  timelineModern: {
    path: 'timeline/engines/modern/index.tsx',
    start: 16,
    floor: 0,
  },
  timelineRustic: {
    path: 'timeline/engines/rustic/index.tsx',
    start: 21,
    floor: 0,
  },
  treeModern: {
    path: 'tree-view/engines/modern/index.tsx',
    start: 16,
    floor: 0,
  },
  treeRustic: {
    path: 'tree-view/engines/rustic/index.tsx',
    start: 19,
    floor: 0,
  },
};

const SKINS = [
  ['modern', 'pattern-calendar-view.css', '.ds-pattern-calendar-view.ds-engine-modern'],
  ['rustic', 'pattern-calendar-view.css', '.ds-pattern-calendar-view.ds-engine-rustic'],
  ['modern', 'pattern-map-view.css', '.ds-pattern-map-view.ds-engine-modern'],
  ['rustic', 'pattern-map-view.css', '.ds-pattern-map-view.ds-engine-rustic'],
  ['modern', 'pattern-kanban-board.css', '.ds-pattern-kanban-board.ds-engine-modern'],
  ['rustic', 'pattern-kanban-board.css', '.ds-pattern-kanban-board.ds-engine-rustic'],
  ['modern', 'pattern-timeline.css', '.ds-pattern-timeline.ds-engine-modern'],
  ['rustic', 'pattern-timeline.css', '.ds-pattern-timeline.ds-engine-rustic'],
  ['modern', 'pattern-tree-view.css', '.ds-pattern-tree-view.ds-engine-modern'],
  ['rustic', 'pattern-tree-view.css', '.ds-pattern-tree-view.ds-engine-rustic'],
];

function pathFor(entry) {
  return join(patternsRoot, entry.path);
}

function source(entry) {
  return readFileSync(pathFor(entry), 'utf8');
}

test('CK-E noncharts migrate the exact 195-site start to the six caller-derived floors', () => {
  let start = 0;
  let floor = 0;

  for (const [name, entry] of Object.entries(FILES)) {
    const actual = countArc09PaintInFile(source(entry), pathFor(entry));
    assert.equal(actual, entry.floor, `${name} must land at its exact final floor`);
    start += entry.start;
    floor += actual;
  }

  assert.equal(start, 195);
  assert.equal(floor, 6);
  assert.equal(start - floor, 189);
});

test('CK-E nonchart floors retain their exact caller-derived identities', () => {
  for (const name of ['calendarModern', 'calendarRustic']) {
    const text = source(FILES[name]);
    assert.equal(text.match(/background: ev\.color \?\? 'var\(--ds-color-primary\)'/g)?.length, 1, `${name} event floor drifted`);
  }

  for (const name of ['mapModern', 'mapRustic']) {
    const text = source(FILES[name]);
    assert.equal(text.match(/background: marker\.color/g)?.length, 1, `${name} marker floor drifted`);
  }

  for (const name of ['kanbanModern', 'kanbanRustic']) {
    const text = source(FILES[name]);
    assert.equal(text.match(/borderTop: column\.color/g)?.length, 1, `${name} column floor drifted`);
  }
});

test('CK-E nonchart skins are engine-scoped and contain no generic hatch', () => {
  for (const [engine, filename, scope] of SKINS) {
    const path = join(cssRoot, engine, 'skin', filename);
    const css = readFileSync(path, 'utf8');
    assert.match(css, new RegExp(scope.replaceAll('.', '\\.')));
    assert.doesNotMatch(css, /(^|\})\s*\[data-part=/, `${engine}/${filename} contains a bare part selector`);
    assert.doesNotMatch(css, /!important/, `${engine}/${filename} introduced !important`);
  }
});

test('CK-E Timeline runtime marker colour crosses only through a scoped custom property', () => {
  const sourceText = source(FILES.timelineRustic);
  const css = readFileSync(join(cssRoot, 'rustic/skin/pattern-timeline.css'), 'utf8');
  assert.equal(sourceText.match(/'--ds-pattern-timeline-marker-color': color/g)?.length, 2);
  assert.equal(css.match(/var\(--ds-pattern-timeline-marker-color\)/g)?.length, 3);
});

test('CK-E Rustic Kanban preserves distinct initial, settled and hover card shadows', () => {
  const sourceText = source(FILES.kanbanRustic);
  const css = readFileSync(join(cssRoot, 'rustic/skin/pattern-kanban-board.css'), 'utf8');
  const initial = css.indexOf('box-shadow: var(--ds-card-shadow, var(--ds-shadow-sm));');
  const settled = css.indexOf("[data-part='card'][data-hover-cycle='settled']");
  const hover = css.indexOf("[data-part='card'][data-dragging='false']:hover");

  assert.notEqual(initial, -1, 'initial state must retain the shadow-sm fallback');
  assert.notEqual(settled, -1, 'mouseleave must have a finite settled selector');
  assert.notEqual(hover, -1, 'hover must retain its finite selector');
  assert.ok(initial < settled && settled < hover, 'initial, settled and hover cascade order drifted');
  assert.match(
    css,
    /> \[data-part='card'\]\[data-part='card'\] \{[\s\S]*?box-shadow: var\(--ds-card-shadow, var\(--ds-shadow-sm\)\);[\s\S]*?\}/,
  );
  assert.match(css.slice(settled, hover), /box-shadow: var\(--ds-card-shadow, none\);/);
  assert.match(
    css.slice(hover),
    /^\[data-part='card'\]\[data-dragging='false'\]:hover \{[\s\S]*?box-shadow: var\(--ds-card-shadow-hover, var\(--ds-shadow-md\)\);[\s\S]*?\}/,
  );
  assert.match(sourceText, /onMouseLeave=\{\(e\) => \{\s*if \(!isDragging\) e\.currentTarget\.dataset\.hoverCycle = 'settled';\s*\}\}/);
  assert.doesNotMatch(sourceText, /\.style\.(?:boxShadow|transform)\s*=/);
});

test('CK-E Rustic Timeline owns the reset shadow only for clickable cards', () => {
  const css = readFileSync(join(cssRoot, 'rustic/skin/pattern-timeline.css'), 'utf8');
  const cardRules = [...css.matchAll(/([^{}]*\.ds-timeline-rustic__item-card[^{}]*)\{([^{}]*)\}/g)];

  assert.equal(cardRules.length, 3);
  assert.doesNotMatch(cardRules[0][2], /box-shadow\s*:/);
  assert.match(cardRules[1][1], /\[data-clickable='true'\]/);
  assert.match(cardRules[1][2], /box-shadow: none;/);
  assert.match(cardRules[2][1], /\[data-clickable='true'\]:hover/);
  assert.match(cardRules[2][2], /box-shadow: 0 2px 8px rgba\(0, 0, 0, 0\.1\);/);
  assert.doesNotMatch(css, /\[data-clickable='false'\][^{]*\{[^}]*box-shadow\s*:/);
});

test('CK-E preserves shared Tree paint ownership and embedded structural CSS', () => {
  const modern = source(FILES.treeModern);
  const rustic = source(FILES.treeRustic);
  assert.match(modern, /import \{ panelCardStyle \}/);
  assert.equal(modern.match(/\.\.\.panelCardStyle/g)?.length, 2);
  assert.match(
    rustic,
    /<style>\{`@keyframes ds-tree-view-rustic-pulse \{ 0%,100%\{opacity:1\} 50%\{opacity:\.4\} \}`\}<\/style>/,
  );
  assert.doesNotMatch(rustic, /@keyframes\s+pulse\b/);
});
