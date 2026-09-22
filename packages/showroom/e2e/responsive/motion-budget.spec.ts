import { expect, test, type Browser, type BrowserContext, type Page } from '@playwright/test';
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import {
  readBudget,
  seedAdmission,
  seedDroppedFrameCeiling,
  verdictForReducedMotionControl,
  verdictForScene,
} from '../../../core/scripts/check/motion-budget/index.mjs';
import {
  MOTION_BUDGET_DOM,
  MOTION_BUDGET_SCENES,
  type MotionBudgetSceneId,
} from '../../src/app/probe/motion-budget/roster';

// WO-INV-08 perfection budget. Thresholds and verdicts are core's (budget/index.json + the drilled
// authority module), read by path; this spec only measures. Gated until the DT's seeding run.

const BUDGET_PATH = fileURLToPath(
  new URL('../../../core/scripts/check/motion-budget/budget/index.json', import.meta.url),
);

interface MotionBudget {
  frames: {
    measuredRuns: number;
    warmupRuns: number;
    droppedFactor: number;
    p95Factor: number;
    maxAbsoluteMs: number;
    calibrationWindowMs: [number, number];
  };
  longTasks: { thresholdMs: number; maxEntries: number };
  nonVacuity: { minAnimations: number; minRafCallbacks: number };
  ratchets: {
    droppedFrames: {
      seeded: boolean;
      scenes: Record<string, number>;
      seedRule: { sigmas: number; minSigma: number };
      seedContext?: { protocol: Record<string, unknown> };
    };
  };
  kernelBundle: { exports: string[] };
}

interface Failure {
  arm: string;
  detail: string;
}

interface SceneVerdict {
  id: string;
  ok: boolean;
  failures: Failure[];
  measured: Record<string, number | boolean | number[]> & { droppedPerRun: number[] };
}

const budget = readBudget(BUDGET_PATH) as MotionBudget;

// Trace protocol, not thresholds: the WO's 1s resize/reorder trace, the change played and reversed.
const TRACE_MS = 1_000;
const TOGGLES_AT_MS = [0, 500];
const OBSERVER_FLUSH_MS = 250;
const QUIET_MS = 300;
const GEOMETRY_TOLERANCE_PX = 0.5;
const VIEWPORT = { width: 1280, height: 900 };
const PROTOCOL = {
  traceMs: TRACE_MS,
  togglesAtMs: TOGGLES_AT_MS,
  observerFlushMs: OBSERVER_FLUSH_MS,
  quietMs: QUIET_MS,
  viewport: [VIEWPORT.width, VIEWPORT.height],
};

type Geometry = Record<string, [number, number, number, number]>;

interface RunSample {
  deltas: number[];
  rafCallbacks: number;
  animationsCreated: number;
  longTasks: number[];
}

interface ControlSample {
  before: Geometry;
  firstFrame: Geometry;
  settled: Geometry;
  animateCalls: number;
  cssRuns: number;
  liveAtFirstFrame: number;
}

interface ProbeState {
  recording: boolean;
  deltas: number[];
  rafCallbacks: number;
  animateCalls: number;
  cssRuns: number;
  longTasks: Array<{ start: number; duration: number }>;
}

type ProbeWindow = typeof window & { __motionBudget: ProbeState };

async function installProbe(context: BrowserContext): Promise<void> {
  await context.addInitScript(({ scene, subject }) => {
    const state: ProbeState = {
      recording: false,
      deltas: [],
      rafCallbacks: 0,
      animateCalls: 0,
      cssRuns: 0,
      longTasks: [],
    };
    Object.defineProperty(window, '__motionBudget', { value: state, writable: false });

    try {
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          state.longTasks.push({ start: entry.startTime, duration: entry.duration });
        }
      }).observe({ type: 'longtask', buffered: true });
    } catch {
      // An engine without the longtask entry type reports none; the rAF arms still measure.
    }

    const nativeAnimate = Element.prototype.animate;
    Element.prototype.animate = function animate(this: Element, ...args: Parameters<Element['animate']>) {
      if (state.recording && this.closest(`[${scene}]`)) state.animateCalls += 1;
      return nativeAnimate.apply(this, args);
    };
    const onRun = (event: Event) => {
      if (state.recording && event.target instanceof Element && event.target.closest(`[${subject}]`)) {
        state.cssRuns += 1;
      }
    };
    document.addEventListener('transitionrun', onRun, true);
    document.addEventListener('animationstart', onRun, true);
  }, { scene: MOTION_BUDGET_DOM.scene, subject: MOTION_BUDGET_DOM.subject });
}

