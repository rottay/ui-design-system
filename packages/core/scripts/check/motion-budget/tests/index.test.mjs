/**
 * DRILL for the motion budget's thresholds.
 *
 * Synthetic metric series only: this proves each arm of the verdict can go RED
 * before any browser exists to measure it. The series are shaped like the ones
 * `PerformanceObserver('longtask')` and an injected rAF delta collector produce.
 */
import assert from 'node:assert/strict';
import test from 'node:test';

import {
  calibrateInterval,
  countDroppedFrames,
  median,
  percentile,
  readBudget,
  verdictForReducedMotionControl,
  verdictForScene,
} from '../index.mjs';

const budget = readBudget();

/** A 60Hz-looking run: deltas at the interval with ordinary jitter. */
function goodRun(interval = 16.7, frames = 60) {
  return Array.from({ length: frames }, (_, index) => interval + (index % 5) * 0.2);
}

function scene(overrides = {}) {
  return {
    id: 'grid',
    warmup: goodRun(),
    runs: Array.from({ length: budget.frames.measuredRuns }, () => goodRun()),
    longTasks: [],
    animationsCreated: 12,
    rafCallbacks: 60,
    ...overrides,
  };
}

test('the thresholds file states every arm the verdict reads', () => {
  assert.equal(budget.frames.measuredRuns, 7);
  assert.equal(budget.frames.warmupRuns, 1);
  assert.equal(budget.frames.droppedFactor, 1.5);
  assert.equal(budget.frames.p95Factor, 1.2);
  assert.equal(budget.frames.maxAbsoluteMs, 50);
  assert.deepEqual(budget.frames.calibrationWindowMs, [4, 40]);
  assert.equal(budget.longTasks.maxEntries, 0);
  assert.equal(budget.longTasks.thresholdMs, 50);
  for (const key of ['frames', 'longTasks', 'nonVacuity']) {
    assert.ok(budget[key].rationale.length > 80, `${key} must state why, not just what`);
  }
});

test('a clean 60Hz scene passes every arm', () => {
  const verdict = verdictForScene(scene(), budget);
  assert.deepEqual(verdict.failures, []);
  assert.equal(verdict.ok, true);
  assert.ok(Math.abs(verdict.measured.displayIntervalMs - 16.7) < 0.5);
});

test('a clean 120Hz scene also passes -- the arm is display-relative, not 16.7ms', () => {
  const fast = scene({
    warmup: goodRun(8.33),
    runs: Array.from({ length: 7 }, () => goodRun(8.33)),
  });
  assert.deepEqual(verdictForScene(fast, budget).failures, []);
});

test('DRILL: a 120Hz run that drops every second frame is RED, where an absolute 16.7ms bar passed it', () => {
  const alternating = Array.from({ length: 60 }, (_, index) => (index % 2 === 0 ? 8.33 : 16.66));
  const verdict = verdictForScene(scene({
    warmup: goodRun(8.33),
    runs: Array.from({ length: 7 }, () => alternating),
  }), budget);

  assert.equal(verdict.ok, false);
  assert.ok(verdict.failures.some((failure) => failure.arm === 'frames.p95'));
  // Every one of those 16.66ms frames would have passed a hardcoded 16.7ms ceiling.
  assert.ok(Math.max(...alternating) < 16.7);
});

test('DRILL: a p95 at 1.35x the calibrated interval is RED', () => {
  const skewed = [...Array.from({ length: 54 }, () => 16.7), ...Array.from({ length: 6 }, () => 22.6)];
  const verdict = verdictForScene(scene({ runs: Array.from({ length: 7 }, () => skewed) }), budget);

  assert.equal(verdict.ok, false);
  const failure = verdict.failures.find((entry) => entry.arm === 'frames.p95');
  assert.ok(failure, `expected a p95 failure; got ${JSON.stringify(verdict.failures)}`);
});

test('DRILL: a single 58ms frame is RED on the absolute stall ceiling', () => {
  const stalled = [...goodRun(), 58];
  const verdict = verdictForScene(scene({ runs: [stalled, ...Array.from({ length: 6 }, () => goodRun())] }), budget);

  assert.equal(verdict.ok, false);
  assert.ok(verdict.failures.some((failure) => failure.arm === 'frames.max'));
});

