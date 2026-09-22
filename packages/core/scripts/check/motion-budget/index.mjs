#!/usr/bin/env node

/**
 * motion-budget — the perfection-budget AUTHORITY, browserless.
 *
 * WHAT THIS FILE IS. The thresholds and the verdict live in core, next to the
 * ratchet convention; the MEASUREMENT lives in the showroom, in a real browser,
 * in the phase that can measure it. This module is the half a `node --test`
 * drill can red on synthetic metric series, which is why it reads no browser
 * output and spawns nothing: feed it deltas and it returns a verdict.
 *
 * WHY THE FRAME ARM IS RELATIVE. rAF deltas cluster AT the display interval, so
 * "no frame > 16.7ms" reds a perfect 60Hz run and passes a 120Hz run dropping
 * every second frame. The interval is calibrated from the discarded warmup, and
 * a warmup median outside `calibrationWindowMs` fails as UNCALIBRATED instead of
 * silently adopting a throttled surface's bar.
 *
 * The browser arm is `packages/showroom/e2e/responsive/motion-budget.spec.ts`,
 * which calls these verdicts in its own phase and is not a manifest gate.
 * `motion-budget-drill` runs this module's suite; `property-law`
 * and `kernel-bundle` under `audits/` are the two registered gates of this
 * capability today.
 */

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));

/** The single threshold authority. The showroom spec reads this same file. */
export function readBudget(path = join(HERE, 'budget/index.json')) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

export function median(values) {
  if (values.length === 0) return Number.NaN;
  const sorted = [...values].sort((left, right) => left - right);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 1
    ? sorted[middle]
    : (sorted[middle - 1] + sorted[middle]) / 2;
}

/** Nearest-rank percentile; `p` is a fraction (0.95), not a percent. */
export function percentile(values, p) {
  if (values.length === 0) return Number.NaN;
  const sorted = [...values].sort((left, right) => left - right);
  const rank = Math.ceil(p * sorted.length) - 1;
  return sorted[Math.min(Math.max(rank, 0), sorted.length - 1)];
}

/**
 * The display interval this run actually got, from the run that is discarded
 * anyway. A median is immune to the handful of long deltas that make a warmup a
 * warmup; calibrating from the MEASURED runs would let a bad run raise its bar.
 */
export function calibrateInterval(warmupDeltas, budget = readBudget()) {
  const [low, high] = budget.frames.calibrationWindowMs;
  const intervalMs = median(warmupDeltas);
  if (!Number.isFinite(intervalMs)) {
    return { intervalMs, calibrated: false, reason: 'the warmup run produced no rAF deltas' };
  }
  if (intervalMs < low || intervalMs > high) {
    return {
      intervalMs,
      calibrated: false,
      reason: `warmup median ${intervalMs.toFixed(2)}ms is outside the calibration window `
        + `[${low}, ${high}]ms (~${Math.round(1000 / high)}-${Math.round(1000 / low)}Hz): `
        + 'this is a throttled or software-rendered surface, not a display the relative '
        + 'thresholds can be stated against',
    };
  }
  return { intervalMs, calibrated: true, reason: '' };
}

/** Pooled deltas across every measured run. Averaging per-run percentiles is not a statistic. */
export function pool(runs) {
  return runs.flat();
}

export function countDroppedFrames(deltas, intervalMs, budget = readBudget()) {
  const ceiling = intervalMs * budget.frames.droppedFactor;
  return deltas.filter((delta) => delta > ceiling).length;
}

/** The seed rule `ratchets.droppedFrames.seedRule` states: the pooled count plus
 *  `sigmas` x the largest of the observed spread, the Poisson spread and `minSigma`. */
export function seedDroppedFrameCeiling(droppedPerRun, budget = readBudget(), existing = Number.POSITIVE_INFINITY) {
  const { sigmas, minSigma } = budget.ratchets.droppedFrames.seedRule;
  const runs = droppedPerRun.length;
  const total = droppedPerRun.reduce((sum, count) => sum + count, 0);
  const mean = runs === 0 ? 0 : total / runs;
  const variance = runs > 1
    ? droppedPerRun.reduce((sum, count) => sum + (count - mean) ** 2, 0) / (runs - 1)
    : 0;
  const sigma = Math.max(Math.sqrt(runs * variance), Math.sqrt(total), minSigma);
  const margin = Math.ceil(sigmas * sigma);
  return { total, sigma, margin, ceiling: Math.min(existing, total + margin) };
}

/** Whether a run may seed: every scene has a complete budget verdict red at most on the
 *  ratchet arm AND a green reduced-motion control. Absent verdicts block like failed ones. */