async function openScene(
  browser: Browser,
  scene: MotionBudgetSceneId,
  reducedMotion: 'reduce' | 'no-preference',
): Promise<{ context: BrowserContext; page: Page }> {
  const context = await browser.newContext({
    reducedMotion: 'no-preference',
    viewport: VIEWPORT,
  });
  await installProbe(context);
  const page = await context.newPage();
  await page.emulateMedia({ reducedMotion });

  const response = await page.goto(`/probe/motion-budget/${scene}`, { waitUntil: 'load' });
  expect(response?.status(), `/probe/motion-budget/${scene} must be served by this build`).toBe(200);

  const root = page.locator(`[${MOTION_BUDGET_DOM.scene}="${scene}"]`);
  await expect(root).toHaveAttribute(MOTION_BUDGET_DOM.ready, 'true');
  await expect(page.locator('html')).toHaveAttribute('data-engine', 'modern');
  await expect(root).toHaveAttribute(
    MOTION_BUDGET_DOM.kernelExports,
    [...budget.kernelBundle.exports].sort().join(' '),
  );
  await expect(page.locator(`[${MOTION_BUDGET_DOM.subject}]`)).toHaveCount(12);
  if (scene === 'size-interpolate' || scene === 'size-measured') {
    // Chromium supports keyword interpolation, so the auto scene must not silently measure the fallback twice.
    await expect(root).toHaveAttribute(
      MOTION_BUDGET_DOM.sizeStrategy,
      scene === 'size-interpolate' ? 'interpolate-size' : 'measured',
    );
  }

  await page.evaluate(async (quietMs) => {
    await document.fonts.ready;
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    await new Promise((resolve) => setTimeout(resolve, quietMs));
  }, QUIET_MS);
  return { context, page };
}

