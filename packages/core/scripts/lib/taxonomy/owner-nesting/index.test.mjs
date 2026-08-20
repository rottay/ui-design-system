// Self-test for owner-nesting.mjs (ancestor/descendant sourceOwner detector).
//
// Hermetic: drills the pure `findNestedOwners` with synthetic row arrays, no
// filesystem or real inventory dependency. Two load-bearing fixtures: a CLEAN
// one (no row's sourceOwner nests inside another's) that must report zero
// violations, and a PLANTED one -- modeled on the real
// structure/workspace/connected-command-palette vs
// structure/workspace/search-command-bar defect this check was written to
// catch (Modern Rescue lane 2) -- that MUST be reported. A check that only
// ever returns [] is not evidence it can detect anything.

import assert from 'node:assert/strict';
import test from 'node:test';

import { findNestedOwners } from './index.mjs';

const CLEAN_ROWS = [
  {
    id: 'structure/workspace/connected-command-palette',
    sourceOwner: 'packages/core/src/ui/structures/workspace/connected-command-palette',
  },
  {
    id: 'structure/workspace/search-command-bar',
    sourceOwner: 'packages/core/src/ui/structures/workspace/search-command-bar',
  },
  {
    id: 'structure/workspace/table-toolbar',
    sourceOwner: 'packages/core/src/ui/structures/workspace/table-toolbar',
  },
  {
    id: 'primitive/display/avatar',
    sourceOwner: 'packages/core/src/ui/primitives/display/Avatar',
  },
];

const PLANTED_NESTED_ROWS = [
  {
    id: 'structure/workspace/connected-command-palette',
    sourceOwner: 'packages/core/src/ui/structures/workspace/connected-command-palette',
  },
  // Planted defect: this row's folder sits inside the row above's folder --
  // the exact real-world shape this check exists to catch.
  {
    id: 'structure/workspace/search-command-bar',
    sourceOwner: 'packages/core/src/ui/structures/workspace/connected-command-palette/search-command-bar',
  },
  {
    id: 'structure/workspace/table-toolbar',
    sourceOwner: 'packages/core/src/ui/structures/workspace/table-toolbar',
  },
];

test('clean fixture: no sourceOwner nests inside another -- zero violations', () => {
  assert.deepEqual(findNestedOwners(CLEAN_ROWS), []);
});

test('planted negative: a deliberately nested sourceOwner is caught', () => {
  const violations = findNestedOwners(PLANTED_NESTED_ROWS);
  assert.equal(violations.length, 1);
  assert.deepEqual(violations[0], {
    outerId: 'structure/workspace/connected-command-palette',
    outerOwner: 'packages/core/src/ui/structures/workspace/connected-command-palette',
    innerId: 'structure/workspace/search-command-bar',
    innerOwner: 'packages/core/src/ui/structures/workspace/connected-command-palette/search-command-bar',
  });
});

test('segment-boundary aware: a textual prefix that is not a path-segment ancestor is not a violation', () => {
  const rows = [
    { id: 'a', sourceOwner: 'packages/core/src/ui/structures/workspace/table' },
    { id: 'b', sourceOwner: 'packages/core/src/ui/structures/workspace/table-toolbar' },
  ];
  assert.deepEqual(findNestedOwners(rows), []);
});

test('rows sharing the exact same sourceOwner are not reported as nesting (a different defect)', () => {
  const rows = [
    { id: 'a', sourceOwner: 'packages/core/src/ui/structures/workspace/table-toolbar' },
    { id: 'b', sourceOwner: 'packages/core/src/ui/structures/workspace/table-toolbar' },
  ];
  assert.deepEqual(findNestedOwners(rows), []);
});

test('rows missing a sourceOwner are ignored rather than crashing the check', () => {
  const rows = [
    { id: 'a' },
    { id: 'b', sourceOwner: 'packages/core/src/ui/structures/workspace/table-toolbar' },
  ];
  assert.deepEqual(findNestedOwners(rows), []);
});

test('a three-level chain reports every ancestor/descendant pair, not just adjacent ones', () => {
  const rows = [
    { id: 'grandparent', sourceOwner: 'packages/core/src/ui/patterns/data' },
    { id: 'parent', sourceOwner: 'packages/core/src/ui/patterns/data/data-table' },
    { id: 'child', sourceOwner: 'packages/core/src/ui/patterns/data/data-table/inline-edit' },
  ];
  const violations = findNestedOwners(rows);
  assert.equal(violations.length, 3);
  const pairs = violations.map((v) => `${v.outerId}>${v.innerId}`).sort();
  assert.deepEqual(pairs, ['grandparent>child', 'grandparent>parent', 'parent>child']);
});

test('handles a non-array input defensively instead of throwing', () => {
  assert.deepEqual(findNestedOwners(undefined), []);
  assert.deepEqual(findNestedOwners(null), []);
});
