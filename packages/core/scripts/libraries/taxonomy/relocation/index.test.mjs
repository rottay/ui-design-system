/**
 * Drills for the source-owner relocation adapter.
 *
 * The adapter's value is entirely in what it refuses. A version that returned
 * a partial map, or preferred the first claimant of a contested directory,
 * would satisfy every consumer while reporting a tree in which nothing is
 * owned -- the silent answer this module exists to replace. So every refusal
 * path is drilled directly, and the multi-rejection drill proves the whole
 * list reaches the caller rather than the first entry.
 *
 * The shipped override table gets its own drills because a closed table is
 * only trustworthy while it still describes the tree. The real-data drills
 * run it against the 255-row inventory and require all hundred-and-one entries to
 * be consumed; the mutation drills then damage one field at a time and
 * require the named rejection. An entry that has quietly stopped being needed
 * fails as `unused` rather than being carried forever.
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
  DEFAULT_FROM_PREFIX,
  DEFAULT_TO_PREFIX,
  OWNER_RELOCATION_OVERRIDES,
  RelocationError,
  caseExactDirExists,
  relocateSourceOwners,
} from './index.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = findRepoRoot(HERE);
const INVENTORY_FILE = path.join(
  REPO_ROOT,
  'packages/core/scripts/quality-evidence/programs/modern-rescue/family-inventory.json',
);

const FROM = DEFAULT_FROM_PREFIX;
const TO = DEFAULT_TO_PREFIX;
const existsExact = (candidate) => caseExactDirExists(candidate);

/** Builds a throwaway repository root containing exactly `directories`. */
function makeTree(directories) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'taxonomy-relocation-'));
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

test('a swap target differing only in case rejects as missing, never case-folds', () => {
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
  const rows = [{ id: 'primitive/display/badge', sourceOwner: `${FROM}primitives/display/Badge` }];

  const error = rejectionsFrom(() =>
    relocateSourceOwners(rows, {
      repoRoot: path.join(path.sep, 'repo'),
      overrides: [],
      exists: (candidate) => caseExactDirExists(candidate, { readdir }),
    }),
  );
  assert.deepEqual(reasonsById(error), ['primitive/display/badge:missing']);

  // With its declared triple the same row resolves, on the real spelling only.
  const resolved = relocateSourceOwners(rows, {
    repoRoot: path.join(path.sep, 'repo'),
    overrides: [
      {
        id: 'primitive/display/badge',
        sourceOwner: `${FROM}primitives/display/Badge`,
        destination: `${TO}primitives/display/badge`,
      },
    ],
    exists: (candidate) => caseExactDirExists(candidate, { readdir }),
  });
  assert.equal(
    resolved.get('primitive/display/badge'),
    path.join(path.sep, 'repo', TO, 'primitives/display/badge') + path.sep,
  );
});

test('rows under the old prefix resolve to the swapped directory', () => {
  const root = makeTree([`${TO}primitives/inputs/Button`]);
  const resolved = relocateSourceOwners(
    [{ id: 'primitive/inputs/button', sourceOwner: `${FROM}primitives/inputs/Button` }],
    { repoRoot: root, overrides: [] },
  );

  assert.equal(resolved.size, 1);
  assert.equal(
    resolved.get('primitive/inputs/button'),
    path.join(root, TO, 'primitives/inputs/Button') + path.sep,
  );
});

test('rows already under the new prefix pass through unchanged', () => {
  const root = makeTree([`${TO}patterns/data/DataTable`]);
  const resolved = relocateSourceOwners(
    [{ id: 'pattern/data/data-table', sourceOwner: `${TO}patterns/data/DataTable` }],
    { repoRoot: root, overrides: [] },
  );

  assert.equal(
    resolved.get('pattern/data/data-table'),
    path.join(root, TO, 'patterns/data/DataTable') + path.sep,
  );
});

test('a row outside both prefixes is taken as written', () => {
  const root = makeTree(['packages/core/src/graphics/icons/Icon']);
  const resolved = relocateSourceOwners(
    [{ id: 'graphics/icon', sourceOwner: 'packages/core/src/graphics/icons/Icon' }],
    { repoRoot: root, overrides: [] },
  );

  assert.equal(
    resolved.get('graphics/icon'),
    path.join(root, 'packages/core/src/graphics/icons/Icon') + path.sep,
  );
});

