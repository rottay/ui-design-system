import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SHOWROOM_ROOT = path.resolve(HERE, '../..');
const R6 = path.join(SHOWROOM_ROOT, 'src/app/probe/ds-reference/sections/r6-surfaces');

/** Each module returns null for slugs it does not own, so an unowned slug would
 *  capture nine BLANK frames and count them as passing shots. */

function slugArray(file, exportName) {
  const source = readFileSync(path.join(R6, file), 'utf8');
  const start = source.indexOf(exportName);
  assert.ok(start !== -1, `${exportName} not found in ${file}`);
  const block = source.slice(start, source.indexOf('];', start));
  return [...block.matchAll(/'([a-z0-9-]+)'/g)].map((m) => m[1]);
}

const ROSTER = slugArray('cases.ts', 'R6_CASES');
const MODULES = [
  ['config-a.tsx', 'CONFIG_A_SLUGS'],
  ['config-b.tsx', 'CONFIG_B_SLUGS'],
  ['config-inherited-a.tsx', 'CONFIG_INHERITED_A_SLUGS'],
  ['config-inherited-b.tsx', 'CONFIG_INHERITED_B_SLUGS'],
];

test('the roster is the expected 36 families', () => {
  assert.equal(ROSTER.length, 36);
  assert.equal(new Set(ROSTER).size, 36, 'roster has a duplicate slug');
});

test('the four fixture modules exactly partition the roster', () => {
  const owned = [];
  for (const [file, exportName] of MODULES) owned.push(...slugArray(file, exportName));

  const duplicates = owned.filter((slug, i) => owned.indexOf(slug) !== i);
  assert.deepEqual(duplicates, [], 'a slug is owned by more than one module');

  const unowned = ROSTER.filter((slug) => !owned.includes(slug));
  assert.deepEqual(unowned, [], 'a roster slug has no fixture module — it would capture blank');

  const orphaned = owned.filter((slug) => !ROSTER.includes(slug));
  assert.deepEqual(orphaned, [], 'a module owns a slug the route would 404');

  assert.equal(owned.length, ROSTER.length);
});

test('the dispatcher actually renders every fixture module', () => {
  const dispatcher = readFileSync(path.join(R6, 'index.tsx'), 'utf8');
  for (const [file] of MODULES) {
    const moduleName = file.replace(/\.tsx$/, '');
    assert.ok(
      dispatcher.includes(`./${moduleName}`),
      `${moduleName} is never imported — every slug it owns would render blank`,
    );
  }
  const rendered = [...dispatcher.matchAll(/<(Config[A-Za-z]*Surface)\b/g)].map((m) => m[1]);
  assert.equal(
    rendered.length,
    MODULES.length,
    `expected ${MODULES.length} fixture modules rendered, saw ${rendered.join(', ')}`,
  );
});

// Negative drill: the partition check must reject the shapes it exists to catch.
test('the partition check rejects an unowned or doubly-owned slug', () => {
  const roster = ['a', 'b', 'c'];
  const missingOne = ['a', 'b'];
  assert.throws(
    () => assert.deepEqual(roster.filter((s) => !missingOne.includes(s)), []),
    /AssertionError/,
    'an unowned slug must fail',
  );
  const doubled = ['a', 'b', 'b'];
  assert.throws(
    () => assert.deepEqual(doubled.filter((s, i) => doubled.indexOf(s) !== i), []),
    /AssertionError/,
    'a doubly-owned slug must fail',
  );
});
