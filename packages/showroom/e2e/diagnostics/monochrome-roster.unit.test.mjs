import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SHOWROOM_ROOT = path.resolve(HERE, '../..');
const REPO = path.resolve(SHOWROOM_ROOT, '../..');
const PROBE = path.join(SHOWROOM_ROOT, 'src/app/probe/ds-reference/sections/monochrome');
const UI = path.join(REPO, 'packages/core/src/components');
const LAW = path.join(REPO, '../docs-engineering/engineering/design-system/commercial-surfaces/README.md');

/** The roster is governed: the normative law's section 8 and the probe must name
 *  the same set, or a batch photographs the wrong one.
 *
 *  The set is TEN DS families plus ONE showroom-local probe subject -- not
 *  eleven families. The private `ui/patterns/commercial/` tree and its
 *  `@rottay/design-system/commercial` subpath are gone. "Commercial" is a
 *  marketing adjective, never an architectural role, so the ten were
 *  reclassified by what they DO -- three display primitives, two layout
 *  primitives, three patterns, one structure -- and now ship from the ordinary
 *  tier barrels. ProductWindow left the DS entirely: it is the sanctioned color
 *  exception, and a marketing-surface concern is showroom-local by the
 *  ownership contract. It is photographed with the kit because the probe covers
 *  the surface, which is not the same as belonging to the kit.
 *
 *  So this file no longer asserts one barrel. It asserts each family's real
 *  owner and the real re-export chain that carries it to the package root. */

const EXPECTED = [
  {
    family: 'AsciiFrame',
    slug: 'ascii-frame',
    owner: 'primitives/layout/ascii-frame/index.tsx',
    chain: [['primitives/layout/index.ts', "export { AsciiFrame } from './ascii-frame'"]],
  },
  {
    family: 'CropMarks',
    slug: 'crop-marks',
    owner: 'primitives/display/crop-marks/index.tsx',
    chain: [['primitives/display/index.ts', "export { CropMarks } from './crop-marks'"]],
  },
  {
    family: 'InvertSection',
    slug: 'invert-section',
    owner: 'primitives/layout/invert-section/index.tsx',
    chain: [['primitives/layout/index.ts', "export { InvertSection } from './invert-section'"]],
  },
  {
    family: 'SectionFrame',
    slug: 'section-frame',
    owner: 'structures/headers/section-frame/index.tsx',
    chain: [['structures/headers/index.ts', "export * from './section-frame'"]],
  },
  {
    family: 'TextureBackdrop',
    slug: 'texture-backdrop',
    owner: 'primitives/display/texture-backdrop/index.tsx',
    chain: [['primitives/display/index.ts', "export { TextureBackdrop } from './texture-backdrop'"]],
  },
  {
    family: 'AsciiDiagram',
    slug: 'ascii-diagram',
    owner: 'patterns/visualization/ascii-diagram/index.tsx',
    chain: [['patterns/visualization/index.ts', "export * from './ascii-diagram'"]],
  },
  {
    family: 'TerminalBlock',
    slug: 'terminal-block',
    owner: 'patterns/feedback/terminal-block/index.tsx',
    chain: [['patterns/feedback/index.ts', "export * from './terminal-block'"]],
  },
  {
    // The law used to write `TreeView` and this roster accepted either name.
    // That fallback is gone: the family ships two presentations, the
    // engine-dispatched `PatternTreeView` owns a `TreeNode` of an entirely
    // different shape, and accepting the ambiguous name let the law and the
    // source disagree indefinitely. The law now writes `TreeViewConnector`, so
    // only `TreeViewConnector` is accepted.
    family: 'TreeViewConnector',
    slug: 'tree-view',
    owner: 'patterns/visualization/tree-view/presentation/connector/index.tsx',
    chain: [
      ['patterns/visualization/index.ts', "export * from './tree-view'"],
      ['patterns/visualization/tree-view/index.ts', 'TreeViewConnector'],
    ],
  },
  {
    family: 'Typewriter',
    slug: 'typewriter',
    owner: 'primitives/display/typewriter/index.tsx',
    chain: [['primitives/display/index.ts', "export { Typewriter } from './typewriter'"]],
  },
  {
    family: 'MonoStat',
    slug: 'mono-stat',
    owner: 'patterns/data/mono-stat/index.tsx',
    chain: [['patterns/data/index.ts', "export * from './mono-stat'"]],
  },
  {
    // Showroom-local by design: `owner` is resolved against the showroom, not the DS.
    family: 'ProductWindow',
    slug: 'product-window',
    showroomLocal: true,
    owner: 'src/components/product-window/index.tsx',
  },
];

/** The kit itself: ten DS families. ProductWindow is a probe subject, not a
 *  member, so it is excluded here by its own declared flag. */
const KIT_FAMILIES = EXPECTED.filter((e) => !e.showroomLocal);

