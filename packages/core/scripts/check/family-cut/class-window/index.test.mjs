/**
 * Drills of the declared class-window arm.
 *
 * The arm exists to stop a family being charged twice for one class while it
 * renames it. Every drill here plants the shape that would abuse that: an
 * undeclared canonical name, a name declared for a different family, and a
 * canonical name left standing after its superseded partner is gone. None of
 * them may be set aside.
 */

import assert from 'node:assert/strict';
import test from 'node:test';

import { readClassMigrationWindows, windowedCanonicalClasses } from './index.mjs';

const WINDOWS = [
  { family: 'app-shell', cut: 'WO-FAM-11', pairs: { 'rottay-app-shell': 'ds-app-shell' } },
  { family: 'action-dock', cut: 'WO-FAM-11', pairs: { 'rottay-action-dock': 'ds-action-dock' } },
];

test('the registry is read from source and declares the open windows', () => {
  const windows = readClassMigrationWindows();
  const families = windows.map((entry) => entry.family).sort();
  assert.deepEqual(families, ['action-dock', 'app-shell']);
  for (const entry of windows) {
    assert.ok(Object.keys(entry.pairs).length > 0, `${entry.family} declares no pair`);
    for (const [superseded, canonical] of Object.entries(entry.pairs)) {
      assert.ok(canonical.startsWith('ds-'), `${canonical} is not a canonical spelling`);
      assert.ok(!superseded.startsWith('ds-'), `${superseded} is not a superseded spelling`);
    }
  }
});

test('sets aside a declared canonical twin while its partner is still stamped', () => {
  const set = windowedCanonicalClasses('app-shell', ['ds-app-shell', 'rottay-app-shell'], WINDOWS);
  assert.deepEqual([...set], ['ds-app-shell']);
});

test('PLANT: an undeclared canonical name is counted', () => {
  const set = windowedCanonicalClasses(
    'app-shell',
    ['ds-app-shell-planted', 'rottay-app-shell'],
    WINDOWS,
  );
  assert.equal(set.has('ds-app-shell-planted'), false);
});

test("PLANT: another family's declaration does not reach this one", () => {
  const set = windowedCanonicalClasses('app-shell', ['ds-action-dock', 'rottay-action-dock'], WINDOWS);
  assert.deepEqual([...set], []);
});

test('PLANT: the twin re-enters the census the moment its partner is gone', () => {
  // This is the closure step, and it must be visible: with the superseded arm
  // deleted the canonical class counts, the legacy count falls and the ratchet
  // asks for its pin to be lowered.
  const set = windowedCanonicalClasses('app-shell', ['ds-app-shell'], WINDOWS);
  assert.deepEqual([...set], []);
});

test('PLANT: a family with no declared window sets nothing aside', () => {
  const set = windowedCanonicalClasses('button', ['ds-button', 'rt-button'], WINDOWS);
  assert.deepEqual([...set], []);
});
