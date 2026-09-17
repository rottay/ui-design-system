import assert from 'node:assert/strict';
import test from 'node:test';

import {
  evaluateBaselineTightening,
  evaluateZeroLockCheck,
} from './index.mjs';

test('DRILL: an unbaselined counter never masks a zero-lock regression in the same run', () => {
  const result = evaluateZeroLockCheck({
    baseline: { 'fleet.inlinePaint.a': 0, 'effects.glassConsumers': 5 },
    current: { 'fleet.inlinePaint.a': 0, 'effects.glassConsumers': 13, 'runtimeSvgPaint.new': 0 },
  });

  assert.equal(result.ok, false);
  const joined = result.errors.join('\n');
  assert.match(joined, /counter has no baseline: runtimeSvgPaint\.new=0/);
  assert.match(joined, /ceiling regression: effects\.glassConsumers=13; baseline=5/);
  assert.equal(result.errors.length, 2, joined);
});

test('DRILL: a missing baseline entry never masks slack, exact or floor breaches', () => {
  const result = evaluateZeroLockCheck({
    baseline: { zeroed: 50, exactKey: 2, floorKey: 10 },
    current: { zeroed: 0, exactKey: 3, floorKey: 9, unbaselined: 4 },
    exact: { exactKey: 2 },
    minimum: { floorKey: 10 },
  });

  assert.equal(result.ok, false);
  const joined = result.errors.join('\n');
  assert.match(joined, /counter has no baseline: unbaselined=4/);
  assert.match(joined, /completed zero retains slack: zeroed=0; baseline=50/);
  assert.match(joined, /exact invariant broken: exactKey=3; required 2/);
  assert.match(joined, /below minimum floor: floorKey=9; required >=10/);
});

test('DRILL: the tightening path also reports the roster and the value breach together', () => {
  const result = evaluateBaselineTightening({
    baseline: { debt: 4 },
    candidate: { debt: 5, newCounter: 0 },
  });

  assert.equal(result.ok, false);
  const joined = result.errors.join('\n');
  assert.match(joined, /new counter requires an explicit reviewed baseline entry: newCounter=0/);
  assert.match(joined, /baseline update would absorb an increase: debt 4 -> 5/);
});

test('structural refusal stays fatal and never observes an exotic map', () => {
  let getterRuns = 0;
  const accessor = {};
  Object.defineProperty(accessor, 'paint', {
    enumerable: true,
    get() {
      getterRuns += 1;
      return 0;
    },
  });
  const hostileProxy = new Proxy({ paint: 0 }, {
    ownKeys() {
      throw new Error('must never inspect proxy traps');
    },
  });

  for (const map of [accessor, hostileProxy, new Map([['paint', 0]]), { paint: -1 }, null]) {
    const result = evaluateZeroLockCheck({ baseline: map, current: { other: 1 } });
    assert.equal(result.ok, false, Object.prototype.toString.call(map));
    // Fail-closed: the roster comparison must not run against data that was refused.
    assert.equal(result.errors.some((error) => error.startsWith('counter has no baseline:')), false);
  }
  assert.equal(getterRuns, 0);
});
