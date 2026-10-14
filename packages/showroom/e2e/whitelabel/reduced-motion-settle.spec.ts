import { expect, test } from '@playwright/test';

import type { DivergenceFixtureId } from '../../src/components/divergence-surface/fixtures';
import { expectHydrated } from '../support/hydration';

// INV-08 on the shipped CSS, nothing injected: under reduced motion the tenant type scale is final in the
// frame its style applies, nothing transitions on mount, and nothing shifts after first contentful paint.

const PROBE = '/probe/whitelabel-divergence';
const FIXTURES: Record<DivergenceFixtureId, string> = { sober: '0.96', editorial: '1.06' };
const VIEWPORT = { width: 1280, height: 900 };
const SETTLE_WINDOW_MS = 1_000;
// Elements that author no transition: the reduced default list must reach them with the floor still in force.
const UNAUTHORED = ['html', 'body', '[data-testid="divergence-root"]', '[data-testid="divergence-title"]'];

interface Frame {
  styled: boolean;
  html: string | null;
  scope: string | null;
  title: string | null;
}

interface Recorded {
  frames: Frame[];
  runs: string[];
  shifts: { startTime: number; value: number }[];
  fcp: number | null;
}

/** Runs before any page script: frames, transition starts, layout shifts and first contentful paint. */
function record(): void {
  const state: Recorded = { frames: [], runs: [], shifts: [], fcp: null };
  (window as Window & { __reducedMotionSettle?: Recorded }).__reducedMotionSettle = state;
  document.addEventListener(
    'transitionrun',
    (event) => {
      const target = event.target as Element;
      state.runs.push(`${target.tagName.toLowerCase()}${event.pseudoElement} ${event.propertyName}`);
    },
    true,
  );
  new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      state.shifts.push({ startTime: entry.startTime, value: (entry as PerformanceEntry & { value: number }).value });
    }
  }).observe({ type: 'layout-shift', buffered: true });
  new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) if (entry.name === 'first-contentful-paint') state.fcp = entry.startTime;
  }).observe({ type: 'paint', buffered: true });
  const size = (node: Element | null): string | null => (node ? getComputedStyle(node).fontSize : null);
  const tick = (): void => {
    state.frames.push({
      styled: document.querySelector('[data-testid="divergence-artifact-style"]') !== null,
      html: size(document.documentElement),
      scope: size(document.querySelector('[data-testid="divergence-root"]')),
      title: size(document.querySelector('[data-testid="divergence-title"] *')),
    });
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

test.use({ viewport: VIEWPORT, contextOptions: { reducedMotion: 'reduce' } });

test.describe('reduced motion settles the tenant type scale in one frame (INV-08)', () => {
  for (const [fixture, typeScale] of Object.entries(FIXTURES) as [DivergenceFixtureId, string][]) {
    test(`${fixture} (type scale ${typeScale})`, async ({ page }) => {
      await page.addInitScript(record);
      await page.goto(`${PROBE}?fixture=${fixture}&route=dashboard&ground=light`, { waitUntil: 'load' });
      await expectHydrated(page);
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(SETTLE_WINDOW_MS);

      const recorded = await page.evaluate((unauthored) => {
        const state = (window as Window & { __reducedMotionSettle?: Recorded }).__reducedMotionSettle!;
        const root = document.querySelector('[data-testid="divergence-root"]')!;
        return {
          ...state,
          typeScale: getComputedStyle(root).getPropertyValue('--ds-type-scale').trim(),
          reduced: matchMedia('(prefers-reduced-motion: reduce)').matches,
          defaults: unauthored.map((selector) => {
            const style = getComputedStyle(document.querySelector(selector)!);
            return `${selector} ${style.transitionProperty} ${style.transitionDuration}`;
          }),
        };
      }, UNAUTHORED);
      expect(recorded.reduced, 'the context must emulate prefers-reduced-motion: reduce').toBe(true);
      expect(recorded.typeScale, `${fixture} must mount its own type scale`).toBe(typeScale);

      expect(
        recorded.defaults,
        'an element that authors no transition gets the reduced default list, the 0.01ms floor still applied',
      ).toEqual(UNAUTHORED.map((selector) => `${selector} none 1e-05s`));

      const styled = recorded.frames.filter((frame) => frame.styled && frame.scope !== null && frame.title !== null);
      expect(styled.length, 'no frame sampled the mounted tenant style').toBeGreaterThan(0);
      const final = styled[styled.length - 1]!;
      for (const channel of ['html', 'scope', 'title'] as const) {
        expect(
          [...new Set(styled.map((frame) => frame[channel]))],
          `${channel} font-size must be final in the first frame the tenant style applies`,
        ).toEqual([final[channel]]);
      }

      expect(recorded.runs, 'no element may start a transition while the page mounts').toEqual([]);

      expect(recorded.fcp, 'first contentful paint was never reported').not.toBeNull();
      const shiftAfterFcp = recorded.shifts
        .filter((shift) => shift.startTime > recorded.fcp!)
        .reduce((sum, shift) => sum + shift.value, 0);
      expect(shiftAfterFcp, 'layout shift after first contentful paint').toBe(0);
    });
  }
});
