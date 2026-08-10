import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SHOWROOM_ROOT = path.resolve(HERE, '../..');
const REPO = path.resolve(SHOWROOM_ROOT, '../..');
const PROBE = path.join(SHOWROOM_ROOT, 'src/app/probe/ds-reference/sections/commercial');
const KIT = path.join(REPO, 'packages/core/src/ui/patterns/commercial');
const LAW = path.join(REPO, '../docs-engineering/engineering/design-system/commercial-surfaces/README.md');

/** The roster is governed: the normative law's section 8, the barrel, and the
 *  probe must name the same eleven, or a batch photographs the wrong set. */

const EXPECTED = [
  { family: 'AsciiFrame', slug: 'ascii-frame', owner: 'framing/ascii-frame' },
  { family: 'CropMarks', slug: 'crop-marks', owner: 'framing/crop-marks' },
  { family: 'InvertSection', slug: 'invert-section', owner: 'framing/invert-section' },
  { family: 'SectionFrame', slug: 'section-frame', owner: 'framing/section-frame' },
  { family: 'TextureBackdrop', slug: 'texture-backdrop', owner: 'framing/texture-backdrop' },
  { family: 'AsciiDiagram', slug: 'ascii-diagram', owner: 'content/ascii-diagram' },
  { family: 'TerminalBlock', slug: 'terminal-block', owner: 'content/terminal-block' },
  { family: 'TreeView', slug: 'tree-view', owner: 'content/tree-view' },
  { family: 'Typewriter', slug: 'typewriter', owner: 'content/typewriter' },
  { family: 'MonoStat', slug: 'mono-stat', owner: 'proof/mono-stat' },
  { family: 'ProductWindow', slug: 'product-window', owner: 'proof/product-window' },
];

function slugArray(file, exportName) {
  const source = readFileSync(path.join(PROBE, file), 'utf8');
  const start = source.indexOf(exportName);
  assert.ok(start !== -1, `${exportName} not found in ${file}`);
  const block = source.slice(start, source.indexOf('];', start));
  return [...block.matchAll(/'([a-z0-9-]+)'/g)].map((m) => m[1]);
}

test('the normative law names exactly the eleven kit components', () => {
  const law = readFileSync(LAW, 'utf8');
  const section8 = law.slice(law.indexOf('## 8. Implementation law'), law.indexOf('## 9.'));
  const named = new Set([...section8.matchAll(/`([A-Z][A-Za-z]+)`/g)].map((m) => m[1]));
  for (const { family } of EXPECTED) {
    assert.ok(named.has(family), `${family} is not named in the law's implementation section`);
  }
  assert.equal(named.size, EXPECTED.length, `law names ${[...named].sort().join(', ')}`);
});

test('the barrel exports exactly the eleven owners', () => {
  const barrel = readFileSync(path.join(KIT, 'index.ts'), 'utf8');
  const owners = [...barrel.matchAll(/export \* from '\.\/presentation\/([a-z/-]+)'/g)].map((m) => m[1]);
  assert.deepEqual(owners.sort(), EXPECTED.map((e) => e.owner).sort());
});

test('each owner exports the single component the law names', () => {
  for (const { family, owner } of EXPECTED) {
    const source = readFileSync(path.join(KIT, 'presentation', owner, 'index.tsx'), 'utf8');
    const exported = [...source.matchAll(/export function ([A-Za-z]+)\(/g)].map((m) => m[1]);
    assert.deepEqual(exported, [family], `${owner} must export exactly ${family}`);
  }
});

test('the probe case list and fixture modules partition the roster exactly', () => {
  const cases = slugArray('cases.ts', 'COMMERCIAL_CASES');
  assert.deepEqual(cases.sort(), EXPECTED.map((e) => e.slug).sort());

  const owned = [
    ...slugArray('config-a.tsx', 'CONFIG_COMMERCIAL_A_SLUGS'),
    ...slugArray('config-b.tsx', 'CONFIG_COMMERCIAL_B_SLUGS'),
  ];
  const duplicates = owned.filter((s, i) => owned.indexOf(s) !== i);
  assert.deepEqual(duplicates, [], 'a slug is owned by more than one fixture module');
  assert.deepEqual(
    owned.sort(),
    cases.sort(),
    'a case with no fixture module would capture blank frames as passing shots',
  );
});

test('the dispatcher renders both fixture modules and loads the kit stylesheet', () => {
  const dispatcher = readFileSync(path.join(PROBE, 'index.tsx'), 'utf8');
  for (const module of ['./config-a', './config-b']) {
    assert.ok(dispatcher.includes(module), `${module} is never imported`);
  }
  assert.ok(
    dispatcher.includes('@rottay/design-system/commercial.css'),
    'without the kit stylesheet every capture photographs unstyled markup',
  );
  const rendered = [...dispatcher.matchAll(/<(ConfigCommercial[AB]Surface)\b/g)].map((m) => m[1]);
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
