/**
 * The drill for `shape-radius-probe`.
 *
 * The browser half is proved by running it; what a drill has to prove is that
 * the VERDICT is not decorative. Each clause is planted against a synthetic
 * report and watched turn red, then removed and watched turn green.
 */
import assert from 'node:assert/strict';
import test from 'node:test';

import { evaluateReport, FAMILY_FLOOR, probeTargets, VERTICALS } from './index.mjs';

const scope = (over = {}) => ({
  vertical: 'bithire',
  families: 24,
  moved: 22,
  movedFamilies: [],
  namedChannel: { low: '8px', high: '12px' },
  namedChannelMoved: true,
  negativeControlHeld: true,
  ...over,
});

const report = (over = {}) => ({
  floor: FAMILY_FLOOR,
  families: 24,
  best: 22,
  scopes: [scope()],
  ...over,
});

test('a healthy report has no verdict', () => {
  assert.deepEqual(evaluateReport(report()), []);
});

test('a dial that does not move --ds-radius-md voids the run', () => {
  /* The exact defect F-07 measured: the channel is present, reachable and
   * constant. A probe that accepted it would certify the cancellation. */
  const failures = evaluateReport(
    report({
      scopes: [scope({ namedChannelMoved: false, namedChannel: { low: '8px', high: '8px' } })],
    })
  );
  assert.match(failures.join('\n'), /the dial is inert/);
});

test('a moving negative control voids the run', () => {
  const failures = evaluateReport(report({ scopes: [scope({ negativeControlHeld: false })] }));
  assert.match(failures.join('\n'), /more than the dial/);
});

test('a reach below the floor fails, one under included', () => {
  const failures = evaluateReport(report({ best: FAMILY_FLOOR - 1 }));
  assert.match(failures.join('\n'), new RegExp(`the floor is ${FAMILY_FLOOR}`));
  assert.deepEqual(evaluateReport(report({ best: FAMILY_FLOOR })), []);
});

test('every clause is reported, not just the first', () => {
  const failures = evaluateReport(
    report({ best: 0, scopes: [scope({ namedChannelMoved: false, negativeControlHeld: false })] })
  );
  assert.equal(failures.length, 3);
});

test('the roster is the three first-party verticals', () => {
  assert.deepEqual([...VERTICALS], ['rottay', 'bithire', 'evnto']);
});

test('the targets come from the source census, one painted corner per family', () => {
  const targets = probeTargets();
  assert.equal(targets.length >= FAMILY_FLOOR, true, `censused ${targets.length} families`);
  assert.equal(new Set(targets.map(([family]) => family)).size, targets.length);
  for (const [family, value] of targets) {
    assert.match(family, /^[a-z0-9-]+$/, 'the family is a skin folder slug');
    assert.notEqual(value, '', 'every row carries the expression the family paints');
  }
});

test('the census excludes the corners the ramp does not scale', () => {
  /* A pill, a square corner and a 50% circle are not points on the scale, by
   * `themes/default.css`'s own law. A denominator that carried them would hold
   * the dial to rows it is not allowed to move. */
  for (const [, value] of probeTargets()) {
    assert.doesNotMatch(value, /^(?:0|none|inherit|50%|9999px)$/u);
    assert.doesNotMatch(value, /^var\(\s*--ds-radius-(?:full|none)\b/u);
  }
});
