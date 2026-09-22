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
  seedAdmission,
  seedDroppedFrameCeiling,
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

test('the dropped-frame ratchet is keyed to the probe scenes and seeded all-or-nothing', () => {
  const PROBE_SCENES = ['reflow', 'size-interpolate', 'size-measured', 'presence'];
  const { seeded, scenes } = budget.ratchets.droppedFrames;
  assert.ok(Object.keys(scenes).every((id) => PROBE_SCENES.includes(id)), Object.keys(scenes).join(', '));
  assert.ok(Object.values(scenes).every((ceiling) => Number.isInteger(ceiling) && ceiling >= 0));
  assert.deepEqual(Object.keys(scenes).sort(), seeded ? [...PROBE_SCENES].sort() : []);
});

/** A 60-frame run at 16.7ms with `dropped` frames at 34ms (one missed vsync each). */
function runDropping(dropped) {
  return [...Array.from({ length: 60 - dropped }, () => 16.7), ...Array.from({ length: dropped }, () => 34)];
}

function acceptance(ceiling, perRun) {
  const seeded = {
    ...budget,
    ratchets: { droppedFrames: { ...budget.ratchets.droppedFrames, seeded: true, scenes: { grid: ceiling } } },
  };
  return verdictForScene(scene({ runs: perRun.map(runDropping) }), seeded);
}

const isRatchetRed = (verdict) => verdict.failures.some((failure) => failure.arm === 'ratchets.droppedFrames');

test('the seed rule is stated in the thresholds file', () => {
  const { sigmas, minSigma, rationale } = budget.ratchets.droppedFrames.seedRule;
  assert.equal(sigmas, 3);
  assert.equal(minSigma, 1);
  assert.match(rationale, /seedDroppedFrameCeiling/u);
});

test('the verdict reports the per-run dropped counts the seed rule reads', () => {
  const verdict = acceptance(99, [2, 2, 2, 2, 2, 2, 1]);
  assert.deepEqual(verdict.measured.droppedPerRun, [2, 2, 2, 2, 2, 2, 1]);
  assert.equal(verdict.measured.droppedFrames, 13);
});

test('DRILL: a +1 jitter over the seeding run passes, where the zero-margin rule redded it', () => {
  // The 2026-09-22 reflow case: seeded on 13, the acceptance run measured 14.
  const seedRun = [2, 2, 2, 2, 2, 2, 1];
  const seed = seedDroppedFrameCeiling(seedRun, budget);
  assert.equal(seed.total, 13);
  assert.equal(seed.margin, Math.ceil(3 * Math.sqrt(13)));

  const jitter = [2, 2, 2, 2, 2, 2, 2];
  assert.equal(isRatchetRed(acceptance(seed.ceiling, jitter)), false);
  assert.equal(isRatchetRed(acceptance(seed.total, jitter)), true);
});

test('DRILL: a regression beyond the margin is RED', () => {
  const seed = seedDroppedFrameCeiling([2, 2, 2, 2, 2, 2, 1], budget);
  assert.equal(seed.ceiling, 24);
  assert.equal(isRatchetRed(acceptance(seed.ceiling, [4, 4, 4, 3, 3, 3, 3])), false);
  assert.equal(isRatchetRed(acceptance(seed.ceiling, [4, 4, 4, 4, 3, 3, 3])), true);
});

test('DRILL: a quiet seeding run still gets a margin; one dropped frame passes, a real regression reds', () => {
  const seed = seedDroppedFrameCeiling([0, 0, 0, 0, 0, 0, 0], budget);
  assert.equal(seed.ceiling, 3);
  assert.equal(isRatchetRed(acceptance(seed.ceiling, [1, 0, 0, 0, 0, 0, 0])), false);
  assert.equal(isRatchetRed(acceptance(seed.ceiling, [1, 1, 1, 1, 0, 0, 0])), true);
});

test('DRILL: a spread wider than Poisson widens the margin', () => {
  const spread = seedDroppedFrameCeiling([0, 6, 0, 6, 0, 6, 0], budget);
  assert.ok(spread.sigma > Math.sqrt(spread.total));
  assert.equal(spread.margin, Math.ceil(3 * spread.sigma));
});

test('DRILL: re-seeding never raises a ceiling', () => {
  assert.equal(seedDroppedFrameCeiling([9, 9, 9, 9, 9, 9, 9], budget, 12).ceiling, 12);
  assert.equal(seedDroppedFrameCeiling([0, 0, 0, 0, 0, 0, 0], budget, 12).ceiling, 3);
});

const SEED_SCENES = ['reflow', 'presence'];

function greenRun() {
  const sceneVerdicts = new Map(SEED_SCENES.map((id) => [id, verdictForScene(scene({ id }), budget)]));
  const controlVerdicts = new Map(SEED_SCENES.map((id) => [id, verdictForReducedMotionControl({
    id, animationsCreated: 0, committedGeometryMatchesTarget: true,
  })]));
  return { sceneVerdicts, controlVerdicts };
}

test('a complete run with green controls is admitted to seed', () => {
  const { sceneVerdicts, controlVerdicts } = greenRun();
  assert.deepEqual(seedAdmission(SEED_SCENES, sceneVerdicts, controlVerdicts, budget), { ok: true, reasons: [] });
});

test('DRILL: a failed reduced-motion control blocks the seed like a failed budget arm', () => {
  const { sceneVerdicts, controlVerdicts } = greenRun();
  controlVerdicts.set('presence', verdictForReducedMotionControl({
    id: 'presence', animationsCreated: 3, committedGeometryMatchesTarget: true,
  }));
  const admission = seedAdmission(SEED_SCENES, sceneVerdicts, controlVerdicts, budget);
  assert.equal(admission.ok, false);
  assert.deepEqual(admission.reasons, ['presence: control reducedMotion failed']);

  const budgetRed = greenRun();
  budgetRed.sceneVerdicts.set('presence', verdictForScene(scene({ id: 'presence', longTasks: [60] }), budget));
  assert.deepEqual(
    seedAdmission(SEED_SCENES, budgetRed.sceneVerdicts, budgetRed.controlVerdicts, budget).reasons,
    ['presence: longTasks failed'],
  );
});

test('DRILL: a missing control or budget verdict blocks the seed', () => {
  const noControl = greenRun();
  noControl.controlVerdicts.delete('reflow');
  assert.deepEqual(
    seedAdmission(SEED_SCENES, noControl.sceneVerdicts, noControl.controlVerdicts, budget).reasons,
    ['reflow: no reduced-motion control verdict was recorded'],
  );
  const noBudget = greenRun();
  noBudget.sceneVerdicts.delete('reflow');
  assert.equal(seedAdmission(SEED_SCENES, noBudget.sceneVerdicts, noBudget.controlVerdicts, budget).ok, false);
});

test('a red ratchet arm alone does not block a re-seed, which can only lower', () => {
  const { sceneVerdicts, controlVerdicts } = greenRun();
  const tight = {
    ...budget,
    ratchets: { droppedFrames: { ...budget.ratchets.droppedFrames, scenes: { reflow: 0 } } },
  };
  sceneVerdicts.set('reflow', verdictForScene(scene({ id: 'reflow', runs: [1, 0, 0, 0, 0, 0, 0].map(runDropping) }), tight));
  assert.ok(sceneVerdicts.get('reflow').failures.some((failure) => failure.arm === 'ratchets.droppedFrames'));
  assert.equal(seedAdmission(SEED_SCENES, sceneVerdicts, controlVerdicts, budget).ok, true);
});
