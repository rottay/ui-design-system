import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SHOWROOM_ROOT = path.resolve(HERE, '../..');
const REPO_ROOT = path.resolve(SHOWROOM_ROOT, '../..');

const REGISTRY = path.join(SHOWROOM_ROOT, 'src/data/registry/primitives.ts');
const NAVIGATION = path.join(SHOWROOM_ROOT, 'src/data/navigation.ts');
const ARCHITECTURE = path.join(SHOWROOM_ROOT, 'src/app/(docs)/developers/architecture/page.tsx');

/** `foundation` is a dependency-role support layer inside an owner. It is legal
 *  as a physical folder and illegal as a component category, so it can never
 *  name a primitive family.
 *
 *  The bug this pins is not that the category existed -- it is that nothing
 *  counted the places asserting it. Retiring it from the registry left seven
 *  `Record<PrimitiveCategory, ...>` maps still declaring a `foundation` key,
 *  and the first attempt at this cleanup found five of them, because the
 *  roster was assembled by reading rather than by enumerating.
 *
 *  So the maps are enumerated here. Test 2 checks each declares exactly the six
 *  governed categories; test 3 checks the list in this file is the complete set
 *  of such maps in the tree. A new map cannot be added without appearing here,
 *  and no listed map can quietly grow a seventh key. */

const GOVERNED = ['display', 'feedback', 'inputs', 'layout', 'navigation', 'overlay'];

/** Every `Record<PrimitiveCategory, ...>` in the showroom, as [file, declaration]. */
const CATEGORY_MAPS = [
  ['src/data/registry/primitives.ts', 'primitivesByCategory'],
  ['src/app/(docs)/primitives/page.tsx', 'CATEGORY_EDITORIAL'],
  ['src/app/(docs)/primitives/[category]/page.tsx', 'CATEGORY_PROFILES'],
  ['src/app/(docs)/primitives/[category]/page.tsx', 'CATEGORY_PREVIEW_COPY'],
  ['src/app/(docs)/primitives/[category]/page.tsx', 'CATEGORY_CARD_ACCENTS'],
  ['src/app/(docs)/primitives/[category]/[component]/page.tsx', 'CATEGORY_GUIDANCE'],
  ['src/app/(docs)/primitives/[category]/[component]/page.tsx', 'categoryProps'],
  ['src/app/(docs)/primitives/[category]/[component]/live-preview.tsx', 'CATEGORY_META'],
  ['src/app/(docs)/primitives/[category]/[component]/live-preview.tsx', 'CATEGORY_ACCENTS'],
];

/** The five primitives that used to be filed under `foundation`, and the
 *  category each was adjudicated into by what it actually renders. */
const RELOCATED = {
  'icon-frame': 'display',
  meter: 'display',
  'loading-indicator': 'feedback',
  'resize-handle': 'layout',
  'visually-hidden': 'layout',
};

/** Collects the depth-1 keys of an object literal by brace scanning rather than
 *  by guessing a terminator, because these maps sit at two different indents
 *  and one of them is declared inside a function body. Quote tracking keeps
 *  braces that live inside strings and template literals from moving depth. */
function objectLiteralKeys(source, declaration, file) {
  const declIndex = source.indexOf(`${declaration}:`);
  assert.ok(declIndex !== -1, `${declaration} not found in ${file}`);
  const assign = source.indexOf('=', declIndex);
  assert.ok(assign !== -1, `${declaration} is never assigned in ${file}`);
  const open = source.indexOf('{', assign);
  assert.ok(open !== -1, `${declaration} has no object literal in ${file}`);

  const keys = [];
  let depth = 0;
  let quote = null;
  for (let i = open; i < source.length; i += 1) {
    const char = source[i];
    if (quote) {
      if (char === '\\') {
        i += 1;
        continue;
      }
      if (char === quote) quote = null;
      continue;
    }
    if (char === "'" || char === '"' || char === '`') {
      quote = char;
      continue;
    }
    if (char === '{') {
      depth += 1;
      continue;
    }
    if (char === '}') {
      depth -= 1;
      if (depth === 0) return keys;
      continue;
    }
    if (depth === 1 && char === '\n') {
      // `[:,\n]` rather than `:` alone: the registry map is written with
      // shorthand properties, so requiring a colon collected nothing there.
      const key = /^\n\s*'?([A-Za-z][\w-]*)'?\s*(?:[:,]|\n)/.exec(source.slice(i, i + 80));
      if (key) keys.push(key[1]);
    }
  }
  assert.fail(`unterminated object literal for ${declaration} in ${file}`);
}

function walk(dir, files = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === '.next') continue;
      walk(full, files);
    } else if (/\.tsx?$/.test(entry.name)) {
      files.push(full);
    }
  }
  return files;
}