test('DRILL: one 60ms long task is RED -- the arm is absolute at zero', () => {
  const verdict = verdictForScene(scene({ longTasks: [60] }), budget);

  assert.equal(verdict.ok, false);
  assert.ok(verdict.failures.some((failure) => failure.arm === 'longTasks'));
  // A 49ms task is main-thread work but below the governed threshold.
  assert.deepEqual(verdictForScene(scene({ longTasks: [49] }), budget).failures, []);
});

test('DRILL: a 2ms warmup median fails LOUDLY as uncalibrated, it does not adopt the bar', () => {
  const verdict = verdictForScene(scene({ warmup: goodRun(2) }), budget);

  assert.equal(verdict.ok, false);
  const failure = verdict.failures.find((entry) => entry.arm === 'calibration');
  assert.ok(failure && failure.detail.includes('UNCALIBRATED'));
  assert.equal(verdict.measured.calibrated, false);
  // And it does not silently pass the relative arms against the nonsense interval.
  assert.ok(!verdict.failures.some((entry) => entry.arm === 'frames.p95'));
  assert.equal(calibrateInterval([], budget).calibrated, false);
});

test('DRILL: a dropped-frame count above a seeded ceiling is RED', () => {
  const seeded = {
    ...budget,
    ratchets: { droppedFrames: { seeded: true, scenes: { grid: 1 }, rationale: budget.ratchets.droppedFrames.rationale } },
  };
  const bumpy = [...Array.from({ length: 56 }, () => 16.7), 34, 34, 34, 34];
  const verdict = verdictForScene(scene({ runs: Array.from({ length: 7 }, () => bumpy) }), seeded);

  assert.ok(verdict.failures.some((failure) => failure.arm === 'ratchets.droppedFrames'));
  assert.equal(countDroppedFrames(bumpy, 16.7, seeded), 4);
});

test('DRILL: a scene that animated nothing is RED on the non-vacuity floors', () => {
  const silent = verdictForScene(scene({ animationsCreated: 0, rafCallbacks: 3 }), budget);

  assert.equal(silent.ok, false);
  assert.ok(silent.failures.some((failure) => failure.arm === 'nonVacuity.animations'));
  assert.ok(silent.failures.some((failure) => failure.arm === 'nonVacuity.rafCallbacks'));
});

test('DRILL: the reduced-motion control is RED when the kernel animated, or did not commit', () => {
  assert.deepEqual(
    verdictForReducedMotionControl({ id: 'grid', animationsCreated: 0, committedGeometryMatchesTarget: true }).failures,
    [],
  );
  const animated = verdictForReducedMotionControl({
    id: 'grid',
    animationsCreated: 1,
    committedGeometryMatchesTarget: true,
  });
  assert.equal(animated.ok, false);
  assert.ok(animated.failures.some((failure) => failure.arm === 'reducedMotion'));

  const uncommitted = verdictForReducedMotionControl({
    id: 'grid',
    animationsCreated: 0,
    committedGeometryMatchesTarget: false,
  });
  assert.ok(uncommitted.failures.some((failure) => failure.arm === 'reducedMotion.commit'));
});

test('DRILL: a run with the wrong number of measured runs is RED', () => {
  const short = verdictForScene(scene({ runs: [goodRun(), goodRun(), goodRun()] }), budget);
  assert.ok(short.failures.some((failure) => failure.arm === 'runs'));
});

test('the statistics helpers are the ones the arms claim', () => {
  assert.equal(median([3, 1, 2]), 2);
  assert.equal(median([4, 1, 2, 3]), 2.5);
  assert.equal(percentile([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 0.95), 10);
  assert.equal(percentile(Array.from({ length: 100 }, (_, index) => index + 1), 0.95), 95);
});

test('the browser arm is NOT claimed as seeded while its probe is a later lot', () => {
  assert.equal(budget.ratchets.droppedFrames.seeded, false);
  assert.deepEqual(budget.ratchets.droppedFrames.scenes, {});
  assert.match(budget.ratchets.droppedFrames.rationale, /LATER lot/u);
});