test('an override lands its row on the exact destination when the swap target is absent', () => {
  const root = makeTree([`${TO}primitives/display/code-block`]);
  const resolved = relocateSourceOwners(
    [{ id: 'primitive/display/code-block', sourceOwner: `${FROM}primitives/display/CodeBlock` }],
    {
      repoRoot: root,
      overrides: [
        {
          id: 'primitive/display/code-block',
          sourceOwner: `${FROM}primitives/display/CodeBlock`,
          destination: `${TO}primitives/display/code-block`,
        },
      ],
    },
  );

  assert.equal(
    resolved.get('primitive/display/code-block'),
    path.join(root, TO, 'primitives/display/code-block') + path.sep,
  );
});

test('a target that does not exist is rejected as missing, naming the row', () => {
  const root = makeTree([`${TO}primitives/inputs/Button`]);
  const error = rejectionsFrom(
    () =>
      relocateSourceOwners(
        [{ id: 'primitive/display/code-block', sourceOwner: `${FROM}primitives/display/CodeBlock` }],
        { repoRoot: root, overrides: [] },
      ),
  );

  assert.deepEqual(error.rejections, [
    {
      id: 'primitive/display/code-block',
      sourceOwner: `${FROM}primitives/display/CodeBlock`,
      reason: 'missing',
    },
  ]);
  assert.match(error.message, /primitive\/display\/code-block/u);
});

test('an owner present under both prefixes is rejected as ambiguous', () => {
  const root = makeTree([`${FROM}primitives/inputs/Button`, `${TO}primitives/inputs/Button`]);
  const error = rejectionsFrom(
    () =>
      relocateSourceOwners(
        [{ id: 'primitive/inputs/button', sourceOwner: `${FROM}primitives/inputs/Button` }],
        { repoRoot: root, overrides: [] },
      ),
  );

  assert.equal(error.rejections[0].reason, 'ambiguous');
});

test('ambiguity is symmetric: a row written under the new prefix sees its old twin', () => {
  const root = makeTree([`${FROM}primitives/inputs/Button`, `${TO}primitives/inputs/Button`]);
  const error = rejectionsFrom(
    () =>
      relocateSourceOwners(
        [{ id: 'primitive/inputs/button', sourceOwner: `${TO}primitives/inputs/Button` }],
        { repoRoot: root, overrides: [] },
      ),
  );

  assert.equal(error.rejections[0].reason, 'ambiguous');
});

test('two rows landing on one directory reject both, and neither is mapped', () => {
  const root = makeTree([`${TO}primitives/inputs/Button`]);
  const error = rejectionsFrom(
    () =>
      relocateSourceOwners(
        [
          { id: 'primitive/inputs/button', sourceOwner: `${FROM}primitives/inputs/Button` },
          { id: 'primitive/action/button', sourceOwner: `${TO}primitives/inputs/Button` },
        ],
        { repoRoot: root, overrides: [] },
      ),
  );

  assert.deepEqual(reasonsById(error), [
    'primitive/inputs/button:colliding',
    'primitive/action/button:colliding',
  ]);
});

test('an override entry binding no row is rejected as unknown', () => {
  const root = makeTree([`${TO}primitives/inputs/Button`]);
  const error = rejectionsFrom(
    () =>
      relocateSourceOwners(
        [{ id: 'primitive/inputs/button', sourceOwner: `${FROM}primitives/inputs/Button` }],
        {
          repoRoot: root,
          overrides: [
            { id: 'primitive/gone/away', sourceOwner: `${FROM}a`, destination: `${TO}b` },
          ],
        },
      ),
  );

  assert.deepEqual(reasonsById(error), ['primitive/gone/away:unknown']);
});

test('two entries binding one row are both rejected as duplicate', () => {
  const root = makeTree([`${TO}primitives/display/code-block`]);
  const entry = {
    id: 'primitive/display/code-block',
    sourceOwner: `${FROM}primitives/display/CodeBlock`,
    destination: `${TO}primitives/display/code-block`,
  };
  const error = rejectionsFrom(
    () =>
      relocateSourceOwners(
        [{ id: entry.id, sourceOwner: entry.sourceOwner }],
        { repoRoot: root, overrides: [entry, { ...entry }] },
      ),
  );

  assert.deepEqual(reasonsById(error), [
    'primitive/display/code-block:duplicate',
    'primitive/display/code-block:duplicate',
  ]);
});

