import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SHOWROOM_ROOT = path.resolve(HERE, '../..');
const REPO = path.resolve(SHOWROOM_ROOT, '../..');
const PROBE = path.join(SHOWROOM_ROOT, 'src/app/probe/ds-reference/sections/compositions');
const UI = path.join(REPO, 'packages/core/src/components');
const DOC = path.join(REPO, '../docs-engineering/engineering/design-system/components/surfaces/layout/README.md');

/** The roster is governed: docs headings, the owners, and the probe must agree
 *  on the same four families, or a capture batch photographs the wrong set.
 *
 *  What changed: `surfaces/composition/layout/` is gone. `composition` is a
 *  dependency role inside an owner, never a component tier, so these four were
 *  reclassified by what they ARE — four page-chrome shells under `structures/`.
 *  There is no longer one barrel to read, so each row carries its own owner and
 *  barrel. WorkspaceShell passed briefly through `surfaces/workspace/` on the
 *  way here; a layout shell frames a screen rather than describing one, so it
 *  is a structure like the other three, and nothing forwards from that path. */

const EXPECTED = [
  {
    family: 'PageShellSurface',
    slug: 'page-shell',
    owner: 'structures/shell/page-shell-surface/index.tsx',
    barrel: ['structures/shell/index.ts', "export { PageShellSurface } from './page-shell-surface'"],
  },
  {
    family: 'HeaderSurface',
    slug: 'header',
    owner: 'structures/headers/header-surface/index.tsx',
    barrel: ['structures/headers/index.ts', "export * from './header-surface'"],
  },
  {
    family: 'SidebarSurface',
    slug: 'sidebar',
    owner: 'structures/shell/navigation/sidebar-surface/index.tsx',
    barrel: ['structures/shell/index.ts', "export { SidebarSurface } from './navigation/sidebar-surface'"],
  },
  {
    family: 'WorkspaceShell',
    slug: 'workspace-shell',
    owner: 'structures/shell/workspace-shell/index.tsx',
    barrel: ['structures/shell/index.ts', "export { WorkspaceShell } from './workspace-shell'"],
  },
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

test('the retired composition tier is gone and each family ships from its new tier barrel', () => {
  assert.equal(
    existsSync(path.join(UI, 'surfaces/composition')),
    false,
    'surfaces/composition/ is back -- composition is a dependency role, not a component tier',
  );
  for (const { family, barrel: [file, literal] } of EXPECTED) {
    const barrel = readFileSync(path.join(UI, file), 'utf8');
    assert.ok(barrel.includes(literal), `${family}: ${file} no longer contains "${literal}"`);
  }
});

test('each owner exports the single component the docs name', () => {
  for (const { family, owner } of EXPECTED) {
    const source = readFileSync(path.join(UI, owner), 'utf8');
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
  /* `fixtureModule`, not `module`: Next's lint rule reserves that identifier. */
  for (const fixtureModule of ['./config-a', './config-b']) {
    assert.ok(dispatcher.includes(fixtureModule), `${fixtureModule} is never imported`);
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
    path.join(REPO, 'packages/core/src/foundation/tokens/css/presentation/components/skin/layout-sidebar/index.css'),
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
