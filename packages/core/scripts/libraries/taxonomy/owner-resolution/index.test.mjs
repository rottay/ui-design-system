/**
 * Drills for the source-owner resolver.
 *
 * The resolver's value is entirely in what it refuses. A version that returned
 * a partial map, or preferred the first claimant of a contested directory,
 * would satisfy every consumer while reporting a tree in which nothing is
 * owned -- the silent answer this module exists to replace. So every refusal
 * path is drilled directly, and the multi-rejection drill proves the whole
 * list reaches the caller rather than the first entry.
 *
 * The real-data drill runs the resolver against the 255-row inventory and
 * requires every row to land on its own recorded `sourceOwner`.
 *
 * Synthetic fixtures are real directories under `os.tmpdir()` so the default
 * `fs.existsSync` path is exercised, plus one injected `exists` proving the
 * seam stays usable without a filesystem at all.
 */

import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

import { repoRoot as findRepoRoot } from '../../repo-root/index.mjs';
import {
  RelocationError,
  caseExactDirExists,
  relocateSourceOwners,
} from './index.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = findRepoRoot(HERE);
const INVENTORY_FILE = path.join(
  REPO_ROOT,
  'packages/core/scripts/check/modern-rescue/family-inventory/index.json',
);

const COMPONENTS = 'packages/core/src/components/';

/** Builds a throwaway repository root containing exactly `directories`. */
function makeTree(directories) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'taxonomy-owner-resolution-'));
  for (const relative of directories) {
    fs.mkdirSync(path.join(root, relative), { recursive: true });
  }
  return root;
}

/** The real inventory rows, read fresh so a drill cannot mutate shared state. */
function inventoryRows() {
  return JSON.parse(fs.readFileSync(INVENTORY_FILE, 'utf8')).rows;
}

/** Runs `run`, requires a RelocationError, and hands it back for inspection. */
function rejectionsFrom(run) {
  try {
    run();
  } catch (error) {
    assert.ok(error instanceof RelocationError, `expected RelocationError, got ${error?.name}`);
    return error;
  }
  return assert.fail('expected relocateSourceOwners to throw');
}

function reasonsById(error) {
  return error.rejections.map((rejection) => `${rejection.id}:${rejection.reason}`);
}

/** A readdir over a fixture map, so predicate drills touch no filesystem. */
function fixtureReaddir(tree) {
  return (dir) => {
    const names = tree[dir];
    if (!names) throw new Error(`ENOENT ${dir}`);
    return names;
  };
}

test('the case-exact predicate refuses a leaf whose only difference is case', () => {
  const readdir = fixtureReaddir({
    [path.sep]: ['repo'],
    [path.join(path.sep, 'repo')]: ['display'],
    [path.join(path.sep, 'repo', 'display')]: ['CodeBlock'],
  });

  assert.equal(caseExactDirExists(path.join(path.sep, 'repo', 'display', 'CodeBlock'), { readdir }), true);
  assert.equal(caseExactDirExists(path.join(path.sep, 'repo', 'display', 'code-block'), { readdir }), false);
  assert.equal(caseExactDirExists(path.join(path.sep, 'repo', 'display', 'codeblock'), { readdir }), false);
});

test('the case-exact predicate refuses a mid-path segment whose case is wrong', () => {
  const readdir = fixtureReaddir({
    [path.sep]: ['repo'],
    [path.join(path.sep, 'repo')]: ['Display'],
    [path.join(path.sep, 'repo', 'Display')]: ['card'],
  });

  assert.equal(caseExactDirExists(path.join(path.sep, 'repo', 'Display', 'card'), { readdir }), true);
  // Leaf spelled correctly, parent is not: still false.
  assert.equal(caseExactDirExists(path.join(path.sep, 'repo', 'display', 'card'), { readdir }), false);
});

test('a recorded spelling differing only in case rejects as missing, never case-folds', () => {
  // The real directory is lowercase; the row records the PascalCase spelling.
  const readdir = fixtureReaddir({
    [path.sep]: ['repo'],
    [path.join(path.sep, 'repo')]: ['packages'],
    [path.join(path.sep, 'repo', 'packages')]: ['core'],
    [path.join(path.sep, 'repo', 'packages', 'core')]: ['src'],
    [path.join(path.sep, 'repo', 'packages', 'core', 'src')]: ['components'],
    [path.join(path.sep, 'repo', 'packages', 'core', 'src', 'components')]: ['primitives'],
    [path.join(path.sep, 'repo', 'packages', 'core', 'src', 'components', 'primitives')]: ['display'],
    [path.join(path.sep, 'repo', 'packages', 'core', 'src', 'components', 'primitives', 'display')]: ['badge'],
  });
  const rows = [{ id: 'primitive/display/badge', sourceOwner: `${COMPONENTS}primitives/display/Badge` }];

  const error = rejectionsFrom(() =>
    relocateSourceOwners(rows, {
      repoRoot: path.join(path.sep, 'repo'),
      exists: (candidate) => caseExactDirExists(candidate, { readdir }),
    }),
  );
  assert.deepEqual(reasonsById(error), ['primitive/display/badge:missing']);
});