test('an entry recording a different historical path is rejected as mismatch', () => {
  const root = makeTree([`${TO}primitives/display/code-block`]);
  const error = rejectionsFrom(
    () =>
      relocateSourceOwners(
        [{ id: 'primitive/display/code-block', sourceOwner: `${FROM}primitives/display/CodeBlock` }],
        {
          repoRoot: root,
          overrides: [
            {
              id: 'primitive/display/code-block',
              sourceOwner: `${FROM}primitives/display/CodeBlocks`,
              destination: `${TO}primitives/display/code-block`,
            },
          ],
        },
      ),
  );

  assert.deepEqual(reasonsById(error), ['primitive/display/code-block:mismatch']);
});

test('an entry whose row already resolves by prefix swap is rejected as unused', () => {
  const root = makeTree([
    `${TO}primitives/display/CodeBlock`,
    `${TO}primitives/display/code-block`,
  ]);
  const error = rejectionsFrom(
    () =>
      relocateSourceOwners(
        [{ id: 'primitive/display/code-block', sourceOwner: `${FROM}primitives/display/CodeBlock` }],
        {
          repoRoot: root,
          overrides: [
            {
              id: 'primitive/display/code-block',
              sourceOwner: `${FROM}primitives/display/CodeBlock`,
              destination: `${TO}primitives/display/code-block`,
            },
          ],
        },
      ),
  );

  assert.deepEqual(reasonsById(error), ['primitive/display/code-block:unused']);
});

test('every rejection is reported in one error, not just the first', () => {
  const root = makeTree([
    `${TO}primitives/inputs/Button`,
    `${FROM}primitives/layout/Box`,
    `${TO}primitives/layout/Box`,
  ]);
  const error = rejectionsFrom(
    () =>
      relocateSourceOwners(
        [
          { id: 'primitive/display/code-block', sourceOwner: `${FROM}primitives/display/CodeBlock` },
          { id: 'primitive/layout/box', sourceOwner: `${FROM}primitives/layout/Box` },
          { id: 'primitive/inputs/button', sourceOwner: `${FROM}primitives/inputs/Button` },
          { id: 'primitive/action/button', sourceOwner: `${TO}primitives/inputs/Button` },
        ],
        {
          repoRoot: root,
          overrides: [{ id: 'primitive/nope', sourceOwner: `${FROM}x`, destination: `${TO}x` }],
        },
      ),
  );

  assert.deepEqual(reasonsById(error), [
    'primitive/nope:unknown',
    'primitive/display/code-block:missing',
    'primitive/layout/box:ambiguous',
    'primitive/inputs/button:colliding',
    'primitive/action/button:colliding',
  ]);
});

test('resolved directories carry a trailing separator so a sibling cannot be claimed', () => {
  const root = makeTree([`${TO}primitives/display/Card`, `${TO}primitives/display/CardGrid`]);
  const resolved = relocateSourceOwners(
    [
      { id: 'primitive/display/card', sourceOwner: `${FROM}primitives/display/Card` },
      { id: 'primitive/display/card-grid', sourceOwner: `${FROM}primitives/display/CardGrid` },
    ],
    { repoRoot: root, overrides: [] },
  );

  const card = resolved.get('primitive/display/card');
  const cardGridFile = path.join(root, TO, 'primitives/display/CardGrid', 'index.tsx');

  assert.ok(card.endsWith(path.sep));
  assert.equal(cardGridFile.startsWith(card), false);
  assert.equal(cardGridFile.startsWith(resolved.get('primitive/display/card-grid')), true);
});

test('the exists seam is honoured, so drills need no filesystem', () => {
  const present = new Set([path.resolve('/repo', TO, 'primitives/inputs/Button')]);
  const resolved = relocateSourceOwners(
    [{ id: 'primitive/inputs/button', sourceOwner: `${FROM}primitives/inputs/Button` }],
    { repoRoot: '/repo', overrides: [], exists: (candidate) => present.has(candidate) },
  );

  assert.equal(
    resolved.get('primitive/inputs/button'),
    path.resolve('/repo', TO, 'primitives/inputs/Button') + path.sep,
  );
});

test('an absent repoRoot fails closed rather than resolving against the process directory', () => {
  assert.throws(
    () => relocateSourceOwners([{ id: 'a', sourceOwner: `${FROM}a` }], {}),
    TypeError,
  );
});

test('the shipped override table is a closed set of well-formed triples', () => {
  assert.equal(OWNER_RELOCATION_OVERRIDES.length, 101);

  const ids = OWNER_RELOCATION_OVERRIDES.map((entry) => entry.id);
  assert.equal(new Set(ids).size, ids.length, 'override ids must be unique');

  const destinations = OWNER_RELOCATION_OVERRIDES.map((entry) => entry.destination);
  assert.equal(new Set(destinations).size, destinations.length, 'destinations must be unique');

  for (const entry of OWNER_RELOCATION_OVERRIDES) {
    assert.ok(entry.sourceOwner.startsWith(FROM), `${entry.id} historical path`);
    assert.ok(entry.destination.startsWith(TO), `${entry.id} destination`);
  }
});