async function measureRun(browser: Browser, scene: MotionBudgetSceneId): Promise<RunSample> {
  const { context, page } = await openScene(browser, scene, 'no-preference');
  try {
    return await page.evaluate(async ({ traceMs, togglesAt, flushMs, trigger }) => {
      const state = (window as ProbeWindow).__motionBudget;
      const button = document.querySelector<HTMLElement>(`[${trigger}]`);
      if (!button) throw new Error('the scene rendered no trigger');

      state.deltas = [];
      state.rafCallbacks = 0;
      state.animateCalls = 0;
      state.cssRuns = 0;
      state.recording = true;
      const traceStart = performance.now();
      let last: number | null = null;
      const tick = (timestamp: number) => {
        if (!state.recording) return;
        if (last !== null) state.deltas.push(timestamp - last);
        last = timestamp;
        state.rafCallbacks += 1;
        requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      for (const at of togglesAt) setTimeout(() => button.click(), at);

      await new Promise((resolve) => setTimeout(resolve, traceMs));
      state.recording = false;
      const traceEnd = performance.now();
      await new Promise((resolve) => setTimeout(resolve, flushMs));

      return {
        deltas: [...state.deltas],
        rafCallbacks: state.rafCallbacks,
        animationsCreated: state.animateCalls + state.cssRuns,
        longTasks: state.longTasks
          .filter((task) => task.start + task.duration >= traceStart && task.start <= traceEnd)
          .map((task) => task.duration),
      };
    }, { traceMs: TRACE_MS, togglesAt: TOGGLES_AT_MS, flushMs: OBSERVER_FLUSH_MS, trigger: MOTION_BUDGET_DOM.trigger });
  } finally {
    await context.close();
  }
}

async function reducedMotionControl(browser: Browser, scene: MotionBudgetSceneId): Promise<ControlSample> {
  const { context, page } = await openScene(browser, scene, 'reduce');
  try {
    return await page.evaluate(async ({ subject, trigger, settleMs }) => {
      const state = (window as ProbeWindow).__motionBudget;
      const geometry = (): Geometry => Object.fromEntries(
        [...document.querySelectorAll<HTMLElement>(`[${subject}]`)].map((node) => {
          const rect = node.getBoundingClientRect();
          return [node.getAttribute(subject) ?? '', [rect.left, rect.top, rect.width, rect.height]];
        }),
      );
      const live = () => document.getAnimations().filter((animation) => {
        const target = (animation.effect as KeyframeEffect | null)?.target;
        return target instanceof Element && target.closest(`[${subject}]`) !== null;
      }).length;

      state.animateCalls = 0;
      state.cssRuns = 0;
      state.recording = true;
      const before = geometry();
      document.querySelector<HTMLElement>(`[${trigger}]`)?.click();
      const first = await new Promise<{ geometry: Geometry; live: number }>((resolve) => {
        requestAnimationFrame(() => resolve({ geometry: geometry(), live: live() }));
      });
      await new Promise((resolve) => setTimeout(resolve, settleMs));
      state.recording = false;

      return {
        before,
        firstFrame: first.geometry,
        settled: geometry(),
        animateCalls: state.animateCalls,
        cssRuns: state.cssRuns,
        liveAtFirstFrame: first.live,
      };
    }, { subject: MOTION_BUDGET_DOM.subject, trigger: MOTION_BUDGET_DOM.trigger, settleMs: TRACE_MS });
  } finally {
    await context.close();
  }
}

function sameGeometry(left: Geometry, right: Geometry): boolean {
  const keys = Object.keys(left);
  if (keys.length !== Object.keys(right).length) return false;
  return keys.every((key) => right[key] !== undefined
    && left[key].every((value, index) => Math.abs(value - right[key][index]) <= GEOMETRY_TOLERANCE_PX));
}

const verdicts = new Map<MotionBudgetSceneId, SceneVerdict>();
const controls = new Map<MotionBudgetSceneId, SceneVerdict>();

test.describe('motion budget authority (no browser)', () => {
  test('core budget carries every threshold this spec asserts, keyed to the probe scenes', () => {
    const { frames, longTasks, nonVacuity, ratchets, kernelBundle } = budget;
    for (const value of [
      frames.measuredRuns, frames.warmupRuns, frames.droppedFactor, frames.p95Factor,
      frames.maxAbsoluteMs, longTasks.thresholdMs, longTasks.maxEntries,
      nonVacuity.minAnimations, nonVacuity.minRafCallbacks,
      ratchets.droppedFrames.seedRule.sigmas, ratchets.droppedFrames.seedRule.minSigma,
    ]) expect(Number.isFinite(value)).toBe(true);
    expect(frames.measuredRuns).toBeGreaterThan(0);
    expect(frames.warmupRuns).toBeGreaterThan(0);
    expect(frames.calibrationWindowMs).toHaveLength(2);
    expect(longTasks.maxEntries).toBe(0);
    expect(Object.keys(ratchets.droppedFrames.scenes).every((id) =>
      (MOTION_BUDGET_SCENES as readonly string[]).includes(id))).toBe(true);
    expect(kernelBundle.exports.length).toBeGreaterThan(0);
  });

  test('the seeded ceilings were measured under this spec\'s trace protocol', () => {
    const { seeded, seedContext } = budget.ratchets.droppedFrames;
    test.skip(!seeded, 'no ceilings to re-base');
    // A protocol edit re-bases every ceiling; it must come with a reset and a fresh seed.
    expect(seedContext?.protocol).toMatchObject(PROTOCOL);
  });
});

test.describe('motion budget - layout animation kernel (WO-INV-08)', () => {
  test.skip(
    !process.env.DS_MOTION_BUDGET,
    'unseeded browser arm: set DS_MOTION_BUDGET=1 to measure the kernel against the core budget',
  );

  for (const scene of MOTION_BUDGET_SCENES) {
    test(`${scene}: frames, long tasks and non-vacuity against the core budget`, async ({ browser }, testInfo) => {
      const runCount = budget.frames.warmupRuns + budget.frames.measuredRuns;
      test.setTimeout(runCount * 30_000);

      let warmup: RunSample | undefined;
      for (let index = 0; index < budget.frames.warmupRuns; index += 1) {
        warmup = await measureRun(browser, scene);
      }
      const runs: RunSample[] = [];
      for (let index = 0; index < budget.frames.measuredRuns; index += 1) {
        runs.push(await measureRun(browser, scene));
      }

      // The floors are per run: one run that animated must not carry six that no-opped.
      const verdict = verdictForScene({
        id: scene,
        warmup: warmup?.deltas ?? [],
        runs: runs.map((run) => run.deltas),
        longTasks: runs.flatMap((run) => run.longTasks),
        animationsCreated: Math.min(...runs.map((run) => run.animationsCreated)),
        rafCallbacks: Math.min(...runs.map((run) => run.rafCallbacks)),
      }, budget) as SceneVerdict;
      verdicts.set(scene, verdict);

      await testInfo.attach(`motion-budget-${scene}.json`, {
        body: JSON.stringify({ verdict, animationsPerRun: runs.map((run) => run.animationsCreated) }, null, 2),
        contentType: 'application/json',
      });
      expect(verdict.failures, JSON.stringify(verdict.measured)).toEqual([]);
    });

    test(`${scene}: reduced motion creates no animation and commits the final state on the next frame`, async ({ browser }) => {
      const sample = await reducedMotionControl(browser, scene);
      const verdict = verdictForReducedMotionControl({
        id: scene,
        animationsCreated: sample.animateCalls + sample.cssRuns + sample.liveAtFirstFrame,
        committedGeometryMatchesTarget: sameGeometry(sample.firstFrame, sample.settled),
      }) as SceneVerdict;
      const failures = sameGeometry(sample.before, sample.firstFrame)
        ? [...verdict.failures, { arm: 'reducedMotion.change', detail: 'the trigger did not change the layout' }]
        : verdict.failures;
      controls.set(scene, { ...verdict, ok: failures.length === 0, failures });
      expect(failures, JSON.stringify(sample)).toEqual([]);
    });
  }

  // MOTION_BUDGET_WRITE_SEED=1 pins each scene to min(ceiling, core's seedRule ceiling for this run),
  // and only when core's seedAdmission accepts every scene's budget verdict and reduced-motion control.
  test.afterAll(() => {
    if (!process.env.MOTION_BUDGET_WRITE_SEED) return;
    const admission = seedAdmission(MOTION_BUDGET_SCENES, verdicts, controls, budget);
    if (!admission.ok) {
      throw new Error(`MOTION_BUDGET_WRITE_SEED refused: ${admission.reasons.join('; ')}`);
    }

    const next = readBudget(BUDGET_PATH) as MotionBudget;
    const context = next.ratchets.droppedFrames.seedContext;
    if (context) context.protocol = { ...context.protocol, ...PROTOCOL };
    const scenes = next.ratchets.droppedFrames.scenes;
    for (const scene of MOTION_BUDGET_SCENES) {
      const perRun = verdicts.get(scene)?.measured.droppedPerRun ?? [];
      scenes[scene] = seedDroppedFrameCeiling(perRun, next, scenes[scene]).ceiling;
    }
    next.ratchets.droppedFrames.seeded = true;
    writeFileSync(BUDGET_PATH, `${JSON.stringify(next, null, 2)}\n`);
  });
});
