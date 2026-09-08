/**
 * The drill for `states-emphasis-probe`.
 *
 * The browser half is proved by running it; what a drill has to prove is that
 * the VERDICT is not decorative. Each clause is planted against a synthetic
 * report and watched turn red, then removed and watched turn green.
 */
import assert from 'node:assert/strict';
import test from 'node:test';

import { evaluateReport, FAMILY_FLOOR, probeTargets, VERTICALS } from './index.mjs';

const scope = (over = {}) => ({
  vertical: 'evnto',
  families: 25,
  moved: 13,
  movedFamilies: [],
  namedChannelMoved: true,
  positiveControlMoved: true,
  negativeControlHeld: true,
  ...over,
});

const report = (over = {}) => ({
  floor: FAMILY_FLOOR,
  families: 25,
  best: 13,
  scopes: [scope()],
  ...over,
});

test('a healthy report has no verdict', () => {
  assert.deepEqual(evaluateReport(report()), []);
});

test('a dead positive control voids the run', () => {
  const failures = evaluateReport(report({ scopes: [scope({ positiveControlMoved: false })] }));
  assert.match(failures.join('\n'), /measured nothing/);
});

test('a moving negative control voids the run', () => {
  const failures = evaluateReport(report({ scopes: [scope({ negativeControlHeld: false })] }));
  assert.match(failures.join('\n'), /more than the emphasis/);
});

test('a reach below the floor fails, one under included', () => {
  const failures = evaluateReport(report({ best: FAMILY_FLOOR - 1 }));
  assert.match(failures.join('\n'), new RegExp(`the floor is ${FAMILY_FLOOR}`));
  assert.deepEqual(evaluateReport(report({ best: FAMILY_FLOOR })), []);
});

test('every clause is reported, not just the first', () => {
  const failures = evaluateReport(report({
    best: 0,
    scopes: [scope({ positiveControlMoved: false, negativeControlHeld: false })],
  }));
  assert.equal(failures.length, 3);
});

test('the roster is the three first-party verticals', () => {
  assert.deepEqual([...VERTICALS], ['rottay', 'bithire', 'evnto']);
});

test('the targets come from the gate census, one background channel per family', () => {
  const targets = probeTargets();
  assert.equal(targets.length >= FAMILY_FLOOR, true);
  assert.equal(new Set(targets.map(([family]) => family)).size, targets.length);
  for (const [, channel] of targets) assert.match(channel, /^--ds-[a-z0-9-]+$/);
});