test('the real inventory resolves completely, consuming every override', () => {
  const rows = inventoryRows();
  assert.equal(rows.length, 255);

  const resolved = relocateSourceOwners(rows, { repoRoot: REPO_ROOT });
  assert.equal(resolved.size, rows.length, 'every row must resolve');

  // Each override must be the reason its row resolved: the destination is
  // where the row landed, and the literal swap target is absent.
  for (const entry of OWNER_RELOCATION_OVERRIDES) {
    assert.equal(
      resolved.get(entry.id),
      path.resolve(REPO_ROOT, entry.destination) + path.sep,
      `${entry.id} must land on its override destination`,
    );
    // Case-exact, like the adapter: `fs.existsSync` would answer yes for a
    // re-cased directory and hide exactly the rows these entries exist for.
    const swap = TO + entry.sourceOwner.slice(FROM.length);
    assert.equal(existsExact(path.resolve(REPO_ROOT, swap)), false, `${entry.id} swap target must be absent`);
  }
});

test('RED: a mutated override id no longer binds its row', () => {
  const rows = inventoryRows();
  const overrides = OWNER_RELOCATION_OVERRIDES.map((entry, index) =>
    index === 0 ? { ...entry, id: `${entry.id}-mutated` } : entry,
  );
  const error = rejectionsFrom(
    () => relocateSourceOwners(rows, { repoRoot: REPO_ROOT, overrides }),
  );

  const reasons = reasonsById(error);
  assert.ok(reasons.includes(`${OWNER_RELOCATION_OVERRIDES[0].id}-mutated:unknown`));
  assert.ok(reasons.includes(`${OWNER_RELOCATION_OVERRIDES[0].id}:missing`));
});

test('RED: a mutated historical sourceOwner is rejected as mismatch', () => {
  const rows = inventoryRows();
  const overrides = OWNER_RELOCATION_OVERRIDES.map((entry, index) =>
    index === 0 ? { ...entry, sourceOwner: `${entry.sourceOwner}X` } : entry,
  );
  const error = rejectionsFrom(
    () => relocateSourceOwners(rows, { repoRoot: REPO_ROOT, overrides }),
  );

  assert.ok(reasonsById(error).includes(`${OWNER_RELOCATION_OVERRIDES[0].id}:mismatch`));
});

test('RED: a mutated destination points at nothing and rejects as missing', () => {
  const rows = inventoryRows();
  const overrides = OWNER_RELOCATION_OVERRIDES.map((entry, index) =>
    index === 0 ? { ...entry, destination: `${entry.destination}-gone` } : entry,
  );
  const error = rejectionsFrom(
    () => relocateSourceOwners(rows, { repoRoot: REPO_ROOT, overrides }),
  );

  assert.deepEqual(reasonsById(error), [`${OWNER_RELOCATION_OVERRIDES[0].id}:missing`]);
});

test('RED: an extra entry for a row that already swaps cleanly is rejected as unused', () => {
  const rows = inventoryRows();
  const plain = rows.find(
    (row) =>
      row.sourceOwner.startsWith(FROM) &&
      !OWNER_RELOCATION_OVERRIDES.some((entry) => entry.id === row.id),
  );
  const overrides = [
    ...OWNER_RELOCATION_OVERRIDES,
    {
      id: plain.id,
      sourceOwner: plain.sourceOwner,
      destination: TO + plain.sourceOwner.slice(FROM.length),
    },
  ];
  const error = rejectionsFrom(
    () => relocateSourceOwners(rows, { repoRoot: REPO_ROOT, overrides }),
  );

  assert.deepEqual(reasonsById(error), [`${plain.id}:unused`]);
});

test('RED: two overrides pointing at one directory collide', () => {
  const rows = inventoryRows();
  const [first, second] = OWNER_RELOCATION_OVERRIDES;
  const overrides = OWNER_RELOCATION_OVERRIDES.map((entry) =>
    entry.id === second.id ? { ...entry, destination: first.destination } : entry,
  );
  const error = rejectionsFrom(
    () => relocateSourceOwners(rows, { repoRoot: REPO_ROOT, overrides }),
  );

  assert.deepEqual(reasonsById(error).sort(), [`${first.id}:colliding`, `${second.id}:colliding`].sort());
});