export function seedAdmission(sceneIds, sceneVerdicts, controlVerdicts, budget = readBudget()) {
  const reasons = [];
  for (const id of sceneIds) {
    const scene = sceneVerdicts.get(id);
    if (!scene) reasons.push(`${id}: no budget verdict was recorded`);
    else {
      for (const failure of scene.failures) {
        if (failure.arm !== 'ratchets.droppedFrames') reasons.push(`${id}: ${failure.arm} failed`);
      }
      if (scene.measured.droppedPerRun.length !== budget.frames.measuredRuns) {
        reasons.push(`${id}: ${scene.measured.droppedPerRun.length} per-run counts, expected ${budget.frames.measuredRuns}`);
      }
    }
    const control = controlVerdicts.get(id);
    if (!control) reasons.push(`${id}: no reduced-motion control verdict was recorded`);
    else for (const failure of control.failures) reasons.push(`${id}: control ${failure.arm} failed`);
  }
  return { ok: reasons.length === 0, reasons };
}

/**
 * The verdict for one scene. `failures` is empty or the run is red; every entry
 * names the arm, so a reader does not have to diff numbers to find out which.
 */
export function verdictForScene(scene, budget = readBudget()) {
  const failures = [];
  const { warmup = [], runs = [], longTasks = [], animationsCreated = 0, rafCallbacks = 0 } = scene;

  if (runs.length !== budget.frames.measuredRuns) {
    failures.push({
      arm: 'runs',
      detail: `expected ${budget.frames.measuredRuns} measured runs, got ${runs.length}`,
    });
  }

  const calibration = calibrateInterval(warmup, budget);
  if (!calibration.calibrated) {
    failures.push({ arm: 'calibration', detail: `UNCALIBRATED: ${calibration.reason}` });
  }

  const deltas = pool(runs);
  const p95 = percentile(deltas, 0.95);
  const max = deltas.length === 0 ? Number.NaN : Math.max(...deltas);
  const droppedPerRun = calibration.calibrated
    ? runs.map((run) => countDroppedFrames(run, calibration.intervalMs, budget))
    : [];
  const dropped = calibration.calibrated
    ? droppedPerRun.reduce((sum, count) => sum + count, 0)
    : Number.NaN;

  if (calibration.calibrated) {
    const p95Ceiling = calibration.intervalMs * budget.frames.p95Factor;
    if (!(p95 <= p95Ceiling)) {
      failures.push({
        arm: 'frames.p95',
        detail: `p95 ${p95.toFixed(2)}ms exceeds ${budget.frames.p95Factor}x the calibrated `
          + `interval (${p95Ceiling.toFixed(2)}ms)`,
      });
    }
  }

  if (!(max < budget.frames.maxAbsoluteMs)) {
    failures.push({
      arm: 'frames.max',
      detail: `slowest frame ${max.toFixed(2)}ms is not below the ${budget.frames.maxAbsoluteMs}ms stall ceiling`,
    });
  }

  const offendingTasks = longTasks.filter((duration) => duration > budget.longTasks.thresholdMs);
  if (offendingTasks.length > budget.longTasks.maxEntries) {
    failures.push({
      arm: 'longTasks',
      detail: `${offendingTasks.length} long task(s) over ${budget.longTasks.thresholdMs}ms `
        + `(allowed ${budget.longTasks.maxEntries}): ${offendingTasks.map((d) => d.toFixed(1)).join(', ')}`,
    });
  }

  if (animationsCreated < budget.nonVacuity.minAnimations) {
    failures.push({
      arm: 'nonVacuity.animations',
      detail: `the scene created ${animationsCreated} animations; a scene that no-ops scores a perfect budget`,
    });
  }
  if (rafCallbacks < budget.nonVacuity.minRafCallbacks) {
    failures.push({
      arm: 'nonVacuity.rafCallbacks',
      detail: `only ${rafCallbacks} rAF callbacks were observed (floor ${budget.nonVacuity.minRafCallbacks})`,
    });
  }

  const ceiling = budget.ratchets.droppedFrames.scenes[scene.id];
  if (ceiling !== undefined && Number.isFinite(dropped) && dropped > ceiling) {
    failures.push({
      arm: 'ratchets.droppedFrames',
      detail: `${dropped} dropped frames for scene "${scene.id}" exceeds its decrease-only ceiling ${ceiling}`,
    });
  }

  return {
    id: scene.id,
    ok: failures.length === 0,
    failures,
    measured: {
      displayIntervalMs: calibration.intervalMs,
      calibrated: calibration.calibrated,
      p95Ms: p95,
      maxMs: max,
      droppedFrames: dropped,
      droppedPerRun,
      longTasksOverThreshold: offendingTasks.length,
      animationsCreated,
      rafCallbacks,
    },
  };
}

/** The reduced-motion negative control: the same scene must create nothing. */
export function verdictForReducedMotionControl(control) {
  const failures = [];
  if (control.animationsCreated !== 0) {
    failures.push({
      arm: 'reducedMotion',
      detail: `the reduce context created ${control.animationsCreated} animations; the law is that `
        + 'the kernel creates none and commits the final state on the same frame',
    });
  }
  if (control.committedGeometryMatchesTarget !== true) {
    failures.push({
      arm: 'reducedMotion.commit',
      detail: 'the committed geometry does not equal the target geometry on the first frame after the change',
    });
  }
  return { id: `${control.id}:reduce`, ok: failures.length === 0, failures };
}