test('PrimitiveCategory is exactly the six governed categories', () => {
  const registry = readFileSync(REGISTRY, 'utf8');
  const start = registry.indexOf('export type PrimitiveCategory =');
  assert.ok(start !== -1, 'PrimitiveCategory union not found');
  const union = registry.slice(start, registry.indexOf(';', start));
  const members = [...union.matchAll(/'([a-z-]+)'/g)].map((match) => match[1]);
  assert.deepEqual(
    [...members].sort(),
    GOVERNED,
    'the category union changed; a seventh category needs adjudication, not a new union member',
  );
});

test('every PrimitiveCategory map declares exactly the six governed categories', () => {
  for (const [file, declaration] of CATEGORY_MAPS) {
    const source = readFileSync(path.join(SHOWROOM_ROOT, file), 'utf8');
    const keys = objectLiteralKeys(source, declaration, file);
    assert.deepEqual(
      [...keys].sort(),
      GOVERNED,
      `${declaration} in ${file} does not key exactly the six governed categories`,
    );
  }
});

test('the enumerated roster is every PrimitiveCategory map in the tree', () => {
  // Without this, the list above is just another hand-assembled set -- which is
  // exactly how two of the seven maps were missed the first time.
  const found = [];
  for (const file of walk(path.join(SHOWROOM_ROOT, 'src'))) {
    const source = readFileSync(file, 'utf8');
    for (const match of source.matchAll(
      /(?:const|let|var)\s+(\w+)\s*:\s*Record<\s*PrimitiveCategory/g,
    )) {
      found.push([path.relative(SHOWROOM_ROOT, file), match[1]]);
    }
  }
  assert.ok(found.length > 0, 'the tree walk found no maps at all; the scan is wrong');
  assert.deepEqual(
    found.map((entry) => entry.join(' :: ')).sort(),
    CATEGORY_MAPS.map((entry) => entry.join(' :: ')).sort(),
    'a Record<PrimitiveCategory, ...> exists that this drill does not enumerate',
  );
});

test('the five relocated primitives are filed by what they render', () => {
  const registry = readFileSync(REGISTRY, 'utf8');
  const entries = new Map(
    [...registry.matchAll(/\{\s*slug:\s*'([a-z0-9-]+)',[^}]*?category:\s*'([a-z]+)'/g)].map(
      (match) => [match[1], match[2]],
    ),
  );
  for (const [slug, category] of Object.entries(RELOCATED)) {
    assert.equal(
      entries.get(slug),
      category,
      `${slug} should be registered under ${category}`,
    );
  }
});

test('navigation routes every primitive to its registered category', () => {
  // A relocated primitive whose sidebar path still carries the old category
  // renders a 404, so the registry move has to reach navigation too.
  const registry = readFileSync(REGISTRY, 'utf8');
  const entries = [
    ...registry.matchAll(/\{\s*slug:\s*'([a-z0-9-]+)',[^}]*?category:\s*'([a-z]+)'/g),
  ].map((match) => ({ slug: match[1], category: match[2] }));
  assert.ok(entries.length > 50, `parsed only ${entries.length} primitives; the scan is wrong`);

  const navigation = readFileSync(NAVIGATION, 'utf8');
  const routes = new Map(
    [...navigation.matchAll(/path:\s*'\/primitives\/([a-z]+)\/([a-z0-9-]+)'/g)].map((match) => [
      match[2],
      match[1],
    ]),
  );

  const mismatched = entries
    .filter((entry) => routes.has(entry.slug) && routes.get(entry.slug) !== entry.category)
    .map((entry) => `${entry.slug}: nav=${routes.get(entry.slug)} registry=${entry.category}`);
  assert.deepEqual(mismatched, [], 'sidebar path and registered category disagree');

  const missing = entries.filter((entry) => !routes.has(entry.slug)).map((entry) => entry.slug);
  assert.deepEqual(missing, [], 'registered primitive with no sidebar route');
});

test('no documented tier path names a folder that does not exist', () => {
  // The architecture page shipped four paths under a top-level `composition/`
  // owner that is forbidden and absent, one of them naming `foundation/` as a
  // tier segment. Nothing checked them, so they read as authoritative.
  const source = readFileSync(ARCHITECTURE, 'utf8');
  const start = source.indexOf('const TIERS = [');
  assert.ok(start !== -1, 'TIERS not found');
  const tiers = source.slice(start, source.indexOf('] as const;', start));
  const paths = [...tiers.matchAll(/path:\s*'([^']+)'/g)].map((match) => match[1]);
  assert.equal(paths.length, 4, `expected 4 tier paths, parsed ${paths.length}`);

  for (const tierPath of paths) {
    assert.ok(
      existsSync(path.join(REPO_ROOT, tierPath)),
      `documented tier path does not exist: ${tierPath}`,
    );
  }
});