function slugArray(file, exportName) {
  const source = readFileSync(path.join(PROBE, file), 'utf8');
  const start = source.indexOf(exportName);
  assert.ok(start !== -1, `${exportName} not found in ${file}`);
  const block = source.slice(start, source.indexOf('];', start));
  return [...block.matchAll(/'([a-z0-9-]+)'/g)].map((m) => m[1]);
}

test('the normative law names the ten kit families by their exact names', () => {
  const law = readFileSync(LAW, 'utf8');
  const section8 = law.slice(law.indexOf('## 8. Implementation law'), law.indexOf('## 9.'));
  const named = new Set([...section8.matchAll(/`([A-Z][A-Za-z]+)`/g)].map((m) => m[1]));

  // Exhaustiveness belongs to the enumeration bullet, not to the whole section:
  // the section also disambiguates `TreeViewConnector` from `PatternTreeView`
  // and its `TreeNode`, and naming those is the point of that sentence.
  const kitStart = section8.indexOf('shared monochrome kit');
  assert.ok(kitStart !== -1, 'the law no longer introduces a "shared monochrome kit"');
  const kitBullet = section8.slice(kitStart, section8.indexOf('\n- ', kitStart));
  const kitNamed = [...kitBullet.matchAll(/`([A-Z][A-Za-z]+)`/g)].map((m) => m[1]);

  for (const { family } of KIT_FAMILIES) {
    // No alias fallback. A law that may name the family two ways cannot be
    // used to detect that the source renamed it.
    assert.ok(kitNamed.includes(family), `the law's kit list does not name ${family} exactly`);
  }
  assert.deepEqual(
    [...kitNamed].sort(),
    KIT_FAMILIES.map((e) => e.family).sort(),
    'the law\'s kit list and this roster disagree',
  );
  assert.equal(
    kitNamed.includes('TreeView'),
    false,
    'the law still writes the ambiguous `TreeView` in the kit list',
  );
  assert.equal(
    kitNamed.includes('ProductWindow'),
    false,
    'ProductWindow is listed as a kit family; it is the showroom-local exception',
  );
  assert.ok(named.has('ProductWindow'), 'the law must still name ProductWindow, as the exception');
});

test('the law states the root import and disowns the private subpath', () => {
  const law = readFileSync(LAW, 'utf8');
  const section8 = law.slice(law.indexOf('## 8. Implementation law'), law.indexOf('## 9.'));
  assert.match(
    section8,
    /no `@rottay\/design-system\/commercial` subpath/,
    'the law must say the private subpath does not exist',
  );
  assert.match(section8, /exported from the package root/, 'the law must state the root import');

  // Whole file, not just section 8. Scoping this to the implementation section
  // is what let the roadmap section keep telling readers to build the kit at
  // `@rottay/design-system/commercial` long after the subpath was deleted.
  const mentions = [...law.matchAll(/@rottay\/design-system\/commercial/g)].length;
  assert.equal(
    mentions,
    1,
    `the removed subpath is named ${mentions} times; only the sentence denying it may remain`,
  );
});

test('the private commercial kit tree and subpath are gone', () => {
  assert.equal(
    existsSync(path.join(UI, 'patterns/commercial')),
    false,
    'ui/patterns/commercial/ is back -- "commercial" is a marketing adjective, not an architectural role',
  );
  const pkg = JSON.parse(readFileSync(path.join(REPO, 'packages/core/package.json'), 'utf8'));
  assert.equal(
    Object.keys(pkg.exports ?? {}).includes('./commercial'),
    false,
    'the ./commercial subpath is back',
  );
});

