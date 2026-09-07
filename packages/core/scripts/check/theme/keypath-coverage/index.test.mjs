/**
 * The drill for `theme-keypath-coverage`.
 *
 * The gate itself is RED today and is registered non-blocking with a written
 * reason. That makes THIS suite the load-bearing one: it is what proves the red
 * is a measurement and not a broken reader, that the partition is disjoint, and
 * above all that the gate cannot go green while a keypath is unowned.
 */

import assert from 'node:assert/strict';
import test from 'node:test';

import {
  DERIVED_PREFIXES,
  INTERNAL_PREFIXES,
  collectFindings,
  decisionPrefixes,
  expandKeypath,
  partition,
  themeKeypathUniverse,
} from './index.mjs';
import { readThemeCatalog } from '../../../libraries/theme-catalog/index.mjs';

test('the universe is measured from the shipped themes and is not empty', () => {
  const universe = themeKeypathUniverse();
  assert.ok(universe.length > 1000, `expected a real universe; got ${universe.length}`);
  // A reader that stopped at the first identifier reference measured 13.
  assert.ok(universe.includes('palette.primaryColor'), 'file-local bindings must be resolved');
  assert.ok(universe.some((keypath) => keypath.startsWith('chrome.')), 'chrome must be reached');
});

test('the decision prefixes come from the catalog and expand its keypath grammar', () => {
  const prefixes = decisionPrefixes();
  assert.ok(prefixes.includes('surfaces.radiusScale'));
  assert.ok(prefixes.includes('palette.primaryColor'), '{a,b} must expand');
  assert.ok(prefixes.includes('modes.dark.palette'), 'a trailing * must become its parent');
  const rows = readThemeCatalog();
  const authorable = rows.filter((row) => row.keypath.brandTheme !== null);
  assert.ok(prefixes.length >= authorable.length);
});

test('expandKeypath is total over the grammar the catalog uses', () => {
  assert.deepEqual(expandKeypath(null), []);
  assert.deepEqual(expandKeypath('a.b'), ['a.b']);
  assert.deepEqual(expandKeypath('a.*'), ['a']);
  assert.deepEqual(expandKeypath('a.{x,y}'), ['a.x', 'a.y']);
  assert.deepEqual(expandKeypath('a.{x,y}.z'), ['a.x.z', 'a.y.z']);
});

test('every declared internal prefix carries a written owner', () => {
  assert.ok(INTERNAL_PREFIXES.length > 0);
  for (const entry of INTERNAL_PREFIXES) {
    assert.ok(entry.prefix, 'an internal entry needs a prefix');
    assert.ok(
      typeof entry.owner === 'string' && entry.owner.trim().length > 20,
      `${entry.prefix} needs a written owner, not a placeholder`,
    );
  }
});

test('the derived set is EMPTY until a derivator exists, and says so by being empty', () => {
  // A prefix here is a claim that a family deriver writes that subtree. Adding
  // one before the deriver exists is exactly how this gate would go green on a
  // tree where nothing derives.
  assert.deepEqual([...DERIVED_PREFIXES], []);
});

test('the three sets are disjoint, and a keypath claimed twice is reported', () => {
  const clean = partition({
    universe: ['a.one', 'b.two', 'c.three'],
    decision: ['a'],
    derived: ['b'],
    internal: ['c'],
  });
  assert.deepEqual(clean.overlaps, []);
  assert.deepEqual(clean.uncovered, []);
  assert.deepEqual(clean.sets, { decision: ['a.one'], derived: ['b.two'], internal: ['c.three'] });

  const overlapping = partition({
    universe: ['a.one'],
    decision: ['a'],
    derived: ['a.one'],
    internal: [],
  });
  assert.equal(overlapping.overlaps.length, 1);
  assert.match(overlapping.overlaps[0], /claimed by decision and derived/u);
  assert.equal(overlapping.sets.decision.length, 0, 'an overlapping keypath belongs to neither');
});

test('DRILL: an unclassified keypath is uncovered, and uncovered is ALWAYS a failure', () => {
  const { findings } = collectFindings({
    universe: ['a.one', 'orphan.two'],
    decision: ['a'],
    derived: [],
    internal: [],
  });
  assert.equal(findings.length, 1);
  assert.match(findings[0], /1 of 2 Theme keypaths are in no set/u);
  assert.match(findings[0], /orphan\.two/u);
});

test('DRILL: a total partition is the ONLY shape that reports no finding', () => {
  const { findings } = collectFindings({
    universe: ['a.one', 'b.two'],
    decision: ['a'],
    derived: [],
    internal: ['b'],
  });
  assert.deepEqual(findings, []);
});

test('DRILL: an empty universe is a broken reader, not a covered tree', () => {
  const { findings } = collectFindings({ universe: [], decision: [], derived: [], internal: [] });
  assert.equal(findings.length, 1);
  assert.match(findings[0], /universe is EMPTY/u);
});

test('the LIVE tree is red, and red is the honest state before the derivation lane', () => {
  const { findings, result } = collectFindings();
  assert.ok(result.uncovered.length > 0, 'if this ever passes, promote the gate to blocking');
  assert.equal(findings.length > 0, true);
  assert.deepEqual(result.overlaps, [], 'the partition must be disjoint even while it is partial');
});