test('a row resolves to its recorded directory', () => {
  const root = makeTree([`${COMPONENTS}patterns/data/DataTable`]);
  const resolved = relocateSourceOwners(
    [{ id: 'pattern/data/data-table', sourceOwner: `${COMPONENTS}patterns/data/DataTable` }],
    { repoRoot: root },
  );

  assert.equal(
    resolved.get('pattern/data/data-table'),
    path.join(root, COMPONENTS, 'patterns/data/DataTable') + path.sep,
  );
});

test('a row outside the component root is taken as written', () => {
  const root = makeTree(['packages/core/src/graphics/icons/Icon']);
  const resolved = relocateSourceOwners(
    [{ id: 'graphics/icon', sourceOwner: 'packages/core/src/graphics/icons/Icon' }],
    { repoRoot: root },
  );

  assert.equal(
    resolved.get('graphics/icon'),
    path.join(root, 'packages/core/src/graphics/icons/Icon') + path.sep,
  );
});

test('a target that does not exist is rejected as missing, naming the row', () => {
  const root = makeTree([`${COMPONENTS}primitives/inputs/Button`]);
  const error = rejectionsFrom(
    () =>
      relocateSourceOwners(
        [{ id: 'primitive/display/code-block', sourceOwner: `${COMPONENTS}primitives/display/CodeBlock` }],
        { repoRoot: root },
      ),
  );

  assert.deepEqual(error.rejections, [
    {
      id: 'primitive/display/code-block',
      sourceOwner: `${COMPONENTS}primitives/display/CodeBlock`,
      reason: 'missing',
    },
  ]);
  assert.match(error.message, /primitive\/display\/code-block/u);
});

test('two rows claiming one directory reject both, and neither is mapped', () => {
  const root = makeTree([`${COMPONENTS}primitives/inputs/Button`]);
  const error = rejectionsFrom(
    () =>
      relocateSourceOwners(
        [
          { id: 'primitive/inputs/button', sourceOwner: `${COMPONENTS}primitives/inputs/Button` },
          { id: 'primitive/action/button', sourceOwner: `${COMPONENTS}primitives/inputs/Button` },
        ],
        { repoRoot: root },
      ),
  );

  assert.deepEqual(reasonsById(error), [
    'primitive/inputs/button:colliding',
    'primitive/action/button:colliding',
  ]);
});

test('every rejection is reported in one error, not just the first', () => {
  const root = makeTree([`${COMPONENTS}primitives/inputs/Button`]);
  const error = rejectionsFrom(
    () =>
      relocateSourceOwners(
        [
          { id: 'primitive/display/code-block', sourceOwner: `${COMPONENTS}primitives/display/CodeBlock` },
          { id: 'primitive/inputs/button', sourceOwner: `${COMPONENTS}primitives/inputs/Button` },
          { id: 'primitive/action/button', sourceOwner: `${COMPONENTS}primitives/inputs/Button` },
        ],
        { repoRoot: root },
      ),
  );

  assert.deepEqual(reasonsById(error), [
    'primitive/display/code-block:missing',
    'primitive/inputs/button:colliding',
    'primitive/action/button:colliding',
  ]);
});

test('resolved directories carry a trailing separator so a sibling cannot be claimed', () => {
  const root = makeTree([`${COMPONENTS}primitives/display/Card`, `${COMPONENTS}primitives/display/CardGrid`]);
  const resolved = relocateSourceOwners(
    [
      { id: 'primitive/display/card', sourceOwner: `${COMPONENTS}primitives/display/Card` },
      { id: 'primitive/display/card-grid', sourceOwner: `${COMPONENTS}primitives/display/CardGrid` },
    ],
    { repoRoot: root },
  );

  const card = resolved.get('primitive/display/card');
  const cardGridFile = path.join(root, COMPONENTS, 'primitives/display/CardGrid', 'index.tsx');

  assert.ok(card.endsWith(path.sep));
  assert.equal(cardGridFile.startsWith(card), false);
  assert.equal(cardGridFile.startsWith(resolved.get('primitive/display/card-grid')), true);
});

test('the exists seam is honoured, so drills need no filesystem', () => {
  const present = new Set([path.resolve('/repo', COMPONENTS, 'primitives/inputs/Button')]);
  const resolved = relocateSourceOwners(
    [{ id: 'primitive/inputs/button', sourceOwner: `${COMPONENTS}primitives/inputs/Button` }],
    { repoRoot: '/repo', exists: (candidate) => present.has(candidate) },
  );

  assert.equal(
    resolved.get('primitive/inputs/button'),
    path.resolve('/repo', COMPONENTS, 'primitives/inputs/Button') + path.sep,
  );
});

test('an absent repoRoot fails closed rather than resolving against the process directory', () => {
  assert.throws(
    () => relocateSourceOwners([{ id: 'a', sourceOwner: `${COMPONENTS}a` }], {}),
    TypeError,
  );
});

test('the real inventory resolves completely, every row landing on its own sourceOwner', () => {
  const rows = inventoryRows();
  assert.equal(rows.length, 255);

  const resolved = relocateSourceOwners(rows, { repoRoot: REPO_ROOT });
  assert.equal(resolved.size, rows.length, 'every row must resolve');
  for (const row of rows) {
    assert.equal(
      resolved.get(row.id),
      path.resolve(REPO_ROOT, row.sourceOwner) + path.sep,
      `${row.id} must land on its own sourceOwner`,
    );
  }
});
