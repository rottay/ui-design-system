import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SHOWROOM_ROOT = path.resolve(HERE, '../..');
const REPO = path.resolve(SHOWROOM_ROOT, '../..');
const PROBE = path.join(SHOWROOM_ROOT, 'src/app/probe/ds-reference/sections/compositions');
const LAYOUT = path.join(REPO, 'packages/core/src/ui/surfaces/composition/layout');
const DOC = path.join(REPO, '../docs-engineering/engineering/design-system/components/surfaces/layout/README.md');

/** The roster is governed: docs headings, the barrel, and the probe must agree
 *  on the same four families, or a capture batch photographs the wrong set. */

const EXPECTED = [
  { family: 'PageShellSurface', slug: 'page-shell', owner: 'page-shell' },
  { family: 'HeaderSurface', slug: 'header', owner: 'page-shell/header' },
  { family: 'SidebarSurface', slug: 'sidebar', owner: 'sidebar' },
  { family: 'WorkspaceShell', slug: 'workspace-shell', owner: 'collection-shell' },
];

function slugArray(file, exportName) {
  const source = readFileSync(path.join(PROBE, file), 'utf8');
  const start = source.indexOf(exportName);
  assert.ok(start !== -1, `${exportName} not found in ${file}`);
  const block = source.slice(start, source.indexOf('];', start));
  return [...block.matchAll(/'([a-z0-9-]+)'/g)].map((m) => m[1]);
}

test('the docs authority names exactly the four composition families', () => {
  const headings = readFileSync(DOC, 'utf8')
    .split('\n')
    .filter((l) => l.startsWith('## '))
    .map((l) => l.replace(/^##\s*/, '').trim());
  assert.deepEqual(headings.sort(), EXPECTED.map((e) => e.family).sort());
});

test('the barrel exports exactly the four owners', () => {
  const barrel = readFileSync(path.join(LAYOUT, 'index.ts'), 'utf8');
  const owners = [...barrel.matchAll(/export \* from '\.\/([a-z/-]+)'/g)].map((m) => m[1]);
  assert.deepEqual(owners.sort(), EXPECTED.map((e) => e.owner).sort());
});

test('each owner exports the single component the docs name', () => {
  for (const { family, owner } of EXPECTED) {
    const source = readFileSync(path.join(LAYOUT, owner, 'index.tsx'), 'utf8');
    const exported = [...source.matchAll(/export function ([A-Za-z]+)\(/g)].map((m) => m[1]);
    assert.deepEqual(exported, [family], `${owner} must export exactly ${family}`);
  }
});

test('the probe case list and fixture modules partition the roster exactly', () => {
  const cases = slugArray('cases.ts', 'COMPOSITION_CASES');
  assert.deepEqual(cases.sort(), EXPECTED.map((e) => e.slug).sort());

  const owned = [
    ...slugArray('config-a.tsx', 'CONFIG_COMPOSITION_A_SLUGS'),
    ...slugArray('config-b.tsx', 'CONFIG_COMPOSITION_B_SLUGS'),
  ];
  const duplicates = owned.filter((s, i) => owned.indexOf(s) !== i);
  assert.deepEqual(duplicates, [], 'a slug is owned by more than one fixture module');
  assert.deepEqual(
    owned.sort(),
    cases.sort(),
    'a case with no fixture module would capture blank frames as passing shots',
  );
});

test('the dispatcher renders both fixture modules', () => {
  const dispatcher = readFileSync(path.join(PROBE, 'index.tsx'), 'utf8');
  for (const module of ['./config-a', './config-b']) {
    assert.ok(dispatcher.includes(module), `${module} is never imported`);
  }
  const rendered = [...dispatcher.matchAll(/<(ConfigComposition[AB]Surface)\b/g)].map((m) => m[1]);
  assert.equal(rendered.length, 2, `expected both modules rendered, saw ${rendered.join(', ')}`);
});

// Negative drill: the partition check must reject what it exists to catch.
test('the partition check rejects an unowned or doubly-owned slug', () => {
  const roster = ['a', 'b', 'c'];
  assert.throws(() => assert.deepEqual(['a', 'b'].sort(), roster.sort()), /AssertionError/);
  const doubled = ['a', 'b', 'b'];
  assert.throws(
    () => assert.deepEqual(doubled.filter((s, i) => doubled.indexOf(s) !== i), []),
    /AssertionError/,
  );
});

/** A grid alignment leaking into the stacked flex column collapsed every child
 *  to content width, so the stacked rule must state its own cross-axis value. */
test('the stacked sidebar rule resets the cross-axis alignment it inherits', () => {
  const skin = readFileSync(
    path.join(REPO, 'packages/core/src/foundation/tokens/css/presentation/components/skin/layout-sidebar.css'),
    'utf8',
  );
  const gridRule = skin.slice(skin.indexOf(".ds-surface.ds-sidebar[data-part='root'] {"));
  assert.ok(
    /align-items:\s*start/.test(gridRule.slice(0, 260)),
    'the grid rule is expected to set align-items: start; if that changed, revisit this pin',
  );

  const start = skin.indexOf(".ds-surface.ds-sidebar[data-part='root'][data-stacked='true']");
  assert.ok(start !== -1, 'the stacked rule must exist');
  const stacked = skin.slice(start, skin.indexOf('}', start));
  assert.match(stacked, /display:\s*flex/);
  assert.match(stacked, /flex-direction:\s*column/);
  assert.match(
    stacked,
    /align-items:\s*stretch/,
    'without an explicit stretch the grid rule\'s align-items: start becomes cross-axis here and collapses the panel to content width',
  );
});
