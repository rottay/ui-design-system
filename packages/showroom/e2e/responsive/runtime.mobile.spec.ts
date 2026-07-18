import { expect, test, type Page } from '@playwright/test';

import { recordCra15Measurement } from './cra-15-evidence';

// ---------------------------------------------------------------------------
// CRA-15 mobile-device evidence (audit MOT-01, step 3).
//
// Runs ONLY under the `mobile-chromium` Playwright project (Pixel 7 emulation:
// isMobile + hasTouch + devicePixelRatio 2.625) — see playwright.visual.config.ts
// project testMatch. Reduced motion is explicitly disabled so the static
// fallback is attributable to the coarse-pointer device alone, not a motion
// preference. On a real mobile profile the governed Particle and Spatial
// runtimes must never allocate a Canvas/WebGL context; the meaningful host
// content must survive.
// ---------------------------------------------------------------------------

const PARTICLE_CANVAS = '[data-particle-field-canvas="true"]';
const SPATIAL_CANVAS = '[data-spatial-experience-canvas]';
const SPATIAL_LIVE = '[data-spatial-mode^="live-"]';

async function installRafCounter(page: Page): Promise<void> {
  await page.addInitScript(() => {
    const state = { callbacks: 0 };
    Object.defineProperty(window, '__mobileRafCallbacks', {
      configurable: false,
      value: state,
      writable: false,
    });
    const nativeRequest = window.requestAnimationFrame.bind(window);
    window.requestAnimationFrame = (callback: FrameRequestCallback): number => nativeRequest((timestamp) => {
      callback(timestamp);
      state.callbacks += 1;
    });
  });
}

async function rafCallbacks(page: Page): Promise<number> {
  return page.evaluate(() => (
    window as typeof window & { __mobileRafCallbacks: { callbacks: number } }
  ).__mobileRafCallbacks.callbacks);
}

test.describe('Governed runtimes fall back statically on a mobile device', () => {
  // The installed @playwright/test type surface omits `reducedMotion` from
  // Fixtures (the option is honored at runtime); the cast keeps the option
  // without widening the whole fixtures bag.
  test.use({ reducedMotion: 'no-preference' } as unknown as Parameters<typeof test.use>[0]);

  test('Particle keeps a mobile viewport static with no canvas and no RAF', async ({ page }) => {
    await installRafCounter(page);
    await page.goto('/probe/particle-runtime', { waitUntil: 'networkidle' });

    recordCra15Measurement('mobile-meta', {
      device: 'Pixel 7',
      browserName: page.context().browser()?.browserType().name() ?? 'chromium',
      browserVersion: page.context().browser()?.version() ?? '',
      isMobile: true,
      hasTouch: true,
    });

    await expect(page.locator(PARTICLE_CANVAS)).toHaveCount(0);
    await expect(page.locator('[data-particle-field-runtime="static"]')).toHaveCount(2);
    await expect(page.getByText('Operational signal map')).toBeVisible();
    await expect(page.getByText('Candidate relationship field')).toBeVisible();
    expect(await rafCallbacks(page)).toBe(0);

    recordCra15Measurement('mobile-particle-fallback', {
      coarsePointer: true,
      canvasCount: 0,
      staticRuntimes: 2,
      rafCallbacks: 0,
    });
  });

  test('Spatial keeps a mobile viewport static with no live WebGL context', async ({ page }) => {
    await page.goto('/probe/spatial-runtime', { waitUntil: 'networkidle' });

    await expect(page.locator(SPATIAL_CANVAS)).toHaveCount(0);
    await expect(page.locator(SPATIAL_LIVE)).toHaveCount(0);
    await expect(page.getByText(/(?:Reduced )?operational (?:relationship )?map/i)).toBeVisible();

    recordCra15Measurement('mobile-spatial-fallback', {
      coarsePointer: true,
      canvasCount: 0,
      liveCount: 0,
    });
  });
});