test('each owner exports exactly the single component the law names', () => {
  for (const { family, owner, showroomLocal } of EXPECTED) {
    const root = showroomLocal ? SHOWROOM_ROOT : UI;
    const source = readFileSync(path.join(root, owner), 'utf8');
    const exported = [...source.matchAll(/export function ([A-Za-z]+)\(/g)].map((m) => m[1]);
    assert.deepEqual(exported, [family], `${owner} must export exactly ${family}`);
  }
});

test('every DS family reaches the package root through the ordinary tier barrels', () => {
  for (const { family, chain } of KIT_FAMILIES) {
    for (const [file, literal] of chain) {
      const barrel = readFileSync(path.join(UI, file), 'utf8');
      assert.ok(barrel.includes(literal), `${family}: ${file} no longer contains "${literal}"`);
    }
  }
  const uiBarrel = readFileSync(path.join(UI, 'index.ts'), 'utf8');
  for (const tier of ['./primitives', './patterns', './structures']) {
    assert.ok(uiBarrel.includes(`export * from '${tier}'`), `ui barrel dropped ${tier}`);
  }
  const rootBarrel = readFileSync(path.join(REPO, 'packages/core/src/index.ts'), 'utf8');
  assert.ok(
    rootBarrel.includes("export * from './components'"),
    'the package root no longer re-exports ./components',
  );
});

test('ProductWindow has not re-entered the design system', () => {
  // The old version of this test asked whether `ProductWindow` appeared in
  // DS_FAMILIES -- a list this file writes and then filters by the same flag.
  // It could only fail if the file contradicted itself, so it proved nothing.
  // Re-entry would happen in the source tree, the family inventory or the
  // registries, so those are what get inspected now.
  assert.ok(
    existsSync(path.join(SHOWROOM_ROOT, 'src/components/product-window/index.tsx')),
    'the showroom-local ProductWindow is missing',
  );

  const folders = new Set();
  const walk = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      folders.add(entry.name);
      walk(path.join(dir, entry.name));
    }
  };
  walk(UI);
  // Guard the guard: a wrong root would find no ProductWindow folder and pass
  // for the wrong reason, so prove the walk reaches real owners first.
  assert.ok(folders.has('tree-view'), 'the UI walk found no known owner; the root is wrong');
  for (const name of ['product-window', 'ProductWindow']) {
    assert.equal(folders.has(name), false, `a ${name} owner folder is back in the DS UI tree`);
  }

  // Prose may discuss it (a test comment already does); an export statement is
  // the thing that would actually publish it.
  const exportPattern = /export\s+(?:\{[^}]*\bProductWindow\b|(?:function|const)\s+ProductWindow\b)/;
  for (const barrel of ['index.ts', 'primitives/index.ts', 'patterns/index.ts', 'structures/index.ts']) {
    const source = readFileSync(path.join(UI, barrel), 'utf8');
    assert.equal(exportPattern.test(source), false, `ui/${barrel} exports ProductWindow`);
  }
  const rootBarrel = readFileSync(path.join(REPO, 'packages/core/src/index.ts'), 'utf8');
  assert.equal(exportPattern.test(rootBarrel), false, 'the package root exports ProductWindow');

  const inventory = JSON.parse(
    readFileSync(
      path.join(REPO, 'packages/core/scripts/check/modern-rescue/family-inventory/index.json'),
      'utf8',
    ),
  );
  const claimed = (inventory.families ?? []).filter(
    (row) => row.family === 'ProductWindow' || (row.components ?? []).includes('ProductWindow'),
  );
  assert.deepEqual(claimed, [], 'the family inventory claims ProductWindow as a DS family');

  const registryRoot = path.join(SHOWROOM_ROOT, 'src/data/registry');
  for (const file of ['primitives.ts', 'patterns.ts', 'structures.ts', 'surfaces.ts']) {
    const source = readFileSync(path.join(registryRoot, file), 'utf8');
    assert.equal(
      /name:\s*'ProductWindow'/.test(source),
      false,
      `${file} publishes ProductWindow as a DS component`,
    );
  }
});

test('the probe case list and fixture modules partition the roster exactly', () => {
  const cases = slugArray('cases.ts', 'MONOCHROME_CASES');
  assert.deepEqual(cases.sort(), EXPECTED.map((e) => e.slug).sort());

  const owned = [
    ...slugArray('config-a.tsx', 'CONFIG_MONOCHROME_A_SLUGS'),
    ...slugArray('config-b.tsx', 'CONFIG_MONOCHROME_B_SLUGS'),
  ];
  const duplicates = owned.filter((s, i) => owned.indexOf(s) !== i);
  assert.deepEqual(duplicates, [], 'a slug is owned by more than one fixture module');
  assert.deepEqual(
    owned.sort(),
    cases.sort(),
    'a case with no fixture module would capture blank frames as passing shots',
  );
});

test('the dispatcher renders both fixture modules and imports no private kit stylesheet', () => {
  const dispatcher = readFileSync(path.join(PROBE, 'index.tsx'), 'utf8');
  /* `fixtureModule`, not `module`: Next's lint rule reserves that identifier. */
  for (const fixtureModule of ['./config-a', './config-b']) {
    assert.ok(dispatcher.includes(fixtureModule), `${fixtureModule} is never imported`);
  }
  /* Inverted on purpose. The ten DS skins now ship inside the package's normal
     `styles.css`, which the root layout already loads for every probe route, so
     a private stylesheet import here would be a second, competing source. */
  assert.equal(
    dispatcher.includes('commercial.css'),
    false,
    'the deleted private kit stylesheet is being imported again',
  );
  const rendered = [...dispatcher.matchAll(/<(ConfigMonochrome[AB]Surface)\b/g)].map((m) => m[1]);
  assert.equal(rendered.length, 2, `expected both modules rendered, saw ${rendered.join(', ')}`);
});

test('the fixtures import from the package root, never a private subpath', () => {
  for (const file of ['config-a.tsx', 'config-b.tsx']) {
    const source = readFileSync(path.join(PROBE, file), 'utf8');
    assert.equal(
      source.includes('@rottay/design-system/commercial'),
      false,
      `${file} still imports the removed ./commercial subpath`,
    );
  }
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
